// Google Apps Script (GAS) のエンドポイントURL
const GAS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxyutpOIZYI9Ce51s4vawk6S460QgM4wYcaLFJKUBi00_LKhNXT9-6N0n178KdoXkP7wg/exec';
// 静的モブデータ (mob_data.json) のURL (同階層のファイルを参照)
const MOB_DATA_URL = './mob_data.json'; 


// --- グローバル変数 ---
let baseMobData = [];
let globalMobData = [];
let currentFilter = 'ALL';
let currentMobNo = null;
let userId = null;

// --- DOMエレメント ---
// これらの要素がHTMLに存在しない場合、nullになります。
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
 */
function unixTimeToDate(unixtime) {
    return new Date(unixtime * 1000); 
}

/**
 * テキストを // で改行する関数 (文字数による折り返し制限は撤廃)
 * @param {string} text 処理対象の文字列
 * @returns {string} <br>が挿入された文字列
 */
const processText = (text) => {
    // 既存の // を <br> に変換するのみ
    return text.replace(/\/\/\s*/g, '<br>');
};


/**
 * 討伐日時からリポップ情報を計算する
 */
function calculateRepop(mob, lastKill) {
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
    const elapsedMs = now.getTime() - killTime.getTime();
    const remainingMs = minRepopTime.getTime() - now.getTime();
    
    let normalizedElapsedPercent = Math.max(0, Math.min(100, (elapsedMs / repopMinMs) * 100));

    let timeRemainingStr;
    if (remainingMs <= 0) {
        timeRemainingStr = 'POP中';
        normalizedElapsedPercent = 100;
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
 */
function createMobCard(mob) {
    const lastKillDate = mob.LastKillDate ? new Date(mob.LastKillDate) : null;
    const { minRepop, timeRemaining, elapsedPercent } = calculateRepop(mob, lastKillDate);

    // 進捗バーの色定義
    let colorStart = '#10b981'; 
    let colorEnd = '#34d399';   
    let timeStatusClass = 'text-green-400';
    let minPopStr = '未討伐';
    let lastKillStr = mob.LastKillDate || '不明'; 

    if (lastKillDate) {
        minPopStr = minRepop instanceof Date ? minRepop.toLocaleString() : minRepop;

        if (timeRemaining === 'POP中') {
            colorStart = '#f59e0b'; 
            colorEnd = '#fbbf24';   
            timeStatusClass = 'text-amber-400 font-bold';
        } else if (elapsedPercent >= 90) {
            colorStart = '#ef4444'; 
            colorEnd = '#f87171';   
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
        case 'B':
            rankBgClass = 'bg-gray-600';
            break;
        case 'F':
            rankBgClass = 'bg-purple-600';
            break;
        default:
            rankBgClass = 'bg-gray-600';
    }

    // 討伐報告ボタンの状態
    const isPop = timeRemaining === 'POP中';
    const canReport = !isPop || !lastKillDate; 
    
    const reportBtnClass = !canReport ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500 active:bg-green-700 report-btn';
    
    let reportBtnContent;
    if (!canReport) {
        reportBtnContent = `<span class="text-sm font-bold">POP中</span><span class="text-xs">(報告不可)</span>`;
    } else {
        reportBtnContent = `<span class="text-sm font-bold">討伐</span><span class="text-sm font-bold">報告</span>`;
    }

    const reportBtnHtml = `
        <button class="${reportBtnClass} text-xs text-white px-1 py-1 rounded-md shadow-md transition h-10 w-14 flex flex-col items-center justify-center leading-none" 
                data-mobno="${mob['No.']}" 
                ${!canReport ? 'disabled' : ''}>
            ${reportBtnContent}
        </button>
    `;
    
    // --- 展開パネルの内容 ---
    
    // 抽選条件の処理: ラベル、4行固定、背景色を削除
    let conditionHtml = '';
    if (mob.Condition) {
        const displayCondition = processText(mob.Condition);
        
        conditionHtml = `
            <div class="pt-4 px-4 pb-2">
                <p class="text-xs text-gray-400 leading-snug">${displayCondition}</p>
            </div>
        `;
    }
    
    // マップ詳細パネル: マップデータがない場合は空文字列を返す
    let mapDetailsHtml = '';
    if (mob.Map) {
        mapDetailsHtml = `
            <div class="mob-details ${mob.Condition ? 'pt-3 border-t border-gray-700' : 'pt-4'} px-4 pb-4">
                <div class="relative">
                    <img src="./maps/${mob.Map}" alt="${mob.Area} Map" class="w-full h-auto rounded-lg shadow-md map-image" data-area="${mob.Area}">
                    <div class="absolute inset-0 map-overlay" data-area="${mob.Area}">
                        </div>
                </div>
            </div>
        `;
    }
    
    // 抽選条件とマップ詳細のいずれかがある場合のみ展開パネルを生成
    let expandablePanel = '';
    if (conditionHtml || mapDetailsHtml) {
        expandablePanel = `
            <div class="expandable-panel overflow-hidden transition-all duration-300 ease-in-out max-h-0">
                ${conditionHtml}
                ${mapDetailsHtml}
            </div>
        `;
    }

    // --- カード全体 ---

    return `
        <div class="mob-card bg-gray-800 rounded-xl shadow-2xl overflow-hidden transform hover:scale-[1.01] transition duration-300 relative" 
             data-rank="${mob.Rank}" 
             data-mobno="${mob['No.']}"
             data-lastkill="${mob.LastKillDate || ''}"
             data-minrepop="${mob['REPOP(s)']}"
             data-maxrepop="${mob['MAX(s)']}">

            <div class="repop-bar-bg absolute top-0 left-0 h-1 w-full"
                 style="--progress-percent: ${elapsedPercent.toFixed(1)}%; 
                        --progress-color-start: ${colorStart}; 
                        --progress-color-end: ${colorEnd};">
            </div>

            <div class="p-4 fixed-content toggle-handler cursor-pointer">
                <div class="flex justify-between items-start mb-3">
                    <div class="flex items-center space-x-3">
                        <div class="rank-icon ${rankBgClass} ${rankTextColor} font-bold text-sm w-7 h-7 flex items-center justify-center rounded-lg shadow-lg">
                            ${mob.Rank}
                        </div>
                        <div>
                            <h2 class="text-lg font-bold text-outline text-yellow-200 leading-tight">${mob.Name}</h2>
                            <p class="text-xs text-gray-400 leading-tight">${mob.Area}</p>
                        </div>
                    </div>
                    
                    ${reportBtnHtml}
                </div>

                <div class="mt-3 bg-gray-700 p-2 rounded-lg text-xs flex flex-col space-y-1">
                    
                    <div class="flex justify-between items-baseline">
                        <span class="text-gray-300 w-24 flex-shrink-0 text-base">予測POP:</span>
                        <span class="repop-time text-base ${timeStatusClass} font-bold">${minPopStr}</span>
                    </div>
                    
                    <div class="flex justify-between">
                        <span class="text-gray-300 w-24 flex-shrink-0 text-base">残り (%):</span> 
                        <span class="font-mono time-remaining text-base text-white">${timeRemaining} (${elapsedPercent.toFixed(1)}%)</span>
                    </div>

                    <div class="flex justify-between">
                        <span class="text-gray-300 w-24 flex-shrink-0">前回討伐:</span> 
                        <span class="last-kill-date text-white">${lastKillStr}</span>
                    </div>
                </div>
            </div>

            ${expandablePanel}
        </div>
    `;
}

/**
 * MobNoからモブデータを取得する
 */
function getMobByNo(mobNo) {
    return globalMobData.find(mob => mob['No.'] === mobNo);
}

// --- DOM操作/イベントハンドラ ---

/**
 * フィルターに基づいてモブカードリストをレンダリングする
 */
function renderMobList(rank) {
    currentFilter = rank;

    const filteredMobs = rank === 'ALL' 
        ? globalMobData
        : globalMobData.filter(mob => mob.Rank === rank);

    // 存在しない可能性があるカラムIDをフィルタリング
    const columns = [
        document.getElementById('column-1'),
        document.getElementById('column-2'),
        document.getElementById('column-3')
    ].filter(col => col); 

    columns.forEach(col => col.innerHTML = '');

    // カラムが存在しない場合は何もしない (クラッシュ回避)
    if (columns.length === 0 && mobListContainer) {
        // mobListContainerに直接挿入するフォールバック処理 (モバイルなど1カラムの場合)
        // 今回のindex.htmlの想定では不要ですが、念のため
        if (mobListContainer.children.length === 0) {
            mobListContainer.innerHTML = `<p class="text-center text-gray-400 mt-10">表示するモブがいません。HTMLのカラムID(column-1, column-2など)を確認してください。</p>`;
        }
        return; 
    } else if (columns.length === 0) {
        return;
    }


    filteredMobs.forEach((mob, index) => {
        const cardHtml = createMobCard(mob);
        
        let targetColumn = columns[0];
        if (columns.length > 1) {
            targetColumn = columns[index % columns.length];
        }

        const div = document.createElement('div');
        div.innerHTML = cardHtml.trim();
        targetColumn.appendChild(div.firstChild);
    });

    // アクティブなタブをハイライト
    if (rankTabs) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('bg-blue-600', 'hover:bg-blue-500');
            btn.classList.add('bg-gray-700', 'hover:bg-gray-600');
            if (btn.dataset.rank === rank) {
                btn.classList.remove('bg-gray-700', 'hover:bg-gray-600');
                btn.classList.add('bg-blue-600', 'hover:bg-blue-500');
            }
        });
    }
    
    attachEventListeners();
    updateProgressBars();
}

