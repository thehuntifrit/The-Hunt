// WARN: このファイルは index.html 内の <script type="module"> ブロックでグローバルに公開された
// Firebase SDK の関数群に依存しています。

// Firebase & GAS 設定 (グローバル変数としてindex.htmlで公開されていることを前提とする)
const appId = window.__app_id;
const firebaseConfig = window.__firebase_config ? JSON.parse(window.__firebase_config) : null;
const initialAuthToken = window.__initial_auth_token;

const MOB_DATA_URL = './mob_data.json'; 

// Firestore の設定 (グローバル関数を利用)
let app, db, auth;

// --- グローバル変数 ---
let baseMobData = [];
let globalMobData = []; 
let currentFilter = {
    rank: 'ALL', 
    // ALLは「全て表示」を意味するフラグ。拡張パック名でフィルタリングを行う
    areaSets: {
        'S': new Set(['ALL']),
        'A': new Set(['ALL']),
        'F': new Set(['ALL'])
    }
};
let currentMobNo = null;
let userId = null; 
let globalHuntRecords = {}; 
let globalCullReports = {}; 

// --- 拡張パック名定義 (フィルタUIで使用) ---
const EXPANSION_MAP = {
    '新生': [11000, 20000],
    '蒼天': [20000, 30000],
    '紅蓮': [30000, 40000],
    '漆黒': [40000, 50000],
    '暁月': [50000, 60000],
    '黄金': [60000, 70000], // 仮に6.0-7.0を黄金として定義
    'FATE/他': [70000, 99999] 
};
const ALL_EXPANSION_NAMES = ['新生', '蒼天', '紅蓮', '漆黒', '暁月', '黄金', 'FATE/他'];

// --- DOMエレメント ---
const DOMElements = {
    fixedHeader: document.getElementById('fixed-header-content'),
    contentSpacer: document.getElementById('content-spacer'),
    errorMessageContainer: document.getElementById('error-message-container'),
    uuidDisplay: document.getElementById('uuid-display'),
    rankTabs: document.getElementById('rank-tabs'),
    areaFilterWrapper: document.getElementById('area-filter-wrapper'),
    areaFilterButtonsContainer: document.getElementById('area-filter-buttons'),
    reportModal: document.getElementById('report-modal'),
    modalContent: document.getElementById('modal-content'),
    modalMobName: document.getElementById('modal-mob-name'),
    reportDatetimeInput: document.getElementById('report-datetime'),
    reportMemoInput: document.getElementById('report-memo'),
    column1: document.getElementById('column-1'),
    column2: document.getElementById('column-2'),
    column3: document.getElementById('column-3'),
    cancelReportBtn: document.getElementById('cancel-report'),
    submitReportBtn: document.getElementById('submit-report'),
};

// --- Firestore Collection Paths (Public Data) ---
const HUNT_RECORDS_PATH = `artifacts/${appId}/public/data/hunt_records`;
const CULL_REPORTS_PATH = `artifacts/${appId}/public/data/cull_reports`;

// --- ヘルパー関数 ---

/**
 * 拡張パック名を取得 (No.に基づく)
 * @param {number} mobNo - モブのNo。
 * @returns {string} 拡張パック名
 */
function getExpansionName(mobNo) {
    const no = parseInt(mobNo);
    for (const [name, [min, max]] of Object.entries(EXPANSION_MAP)) {
        if (no >= min && no < max) {
            return name;
        }
    }
    return 'その他';
}

/**
 * Firestoreドキュメントを結合し、グローバルモブデータリストを更新する。
 */
function updateGlobalMobData(records, cullReports) {
    globalHuntRecords = records;
    globalCullReports = cullReports;
    
    globalMobData = baseMobData.map(mob => {
        const record = records[mob['No.']] || {};
        return {
            ...mob,
            // FirestoreのTimestampオブジェクトをミリ秒に変換
            LastKillTime: record.lastKillTime ? record.lastKillTime.toDate().getTime() : 0, 
            ReporterId: record.reporterId || null,
            Memo: record.memo || ''
        };
    });

    renderMobList();
}

/**
 * エラーメッセージを表示する。
 */
function showErrorMessage(message) {
    const errorDiv = DOMElements.errorMessageContainer;
    errorDiv.textContent = `エラー: ${message}`;
    errorDiv.classList.remove('hidden');
    console.error(message);
    setTimeout(() => {
        errorDiv.classList.add('hidden');
    }, 5000);
}

