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
 * ミリ秒を HH:MM 形式に変換し、接頭辞を付けます。
 * @param {number} ms - ミリ秒
 * @param {string} prefix - 接頭辞 ('+' または '')
 * @returns {string} HH:MM 形式の文字列
 */
function formatDurationToHhmm(ms, prefix = '') {
    const totalMinutes = Math.floor(ms / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');

    return `${prefix}${formattedHours}:${formattedMinutes}`;
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
 * 【修正】討伐日時からリポップ情報を計算する
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

    if (repopMinMs <= 0 || repopMaxMs <= repopMinMs) {
        return { minRepop: 'N/A', maxRepop: 'N/A', timeDisplay: 'N/A', isPop: false, isMaxOver: false, isUnknown: true, elapsedPercent: 0 };
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

    } else {
        minRepopTime = new Date(killTime.getTime() + repopMinMs);
        maxRepopTime = new Date(killTime.getTime() + repopMaxMs);

        const remainingMsToMin = minRepopTime.getTime() - now.getTime();

        if (remainingMsToMin > 0) {
            // Phase 1: Pre-Min Repop (変更なし)
            isPop = false;

            const remainingMinutes = Math.ceil(remainingMsToMin / 60000);

            if (remainingMinutes < 60 && remainingMinutes >= 0) {
                timeRemainingStr = `Next: ${remainingMinutes}分後`;
            } else {
                timeRemainingStr = `Next: ${formatDateForDisplay(minRepopTime)}`;
            }

            elapsedPercent = 0;

        } else {
            // Phase 2 & 3: In or After POP Window
            isPop = true;
            const remainingMsToMax = maxRepopTime.getTime() - now.getTime();

            if (remainingMsToMax > 0) {
                // Phase 2: In POP Window (新しい表示形式を適用)
                isMaxOver = false;
                const elapsedInWindowMs = now.getTime() - minRepopTime.getTime();
                elapsedPercent = Math.max(0, Math.min(100, (elapsedInWindowMs / popDurationMs) * 100));

                const remainingMinutes = Math.floor(remainingMsToMax / 60000);

                if (remainingMinutes < 60) {
                    // 残り60分以下: XX.X% (@ MM分)
                    timeRemainingStr = `${elapsedPercent.toFixed(1)}% (@ ${remainingMinutes}分)`;
                } else {
                    // 残り60分以上: XX.X% (@ HH:MM)
                    const durationHhmm = formatDurationToHhmm(remainingMsToMax);
                    timeRemainingStr = `${elapsedPercent.toFixed(1)}% (@ ${durationHhmm})`;
                }

            } else {
                // Phase 3: Max Repop Exceeded (新しい表示形式を適用)
                isMaxOver = true;
                const popElapsedMs = now.getTime() - maxRepopTime.getTime();
                const formattedElapsed = formatDurationToHhmm(popElapsedMs, '+');
                timeRemainingStr = `100.0% (${formattedElapsed})`;
                elapsedPercent = 100;
            }
        }
    }

    return { minRepop: minRepopTime, maxRepop: maxRepopTime, timeDisplay: timeRemainingStr, elapsedPercent: elapsedPercent, isPop: isPop, isMaxOver: isMaxOver, isUnknown: isUnknown };
}

/**
 * MobNoからモブデータを取得する
 */
function getMobByNo(mobNo) {
    return globalMobData.find(mob => mob['No.'] === parseInt(mobNo));
}


// --- フィルタ状態の保存/ロード (変更なし) ---

/**
 * 現在のフィルタ状態をlocalStorageに保存する
 */
function saveFilterState() {
    try {
        const stateToSave = {
            rank: currentFilter.rank,
            areaSets: {}
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
        }
    } catch (e) {
        console.error('Failed to load filter state from localStorage:', e);
    }
}


// --- 固定ヘッダーの高さ調整 (変更なし) ---

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
    const { minRepop, timeDisplay, elapsedPercent, isPop, isMaxOver, isUnknown } = calculateRepop(mob, lastKillDate);

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
            <p class="text-sm font-semibold text-gray-400">開始時間: <span class="text-base text-gray-200 font-mono min-repop-time">${minRepopStr}</span></p>
        </div>
    `;

    // 前回討伐日時の相対表示を適用
    const lastKillDisplay = formatLastKillTime(lastKillDate);
    const lastKillHtml = `
        <div class="px-4 pt-1 pb-1 last-kill-content flex justify-end">
            <p class="text-sm font-semibold text-gray-400">前回時間: <span class="text-base text-gray-200 font-mono last-kill-display">${lastKillDisplay}</span></p>
        </div>
    `;

    // モブカード詳細にメモを表示
    const lastKillMemo = mob.LastKillMemo || '';
    const lastKillMemoHtml = `
        <div class="px-4 pt-1 pb-1 last-kill-memo-content text-left ${lastKillMemo ? '' : 'hidden'}">
            <p class="text-sm font-semibold text-gray-400">Memo:
                <span class="text-sm text-gray-200 font-sans font-normal last-kill-memo-text">${processText(lastKillMemo)}</span>
            </p>
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
    // モブカード内部の上下パディングを py-1 に、外側のマージンを mb-1 に変更
    return `
        <div class="mob-card bg-gray-800 rounded-xl shadow-2xl overflow-hidden relative py-1 mb-1 ${isOpenClass}"
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
                        <h2 class="text-base font-bold text-outline text-yellow-200 leading-tight truncate overflow-hidden whitespace-nowrap mob-name">${mob.Name}</h2>
                        <p class="text-xs text-gray-400 leading-tight truncate overflow-hidden whitespace-nowrap mob-area">${mob.Area} (${mob.Expansion || '?'})</p>
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
 * フィルターに基づいてモブカードリストをレンダリングする (初回のみ実行)
 */
function renderMobList() {
    // 【修正】既にカードDOMが存在する場合は、再構築せずに終了する（描画中断防止）
    if (document.querySelector('.mob-card') && globalMobData.length > 0) {
        updateFilterVisibility();
        updateFilterHighlights();
        updateProgressBars();
        saveFilterState();
        return;
    }

    // --- 初回描画処理 ---

    let filteredMobs = [];
    const activeRanks = currentFilter.rank === 'ALL' ? TARGET_RANKS : [currentFilter.rank];

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

    if (currentFilter.rank === 'ALL') {
        filteredMobs.sort((a, b) => a['No.'] - b['No.']);
    }

    // 3. レンダリング処理
    // 初回のみカラムをクリアし、カードを生成・配置
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

    // 初回のみイベントリスナーをアタッチ
    attachEventListeners();
    updateFilterHighlights();
    updateProgressBars();
    saveFilterState();
}

/**
 * 【修正】データ更新時、既存のカードのデータ部分のみを更新する
 */
function updateMobCardData() {
    const cards = document.querySelectorAll('.mob-card');

    cards.forEach(card => {
        const mobNo = parseInt(card.dataset.mobno);
        const mob = getMobByNo(mobNo);
        if (!mob) return;

        // 1. データ属性の更新 (リポップ計算の基準になる)
        card.dataset.lastkill = mob.LastKillDate || '';

        const lastKillDate = mob.LastKillDate ? new Date(mob.LastKillDate) : null;
        const repopData = calculateRepop(mob, lastKillDate);

        // 2. リポップ情報（時間表示、プログレスバー）の更新
        card.dataset.minrepop = mob['REPOP(s)'];
        card.dataset.maxrepop = mob['MAX(s)'];

        updateProgressBars(card); // 進捗バーと表示テキストの更新

        // 3. 詳細パネル内の前回討伐時刻とリポップ開始時刻を更新
        const lastKillDisplayEl = card.querySelector('.last-kill-display');
        if(lastKillDisplayEl) {
            lastKillDisplayEl.textContent = formatLastKillTime(lastKillDate);
        }
        const minRepopTimeEl = card.querySelector('.min-repop-time');
        if(minRepopTimeEl) {
            minRepopTimeEl.textContent = formatDateForDisplay(repopData.minRepop);
        }

        // 4. メモ欄の更新
        const memoContainer = card.querySelector('.last-kill-memo-content');
        const memoTextEl = card.querySelector('.last-kill-memo-text');

        if (memoContainer && memoTextEl) {
            const lastKillMemo = mob.LastKillMemo || '';
            memoTextEl.innerHTML = processText(lastKillMemo);
            memoContainer.classList.toggle('hidden', !lastKillMemo);

            // パネルが開いている場合、コンテンツ更新後に高さを再計算
            if (card.classList.contains('open')) {
                const panel = card.querySelector('.expandable-panel');
                panel.style.maxHeight = 'none';
                const targetHeight = panel.scrollHeight;
                panel.style.maxHeight = (targetHeight + 5) + 'px';
            }
        }

        // 5. 湧き潰し状態の更新（カードが開いている場合のみ）
        if (card.classList.contains('open') && openMobCardNo === mobNo) {
            const mapOverlay = card.querySelector('.map-overlay');
            if (mapOverlay && mob.spawn_points) {
                // サーバーから最新のcullStatusMapが来ていれば、それに従って再描画
                drawSpawnPoints(mapOverlay, mob.spawn_points, mobNo);
            }
        }
    });

    // フィルターによる表示/非表示の更新
    updateFilterVisibility();
    updateFilterHighlights();
    saveFilterState();
}

/**
 * 【修正】モブカードの表示/非表示をフィルター設定に基づいて切り替える
 * DOMの再配置を行わず、表示/非表示の切り替えのみを行うことで描画の中断を防ぐ。
 */
function updateFilterVisibility() {
    const { rank } = currentFilter;
    const activeRanks = rank === 'ALL' ? TARGET_RANKS : [rank];

    document.querySelectorAll('.mob-card').forEach(card => {
        const mobRank = card.dataset.rank;
        const mobExpansion = card.dataset.expansion;

        let isVisible = false;

        // 1. ランクフィルタのチェック
        if (activeRanks.includes(mobRank)) {
            const currentAreaSet = currentFilter.areaSets[mobRank] || new Set(['ALL']);

            // 2. エリアフィルタのチェック
            if (currentAreaSet.has('ALL') && currentAreaSet.size === 1) {
                isVisible = true;
            } else if (currentAreaSet.has(mobExpansion)) {
                isVisible = true;
            }
        }

        // Bランクは常に表示 (ただし、エリアフィルタの影響は受けない)
        if (mobRank === 'B' && rank === 'ALL') {
            isVisible = true;
        }

        card.style.display = isVisible ? 'block' : 'none';
    });

    // 【削除】DOMの再配置ロジックを削除。CSSのFlexbox/Gridで自動的にレイアウトされることを期待する。
}

/**
 * フィルターボタンのハイライトを更新する (変更なし)
 */
function updateFilterHighlights() {
    const { rank } = currentFilter;
    const currentRankForAreaFilter = TARGET_RANKS.includes(rank) ? rank : 'S';
    const currentAreasToHighlight = currentFilter.areaSets[currentRankForAreaFilter] || new Set(['ALL']);

    // ランクタブのハイライト
    if (rankTabs) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            const isActive = btn.dataset.rank === rank;
            btn.classList.toggle('bg-blue-600', isActive);
            btn.classList.toggle('hover:bg-blue-500', isActive);
            btn.classList.toggle('bg-gray-700', !isActive);
            btn.classList.toggle('hover:bg-gray-600', !isActive);
        });
    }

    // エリアフィルタボタンのハイライト
    document.querySelectorAll('.area-filter-btn').forEach(btn => {
        const isSelected = currentAreasToHighlight.has(btn.dataset.area);
        btn.classList.toggle('bg-blue-600', isSelected);
        btn.classList.toggle('hover:bg-blue-500', isSelected);
        btn.classList.toggle('bg-gray-600', !isSelected);
        btn.classList.toggle('hover:bg-gray-500', !isSelected);
    });
}


/**
 * イベントリスナーをカードとボタンにアタッチする（初回のみ） (変更なし)
 */
function attachEventListeners() {
    // Aモブのワンクリック報告リスナー
    document.querySelectorAll('.instant-report-btn').forEach(button => {
        if (button.dataset.mobno) {
            button.onclick = async (e) => {
                e.stopPropagation();
                const mobNo = e.currentTarget.dataset.mobno;
                await instantARankReport(mobNo);
            }
        }
    });

    // S/FATE の通常報告ボタン
    document.querySelectorAll('.report-btn').forEach(button => {
        if (button.dataset.mobno) {
            button.onclick = (e) => {
                e.stopPropagation();
                openReportModal(e.currentTarget.dataset.mobno);
            }
        }
    });

    // 詳細パネル開閉トグル
    document.querySelectorAll('.toggle-handler').forEach(handler => {
        handler.onclick = (e) => {
            const card = e.currentTarget.closest('.mob-card');
            if (card) {
                toggleMobDetails(card);
            }
        };
    });
}

// Aランクモブの即時報告機能 (変更なし)
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
            await fetchRecordsAndUpdate(false); // 更新後にDOMを再構築しない
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
 * マップ詳細パネルの表示/非表示を切り替える (変更なし)
 */
function toggleMobDetails(card) {
    const mobNo = parseInt(card.dataset.mobno);
    const mob = getMobByNo(mobNo);
    const panel = card.querySelector('.expandable-panel');

    if (!panel) return;

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
 * 【修正】マップにスポーンポイントを描画する
 */
function drawSpawnPoints(overlayEl, spawnPoints, currentMobNo) {
    overlayEl.innerHTML = '';
    const mob = getMobByNo(parseInt(currentMobNo));

    if (!mob || !mob.cullStatusMap) return;

    // 定数
    const SA_OUTER_DIAMETER = '12px';
    const SA_BORDER_WIDTH = '2px';
    const SA_SHADOW = '0 0 8px 1px';

    const B1_INTERNAL_COLOR = '#60a5fa'; // Blue-400
    const B2_INTERNAL_COLOR = '#f87171'; // Red-400

    // S/A抽選に関わるポイントをフィルタリング (Bランクのみのポイントは含まない)
    const cullTargetPoints = spawnPoints.filter(point =>
        point.mob_ranks.includes('S') || point.mob_ranks.includes('A')
    );

    // 未処理のS/A抽選ポイントの数をカウント
    let remainingCullCount = cullTargetPoints.filter(point => !mob.cullStatusMap[point.id]).length;

    // B1/B2のみのポイントが反転表示されるかどうかのフラグ
    const shouldInvertBOnlyPoints = remainingCullCount === 1; // 👈 ラストワン判定


    spawnPoints.forEach(point => {
        const isS_A_Point = point.mob_ranks.includes('S') || point.mob_ranks.includes('A');
        const includesB1 = point.mob_ranks.includes('B1');
        const includesB2 = point.mob_ranks.includes('B2');
        const isCullTarget = isS_A_Point; // S/A抽選に関わるポイントのみ湧き潰し対象

        if (!isCullTarget) {
            // Bランクのみのポイント (湧き潰し対象外)
            if (point.mob_ranks.length === 1 && (includesB1 || includesB2)) {
                const pointEl = document.createElement('div');
                pointEl.className = 'spawn-point-b-only';

                // B1/B2のみのポイントを2px小さくする
                const baseSize = 10;
                const newSize = baseSize - 2;

                pointEl.style.cssText = `
                    position: absolute; left: ${point.x}%; top: ${point.y}%; transform: translate(-50%, -50%);
                    width: ${newSize}px; height: ${newSize}px; border-radius: 50%; z-index: 5; pointer-events: none;
                    background-color: ${includesB1 ? B1_INTERNAL_COLOR : B2_INTERNAL_COLOR};
                    box-shadow: 0 0 4px rgba(0, 0, 0, 0.7);
                `;

                // ラストワン判定時のB1/B2のみのポイントの表示反転
                if (shouldInvertBOnlyPoints) {
                    pointEl.style.backgroundColor = 'rgba(100, 100, 100, 1.0)'; // グレーに反転
                    pointEl.style.boxShadow = 'none'; // 影をなくす
                }

                overlayEl.appendChild(pointEl);
            }
            return;
        }

        // 湧き潰し対象ポイント (S/A/B1 or B2 を含む)
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

        const isLastPoint = !isCulled && remainingCullCount === 1; // S/A抽選対象としてのラストワン

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

        // 【修正】クリック時に湧き潰しステータスを切り替える
        pointEl.onclick = (e) => {
            e.stopPropagation();
            // isCulled は現在の状態なので、新しい状態は !isCulled
            toggleCullStatus(mob['No.'], point.id, !isCulled);
        };

        overlayEl.appendChild(pointEl);
    });
}

/**
 * 【新規追加】湧き潰し状態を切り替え、GASに報告する
 */
async function toggleCullStatus(mobNo, pointId, isCulled) {
    const mob = getMobByNo(mobNo);
    if (!mob) return;

    const mobName = mob.Name;
    const actionName = isCulled ? '湧き潰し報告' : '湧き潰し解除報告';

    // 1. クライアント側状態の即時更新とマップ表示の即時再描画
    // これにより、クリック後すぐに視覚的なフィードバックが得られる
    const originalCulledState = mob.cullStatusMap[pointId] || false;
    mob.cullStatusMap[pointId] = isCulled;

    const card = document.querySelector(`.mob-card[data-mobno="${mobNo}"]`);
    const mapOverlay = card.querySelector('.map-overlay');
    if (mapOverlay && mob.spawn_points) {
        drawSpawnPoints(mapOverlay, mob.spawn_points, mobNo);
    }

    displayError(`${mobName}の${pointId}を${actionName}中...`);

    try {
        const response = await fetch(GAS_ENDPOINT, {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                action: 'updateCullStatus', 
                Mob_No: mobNo,
                Point_ID: pointId,
                Is_Culled: isCulled ? 'TRUE' : 'FALSE', // GAS側で受け取るスキーマ
                Reporter_ID: userId
            })
        });

        const result = await response.json();

        if (result.status === 'success') {
            displayError(`${mobName}の${pointId}を${actionName}成功！`);
            setTimeout(() => displayError(null), 1500);
        } else {
            // サーバー側で失敗した場合、クライアント側の状態を元に戻す
            mob.cullStatusMap[pointId] = originalCulledState;
            if (mapOverlay && mob.spawn_points) {
                drawSpawnPoints(mapOverlay, mob.spawn_points, mobNo); // 再描画して元に戻す
            }
            displayError(`${mobName}の${actionName}失敗: ${result.message}`);
        }
    } catch (error) {
        // 通信失敗の場合、クライアント側の状態を元に戻す
        mob.cullStatusMap[pointId] = originalCulledState;
        if (mapOverlay && mob.spawn_points) {
            drawSpawnPoints(mapOverlay, mob.spawn_points, mobNo); // 再描画して元に戻す
        }
        console.error('湧き潰し報告エラー:', error);
        displayError(`${mobName}の${actionName}エラー: サーバー通信に失敗。`);
    }
}


// --- モーダル/フォーム操作 (変更なし) ---

function openReportModal(mobNo) {
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

    if (!mob || !killTimeLocal) return;

    const killTimeJstIso = toJstAdjustedIsoString(killTimeLocal);

    // 送信開始時にボタンとステータスを更新
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

            // 手動更新としてデータを更新 (DOM再構築なし)
            await fetchRecordsAndUpdate(false);
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
 * 【修正】GASから最新の討伐記録と湧き潰し状態を取得し、グローバルデータを更新する
 * @param {boolean} isInitialLoad 初回ロード時は true。2回目以降は false。
 */
async function fetchRecordsAndUpdate(isInitialLoad = false) {

    // 1. 基本データ (Base Mob Data) のロードと初期レンダリング
    if (isInitialLoad) {
        displayError(`設定データをロード中...`);
        await fetchBaseMobData();
        adjustContentPadding();
        if (baseMobData.length === 0) {
            displayError(`致命的なエラー: モブ設定データを読み込めませんでした。`);
            return;
        }
    }

    // 2. ローディングメッセージの表示
    const shouldDisplayLoading = (isInitialLoad || autoUpdateSuccessCount === 0);
    if (shouldDisplayLoading) {
        displayError(`データを更新中…`);
    }

    // 3. 討伐記録と湧き潰し状態の取得と更新
    try {
        const response = await fetch(GAS_ENDPOINT + '?action=getRecords');
        const data = await response.json();

        if (data.status === 'success') {
            const records = data.records;
            const cullStatuses = data.cullStatuses || [];

            // データをマージして globalMobData を再構築（これは常に必要）
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

            if (!isInitialLoad) {
                autoUpdateSuccessCount++; // 初回ロードが完了してから成功回数をカウント
            }

            displayError(null);
            adjustContentPadding();

            // 4. 初回描画かデータ更新かの分岐
            if (isInitialLoad) {
                renderMobList(); // 初回: 全カードDOM構築
            } else {
                updateMobCardData(); // 2回目以降: 既存DOMのデータのみ更新 (描画中断なし)
            }


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
 * 各モブカードの進捗バーを更新する (60秒ごと) (変更なし)
 * @param {HTMLElement | undefined} targetCard 更新対象のカード要素（省略時は全カード）
 */
function updateProgressBars(targetCard) {

    const ORANGE_BAR_COLOR = 'bg-orange-400/70';
    const YELLOW_BAR_COLOR = 'bg-yellow-400/70';
    const LIME_BAR_COLOR = 'bg-lime-500/70';
    const NEXT_TEXT_COLOR = 'text-green-400';

    const cardsToUpdate = targetCard ? [targetCard] : document.querySelectorAll('.mob-card');

    cardsToUpdate.forEach(card => {
        const lastKillStr = card.dataset.lastkill;
        const repop = parseInt(card.dataset.minrepop);
        const max = parseInt(card.dataset.maxrepop);

        const lastKillDate = lastKillStr ? new Date(lastKillStr) : null;

        const repopData = calculateRepop({"REPOP(s)": repop, "MAX(s)": max}, lastKillDate);
        const percent = repopData.elapsedPercent || 0;

        const repopInfoDisplayEl = card.querySelector('.repop-info-display');
        const progressBarEl = card.querySelector('.progress-bar');

        // --- 1. 表示テキストと色の更新 ---
        if (repopInfoDisplayEl) {
            repopInfoDisplayEl.textContent = repopData.timeDisplay;

            // クラスの調整
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

            // クラスを一度リセットしてから再適用
            progressBarEl.className = `progress-bar absolute inset-0 transition-all duration-100 ease-linear rounded-xl ${barColorClass} ${animateClass}`;
            progressBarEl.style.height = '100%';
            progressBarEl.style.width = `${widthPercent}%`;
        }
    });
}

/**
 * エリアフィルタパネルの開閉をトグルする (アニメーション付き) (変更なし)
 * @param {boolean} forceOpen 強制的に開く場合はtrue, 閉じる場合はfalse, トグルする場合は未指定
 */
function toggleAreaFilterPanel(forceOpen) {
    if (!areaFilterWrapper || !areaFilterContainer) return;

    const isOpen = areaFilterWrapper.classList.contains('open');
    let shouldOpen = (typeof forceOpen === 'boolean') ? forceOpen : !isOpen;

    // トランジション中にクリックイベントをブロック
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
            // transitionend が発火しない場合に備える
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

            // transitionend が発火しない場合に備える
            setTimeout(() => { areaFilterWrapper.style.pointerEvents = 'all'; adjustContentPadding(); }, 350);
        }, 0);
    }
}


/**
 * サイトの初期化処理 (変更なし)
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

    // フィルタ状態のロード
    loadFilterState();

    toggleAreaFilterPanel(false);

    adjustContentPadding();
    window.addEventListener('resize', adjustContentPadding);


    // 2. イベントリスナーの設定

    // ランクタブのリスナー
    if (rankTabs) {
        document.querySelectorAll('.tab-btn').forEach(button => {
            button.onclick = (e) => {
                const newRank = e.currentTarget.dataset.rank;
                const currentRank = currentFilter.rank;
                const newRankIsTarget = TARGET_RANKS.includes(newRank);

                if (currentRank !== newRank) {
                    currentFilter.rank = newRank;
                    updateFilterVisibility(); // DOM再構築なし
                    updateFilterHighlights();
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

            updateFilterVisibility(); // DOM再構築なし
            updateFilterHighlights();
            saveFilterState();
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
    // 初回は isInitialLoad=true で実行し、renderMobList（全描画）に繋がる
    fetchRecordsAndUpdate(true);
    // 定期更新は isInitialLoad=false で実行し、updateMobCardData（差分更新）に繋がる
    setInterval(() => fetchRecordsAndUpdate(false), 10 * 60 * 1000);
    setInterval(() => updateProgressBars(), 60 * 1000); // プログレスバーの定期更新 (60秒ごと)
}

document.addEventListener('DOMContentLoaded', initializeApp);
