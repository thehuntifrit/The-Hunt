// =====================================================================
// Cloud Functions for Firebase - 第2世代 (v2)
// [復元ロジック]: サーバーNTP時刻を基準とした遅延平均化処理を復元します。
// =====================================================================

const admin = require('firebase-admin');
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { onTaskDispatched } = require('firebase-functions/v2/tasks');
const logger = require('firebase-functions/logger');
const { CloudTasksClient } = require('@google-cloud/tasks').v2;
const { onRequest, onCall } = require('firebase-functions/v2/https');

admin.initializeApp();

const db = admin.firestore();
const tasksClient = new CloudTasksClient();

// Firestore Collection Names
const COLLECTIONS = {
    REPORTS: 'reports',
    MOB_STATUS: 'mob_status',
    MOB_LOCATIONS: 'mob_locations',
    MOB_STATUS_LOGS: 'mob_status_logs',
    MOB_LOCATIONS_LOGS: 'mob_locations_logs'
};

// Functions Configuration
const DEFAULT_REGION = 'asia-northeast1';
const QUEUE_NAME = 'report-averaging-queue'; // Cloud Tasksキュー名
const PROJECT_ID = process.env.GCLOUD_PROJECT;

// Time Constants (復元)
const FIVE_MINUTES_IN_SECONDS = 5 * 60;
const AVG_WINDOW_HALF_MS = 5 * 60 * 1000; // 5分 = 300,000ms
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Mob IDからMOB_STATUSのドキュメントIDを決定します。
 */
const getStatusDocId = (mobId) => {
    if (typeof mobId !== 'string' || mobId.length < 2) return null;
    const rankCode = mobId[1];
    switch (rankCode) {
        case '2': return 's_latest';
        case '1': return 'a_latest';
        case '3': return 'f_latest';
        default: return null;
    }
};

/**
 * Mob IDからランク文字を取得します。
 */
const getRankFromMobId = (mobId) => {
    if (typeof mobId !== 'string' || mobId.length < 2) return null;
    const rankCode = mobId[1];
    switch (rankCode) {
        case '2': return 'S';
        case '1': return 'A';
        case '3': return 'F';
        default: return null;
    }
}

// =====================================================================
// 1. reportProcessor: 討伐報告の検証と即時ステータス暫定更新、タスクキューイング
// =====================================================================