/**
 * 時刻を HH:MM:SS 形式にフォーマットする。
 */
function formatTime(ms) {
    const date = new Date(ms);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

/**
 * ミリ秒を時間、分、秒に変換する。
 */
function msToTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    return {
        hours: hours,
        minutes: minutes % 60,
        seconds: seconds % 60,
    };
}

/**
 * 復活までの残り時間と進捗率を計算する。
 */
function getRepopTime(lastKillTime, repopMin, repopMax) {
    if (lastKillTime === 0) {
        return {
            progress: 100,
            remainingTimeText: '出現可能',
            isMinPassed: true,
            isMaxPassed: true,
        };
    }

    const now = Date.now();
    const elapsedTimeSeconds = Math.floor((now - lastKillTime) / 1000);

    let progress = Math.min(100, (elapsedTimeSeconds / repopMax) * 100);

    const isMinPassed = elapsedTimeSeconds >= repopMin;
    const isMaxPassed = elapsedTimeSeconds >= repopMax;

    let remainingTimeText;

    if (isMaxPassed) {
        remainingTimeText = '出現可能 (MAX超過)';
        progress = 100;
    } else if (isMinPassed) {
        remainingTimeText = '出現抽選中';
    } else {
        const remainingSeconds = repopMin - elapsedTimeSeconds;
        const time = msToTime(remainingSeconds * 1000);
        remainingTimeText = `最短リポップまで: ${time.hours}時間${String(time.minutes).padStart(2, '0')}分`;
    }

    return {
        progress,
        remainingTimeText,
        isMinPassed,
        isMaxPassed,
    };
}

/**
 * モブリストをソートする（残り時間が短い順、またはNo.順）
 */
function sortMobList(mobList) {
    return mobList.sort((a, b) => {
        const timeA = getRepopTime(a.LastKillTime, a['REPOP(s)'], a['MAX(s)']);
        const timeB = getRepopTime(b.LastKillTime, b['REPOP(s)'], b['MAX(s)']);

        // MAX超過モブは常に上
        if (timeA.isMaxPassed && !timeB.isMaxPassed) return -1;
        if (!timeA.isMaxPassed && timeB.isMaxPassed) return 1;

        // MIN未満のモブは残り時間が短い順
        if (!timeA.isMinPassed && !timeB.isMinPassed) {
            return (a['REPOP(s)'] - (Date.now() - a.LastKillTime) / 1000) - 
                   (b['REPOP(s)'] - (Date.now() - b.LastKillTime) / 1000);
        }

        // その他（MIN-MAX間、または両方MAX超過）はNo.順
        return a['No.'] - b['No.'];
    });
}

/**
 * 現在のフィルターに基づいてモブを表示すべきか判断する。
 */
function shouldDisplayMob(mob) {
    const currentRank = currentFilter.rank;
    const mobRank = mob.Rank;
    const mobExpansion = getExpansionName(mob['No.']);

    // 1. ランクフィルタ
    if (currentRank !== 'ALL' && mobRank !== currentRank) {
        return false;
    }
    
    // フィルタ対象のランクを決定 (ALLの場合、実際のモブのランクを使用)
    const targetRank = currentRank === 'ALL' ? mobRank : currentRank;
    
    // 2. エリアフィルタ
    const areaSet = currentFilter.areaSets[targetRank];
    
    if (!areaSet) return false; // 予期せぬランク

    // 'ALL' が含まれていれば、そのランクの全てのエリアを表示
    if (areaSet.has('ALL')) {
        return true;
    }

    // エリア名または拡張パック名が含まれているか
    if (areaSet.has(mob.Area) || areaSet.has(mobExpansion)) {
        return true;
    }

    return false;
}

// --- UI描画関数 ---

/**
 * 湧き潰し状態に応じてスポーンポイントのUIを更新する。
 */
