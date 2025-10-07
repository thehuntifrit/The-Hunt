// Google Apps Script (GAS) のエンドポイントURL
const GAS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxyutpOIZYI9Ce51s4vawk6S460QgM4wYcaLFJKUBi00_LKhNXT9-6N0n178KdoXkP7wg/exec';
// 静的モブデータ (mob_data.json) のURL (同階層のファイルを参照)
const MOB_DATA_URL = './mob_data.json'; 


// --- グローバル変数 ---
let baseMobData = []; // mob_data.jsonから取得した元のデータ
let globalMobData = []; // 討伐記録をマージした後の表示用データ
let currentFilter = 'ALL';
let currentMobNo = null;
let userId = null;

// --- DOMエレメント ---
const appEl = document.getElementById('app');
const mobListContainer = document.getElementById('mob-list-container');
const rankTabs = document.getElementById('rank-tabs');
const reportModal = document.getElementById('report-modal');
const modalMobName = document.getElementById('modal-mob-name');
const reportDatetimeInput = document.getElementById('report-datetime');
const reportMemoInput = document.getElementById('report-memo');
const submitReportBtn = document.getElementById('submit-report');
const cancelReportBtn = document.getElementById('cancel-report');
const reportStatusEl = document.getElementById('report-status');

// --- ユーティリティ関数 ---

/**
 * UNIX秒 (サーバー時間) を Dateオブジェクトに変換する
 * @param {number} unixtime - UNIX秒 (秒単位)
 * @returns {Date}
 */
function unixTimeToDate(unixtime) {
    // JavaScriptのDateはミリ秒単位で処理するため、1000倍する
    return new Date(unixtime * 1000); 
}

/**
 * 討伐日時からリポップ情報を計算する
 * @param {object} mob - モブデータオブジェクト (REPOP(s), MAX(s)を含む)
 * @param {string | Date} lastKill - 最終討伐日時 (文字列 or Dateオブジェクト)
 * @returns {object} { minRepop: Date | string, maxRepop: Date, timeRemaining: string, elapsedPercent: number }
 */