/**
 * イベントリスナーをカードとボタンにアタッチする
 */
function attachEventListeners() {
    // 討伐報告ボタン
    document.querySelectorAll('.report-btn').forEach(button => {
        if (button.dataset.mobno && !button.disabled) {
            button.onclick = (e) => {
                e.stopPropagation();
                openReportModal(e.currentTarget.dataset.mobno);
            }
        }
    });
    
    // カードの固定情報エリア (.fixed-content) のクリックイベント（トグル展開用）
    document.querySelectorAll('.toggle-handler').forEach(handler => {
        handler.onclick = (e) => {
            const card = e.currentTarget.closest('.mob-card');
            if (card) {
                toggleMobDetails(card);
            }
        };
    });
}

/**
 * マップ詳細パネルの表示/非表示を切り替える
 * @param {HTMLElement} card - クリックされた mob-card 要素
 */
function toggleMobDetails(card) {
    const mobNo = card.dataset.mobno;
    const mob = getMobByNo(parseInt(mobNo));
    const panel = card.querySelector('.expandable-panel');

    // 展開パネルがないモブはトグルしない
    if (!panel) return;

    // max-heightをリセット
    panel.style.transition = 'max-height 0.3s ease-in-out';
    
    if (card.classList.contains('open')) {
        // 閉じる処理
        panel.style.maxHeight = '0';
        card.classList.remove('open');
    } else {
        // 開く処理
        // scrollHeightに十分な余白 (e.g. 50px) を足すことで、トランジションの途切れを防ぐ
        panel.style.maxHeight = (panel.scrollHeight + 50) + 'px';
        card.classList.add('open');
        
        const mapOverlay = panel.querySelector('.map-overlay');
        // スポーンポイントの描画
        if (mapOverlay && mapOverlay.children.length === 0 && mob.spawn_points) {
            drawSpawnPoints(mapOverlay, mob.spawn_points, mobNo);
        }
    }
}

