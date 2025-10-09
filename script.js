/* script.js (最終修正・最適化版) */

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
    // ★★★ 変更: カラムの配列を削除し、単一のコンテナIDに変更 ★★★
    mobListContainer: document.getElementById('mob-list-container')
};
const { errorMessageContainer, rankTabs, reportModal, modalMobName, reportDatetimeInput, reportMemoInput, submitReportBtn, cancelReportBtn, reportStatusEl, uuidDisplayEl, areaFilterWrapper, areaFilterContainer, fixedHeaderContent, contentSpacer, mobListContainer } = DOMElements;


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
        timeRemainingStr = `Next: ${formatDateForDisplay(minRepopTime)}`;
        elapsedPercent = 0;
    } else {
        minRepopTime = new Date(killTime.getTime() + repopMinMs);
        maxRepopTime = new Date(killTime.getTime() + repopMaxMs);

        const remainingMsToMin = minRepopTime.getTime() - now.getTime();

        if (remainingMsToMin > 0) {
            // Phase 1: Pre-Min Repop
            isPop = false;
            timeRemainingStr = `Next: ${formatDateForDisplay(minRepopTime)}`;
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

                const duration = formatDurationPart(remainingMsToMax);
                timeRemainingStr = `残り (%): ${duration} (${elapsedPercent.toFixed(1)}%)`;

            } else {
                // Phase 3: Max Repop Exceeded
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
    const { minRepop, timeDisplay, elapsedPercent, isPop, isMaxOver, isUnknown } = calculateRepop(mob, lastKillDate);

    let repopTimeColorClass = 'text-white font-extrabold';
    if (isUnknown) {
        repopTimeColorClass = 'text-gray-400';
    } else if (!isPop) {
        repopTimeColorClass = 'text-green-400';
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

    // マップ画像パスの修正がここに反映済みです
    const mapDetailsHtml = mob.Map ? `
        <div class="mob-details pt-1 px-4 text-center map-content">
            <div class="relative inline-block w-full max-w-sm">
                <img src="./maps/${mob.Map}" alt="${mob.Area} Map" class="w-full h-auto rounded-lg shadow-md map-image" data-area="${mob.Area}">
                <div class="absolute inset-0 map-overlay" data-area="${mob.Area}"></div>
            </div>
        </div>
    ` : '';

    let panelContent = conditionHtml + minRepopHtml + lastKillHtml + mapDetailsHtml;
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
        <div class="mt-1 bg-gray-700 p-2 rounded-xl text-xs relative overflow-hidden shadow-inner h-12">
            <div class="progress-bar absolute inset-0 transition-all duration-100 ease-linear" style="width: ${elapsedPercent}%; z-index: 0;"></div>
            <div class="absolute inset-0 flex items-center justify-center z-10">
                <span class="repop-info-display text-lg font-extrabold ${repopTimeColorClass} font-mono w-full text-center">
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
    // mobListContainerが存在しない場合は処理を中断
    if (!mobListContainer) return;

    const { rank } = currentFilter;
    let filteredMobs = [];
    const activeRanks = rank === 'ALL' ? TARGET_RANKS : [rank];

    for (const r of activeRanks) {
        const rankMobs = globalMobData.filter(mob => mob.Rank === r);
        const currentAreaSet = currentFilter.areaSets[r];

        if (currentAreaSet.has('ALL') && currentAreaSet.size === 1) {
            // ALLを選択している場合 (初期状態や全て解除された場合) は、そのランクの全ての拡張エリアを表示
            filteredMobs.push(...rankMobs.filter(mob => ALL_EXPANSION_NAMES.includes(mob.Expansion)));
        } else if (!currentAreaSet.has('ALL') && currentAreaSet.size > 0) {
            // 特定のエリアを選択している場合
            filteredMobs.push(...rankMobs.filter(mob => currentAreaSet.has(mob.Expansion)));
        } else if (currentAreaSet.has('ALL') && currentAreaSet.size > 1) {
             // 'ALL' と特定のエリアが選択されている場合 (全選択状態と同じ)
             filteredMobs.push(...rankMobs.filter(mob => currentAreaSet.has(mob.Expansion)));
        } else if (currentAreaSet.size === 0) {
             // 選択エリアが0個の場合 ('ALL'も含まれない) -> モブは表示しない
        }
    }
    
    // ALLタブ選択時は、元のNo.順でソートを維持
    if (rank === 'ALL') {
        filteredMobs.sort((a, b) => a['No.'] - b['No.']);
    }


    // ★★★ 変更: 3カラムへの振り分けロジックを削除し、単一コンテナに挿入 ★★★
    mobListContainer.innerHTML = '';
    let allCardsHtml = '';

    filteredMobs.forEach((mob) => {
        allCardsHtml += createMobCard(mob);
    });

    // すべてのカードを単一のコンテナに挿入
    mobListContainer.innerHTML = allCardsHtml;


    // 4. アクティブなランクタブをハイライト
    if (rankTabs) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            const isActive = btn.dataset.rank === rank;
            btn.classList.toggle('bg-blue-600', isActive);
            btn.classList.toggle('hover:bg-blue-500', isActive);
            btn.classList.toggle('bg-gray-700', !isActive);
            btn.classList.toggle('hover:bg-gray-600', !isActive);
        });
    }

    // 5. エリアフィルタボタンのハイライト (表示中のランクに依存)
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
 * イベントリスナーをカードとボタンにアタッチする
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
 * マップ詳細パネルの表示/非表示を切り替える
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
 * マップにスポーンポイントを描画する
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

    // S/A抽選に関わるポイントをフィルタリング
    const cullTargetPoints = spawnPoints.filter(point =>
        point.mob_ranks.includes('S') || point.mob_ranks.includes('A')
    );

    // 未処理のS/A抽選ポイントの数をカウント
    let remainingCullCount = cullTargetPoints.filter(point => !mob.cullStatusMap[point.id]).length;

    spawnPoints.forEach(point => {
        const isS_A_Point = point.mob_ranks.includes('S') || point.mob_ranks.includes('A');
        const includesB1 = point.mob_ranks.includes('B1');
        const includesB2 = point.mob_ranks.includes('B2');
        const isCullTarget = isS_A_Point;

        if (!isCullTarget) {
            // Bランクのみのポイント (湧き潰し対象外)
            if (point.mob_ranks.length === 1 && (includesB1 || includesB2)) {
                const pointEl = document.createElement('div');
                pointEl.className = 'spawn-point-b-only';
                pointEl.style.cssText = `
                    position: absolute; left: ${point.x}%; top: ${point.y}%; transform: translate(-50%, -50%);
                    width: 10px; height: 10px; border-radius: 50%; z-index: 5; pointer-events: none;
                    background-color: ${includesB1 ? B1_INTERNAL_COLOR : B2_INTERNAL_COLOR};
                    box-shadow: 0 0 4px rgba(0, 0, 0, 0.7);
                `;
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
 * 湧き潰し状態をGAS経由で切り替える
 */
async function toggleCullStatus(mobNo, pointId, newStatus) {
    const mob = getMobByNo(mobNo);
    if (!mob) return;

    // 1. 画面上に即時反映 (ユーザー体験向上)
    mob.cullStatusMap[pointId] = newStatus;

    // 2. 現在開いているカードのマップオーバーレイのみを再描画
    const card = document.querySelector(`.mob-card[data-mobno="${mobNo}"]`);
    if (card && card.classList.contains('open')) {
        const mapOverlay = card.querySelector('.map-overlay');
        if (mapOverlay) {
            drawSpawnPoints(mapOverlay, mob.spawn_points, mobNo);
        }
    }

    try {
        await fetch(GAS_ENDPOINT, {
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
    } catch (error) {
        console.error('湧き潰し通信エラー:', error);
    }
}


// --- モーダル/フォーム操作 ---

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
            
            // 手動更新としてデータを更新し、メッセージを表示
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

    // 1. 基本データ (Base Mob Data) のロードと初期レンダリング
    if (shouldFetchBase) {
        displayError(`設定データをロード中...`);
        await fetchBaseMobData();
        adjustContentPadding();
        if (baseMobData.length === 0) {
            displayError(`致命的なエラー: モブ設定データを読み込めませんでした。`);
            return;
        }
    }

    // 2. ローディングメッセージの表示
    const shouldDisplayLoading = (updateType === 'initial' || updateType === 'manual' || autoUpdateSuccessCount === 0);
    if (shouldDisplayLoading) {
        displayError(`データを更新中…`);
    }

    // 3. データ取得前の暫定表示 (ロード中もカードを見せるため)
    globalMobData = [...baseMobData];
    renderMobList();


    // 4. 討伐記録と湧き潰し状態の取得と更新
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
                } else {
                    newMob.LastKillDate = '';
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
            
            displayError(null); // 成功したらメッセージを消す
            adjustContentPadding(); // データ更新後の最終調整
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
 */
function updateProgressBars() {

    const ORANGE_BAR_COLOR = 'bg-orange-400/70';
    const YELLOW_BAR_COLOR = 'bg-yellow-400/70';
    const LIME_BAR_COLOR = 'bg-lime-500/70';
    const NEXT_TEXT_COLOR = 'text-green-400';

    document.querySelectorAll('.mob-card').forEach(card => {
        const lastKillStr = card.dataset.lastkill;
        const repop = parseInt(card.dataset.minrepop);
        const max = parseInt(card.dataset.maxrepop);

        const lastKillDate = lastKillStr ? new Date(lastKillStr) : null;
        
        // mobStub を廃止し、直接引数を渡す
        const repopData = calculateRepop({"REPOP(s)": repop, "MAX(s)": max}, lastKillDate);
        const percent = repopData.elapsedPercent || 0;

        const repopInfoDisplayEl = card.querySelector('.repop-info-display');
        const progressBarEl = card.querySelector('.progress-bar');

        // --- 1. 表示テキストと色の更新 ---
        if (repopInfoDisplayEl) {
            repopInfoDisplayEl.textContent = repopData.timeDisplay;
            repopInfoDisplayEl.classList.remove('text-gray-400', NEXT_TEXT_COLOR, 'text-white', 'font-extrabold');

            if (repopData.isUnknown) {
                repopInfoDisplayEl.classList.add('text-gray-400');
            } else if (!repopData.isPop) {
                repopInfoDisplayEl.classList.add(NEXT_TEXT_COLOR);
            } else {
                repopInfoDisplayEl.classList.add('text-white', 'font-extrabold');
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
}

/**
 * エリアフィルタパネルの開閉をトグルする (アニメーション付き)
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
    const isTargetRank = TARGET_RANKS.includes(initialRank);
    
    // 初期ロード時は、ターゲットランク（S/A/F）なら開く
    if (isTargetRank) {
        setTimeout(() => toggleAreaFilterPanel(true), 100);
    } else {
        toggleAreaFilterPanel(false);
    }

    adjustContentPadding();
    window.addEventListener('resize', adjustContentPadding);


    // 2. イベントリスナーの設定

    // ランクタブのリスナー (2クリックで開閉ロジック)
    if (rankTabs) {
        document.querySelectorAll('.tab-btn').forEach(button => {
            button.onclick = (e) => {
                const newRank = e.currentTarget.dataset.rank;
                const currentRank = currentFilter.rank;
                const newRankIsTarget = TARGET_RANKS.includes(newRank);

                if (newRank === currentRank && newRankIsTarget) {
                    // 同じランクタブを再クリック: トグルで開閉
                    toggleAreaFilterPanel();
                } else if (newRankIsTarget) {
                    // S, A, FATE に切り替え: 表示する
                    toggleAreaFilterPanel(true);
                } else {
                    // ALL に切り替え: 閉じる
                    toggleAreaFilterPanel(false);
                }

                if (currentRank !== newRank) {
                    currentFilter.rank = newRank;
                    renderMobList();
                }
            }
        });
    }

    // エリアフィルタボタンのリスナー
    document.querySelectorAll('.area-filter-btn').forEach(button => {
        button.onclick = (e) => {
            const newArea = e.currentTarget.dataset.area;
            const currentRank = currentFilter.rank;
            
            // ALLタブ選択時は、Sランクのフィルタ状態を操作する
            const targetRank = TARGET_RANKS.includes(currentRank) ? currentRank : 'S';
            const currentAreaSet = currentFilter.areaSets[targetRank];
            
            if (!currentAreaSet) return;

            if (newArea === 'ALL') {
                // ALLボタンのトグル
                const isAllSelected = ALL_EXPANSION_NAMES.every(area => currentAreaSet.has(area));
                
                if (isAllSelected) {
                    // 全選択状態なら、ALLのみに切り替える（全解除と同義で、ALLフラグを残す）
                    currentFilter.areaSets[targetRank] = new Set(['ALL']);
                } else {
                    // 全選択状態ではないなら、すべての拡張エリアを選択状態にする（ALLフラグも持たせる）
                    currentFilter.areaSets[targetRank] = new Set([...ALL_EXPANSION_NAMES, 'ALL']);
                }

            } else {
                // 個別エリアボタンのトグル
                if (currentAreaSet.has(newArea)) {
                    currentAreaSet.delete(newArea);
                } else {
                    currentAreaSet.add(newArea);
                }
                
                // 選択肢が空になったら、ALLフラグを再度追加 (全て非表示)
                if (Array.from(currentAreaSet).filter(a => a !== 'ALL').length === 0) {
                    currentAreaSet.add('ALL');
                } else {
                    currentAreaSet.delete('ALL');
                }
                
                // すべての拡張エリアが選択されたら、'ALL'フラグを追加
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
    setInterval(() => fetchRecordsAndUpdate('auto', false), 10 * 60 * 1000); // 討伐記録の定期更新 (10分ごと)
    setInterval(updateProgressBars, 60 * 1000); // プログレスバーの定期更新 (60秒ごと)
}

document.addEventListener('DOMContentLoaded', initializeApp);