function updateSpawnPointUI(pointElement, mobNo, spawnPoint) {
    if (!userId) return; // 認証前は何も表示しない

    const mobSpawnId = `${mobNo}_${spawnPoint.id}`;
    const report = globalCullReports[mobSpawnId];
    
    pointElement.classList.remove('culled-point', 'bg-green-600', 'border-green-400', 'bg-gray-700', 'border-gray-500', 'bg-blue-500', 'hover:bg-blue-600', 'border-4', 'border-2');
    pointElement.textContent = '';
    pointElement.title = '';

    if (report && report.cullers && report.cullers.length > 0) {
        // 湧き潰し報告がある場合
        pointElement.classList.add('culled-point', 'text-xs', 'font-bold');
        const cullCount = report.cullers.length;
        const isSelfReported = report.cullers.includes(userId);
        const latestReporterId = report.cullers[cullCount - 1]; 

        pointElement.textContent = cullCount > 1 ? `x${cullCount}` : '';
        
        if (isSelfReported) {
            pointElement.classList.add('bg-green-600', 'border-4', 'border-green-400');
            pointElement.title = `自分が報告済み (${cullCount}人が同意)`;
        } else {
            pointElement.classList.add('bg-gray-700', 'border-2', 'border-gray-500');
            pointElement.title = `他者が報告済み (${cullCount}人, 最終報告者: ${latestReporterId.substring(0, 8)}...)`;
        }
    } else {
        // 報告がない場合
        pointElement.classList.add('bg-blue-500', 'hover:bg-blue-600');
        pointElement.title = '未報告 (クリックで湧き潰し報告)';
    }
}

/**
 * 湧き潰し状態をFirestoreに書き込む (トグル処理)
 */
async function toggleCullPoint(mobNo, spawnPoint, pointElement) {
    if (!db || !userId) {
        showErrorMessage('データベースまたはユーザー認証が未完了です。');
        return;
    }

    // 湧き潰し報告中はUIを無効化
    pointElement.disabled = true;

    const mobSpawnId = `${mobNo}_${spawnPoint.id}`;
    const cullReportRef = window.doc(db, CULL_REPORTS_PATH, mobSpawnId);
    
    try {
        await window.runTransaction(db, async (transaction) => {
            const reportDoc = await transaction.get(cullReportRef);
            
            let newCullers = [];
            
            if (reportDoc.exists()) {
                const data = reportDoc.data();
                newCullers = data.cullers || [];
                
                const userIndex = newCullers.indexOf(userId);

                if (userIndex > -1) {
                    newCullers.splice(userIndex, 1);
                } else {
                    newCullers.push(userId);
                }
            } else {
                newCullers.push(userId);
            }

            if (newCullers.length === 0) {
                // ドキュメントを削除
                transaction.delete(cullReportRef);
            } else {
                // latestCullTimeを更新
                transaction.set(cullReportRef, {
                    mobNo: String(mobNo),
                    spawnPointId: spawnPoint.id,
                    cullers: newCullers,
                    latestCullTime: window.serverTimestamp() 
                }, { merge: true });
            }
        });

    } catch (error) {
        showErrorMessage('湧き潰し報告の送信中にエラーが発生しました。');
        console.error('湧き潰し報告エラー:', error);
    } finally {
        pointElement.disabled = false; // UIを再度有効化
    }
}


/**
 * マップ画像を生成し、スポーンポイントを描画する。
 */
function createMapOverlay(mob) {
    const mapContainer = document.createElement('div');
    mapContainer.className = 'map-content mt-2 relative w-full overflow-hidden rounded-lg shadow-inner';
    
    const mapImage = document.createElement('img');
    mapImage.src = `./maps/${mob.Map}`;
    mapImage.alt = `${mob.Area} マップ`;
    mapImage.className = 'w-full h-auto rounded-lg';
    mapContainer.appendChild(mapImage);

    const overlay = document.createElement('div');
    overlay.className = 'map-overlay absolute inset-0';

    if (mob.SpawnPoints) {
        mob.SpawnPoints.forEach(point => {
            const ranks = point.mob_ranks || [];
            if (!ranks.includes(mob.Rank)) return; 

            const pointElement = document.createElement('div');
            pointElement.className = 'spawn-point absolute w-4 h-4 rounded-full flex items-center justify-center text-white font-bold transition duration-200 text-[10px]';
            
            pointElement.style.left = `${point.x}%`;
            pointElement.style.top = `${point.y}%`;
            pointElement.style.transform = 'translate(-50%, -50%)'; 

            updateSpawnPointUI(pointElement, mob['No.'], point);

            pointElement.onclick = (e) => {
                e.stopPropagation();
                toggleCullPoint(mob['No.'], point, pointElement);
            };

            overlay.appendChild(pointElement);
        });
    }

    mapContainer.appendChild(overlay);
    return mapContainer;
}

