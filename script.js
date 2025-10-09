/* script.js (再修正 - 機能の維持と最新要件の追加) */

// Google Apps Script (GAS) のエンドポイントURL
const GAS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbyuTg_uO7ZnxPGz1eun3kUKjni5oLj-UpfH4g1N0wQmzB57KhBWFnAvcSQYlbNcUelT3g/exec';
// 静的モブデータ (mob_data.json) のURL
const MOB_DATA_URL = './mob_data.json';

// --- グローバル変数 ---
let baseMobData = [];
let globalMobData = [];
let currentFilter = {
    rank: 'ALL', // 初期表示はALLランク
    // S/A/FATE ランクごとに独立したエリア選択状態を保持
    areaSets: {
        'S': new Set(['ALL']),
        'A': new Set(['ALL']),
        'F': new Set(['ALL'])
    },
    // NEW: ランクごとのクリック回数を保持 (1回目: 更新, 2回目: 開く, 3回目: 閉じる)
    clickCount: {
        'S': 0,
        'A': 0,
        'F': 0
    }
};
let currentMobNo = null;
let userId = null;
let autoUpdateSuccessCount = 0;

// --- DOMエレメント ---
const DOMElements = {
    errorMessageContainer: document.getElementById('error-message-container'),
    rankTabs: document.getElementById('rank-tabs'),
    reportModal: document.getElementById('report-modal'),
    modalMobName: document.getElementById('modal-mob-name'),
    reportDatetimeInput: document.getElementById('report-datetime'),
    reportMemoInput: document.getElementById('report-memo'),
    submitReportBtn: document.getElementById('submit-report'),
    cancelReportBtn: document.getElementById('cancel-report'),
    reportStatusEl: document.getElementById('report-status'),
    uuidDisplayEl: document.getElementById('uuid-display'),
    areaFilterContainer: document.getElementById('area-filter-container'),
    areaFilterWrapper: document.getElementById('area-filter-wrapper'),
    fixedHeaderContent: document.getElementById('fixed-header-content'),
    contentSpacer: document.getElementById('content-spacer'),
    columns: [
        document.getElementById('column-1'),
        document.getElementById('column-2'),
        document.getElementById('column-3')
    ].filter(col => col)
};
const { errorMessageContainer, rankTabs, reportModal, modalMobName, reportDatetimeInput, reportMemoInput, submitReportBtn, cancelReportBtn, reportStatusEl, uuidDisplayEl, areaFilterWrapper, areaFilterContainer, fixedHeaderContent, contentSpacer, columns } = DOMElements;


// --- 定数: 拡張パック名定義 ---
const EXPANSION_MAP = {
    1: '新生',
    2: '蒼天',
    3: '紅蓮',
    4: '漆黒',
    5: '暁月',
    6: '黄金'
};
const ALL_EXPANSION_NAMES = Object.values(EXPANSION_MAP);
const TARGET_RANKS = ['S', 'A', 'F'];

// --- ユーティリティ関数 ---

function unixTimeToDate(unixtime) {
    return new Date(unixtime * 1000);
}

