// Cloud Functions for Firebase - 第1世代 (v1) に対応
// 無料プラン（Spark Plan）に最適化された最終コード

const admin = require('firebase-admin');
const functions = require('firebase-functions/v1');
const logger = require('firebase-functions/logger');
const cors = require('cors')({ origin: true });

admin.initializeApp();

const db = admin.firestore();

// Firestore Collection Names
const COLLECTIONS = {
    REPORTS: 'reports',
    MOB_STATUS: 'mob_status',
    MOB_LOCATIONS: 'mob_locations',
};

// Functions Configuration
const DEFAULT_REGION = 'us-central1';
const FUNCTIONS_OPTIONS = {
    region: DEFAULT_REGION,
    runtime: 'nodejs20',
};

// Time Constants
const FIVE_MINUTES_IN_SECONDS = 5 * 60;
const MAX_REPORT_HISTORY = 5;

/**
* Mob IDからMOB_STATUSのドキュメントIDを決定します。
*/
const getStatusDocId = (mobId) => {
    if (typeof mobId !== 'string' || mobId.length < 2) return null;
    const rankCode = mobId[1];
    switch (rankCode) {
        case '2': return 's_latest'; // Sランク
        case '1': return 'a_latest'; // Aランク
        case '3': return 'f_latest'; // FATE
        default: return null;
    }
};

// =====================================================================
// 1. reportProcessorV1: 討伐報告の検証とステータス確定 (V1)
// =====================================================================

exports.reportProcessorV1 = functions.runWith(FUNCTIONS_OPTIONS)
    .firestore.document(`${COLLECTIONS.REPORTS}/{reportId}`)
    .onCreate(async (snap, context) => {

        const reportRef = snap.ref;
        const reportData = snap.data();

        if (reportData.is_processed === true) {
            logger.info(`SKIP: Mob ${reportData.mob_id || 'Unknown'} のレポートは既に処理済みです。`);
            return null;
        }

        const {
            mob_id: mobId,
            kill_time: reportTimeData,
            repop_seconds: repopSeconds,
            memo: reportMemo = ''
        } = reportData;

        if (!mobId || !reportTimeData || !repopSeconds) {
            logger.error('SKIP: 必須データが不足。');
            return null;
        }

        const reportTime = reportTimeData.toDate();
        const statusDocId = getStatusDocId(mobId);

        if (!statusDocId) {
            logger.error(`SKIP: 無効なMob ID (${mobId})。`);
            return null;
        }

        const rankStatusRef = db.collection(COLLECTIONS.MOB_STATUS).doc(statusDocId);
        const mobLocationRef = db.collection(COLLECTIONS.MOB_LOCATIONS).doc(mobId); 

        let transactionResult = false;
        
        try {
            // トランザクション：読み取り2回、書き込み2回
            transactionResult = await db.runTransaction(async (t) => {
                const rankStatusSnap = await t.get(rankStatusRef); 
                const rankStatusData = rankStatusSnap.data() || {};
                const existingMobData = rankStatusData[`${mobId}`] || {};

                const currentLKT = existingMobData.last_kill_time || null;
                const currentLKM = existingMobData.last_kill_memo || ''; 
                
                // --- 1. 妥当性検証 ---
                if (currentLKT) {
                    const lastLKTTime = currentLKT.toDate();
                    
                    if (reportTime <= lastLKTTime) {
                        t.update(reportRef, { is_processed: true, skip_reason: 'Time too old or duplicated' });
                        return false; 
                    }

                    const minAllowedTimeSec = lastLKTTime.getTime() / 1000 + repopSeconds - FIVE_MINUTES_IN_SECONDS;
                    const minAllowedTime = new Date(minAllowedTimeSec * 1000);

                    if (reportTime < minAllowedTime) {
                        t.update(reportRef, { is_processed: true, skip_reason: 'Time too early' });
                        return false; 
                    }
                }

                // --- 2. Mob Status の最終確定更新（確定履歴のスライド） ---
                let history = [];
                for (let i = 0; i < MAX_REPORT_HISTORY; i++) {
                    const reportKey = `report_${i}`;
                    if (existingMobData[reportKey]) {
                        history.push(existingMobData[reportKey]);
                    }
                }
                const newReportEntry = {
                    time: reportTimeData,
                    repop: repopSeconds,
                    memo: reportMemo.trim(),
                };
                history.unshift(newReportEntry);
                history = history.slice(0, MAX_REPORT_HISTORY);
                
                let mobUpdateFields = {};
                for (let i = 0; i < history.length; i++) {
                    mobUpdateFields[`report_${i}`] = history[i];
                }
                
                const finalStatusUpdate = {
                    prev_kill_time: currentLKT || null,
                    prev_kill_memo: currentLKM, 
                    last_kill_time: reportTimeData,
                    last_kill_memo: reportMemo.trim(),
                    is_reverted: false,
                    ...mobUpdateFields,
                };

                // (W1) Mob Status の更新
                t.set(rankStatusRef, { [`${mobId}`]: finalStatusUpdate }, { merge: true }); 

                // (W2) トリガーとなった報告のフラグを更新
                t.update(reportRef, { is_processed: true, is_averaged: false });
                
                return true; 
            });

        } catch (e) {
            logger.error(`FATAL_TRANSACTION_FAILURE: Mob ${mobId} のトランザクション失敗: ${e.message}`, e);
            return null;
        }
        
        logger.info(`STATUS_UPDATED_FINAL: Mob ${mobId} のステータスを更新しました (Mob Locations LKT同期なし)。`);
        return null;
    });

