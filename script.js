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
        'S': new Set(['ALL']), // 'ALL'は「全て表示」または「すべてが選択状態」を意味するフラグ
        'A': new Set(['ALL']),
        'F': new Set(['ALL'])
    }
};
// 【新規】ソート状態を保持
let currentSort = {
    key: 'No.', // デフォルトは No. 順
    direction: 'asc' // 昇順
};
let currentMobNo = null;
let userId = null;
let autoUpdateSuccessCount = 0;
// 排他的開閉のための変数
let openMobCardNo = null;

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
    mobContainer: document.getElementById('mob-container'), // 【新規】全てのカードを格納するマスターコンテナ (非表示推奨)
    sortDropdown: document.getElementById('sort-dropdown'), // 【新規】ソートUI要素
    columns: [
        document.getElementById('column-1'),
        document.getElementById('column-2'),
        document.getElementById('column-3')
    ].filter(col => col)
};
const { errorMessageContainer, rankTabs, reportModal, modalMobName, reportDatetimeInput, reportMemoInput, submitReportBtn, cancelReportBtn, reportStatusEl, uuidDisplayEl, areaFilterWrapper, areaFilterContainer, fixedHeaderContent, contentSpacer, columns, mobContainer, sortDropdown } = DOMElements;


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

/**
 * デバウンス関数
 */