function calculateRepop(mob, lastKill) {
    // NaNエラー対策: lastKillが有効なDateオブジェクトでない場合は即座にリターン
    const killTime = (lastKill instanceof Date) ? lastKill : new Date(lastKill);
    if (!lastKill || isNaN(killTime.getTime())) {
        return {
            minRepop: '未討伐',
            maxRepop: null,
            timeRemaining: 'N/A',
            elapsedPercent: 0
        };
    }
    
    const now = new Date();

    // 最小リポップ時間（ミリ秒）
    const repopMinMs = mob['REPOP(s)'] * 1000;
    
    if (repopMinMs <= 0) {
        return {
            minRepop: 'N/A',
            maxRepop: null,
            timeRemaining: 'N/A',
            elapsedPercent: 0
        };
    }

    const minRepopTime = new Date(killTime.getTime() + repopMinMs);

    // 経過時間と残りの時間（ミリ秒）
    const elapsedMs = now.getTime() - killTime.getTime();
    const remainingMs = minRepopTime.getTime() - now.getTime();
    
    // 進捗パーセント (0% - 100%に丸める)
    let normalizedElapsedPercent = Math.max(0, Math.min(100, (elapsedMs / repopMinMs) * 100));

    // 残り時間のフォーマット
    let timeRemainingStr;
    if (remainingMs <= 0) {
        timeRemainingStr = 'POP中';
        normalizedElapsedPercent = 100; // POP中は100%固定
    } else {
        const totalSeconds = Math.floor(remainingMs / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        timeRemainingStr = `${hours}h ${minutes}m ${seconds}s`;
    }

    return {
        minRepop: minRepopTime,
        maxRepop: null, 
        timeRemaining: timeRemainingStr,
        elapsedPercent: normalizedElapsedPercent
    };
}

/**
 * モブデータに基づいてHTMLカードを生成する
 * (変更なし)
 * @param {object} mob - モブデータオブジェクト
 * @returns {string} - HTML文字列
 */
function createMobCard(mob) {
    const { minRepop, timeRemaining, elapsedPercent } = calculateRepop(mob, mob.POP_Date);

    // 進捗バーの色定義
    let colorStart = '#10b981'; // green-500
    let colorEnd = '#34d399';   // green-400
    let timeStatusClass = 'text-green-400';
    let minPopStr = '未討伐';

    if (mob.POP_Date) {
        minPopStr = minRepop instanceof Date ? minRepop.toLocaleString() : minRepop;

        if (timeRemaining === 'POP中') {
            colorStart = '#f59e0b'; // amber-500
            colorEnd = '#fbbf24';   // amber-400
            timeStatusClass = 'text-amber-400 font-bold';
        } else if (elapsedPercent >= 90) {
            colorStart = '#ef4444'; // red-500
            colorEnd = '#f87171';   // red-400
            timeStatusClass = 'text-red-400';
        }
    }

    // ランクアイコンの背景色
    let rankBgClass;
    let rankTextColor = 'text-white';
    switch (mob.Rank) {
        case 'S':
            rankBgClass = 'bg-red-600';
            break;
        case 'A':
            rankBgClass = 'bg-blue-600';
            break;
        case 'B': // Bモブがあれば
            rankBgClass = 'bg-gray-600';
            break;
        case 'F':
            rankBgClass = 'bg-purple-600';
            break;
        default:
            rankBgClass = 'bg-gray-600';
    }

    // 討伐報告ボタンの初期状態
    const isPop = timeRemaining === 'POP中';
    const reportBtnClass = isPop ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500 active:bg-green-700 report-btn';
    const reportBtnText = isPop ? 'POP中 (報告不可)' : '討伐報告';
    
    // マップ詳細表示トグルボタン
    const toggleMapBtn = mob.Map ? `
        <button class="toggle-details-btn text-xs font-semibold py-1 px-2 rounded-full bg-gray-600 hover:bg-gray-500">
            マップ詳細
        </button>
    ` : '';

    return `
        <div class="mob-card bg-gray-800 rounded-xl shadow-2xl overflow-hidden transform hover:scale-[1.01] transition duration-300 relative" 
             data-rank="${mob.Rank}" 
             data-mobno="${mob['No.']}"
             data-lastkill="${mob.POP_Date || ''}"
             data-minrepop="${mob['REPOP(s)']}"
             data-maxrepop="${mob['MAX(s)']}">

            <div class="repop-bar-bg absolute top-0 left-0 h-1 w-full"
                 style="--progress-percent: ${elapsedPercent.toFixed(1)}%; 
                        --progress-color-start: ${colorStart}; 
                        --progress-color-end: ${colorEnd};">
            </div>

            <div class="p-4 fixed-content">
                <div class="flex justify-between items-center mb-2">
                    <div class="rank-icon ${rankBgClass} ${rankTextColor} font-bold text-xs w-8 h-8 flex items-center justify-center rounded-full shadow-lg">
                        ${mob.Rank}
                    </div>
                    
                    <button class="${reportBtnClass} text-xs text-white px-3 py-1 rounded-full shadow-md transition" 
                            data-mobno="${mob['No.']}" 
                            ${isPop ? 'disabled' : ''}>
                        ${reportBtnText}
                    </button>
                </div>

                <h2 class="text-xl font-bold text-outline text-yellow-200">${mob.Name}</h2>
                <p class="text-sm text-gray-400">${mob.Area}</p>

                <div class="mt-3 bg-gray-700 p-2 rounded-lg text-xs">
                    <p class="text-gray-300">最終討伐: <span class="last-kill-date">${mob.POP_Date || 'N/A'}</span></p>
                    <p class="font-bold">
                        予測POP: <span class="repop-time text-base ${timeStatusClass}">${minPopStr}</span>
                    </p>
                    <p class="text-gray-300">
                        残/経過: <span class="font-mono time-remaining">${timeRemaining} (${elapsedPercent.toFixed(1)}%)</span>
                    </p>
                </div>

                <div class="mt-3 flex justify-between items-center">
                    <p class="text-xs text-gray-400">${mob.POP_Date}</p>
                    ${toggleMapBtn}
                </div>
            </div>

            <div class="mob-details border-t border-gray-700 bg-gray-900" 
                 id="details-${mob['No.']}">
                ${mob.Map ? `
                    <div class="relative mt-2 p-2">
                        <img src="./maps/${mob.Map}" alt="${mob.Area} Map" class="w-full h-auto rounded-lg shadow-md map-image" data-area="${mob.Area}">
                        <div class="absolute inset-0 map-overlay" data-area="${mob.Area}">
                            </div>
                    </div>
                ` : '<p class="text-sm text-gray-500 italic">マップデータなし</p>'}
            </div>
        </div>
    `;
}

/**
 * MobNoからモブデータを取得する
 * (変更なし)
 * @param {number} mobNo 
 * @returns {object}
 */
function getMobByNo(mobNo) {
    return globalMobData.find(mob => mob['No.'] === mobNo);
}

// --- DOM操作/イベントハンドラ ---

/**
 * フィルターに基づいてモブカードリストをレンダリングする
 * (変更なし)
 * @param {string} rank - フィルターするランク ('ALL', 'S', 'A', 'F')
 */
function renderMobList(rank) {
    currentFilter = rank;

    // フィルタリング
    const filteredMobs = rank === 'ALL' 
        ? globalMobData
        : globalMobData.filter(mob => mob.Rank === rank);

    // 既存のコンテンツを保持しつつ、新しいカードを各カラムに均等に配置
    const columns = [
        document.getElementById('column-1'),
        document.getElementById('column-2'),
        document.getElementById('column-3')
    ].filter(col => col); 

    columns.forEach(col => col.innerHTML = ''); // カラムをクリア

    filteredMobs.forEach((mob, index) => {
        const cardHtml = createMobCard(mob);
        
        // 振り分けロジック: カラムが複数あれば、均等に分配
        let targetColumn = columns[0];
        if (columns.length > 1) {
            targetColumn = columns[index % columns.length];
        }

        const div = document.createElement('div');
        div.innerHTML = cardHtml.trim();
        targetColumn.appendChild(div.firstChild);
    });

    // アクティブなタブをハイライト
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('bg-blue-600', 'hover:bg-blue-500');
        btn.classList.add('bg-gray-700', 'hover:bg-gray-600');
        if (btn.dataset.rank === rank) {
            btn.classList.remove('bg-gray-700', 'hover:bg-gray-600');
            btn.classList.add('bg-blue-600', 'hover:bg-blue-500');
        }
    });
    
    // イベントリスナーを再設定
    attachEventListeners();
    // 再レンダリング後、進捗バーも即時更新する
    updateProgressBars();
}

