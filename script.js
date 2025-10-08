// Google Apps Script (GAS) のエンドポイントURL
// ユーザーから提供された正確なURLを設定 (大文字小文字を区別)
const GAS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbyuTg_uO7ZnxPGz1eun3kUKjni5oLj-UpfH4g1N0wQmzB57KhBWFnAvcSQYlbNcUelT3g/exec';
// 静的モブデータ (mob_data.json) のURL (同階層のファイルを参照)
const MOB_DATA_URL = './mob_data.json'; 


// --- グローバル変数 ---
let baseMobData = [];
let globalMobData = [];
let currentFilter = 'ALL';
let currentMobNo = null;
let userId = null;
// NEW: 自動更新が成功した回数を追跡するためのカウンター
let autoUpdateSuccessCount = 0; 

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
 * ミリ秒を HHh MMm 形式に変換し、接頭辞を付けます。
 * **秒は含まない**
 * @param {number} ms - ミリ秒
 * @param {string} prefix - 接頭辞 ('+' for Max Overdue)
 * @returns {string} - フォーマットされた時間文字列 (秒は含まない)
 */
function formatDurationPart(ms, prefix = '') {
    // Math.max(0, ...) で負の値を防ぐ
    const totalMilliseconds = Math.max(0, ms); 
    // 秒を切り捨てて分単位で計算
    const totalMinutes = Math.floor(totalMilliseconds / 60000); 
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    
    // "03h 01m" 形式
    return `${prefix}${formattedHours}h ${formattedMinutes}m`; 
}


/**
 * テキストを // で改行する関数
 */
const processText = (text) => {
    // 既存の // を <br> に変換するのみ
    return text.replace(/\/\/\s*/g, '<br>');
};

/**
 * ローカル日時 (ISO形式) をJSTとしてGASに渡すためのISO文字列に変換する
 */
function toJstAdjustedIsoString(localIsoString) {
    const localDate = new Date(localIsoString);
    const jstOffsetMinutes = -540; 
    const localOffsetMinutes = localDate.getTimezoneOffset();
    const offsetDifference = localOffsetMinutes - jstOffsetMinutes;
    
    const adjustedDate = new Date(localDate.getTime() + offsetDifference * 60000);
    
    return adjustedDate.toISOString();
}

/**
 * エラーメッセージを指定エリアに表示/非表示にする
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
 */
function calculateRepop(mob, lastKill) {
    const killTime = (lastKill instanceof Date) ? lastKill : new Date(lastKill);
    
    const isUnknown = !lastKill || isNaN(killTime.getTime());
    
    const repopMinMs = mob['REPOP(s)'] * 1000;
    const repopMaxMs = mob['MAX(s)'] * 1000; // Max Repop Duration from Kill
    const popDurationMs = repopMaxMs - repopMinMs; // Duration of the POP Window

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
            // --- Phase 1: Pre-Min Repop (Countdown Phase) ---
            isPop = false; 
            
            // Min POPまでの残り時間
            timeRemainingStr = formatDurationPart(remainingMsToMin);
            elapsedPercent = 0; 
            
        } else {
            // --- Phase 2 & 3: In or After POP Window ---
            isPop = true;
            
            const remainingMsToMax = maxRepopTime.getTime() - now.getTime();
            
            if (remainingMsToMax > 0) {
                // --- Phase 2: In POP Window ---
                isMaxOver = false;
                
                const elapsedInWindowMs = now.getTime() - minRepopTime.getTime();
                
                // POPウィンドウ内の経過率 (0% to 100%)
                elapsedPercent = Math.max(0, Math.min(100, (elapsedInWindowMs / popDurationMs) * 100));

                // Max POPまでの残り時間
                timeRemainingStr = formatDurationPart(remainingMsToMax);
                
            } else {
                // --- Phase 3: Max Repop Exceeded ---
                isMaxOver = true;
                
                const popElapsedMs = now.getTime() - maxRepopTime.getTime();
                
                // Max POP超過時間 (+HHh MMm)
                const formattedElapsed = formatDurationPart(popElapsedMs, '+');
                
                timeRemainingStr = formattedElapsed;
                elapsedPercent = 100; 
            }
        }
    }
    
    // 【修正点】: minRepopTime を常に返します（リポップ時刻表示が最短POP時刻になる）。
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
 * Mobデータに基づいてHTMLカードを生成する
 */
