/* script.js (最終修正: Repopソート、相対時間調整、Aモブ即時報告、マップ画像表示/ポイント表示修正) */

// Google Apps Script (GAS) のエンドポイントURL
const GAS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbyuTg_uO7ZnxPGz1eun3kUKjni5oLj-UpfH4g1N0wQmzB57KhBWFnAvcSQYlbNcUelT3g/exec';
// 静的モブデータ (mob_data.json) のURL
const MOB_DATA_URL = './mob_data.json';

// --- グローバル変数 ---
let baseMobData = [];
let globalMobData = [];
let currentFilter = {
    rank: 'ALL', 
    areaSets: {
        'S': new Set(['ALL']),
        'A': new Set(['ALL']),
        'F': new Set(['ALL'])
    }
};
let currentSort = 'No.'; // 'No.' (デフォルト) または 'Repop'
let currentMobNo = null;
let userId = null;
let autoUpdateSuccessCount = 0;

// ランクタブの排他的トグル制御用変数 (エリアフィルタ開閉のみに使用)
let lastClickedRank = null; 
let rankClickCount = 0;

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
    column1: document.getElementById('column-1'),
    column2: document.getElementById('column-2'),
    column3: document.getElementById('column-3'),
    sortToggleBtn: document.getElementById('sort-toggle-btn') 
};
const { errorMessageContainer, rankTabs, reportModal, modalMobName, reportDatetimeInput, reportMemoInput, submitReportBtn, cancelReportBtn, reportStatusEl, uuidDisplayEl, areaFilterWrapper, areaFilterContainer, fixedHeaderContent, contentSpacer, column1, column2, column3, sortToggleBtn } = DOMElements;


// --- 定数: 拡張パック名定義 ---
const EXPANSION_MAP = {
    1: '新生', 2: '蒼天', 3: '紅蓮', 4: '漆黒', 5: '暁月', 6: '黄金'
};
const ALL_EXPANSION_NAMES = Object.values(EXPANSION_MAP);
const TARGET_RANKS = ['S', 'A', 'F'];
const ACTIVE_COLOR_CLASS = 'bg-blue-600'; // ALLタブの色に合わせる
const INACTIVE_COLOR_CLASS = 'bg-gray-700';


// --- ユーティリティ関数 ---

/**
 * UNIX秒 (サーバー時間) を Dateオブジェクトに変換する
 */
function unixTimeToDate(unixtime) {
    return new Date(unixtime * 1000);
}

/**
 * 日付オブジェクトを MM/DD HH:MM 形式にフォーマットする (絶対時刻)
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
 * 前回討伐日時を相対表示する関数 (1時間以内は「X分前」)
 */