function debounce(func, wait) {
    let timeout;
    return function executed(...args) {
        const context = this;
        const later = function() {
            timeout = null;
            func.apply(context, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}


/**
 * UNIX秒 (サーバー時間) を Dateオブジェクトに変換する
 */
function unixTimeToDate(unixtime) {
    return new Date(unixtime * 1000);
}

/**
 * 日付オブジェクトを MM/DD HH:MM 形式にフォーマットする
 */
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

/**
 * 前回討伐日時を相対/絶対形式でフォーマットする
 */
function formatLastKillTime(dateInput) {
    const date = (dateInput instanceof Date) ? dateInput : new Date(dateInput);
    if (!date || isNaN(date.getTime())) {
        return 'N/A';
    }

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);

    if (diffMinutes < 60 && diffMinutes >= 0) {
        return `${diffMinutes}分前`; // 1時間以内: X分前
    } else {
        return formatDateForDisplay(date); // 1時間以上: 絶対時刻
    }
}

/**
 * ミリ秒を HHh MMm 形式に変換し、接頭辞を付けます。
 */
function formatDurationPart(ms, prefix = '') {
    const totalMinutes = Math.floor(ms / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');

    return `${prefix}${formattedHours}h ${formattedMinutes}m`;
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
    const jstOffsetMinutes = -540; // JST (UTC+9) のオフセット (-540分)
    const localOffsetMinutes = localDate.getTimezoneOffset(); // ローカルタイムゾーンのオフセット
    const offsetDifference = localOffsetMinutes - jstOffsetMinutes; // 差分を求める

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
    const loadingClasses = ['bg-blue-800', 'text-blue-100', 'rounded-lg'];

    if (message) {
        errorMessageContainer.classList.remove('hidden');

        const isError = !message.includes('更新中') && !message.includes('ロード中');

        errorMessageContainer.className = ''; // クラスをリセット
        if (isError) {
            errorMessageContainer.classList.add(...baseClasses, ...errorClasses);
        } else {
            errorMessageContainer.classList.add(...baseClasses, ...loadingClasses);
        }

        errorMessageContainer.innerHTML = `<div>${message}</div>`;
    } else {
        errorMessageContainer.classList.add('hidden');
        errorMessageContainer.className = ''; // クラスをリセット
        errorMessageContainer.innerHTML = '';
    }
}


/**
 * 討伐日時からリポップ情報を計算する
 * @returns {object} minRepop, timeDisplay, elapsedPercent, isPop, isMaxOver, isUnknown, repopSortTime(Date.getTime() or Infinity)
 */
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
    // 【新規】ソートキー: リポップ開始時刻 (Date.getTime())。不明な場合はInfinityで最後にソート
    let repopSortTime = Infinity; 

    if (repopMinMs <= 0 || repopMaxMs <= repopMinMs) {
        return { minRepop: 'N/A', maxRepop: 'N/A', timeDisplay: 'N/A', isPop: false, isMaxOver: false, isUnknown: true, elapsedPercent: 0, repopSortTime: Infinity };
    }

    if (isUnknown) {
        minRepopTime = new Date(now.getTime() + repopMinMs);
        
        const remainingMsToMin = minRepopTime.getTime() - now.getTime();
        const remainingMinutes = Math.ceil(remainingMsToMin / 60000);

        if (remainingMinutes < 60 && remainingMinutes >= 0) {
            timeRemainingStr = `Next: ${remainingMinutes}分後`;
        } else {
            timeRemainingStr = `Next: ${formatDateForDisplay(minRepopTime)}`;
        }
        
        elapsedPercent = 0;
        repopSortTime = minRepopTime.getTime(); // 不明時は「最速湧き開始時間」でソート
        
    } else {
        minRepopTime = new Date(killTime.getTime() + repopMinMs);
        maxRepopTime = new Date(killTime.getTime() + repopMaxMs);

        const remainingMsToMin = minRepopTime.getTime() - now.getTime();

        if (remainingMsToMin > 0) {
            // Phase 1: Pre-Min Repop
            isPop = false;
            
            const remainingMinutes = Math.ceil(remainingMsToMin / 60000);

            if (remainingMinutes < 60 && remainingMinutes >= 0) {
                timeRemainingStr = `Next: ${remainingMinutes}分後`;
            } else {
                timeRemainingStr = `Next: ${formatDateForDisplay(minRepopTime)}`;
            }
            
            elapsedPercent = 0;
            repopSortTime = minRepopTime.getTime();

        } else {
            // Phase 2 & 3: In or After POP Window
            isPop = true;
            repopSortTime = minRepopTime.getTime(); // 湧き始め時間をソートキーに

            const remainingMsToMax = maxRepopTime.getTime() - now.getTime();

            if (remainingMsToMax > 0) {
                // Phase 2: In POP Window
                isMaxOver = false;
                const elapsedInWindowMs = now.getTime() - minRepopTime.getTime();
                elapsedPercent = Math.max(0, Math.min(100, (elapsedInWindowMs / popDurationMs) * 100));

                const duration = formatDurationPart(remainingMsToMax);
                timeRemainingStr = `${elapsedPercent.toFixed(1)}% (残り ${duration})`;

            } else {
                // Phase 3: Max Repop Exceeded
                isMaxOver = true;
                const popElapsedMs = now.getTime() - maxRepopTime.getTime();
                const formattedElapsed = formatDurationPart(popElapsedMs, '+');
                timeRemainingStr = `100.0% (${formattedElapsed})`;
                elapsedPercent = 100;
                // Max Over の場合、minRepopTime をそのままソートキーにすると古いものが上位に来るため、
                // 最新の討伐時刻をソートキーとする（ただしソートキーが'Repop'の場合のみ）
                repopSortTime = maxRepopTime.getTime(); 
            }
        }
    }

    return { minRepop: minRepopTime, maxRepop: maxRepopTime, timeDisplay: timeRemainingStr, elapsedPercent: elapsedPercent, isPop: isPop, isMaxOver: isMaxOver, isUnknown: isUnknown, repopSortTime: repopSortTime };
}

/**
 * MobNoからモブデータを取得する
 */
function getMobByNo(mobNo) {
    return globalMobData.find(mob => mob['No.'] === parseInt(mobNo));
}


// --- フィルタ状態の保存/ロード ---

/**
 * 現在のフィルタ状態をlocalStorageに保存する
 */
function saveFilterState() {
    try {
        const stateToSave = {
            rank: currentFilter.rank,
            areaSets: {},
            sort: currentSort // 【新規】ソート状態を保存
        };
        for (const rank in currentFilter.areaSets) {
            stateToSave.areaSets[rank] = Array.from(currentFilter.areaSets[rank]);
        }
        localStorage.setItem('huntFilterState', JSON.stringify(stateToSave));
    } catch (e) {
        console.error('Failed to save filter state to localStorage:', e);
    }
}

/**
 * localStorageからフィルタ状態をロードする
 */
function loadFilterState() {
    try {
        const savedState = localStorage.getItem('huntFilterState');
        if (savedState) {
            const parsedState = JSON.parse(savedState);

            if (parsedState.rank && (TARGET_RANKS.includes(parsedState.rank) || parsedState.rank === 'ALL')) {
                currentFilter.rank = parsedState.rank;
            }

            if (parsedState.areaSets) {
                for (const rank in parsedState.areaSets) {
                    if (TARGET_RANKS.includes(rank) && Array.isArray(parsedState.areaSets[rank])) {
                        currentFilter.areaSets[rank] = new Set(parsedState.areaSets[rank]);
                    }
                }
            }

            // 【新規】ソート状態のロード
            if (parsedState.sort && parsedState.sort.key) {
                currentSort.key = parsedState.sort.key;
                currentSort.direction = parsedState.sort.direction || 'asc';
            }
        }
    } catch (e) {
        console.error('Failed to load filter state from localStorage:', e);
    }
}


// --- 固定ヘッダーの高さ調整 ---

/**
 * 固定ヘッダーの高さを取得し、スペーサーに適用してスクロールの重なりを防ぐ
 */
function adjustContentPadding() {
    if (fixedHeaderContent && contentSpacer) {
        const headerHeight = fixedHeaderContent.offsetHeight;
        contentSpacer.style.paddingTop = `${headerHeight}px`;
    }
}


// --- DOM操作/イベントハンドラ ---

/**
 * モブデータに基づいてHTMLカードを生成する
 */
function createMobCard(mob) {
    const lastKillDate = mob.LastKillDate ? new Date(mob.LastKillDate) : null;
    const { minRepop, timeDisplay, elapsedPercent, isPop, isMaxOver, isUnknown, repopSortTime } = calculateRepop(mob, lastKillDate);

    // 【新規】ソート用データ属性
    const sortTime = repopSortTime || Infinity;
    const killTimeMs = lastKillDate ? lastKillDate.getTime() : 0;
    const mobNameSort = mob.Name.toLowerCase();

    let repopTimeColorClass = 'text-white font-mono'; 
    if (isUnknown) {
        repopTimeColorClass = 'text-gray-400 font-mono';
    } else if (!isPop) {
        repopTimeColorClass = 'text-green-400 font-mono';
    }

    let rankBgClass;
    let rankTextColor = 'text-white';
    switch (mob.Rank) {
        case 'S': rankBgClass = 'bg-red-600'; break;
        case 'A': rankBgClass = 'bg-blue-600'; break;
        case 'B': rankBgClass = 'bg-gray-600'; break;
        case 'F': rankBgClass = 'bg-purple-600'; break;
        default: rankBgClass = 'bg-gray-600';
    }

    const mobNameContainerClass = 'min-w-0 flex-1';
    
    const isARank = mob.Rank === 'A';
    const reportBtnClass = isARank ? 'instant-report-btn' : 'report-btn';
    const reportBtnHtml = `
        <button class="bg-green-600 hover:bg-green-500 active:bg-green-700 ${reportBtnClass} text-white px-1 py-1 rounded-md shadow-md transition h-10 w-10 flex flex-col items-center justify-center leading-none flex-shrink-0"
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

    const minRepopStr = formatDateForDisplay(minRepop);
    const minRepopHtml = `
        <div class="px-4 pt-1 pb-1 repop-start-content flex justify-end">
            <p class="text-sm font-semibold text-gray-400">開始時間: <span class="text-base text-gray-200 font-mono">${minRepopStr}</span></p>
        </div>
    `;

    const lastKillDisplay = formatLastKillTime(lastKillDate);
    const lastKillHtml = `
        <div class="px-4 pt-1 pb-1 last-kill-content flex justify-end">
            <p class="text-sm font-semibold text-gray-400">前回時間: <span class="text-base text-gray-200 font-mono">${lastKillDisplay}</span></p>
        </div>
    `;
    
    const lastKillMemo = mob.LastKillMemo || '';
    const lastKillMemoHtml = lastKillMemo ? `
        <div class="px-4 pt-1 pb-1 last-kill-memo-content text-left">
            <p class="text-sm font-semibold text-gray-400">Memo: 
                <span class="text-sm text-gray-200 font-sans font-normal">${processText(lastKillMemo)}</span>
            </p>
        </div>
    ` : '';


    const mapDetailsHtml = mob.Map ? `
        <div class="mob-details pt-1 px-4 text-center map-content">
            <div class="relative inline-block w-full max-w-sm">
                <img src="./maps/${mob.Map}" alt="${mob.Area} Map" class="w-full h-auto rounded-lg shadow-md map-image" data-area="${mob.Area}">
                <div class="absolute inset-0 map-overlay" data-area="${mob.Area}"></div>
            </div>
        </div>
    ` : '';

    let panelContent = conditionHtml + minRepopHtml + lastKillHtml + lastKillMemoHtml + mapDetailsHtml;
    if (panelContent.trim()) {
        panelContent = `<div class="panel-padding-bottom">${panelContent}</div>`;
    }

    const expandablePanel = panelContent.trim() ? `
        <div class="expandable-panel overflow-hidden transition-all duration-300 ease-in-out max-height-0 pt-0 px-0">
            ${panelContent}
        </div>
    ` : '';

    // --- 進捗バーエリアのHTML ---
    const repopInfoHtml = `
        <div class="mt-1 bg-gray-700 p-1.5 rounded-xl text-xs relative overflow-hidden shadow-inner h-10">
            <div class="progress-bar absolute inset-0 transition-all duration-100 ease-linear" style="z-index: 0;"></div>
            <div class="absolute inset-0 flex items-center justify-center z-10">
                <span class="repop-info-display text-lg font-mono w-full text-center ${repopTimeColorClass}">
                    ${timeDisplay}
                </span>
            </div>
        </div>
    `;

    // --- モブカードの最終構造 ---
    const isOpenClass = (mob['No.'] === openMobCardNo) ? 'open' : '';
    const cardHtml = document.createElement('div');
    cardHtml.className = `mob-card bg-gray-800 rounded-xl shadow-2xl overflow-hidden relative py-2 mb-3 ${isOpenClass}`;
    // 【新規】ソート用/フィルタリング用データ属性を全て持つ
    cardHtml.setAttribute('data-rank', mob.Rank);
    cardHtml.setAttribute('data-mobno', mob['No.']);
    cardHtml.setAttribute('data-lastkill', mob.LastKillDate || '');
    cardHtml.setAttribute('data-minrepop', mob['REPOP(s)']);
    cardHtml.setAttribute('data-maxrepop', mob['MAX(s)']);
    cardHtml.setAttribute('data-expansion', mob.Expansion || '?');
    cardHtml.setAttribute('data-sort-no', mob['No.']);
    cardHtml.setAttribute('data-sort-repop-time', sortTime);
    cardHtml.setAttribute('data-sort-kill-time', killTimeMs);
    cardHtml.setAttribute('data-sort-name', mobNameSort);

    cardHtml.innerHTML = `
        <div class="p-2 fixed-content toggle-handler cursor-pointer">
            <div class="flex justify-between items-start mb-1">
                <div class="flex items-center space-x-2">
                    <div class="rank-icon ${rankBgClass} ${rankTextColor} font-bold text-sm w-7 h-7 flex items-center justify-center rounded-lg shadow-lg flex-shrink-0">
                        ${mob.Rank}
                    </div>
                    
                    <div class="px-1 ${mobNameContainerClass}">
                    <h2 class="text-base font-bold text-outline text-yellow-200 leading-tight truncate overflow-hidden whitespace-nowrap mob-name">${mob.Name}</h2>
                    <p class="text-xs text-gray-400 leading-tight truncate overflow-hidden whitespace-nowrap mob-area">${mob.Area} (${mob.Expansion || '?'})</p>
                    </div>
                </div>

                ${reportBtnHtml}
            </div>

            ${repopInfoHtml}
        </div>

        ${expandablePanel}
    `;

    return cardHtml;
}


/**
 * フィルターに基づいてモブカードリストをレンダリングする
 * 【v2.0 変更点】DOMの生成/初期配置のみ行い、ソートとカラム振り分けは別関数に分離。
 */
function renderMobList() {
    const { rank } = currentFilter;
    let filteredMobs = [];
    const activeRanks = rank === 'ALL' ? TARGET_RANKS : [rank];

    // 1. フィルタリング
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
    
    // 2. マスターコンテナのカードを更新/生成
    const existingCards = Array.from(mobContainer.querySelectorAll('.mob-card'));
    const existingMobNos = new Set(existingCards.map(c => parseInt(c.dataset.mobno)));

    // 2.1. 不要なカードを削除 (フィルタで非表示にするのではなくDOMから削除)
    existingCards.forEach(card => {
        const mobNo = parseInt(card.dataset.mobno);
        const existsInFiltered = filteredMobs.some(mob => mob['No.'] === mobNo);
        if (!existsInFiltered) {
            mobContainer.removeChild(card);
        }
    });

    // 2.2. 必要なカードを生成または移動
    filteredMobs.forEach(mob => {
        const mobNo = mob['No.'];
        let card = mobContainer.querySelector(`.mob-card[data-mobno="${mobNo}"]`);

        if (!card) {
            // 新規カード生成
            card = createMobCard(mob);
            mobContainer.appendChild(card);
        } else {
            // 既存カードのデータを更新（必要であれば、ただしデータはglobalMobDataにあるため主にソートキー）
            const lastKillDate = mob.LastKillDate ? new Date(mob.LastKillDate) : null;
            const { repopSortTime } = calculateRepop(mob, lastKillDate);
            card.setAttribute('data-sort-repop-time', repopSortTime || Infinity);
            card.setAttribute('data-sort-kill-time', lastKillDate ? lastKillDate.getTime() : 0);
        }
    });


    // 3. ソートとカラム振り分けを実行
    sortAndRedistribute();

    // 4. UIのハイライト更新
    if (rankTabs) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            const isActive = btn.dataset.rank === rank;
            btn.classList.toggle('bg-blue-600', isActive);
            btn.classList.toggle('hover:bg-blue-500', isActive);
            btn.classList.toggle('bg-gray-700', !isActive);
            btn.classList.toggle('hover:bg-gray-600', !isActive);
        });
    }

    const currentRankForAreaFilter = TARGET_RANKS.includes(rank) ? rank : 'S';
    const currentAreasToHighlight = currentFilter.areaSets[currentRankForAreaFilter] || new Set(['ALL']);

    document.querySelectorAll('.area-filter-btn').forEach(btn => {
        const isSelected = currentAreasToHighlight.has(btn.dataset.area);
        btn.classList.toggle('bg-blue-600', isSelected);
        btn.classList.toggle('hover:bg-blue-500', isSelected);
        btn.classList.toggle('bg-gray-600', !isSelected);
        btn.classList.toggle('hover:bg-gray-500', !isSelected);
    });

    // イベントリスナーの再アタッチは不要（Event Delegationのため）
    updateProgressBars();
    saveFilterState();
}

/**
 * 【新規】DOM内のカードを現在のソート状態に従って並び替える
 */
function sortDOMCards() {
    const cards = Array.from(mobContainer.querySelectorAll('.mob-card'));
    const { key, direction } = currentSort;
    const isAsc = direction === 'asc';

    cards.sort((a, b) => {
        let valA, valB;

        switch (key) {
            case 'RepopTime':
                // リポップ予想時刻 (number)
                valA = parseFloat(a.dataset.sortRepopTime);
                valB = parseFloat(b.dataset.sortRepopTime);
                break;
            case 'KillTime':
                // 前回討伐日時 (number)
                valA = parseFloat(a.dataset.sortKillTime);
                valB = parseFloat(b.dataset.sortKillTime);
                break;
            case 'Name':
                // モブ名 (string)
                valA = a.dataset.sortName;
                valB = b.dataset.sortName;
                break;
            case 'No.':
            default:
                // No. (number)
                valA = parseInt(a.dataset.sortNo);
                valB = parseInt(b.dataset.sortNo);
                break;
        }

        if (typeof valA === 'number') {
            return isAsc ? valA - valB : valB - valA;
        } else {
            // 文字列比較
            if (valA < valB) return isAsc ? -1 : 1;
            if (valA > valB) return isAsc ? 1 : -1;
            return 0;
        }
    });

    // 既存のカードをソートされた順序でDOMに再配置
    cards.forEach(card => mobContainer.appendChild(card));
}

/**
 * 【新規】現在のウィンドウ幅に基づいてカラム数を決定する
 */
function determineColumnCount() {
    // 【CSSのブレークポイントと同期させる】
    // このロジックは、CSSのメディアクエリに合わせる必要があります
    const width = window.innerWidth;

    if (width >= 1280) { // 例: xl: 3 columns
        return 3;
    } else if (width >= 768) { // 例: md: 2 columns
        return 2;
    } else { // 1 column
        return 1;
    }
}

/**
 * 【新規】ソートされたカードをレスポンシブなカラムに振り分ける
 */
function distributeCards() {
    const columnCount = determineColumnCount();
    const sortedCards = Array.from(mobContainer.querySelectorAll('.mob-card'));

    // 既存のカラムをクリア (innerHTML = '' ではなく、DOM要素を移動させるため空にする)
    columns.forEach(col => col.innerHTML = '');

    sortedCards.forEach((card, index) => {
        // カラムが十分にあるか確認
        if (index % columnCount < columns.length) {
            const targetColumn = columns[index % columnCount];
            // appendChildは要素を元の場所から移動させる
            targetColumn.appendChild(card);
        }
    });

    // 余ったカードをマスターコンテナに戻す（このケースでは通常発生しないが安全策）
    // mobContainerには残りのカードが残っているため、ここで一括で移動させている。
    // 今回の実装では、mobContainerから直接sortedCardsを取得し、カラムに振り分けているため、
    // mobContainerは振り分け後に空になります。（appendChildによる移動のため）
    
    // カラムヘッダーの高さを再調整
    adjustContentPadding();
}


/**
 * 【新規】ソートとカラム振り分けを同時に実行するデバウンスされた関数
 */
const sortAndRedistribute = debounce(() => {
    sortDOMCards();
    distributeCards();
}, 200); // 200ms のデバウンス


// 【イベント委譲のためのメインイベントハンドラ】
function handleMobCardClick(e) {
    const card = e.target.closest('.mob-card');
    if (!card) return;

    // 報告ボタンの処理
    const reportBtn = e.target.closest('.report-btn, .instant-report-btn');
    if (reportBtn) {
        e.stopPropagation();
        const mobNo = reportBtn.dataset.mobno;
        if (reportBtn.classList.contains('instant-report-btn')) {
            instantARankReport(mobNo);
        } else {
            openReportModal(mobNo);
        }
        return;
    }

    // トグルエリアの処理 (固定ヘッダー部分)
    const toggleHandler = e.target.closest('.toggle-handler');
    if (toggleHandler) {
        toggleMobDetails(card);
        return;
    }
}


async function instantARankReport(mobNo) {
    const mob = getMobByNo(parseInt(mobNo));
    if (!mob) return;

    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    const killTimeLocal = (new Date(now.getTime() - offset)).toISOString().slice(0, 16);
    const killTimeJstIso = toJstAdjustedIsoString(killTimeLocal);

    displayError(`${mob.Name} (A) を即時報告中...`);

    try {
        const response = await fetch(GAS_ENDPOINT, {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                action: 'reportKill',
                mobNo: mobNo,
                mobName: mob.Name,
                rank: mob.Rank,
                killTime: killTimeJstIso,
                memo: `[AUTO REPORT: ${formatDateForDisplay(now)}]`,
                reporterId: userId
            })
        });

        const result = await response.json();

        if (result.status === 'success') {
            displayError(`${mob.Name} (A) の報告成功！`);
            await fetchRecordsAndUpdate('manual', false);
            setTimeout(() => displayError(null), 1500);
        } else {
            displayError(`${mob.Name} (A) の報告失敗: ${result.message}`);
        }
    } catch (error) {
        console.error('Aモブ即時報告エラー:', error);
        displayError(`Aモブ即時報告エラー: サーバー通信に失敗。`);
    }
}


/**
 * マップ詳細パネルの表示/非表示を切り替える
 */
function toggleMobDetails(card) {
    const mobNo = parseInt(card.dataset.mobno);
    const mob = getMobByNo(mobNo);
    const panel = card.querySelector('.expandable-panel');

    if (!panel) return;

    // 排他的開閉ロジック
    const isCurrentlyOpen = card.classList.contains('open');

    // 既に開いているカードがあれば閉じる
    if (openMobCardNo !== null && openMobCardNo !== mobNo) {
        const currentlyOpenCard = document.querySelector(`.mob-card[data-mobno="${openMobCardNo}"]`);
        if (currentlyOpenCard) {
            currentlyOpenCard.classList.remove('open');
            const openPanel = currentlyOpenCard.querySelector('.expandable-panel');
            if (openPanel) {
                openPanel.style.maxHeight = '0';
            }
        }
    }
    
    // 開閉フラグを更新
    openMobCardNo = isCurrentlyOpen ? null : mobNo;


    panel.style.transition = 'max-height 0.3s ease-in-out';

    if (isCurrentlyOpen) {
        // 閉じる処理
        panel.style.maxHeight = '0';
        card.classList.remove('open');
    } else {
        // 開く処理
        card.classList.add('open');
        
        // 1. スポーンポイントの描画
        const mapOverlay = panel.querySelector('.map-overlay');
        if (mapOverlay && mob.spawn_points) {
            drawSpawnPoints(mapOverlay, mob.spawn_points, mobNo);
        }

        // 2. 瞬時に max-height を解除し、コンテンツの最終的な高さを取得
        panel.style.maxHeight = 'none';
        const targetHeight = panel.scrollHeight;

        // 3. max-heightを 0 に設定し、アニメーションの開始点に戻す
        panel.style.maxHeight = '0';

        // 4. 取得した高さに安全マージンを加えてアニメーションを開始
        setTimeout(() => {
            panel.style.maxHeight = (targetHeight + 5) + 'px';

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
 * マップにスポーンポイントを描画する (ロジック変更なし)
 */
function drawSpawnPoints(overlayEl, spawnPoints, currentMobNo) {
    overlayEl.innerHTML = '';
    const mob = getMobByNo(parseInt(currentMobNo));

    if (!mob || !mob.cullStatusMap) return;

    const SA_OUTER_DIAMETER = '12px';
    const SA_BORDER_WIDTH = '2px';
    const SA_SHADOW = '0 0 8px 1px';

    const B1_INTERNAL_COLOR = '#60a5fa'; // Blue-400
    const B2_INTERNAL_COLOR = '#f87171'; // Red-400

    const cullTargetPoints = spawnPoints.filter(point =>
        point.mob_ranks.includes('S') || point.mob_ranks.includes('A')
    );

    let remainingCullCount = cullTargetPoints.filter(point => !mob.cullStatusMap[point.id]).length;

    const shouldInvertBOnlyPoints = remainingCullCount === 1;

    spawnPoints.forEach(point => {
        const isS_A_Point = point.mob_ranks.includes('S') || point.mob_ranks.includes('A');
        const includesB1 = point.mob_ranks.includes('B1');
        const includesB2 = point.mob_ranks.includes('B2');
        const isCullTarget = isS_A_Point;

        if (!isCullTarget) {
            if (point.mob_ranks.length === 1 && (includesB1 || includesB2)) {
                const pointEl = document.createElement('div');
                pointEl.className = 'spawn-point-b-only';
                
                const baseSize = 10;
                const newSize = baseSize - 2;
                
                pointEl.style.cssText = `
                    position: absolute; left: ${point.x}%; top: ${point.y}%; transform: translate(-50%, -50%);
                    width: ${newSize}px; height: ${newSize}px; border-radius: 50%; z-index: 5; pointer-events: none;
                    background-color: ${includesB1 ? B1_INTERNAL_COLOR : B2_INTERNAL_COLOR};
                    box-shadow: 0 0 4px rgba(0, 0, 0, 0.7);
                `;

                if (shouldInvertBOnlyPoints) {
                    pointEl.style.backgroundColor = 'rgba(100, 100, 100, 1.0)';
                    pointEl.style.boxShadow = 'none';
                }
                
                overlayEl.appendChild(pointEl);
            }
            return;
        }

        const isCulled = mob.cullStatusMap[point.id] || false;
        let outlineColor = '#9ca3af';
        let internalColor = '#d1d5db';

        if (includesB1) {
            outlineColor = '#3b82f6';
            internalColor = '#60a5fa';
        } else if (includesB2) {
            outlineColor = '#ef4444';
            internalColor = '#f87171';
        }

        const isLastPoint = !isCulled && remainingCullCount === 1;

        if (isLastPoint) {
            outlineColor = '#10b981';
            internalColor = '#34d399';
        }

        const pointEl = document.createElement('div');
        pointEl.className = `spawn-point cursor-pointer`;
        pointEl.setAttribute('data-id', point.id);
        pointEl.setAttribute('data-isculltarget', 'true');

        pointEl.style.cssText = `
            position: absolute; left: ${point.x}%; top: ${point.y}%; transform: translate(-50%, -50%);
            width: ${SA_OUTER_DIAMETER}; height: ${SA_OUTER_DIAMETER}; border-radius: 50%; z-index: 10;
            pointer-events: all; transition: transform 0.1s ease-out, box-shadow 0.2s ease-out, border 0.2s ease-out, background-color 0.2s ease-out;
        `;


        if (isCulled) {
            pointEl.classList.add('culled');
            pointEl.style.border = `${SA_BORDER_WIDTH} solid white`;
            pointEl.style.backgroundColor = 'rgba(100, 100, 100, 1.0)';
            pointEl.style.boxShadow = 'none';
        } else {
            pointEl.style.border = `${SA_BORDER_WIDTH} solid ${outlineColor}`;
            pointEl.style.backgroundColor = internalColor;
            pointEl.style.boxShadow = `${SA_SHADOW} ${outlineColor}`;

            pointEl.onmouseenter = () => { pointEl.style.zIndex = '11'; };
            pointEl.onmouseleave = () => { pointEl.style.zIndex = '10'; };
        }

        pointEl.onclick = (e) => {
            e.stopPropagation();
            toggleCullStatus(mob['No.'], point.id, !isCulled);
        };

        overlayEl.appendChild(pointEl);
    });
}

/**
 * 湧き潰し状態のトグル
 */
async function toggleCullStatus(mobNo, pointId, isCulled) {
    const mob = getMobByNo(parseInt(mobNo));
    if (!mob) return;

    // ローカルデータを即時更新してUIをフィードバック
    mob.cullStatusMap[pointId] = isCulled;
    
    // UIを再描画（主にマップ上の点を更新）
    const card = document.querySelector(`.mob-card[data-mobno="${mobNo}"]`);
    const mapOverlay = card ? card.querySelector('.map-overlay') : null;
    if (mapOverlay) {
        drawSpawnPoints(mapOverlay, mob.spawn_points, mobNo);
    }
    
    // サーバーに状態を送信
    try {
        const response = await fetch(GAS_ENDPOINT, {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                action: 'setCullStatus',
                mobNo: mobNo,
                pointId: pointId,
                isCulled: isCulled ? 'TRUE' : 'FALSE',
                reporterId: userId
            })
        });

        const result = await response.json();
        if (result.status !== 'success') {
            console.error('湧き潰し状態の更新失敗:', result.message);
            displayError('湧き潰し状態の更新に失敗しました。');
            setTimeout(() => displayError(null), 3000);
            // 失敗時はUIを元に戻すかどうかは今回は考慮しない
        } else {
            // サーバー更新成功
        }
    } catch (error) {
        console.error('湧き潰し状態の通信エラー:', error);
        displayError('湧き潰し状態の通信エラー。');
        setTimeout(() => displayError(null), 3000);
    }
}


// --- モーダル/フォーム操作 ---

function openReportModal(mobNo) {
    // ... (関数の中身は変更なし)
    if (!reportModal || !modalMobName || !reportDatetimeInput || !submitReportBtn) return;

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

    submitReportBtn.textContent = '報告する';
    submitReportBtn.disabled = false;
    submitReportBtn.classList.remove('bg-gray-500', 'bg-red-600', 'hover:bg-red-500');
    submitReportBtn.classList.add('bg-green-600', 'hover:bg-green-500');

    reportModal.classList.remove('hidden');
    reportModal.classList.add('flex');
}

function closeReportModal() {
    // ... (関数の中身は変更なし)
    if (!reportModal) return;
    reportModal.classList.add('hidden');
    reportModal.classList.remove('flex');
    currentMobNo = null;
}

async function submitReport() {
    // ... (関数の中身は変更なし)
    if (!currentMobNo || !reportDatetimeInput || !submitReportBtn || !reportStatusEl) return;

    const killTimeLocal = reportDatetimeInput.value;
    const memo = reportMemoInput.value;
    const mob = getMobByNo(currentMobNo);

    if (!mob || !killTimeLocal) return;

    const killTimeJstIso = toJstAdjustedIsoString(killTimeLocal);

    submitReportBtn.disabled = true;
    submitReportBtn.textContent = '送信中...';
    submitReportBtn.className = 'w-full px-4 py-2 bg-gray-500 text-white font-bold rounded-lg shadow-lg transition-colors duration-200';

    reportStatusEl.classList.remove('hidden', 'text-green-500', 'text-red-500');
    reportStatusEl.textContent = 'サーバーに送信中...';

    try {
        const response = await fetch(GAS_ENDPOINT, {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
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

            submitReportBtn.textContent = '報告完了';
            submitReportBtn.className = 'w-full px-4 py-2 bg-green-600 text-white font-bold rounded-lg shadow-lg transition-colors duration-200';
            submitReportBtn.disabled = false;
            
            await fetchRecordsAndUpdate('manual', false);
            setTimeout(closeReportModal, 1500);

        } else {
            reportStatusEl.textContent = `報告失敗: ${result.message}`;
            reportStatusEl.classList.add('text-red-500');
            submitReportBtn.textContent = '送信失敗';
            submitReportBtn.className = 'w-full px-4 py-2 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-bold rounded-lg shadow-lg transition-colors duration-200';
            submitReportBtn.disabled = false;
        }

    } catch (error) {
        console.error('報告エラー:', error);
        reportStatusEl.textContent = '通信エラーが発生しました。';
        reportStatusEl.classList.add('text-red-500');
        submitReportBtn.textContent = '送信失敗';
        submitReportBtn.className = 'w-full px-4 py-2 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-bold rounded-lg shadow-lg transition-colors duration-200';
        submitReportBtn.disabled = false;
    }
}


// --- データ取得/更新 ---

/**
 * 外部JSONからモブデータを取得し、`No.`から`Expansion`を決定する
 */
async function fetchBaseMobData() {
    // ... (関数の中身は変更なし)
    try {
        const response = await fetch(MOB_DATA_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const jsonData = await response.json();

        if (jsonData && Array.isArray(jsonData.mobConfig)) {
            baseMobData = jsonData.mobConfig
                .map(mob => {
                    const mobNo = parseInt(mob['No.']);
                    const expansionKey = Math.floor(mobNo / 10000);
                    const expansionName = EXPANSION_MAP[expansionKey] || '';

                    if (!expansionName && mob.Rank !== 'B') return null;

                    return { ...mob, 'No.': mobNo, Expansion: expansionName };
                })
                .filter(mob => mob !== null);
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
async function fetchRecordsAndUpdate(updateType = 'initial', shouldFetchBase = true) {

    if (shouldFetchBase) {
        displayError(`設定データをロード中...`);
        await fetchBaseMobData();
        adjustContentPadding();
        if (baseMobData.length === 0) {
            displayError(`致命的なエラー: モブ設定データを読み込めませんでした。`);
            return;
        }
    }

    const shouldDisplayLoading = (updateType === 'initial' || updateType === 'manual' || autoUpdateSuccessCount === 0);
    if (shouldDisplayLoading) {
        displayError(`データを更新中…`);
    }

    // 初回/手動ロード時のみ、暫定表示（既存のDOMがあれば）
    if (updateType === 'initial' || updateType === 'manual') {
        globalMobData = [...baseMobData];
        renderMobList(); 
    }

    try {
        const response = await fetch(GAS_ENDPOINT + '?action=getRecords');
        const data = await response.json();

        if (data.status === 'success') {
            const records = data.records;
            const cullStatuses = data.cullStatuses || [];

            // データをマージして globalMobData を再構築
            globalMobData = baseMobData.map(mob => {
                const mobNo = mob['No.'];
                const record = records.find(r => r['No.'] === mobNo);
                const newMob = { ...mob };

                // 討伐記録の反映
                if (record && record.POP_Date_Unix) {
                    newMob.LastKillDate = unixTimeToDate(record.POP_Date_Unix).toLocaleString();
                    newMob.LastKillMemo = record.Memo || '';
                } else {
                    newMob.LastKillDate = '';
                    newMob.LastKillMemo = '';
                }

                // 湧き潰し状態の反映
                newMob.cullStatusMap = {};
                cullStatuses
                    .filter(status => status.Mob_No === mobNo)
                    .forEach(status => {
                        newMob.cullStatusMap[status.Point_ID] = status.Is_Culled === 'TRUE';
                    });

                return newMob;
            });

            if (updateType === 'auto') {
                autoUpdateSuccessCount++;
            }
            
            displayError(null);
            adjustContentPadding();
            renderMobList();

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
 * 各モブカードの進捗バーを更新する (60秒ごと)
 * 【v2.0 変更点】進捗バーと同時にソートキーのデータ属性も更新する
 */
function updateProgressBars() {

    const ORANGE_BAR_COLOR = 'bg-orange-400/70';
    const YELLOW_BAR_COLOR = 'bg-yellow-400/70';
    const LIME_BAR_COLOR = 'bg-lime-500/70';
    const NEXT_TEXT_COLOR = 'text-green-400';

    let shouldResort = false;

    document.querySelectorAll('.mob-card').forEach(card => {
        const lastKillStr = card.dataset.lastkill;
        const repop = parseInt(card.dataset.minrepop);
        const max = parseInt(card.dataset.maxrepop);

        const lastKillDate = lastKillStr ? new Date(lastKillStr) : null;
        
        const repopData = calculateRepop({"REPOP(s)": repop, "MAX(s)": max}, lastKillDate);
        const percent = repopData.elapsedPercent || 0;

        const repopInfoDisplayEl = card.querySelector('.repop-info-display');
        const progressBarEl = card.querySelector('.progress-bar');
        
        // 【v2.0: ソートキーの更新】
        const oldRepopSortTime = parseFloat(card.dataset.sortRepopTime);
        const newRepopSortTime = repopData.repopSortTime;

        if (oldRepopSortTime !== newRepopSortTime) {
            card.setAttribute('data-sort-repop-time', newRepopSortTime);
            if (currentSort.key === 'RepopTime') {
                shouldResort = true; // ソートキーが変わったら再ソートフラグを立てる
            }
        }


        // --- 1. 表示テキストと色の更新 ---
        if (repopInfoDisplayEl) {
            repopInfoDisplayEl.textContent = repopData.timeDisplay;
            
            repopInfoDisplayEl.classList.remove('text-gray-400', NEXT_TEXT_COLOR, 'text-white', 'font-extrabold');
            repopInfoDisplayEl.classList.add('font-mono');

            if (repopData.isUnknown) {
                repopInfoDisplayEl.classList.add('text-gray-400');
            } else if (!repopData.isPop) {
                repopInfoDisplayEl.classList.add(NEXT_TEXT_COLOR);
            } else {
                repopInfoDisplayEl.classList.add('text-white');
            }
        }

        // --- 2. プログレスバーの更新ロジック ---
        if (progressBarEl) {
            let barColorClass = '';
            let widthPercent = Math.min(100, percent);
            let animateClass = '';

            if (!repopData.isPop || repopData.isUnknown) {
                widthPercent = 0;
            } else if (repopData.isMaxOver) {
                barColorClass = ORANGE_BAR_COLOR;
                widthPercent = 100;
                animateClass = 'animate-pulse';
            } else if (percent >= 80) {
                barColorClass = ORANGE_BAR_COLOR;
            } else if (percent >= 60) {
                barColorClass = YELLOW_BAR_COLOR;
            } else {
                barColorClass = LIME_BAR_COLOR;
            }

            progressBarEl.className = `progress-bar absolute inset-0 transition-all duration-100 ease-linear rounded-xl ${barColorClass} ${animateClass}`;
            progressBarEl.style.height = '100%';
            progressBarEl.style.width = `${widthPercent}%`;
        }
    });

    // リポップ時刻順ソートの場合、キー値が変更されたら再ソート
    if (shouldResort) {
        sortAndRedistribute.call(window);
    }
}

/**
 * エリアフィルタパネルの開閉をトグルする (アニメーション付き)
 */
function toggleAreaFilterPanel(forceOpen) {
    // ... (関数の中身は変更なし)
    if (!areaFilterWrapper || !areaFilterContainer) return;

    const isOpen = areaFilterWrapper.classList.contains('open');
    let shouldOpen = (typeof forceOpen === 'boolean') ? forceOpen : !isOpen;

    areaFilterWrapper.style.pointerEvents = 'none';

    if (shouldOpen) {
        // --- 開く処理 ---
        areaFilterWrapper.classList.add('open');
        adjustContentPadding();

        areaFilterWrapper.style.maxHeight = 'none';
        const targetHeight = areaFilterContainer.offsetHeight;
        areaFilterWrapper.style.maxHeight = '0px';

        setTimeout(() => {
            areaFilterWrapper.style.maxHeight = `${targetHeight}px`;

            areaFilterWrapper.addEventListener('transitionend', function handler(e) {
                if (e.propertyName === 'max-height' && areaFilterWrapper.classList.contains('open')) {
                    areaFilterWrapper.style.maxHeight = 'none';
                    areaFilterWrapper.style.pointerEvents = 'all';
                    adjustContentPadding();
                }
                areaFilterWrapper.removeEventListener('transitionend', handler);
            });
            setTimeout(() => { areaFilterWrapper.style.pointerEvents = 'all'; adjustContentPadding(); }, 350);
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
                    adjustContentPadding();
                }
                areaFilterWrapper.removeEventListener('transitionend', handler);
            });

            setTimeout(() => { areaFilterWrapper.style.pointerEvents = 'all'; adjustContentPadding(); }, 350);
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

    // フィルタ状態のロードとソートUIの更新
    loadFilterState();
    if (sortDropdown) sortDropdown.value = `${currentSort.key}:${currentSort.direction}`;
    
    toggleAreaFilterPanel(false);

    adjustContentPadding();
    // 【v2.0】リサイズ時のデバウンス処理
    window.addEventListener('resize', sortAndRedistribute); 


    // 2. イベントリスナーの設定 (Event Delegation & UI Listeners)

    // 【v2.0】Event Delegation を適用
    if (columns.length > 0) {
        // カラムコンテナの親要素にイベントリスナーを設定
        columns[0].parentNode.addEventListener('click', handleMobCardClick);
    }

    // ランクタブのリスナー
    if (rankTabs) {
        document.querySelectorAll('.tab-btn').forEach(button => {
            button.onclick = (e) => {
                const newRank = e.currentTarget.dataset.rank;
                const currentRank = currentFilter.rank;
                const newRankIsTarget = TARGET_RANKS.includes(newRank);
                
                if (currentRank !== newRank) {
                    currentFilter.rank = newRank;
                    renderMobList();
                    toggleAreaFilterPanel(false);
                    
                } else if (newRankIsTarget) {
                    const isOpen = areaFilterWrapper.classList.contains('open');
                    
                    if (!isOpen) {
                        toggleAreaFilterPanel(true);
                    } else {
                        toggleAreaFilterPanel(false);
                    }
                }
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

    // 【新規】ソートドロップダウンのリスナー
    if (sortDropdown) {
        sortDropdown.onchange = (e) => {
            const [key, direction] = e.target.value.split(':');
            currentSort.key = key;
            currentSort.direction = direction;
            sortAndRedistribute();
            saveFilterState();
        };
    }


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
    setInterval(() => fetchRecordsAndUpdate('auto', false), 10 * 60 * 1000); // 討伐記録の定期更新 (10分ごと)
    setInterval(updateProgressBars, 60 * 1000); // プログレスバーの定期更新 (60秒ごと)
}

document.addEventListener('DOMContentLoaded', initializeApp);