/**
 * マップにスポーンポイントを描画する
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
            pointEl.onclick = (e) => {
                e.stopPropagation(); 
                alert(`ポイント [${point.id}] をクリックしました。湧き潰し機能は未実装です。`);
            };
        }
        
        overlayEl.appendChild(pointEl);
    });
}

// --- モーダル/フォーム操作 ---

/**
 * 討伐報告モーダルを開く
 */
function openReportModal(mobNo) {
    // DOM要素の存在チェック
    if (!reportModal || !modalMobName || !reportDatetimeInput) return;

    currentMobNo = parseInt(mobNo);
    const mob = getMobByNo(currentMobNo);
    
    if (!mob) return;

    modalMobName.textContent = mob.Name;
    if (reportMemoInput) reportMemoInput.value = '';
    if (reportStatusEl) {
        reportStatusEl.textContent = '';
        reportStatusEl.classList.add('hidden');
    }

    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    const localIso = (new Date(now.getTime() - offset)).toISOString().slice(0, 16);
    reportDatetimeInput.value = localIso;

    reportModal.classList.remove('hidden');
    reportModal.classList.add('flex');
}

/**
 * 討伐報告モーダルを閉じる
 */
function closeReportModal() {
    if (!reportModal) return;
    reportModal.classList.add('hidden');
    reportModal.classList.remove('flex');
    currentMobNo = null;
}

/**
 * 討伐報告をGASに送信する
 */