function formatLastKillDisplay(dateInput) {
    const date = (dateInput instanceof Date) ? dateInput : new Date(dateInput);
    if (!date || isNaN(date.getTime())) {
        return 'N/A';
    }

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();

    // 1時間 (60分) = 3,600,000 ミリ秒
    if (diffMs > 0 && diffMs < 3600000) {
        const minutesAgo = Math.floor(diffMs / 60000);
        return `${minutesAgo}分前`;
    }

    // 1時間以上の場合は絶対時刻
    return formatDateForDisplay(date);
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
        errorMessageContainer.className = ''; 
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
    let repopScore = 0; // ソート用スコア

    if (repopMinMs <= 0 || repopMaxMs <= repopMinMs) {
        return { 
            minRepop: 'N/A', maxRepop: 'N/A', timeDisplay: 'N/A', 
            isPop: false, isMaxOver: false, isUnknown: true, 
            elapsedPercent: 0, memo: '',
            repopScore: 9999999999999 // ソート用: 最も低い優先度（記録なし）
        };
    }

    if (isUnknown) {
        minRepopTime = new Date(now.getTime() + repopMinMs);
        timeRemainingStr = `Next: ${formatDateForDisplay(minRepopTime)}`;
        elapsedPercent = 0;
        repopScore = 9999999999998; // ソート用: 記録なしは最後に近い
    } else {
        minRepopTime = new Date(killTime.getTime() + repopMinMs);
        maxRepopTime = new Date(killTime.getTime() + repopMaxMs);

        const remainingMsToMin = minRepopTime.getTime() - now.getTime();

        if (remainingMsToMin > 0) {
            // Phase 1: Pre-Min Repop (POP時間前)
            isPop = false;
            // POP時間が近いものから並べるため、remainingMsToMinが小さいほどスコアを高くする
            repopScore = -remainingMsToMin; 
            timeRemainingStr = `Next: ${formatDateForDisplay(minRepopTime)}`;
            elapsedPercent = 0;

        } else {
            // Phase 2 & 3: In or After POP Window (抽選期間内または超過)
            isPop = true;
            const remainingMsToMax = maxRepopTime.getTime() - now.getTime();

            if (remainingMsToMax > 0) {
                // Phase 2: In POP Window (抽選期間内)
                isMaxOver = false;
                const elapsedInWindowMs = now.getTime() - minRepopTime.getTime();
                elapsedPercent = Math.max(0, Math.min(100, (elapsedInWindowMs / popDurationMs) * 100));
                
                // 経過率が高い順に並べるため、elapsedInWindowMsが大きいほどスコアを高くする
                repopScore = elapsedInWindowMs; 

                // 進捗率をメイン情報として強調 (修正点3)
                const duration = formatDurationPart(remainingMsToMax);
                timeRemainingStr = `${elapsedPercent.toFixed(1)}% (残り: ${duration})`;

            } else {
                // Phase 3: Max Repop Exceeded (最大リポップ時間超過)
                isMaxOver = true;
                const popElapsedMs = now.getTime() - maxRepopTime.getTime();
                
                // 超過している場合は最も優先度が高い
                repopScore = popDurationMs + popElapsedMs; 
                elapsedPercent = 100;

                const formattedElapsed = formatDurationPart(popElapsedMs, '+');
                timeRemainingStr = `100.0% (超過: ${formattedElapsed})`;
            }
        }
    }

    return { 
        minRepop: minRepopTime, 
        maxRepop: maxRepopTime, 
        timeDisplay: timeRemainingStr, 
        elapsedPercent: elapsedPercent, 
        isPop: isPop, 
        isMaxOver: isMaxOver, 
        isUnknown: isUnknown,
        repopScore: repopScore // ソート用のスコアを返却
    };
}

/**
 * MobNoからモブデータを取得する
 */
function getMobByNo(mobNo) {
    return globalMobData.find(mob => mob['No.'] === parseInt(mobNo));
}


// --- フィルタ/ソート状態の保存/ロード ---

/**
 * 現在のフィルタとソート状態をlocalStorageに保存する
 */
function saveFilterState() {
    try {
        const stateToSave = {
            rank: currentFilter.rank,
            areaSets: {},
            sort: currentSort 
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
 * localStorageからフィルタとソート状態をロードする
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

            // ソート状態をロード
            if (parsedState.sort && (parsedState.sort === 'No.' || parsedState.sort === 'Repop')) {
                currentSort = parsedState.sort;
            }
        }
    } catch (e) {
        console.error('Failed to load filter state from localStorage:', e);
    }
}

/**
 * ソート状態を切り替える (修正点1)
 */
function toggleSortState() {
    currentSort = (currentSort === 'No.') ? 'Repop' : 'No.';
    updateSortButtonDisplay();
    renderMobList();
}

/**
 * ソートボタンの表示を更新する
 */
function updateSortButtonDisplay() {
    if (sortToggleBtn) {
        sortToggleBtn.textContent = currentSort === 'No.' ? 'ソート: No.順' : 'ソート: Repop優先度順';
        sortToggleBtn.classList.toggle(ACTIVE_COLOR_CLASS, currentSort === 'Repop');
        sortToggleBtn.classList.toggle(INACTIVE_COLOR_CLASS, currentSort === 'No.');
    }
}

// --- 地図ポイント描画ヘルパー (新規追加) ---

/**
 * マップ画像の上にモブの座標を示すポイントをレンダリングする
 * mob.Coords は JSON文字列または配列の形式を想定: [{"X": 15.0, "Y": 20.0}, ...]
 */