// =====================================================================
// 2. getServerTimeV1: サーバーの現在UTC時刻を返す (HttpsCallable V1)
// =====================================================================

exports.getServerTimeV1 = functions.runWith(FUNCTIONS_OPTIONS).https.onCall(async (data, context) => {
    const serverTimeMs = admin.firestore.Timestamp.now().toMillis();
    return { serverTimeMs: serverTimeMs };
});


// =====================================================================
// 3. revertStatusV1: データの巻き戻し処理 (onRequest V1 -> HttpsCallable 互換)
// =====================================================================

exports.revertStatusV1 = functions.runWith(FUNCTIONS_OPTIONS).https.onRequest((req, res) => {
    return cors(req, res, async () => {

        if (req.method !== 'POST') {
            return res.status(405).send('Method Not Allowed. Use POST.');
        }

        const callData = req.body.data;
        if (!callData) {
            return res.status(400).json({ data: { success: false, error: 'Request data missing.' } });
        }
        
        const { mob_id: mobId, target_report_index: targetIndex } = callData; 

        if (!mobId) {
            return res.status(200).json({ data: { success: false, error: 'Mob IDが指定されていません。' } });
        }
        
        if (targetIndex !== undefined && targetIndex !== 'prev') {
             return res.status(200).json({ data: { success: false, error: '現在、確定履歴への巻き戻しのみ対応しています。' } });
        }
        
        const statusDocId = getStatusDocId(mobId);
        if (!statusDocId) {
            return res.status(200).json({ data: { success: false, error: '無効なMob IDが指定されました。' } });
        }
        
        const rankStatusRef = db.collection(COLLECTIONS.MOB_STATUS).doc(statusDocId);
        const mobLocationRef = db.collection(COLLECTIONS.MOB_LOCATIONS).doc(mobId); 

        let success = false;
        let errorMessage = '';
        let newMessage = '';

        try {
            // トランザクション：読み取り1回、書き込み1回 
            await db.runTransaction(async (t) => {
                const rankStatusSnap = await t.get(rankStatusRef); 
                
                const rankStatusData = rankStatusSnap.data() || {};
                const existingMobData = rankStatusData[`${mobId}`] || {};

                // Mob Status の巻き戻し値を取得
                const newLKT = existingMobData.prev_kill_time;
                const newLKM = existingMobData.prev_kill_memo || '';
                
                if (!newLKT) {
                    throw new Error('確定履歴（prev_kill_time）が存在しないため、巻き戻しできません。');
                }
                
                // (W1) Mob Status の更新
                const finalStatusUpdate = {
                    last_kill_time: newLKT,
                    last_kill_memo: newLKM,
                    prev_kill_time: null, 
                    prev_kill_memo: null,
                    is_reverted: true, 
                };
                t.set(rankStatusRef, { [`${mobId}`]: finalStatusUpdate }, { merge: true });

                newMessage = `Mob ${mobId} のステータスを前回の記録に巻き戻しました (Mob Locations LKT更新なし)。`;
                success = true;

            });

        } catch (e) {
            logger.error(`REVERT_TRANSACTION_FAILURE: Mob ${mobId} の巻き戻し失敗: ${e.message}`, e);
            errorMessage = e.message;
        }

        if (success) {
            // HTTPS Callable の成功レスポンス形式
            return res.status(200).json({ data: { success: true, message: newMessage } });
        } else {
            // HTTPS Callable の失敗レスポンス形式
            return res.status(200).json({ data: { success: false, error: errorMessage || '予期せぬエラーが発生しました。' } });
        }
    });
});


