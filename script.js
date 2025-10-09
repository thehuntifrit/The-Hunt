/* script.js (最終修正・最適化版 - NEW REQUIREMENTS) */

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

// --- ユーティリティ関数 (変更なし) ---

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
        minRepopTime = new Date(now.getTime() + repopMinMs);
        timeRemainingStr = `Next: ${formatDateForDisplay(minRepopTime)}`;
        elapsedPercent = 0;
    } else {
        minRepopTime = new Date(killTime.getTime() + repopMinMs);
        maxRepopTime = new Date(killTime.getTime() + repopMaxMs);

        const remainingMsToMin = minRepopTime.getTime() - now.getTime();

        if (remainingMsToMin > 0) {
            isPop = false;
            timeRemainingStr = `Next: ${formatDateForDisplay(minRepopTime)}`;
            elapsedPercent = 0;

        } else {
            isPop = true;
            const remainingMsToMax = maxRepopTime.getTime() - now.getTime();

            if (remainingMsToMax > 0) {
                isMaxOver = false;
                const elapsedInWindowMs = now.getTime() - minRepopTime.getTime();
                elapsedPercent = Math.max(0, Math.min(100, (elapsedInWindowMs / popDurationMs) * 100));

                const duration = formatDurationPart(remainingMsToMax);
                timeRemainingStr = `残り (%): ${duration} (${elapsedPercent.toFixed(1)}%)`;

            } else {
                isMaxOver = true;
                const popElapsedMs = now.getTime() - maxRepopTime.getTime();
                const formattedElapsed = formatDurationPart(popElapsedMs, '+');
                timeRemainingStr = `残り (%): ${formattedElapsed} (100.0%)`;
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
            clickCount: currentFilter.clickCount // NEW: クリックカウントも保存
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


// --- DOM操作/イベントハンドラ ---

/**
 * モブデータに基づいてHTMLカードを生成する
 */
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
    // NEW: プログレスバーの余白を p-2 から p-1 に削減する想定で調整 (CSS構造に依存)
    const repopInfoHtml = ` 
        <div class="mt-1 bg-gray-700 p-1 rounded-xl text-xs relative overflow-hidden shadow-inner h-10">
            <div class="progress-bar absolute inset-0 transition-all duration-100 ease-linear" style="width: ${elapsedPercent}%; z-index: 0;"></div>
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

// ... renderMobList, attachEventListeners, drawSpawnPoints, toggleCullStatus (変更なし) ...

/**
 * フィルターに基づいてモブカードリストをレンダリングする (変更なし)
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
             filteredMobs.push(...rankMobs.filter(mob => currentAreaSet.has(mob.Expansion)));
        } 
    }
    
    if (rank === 'ALL') {
        filteredMobs.sort((a, b) => a['No.'] - b['No.']);
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

    // 4. アクティブなランクタブをハイライト
    if (rankTabs) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            let rankText = btn.dataset.rank;
            let displayRank = rankText;
            if (rankText === 'S') displayRank = 'Rank S';
            if (rankText === 'A') displayRank = 'Rank A';
            btn.textContent = displayRank; // NEW: 表示名称の更新

            const isActive = btn.dataset.rank === rank;
            btn.classList.toggle('bg-blue-600', isActive);
            btn.classList.toggle('hover:bg-blue-500', isActive);
            btn.classList.toggle('bg-gray-700', !isActive);
            btn.classList.toggle('hover:bg-gray-600', !isActive);
        });
    }

    // 5. エリアフィルタボタンのハイライト
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

    // NEW: 他の開いているカードを全て閉じる
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

        panel.style.maxHeight = 'none';
        const targetHeight = panel.scrollHeight;

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

// ... fetchRecordsAndUpdate, updateProgressBars, toggleAreaFilterPanel, initializeApp (変更あり) ...

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
        // NEW: requestAnimationFrame を使用
        requestAnimationFrame(adjustContentPadding);

        areaFilterWrapper.style.maxHeight = 'none';
        const targetHeight = areaFilterContainer.offsetHeight;
        areaFilterWrapper.style.maxHeight = '0px';

        setTimeout(() => {
            areaFilterWrapper.style.maxHeight = `${targetHeight}px`;

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

            setTimeout(() => { areaFilterWrapper.style.pointerEvents = 'all'; requestAnimationFrame(adjustContentPadding); }, 350); // NEW: requestAnimationFrame を使用
        }, 0);
    }
}

/**
 * サイトの初期化処理
 */
function initializeApp() {
    // 1. UUIDの取得/生成 (変更なし)
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
    const shouldOpenInitially = isTargetRank && (initialClickCount % 3 === 2); // 2回クリックで開いた状態

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
                    } else if (count % 3 === 0) { // 3回目クリック (または 0回目に戻る): 閉じる
                        toggleAreaFilterPanel(false);
                    }
                    // 1回目クリック (count % 3 === 1) は既に更新済みのため何もしない
                } else {
                    // ALLの再クリック: 何もしない (パネルは閉じている)
                    toggleAreaFilterPanel(false);
                }

                renderMobList();
            }
        });
    }

    // エリアフィルタボタンのリスナー (変更なし)
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
                
                if (Array.from(currentAreaSet).filter(a => a !== 'ALL').length === 0) {
                    currentAreaSet.add('ALL');
                } else {
                    currentAreaSet.delete('ALL');
                }
                
                const isAllSelectedAfterToggle = ALL_EXPANSION_NAMES.every(area => currentAreaSet.has(area));
                if (isAllSelectedAfterToggle) {
                    currentAreaSet.add('ALL');
                }
            }

            renderMobList();
        }
    });


    // モーダル関連のリスナー (変更なし)
    if (cancelReportBtn) cancelReportBtn.onclick = closeReportModal;
    if (submitReportBtn) submitReportBtn.onclick = submitReport;

    if (reportModal) {
        reportModal.addEventListener('click', (e) => {
            if (e.target.id === 'report-modal') {
                closeReportModal();
            }
        });
    }

    // 3. 初回データロードと定期更新 (変更なし)
    fetchRecordsAndUpdate('initial', true);
    setInterval(() => fetchRecordsAndUpdate('auto', false), 10 * 60 * 1000);
    setInterval(updateProgressBars, 60 * 1000);
}

document.addEventListener('DOMContentLoaded', initializeApp);