function formatDateForDisplay(dateInput) {
    const date = (dateInput instanceof Date) ? dateInput : new Date(dateInput);
    if (!date || isNaN(date.getTime())) {
        return 'N/A';
    }

    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${month}/${day} ${hours}:${minutes}`;
}

const processText = (text) => {
    return text ? text.replace(/\/\/\s*/g, '<br>') : '';
};

function toJstAdjustedIsoString(localIsoString) {
    const localDate = new Date(localIsoString);
    const jstOffsetMinutes = -540;
    const localOffsetMinutes = localDate.getTimezoneOffset();
    const offsetDifference = localOffsetMinutes - jstOffsetMinutes;

    const adjustedDate = new Date(localDate.getTime() + offsetDifference * 60000);
    return adjustedDate.toISOString();
}

function formatDurationPart(milliseconds, prefix = '') {
    const absMs = Math.abs(milliseconds);
    const hours = Math.floor(absMs / (1000 * 60 * 60));
    const minutes = Math.floor((absMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((absMs % (1000 * 60)) / 1000);

    let parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0 || hours > 0) parts.push(`${minutes}m`);
    parts.push(`${seconds}s`);

    return prefix + parts.join(' ');
}

function displayError(message) {
    if (!errorMessageContainer) return;

    const baseClasses = ['p-2', 'text-sm', 'font-semibold', 'text-center'];
    const errorClasses = ['bg-red-800', 'text-red-100', 'rounded-lg'];
    const loadingClasses = ['bg-blue-800', 'text-blue-100', 'rounded-lg'];

    if (message) {
        errorMessageContainer.classList.remove('hidden');

        const isError = !message.includes('更新中') && !message.includes('ロード中');

        errorMessageContainer.className = '';
        if (isError) {
            errorMessageContainer.classList.add(...baseClasses, ...errorClasses);
        } else {
            errorMessageContainer.classList.add(...baseClasses, ...loadingClasses);
        }

        errorMessageContainer.innerHTML = `<div>${message}</div>`;
    } else {
        errorMessageContainer.classList.add('hidden');
        errorMessageContainer.className = '';
        errorMessageContainer.innerHTML = '';
    }
}

function calculateRepop(mob, lastKill) {
    const killTime = (lastKill instanceof Date) ? lastKill : new Date(lastKill);
    const isUnknown = !lastKill || isNaN(killTime.getTime());

    const repopMinMs = mob['REPOP(s)'] * 1000;
    const repopMaxMs = mob['MAX(s)'] * 1000;
    const popDurationMs = repopMaxMs - repopMinMs;

    let minRepopTime, maxRepopTime, timeRemainingStr;
    let elapsedPercent = 0;
    let isPop = false;
    let isMaxOver = false;
    const now = new Date();

    if (repopMinMs <= 0 || repopMaxMs <= repopMinMs) {
        return { minRepop: 'N/A', maxRepop: 'N/A', timeDisplay: 'N/A', isPop: false, isMaxOver: false, isUnknown: true, elapsedPercent: 0 };
    }

    if (isUnknown) {
        // 討伐時間が不明な場合、最も早いポップ時間からカウントダウンを表示
        minRepopTime = new Date(now.getTime() + repopMinMs);
        const remainingMsToMin = minRepopTime.getTime() - now.getTime();
        const duration = formatDurationPart(remainingMsToMin);
        timeRemainingStr = `Unknown Kill Time. Next: ${duration}`;
        elapsedPercent = 0;
    } else {
        minRepopTime = new Date(killTime.getTime() + repopMinMs);
        maxRepopTime = new Date(killTime.getTime() + repopMaxMs);

        const remainingMsToMin = minRepopTime.getTime() - now.getTime();

        if (remainingMsToMin > 0) {
            // ポップウィンドウ前
            isPop = false;
            const duration = formatDurationPart(remainingMsToMin);
            timeRemainingStr = `Next Pop: ${duration}`;
            elapsedPercent = 0;

        } else {
            // ポップウィンドウ内
            isPop = true;
            const remainingMsToMax = maxRepopTime.getTime() - now.getTime();

            if (remainingMsToMax > 0) {
                // ポップウィンドウ内（まだ最大時間内）
                isMaxOver = false;
                const elapsedInWindowMs = now.getTime() - minRepopTime.getTime();
                elapsedPercent = Math.max(0, Math.min(100, (elapsedInWindowMs / popDurationMs) * 100));

                const duration = formatDurationPart(remainingMsToMax);
                timeRemainingStr = `Remaining (${elapsedPercent.toFixed(1)}%): ${duration}`;

            } else {
                // 最大ポップ時間を超過
                isMaxOver = true;
                const popElapsedMs = now.getTime() - maxRepopTime.getTime();
                const formattedElapsed = formatDurationPart(popElapsedMs, '+');
                timeRemainingStr = `MAX Over (100.0%): ${formattedElapsed}`;
                elapsedPercent = 100;
            }
        }
    }

    return { minRepop: minRepopTime, maxRepop: maxRepopTime, timeDisplay: timeRemainingStr, elapsedPercent: elapsedPercent, isPop: isPop, isMaxOver: isMaxOver, isUnknown: isUnknown };
}

function getMobByNo(mobNo) {
    return globalMobData.find(mob => mob['No.'] === parseInt(mobNo));
}

function saveFilterState() {
    try {
        const stateToSave = {
            rank: currentFilter.rank,
            areaSets: {},
            clickCount: currentFilter.clickCount 
        };
        for (const rank in currentFilter.areaSets) {
            stateToSave.areaSets[rank] = Array.from(currentFilter.areaSets[rank]);
        }
        localStorage.setItem('huntFilterState', JSON.stringify(stateToSave));
    } catch (e) {
        console.error('Failed to save filter state to localStorage:', e);
    }
}

function loadFilterState() {
    try {
        const savedState = localStorage.getItem('huntFilterState');
        if (savedState) {
            const parsedState = JSON.parse(savedState);

            if (parsedState.rank && TARGET_RANKS.includes(parsedState.rank) || parsedState.rank === 'ALL') {
                currentFilter.rank = parsedState.rank;
            }

            if (parsedState.areaSets) {
                for (const rank in parsedState.areaSets) {
                    if (TARGET_RANKS.includes(rank) && Array.isArray(parsedState.areaSets[rank])) {
                        currentFilter.areaSets[rank] = new Set(parsedState.areaSets[rank]);
                    }
                }
            }
            
            // NEW: クリックカウントをロード
            if (parsedState.clickCount) {
                currentFilter.clickCount = parsedState.clickCount;
            }
        }
    } catch (e) {
        console.error('Failed to load filter state from localStorage:', e);
    }
}

/**
 * NEW: requestAnimationFrame を利用してレイアウト崩れを防ぎながら調整
 */
function adjustContentPadding() {
    if (fixedHeaderContent && contentSpacer) {
        requestAnimationFrame(() => {
            const headerHeight = fixedHeaderContent.offsetHeight;
            contentSpacer.style.paddingTop = `${headerHeight}px`;
        });
    }
}

function updateProgressBars() {
    // 描画されている全てのモブカードを取得
    const mobCards = document.querySelectorAll('.mob-card');

    mobCards.forEach(card => {
        const mobNo = parseInt(card.dataset.mobno);
        const mob = getMobByNo(mobNo);
        if (!mob) return;

        const lastKillDate = card.dataset.lastkill ? new Date(card.dataset.lastkill) : null;
        const { minRepop, timeDisplay, elapsedPercent, isPop, isMaxOver, isUnknown } = calculateRepop(mob, lastKillDate);

        const progressBar = card.querySelector('.progress-bar');
        const infoDisplay = card.querySelector('.repop-info-display');

        if (progressBar) {
            progressBar.style.width = `${elapsedPercent}%`;
            
            let barBgClass = 'bg-gray-600';
            if (isPop) {
                barBgClass = isMaxOver ? 'bg-red-900' : 'bg-yellow-800';
            }
            progressBar.className = `progress-bar absolute inset-0 transition-all duration-100 ease-linear ${barBgClass}`;
        }

        if (infoDisplay) {
            infoDisplay.textContent = timeDisplay;

            let textColorClass = 'text-white font-extrabold';
            if (isUnknown) {
                textColorClass = 'text-gray-400';
            } else if (!isPop) {
                textColorClass = 'text-green-400';
            } else if (isMaxOver) {
                textColorClass = 'text-white'; // 赤い背景上の白
            } else {
                textColorClass = 'text-yellow-200'; // 黄色い背景上の黄色
            }
            infoDisplay.classList.remove('text-white', 'text-gray-400', 'text-green-400', 'text-yellow-200');
            infoDisplay.classList.add(...textColorClass.split(' '));
        }
    });
}


// --- DOM操作/イベントハンドラ ---

function createMobCard(mob) {
    const lastKillDate = mob.LastKillDate ? new Date(mob.LastKillDate) : null;
    const { minRepop, timeDisplay, elapsedPercent, isPop, isMaxOver, isUnknown } = calculateRepop(mob, lastKillDate);

    let repopTimeColorClass = 'text-white font-extrabold';
    if (isUnknown) {
        repopTimeColorClass = 'text-gray-400';
    } else if (!isPop) {
        repopTimeColorClass = 'text-green-400';
    }

    let rankBgClass;
    let rankTextColor = 'text-white';
    let rankDisplay = mob.Rank; // NEW: 表示名称を変更

    switch (mob.Rank) {
        case 'S': rankBgClass = 'bg-red-600'; rankDisplay = 'Rank S'; break;
        case 'A': rankBgClass = 'bg-blue-600'; rankDisplay = 'Rank A'; break;
        case 'B': rankBgClass = 'bg-gray-600'; break;
        case 'F': rankBgClass = 'bg-purple-600'; break;
        default: rankBgClass = 'bg-gray-600';
    }

    const mobNameContainerClass = 'min-w-0 flex-1';
    const reportBtnHtml = `
        <button class="bg-green-600 hover:bg-green-500 active:bg-green-700 report-btn text-white px-1 py-1 rounded-md shadow-md transition h-10 w-10 flex flex-col items-center justify-center leading-none flex-shrink-0"
                data-mobno="${mob['No.']}">
            <span class="text-xs font-bold">報告</span><span class="text-xs font-bold">する</span>
        </button>
    `;

    // --- 展開パネル内のコンテンツ生成 ---
    const conditionHtml = mob.Condition ? `
        <div class="px-4 pt-1 pb-1 condition-content text-left">
            <p class="text-xs font-medium text-gray-300">抽選条件:</p>
            <p class="text-sm text-white leading-snug">${processText(mob.Condition)}</p>
        </div>
    ` : '';
    
    // NEW: メモ表示ロジック
    const memoHtml = mob.Memo ? `
        <div class="px-4 pt-1 pb-1 memo-content text-left">
            <p class="text-xs font-medium text-gray-300">Memo:</p>
            <p class="text-sm text-white leading-snug">${processText(mob.Memo)}</p>
        </div>
    ` : '';


    const minRepopStr = formatDateForDisplay(minRepop);
    const minRepopHtml = `
        <div class="px-4 pt-1 pb-1 repop-start-content flex justify-end">
            <p class="text-sm font-semibold text-gray-400">開始時間: <span class="text-base text-gray-200 font-mono">${minRepopStr}</span></p>
        </div>
    `;

    const lastKillStr = formatDateForDisplay(lastKillDate);
    const lastKillHtml = `
        <div class="px-4 pt-1 pb-1 last-kill-content flex justify-end">
            <p class="text-sm font-semibold text-gray-400">前回時間: <span class="text-base text-gray-200 font-mono">${lastKillStr}</span></p>
        </div>
    `;

    const mapDetailsHtml = mob.Map ? `
        <div class="mob-details pt-1 px-4 text-center map-content">
            <div class="relative inline-block w-full max-w-sm">
                <img src="./maps/${mob.Map}" alt="${mob.Area} Map" class="w-full h-auto rounded-lg shadow-md map-image" data-area="${mob.Area}">
                <div class="absolute inset-0 map-overlay" data-area="${mob.Area}"></div>
            </div>
        </div>
    ` : '';

    let panelContent = conditionHtml + memoHtml + minRepopHtml + lastKillHtml + mapDetailsHtml; // NEW: memoHtmlを追加
    if (panelContent.trim()) {
        panelContent = `<div class="panel-padding-bottom">${panelContent}</div>`;
    }

    const expandablePanel = panelContent.trim() ? `
        <div class="expandable-panel overflow-hidden transition-all duration-300 ease-in-out max-height-0 pt-0 px-0">
            ${panelContent}
        </div>
    ` : '';

    // --- 進捗バーエリアのHTML ---
    // NEW: プログレスバーの余白削減の調整 (p-2 -> p-1 に変更する想定)
    // 既存の p-2 を p-1 に変更
    const repopInfoHtml = ` 
        <div class="mt-1 bg-gray-700 p-1 rounded-xl text-xs relative overflow-hidden shadow-inner h-10">
            <div class="progress-bar absolute inset-0 transition-all duration-100 ease-linear bg-gray-600" style="width: ${elapsedPercent}%; z-index: 0;"></div>
            <div class="absolute inset-0 flex items-center justify-center z-10">
                <span class="repop-info-display text-base font-extrabold ${repopTimeColorClass} font-mono w-full text-center">
                    ${timeDisplay}
                </span>
            </div>
        </div>
    `;

    // --- モブカードの最終構造 ---
    return `
        <div class="mob-card bg-gray-800 rounded-xl shadow-2xl overflow-hidden relative py-2 mb-3"
             data-rank="${mob.Rank}"
             data-mobno="${mob['No.']}"
             data-lastkill="${mob.LastKillDate || ''}"
             data-minrepop="${mob['REPOP(s)']}"
             data-maxrepop="${mob['MAX(s)']}"
             data-expansion="${mob.Expansion || '?'}">

            <div class="p-2 fixed-content toggle-handler cursor-pointer">
                <div class="flex justify-between items-start mb-1">
                    <div class="flex items-center space-x-2">
                        <div class="rank-icon ${rankBgClass} ${rankTextColor} font-bold text-sm w-7 h-7 flex items-center justify-center rounded-lg shadow-lg flex-shrink-0">
                            ${mob.Rank}
                        </div>
                        
                        <div class="px-1 ${mobNameContainerClass}">
                            <h2 class="text-base font-bold text-outline text-yellow-200 leading-tight truncate overflow-hidden whitespace-nowrap" style="max-width: 100%;">${mob.Name}</h2>
                            <p class="text-xs text-gray-400 leading-tight truncate overflow-hidden whitespace-nowrap" style="max-width: 100%;">${mob.Area} (${mob.Expansion || '?'})</p>
                        </div>
                    </div>

                    ${reportBtnHtml}
                </div>

                ${repopInfoHtml}
            </div>

            ${expandablePanel}
        </div>
    `;
}

/**
 * フィルターに基づいてモブカードリストをレンダリングする
 */
function renderMobList() {
    const { rank } = currentFilter;
    let filteredMobs = [];
    const activeRanks = rank === 'ALL' ? TARGET_RANKS : [rank];

    for (const r of activeRanks) {
        const rankMobs = globalMobData.filter(mob => mob.Rank === r);
        const currentAreaSet = currentFilter.areaSets[r];

        if (currentAreaSet.has('ALL') && currentAreaSet.size === 1) {
            filteredMobs.push(...rankMobs.filter(mob => ALL_EXPANSION_NAMES.includes(mob.Expansion)));
        } else if (!currentAreaSet.has('ALL') && currentAreaSet.size > 0) {
            filteredMobs.push(...rankMobs.filter(mob => currentAreaSet.has(mob.Expansion)));
        } else if (currentAreaSet.has('ALL') && currentAreaSet.size > 1) {
             // ALLと特定の拡張が選択されている場合
             filteredMobs.push(...rankMobs.filter(mob => currentAreaSet.has(mob.Expansion)));
        } 
    }
    
    // ALLタブが選択されている場合はNo.順にソート
    if (rank === 'ALL') {
        filteredMobs.sort((a, b) => a['No.'] - b['No.']);
    } else {
        // ランクが指定されている場合は、ポップ時間に基づいてソート（オプション、現在のコードはNo.順を維持する傾向にある）
    }


    columns.forEach(col => col.innerHTML = '');

    if (columns.length > 0) {
        filteredMobs.forEach((mob, index) => {
            const cardHtml = createMobCard(mob);
            const targetColumn = columns[index % columns.length];
            const div = document.createElement('div');
            div.innerHTML = cardHtml.trim();
            targetColumn.appendChild(div.firstChild);
        });
    }

    // アクティブなランクタブをハイライト
    if (rankTabs) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            let rankText = btn.dataset.rank;
            let displayRank = rankText;
            if (rankText === 'S') displayRank = 'Rank S'; // NEW: 名称変更
            if (rankText === 'A') displayRank = 'Rank A'; // NEW: 名称変更
            btn.textContent = displayRank; // NEW: 表示名称の更新

            const isActive = btn.dataset.rank === rank;
            btn.classList.toggle('bg-blue-600', isActive);
            btn.classList.toggle('hover:bg-blue-500', isActive);
            btn.classList.toggle('bg-gray-700', !isActive);
            btn.classList.toggle('hover:bg-gray-600', !isActive);
        });
    }

    // エリアフィルタボタンのハイライト
    const currentRankForAreaFilter = TARGET_RANKS.includes(rank) ? rank : 'S';
    const currentAreasToHighlight = currentFilter.areaSets[currentRankForAreaFilter] || new Set(['ALL']);

    document.querySelectorAll('.area-filter-btn').forEach(btn => {
        const isSelected = currentAreasToHighlight.has(btn.dataset.area);
        btn.classList.toggle('bg-blue-600', isSelected);
        btn.classList.toggle('hover:bg-blue-500', isSelected);
        btn.classList.toggle('bg-gray-600', !isSelected);
        btn.classList.toggle('hover:bg-gray-500', !isSelected);
    });

    attachEventListeners();
    updateProgressBars();
    saveFilterState();
}

/**
 * モブカードの排他的開閉を実装
 */
function toggleMobDetails(card) {
    const mobNo = card.dataset.mobno;
    const mob = getMobByNo(parseInt(mobNo));
    const panel = card.querySelector('.expandable-panel');

    if (!panel) return;

    // NEW: 他の開いているカードを全て閉じる (排他的開閉)
    document.querySelectorAll('.mob-card.open').forEach(openCard => {
        if (openCard !== card) {
            openCard.classList.remove('open');
            const openPanel = openCard.querySelector('.expandable-panel');
            if (openPanel) {
                openPanel.style.maxHeight = '0';
            }
        }
    });
    
    panel.style.transition = 'max-height 0.3s ease-in-out';

    if (card.classList.contains('open')) {
        // 閉じる処理
        panel.style.maxHeight = '0';
        card.classList.remove('open');
    } else {
        // 開く処理
        card.classList.add('open');
        
        const mapOverlay = panel.querySelector('.map-overlay');
        if (mapOverlay && mob.spawn_points) {
            drawSpawnPoints(mapOverlay, mob.spawn_points, mobNo);
        }

        // max-height をいったん none にしてから scrollHeight を取得
        panel.style.maxHeight = 'none';
        const targetHeight = panel.scrollHeight;

        // アニメーションのために 0 に戻してからターゲット高さを設定
        panel.style.maxHeight = '0';

        setTimeout(() => {
            panel.style.maxHeight = (targetHeight + 5) + 'px';

            panel.addEventListener('transitionend', function handler(e) {
                if (e.propertyName === 'max-height' && card.classList.contains('open')) {
                    panel.style.maxHeight = 'none';
                }
                panel.removeEventListener('transitionend', handler);
            });
        }, 0);
    }
}

function toggleCullStatus(event) {
    event.stopPropagation();
    const pointEl = event.currentTarget;
    const isCulled = pointEl.classList.toggle('culled');
    
    // スポーンポイントの湧き潰し状態をローカルストレージに保存（機能維持のため）
    const mobNo = pointEl.dataset.mobno;
    const pointId = pointEl.dataset.pointid;
    const storageKey = `cull_status_${mobNo}`;
    let cullStatus = JSON.parse(localStorage.getItem(storageKey) || '{}');
    
    if (isCulled) {
        cullStatus[pointId] = true;
    } else {
        delete cullStatus[pointId];
    }
    
    localStorage.setItem(storageKey, JSON.stringify(cullStatus));
}

function drawSpawnPoints(mapOverlay, spawnPoints, mobNo) {
    mapOverlay.innerHTML = '';
    const mapWidth = mapOverlay.offsetWidth;
    const mapHeight = mapOverlay.offsetHeight;
    
    // ローカルストレージから湧き潰し状態をロード
    const storageKey = `cull_status_${mobNo}`;
    const cullStatus = JSON.parse(localStorage.getItem(storageKey) || '{}');

    spawnPoints.forEach((point, index) => {
        const x = point[0];
        const y = point[1];
        
        // 座標をパーセンテージからピクセルに変換
        const pxX = (x / 100) * mapWidth;
        const pxY = (y / 100) * mapHeight;

        const pointId = `${mobNo}-${index}`;
        const isCulled = cullStatus[pointId];

        const pointEl = document.createElement('div');
        pointEl.className = `spawn-point absolute w-4 h-4 rounded-full bg-yellow-400 border-2 border-black shadow-lg transition-all duration-100 ${isCulled ? 'culled' : ''}`;
        pointEl.style.left = `${pxX}px`;
        pointEl.style.top = `${pxY}px`;
        pointEl.style.transform = 'translate(-50%, -50%)'; // 中心を座標に合わせる

        pointEl.dataset.mobno = mobNo;
        pointEl.dataset.pointid = pointId;

        pointEl.addEventListener('click', toggleCullStatus);
        
        mapOverlay.appendChild(pointEl);
    });
}

function attachEventListeners() {
    // モブカード開閉リスナー
    document.querySelectorAll('.toggle-handler').forEach(handler => {
        handler.onclick = (e) => {
            // report-btn をクリックした場合は詳細を開かない
            if (e.target.closest('.report-btn')) return;
            const card = e.currentTarget.closest('.mob-card');
            toggleMobDetails(card);
        };
    });

    // 報告ボタンリスナー
    document.querySelectorAll('.report-btn').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation(); // 親要素（カード）へのイベント伝播を停止
            const mobNo = e.currentTarget.dataset.mobno;
            openReportModal(mobNo);
        };
    });
}

function openReportModal(mobNo) {
    currentMobNo = mobNo;
    const mob = getMobByNo(mobNo);

    if (!mob) {
        displayError('モブデータが見つかりません。');
        return;
    }

    modalMobName.textContent = mob.Name;
    reportStatusEl.textContent = '';
    reportStatusEl.classList.add('hidden');
    submitReportBtn.disabled = false;
    submitReportBtn.textContent = '報告する';

    // JSTの現在時刻を設定
    const now = new Date();
    // タイムゾーンオフセットを調整して、YYYY-MM-DDTHH:MM 形式にする
    const offset = now.getTimezoneOffset() * 60000; 
    const localIso = new Date(now.getTime() - offset).toISOString().slice(0, 16);
    reportDatetimeInput.value = localIso;
    reportMemoInput.value = '';

    reportModal.classList.remove('hidden');
    reportModal.classList.add('flex');
}

function closeReportModal() {
    reportModal.classList.add('hidden');
    reportModal.classList.remove('flex');
    currentMobNo = null;
}

async function submitReport() {
    if (!currentMobNo || !userId) return;

    const reportTime = reportDatetimeInput.value;
    const memo = reportMemoInput.value;

    if (!reportTime) {
        reportStatusEl.textContent = '討伐日時を入力してください。';
        reportStatusEl.classList.remove('hidden');
        return;
    }

    submitReportBtn.disabled = true;
    submitReportBtn.textContent = '送信中...';
    reportStatusEl.textContent = 'データを送信しています...';
    reportStatusEl.classList.remove('hidden');

    try {
        const jstIsoString = toJstAdjustedIsoString(reportTime);

        const response = await fetch(GAS_ENDPOINT, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                mobNo: currentMobNo,
                killTime: jstIsoString,
                memo: memo,
                userId: userId
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.status === 'success') {
            reportStatusEl.textContent = '報告が完了しました！リストを更新します。';
            reportStatusEl.style.color = 'lightgreen';
            await fetchRecordsAndUpdate('report'); 
            setTimeout(closeReportModal, 1500);

        } else {
            throw new Error(result.message || '報告に失敗しました。');
        }
    } catch (error) {
        console.error('Report submission failed:', error);
        reportStatusEl.textContent = `報告エラー: ${error.message}`;
        reportStatusEl.style.color = 'red';
        submitReportBtn.disabled = false;
        submitReportBtn.textContent = '報告する';
    }
}

async function fetchRecordsAndUpdate(source = 'auto', initial = false) {
    if (source !== 'report' && autoUpdateSuccessCount > 0) {
        displayError('更新中...');
    } else if (initial) {
        displayError('データロード中...');
    }

    try {
        // 1. 静的モブデータ (mob_data.json) をロード
        if (baseMobData.length === 0) {
            const staticResponse = await fetch(MOB_DATA_URL);
            if (!staticResponse.ok) throw new Error(`Failed to load static mob data. Status: ${staticResponse.status}`);
            baseMobData = await staticResponse.json();
        }

        // 2. GASから最新の討伐履歴をロード
        const gasResponse = await fetch(`${GAS_ENDPOINT}?action=get_records`);
        if (!gasResponse.ok) throw new Error(`Failed to load hunt records. Status: ${gasResponse.status}`);
        const records = await gasResponse.json();

        // 3. モブデータを結合して globalMobData を作成
        globalMobData = baseMobData.map(mob => {
            const record = records.find(r => r['No.'] === mob['No.']);
            
            // 討伐時間とメモを結合
            if (record && record.LastKillUnixTime) {
                mob.LastKillDate = unixTimeToDate(record.LastKillUnixTime);
                mob.LastKillUnixTime = record.LastKillUnixTime;
                mob.Memo = record.Memo; // NEW: メモの追加
            } else {
                mob.LastKillDate = null;
                mob.LastKillUnixTime = null;
                mob.Memo = '';
            }

            // 拡張パック名を付与
            const expansionNumber = mob.Expansion || 1; 
            mob.Expansion = EXPANSION_MAP[expansionNumber];

            // スポーンポイントの解析 (JSON文字列をパース)
            if (typeof mob['Spawn Points'] === 'string') {
                try {
                    mob.spawn_points = JSON.parse(mob['Spawn Points']);
                } catch (e) {
                    mob.spawn_points = [];
                    console.warn(`Error parsing spawn points for mob ${mob['No.']}:`, e);
                }
            } else {
                mob.spawn_points = mob['Spawn Points'] || [];
            }
            delete mob['Spawn Points'];

            return mob;
        });
        
        // 4. リストをレンダリング
        renderMobList();
        
        displayError(''); // エラーメッセージをクリア
        if (source === 'auto') autoUpdateSuccessCount++;

    } catch (error) {
        console.error('Fetch and update failed:', error);
        displayError(`データの取得または更新に失敗しました: ${error.message}`);
    }
}


/**
 * エリアフィルタパネルの開閉をトグルする (アニメーション付き)
 */
function toggleAreaFilterPanel(forceOpen) {
    if (!areaFilterWrapper || !areaFilterContainer) return;

    const isOpen = areaFilterWrapper.classList.contains('open');
    let shouldOpen = (typeof forceOpen === 'boolean') ? forceOpen : !isOpen;

    areaFilterWrapper.style.pointerEvents = 'none';

    if (shouldOpen) {
        // --- 開く処理 ---
        areaFilterWrapper.classList.add('open');
        
        // NEW: requestAnimationFrame を使用してレイアウト崩れを防ぐ
        requestAnimationFrame(adjustContentPadding);

        areaFilterWrapper.style.maxHeight = 'none';
        const targetHeight = areaFilterContainer.offsetHeight;
        areaFilterWrapper.style.maxHeight = '0px';

        setTimeout(() => {
            areaFilterWrapper.style.maxHeight = `${targetHeight + 8}px`; // padding-bottomの8px分を確保

            areaFilterWrapper.addEventListener('transitionend', function handler(e) {
                if (e.propertyName === 'max-height' && areaFilterWrapper.classList.contains('open')) {
                    areaFilterWrapper.style.maxHeight = 'none';
                    areaFilterWrapper.style.pointerEvents = 'all';
                    requestAnimationFrame(adjustContentPadding); // NEW: requestAnimationFrame を使用
                }
                areaFilterWrapper.removeEventListener('transitionend', handler);
            });
            setTimeout(() => { areaFilterWrapper.style.pointerEvents = 'all'; requestAnimationFrame(adjustContentPadding); }, 350);
        }, 0);

    } else {
        // --- 閉じる処理 ---
        areaFilterWrapper.style.maxHeight = `${areaFilterWrapper.scrollHeight}px`;
        areaFilterWrapper.classList.remove('open');

        setTimeout(() => {
            areaFilterWrapper.style.maxHeight = '0px';

            areaFilterWrapper.addEventListener('transitionend', function handler(e) {
                if (e.propertyName === 'max-height' && !areaFilterWrapper.classList.contains('open')) {
                    areaFilterWrapper.style.pointerEvents = 'all';
                    requestAnimationFrame(adjustContentPadding); // NEW: requestAnimationFrame を使用
                }
                areaFilterWrapper.removeEventListener('transitionend', handler);
            });

            setTimeout(() => { areaFilterWrapper.style.pointerEvents = 'all'; requestAnimationFrame(adjustContentPadding); }, 350); 
        }, 0);
    }
}


/**
 * サイトの初期化処理
 */
function initializeApp() {
    // 1. UUIDの取得/生成
    userId = localStorage.getItem('user_uuid');
    if (!userId) {
        userId = crypto.randomUUID();
        localStorage.setItem('user_uuid', userId);
    }

    if (uuidDisplayEl && userId) {
        const maskedUuid = userId.substring(0, 5) + '****';
        uuidDisplayEl.textContent = `ID: ${maskedUuid}`;
        uuidDisplayEl.classList.remove('hidden');
    }

    // フィルタ状態のロードと初期表示の制御
    loadFilterState();
    const initialRank = currentFilter.rank;
    
    // NEW: 初期表示は、保存されたランクのクリック回数に基づきパネル状態を決定
    const initialClickCount = currentFilter.clickCount[initialRank] || 0;
    const isTargetRank = TARGET_RANKS.includes(initialRank);
    const shouldOpenInitially = isTargetRank && (initialClickCount % 3 === 2); 

    if (shouldOpenInitially) {
        setTimeout(() => toggleAreaFilterPanel(true), 100);
    } else {
        toggleAreaFilterPanel(false);
    }

    adjustContentPadding();
    window.addEventListener('resize', adjustContentPadding);


    // 2. イベントリスナーの設定

    // NEW: ランクタブのリスナー (クリックカウントに基づく排他的トグル)
    if (rankTabs) {
        document.querySelectorAll('.tab-btn').forEach(button => {
            button.onclick = (e) => {
                const newRank = e.currentTarget.dataset.rank;
                const currentRank = currentFilter.rank;
                const newRankIsTarget = TARGET_RANKS.includes(newRank);

                if (currentRank !== newRank) {
                    // ランク切り替え時: 新しいランクのクリックカウントを1にする
                    currentFilter.rank = newRank;
                    if (newRankIsTarget) {
                        currentFilter.clickCount[newRank] = 1;
                    } else {
                        // ALL選択時はクリックカウントをリセット/無視
                        TARGET_RANKS.forEach(r => currentFilter.clickCount[r] = 0);
                    }
                    // 1回目クリック (ランク更新) はパネルを閉じる
                    toggleAreaFilterPanel(false);
                } else if (newRankIsTarget) {
                    // 同じランクの再クリック
                    currentFilter.clickCount[newRank] = (currentFilter.clickCount[newRank] || 0) + 1;
                    const count = currentFilter.clickCount[newRank];

                    if (count % 3 === 2) { // 2回目クリック: 開く
                        toggleAreaFilterPanel(true);
                    } else if (count % 3 === 0) { // 3回目クリック: 閉じる
                        toggleAreaFilterPanel(false);
                    }
                } else {
                    // ALLの再クリック: 何もしない (パネルは閉じている)
                    toggleAreaFilterPanel(false);
                }

                renderMobList();
            }
        });
    }

    // エリアフィルタボタンのリスナー
    document.querySelectorAll('.area-filter-btn').forEach(button => {
        button.onclick = (e) => {
            const newArea = e.currentTarget.dataset.area;
            const currentRank = currentFilter.rank;
            
            const targetRank = TARGET_RANKS.includes(currentRank) ? currentRank : 'S';
            const currentAreaSet = currentFilter.areaSets[targetRank];
            
            if (!currentAreaSet) return;

            if (newArea === 'ALL') {
                const isAllSelected = ALL_EXPANSION_NAMES.every(area => currentAreaSet.has(area));
                
                if (isAllSelected) {
                    currentFilter.areaSets[targetRank] = new Set(['ALL']);
                } else {
                    currentFilter.areaSets[targetRank] = new Set([...ALL_EXPANSION_NAMES, 'ALL']);
                }

            } else {
                if (currentAreaSet.has(newArea)) {
                    currentAreaSet.delete(newArea);
                } else {
                    currentAreaSet.add(newArea);
                }
                
                // ALL以外の選択がなくなったらALLに戻す
                if (Array.from(currentAreaSet).filter(a => a !== 'ALL').length === 0) {
                    currentAreaSet.add('ALL');
                } else {
                    currentAreaSet.delete('ALL');
                }
                
                // 全ての拡張が選択されたらALLを追加する
                const isAllSelectedAfterToggle = ALL_EXPANSION_NAMES.every(area => currentAreaSet.has(area));
                if (isAllSelectedAfterToggle) {
                    currentAreaSet.add('ALL');
                }
            }

            renderMobList();
        }
    });


    // モーダル関連のリスナー
    if (cancelReportBtn) cancelReportBtn.onclick = closeReportModal;
    if (submitReportBtn) submitReportBtn.onclick = submitReport;

    if (reportModal) {
        reportModal.addEventListener('click', (e) => {
            if (e.target.id === 'report-modal') {
                closeReportModal();
            }
        });
    }

    // 3. 初回データロードと定期更新
    fetchRecordsAndUpdate('initial', true);
    setInterval(() => fetchRecordsAndUpdate('auto', false), 10 * 60 * 1000); // 10分ごと
    setInterval(updateProgressBars, 60 * 1000); // 1分ごと
}

document.addEventListener('DOMContentLoaded', initializeApp);