exports.reportProcessor = onDocumentCreated({
    document: `${COLLECTIONS.REPORTS}/{reportId}`,
    region: DEFAULT_REGION
}, async (event) => {

    const snap = event.data;
    if (!snap) return null;

    const reportRef = snap.ref;
    const reportData = snap.data();
    const createdTime = snap.createTime.toDate(); // サーバーNTP時刻

    // クライアントから送られてきたデータ
    const {
        mob_id: mobId,
        kill_time: reportTimeData, 
        reporter_uid: reporterUID,
        memo: reportMemo,
        repop_seconds: repopSeconds
    } = reportData;

    if (!mobId || !reportTimeData || !repopSeconds) {
        logger.error('SKIP: 必須データが不足。');
        return null;
    }

    const reportTime = reportTimeData.toDate(); 
    const rank = getRankFromMobId(mobId);
    const statusDocId = getStatusDocId(mobId);

    if (!rank || !statusDocId) {
        logger.error(`SKIP: 無効なMob ID (${mobId})。`);
        return null;
    }

    const rankStatusRef = db.collection(COLLECTIONS.MOB_STATUS).doc(statusDocId);
    let currentLKT = null;
    let currentPrevLKT = null;
    let transactionResult = false;

    try {
        transactionResult = await db.runTransaction(async (t) => {
            const rankStatusSnap = await t.get(rankStatusRef);
            const mobLocationsRef = db.collection(COLLECTIONS.MOB_LOCATIONS).doc(mobId); 
            const mobLocationsSnap = await t.get(mobLocationsRef);

            const rankStatusData = rankStatusSnap.data() || {};
            const existingMobData = rankStatusData[mobId] || {};

            currentLKT = existingMobData.last_kill_time || null;
            currentPrevLKT = existingMobData.prev_kill_time || null;

            // 検証ロジック (最小湧き時間保護)
            if (currentPrevLKT) {
                const prevLKTTime = currentPrevLKT.toDate();

                // 過去時刻巻き戻し保護（前々回討伐時刻以下ならスキップ）
                if (reportTime <= prevLKTTime) {
                    logger.warn(`SKIP: Mob ${mobId} の報告(${reportTime.toISOString()})は前々回討伐時刻以下です。`);
                    return false;
                }

                // 最小湧き時間保護（REPOP-5分よりも早すぎたらスキップ）
                const minAllowedTimeSec = prevLKTTime.getTime() / 1000 + repopSeconds - FIVE_MINUTES_IN_SECONDS;
                const minAllowedTime = new Date(minAllowedTimeSec * 1000);

                // クライアントからの報告時刻が最小湧き許容時刻よりも早すぎる場合はスキップ
                if (reportTime < minAllowedTime) {
                    logger.warn(`SKIP: Mob ${mobId} の報告はREPOP-5分よりも早すぎます。`);
                    return false;
                }
            }

            // MOB_STATUSの暫定更新（クライアント時刻を一旦表示する）
            const updateField = {
                prev_kill_time: currentLKT,
                prev_kill_memo: existingMobData.last_kill_memo || '',
                last_kill_time: reportTimeData, 
                last_kill_memo: reportMemo,
                current_reporter_uid: reporterUID,
                // is_averaged: false のまま
            };

            t.set(rankStatusRef, { [`${mobId}`]: updateField }, { merge: true });
            
            // MOB_LOCATIONSの新規作成
            if (!mobLocationsSnap.exists) {
                t.set(mobLocationsRef, { mob_id: mobId, points: {} });
                logger.info(`WRITE_MOB_LOCATIONS: Mob ${mobId} のロケーションドキュメントを新規作成。`);
            }

            // 報告ドキュメントに is_averaged: false をセット
            t.update(reportRef, { is_averaged: false });


            // 過去ログの作成
            if (rankStatusSnap.exists && existingMobData && Object.keys(existingMobData).length > 0) {
                t.set(db.collection(COLLECTIONS.MOB_STATUS_LOGS).doc(mobId), existingMobData, { merge: false });
            } else {
                t.set(db.collection(COLLECTIONS.MOB_STATUS_LOGS).doc(mobId), { last_kill_time: reportTimeData }, { merge: true });
            }


            return true;
        });
    } catch (e) {
        logger.error(`FATAL_TRANSACTION_FAILURE: Mob ${mobId} のトランザクション失敗: ${e.message}`, e);
        return null;
    }

    if (transactionResult !== true) {
        logger.warn(`SKIP_REPORT_COMPLETED: Mob ${mobId} の報告は無効と判断され、スキップ。`);
        return null;
    }

    logger.info(`STATUS_UPDATED_TENTATIVE: Mob ${mobId} のステータスを暫定更新。`);

    // =============================================================
    // ★ サーバーNTP時刻を基準に、5分後に平均化タスクをキューイング（復元）
    // =============================================================

    const location = DEFAULT_REGION; 
    const queuePath = tasksClient.queuePath(PROJECT_ID, location, QUEUE_NAME);

    // サーバー時刻（createdTime）から5分後をタスク実行時間とする
    const intendedSeconds = Math.floor(createdTime.getTime() / 1000) + Math.floor(AVG_WINDOW_HALF_MS / 1000);
    const scheduleTime = new Date(intendedSeconds * 1000);

    const payload = {
        mobId: mobId,
        // 平均化ウィンドウの中心時刻として、サーバーの正確なNTP時刻 + 5分を送る
        centerTime: scheduleTime.toISOString(), 
    };
    
    const task = {
        httpRequest: {
            httpMethod: 'POST',
            url: `https://${location}-${PROJECT_ID}.cloudfunctions.net/averageStatusCalculator`, 
            body: Buffer.from(JSON.stringify(payload)).toString('base64'),
            headers: {
                'Content-Type': 'application/json',
            },
            // サービスアカウント認証を有効にするための設定を省略（デプロイ環境で自動設定）
        },
        scheduleTime: {
            seconds: intendedSeconds
        },
    };

    try {
        await tasksClient.createTask({ parent: queuePath, task });
        logger.info(`TASK_QUEUED: Mob ${mobId} の平均化タスクを ${scheduleTime.toISOString()} にキューイング。`);
    } catch (e) {
        logger.error(`TASK_QUEUE_FAILURE: Mob ${mobId} のタスクキューイング失敗: ${e.message}`, e);
    }

    return null;
});

// =====================================================================
// 2. averageStatusCalculator: 遅延実行される平均化処理（復元）
// =====================================================================