/**
 * イベントリスナーをカードとボタンにアタッチする
 * (変更なし)
 */
function attachEventListeners() {
    // 討伐報告ボタン
    document.querySelectorAll('.report-btn').forEach(button => {
        if (button.dataset.mobno) {
            button.onclick = (e) => openReportModal(e.currentTarget.dataset.mobno);
        }
    });
    
    // マップ詳細トグルボタン
    document.querySelectorAll('.toggle-details-btn').forEach(button => {
        button.onclick = (e) => toggleMobDetails(e.currentTarget);
    });
}

/**
 * マップ詳細パネルの表示/非表示を切り替える
 * (変更なし)
 * @param {HTMLElement} button - クリックされたボタン要素
 */
function toggleMobDetails(button) {
    const card = button.closest('.mob-card');
    const mobNo = card.dataset.mobno;
    const detailsPanel = document.getElementById(`details-${mobNo}`);
    const mob = getMobByNo(parseInt(mobNo));

    if (detailsPanel.classList.contains('open')) {
        // パネルを閉じる
        detailsPanel.classList.remove('open');
        button.textContent = 'マップ詳細';
    } else {
        // パネルを開く
        detailsPanel.classList.add('open');
        button.textContent = '詳細を隠す';
        
        // マップオーバーレイが空の場合は描画
        const mapOverlay = detailsPanel.querySelector('.map-overlay');
        if (mapOverlay && mapOverlay.children.length === 0 && mob.spawn_points) {
            drawSpawnPoints(mapOverlay, mob.spawn_points, mobNo);
        }
    }
}

