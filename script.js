// Google Apps Script (GAS) のエンドポイントURL
const GAS_ENDPOINT = 'YOUR_GAS_ENDPOINT_URL_HERE'; // ユーザーが設定する必要がある
// 静的モブデータ (mob_data.json) のURL
const MOB_DATA_URL = './mob_data.json'; 


// --- グローバル変数 ---
let baseMobData = [];
let globalMobData = [];
let currentFilter = 'ALL';
let currentMobNo = null;
let userId = null;

// --- DOMエレメント ---
const appEl = document.getElementById('app');
const errorMessageContainer = document.getElementById('error-message-container');
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
 * ミリ秒を HH:MM:SS 形式に変換する
 */
function formatDuration(ms) {
    const totalSeconds = Math.floor(Math.abs(ms) / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    const sign = ms < 0 ? '+' : ''; // 超過時間には '+' を付ける
    
    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');
    
    return `${sign}${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}


/**
 * テキストを // で改行する関数
 */
const processText = (text) => {
    return text.replace(/\/\/\s*/g, '<br>');
};

/**
 * ローカル日時 (ISO形式) をJSTとしてGASに渡すためのISO文字列に変換する
 */
function toJstAdjustedIsoString(localIsoString) {
    const localDate = new Date(localIsoString);
    const jstOffsetMinutes = -540; // JSTはUTC+9:00なので -540分
    const localOffsetMinutes = localDate.getTimezoneZoneOffset();
    const offsetDifference = localOffsetMinutes - jstOffsetMinutes;
    
    const adjustedDate = new Date(localDate.getTime() + offsetDifference * 60000);
    
    return adjustedDate.toISOString();
}

/**
 * エラーメッセージを指定エリアに表示/非表示にする
 * @param {string|null} message - 表示するエラーメッセージ、または null で非表示。
 */
function displayError(message) {
    if (!errorMessageContainer) return;
    
    const baseClasses = ['p-2', 'text-sm', 'font-semibold', 'text-center'];
    const errorClasses = ['bg-red-800', 'text-red-100', 'rounded-lg'];
    
    if (message) {
        errorMessageContainer.classList.remove('hidden');
        errorMessageContainer.classList.add(...baseClasses, ...errorClasses);
        errorMessageContainer.innerHTML = `
            <div>
                ${message}
            </div>
        `;
    } else {
        errorMessageContainer.classList.add('hidden');
        errorMessageContainer.classList.remove(...baseClasses, ...errorClasses);
        errorMessageContainer.innerHTML = '';
    }
}


/**
 * 討伐日時からリポップ情報を計算する
 * * @returns {object} {minRepop, maxRepop, timeRemaining, elapsedPercent, isPop, isMaxOver, isUnknown}
 */
function calculateRepop(mob, lastKill) {
    const killTime = (lastKill instanceof Date) ? lastKill : new Date(lastKill);
    
    const isUnknown = !lastKill || isNaN(killTime.getTime());
    
    const repopMinMs = mob['REPOP(s)'] * 1000;
    const repopMaxMs = mob['MAX(s)'] * 1000;
    const popDurationMs = repopMaxMs - repopMinMs;

    let minRepopTime;
    let maxRepopTime;
    let timeRemainingStr; 
    let elapsedPercent = 0; 
    let isPop = false; 
    let isMaxOver = false; 

    if (repopMinMs <= 0 || repopMaxMs <= repopMinMs) {
        return {
            minRepop: 'N/A', 
            maxRepop: 'N/A',
            timeRemaining: 'N/A',
            elapsedPercent: 0,
            isPop: false,
            isMaxOver: false,
            isUnknown: true 
        };
    }
    
    const now = new Date();

    if (isUnknown) {
        minRepopTime = new Date(now.getTime() + repopMinMs); 
        timeRemainingStr = 'データなし';
        isPop = false; 
        elapsedPercent = 0;
    } else {
        minRepopTime = new Date(killTime.getTime() + repopMinMs);
        maxRepopTime = new Date(killTime.getTime() + repopMaxMs);

        const remainingMsToMin = minRepopTime.getTime() - now.getTime();
        
        if (remainingMsToMin > 0) {
            // Phase 1: Pre-Min Repop
            isPop = false; 
            timeRemainingStr = formatDuration(remainingMsToMin);
            elapsedPercent = 0;
            
        } else {
            // Phase 2 & 3: In or After POP Window
            isPop = true;
            
            const remainingMsToMax = maxRepopTime.getTime() - now.getTime();
            
            if (remainingMsToMax > 0) {
                // Phase 2: In POP Window
                isMaxOver = false;
                
                const elapsedInWindowMs = now.getTime() - minRepopTime.getTime();
                elapsedPercent = Math.max(0, Math.min(100, (elapsedInWindowMs / popDurationMs) * 100));

                timeRemainingStr = formatDuration(remainingMsToMax);
                
            } else {
                // Phase 3: Max Repop Exceeded
                isMaxOver = true;
                
                const popElapsedMs = now.getTime() - maxRepopTime.getTime();
                timeRemainingStr = formatDuration(-popElapsedMs); // マイナスを渡して '+' 記号を出力
                elapsedPercent = 100;
            }
        }
    }

    return {
        minRepop: minRepopTime,
        maxRepop: maxRepopTime, 
        timeRemaining: timeRemainingStr,
        elapsedPercent: elapsedPercent,
        isPop: isPop,
        isMaxOver: isMaxOver, 
        isUnknown: isUnknown
    };
}

/**
 * MobNoからモブデータを取得する
 */
function getMobByNo(mobNo) {
    return globalMobData.find(mob => mob.No === parseInt(mobNo));
}

// --- DOM操作/イベントハンドラ ---

/**
 * モブデータに基づいてHTMLカードを生成する
 */
function createMobCard(mob) {
    const lastKillDate = mob.LastKillDate ? new Date(mob.LastKillDate) : null;
    const { minRepop, timeRemaining, elapsedPercent, isPop, isMaxOver, isUnknown } = calculateRepop(mob, lastKillDate);

    let minPopColorClass = 'text-green-400';
    let minPopStr;
    if (minRepop instanceof Date) {
        minPopStr = minRepop.toLocaleString();
    } else {
        minPopStr = 'N/A';
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

    // 討伐報告ボタンの機能と状態の分離。
    const reportBtnClass = 'bg-green-600 hover:bg-green-500 active:bg-green-700 report-btn';
    const reportBtnContent = `報告`;

    const reportBtnHtml = `
        <button class="${reportBtnClass} text-white px-3 py-1 rounded-md shadow-md transition" 
                data-mobno="${mob['No.']}" type="button">
            ${reportBtnContent}
        </button>
    `;
    
    // 前回討伐
    let lastKillHtml = '';
    if (lastKillDate && !isNaN(lastKillDate.getTime())) {
        lastKillHtml = `
            <div class="px-4 pt-2 pb-4 last-kill-content">
                <p class="text-sm font-semibold text-gray-400">前回討伐: <span class="text-base text-gray-200">${lastKillDate.toLocaleString()}</span></p>
            </div>
        `;
    }

    // 抽選条件
    let conditionHtml = '';
    if (mob.Condition) {
        conditionHtml = `
            <div class="px-4 pt-1 pb-4 condition-content">
                <p class="text-sm text-white leading-snug">${processText(mob.Condition)}</p>
            </div>
        `;
    }
    
    // マップ詳細
    let mapDetailsHtml = '';
    if (mob.Map) {
        mapDetailsHtml = `
            <div class="mob-details pt-1 px-4 pb-4 map-content">
                <div class="relative">
                    <img src="./maps/${mob.Map}" alt="${mob.Area} Map" class="w-full h-auto rounded-lg shadow-md map-image" data-area="${mob.Area}">
                    <div class="absolute inset-0 map-overlay" data-area="${mob.Area}">
                        </div>
                </div>
            </div>
        `;
    }
    
    // パネルコンテンツのデフォルト順序
    let panelContent = lastKillHtml + conditionHtml + mapDetailsHtml;
    
    let expandablePanel = '';
    if (panelContent.trim()) {
        expandablePanel = `
            <div class="expandable-panel overflow-hidden transition-all duration-300 ease-in-out max-h-0">
                ${panelContent}
            </div>
        `;
    }

    // --- カード全体 ---

    const remainingTimeContainerClass = !isPop || isUnknown ? 'hidden' : '';


    return `
        <div class="mob-card bg-gray-800 rounded-xl shadow-2xl overflow-hidden transform hover:scale-[1.01] transition duration-300 relative" 
             data-rank="${mob.Rank}" 
             data-mobno="${mob['No.']}"
             data-lastkill="${mob.LastKillDate || ''}"
             data-minrepop="${mob['REPOP(s)']}"
             data-maxrepop="${mob.MAX(s)}">

            <div class="p-3 fixed-content toggle-handler cursor-pointer">
                <div class="flex justify-between items-start mb-3">
                    <div class="flex items-center space-x-3">
                        <div class="rank-icon ${rankBgClass} ${rankTextColor} font-bold text-sm w-7 h-7 flex items-center justify-center rounded-lg shadow-lg">
                            ${mob.Rank}
                        </div>
                        <div class="flex-1"> 
                            <h2 class="text-lg font-bold text-outline text-yellow-200 leading-tight">${mob.Name}</h2>
                            <p class="text-xs text-gray-400 leading-tight">${mob.Area}</p>
                        </div>
                    </div>
                    
                    ${reportBtnHtml}
                </div>

                <div class="mt-2 bg-gray-700 p-2 rounded-xl text-xs flex flex-col space-y-1 relative overflow-hidden shadow-inner">
                    <div class="flex justify-between items-baseline relative z-10">
                        <span class="text-gray-300 w-24 flex-shrink-0 text-base">次回POP:</span>
                        <span class="repop-time text-base ${minPopColorClass} font-bold">${minPopStr}</span>
                    </div>
                    
                    <div class="progress-container ${remainingTimeContainerClass} flex justify-between relative z-10">
                        <span class="text-gray-300 w-24 flex-shrink-0 text-base">残り (%):</span> 
                        <span class="text-gray-200 time-remaining text-base">${timeRemaining} (${elapsedPercent.toFixed(1)}%)</span>
                    </div>

                    <div class="progress-bar absolute inset-0 transition-all duration-100 ease-linear rounded-xl" style="width: 0%; z-index: 0;"></div>
            </div>
            </div>

            ${expandablePanel}
        </div>
    `;
}

/**
 * フィルターに基づいてモブカードリストをレンダリングする
 */
function renderMobList(rank) {
    currentFilter = rank;

    const filteredMobs = rank === 'ALL' 
        ? globalMobData
        : globalMobData.filter(mob => mob.Rank === rank);

    // 3カラムレイアウト
    const columns = [
        document.getElementById('column-1'),
        document.getElementById('column-2'),
        document.getElementById('column-3')
    ].filter(col => col); 

    columns.forEach(col => col.innerHTML = '');

    if (columns.length === 0) {
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
        if (button.dataset.mobno) {
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

    if (!panel) return;

    panel.style.transition = 'max-height 0.3s ease-in-out';
    
    if (card.classList.contains('open')) {
        // 閉じる処理
        panel.style.maxHeight = '0';
        card.classList.remove('open');
    } else {
        // 開く処理
        card.classList.add('open');
        
        // 1. スポーンポイントの描画
        const mapOverlay = panel.querySelector('.map-overlay');
        if (mapOverlay && mob.spawn_points) {
            const baseMob = baseMobData.find(m => m['No.'] === parseInt(mobNo)); 
            if (baseMob && baseMob.spawn_points) {
                drawSpawnPoints(mapOverlay, baseMob.spawn_points, mobNo);
            }
        }
        
        // 2. 瞬時に max-height を解除し、コンテンツの最終的な高さを取得
        panel.style.maxHeight = 'none'; 
        const targetHeight = panel.scrollHeight; 

        // 3. max-heightを 0 に設定し、アニメーションの開始点に戻す
        panel.style.maxHeight = '0';
        
        // 4. 取得した高さに安全マージンを加えてアニメーションを開始
        setTimeout(() => {
            panel.style.maxHeight = (targetHeight + 20) + 'px'; 

            // 5. アニメーション終了後に max-height: none に設定
            panel.addEventListener('transitionend', function handler(e) {
                if (e.propertyName === 'max-height' && card.classList.contains('open')) {
                    panel.style.maxHeight = 'none';
                }
                panel.removeEventListener('transitionend', handler);
            });

        }, 0); 
    }
}

/**
 * マップにスポーンポイントを描画する
 */
function drawSpawnPoints(overlayEl, spawnPoints, currentMobNo) {
    overlayEl.innerHTML = '';
    const mob = getMobByNo(parseInt(currentMobNo));
    
    if (!mob || !mob.cullStatusMap) return;

    spawnPoints.forEach(point => {
        const isS_A_Point = point.mob_ranks.includes('S') || point.mob_ranks.includes('A');
        const isCulled = mob.cullStatusMap[point.id] || false; 

        let pointColor = isS_A_Point ? (isCulled ? 'bg-green-500' : 'bg-yellow-500') : 'bg-gray-500';

        const pointEl = document.createElement('div');
        pointEl.className = `spawn-point ${pointColor} w-3 h-3 rounded-full absolute transition-transform duration-100 cursor-pointer`; 
        pointEl.setAttribute('data-id', point.id);
        pointEl.setAttribute('data-isculltarget', isS_A_Point ? 'true' : 'false');
        
        pointEl.style.left = `${point.x}%`;
        pointEl.style.top = `${point.y}%`;

        // Bランク専用ポイントはクリック不可
        if (!isS_A_Point) {
            pointEl.style.pointerEvents = 'none'; 
        } else {
            pointEl.onclick = (e) => {
                e.stopPropagation(); 
                toggleCullStatus(mob['No.'], point.id, !isCulled);
            };
        }
        
        overlayEl.appendChild(pointEl);
    });
}

/**
 * 湧き潰し状態をGAS経由で切り替える
 */
async function toggleCullStatus(mobNo, pointId, newStatus) {
    const mob = getMobByNo(mobNo);
    if (!mob) return;
    
    mob.cullStatusMap[pointId] = newStatus;
    
    // UIを即座に更新（再描画）
    renderMobList(currentFilter);

    try {
        const response = await fetch(GAS_ENDPOINT, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                action: 'updateCullStatus', 
                mobNo: mobNo, 
                pointId: pointId,
                isCulled: newStatus ? 'TRUE' : 'FALSE',
                reporterId: userId 
            })
        });

        const result = await response.json();

        if (result.status === 'success') {
            console.log(`湧き潰し状態更新成功: ${pointId} to ${newStatus}`);
        } else {
            console.error(`湧き潰し状態更新失敗: ${result.message}`);
        }

    } catch (error) {
        console.error('湧き潰し通信エラー:', error);
    }
}


// --- モーダル/フォーム操作 ---

/**
 * 討伐報告モーダルを開く
 */
function openReportModal(mobNo) {
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

    const killTimeLocal = reportDatetimeInput.value;
    const memo = reportMemoInput.value;
    const mob = getMobByNo(currentMobNo); 
    
    if (!mob || !killTimeLocal) {
        console.error('討伐日時が未入力です。');
        return;
    }

    const killTimeJstIso = toJstAdjustedIsoString(killTimeLocal);

    submitReportBtn.disabled = true;
    submitReportBtn.textContent = '送信中...';
    reportStatusEl.classList.remove('hidden');
    reportStatusEl.classList.remove('text-green-500', 'text-red-500');
    reportStatusEl.textContent = 'サーバーに送信中...';
    
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
                rank: mob.Rank, 
                killTime: killTimeJstIso, 
                memo: memo,
                reporterId: userId 
            })
        });

        const result = await response.json();

        if (result.status === 'success') {
            reportStatusEl.textContent = `報告成功！ (${result.message})`;
            reportStatusEl.classList.add('text-green-500');
            displayError(null); 
            
            await fetchRecordsAndUpdate(); 
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
        submitReportBtn.textContent = '報告';
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
            baseMobData = jsonData.mobConfig.map(mob => ({
                ...mob,
                'No.': parseInt(mob['No.']) 
            }));
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
 * GASから最新の討伐記録と湧き潰し状態を取得し、グローバルデータを更新する
 */
async function fetchRecordsAndUpdate() {
    
    // 1. 基本データ (Base Mob Data) のロード
    if (baseMobData.length === 0) {
        displayError(`設定データをロード中...`);
        await fetchBaseMobData();
    }
    
    if (baseMobData.length === 0) {
        const fatalError = `致命的なエラー: モブ設定データを読み込めませんでした。`;
        console.warn('Base mob data is empty, stopping record update.');
        displayError(fatalError);
        return;
    }

    globalMobData = [...baseMobData];
    renderMobList(currentFilter);
    
    displayError(`討伐記録と湧き潰し状態を更新中...`);

    // 2. 討伐記録と湧き潰し状態の取得と更新
    try {
        const response = await fetch(GAS_ENDPOINT + '?action=getRecords');
        const data = await response.json();
        
        if (data.status === 'success') {
            
            displayError(null); 
            
            const records = data.records;
            const cullStatuses = data.cullStatuses || []; 
            
            // データをマージして globalMobData を再構築
            globalMobData = baseMobData.map(mob => {
                const mobNo = mob['No.']; 
                const record = records.find(r => r['No.'] === mobNo);
                const newMob = { ...mob }; 
                
                newMob.cullStatusMap = {}; 
                
                // 討伐記録の反映
                if (record && record.POP_Date_Unix) {
                    newMob.LastKillDate = unixTimeToDate(record.POP_Date_Unix).toLocaleString();
                } else {
                    newMob.LastKillDate = ''; 
                }

                // 湧き潰し状態を mob データに紐づける
                cullStatuses
                    .filter(status => status.Mob_No === mobNo) 
                    .forEach(status => {
                        newMob.cullStatusMap[status.Point_ID] = status.Is_Culled === 'TRUE';
                    });

                return newMob;
            });
            console.log('Kill and cull statuses merged successfully.');

            renderMobList(currentFilter);
        } else {
            const errorMessage = `エラー: 共有データの取得に失敗しました。 (${data.message})`;
            console.error('GASからのデータ取得失敗:', errorMessage);
            displayError(errorMessage);
        }
    } catch (error) {
        const errorMessage = `エラー: サーバーとの通信に失敗しました。`;
        console.error('GAS通信エラー:', error);
        displayError(errorMessage);
    }
}

/**
 * 各モブカードの進捗バーを更新する (1秒ごと)
 */
function updateProgressBars() {
    document.querySelectorAll('.mob-card').forEach(card => {
        const lastKillStr = card.dataset.lastkill;
        const repop = parseInt(card.dataset.minrepop);
        const max = parseInt(card.dataset.maxrepop);
        
        const lastKillDate = lastKillStr ? new Date(lastKillStr) : null;
        
        const mobStub = {"REPOP(s)": repop, "MAX(s)": max};
        const repopData = calculateRepop(mobStub, lastKillDate);
        const percent = repopData.elapsedPercent || 0; 

        const repopTimeEl = card.querySelector('.repop-time');
        const timeRemainingEl = card.querySelector('.time-remaining'); 
        const progressContainer = card.querySelector('.progress-container');
        const progressBarEl = card.querySelector('.progress-bar');
        
        // POPウィンドウ到達/超過判定とコンテナ表示切り替え
        if (repopData.isPop) {
            progressContainer?.classList.remove('hidden');
        } else {
            progressContainer?.classList.add('hidden');
        }

        // リポップ予測時刻の更新
        if (repopTimeEl) {
            let displayTimeStr;
            if (repopData.isUnknown) {
                 displayTimeStr = 'N/A';
            } else if (repopData.isPop) {
                 displayTimeStr = repopData.maxRepop instanceof Date ? repopData.maxRepop.toLocaleString() : 'N/A';
            } else {
                 displayTimeStr = repopData.minRepop instanceof Date ? repopData.minRepop.toLocaleString() : 'N/A';
            }
            repopTimeEl.textContent = displayTimeStr;
            
            repopTimeEl.classList.remove('text-green-400', 'text-amber-300', 'text-red-400');
            if (repopData.isMaxOver) {
                repopTimeEl.classList.add('text-red-400');
            } else if (repopData.isPop) {
                repopTimeEl.classList.add('text-amber-300');
            } else {
                repopTimeEl.classList.add('text-green-400');
            }
        }
        
        // 残り時間（進捗率）の更新
        if (repopData.isPop && timeRemainingEl) {
            if (repopData.isMaxOver) {
                timeRemainingEl.textContent = `${repopData.timeRemaining} (最大超過)`;
                timeRemainingEl.classList.add('text-red-500');
            } else {
                timeRemainingEl.textContent = `${repopData.timeRemaining} (${percent.toFixed(1)}%)`;
                timeRemainingEl.classList.remove('text-red-500');
                timeRemainingEl.classList.add('text-gray-200');
            }
        }
        
        // プログレスバーの更新ロジック
        if (progressBarEl) {
            let barColorClass = '';
            let widthPercent = Math.min(100, percent); 

            if (!repopData.isPop || repopData.isUnknown) {
                widthPercent = 0;
            } else if (repopData.isMaxOver) {
                barColorClass = 'bg-red-400'; 
                widthPercent = 100;
            } else if (percent >= 80) {
                barColorClass = 'bg-red-400';
            } else if (percent >= 60) {
                barColorClass = 'bg-yellow-400'; 
            } else {
                barColorClass = 'bg-lime-500'; 
            }
            
            progressBarEl.className = `progress-bar absolute inset-0 transition-all duration-100 ease-linear ${barColorClass} rounded-xl`;
            progressBarEl.style.width = `${widthPercent}%`;
        }

        // 討伐報告ボタンの状態を更新
        const reportBtn = card.querySelector('button[data-mobno]');
        if (reportBtn) {
            reportBtn.disabled = false;
            reportBtn.classList.remove('bg-gray-500', 'cursor-not-allowed');
            reportBtn.classList.add('bg-green-600', 'hover:bg-green-500', 'active:bg-green-700'); 
            reportBtn.textContent = '報告';
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

    if (rankTabs) {
        rankTabs.querySelectorAll('.tab-btn').forEach(button => {
            button.onclick = (e) => {
                renderMobList(e.currentTarget.dataset.rank);
            }
        });
    }

    if (cancelReportBtn) {
        cancelReportBtn.onclick = closeReportModal;
    }
    
    if (submitReportBtn) {
        const reportForm = submitReportBtn.closest('form');
        if (reportForm) {
            reportForm.addEventListener('submit', (e) => {
                e.preventDefault();
                submitReport();
            });
        } else {
            submitReportBtn.onclick = (e) => {
                e.preventDefault();
                submitReport();
            }
        }
    }

    if (reportModal) {
        reportModal.addEventListener('click', (e) => {
            if (e.target.id === 'report-modal') {
                closeReportModal();
            }
        });
    }

    fetchRecordsAndUpdate();

    // 討伐記録の定期更新 (10分ごと)
    setInterval(fetchRecordsAndUpdate, 10 * 60 * 1000);

    // プログレスバーの定期更新
    setInterval(updateProgressBars, 1000);
}

document.addEventListener('DOMContentLoaded', initializeApp);