async function submitReport() {
    if (!currentMobNo || !reportDatetimeInput || !submitReportBtn || !reportStatusEl) return;

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
                killTime: killDate.toISOString(), 
                memo: memo,
                reporterId: userId 
            })
        });

        const result = await response.json();

        if (result.status === 'success') {
            reportStatusEl.textContent = `報告成功！ (${result.message})`;
            reportStatusEl.classList.add('text-green-500');
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

/**
 * 外部JSONからモブデータを取得する
 */
async function fetchBaseMobData() {
    try {
        const response = await fetch(MOB_DATA_URL); 
        
        if (!response.ok) {
            console.error(`Fetch Error: Status ${response.status} for ${MOB_DATA_URL}.`);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const jsonData = await response.json();
        
        if (jsonData && Array.isArray(jsonData.mobConfig)) {
            baseMobData = jsonData.mobConfig;
            console.log('Base mob data (mobConfig) fetched successfully.');
        } else {
            throw new Error('JSON structure error: mobConfig array not found.');
        }

    } catch (error) {
        console.error('基本モブデータの取得に失敗:', error);
        baseMobData = [];
    }
}

/**
 * GASから最新の討伐記録を取得し、グローバルデータを更新する 
 */
async function fetchRecordsAndUpdate(shouldFetchBase = true) {
    if (shouldFetchBase) {
        await fetchBaseMobData();
    }
    
    if (baseMobData.length === 0) {
        console.warn('Base mob data is empty, skipping record update.');
        renderMobList(currentFilter);
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
                    newMob.LastKillDate = unixTimeToDate(record.POP_Date_Unix).toLocaleString();
                } else {
                    newMob.LastKillDate = ''; 
                }
                
                newMob.Condition = mob.Condition || '';

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
 */
function updateProgressBars() {
    document.querySelectorAll('.mob-card').forEach(card => {
        const lastKillStr = card.dataset.lastkill;
        const repop = parseInt(card.dataset.minrepop);
        const max = parseInt(card.dataset.maxrepop);
        
        if (!lastKillStr) return; 

        const lastKill = new Date(lastKillStr);
        
        if (isNaN(lastKill.getTime())) {
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
        
        // テキスト要素の更新
        const repopTimeEl = card.querySelector('.repop-time');
        const timeRemainingEl = card.querySelector('.time-remaining'); 

        if (repopTimeEl) {
            const minPopStr = repopData.minRepop instanceof Date ? repopData.minRepop.toLocaleString() : repopData.minRepop;
            repopTimeEl.textContent = minPopStr;
            
            // 色の更新
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
        
        if (timeRemainingEl) {
            timeRemainingEl.textContent = `${repopData.timeRemaining} (${percent.toFixed(1)}%)`;
        }
        
        // 討伐報告ボタンの状態を更新 
        const reportBtn = card.querySelector('.report-btn');
        if (repopData.timeRemaining === 'POP中') {
            if (reportBtn) {
                reportBtn.disabled = true;
                reportBtn.innerHTML = `<span class="text-sm font-bold">POP中</span><span class="text-xs">(報告不可)</span>`;
                reportBtn.classList.remove('bg-green-600', 'hover:bg-green-500', 'active:bg-green-700');
                reportBtn.classList.add('bg-gray-500', 'cursor-not-allowed');
            }
        } else {
            if (reportBtn) {
                reportBtn.disabled = false;
                reportBtn.innerHTML = `<span class="text-sm font-bold">討伐</span><span class="text-sm font-bold">報告</span>`;
                reportBtn.classList.remove('bg-gray-500', 'cursor-not-allowed');
                reportBtn.classList.add('bg-green-600', 'hover:bg-green-500', 'active:bg-green-700');
            }
        }
    });
}


/**
 * サイトの初期化処理
 */
function initializeApp() {
    userId = localStorage.getItem('user_uuid');
    if (!userId) {
        userId = crypto.randomUUID();
        localStorage.setItem('user_uuid', userId);
    }

    // --- 防御的チェックとイベントリスナーの設定 ---
    if (rankTabs) {
        rankTabs.querySelectorAll('.tab-btn').forEach(button => {
            button.onclick = (e) => renderMobList(e.currentTarget.dataset.rank);
        });
    }

    if (cancelReportBtn) {
        cancelReportBtn.onclick = closeReportModal;
    }
    
    if (submitReportBtn) {
        submitReportBtn.onclick = submitReport;
    }

    if (reportModal) {
        reportModal.addEventListener('click', (e) => {
            if (e.target.id === 'report-modal') {
                closeReportModal();
            }
        });
    }
    // ------------------------------------------

    fetchRecordsAndUpdate(true);

    setInterval(() => fetchRecordsAndUpdate(false), 10 * 60 * 1000);

    setInterval(updateProgressBars, 60 * 1000);
}

document.addEventListener('DOMContentLoaded', initializeApp);