function createMobCard(mob) {
    const lastKillDate = mob.LastKillDate ? new Date(mob.LastKillDate) : null;
    const { minRepop, timeRemaining, elapsedPercent, isPop, isMaxOver, isUnknown } = calculateRepop(mob, lastKillDate);
    
    // ------------------------------------------------
    // ランク判定と共通設定
    // ------------------------------------------------
    const isS_A_FATE = ['S', 'A', 'F'].includes(mob.Rank);
    const isS = mob.Rank === 'S';
    
    // ランクアイコンの背景色
    let rankBgClass;
    let rankTextColor = 'text-white';
    switch (mob.Rank) {
        case 'S': rankBgClass = 'bg-red-600'; break;
        case 'A': rankBgClass = 'bg-blue-600'; break;
        case 'B': rankBgClass = 'bg-gray-600'; break;
        case 'F': rankBgClass = 'bg-purple-600'; break;
        default: rankBgClass = 'bg-gray-600';
    }

    // 討伐報告ボタン
    const reportBtnClass = 'bg-green-600 hover:bg-green-500 active:bg-green-700 report-btn'; 
    const reportBtnHtml = `
        <button class="${reportBtnClass} text-white px-1 py-1 rounded-md shadow-md transition h-10 w-10 flex flex-col items-center justify-center leading-none" 
                data-mobno="${mob['No.']}" type="button">
            <span class="text-xs font-bold">報告</span><span class="text-xs font-bold">する</span>
        </button>
    `;
    
    // ------------------------------------------------
    // 展開パネル - 前回討伐 / 開始時間 / 抽選条件
    // ------------------------------------------------
    
    // 前回討伐（全ランク共通）
    let lastKillHtml = '';
    if (lastKillDate && !isNaN(lastKillDate.getTime())) {
        
        // POP中のS, A, FATEモブは行間を詰めるスタイルを適用
        const useCompactStyle = isS_A_FATE && isPop; 
        
        // 前回討伐の下に1行分のスペースを入れるのは、コンパクトスタイルを使用する場合のみ
        const lastKillBottomSpace = useCompactStyle ? '<div class="pt-4"></div>' : ''; 
        const lastKillPadding = useCompactStyle ? 'pb-0 mb-0' : 'pb-4'; 
        
        // 開始時間と前回討伐をグレーテキストに統一
        const killDateClass = useCompactStyle ? 'text-gray-400' : 'text-gray-200';
        
        lastKillHtml = `
            <div class="px-4 pt-1 ${lastKillPadding} last-kill-content">
                <p class="text-sm font-semibold text-gray-400">
                    前回討伐: <span class="text-base ${killDateClass} font-mono">${lastKillDate.toLocaleString()}</span>
                </p>
                ${lastKillBottomSpace}
            </div>
        `;
    }

    // 開始時間 (S, A, FATEモブがPOP中の場合のみ表示)
    let startTimeHtml = '';
    if (isS_A_FATE && isPop) {
        const startTimeStr = minRepop instanceof Date ? minRepop.toLocaleString() : 'N/A';
        // 前回討伐との行間を詰めるため、上と下のパディングを極小に
        startTimeHtml = `
            <div class="px-4 pt-1 pb-0 my-0 start-time-content">
                <p class="text-sm font-semibold text-gray-400">
                    開始時間: <span class="text-base text-gray-400 font-mono">${startTimeStr}</span>
                </p>
            </div>
        `;
    }

    // 抽選条件
    let conditionHtml = '';
    if (mob.Condition) {
        // SモブのPOP中、または A/FATEのPOP中は、行間を詰めるため下のパディングは極小
        const conditionPadding = (isS_A_FATE && isPop) ? 'pb-1' : 'pb-4'; 
        conditionHtml = `
            <div class="px-4 pt-1 ${conditionPadding} condition-content">
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

    // 展開パネルの順序
    let panelContent = '';
    if (isS_A_FATE && isPop) {
        // S, A, FATEがPOP中: 抽選条件 -> 開始時間 -> 前回討伐 -> マップ
        panelContent = conditionHtml + startTimeHtml + lastKillHtml + mapDetailsHtml;
    } else {
        // それ以外: 前回討伐 -> 抽選条件 -> マップ (通常の順序)
        panelContent = lastKillHtml + conditionHtml + mapDetailsHtml;
    }


    let expandablePanel = '';
    if (panelContent.trim()) {
        expandablePanel = `
            <div class="expandable-panel overflow-hidden transition-all duration-300 ease-in-out max-h-0">
                ${panelContent}
            </div>
        `;
    }

    // ------------------------------------------------
    // メインカード - リポップ時間表示の修正 (1行表示に統一)
    // ------------------------------------------------
    
    const timeRemainingContainerClass = 'bg-gray-700 p-2 rounded-xl shadow-inner relative overflow-hidden';
    
    let timeRemainingDisplay;
    
    // POP後の表示: HHh MMm (%) を表示
    if (isPop) {
        const percentText = isMaxOver ? '最大超過' : `${elapsedPercent.toFixed(1)}%`;
        const timeColorClass = isMaxOver ? 'text-red-700' : 'text-gray-200';
        timeRemainingDisplay = `
            <div class="flex justify-between items-baseline relative z-10 font-mono progress-container">
                <span class="text-gray-300 w-24 flex-shrink-0 text-base">残り (%):</span> 
                <span class="text-base ${timeColorClass} font-bold time-remaining">${timeRemaining} (${percentText})</span>
            </div>
        `;
    } else {
        // POP前の表示: Min POP までの最短時間を表示 (プログレスバーは非表示)
        const timeColorClass = isUnknown ? 'text-gray-400' : 'text-green-400';
        timeRemainingDisplay = `
            <div class="flex justify-between items-baseline relative z-10 font-mono progress-container">
                <span class="text-gray-300 w-24 flex-shrink-0 text-base">最短POP:</span>
                <span class="text-base ${timeColorClass} font-bold time-remaining">${timeRemaining}</span>
            </div>
        `;
    }


    return `
        <div class="mob-card bg-gray-800 rounded-xl shadow-2xl overflow-hidden transform hover:scale-[1.01] transition duration-300 relative" 
             data-rank="${mob.Rank}" 
             data-mobno="${mob['No.']}"
             data-lastkill="${mob.LastKillDate || ''}"
             data-minrepop="${mob['REPOP(s)']}"
             data-maxrepop="${mob['MAX(s)']}">

            <div class="p-3 fixed-content toggle-handler cursor-pointer">
                <div class="flex justify-between items-start mb-3">
                    <div class="flex items-center space-x-3">
                        <div class="rank-icon ${rankBgClass} ${rankTextColor} font-bold text-sm w-7 h-7 flex items-center justify-center rounded-lg shadow-lg">
                            ${mob.Rank}
                        </div>
                        <div class="min-w-0 flex-1"> 
                            <h2 class="text-lg font-bold text-outline text-yellow-200 leading-tight truncate">${mob.Name}</h2>
                            <p class="text-xs text-gray-400 leading-tight truncate">${mob.Area}</p>
                        </div>
                    </div>
                    ${reportBtnHtml}
                </div>

                <div class="mt-2 ${timeRemainingContainerClass}">
                    ${timeRemainingDisplay}

                    <div class="progress-bar absolute inset-0 transition-all duration-100 ease-linear rounded-xl" style="width: 0%; z-index: 0;"></div>
                </div>
            </div>

            ${expandablePanel}
        </div>
    `;
}

/**
 * フィルターに基づいてモブカードリストをレンダリングする (変更なし)
 */
function renderMobList(rank) {
    currentFilter = rank;

    const filteredMobs = rank === 'ALL' 
        ? globalMobData
        : globalMobData.filter(mob => mob.Rank === rank);

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
 * イベントリスナーをカードとボタンにアタッチする (変更なし)
 */
function attachEventListeners() {
    document.querySelectorAll('.report-btn').forEach(button => {
        if (button.dataset.mobno) {
            button.onclick = (e) => {
                e.stopPropagation();
                openReportModal(e.currentTarget.dataset.mobno);
            }
        }
    });
    
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
 * マップ詳細パネルの表示/非表示を切り替える (変更なし)
 */
function toggleMobDetails(card) {
    const mobNo = card.dataset.mobno;
    const mob = getMobByNo(parseInt(mobNo));
    const panel = card.querySelector('.expandable-panel');

    if (!panel) return;

    panel.style.transition = 'max-height 0.3s ease-in-out';
    
    if (card.classList.contains('open')) {
        panel.style.maxHeight = '0';
        card.classList.remove('open');
    } else {
        card.classList.add('open');
        
        const mapOverlay = panel.querySelector('.map-overlay');
        if (mapOverlay && mob.spawn_points) {
            const baseMob = baseMobData.find(m => m['No.'] === parseInt(mobNo)); 
            if (baseMob && baseMob.spawn_points) {
                drawSpawnPoints(mapOverlay, baseMob.spawn_points, mobNo);
            }
        }
        
        panel.style.maxHeight = 'none'; 
        const targetHeight = panel.scrollHeight; 

        panel.style.maxHeight = '0';
        
        setTimeout(() => {
            panel.style.maxHeight = (targetHeight + 20) + 'px'; 

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
 * マップにスポーンポイントを描画する (変更なし: 見た目変更のロジックを削除済みの状態を維持)
 */
function drawSpawnPoints(overlayEl, spawnPoints, currentMobNo) {
    overlayEl.innerHTML = '';
    const mob = getMobByNo(parseInt(currentMobNo));
    
    if (!mob || !mob.cullStatusMap) return;

    // --- ポイントの色定義 ---
    const pointBorderWidth = '2px'; 
    
    spawnPoints.forEach(point => {
        const isS_A_Point = point.mob_ranks.includes('S') || point.mob_ranks.includes('A');
        const includesB1 = point.mob_ranks.includes('B1');
        const includesB2 = point.mob_ranks.includes('B2');
        
        const isCulled = mob.cullStatusMap[point.id] || false; 

        let outlineColor = '#9ca3af'; 
        let internalColor = '#d1d5db'; 

        if (includesB1) {
            outlineColor = '#3b82f6'; 
            internalColor = '#60a5fa'; 
        } else if (includesB2) {
            outlineColor = '#ef4444'; 
            internalColor = '#f87171'; 
        } else {
            outlineColor = '#fbbf24'; 
            internalColor = '#fcd34d'; 
        }

        const pointEl = document.createElement('div');
        pointEl.className = `spawn-point transition-transform duration-100 cursor-pointer`; 
        pointEl.setAttribute('data-id', point.id);
        pointEl.setAttribute('data-isculltarget', isS_A_Point ? 'true' : 'false');
        
        pointEl.style.left = `${point.x}%`;
        pointEl.style.top = `${point.y}%`;
        
        pointEl.style.border = `${pointBorderWidth} solid ${outlineColor}`;
        pointEl.style.backgroundColor = internalColor;
        pointEl.style.boxShadow = `0 0 5px 1px ${outlineColor}`; 

        if (!isS_A_Point) {
            pointEl.style.width = '6px';
            pointEl.style.height = '6px';
            pointEl.style.opacity = '0.7';
            pointEl.style.boxShadow = 'none';
            pointEl.style.pointerEvents = 'none'; 
            pointEl.style.transition = 'none';
            pointEl.onmouseover = null;
            pointEl.onmouseout = null;
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
 * 湧き潰し状態をGAS経由で切り替える (変更なし)
 */
async function toggleCullStatus(mobNo, pointId, newStatus) {
    const mob = getMobByNo(mobNo);
    if (!mob) return;
    
    mob.cullStatusMap[pointId] = newStatus;
    
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


// --- モーダル/フォーム操作 (変更なし) ---

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

function closeReportModal() {
    if (!reportModal) return;
    reportModal.classList.add('hidden');
    reportModal.classList.remove('flex');
    currentMobNo = null;
}

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
            
            await fetchRecordsAndUpdate('manual', false); 
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

async function fetchRecordsAndUpdate(updateType = 'initial', shouldFetchBase = true) {
    
    if (shouldFetchBase) {
        displayError(`設定データをロード中...`);
        await fetchBaseMobData();
    }
    
    if (baseMobData.length === 0) {
        const fatalError = `致命的なエラー: モブ設定データを読み込めませんでした。`;
        console.warn('Base mob data is empty, stopping record update.');
        displayError(fatalError);
        return;
    }

    const oldGlobalMobData = globalMobData; 
    globalMobData = [...baseMobData];
    renderMobList(currentFilter);
    
    let shouldDisplayLoading = false;
    if (updateType === 'initial' || updateType === 'manual' || autoUpdateSuccessCount === 0) {
        shouldDisplayLoading = true;
    }

    if (shouldDisplayLoading) {
        displayError(`討伐記録と湧き潰し状態を更新中...`);
    } 

    try {
        const response = await fetch(GAS_ENDPOINT + '?action=getRecords');
        const data = await response.json();
        
        if (data.status === 'success') {
            
            displayError(null); 
            
            const records = data.records;
            const cullStatuses = data.cullStatuses || []; 
            
            globalMobData = baseMobData.map(mob => {
                const mobNo = mob['No.']; 
                const record = records.find(r => r['No.'] === mobNo);
                const oldMob = oldGlobalMobData.find(m => m['No.'] === mobNo) || {};
                const newMob = { ...mob }; 
                
                newMob.cullStatusMap = {}; 
                
                let isKillUpdated = false;

                if (record && record.POP_Date_Unix) {
                    const newKillDate = unixTimeToDate(record.POP_Date_Unix).toLocaleString();
                    newMob.LastKillDate = newKillDate;
                    if (newKillDate !== oldMob.LastKillDate) {
                        isKillUpdated = true;
                    }
                } else {
                    newMob.LastKillDate = ''; 
                }

                if (mob.Rank === 'S' && isKillUpdated) {
                    newMob.cullStatusMap = {}; 
                } else {
                    cullStatuses
                        .filter(status => status.Mob_No === mobNo) 
                        .forEach(status => {
                            if (!isKillUpdated || mob.Rank !== 'S') { 
                                newMob.cullStatusMap[status.Point_ID] = status.Is_Culled === 'TRUE';
                            }
                        });
                }

                return newMob;
            });
            console.log('Kill and cull statuses merged successfully.');

            if (updateType === 'auto') {
                autoUpdateSuccessCount++;
            }
            
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
    const ORANGE_BAR_COLOR_CLASS = 'bg-orange-400';
    const MAX_OVER_TEXT_COLOR_CLASS = 'text-red-700'; 
    
    document.querySelectorAll('.mob-card').forEach(card => {
        const lastKillStr = card.dataset.lastkill;
        const repop = parseInt(card.dataset.minrepop);
        const max = parseInt(card.dataset.maxrepop);
        
        const lastKillDate = lastKillStr ? new Date(lastKillStr) : null;
        
        const mobStub = {"REPOP(s)": repop, "MAX(s)": max};
        const repopData = calculateRepop(mobStub, lastKillDate);
        const percent = repopData.elapsedPercent || 0; 

        // timeRemainingEl は進捗バーコンテナ内の .time-remaining 要素
        const timeRemainingEl = card.querySelector('.time-remaining'); 
        const progressBarEl = card.querySelector('.progress-bar');
        
        // --- 1. POP後の表示テキストの更新 ---
        if (timeRemainingEl) {
            timeRemainingEl.classList.remove('text-gray-200', 'text-green-400', 'text-red-700', 'font-bold');
            timeRemainingEl.classList.add('font-mono'); 

            if (repopData.isPop) {
                // POP後: HHh MMm (%) または (最大超過)
                const percentText = repopData.isMaxOver ? '最大超過' : `${percent.toFixed(1)}%`;
                
                timeRemainingEl.textContent = `${repopData.timeRemaining} (${percentText})`;
                
                if (repopData.isMaxOver) {
                    timeRemainingEl.classList.add(MAX_OVER_TEXT_COLOR_CLASS);
                } else {
                    timeRemainingEl.classList.add('text-gray-200', 'font-bold');
                }
            } else {
                // POP前: 最短POPまでの残り時間のみ
                timeRemainingEl.textContent = repopData.timeRemaining;
                if (repopData.isUnknown) {
                    timeRemainingEl.classList.add('text-gray-400');
                } else {
                    timeRemainingEl.classList.add('text-green-400', 'font-bold');
                }
            }
        }
        
        // --- 2. プログレスバーの更新ロジック ---
        if (progressBarEl) {
            let barColorClass = '';
            let widthPercent = Math.min(100, percent); 

            // POP前はバー非表示
            if (!repopData.isPop || repopData.isUnknown) {
                widthPercent = 0;
                progressBarEl.classList.remove('animate-pulse');
            } else if (repopData.isMaxOver) {
                barColorClass = ORANGE_BAR_COLOR_CLASS; 
                widthPercent = 100;
                progressBarEl.classList.add('animate-pulse');
            } else if (percent >= 80) {
                barColorClass = ORANGE_BAR_COLOR_CLASS; 
                progressBarEl.classList.remove('animate-pulse');
            } else if (percent >= 60) {
                barColorClass = 'bg-yellow-400'; 
                progressBarEl.classList.remove('animate-pulse');
            } else {
                barColorClass = 'bg-lime-500'; 
                progressBarEl.classList.remove('animate-pulse');
            }
            
            progressBarEl.className = `progress-bar absolute inset-0 transition-all duration-100 ease-linear ${barColorClass} rounded-xl`;
            progressBarEl.style.width = `${widthPercent}%`;
        }

        // --- 3. 討伐報告ボタンの状態を更新 (常に有効) ---
        const reportBtn = card.querySelector('button[data-mobno]');
        if (reportBtn) {
            reportBtn.disabled = false;
            reportBtn.classList.remove('bg-gray-500', 'cursor-not-allowed');
            reportBtn.classList.add('bg-green-600', 'hover:bg-green-500', 'active:bg-green-700'); 
        }
    });
}


/**
 * サイトの初期化処理 (変更なし)
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

    fetchRecordsAndUpdate('initial', true);

    setInterval(() => fetchRecordsAndUpdate('auto', false), 10 * 60 * 1000);

    setInterval(updateProgressBars, 1000);
}

document.addEventListener('DOMContentLoaded', initializeApp);