function renderMapPoints(coordsData) {
    if (!coordsData) return '';

    let coords;
    try {
        // CoordsがJSON文字列として格納されている可能性があるためパースを試みる
        coords = Array.isArray(coordsData) ? coordsData : JSON.parse(coordsData);
    } catch (e) {
        // console.warn("Failed to parse coordinates (This might be expected if Coords is not always a JSON string):", coordsData);
        return '';
    }

    if (!Array.isArray(coords) || coords.length === 0) return '';

    return coords.map((coord, index) => {
        // X, Y がパーセンテージ値 (0-100) であると仮定
        // ピンのサイズ (w-5, h-5) を考慮し、中心に配置するために -2.5% の補正を入れる (ピンサイズが親要素の5%と仮定)
        const xPercent = (parseFloat(coord.X) || 0) - 2.5; 
        const yPercent = (parseFloat(coord.Y) || 0) - 2.5;

        // モブピンのHTML構造 (赤丸、アニメーション)
        // z-index: 20 で画像より手前に配置
        return `
            <div class="absolute mob-point bg-red-500 rounded-full h-5 w-5 border-2 border-white shadow-xl animate-pulse" 
                 style="left: ${xPercent}%; top: ${yPercent}%; z-index: 20;"
                 title="Pop Point ${index + 1}">
            </div>
        `;
    }).join('');
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


// --- 開閉ロジックの再実装 ---

/**
 * モブカードの詳細情報の開閉をトグルする
 */
function toggleMobDetails(event) {
    // 報告ボタンのクリックイベントは除外する
    if (event.target.closest('.report-btn')) {
        return;
    }

    const card = event.currentTarget.closest('.mob-card');
    if (!card) return;

    const details = card.querySelector('.detailed-content');
    if (!details) return;

    // hidden クラスをシンプルにトグル
    details.classList.toggle('hidden');

    // 状態属性も更新（CSSの調整などに使える）
    const isOpen = !details.classList.contains('hidden');
    card.dataset.isOpen = isOpen;
    
    // 開閉後、ヘッダーの高さ調整を再実行 (DOM高さが変わるため)
    adjustContentPadding();
}


// --- DOM操作/イベントハンドラ ---

/**
 * モブデータに基づいてHTMLカードを生成する
 */
function createMobCard(mob) {
    const lastKillDate = mob.LastKillDate ? new Date(mob.LastKillDate) : null;
    const repopData = calculateRepop(mob, lastKillDate);
    const { minRepop, timeDisplay, elapsedPercent, isPop, isMaxOver, isUnknown } = repopData;

    let repopTimeColorClass = 'text-white font-extrabold';
    if (isUnknown) {
        repopTimeColorClass = 'text-gray-400';
    } else if (!isPop) {
        // POP前のタイマー表示
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
    
    // 報告ボタンの縦幅/横幅を修正して正方形 (h-8 w-8) にする
    const reportBtnHtml = `
        <button class="bg-green-600 hover:bg-green-500 active:bg-green-700 report-btn text-white px-1 py-1 rounded-md shadow-md transition h-8 w-8 flex flex-col items-center justify-center leading-none flex-shrink-0"
                data-mobno="${mob['No.']}"
                data-rank="${mob.Rank}">
            <span class="text-xs font-bold">${mob.Rank === 'A' ? '即時' : '報告'}</span><span class="text-xs font-bold">${mob.Rank === 'A' ? '報告' : 'する'}</span>
        </button>
    `;

    // --- 詳細コンテンツ (トグルで表示されるエリア) ---
    const conditionHtml = mob.Condition ? `
        <div class="pt-1 pb-0 condition-content text-left text-xs">
            <p class="px-2 font-medium text-gray-400">抽選条件:</p>
            <p class="px-2 text-white leading-snug">${processText(mob.Condition)}</p>
        </div>
    ` : '';

    const memoHtml = mob.Memo ? `
        <div class="pt-1 pb-0 memo-content text-left text-xs">
            <p class="px-2 font-medium text-gray-400">Memo:</p>
            <p class="px-2 text-yellow-300 leading-snug">${processText(mob.Memo)}</p>
        </div>
    ` : '';

    const minRepopStr = formatDateForDisplay(minRepop);
    const minRepopHtml = `
        <div class="px-2 pt-1 pb-0 repop-start-content flex justify-between text-xs">
            <p class="font-semibold text-gray-400">開始時間:</p>
            <p class="text-gray-200 font-mono">${minRepopStr}</p>
        </div>
    `;

    const lastKillStr = formatLastKillDisplay(lastKillDate); // 修正点2
    const lastKillHtml = `
        <div class="px-2 pt-1 pb-1 last-kill-content flex justify-between text-xs">
            <p class="font-semibold text-gray-400">前回時間:</p>
            <p class="text-gray-200 font-mono">${lastKillStr}</p>
        </div>
    `;

    // マップ画像表示とポイント描画の修正 (地点ポイント表示をここに追加)
    const mapImageHtml = mob.Map ? `
        <div class="mob-details pt-1 px-2 map-content relative"> 
            <img src="./maps/${mob.Map}" alt="${mob.Area} Map" class="w-full h-auto rounded-lg shadow-md map-image">
            ${renderMapPoints(mob.Coords)}
        </div>
    ` : '';
    
    // --- 進捗バーエリアのHTML (py-1 -> py-0 に修正) ---
    const repopInfoHtml = `
        <div class="mt-1 bg-gray-700 py-0 px-2 rounded-xl text-xs relative overflow-hidden shadow-inner h-10">
            <div class="progress-bar absolute inset-0 transition-all duration-100 ease-linear rounded-xl" style="width: ${elapsedPercent}%; z-index: 0;"></div>
            <div class="absolute inset-0 flex items-center justify-center z-10">
                <span class="repop-info-display text-lg ${repopTimeColorClass} font-mono w-full text-center">
                    ${timeDisplay}
                </span>
            </div>
        </div>
    `;
    
    // --- モブカードの最終構造 ---
    // py-0: 上下パディングを削除 (カード内部の余白を削減)
    // px-1: 左右パディングを追加 (カラム間の隙間がなくなったため、カードとカードの左右に隙間を確保)
    // mb-1: 下マージンを維持 (カード間の最小限の縦の隙間を確保)
    return `
        <div class="mob-card bg-gray-800 rounded-xl shadow-2xl overflow-hidden relative py-0 px-1 mb-1" 
             data-rank="${mob.Rank}"
             data-mobno="${mob['No.']}"
             data-lastkill="${mob.LastKillDate || ''}"
             data-minrepop="${mob['REPOP(s)']}"
             data-maxrepop="${mob['MAX(s)']}"
             data-expansion="${mob.Expansion || '?'}"
             data-repopscore="${repopData.repopScore}"
             data-is-open="false"> 
             
            <div class="p-2 fixed-content toggle-handler">
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

            <div class="detailed-content pb-2 hidden"> 
                ${conditionHtml}
                ${memoHtml}
                ${minRepopHtml}
                ${lastKillHtml}
                ${mapImageHtml}
            </div>
        </div>
    `;
}

/**
 * フィルターに基づいてモブカードリストをレンダリングする
 */
function renderMobList() {
    const columns = [column1, column2, column3].filter(el => el);
    if (columns.length === 0) {
        console.error("Column DOM elements (column-1, column-2, column-3) not found.");
        displayError("エラー: カラム表示に必要なHTML要素が見つかりません。");
        return; 
    }
    
    const { rank } = currentFilter;
    let filteredMobs = [];
    const activeRanks = rank === 'ALL' ? TARGET_RANKS : [rank];

    for (const r of activeRanks) {
        const rankMobs = globalMobData.filter(mob => mob.Rank === r);
        const currentAreaSet = currentFilter.areaSets[r];

        if (currentAreaSet.has('ALL') && currentAreaSet.size <= 1) {
            filteredMobs.push(...rankMobs.filter(mob => ALL_EXPANSION_NAMES.includes(mob.Expansion)));
        } else if (!currentAreaSet.has('ALL') && currentAreaSet.size > 0) {
            filteredMobs.push(...rankMobs.filter(mob => currentAreaSet.has(mob.Expansion)));
        } else if (currentAreaSet.has('ALL') && currentAreaSet.size > 1) {
             filteredMobs.push(...rankMobs.filter(mob => currentAreaSet.has(mob.Expansion)));
        }
    }
    
    // ソートロジック (修正点1)
    if (currentSort === 'Repop') {
        filteredMobs.sort((a, b) => {
            const aData = calculateRepop(a, a.LastKillDate);
            const bData = calculateRepop(b, b.LastKillDate);
            
            // repopScoreが大きい方が優先度が高い
            if (aData.repopScore > bData.repopScore) return -1;
            if (aData.repopScore < bData.repopScore) return 1;
            
            // スコアが同じ場合はNo.順で安定させる
            return a['No.'] - b['No.'];
        });

    } else { 
        // No.順ソート
        filteredMobs.sort((a, b) => a['No.'] - b['No.']);
    }

    // 1. カラムのクリア
    columns.forEach(col => col.innerHTML = '');

    // 2. モブカードの均等分配ロジック
    let allCardsHtml = Array(columns.length).fill(''); 

    filteredMobs.forEach((mob, index) => {
        const mobCardHtml = createMobCard(mob);
        const columnIndex = index % columns.length; 
        allCardsHtml[columnIndex] += mobCardHtml;
    });

    // 3. DOMへの挿入
    allCardsHtml.forEach((html, index) => {
        columns[index].innerHTML = html;
    });

    // UIの更新
    updateRankTabDisplay(rank);
    updateAreaFilterButtonDisplay(rank);
    updateSortButtonDisplay();

    // DOM更新後に必ずイベントリスナーを再アタッチする
    attachEventListeners();
    updateProgressBars();
    saveFilterState();
}

/**
 * イベントリスナーをカードとボタンにアタッチする
 */
function attachEventListeners() {
    // Report Button Listeners (修正点4)
    document.querySelectorAll('.report-btn').forEach(button => {
        if (button.dataset.mobno) {
            // 既存のイベントリスナーを削除 (renderMobListで再アタッチされるため)
            button.onclick = null; 
            
            button.onclick = async (e) => {
                e.stopPropagation();
                const mobNo = e.currentTarget.dataset.mobno;
                const rank = e.currentTarget.dataset.rank;
                
                // Aランクモブはワンクリックで即時報告
                if (rank === 'A') {
                    await submitReport(mobNo, 'A', true); // 即時報告フラグをtrueに
                } else {
                    openReportModal(mobNo);
                }
            }
        }
    });

    // トグルイベントリスナーの再追加
    document.querySelectorAll('.toggle-handler').forEach(handler => {
        // 既存のイベントリスナーがあれば削除してから再登録 (二重登録防止)
        handler.onclick = null; 
        handler.onclick = toggleMobDetails;
    });
}


// --- フィルタボタンの表示更新 ---

/**
 * ランクタブの表示を更新する (選択中のタブに色を適用)
 * @param {string} currentRank - 現在選択中のランク ('ALL', 'S', 'A', 'F')
 */
function updateRankTabDisplay(currentRank) {
    document.querySelectorAll('.tab-btn').forEach(button => {
        const rank = button.dataset.rank;
        const isActive = rank === currentRank;

        button.classList.remove(ACTIVE_COLOR_CLASS, INACTIVE_COLOR_CLASS);
        button.classList.add(isActive ? ACTIVE_COLOR_CLASS : INACTIVE_COLOR_CLASS);
    });
}

/**
 * エリアフィルタボタンの表示を更新する (選択中のボタンに色を適用)
 * @param {string} rank - 現在選択中のランク ('S', 'A', 'F' のいずれか)
 */
function updateAreaFilterButtonDisplay(rank) {
    // ターゲットとなるランクを決定 (ALLタブ選択時もエリアフィルタは非表示なので 'S' をデフォルトでチェック)
    const targetRank = TARGET_RANKS.includes(rank) ? rank : 'S'; 
    const currentAreaSet = currentFilter.areaSets[targetRank];
    
    document.querySelectorAll('.area-filter-btn').forEach(button => {
        const area = button.dataset.area;
        const isActive = currentAreaSet.has(area);
        
        button.classList.remove(ACTIVE_COLOR_CLASS, INACTIVE_COLOR_CLASS);
        button.classList.add(isActive ? ACTIVE_COLOR_CLASS : INACTIVE_COLOR_CLASS);
        
        // ALLボタンのテキストを調整
        if (area === 'ALL' && button.textContent) {
            const hasSpecificArea = Array.from(currentAreaSet).some(a => a !== 'ALL');
            if (hasSpecificArea && isActive) {
                 button.textContent = 'ALL (全て表示中)';
            } else if (hasSpecificArea && !isActive) {
                 button.textContent = 'ALL';
            } else if (!hasSpecificArea && isActive) {
                 button.textContent = 'ALL';
            }
        }
    });
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

/**
 * 討伐報告の実行
 */
async function submitReport(mobNo, rank, isInstant = false, killTimeLocal = null, memo = '') {
    const mob = getMobByNo(parseInt(mobNo));
    if (!mob) return;

    let targetKillTimeLocal = killTimeLocal;
    let targetMemo = memo;
    let statusEl = isInstant ? errorMessageContainer : reportStatusEl;
    let buttonEl = isInstant ? document.querySelector(`.report-btn[data-mobno="${mobNo}"]`) : submitReportBtn;

    // Aモブの即時報告の場合、現在時刻を使用
    if (isInstant) {
        const now = new Date();
        const offset = now.getTimezoneOffset() * 60000;
        targetKillTimeLocal = (new Date(now.getTime() - offset)).toISOString().slice(0, 16);
        targetMemo = ''; 
        
        if (buttonEl) {
            buttonEl.disabled = true;
            buttonEl.innerHTML = '<span class="text-xs font-bold">送信</span><span class="text-xs font-bold">中...</span>';
            buttonEl.classList.remove('bg-green-600', 'hover:bg-green-500');
            buttonEl.classList.add('bg-gray-500');
        }
    } else {
        if (!targetKillTimeLocal || !statusEl || !buttonEl) return;
        targetKillTimeLocal = killTimeLocal;
        targetMemo = memo;

        buttonEl.disabled = true;
        buttonEl.textContent = '送信中...';
        buttonEl.className = 'w-full px-4 py-2 bg-gray-500 text-white font-bold rounded-lg shadow-lg transition-colors duration-200';

        statusEl.classList.remove('hidden', 'text-green-500', 'text-red-500');
        statusEl.textContent = 'サーバーに送信中...';
    }

    const killTimeJstIso = toJstAdjustedIsoString(targetKillTimeLocal);

    try {
        const response = await fetch(GAS_ENDPOINT, {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                action: 'reportKill',
                mobNo: mobNo,
                mobName: mob.Name,
                rank: rank,
                killTime: killTimeJstIso,
                memo: targetMemo,
                reporterId: userId
            })
        });

        const result = await response.json();

        if (result.status === 'success') {
            displayError(null); // 上部のエラーを消す
            
            if (isInstant) {
                // Aモブ即時報告の場合: 成功アニメーションを適用
                if (buttonEl) {
                    buttonEl.innerHTML = '<span class="text-xs font-bold">成功</span><span class="text-xs font-bold">!</span>';
                    buttonEl.classList.remove('bg-gray-500');
                    buttonEl.classList.add('bg-green-600');
                }
                
                // データ更新
                await fetchRecordsAndUpdate('manual', false);

                // アニメーション後にボタンを元に戻す
                setTimeout(() => {
                    if (buttonEl) {
                        buttonEl.innerHTML = '<span class="text-xs font-bold">即時</span><span class="text-xs font-bold">報告</span>';
                        buttonEl.disabled = false;
                        buttonEl.classList.add('hover:bg-green-500');
                    }
                }, 1500);

            } else {
                // S/FATE モーダル報告の場合
                statusEl.textContent = `報告成功！ (${result.message})`;
                statusEl.classList.add('text-green-500');

                buttonEl.textContent = '報告完了';
                buttonEl.className = 'w-full px-4 py-2 bg-green-600 text-white font-bold rounded-lg shadow-lg transition-colors duration-200';
                buttonEl.disabled = false;

                await fetchRecordsAndUpdate('manual', false);
                setTimeout(closeReportModal, 1500);
            }

        } else {
            const failMessage = `報告失敗: ${result.message}`;
            console.error(failMessage);
            
            if (isInstant) {
                // Aモブ即時報告の場合: エラーメッセージを表示
                displayError(failMessage);
                if (buttonEl) {
                    buttonEl.innerHTML = '<span class="text-xs font-bold">失敗</span><span class="text-xs font-bold">...</span>';
                    buttonEl.classList.remove('bg-gray-500');
                    buttonEl.classList.add('bg-red-600');
                    setTimeout(() => {
                        if (buttonEl) {
                            buttonEl.innerHTML = '<span class="text-xs font-bold">即時</span><span class="text-xs font-bold">報告</span>';
                            buttonEl.disabled = false;
                            buttonEl.classList.remove('bg-red-600');
                            buttonEl.classList.add('bg-green-600', 'hover:bg-green-500');
                        }
                    }, 3000);
                }
            } else {
                // S/FATE モーダル報告の場合
                statusEl.textContent = failMessage;
                statusEl.classList.add('text-red-500');
                buttonEl.textContent = '送信失敗';
                buttonEl.className = 'w-full px-4 py-2 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-bold rounded-lg shadow-lg transition-colors duration-200';
                buttonEl.disabled = false;
            }
        }

    } catch (error) {
        const networkError = '通信エラーが発生しました。';
        console.error('報告エラー:', error);
        
        if (isInstant) {
            displayError(networkError);
        } else {
            reportStatusEl.textContent = networkError;
            reportStatusEl.classList.add('text-red-500');
        }

        if (buttonEl) {
            buttonEl.textContent = isInstant ? '失敗...' : '送信失敗';
            buttonEl.className = (isInstant ? 'bg-red-600' : 'bg-red-600 hover:bg-red-500 active:bg-red-700') + ' w-full px-4 py-2 text-white font-bold rounded-lg shadow-lg transition-colors duration-200';
            buttonEl.disabled = false;
        }
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
                    newMob.Memo = record.Memo || ''; 
                } else {
                    newMob.LastKillDate = '';
                    newMob.Memo = '';
                }

                // 湧き潰し関連データはもうカード表示に使われないが、構造は維持
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
        
        const repopData = calculateRepop({"REPOP(s)": repop, "MAX(s)": max}, lastKillDate);
        const percent = repopData.elapsedPercent || 0;

        const repopInfoDisplayEl = card.querySelector('.repop-info-display');
        const progressBarEl = card.querySelector('.progress-bar');
        const lastKillEl = card.querySelector('.last-kill-content p:last-child'); // 前回時間の値の要素

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
        
        // LastKill表示も更新 (X分前)
        if (lastKillEl) {
             lastKillEl.textContent = formatLastKillDisplay(lastKillDate);
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

            // transition-all duration-100 は tailwind.config.js で定義が必要
            progressBarEl.className = `progress-bar absolute inset-0 transition-all duration-100 ease-linear rounded-xl ${barColorClass} ${animateClass}`;
            progressBarEl.style.height = '100%';
            progressBarEl.style.width = `${widthPercent}%`;
        }
    });
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

    // フィルタとソート状態のロード
    loadFilterState();
    updateSortButtonDisplay();
    
    toggleAreaFilterPanel(false); 

    adjustContentPadding();
    window.addEventListener('resize', adjustContentPadding);


    // 2. イベントリスナーの設定

    // ソートボタンのリスナー
    if (sortToggleBtn) {
        sortToggleBtn.onclick = toggleSortState;
    }

    // ランクタブの排他的トグル動作
    if (rankTabs) {
        document.querySelectorAll('.tab-btn').forEach(button => {
            button.onclick = (e) => {
                const newRank = e.currentTarget.dataset.rank;
                const currentRank = currentFilter.rank;
                const newRankIsTarget = TARGET_RANKS.includes(newRank);

                if (newRankIsTarget) {
                    if (newRank !== lastClickedRank) {
                        // ランクが切り替わった場合
                        rankClickCount = 1;
                        toggleAreaFilterPanel(false); // ランク切り替え時は一度閉じる
                        lastClickedRank = newRank;
                    } else {
                        // 同じランクを連続クリック
                        rankClickCount = (rankClickCount % 3) + 1;
                    }

                    if (rankClickCount === 2) {
                        toggleAreaFilterPanel(true); // 2回目で開く
                    } else if (rankClickCount === 3) {
                        toggleAreaFilterPanel(false); // 3回目で閉じる
                        rankClickCount = 0; // 閉じた後、次のクリックで1に戻す
                    }
                } else {
                    // ALLタブの場合、閉じる
                    rankClickCount = 0;
                    lastClickedRank = null;
                    toggleAreaFilterPanel(false);
                }

                if (currentRank !== newRank) {
                    currentFilter.rank = newRank;
                    renderMobList();
                } else if (newRankIsTarget) {
                    // ランクが変わらない場合でも、エリアフィルタの開閉後に再レンダリング
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


    // モーダル関連のリスナー
    if (cancelReportBtn) cancelReportBtn.onclick = closeReportModal;
    if (submitReportBtn) submitReportBtn.onclick = () => {
        // S/FATEモーダルの送信処理
        submitReport(currentMobNo, getMobByNo(currentMobNo).Rank, false, reportDatetimeInput.value, reportMemoInput.value);
    };

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