/**
 * マップにスポーンポイントを描画する
 * (変更なし)
 */
function drawSpawnPoints(overlayEl, spawnPoints, currentMobNo) {
    overlayEl.innerHTML = '';
    
    const mob = getMobByNo(parseInt(currentMobNo));
    
    spawnPoints.forEach(point => {
        const isImportant = point.mob_ranks.includes(mob.Rank); 
        
        const xPercent = point.x;
        const yPercent = point.y;
        
        const pointEl = document.createElement('div');
        pointEl.className = 'spawn-point';
        pointEl.setAttribute('data-id', point.id);
        pointEl.setAttribute('data-important', isImportant ? 'true' : 'false');
        
        if (isImportant && mob.Rank === 'S') {
            pointEl.classList.add('important-ring');
            pointEl.style.boxShadow = '0 0 0 4px #f59e0b'; // amber-500 ring
            pointEl.style.filter = 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.8))';
        } else if (isImportant && mob.Rank === 'A') {
            pointEl.style.backgroundColor = '#3b82f6'; // blue-500
        } else {
            pointEl.style.backgroundColor = '#9ca3af'; // gray-400
            pointEl.style.opacity = '0.4';
        }

        pointEl.style.left = `${xPercent}%`;
        pointEl.style.top = `${yPercent}%`;
        
        if (isImportant) {
            pointEl.onclick = () => {
                alert(`ポイント [${point.id}] をクリックしました。湧き潰し機能は未実装です。`);
            };
        }
        
        overlayEl.appendChild(pointEl);
    });
}

// --- モーダル/フォーム操作 ---

/**
 * 討伐報告モーダルを開く
 * (変更なし)
 * @param {number} mobNo - 報告対象のモブNo
 */
function openReportModal(mobNo) {
    currentMobNo = parseInt(mobNo);
    const mob = getMobByNo(currentMobNo);
    
    if (!mob) return;

    modalMobName.textContent = mob.Name;
    reportMemoInput.value = '';
    reportStatusEl.textContent = '';
    reportStatusEl.classList.add('hidden');

    // 現在時刻をローカルタイムでセット
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    const localIso = (new Date(now.getTime() - offset)).toISOString().slice(0, 16);
    reportDatetimeInput.value = localIso;

    reportModal.classList.remove('hidden');
    reportModal.classList.add('flex');
}

/**
 * 討伐報告モーダルを閉じる
 * (変更なし)
 */
function closeReportModal() {
    reportModal.classList.add('hidden');
    reportModal.classList.remove('flex');
    currentMobNo = null;
}

/**
 * 討伐報告をGASに送信する
 * (変更なし)
 */
async function submitReport() {
    if (!currentMobNo) return;

    const killTime = reportDatetimeInput.value;
    const memo = reportMemoInput.value;
    const mob = getMobByNo(currentMobNo);

    if (!killTime) {
        alert('討伐日時を入力してください。');
        return;
    }

    submitReportBtn.disabled = true;
    submitReportBtn.textContent = '送信中...';
    reportStatusEl.classList.remove('hidden');
    reportStatusEl.classList.remove('text-green-500', 'text-red-500');
    reportStatusEl.textContent = 'サーバーに送信中...';
    
    const killDate = new Date(killTime); 

    try {
        const response = await fetch(GAS_ENDPOINT, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                action: 'reportKill',
                mobNo: currentMobNo,
                mobName: mob.Name,
                killTime: killDate.toISOString(), // UTCで送信
                memo: memo,
                reporterId: userId 
            })
        });

        const result = await response.json();

        if (result.status === 'success') {
            reportStatusEl.textContent = `報告成功！ (${result.message})`;
            reportStatusEl.classList.add('text-green-500');
            // 最新データを取得しUIを更新
            await fetchRecordsAndUpdate(false); 
            setTimeout(closeReportModal, 1500); 

        } else {
            reportStatusEl.textContent = `報告失敗: ${result.message}`;
            reportStatusEl.classList.add('text-red-500');
        }

    } catch (error) {
        console.error('報告エラー:', error);
        reportStatusEl.textContent = '通信エラーが発生しました。';
        reportStatusEl.classList.add('text-red-500');
    } finally {
        submitReportBtn.disabled = false;
        submitReportBtn.textContent = '報告完了';
    }
}