// =====================================================================
// 4. mobCullUpdaterV1: Mob 出現地点の湧き潰し時刻記録 (onRequest V1 -> HttpsCallable 互換)
// =====================================================================

exports.mobCullUpdaterV1 = functions.runWith(FUNCTIONS_OPTIONS).https.onRequest((req, res) => {
    return cors(req, res, async () => {

        if (req.method !== 'POST') {
            return res.status(405).send('Method Not Allowed. Use POST.');
        }

        // HTTPS Callable 互換のため、リクエストボディを解析
        const callData = req.body.data;
        if (!callData) {
            return res.status(400).json({ data: { success: false, error: 'Request data missing.' } });
        }

        // mob_id, location_id, action ('CULL' または 'UNCULL'), report_time を受け取る
        const { mob_id: mobId, location_id: locationId, action, report_time: clientTime } = callData; 

        if (!mobId || !locationId || (action !== 'CULL' && action !== 'UNCULL') || !clientTime) {
            return res.status(200).json({ data: { success: false, error: '必須データ (Mob ID, Location ID, Action: CULL/UNCULL, Time) が不正です。' } });
        }
        
        const mobLocationRef = db.collection(COLLECTIONS.MOB_LOCATIONS).doc(mobId);
        
        // クライアントから受け取った時刻を Firestore Timestamp に変換
        const timestamp = new Date(clientTime);
        const firestoreTimestamp = admin.firestore.Timestamp.fromDate(timestamp);

        let success = false;
        let errorMessage = '';
        let message = '';

        try {
            const fieldToUpdate = action === 'CULL' ? `points.${locationId}.culled_at` : `points.${locationId}.uncull_at`;
            message = `Mob ${mobId} の地点 ${locationId} の湧き潰し${action === 'CULL' ? '時刻' : '解除時刻'}を記録しました。`;
            
            // 更新フィールドを動的に構築
            const updateFields = {
                [fieldToUpdate]: firestoreTimestamp
            };
            
            // ドキュメントを直接更新 (読み取り 0回, 書き込み 1回)
            await mobLocationRef.set(updateFields, { merge: true }); 

            logger.info(`CULL_STATUS_UPDATED: Mob ${mobId} の地点 ${locationId} の ${action} 時刻を記録。`);
            success = true;

        } catch (e) {
            logger.error(`CULL_FAILURE: Mob ${mobId} の地点時刻更新失敗: ${e.message}`, e);
            errorMessage = e.message;
        }

        if (success) {
            // HTTPS Callable の成功レスポンス形式
            return res.status(200).json({ data: { success: true, message: message } });
        } else {
            // HTTPS Callable の失敗レスポンス形式
            return res.status(200).json({ data: { success: false, error: errorMessage || '予期せぬエラーが発生しました。' } });
        }
    });
});