/**
 * モブリストをレンダリングする (マルチカラム対応)。
 */
function renderMobList() {
    [DOMElements.column1, DOMElements.column2, DOMElements.column3].forEach(col => col.innerHTML = '');
    
    const sortedMobs = sortMobList(globalMobData); 
    const columns = [DOMElements.column1, DOMElements.column2, DOMElements.column3].filter(col => !col.classList.contains('hidden'));

    let columnIndex = 0;

    sortedMobs.forEach(mob => {
        if (!shouldDisplayMob(mob) || columns.length === 0) return;

        const mobNo = mob['No.'];
        const card = document.createElement('div');
        const rankClass = `rank-${mob.Rank}`;

        // リポップ時間計算
        const repopInfo = getRepopTime(mob.LastKillTime, mob['REPOP(s)'], mob['MAX(s)']);
        const lastKillDate = mob.LastKillTime > 0 ? new Date(mob.LastKillTime) : null;
        const lastKillTimeText = lastKillDate ? 
            `${lastKillDate.toLocaleDateString('ja-JP')} ${formatTime(mob.LastKillTime)} (JST)` : 
            '---';
        
        let progressColor = 'bg-blue-500';
        if (repopInfo.isMaxPassed) {
            progressColor = 'bg-red-600';
        } else if (repopInfo.isMinPassed) {
            progressColor = 'bg-yellow-500';
        }
        
        const remainingTimeColor = repopInfo.isMaxPassed ? 'text-red-400' : repopInfo.isMinPassed ? 'text-yellow-400' : 'text-blue-300';
        const reporterIdShort = mob.ReporterId ? mob.ReporterId.substring(0, 8) + '...' : '---';


        card.className = `mob-card p-4 rounded-xl shadow-lg mb-4 ${rankClass}`;
        card.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <div>
                    <h3 class="text-xl font-bold text-gray-100">${mob.Name} (${mob.Rank}級)</h3>
                    <p class="text-sm text-gray-400">拡張: ${getExpansionName(mobNo)} / エリア: ${mob.Area}</p>
                </div>
                <span class="text-sm font-semibold px-3 py-1 rounded-full bg-blue-500 text-white shadow">${mob.Area}</span>
            </div>
            
            ${mob.Condition ? `<p class="mb-3 text-sm text-yellow-300 font-medium">条件: ${mob.Condition}</p>` : ''}

            <!-- リポップタイマー -->
            <div class="mb-4 p-3 bg-gray-700 rounded-lg">
                <p class="text-xs font-medium mb-1 text-gray-300">最終討伐: ${lastKillTimeText}</p>
                <p class="text-lg font-extrabold mb-2 ${remainingTimeColor}">${repopInfo.remainingTimeText}</p>
                <div class="w-full bg-gray-500 rounded-full progress-bar-container">
                    <div class="${progressColor} progress-bar" style="width: ${repopInfo.progress}%;" title="${repopInfo.progress.toFixed(1)}%"></div>
                </div>
            </div>

            <!-- 討伐報告者/メモ -->
            <div class="mb-4 text-sm text-gray-300 border-t border-gray-700 pt-3">
                <p>最終報告者: ${reporterIdShort}</p>
                ${mob.Memo ? `<p class="mt-1">メモ: <span class="text-yellow-200">${mob.Memo}</span></p>` : ''}
            </div>
            
            <div class="flex justify-end items-center space-x-2">
                <button onclick="window.openReportModal('${mobNo}', '${mob.Name}')" 
                        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-150 font-semibold shadow-md text-sm">
                    報告/修正
                </button>
            </div>
        `;

        const panelContent = document.createElement('div');
        panelContent.className = 'mt-4 border-t border-gray-700 pt-4';

        // マップ表示ロジック
        if (mob.Map && mob.SpawnPoints && mob.SpawnPoints.length > 0) {
            const mapOverlay = createMapOverlay(mob); 
            panelContent.appendChild(mapOverlay);
        }

        card.appendChild(panelContent);

        // モブカードをカラムに分散して挿入
        columns[columnIndex].appendChild(card);
        columnIndex = (columnIndex + 1) % columns.length;
    });
}

/**
 * 固定ヘッダーの高さに基づいてスペーサーを設定する
 */
function updateContentSpacerHeight() {
    const header = DOMElements.fixedHeader;
    const spacer = DOMElements.contentSpacer;
    if (header && spacer) {
        // ヘッダーの計算された高さを取得し、スペーサーに適用
        const height = header.offsetHeight;
        spacer.style.height = `${height}px`;
        
        // エリアフィルタの最大高さを更新 (アニメーション用)
        const areaFilterContainer = document.getElementById('area-filter-container');
        if (areaFilterContainer) {
            DOMElements.areaFilterWrapper.style.maxHeight = `${areaFilterContainer.offsetHeight + 16}px`; // 16pxはパディングやマージンを考慮
        }
    }
}

/**
 * エリアフィルタの選択肢を生成・更新する (拡張パック名フィルタ)
 */
function updateAreaFilterUI() {
    const container = DOMElements.areaFilterButtonsContainer;
    container.innerHTML = '';
    
    const currentRank = currentFilter.rank;
    const currentAreaSet = currentFilter.areaSets[currentRank === 'ALL' ? 'S' : currentRank] || new Set(['ALL']); // ALL選択時はSランクのセットを使用

    // ALLボタン
    const allBtn = createAreaFilterButton('ALL', currentAreaSet, (e) => handleAreaFilterToggle('ALL', currentRank));
    container.appendChild(allBtn);

    // 拡張パック名ボタンの生成
    ALL_EXPANSION_NAMES.forEach(expansionName => {
        const btn = createAreaFilterButton(expansionName, currentAreaSet, (e) => handleAreaFilterToggle(expansionName, currentRank));
        container.appendChild(btn);
    });
    
    // UI更新後にスペーサーの高さを再計算 (フィルタUIの開閉にも使用)
    updateContentSpacerHeight(); 
}

/**
 * エリアフィルタボタンを生成するヘルパー関数
 */
function createAreaFilterButton(areaName, currentAreaSet, onClickHandler) {
    const isActive = currentAreaSet.has(areaName) && !currentAreaSet.has('ALL');
    const isAllActive = currentAreaSet.has('ALL') && areaName === 'ALL';
    
    const btn = document.createElement('button');
    btn.textContent = areaName;
    btn.dataset.area = areaName;
    
    let baseClass = 'bg-gray-600 hover:bg-gray-500';
    let activeClass = 'bg-blue-600';
    if (areaName !== 'ALL') {
        // 拡張パック名には異なる色を適用 (例: 緑/黄色)
        baseClass = 'bg-gray-700 hover:bg-gray-600';
        activeClass = 'bg-yellow-600';
    }

    btn.className = `area-filter-btn text-white py-1 px-3 rounded-md text-sm transition font-semibold 
        ${isAllActive || isActive ? activeClass : baseClass}`;
    btn.onclick = onClickHandler;
    return btn;
}

/**
 * エリアフィルターのトグル処理
 */
function handleAreaFilterToggle(newArea, rank) {
    // ALLの場合、S/A/FATE 全てのareaSetを操作する
    const ranksToUpdate = rank === 'ALL' ? ['S', 'A', 'F'] : [rank];

    ranksToUpdate.forEach(r => {
        const currentAreaSet = currentFilter.areaSets[r];
        if (!currentAreaSet) return;

        if (newArea === 'ALL') {
            currentAreaSet.clear();
            currentAreaSet.add('ALL');
        } else {
            // ALLフラグを削除し、個別エリアのトグルを開始
            currentAreaSet.delete('ALL');

            if (currentAreaSet.has(newArea)) {
                currentAreaSet.delete(newArea);
            } else {
                currentAreaSet.add(newArea);
            }
            
            // 選択肢が空になったら、ALLフラグを再度追加 (全て非表示を防ぐ)
            if (currentAreaSet.size === 0) {
                currentAreaSet.add('ALL');
            }
        }
    });

    renderMobList();
    updateAreaFilterUI(); // UIを更新してボタンの状態を反映
}


// --- 討伐報告モーダル関数 ---

function openReportModal(mobNo, mobName) {
    currentMobNo = mobNo;
    DOMElements.modalMobName.textContent = mobName;

    // 現在時刻をJSTのdatetime-local形式に設定
    const now = new Date();
    // UTCからローカルタイムゾーンへのオフセットを考慮してISO形式に
    const formattedNow = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
    DOMElements.reportDatetimeInput.value = formattedNow;

    // 既存のメモをロード
    const currentMob = globalMobData.find(m => String(m['No.']) === String(mobNo));
    DOMElements.reportMemoInput.value = currentMob ? currentMob.Memo : ''; 

    DOMElements.reportModal.classList.add('is-visible');
    DOMElements.reportModal.classList.remove('hidden');
}

function closeReportModal() {
    DOMElements.modalContent.classList.remove('scale-100', 'opacity-1');
    DOMElements.reportModal.classList.remove('is-visible');
    setTimeout(() => {
        DOMElements.reportModal.classList.add('hidden');
    }, 300); // CSSアニメーションの時間と合わせる
    currentMobNo = null;
}

/**
 * 討伐報告をFirestoreに送信し、湧き潰しをリセットする。
 */
async function submitReport() {
    if (!db || !userId) {
        showErrorMessage('データベースまたはユーザー認証が未完了です。');
        return;
    }

    const reportTime = DOMElements.reportDatetimeInput.value;
    const memo = DOMElements.reportMemoInput.value;
    const mobNo = currentMobNo;

    if (!reportTime) {
        showErrorMessage('討伐日時を入力してください。');
        return;
    }

    const killTimestamp = new Date(reportTime);
    if (isNaN(killTimestamp)) {
        showErrorMessage('無効な日時形式です。');
        return;
    }

    const huntRecordRef = window.doc(db, HUNT_RECORDS_PATH, String(mobNo));
    
    try {
        // 1. 討伐記録を更新
        await window.setDoc(huntRecordRef, {
            mobNo: String(mobNo),
            lastKillTime: killTimestamp, 
            reporterId: userId,
            memo: memo,
            updatedAt: window.serverTimestamp()
        });

        // 2. 湧き潰し報告をリセット (重要: 討伐時刻の4日前以前のデータを削除)
        const FOUR_DAYS_MS = 4 * 24 * 60 * 60 * 1000;
        const fourDaysAgoFromKill = new Date(killTimestamp.getTime() - FOUR_DAYS_MS);
        
        const cullQuery = window.query(
            window.collection(db, CULL_REPORTS_PATH),
            window.where('mobNo', '==', String(mobNo))
        );
        
        const cullSnapshot = await window.getDocs(cullQuery);
        const batch = window.writeBatch(db);
        let resetCount = 0;

        cullSnapshot.forEach(cullDoc => {
            const cullData = cullDoc.data();
            const latestCullTime = cullData.latestCullTime ? cullData.latestCullTime.toDate() : null;

            if (latestCullTime && latestCullTime < fourDaysAgoFromKill) {
                batch.delete(cullDoc.ref);
                resetCount++;
            }
        });

        if (resetCount > 0) {
            await batch.commit();
            console.log(`${mobNo}の湧き潰し報告 ${resetCount} 件をリセットしました (討伐時刻の4日前以前のデータ)。`);
        }

        closeReportModal();

    } catch (error) {
        showErrorMessage('討伐報告の送信中にエラーが発生しました。');
        console.error('討伐報告エラー:', error);
    }
}


// --- Firebase 初期化とデータ監視 ---

async function initializeFirebaseAndWatchData() {
    if (!firebaseConfig) {
        showErrorMessage('Firebase設定が取得できませんでした。');
        return;
    }

    try {
        // グローバルに公開された関数を利用
        app = window.initializeApp(firebaseConfig);
        db = window.getFirestore(app);
        auth = window.getAuth(app);
        
        window.setLogLevel('debug');

        if (initialAuthToken) {
            await window.signInWithCustomToken(auth, initialAuthToken);
        } else {
            await window.signInAnonymously(auth);
        }

        window.onAuthStateChanged(auth, async (user) => {
            if (user) {
                userId = user.uid;
                console.log(`認証成功: UserID=${userId}`);
                DOMElements.uuidDisplay.textContent = `ID: ${userId.substring(0, 8)}...`;
                DOMElements.uuidDisplay.classList.remove('hidden');
                
                startWatchingData(); 
            } else {
                showErrorMessage('認証に失敗しました。');
                DOMElements.uuidDisplay.textContent = 'ID: 認証失敗';
                DOMElements.uuidDisplay.classList.remove('hidden');
            }
        });

    } catch (error) {
        showErrorMessage(`Firebaseの初期化中にエラーが発生しました: ${error.message}`);
        console.error('Firebase初期化エラー:', error);
    }
}

function startWatchingData() {
    // 討伐記録の監視
    const huntQuery = window.collection(db, HUNT_RECORDS_PATH);
    window.onSnapshot(huntQuery, (snapshot) => {
        const records = {};
        snapshot.forEach(doc => {
            records[doc.id] = doc.data();
        });
        updateGlobalMobData(records, globalCullReports); 
    }, (error) => {
        showErrorMessage('討伐記録のリアルタイム取得中にエラーが発生しました。');
        console.error('Hunt Records Error:', error);
    });

    // 湧き潰し報告の監視
    const cullQuery = window.collection(db, CULL_REPORTS_PATH);
    window.onSnapshot(cullQuery, (snapshot) => {
        const reports = {};
        snapshot.forEach(doc => {
            reports[doc.id] = doc.data();
        });
        updateGlobalMobData(globalHuntRecords, reports); 
    }, (error) => {
        showErrorMessage('湧き潰し報告のリアルタイム取得中にエラーが発生しました。');
        console.error('Cull Reports Error:', error);
    });
}

// --- 初期ロードとイベントリスナーの設定 ---

window.addEventListener('load', async () => {
    // 1. 静的モブデータ (mob_data.json) のロード
    try {
        const response = await fetch(MOB_DATA_URL);
        const data = await response.json();
        baseMobData = data.mobConfig;
    } catch (error) {
        showErrorMessage(`静的データ(${MOB_DATA_URL})のロードに失敗しました。`);
        console.error('MOB DATA LOAD ERROR:', error);
        return;
    }
    
    // 2. Firebase 初期化とデータ監視の開始
    initializeFirebaseAndWatchData(); 

    // 3. UIの初期化
    updateTabUI(currentFilter.rank);
    updateAreaFilterUI(); 
    
    // 4. 固定ヘッダーの高さ計算
    updateContentSpacerHeight();
    window.addEventListener('resize', updateContentSpacerHeight);

    // --- DOMイベントリスナーの設定 ---

    // ランクフィルタリスナー
    DOMElements.rankTabs.addEventListener('click', (e) => {
        const target = e.target.closest('.tab-btn');
        if (target) {
            const newRank = target.dataset.rank;
            if (newRank) {
                currentFilter.rank = newRank;
                // UIを更新
                updateTabUI(newRank);
                // エリアフィルタUIを更新 (ALL選択時は表示/非表示を切り替える)
                updateAreaFilterUI();
                // リストを再描画
                renderMobList(); 
            }
        }
    });
    
    // エリアフィルタリスナー (ボタンはupdateAreaFilterUIで動的に生成され、イベントが設定される)
    // エリアフィルタコンテナクリックでトグル (ここではボタンが生成されていないため、空のコンテナにリスナーを設定するのは非効率)
    // 代わりに、handleAreaFilterToggleでボタン生成時にonclickを設定している。

    // モーダル関連のリスナー
    if (DOMElements.cancelReportBtn) DOMElements.cancelReportBtn.onclick = closeReportModal;
    if (DOMElements.submitReportBtn) DOMElements.submitReportBtn.onclick = submitReport;

    if (DOMElements.reportModal) {
        DOMElements.reportModal.addEventListener('click', (e) => {
            if (e.target.id === 'report-modal') {
                closeReportModal();
            }
        });
    }

    // グローバルに公開
    window.openReportModal = openReportModal;
});

/**
 * ランクタブのUIを更新する。
 */
function updateTabUI(newRank) {
    DOMElements.rankTabs.querySelectorAll('.tab-btn').forEach(tab => {
        if (tab.dataset.rank === newRank) {
            tab.classList.add('active', 'bg-blue-600');
            tab.classList.remove('bg-gray-700', 'hover:bg-gray-600');
        } else {
            tab.classList.remove('active', 'bg-blue-600');
            tab.classList.add('bg-gray-700', 'hover:bg-gray-600');
        }
    });

    // エリアフィルタの開閉アニメーション
    const isAreaFilterVisible = newRank === 'ALL' || newRank === 'S' || newRank === 'A' || newRank === 'F';
    const wrapper = DOMElements.areaFilterWrapper;
    
    if (isAreaFilterVisible) {
        wrapper.style.maxHeight = `${wrapper.scrollHeight}px`; // 実際のコンテンツの高さに設定
    } else {
        wrapper.style.maxHeight = '0';
    }
}