// --- データ取得/更新 ---

/**
 * 外部JSONからモブデータを取得する
 */
async function fetchBaseMobData() {
    try {
        const response = await fetch(MOB_DATA_URL); 
        
        if (!response.ok) {
            console.error(`Fetch Error: Status ${response.status} for ${MOB_DATA_URL}.`);
            console.error('Possible Causes: 1. File not found (404). 2. CORS issue (Local run).');
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // --- 修正箇所: mobConfigキーから配列を抽出 ---
        const jsonData = await response.json();
        
        if (jsonData && Array.isArray(jsonData.mobConfig)) {
            baseMobData = jsonData.mobConfig;
            console.log('Base mob data (mobConfig) fetched successfully.');
        } else {
            throw new Error('JSON structure error: mobConfig array not found. Ensure mob_data.json has the structure { "mobConfig": [...] }.');
        }
        // --- 修正箇所 終わり ---

    } catch (error) {
        console.error('基本モブデータの取得に失敗:', error);
        baseMobData = []; // データ取得失敗時は空配列で続行
    }
}

/**
 * GASから最新の討伐記録を取得し、グローバルデータを更新する
 * (変更なし)
 * @param {boolean} shouldFetchBase - 初期化時など、ベースデータも取得するかどうか
 */
async function fetchRecordsAndUpdate(shouldFetchBase = true) {
    if (shouldFetchBase) {
        await fetchBaseMobData();
    }
    
    if (baseMobData.length === 0) {
        console.warn('Base mob data is empty, skipping record update.');
        return;
    }

    try {
        const response = await fetch(GAS_ENDPOINT + '?action=getRecords');
        const data = await response.json();
        
        if (data.status === 'success') {
            const records = data.records;
            
            globalMobData = baseMobData.map(mob => {
                const record = records.find(r => r['No.'] === mob['No.']);
                const newMob = { ...mob }; 
                
                if (record && record.POP_Date_Unix) {
                    // Unix秒をDateオブジェクトに変換し、ローカルタイム形式の文字列として保存
                    newMob.POP_Date = unixTimeToDate(record.POP_Date_Unix).toLocaleString();
                } else {
                    newMob.POP_Date = '';
                }
                return newMob;
            });
            console.log('Kill records merged successfully.');

            renderMobList(currentFilter);
        } else {
            console.error('GASからのデータ取得失敗:', data.message);
            globalMobData = baseMobData;
            renderMobList(currentFilter);
        }
    } catch (error) {
        console.error('GAS通信エラー:', error);
        globalMobData = baseMobData;
        renderMobList(currentFilter);
    }
}

/**
 * 各モブカードの進捗バーを更新する (60秒ごと)
 * (NaN対策済みのバージョン。変更なし)
 */
function updateProgressBars() {
    document.querySelectorAll('.mob-card').forEach(card => {
        // data属性から直接値を取得
        const lastKillStr = card.dataset.lastkill;
        const repop = parseInt(card.dataset.minrepop);
        const max = parseInt(card.dataset.maxrepop);
        
        if (!lastKillStr) return; 

        const lastKill = new Date(lastKillStr);
        
        // **NaN対策**: Dateオブジェクトが無効な場合は処理を中断
        if (isNaN(lastKill.getTime())) {
            console.error(`Invalid Date format for mobNo ${card.dataset.mobno}: ${lastKillStr}`);
            return;
        }

        const mobStub = {"REPOP(s)": repop, "MAX(s)": max};
        const repopData = calculateRepop(mobStub, lastKill);
        const percent = repopData.elapsedPercent || 0; 

        // 進捗バーのCSS変数を更新
        const repopBarBg = card.querySelector('.repop-bar-bg');
        if (repopBarBg) {
            repopBarBg.style.setProperty('--progress-percent', `${percent.toFixed(1)}%`);
        }
        
        // 「残/経過」のテキストを正確に更新
        const timeRemainingEl = card.querySelector('.time-remaining'); 
        if (timeRemainingEl) {
            timeRemainingEl.textContent = `${repopData.timeRemaining} (${percent.toFixed(1)}%)`;
            
            // 残り時間のクラスを更新 (色を変えるため)
            const repopTimeEl = card.querySelector('.repop-time');
            if (repopTimeEl) {
                // POP中になった場合、色を変更
                if (repopData.timeRemaining === 'POP中') {
                    repopTimeEl.classList.remove('text-green-400', 'text-red-400');
                    repopTimeEl.classList.add('text-amber-400', 'font-bold');
                } else if (percent >= 90) {
                    repopTimeEl.classList.remove('text-green-400', 'text-amber-400', 'font-bold');
                    repopTimeEl.classList.add('text-red-400');
                } else {
                    repopTimeEl.classList.remove('text-amber-400', 'text-red-400', 'font-bold');
                    repopTimeEl.classList.add('text-green-400');
                }
            }
        }
        
        // 「予測POP」のテキストを正確に更新
        const repopTimeEl = card.querySelector('.repop-time');
        if (repopTimeEl) {
            const minPopStr = repopData.minRepop instanceof Date ? repopData.minRepop.toLocaleString() : repopData.minRepop;
            repopTimeEl.textContent = minPopStr;
        }

        // 討伐報告ボタンの状態を更新
        const reportBtn = card.querySelector('.report-btn');
        // 'POP中'になったが、ボタンがまだ無効化されていない場合
        if (repopData.timeRemaining === 'POP中') {
            if (reportBtn && !reportBtn.disabled) {
                reportBtn.disabled = true;
                reportBtn.textContent = 'POP中 (報告不可)';
                reportBtn.classList.remove('bg-green-600', 'hover:bg-green-500', 'active:bg-green-700');
                reportBtn.classList.add('bg-gray-500', 'cursor-not-allowed');
            }
        } else {
             // POP中でなくなった場合
            if (reportBtn && reportBtn.disabled) {
                reportBtn.disabled = false;
                reportBtn.textContent = '討伐報告';
                reportBtn.classList.remove('bg-gray-500', 'cursor-not-allowed');
                reportBtn.classList.add('bg-green-600', 'hover:bg-green-500', 'active:bg-green-700');
            }
        }
    });
}

/**
 * サイトの初期化処理
 * (変更なし)
 */
function initializeApp() {
    // 報告者UUIDの生成または取得
    userId = localStorage.getItem('user_uuid');
    if (!userId) {
        userId = crypto.randomUUID();
        localStorage.setItem('user_uuid', userId);
    }

    // イベントリスナー設定
    rankTabs.querySelectorAll('.tab-btn').forEach(button => {
        button.onclick = (e) => renderMobList(e.currentTarget.dataset.rank);
    });
    cancelReportBtn.onclick = closeReportModal;
    submitReportBtn.onclick = submitReport;

    // モーダルの外側クリックで閉じる
    reportModal.addEventListener('click', (e) => {
        if (e.target.id === 'report-modal') {
            closeReportModal();
        }
    });
    
    // 初期表示: JSONとGASからデータを取得し、グローバルデータをセット
    fetchRecordsAndUpdate(true);

    // GASへのデータ更新間隔は10分を維持
    setInterval(() => fetchRecordsAndUpdate(false), 10 * 60 * 1000);

    // 進捗ゲージはクライアントで軽量に更新（60秒ごと）
    setInterval(updateProgressBars, 60 * 1000);
}

// アプリケーション起動
document.addEventListener('DOMContentLoaded', initializeApp);