exports.averageStatusCalculator = onTaskDispatched({
    queue: QUEUE_NAME,
    region: DEFAULT_REGION
}, async (req) => {

    const { mobId, centerTime: centerTimeString } = req.data;
    if (!mobId || !centerTimeString) {
        logger.error('FATAL: タスクペイロードにMob IDまたは中心時刻が不足しています。');
        return;
    }

    const centerTime = new Date(centerTimeString); // サーバーNTP時刻 + 5分

    logger.info(`AVG_START: Mob ${mobId} の平均化処理開始。中心時刻: ${centerTime.toISOString()}`);

    // 平均化ウィンドウ（中心時刻の前後5分間）を設定
    const startTime = admin.firestore.Timestamp.fromMillis(centerTime.getTime() - AVG_WINDOW_HALF_MS);
    const endTime = admin.firestore.Timestamp.fromMillis(centerTime.getTime() + AVG_WINDOW_HALF_MS);

    // 該当 Mob の、まだ平均化されていない報告をウィンドウ内の kill_time でクエリ
    const reportsQuery = db.collection(COLLECTIONS.REPORTS)
        .where('mob_id', '==', mobId)
        .where('is_averaged', '==', false)
        .where('kill_time', '>=', startTime)
        .where('kill_time', '<', endTime)
        .orderBy('kill_time', 'asc'); // 古い順にソートして安定性を確保

    let transactionResult = false;
    let finalAvgTimeMs = 0;
    let finalReporterUID = null;
    let finalMemo = '';
    let reportsToUpdate = [];

    try {
        transactionResult = await db.runTransaction(async (t) => {
            const reportsSnap = await t.get(reportsQuery);
            const rankStatusRef = db.collection(COLLECTIONS.MOB_STATUS).doc(getStatusDocId(mobId));
            
            if (reportsSnap.empty) {
                logger.warn(`AVG_SKIP: Mob ${mobId} の平均化ウィンドウ内に新しい報告なし。`);
                return false;
            }

            // 1. 平均時刻の計算
            let totalTime = 0;
            reportsSnap.forEach(doc => {
                totalTime += doc.data().kill_time.toMillis();
                reportsToUpdate.push(doc.ref);
                
                // 最後に報告したユーザーとメモを採用（厳密な平均ではないが、代表値として）
                finalReporterUID = doc.data().reporter_uid;
                finalMemo = doc.data().memo;
            });

            finalAvgTimeMs = totalTime / reportsSnap.size;
            const finalAvgTimestamp = admin.firestore.Timestamp.fromMillis(Math.round(finalAvgTimeMs));

            // 2. Mob Status の最終確定更新
            const rankStatusData = (await t.get(rankStatusRef)).data() || {};
            const existingMobData = rankStatusData[mobId] || {};
            
            const updateField = {
                prev_kill_time: existingMobData.last_kill_time, // 暫定時刻をprev_kill_timeに移動
                prev_kill_memo: existingMobData.last_kill_memo || '',
                last_kill_time: finalAvgTimestamp, 
                last_kill_memo: finalMemo,
                current_reporter_uid: finalReporterUID,
            };

            t.set(rankStatusRef, { [`${mobId}`]: updateField }, { merge: true });

            // 3. 処理済み報告のフラグ更新
            reportsToUpdate.forEach(ref => {
                t.update(ref, { is_averaged: true, is_processed: true });
            });

            return true;
        });

    } catch (e) {
        logger.error(`FATAL_AVG_FAILURE: Mob ${mobId} の平均化トランザクション失敗: ${e.message}`, e);
        // Cloud Taskはリトライしないよう、ここで処理を終了
        return; 
    }

    if (transactionResult === true) {
        logger.info(`AVG_SUCCESS: Mob ${mobId} のステータスを最終確定時刻 ${new Date(finalAvgTimeMs).toISOString()} で更新。報告数: ${reportsToUpdate.length}`);
    } else {
        logger.warn(`AVG_INFO: Mob ${mobId} の最終確定処理はスキップされました。`);
    }
});


// =====================================================================
// 3. crushStatusUpdater: 湧き潰し座標の状態を更新
// =====================================================================
// crushStatusUpdaterは変更なし

exports.crushStatusUpdater = onCall({ region: DEFAULT_REGION }, async (request) => {

    if (!request.auth) {
        throw new HttpsError('unauthenticated', '認証が必要です。');
    }

    const data = request.data;
    const { mob_id: mobId, point_id: pointId, type } = data;
    const nowTimestamp = admin.firestore.Timestamp.now();

    if (!mobId || !pointId || (type !== 'add' && type !== 'remove')) {
        throw new HttpsError('invalid-argument', '必須データ不足またはタイプが無効。');
    }

    const mobLocationsRef = db.collection(COLLECTIONS.MOB_LOCATIONS).doc(mobId);

    try {
        await db.runTransaction(async (t) => {
            const mobLocationsSnap = await t.get(mobLocationsRef);

            if (!mobLocationsSnap.exists) {
                // ドキュメントが存在しない場合、新規作成
                t.set(mobLocationsRef, {
                    mob_id: mobId,
                    points: {
                        [pointId]: { [type === 'add' ? 'crushed_at' : 'uncrushed_at']: nowTimestamp }
                    }
                });
            } else {
                // 既存ドキュメントの更新
                const updateKey = `points.${pointId}.${(type === 'add' ? 'crushed_at' : 'uncrushed_at')}`;
                t.update(mobLocationsRef, { [updateKey]: nowTimestamp });
            }
        });

        logger.info(`CRUSH_SUCCESS: Point ${pointId} crush status updated to ${type} for Mob ${mobId}.`);
    } catch (e) {
        logger.error(`CRUSH_FAILURE: Mob ${mobId} の湧き潰し更新失敗: ${e.message}`, e);
        throw new HttpsError('internal', `湧き潰しステータス更新中にエラー。: ${e.message}`);
    }

    return { success: true, message: `Point ${pointId} crush status updated to ${type}.` };
});

// =====================================================================
// 4. reportCleaner: reportsコレクションから古いデータを削除
// =====================================================================
/** 
 * 4.3 getServerTime: サーバーの現在UTC時刻を返す 
 */
exports.getServerTime = onCall({ region: DEFAULT_REGION }, async (data, context) => {
  const now = admin.firestore.Timestamp.now().toDate();
  return { utc_now: now.toISOString() };
});
exports.reportCleaner = onRequest({ region: DEFAULT_REGION }, async (req, res) => {
    
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    // [注意] NTP同期されたサーバー時刻を使用
    const now = Date.now(); 
    const batch = db.batch();
    let deletedCount = 0;

    // 1. Aランク Mob のクリーンアップ: 2日前の報告を削除
    const aRankCutoff = new Date(now - (2 * ONE_DAY_MS)); 
    const aRankSnaps = await db.collection(COLLECTIONS.REPORTS)
        .where('mob_id', '>=', 't1')
        .where('mob_id', '<', 't2')
        .where('kill_time', '<', aRankCutoff)
        // is_averaged が true (処理済み) のもののみを対象にすることで、未処理の報告が消えることを防ぐ
        .where('is_averaged', '==', true) 
        .limit(500)
        .get();

    aRankSnaps.forEach(doc => {
        batch.delete(doc.ref);
        deletedCount++;
    });

    // 2. S/Fランク Mob のクリーンアップ: 7日前の報告を削除
    const sfRankCutoff = new Date(now - (7 * ONE_DAY_MS));
    
    // Sランク (t2xxx)
    const sRankSnaps = await db.collection(COLLECTIONS.REPORTS)
        .where('mob_id', '>=', 't2')
        .where('mob_id', '<', 't3')
        .where('kill_time', '<', sfRankCutoff)
        .where('is_averaged', '==', true) 
        .limit(500)
        .get();
    
    sRankSnaps.forEach(doc => {
        batch.delete(doc.ref);
        deletedCount++;
    });

    // Fランク (t3xxx)
    const fRankSnaps = await db.collection(COLLECTIONS.REPORTS)
        .where('mob_id', '>=', 't3')
        .where('mob_id', '<', 't4')
        .where('kill_time', '<', sfRankCutoff)
        .where('is_averaged', '==', true) 
        .limit(500)
        .get();

    fRankSnaps.forEach(doc => {
        batch.delete(doc.ref);
        deletedCount++;
    });

    if (deletedCount > 0) {
        await batch.commit();
        logger.info(`CLEANUP_SUCCESS: ${deletedCount} 件の古い報告を削除。`);
    } else {
        logger.info('CLEANUP_INFO: 削除対象なし。');
    }
    
    return res.status(200).send(`Cleanup finished. Deleted ${deletedCount} reports.`);
});
