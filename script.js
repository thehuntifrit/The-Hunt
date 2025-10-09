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
    areaSets: {
        'S': new Set(['ALL']),
        'A': new Set(['ALL']),
        'F': new Set(['ALL'])
    }
};
let currentSort = 'repop'; // ソート初期状態: 'repop', 'area', 'rank'
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
    sortOptionsContainer: document.getElementById('sort-options-container'),
    contentColumns: document.getElementById('content-columns'),
    columns: [
        document.getElementById('column-1'),
        document.getElementById('column-2'),
        document.getElementById('column-3')
    ].filter(col => col)
};
const { errorMessageContainer, rankTabs, reportModal, modalMobName, reportDatetimeInput, reportMemoInput, submitReportBtn, cancelReportBtn, reportStatusEl, uuidDisplayEl, areaFilterWrapper, areaFilterContainer, fixedHeaderContent, contentSpacer, sortOptionsContainer, contentColumns, columns } = DOMElements;


// --- 定数: 拡張パック名定義/ランク順序 ---
const EXPANSION_MAP = {
    1: '新生', 2: '蒼天', 3: '紅蓮', 4: '漆黒', 5: '暁月', 6: '黄金'
};
const TARGET_RANKS = ['S', 'A', 'F'];
const RANK_ORDER_MAP = { 'S': 1, 'A': 2, 'F': 3, 'B': 4 };

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
 * 日付から経過時間を相対表示 (X分前) に変換する (1時間未満のみ)
 * @returns {string | null} 1時間未満なら "X分前"、そうでなければ null
 */
function timeSince(date) {
    if (!date || isNaN(date.getTime())) return null;

    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    const minutes = seconds / 60;

    if (minutes < 60) {
        return Math.floor(minutes) + '分前';
    }

    // 1時間以上の場合は相対表示は行わない（絶対時刻表示にフォールバックさせる）
    return null;
}

/**
 * テキストを // で改行する関数
 */
const processText = (text) => {
    return text.replace(/\/\/\s*/g, '<br>');
};

/**
 * MobNoから拡張、ランク、モブ番号、インスタンス番号を抽出する
 * Mob ID: 5(拡張) 4(ランク) 3,2(モブ番号) 1(インスタンス)
 */
function getMobIdDigits(mobNo) {
    const id = parseInt(mobNo);
    // 例: 42031 -> 拡張: 4, ランク: 2, モブ番号: 03, インスタンス: 1
    const expansion = Math.floor(id / 10000); // 5桁目
    const rank = Math.floor((id % 10000) / 1000); // 4桁目
    const mobNum = Math.floor((id % 1000) / 10); // 3,2桁目
    const instance = id % 10; // 1桁目
    return { expansion, rank, mobNum, instance };
}

/**
 * ローカル日時 (ISO形式) をJSTとしてGASに渡すためのISO文字列に変換する
 */
function toJstAdjustedIsoString(localIsoString) {
    const localDate = new Date(localIsoString);
    // タイムゾーンのオフセットを考慮してJST (UTC+9) の時刻に調整
    const jstOffset = 9 * 60; // JSTは+9時間、分単位
    const localOffset = localDate.getTimezoneOffset(); // ローカルのオフセット（UTCからの差分）
    
    // localDate.getTime() は UTC での時間 (ms)
    // localDate.getTimezoneOffset() は UTC から local への差分 (min)
    // JST のタイムスタンプ = localDate.getTime() + (localOffset + jstOffset) * 60000
    // JST = UTC + 9h, local = UTC - localOffset
    // JST = local + localOffset + 9h (540min)
    const jstDate = new Date(localDate.getTime() + (localOffset + jstOffset) * 60000);

    return jstDate.toISOString();
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
 * (ソート用の値 'sortValue' も返すように拡張)
 */
function calculateRepop(mob, lastKill) {
    const killTime = (lastKill instanceof Date) ? lastKill : (lastKill ? new Date(lastKill) : null);
    const isUnknown = !killTime || isNaN(killTime.getTime());

    const repopMinMs = mob['REPOP(s)'] * 1000;
    const repopMaxMs = mob['MAX(s)'] * 1000;
    const popDurationMs = repopMaxMs - repopMinMs;

    let minRepopTime, maxRepopTime, timeDisplay;
    let elapsedPercent = 0;
    let isPop = false;
    let isMaxOver = false;
    const now = new Date();
    let sortValue = 0; // デフォルトは 0

    if (repopMinMs <= 0 || repopMaxMs <= repopMinMs) {
        // データ異常またはFATEモブなどの計算不要な場合
        return { minRepop: 'N/A', maxRepop: 'N/A', timeDisplay: 'N/A', isPop: false, isMaxOver: false, isUnknown: true, elapsedPercent: 0, sortValue: -1 };
    }

    if (isUnknown) {
        // Unknown: 討伐時刻が不明な場合は、ソート値を -1 (最後尾) とする
        minRepopTime = new Date(now.getTime() + repopMinMs);
        timeDisplay = `Next: ${formatDateForDisplay(minRepopTime)}`;
        elapsedPercent = 0;
        sortValue = -1; // 最も低い優先度
    } else {
        minRepopTime = new Date(killTime.getTime() + repopMinMs);
        maxRepopTime = new Date(killTime.getTime() + repopMaxMs);

        const remainingMsToMin = minRepopTime.getTime() - now.getTime();

        if (remainingMsToMin > 0) {
            // Phase 1: Pre-Min Repop (湧き時間前)
            isPop = false;
            // POP時間が近いものから並べるため、残り時間を負の値としてソート値とする
            sortValue = remainingMsToMin * -1; // 残り時間が短いほど（0に近いほど）優先度が高い
            
            const duration = formatDurationPart(remainingMsToMin);
            timeDisplay = `Next: ${formatDateForDisplay(minRepopTime)} (${duration}まで)`;
            elapsedPercent = 0;
            
        } else {
            // Phase 2 & 3: In or After POP Window (湧き中または湧きすぎ)
            isPop = true;
            const remainingMsToMax = maxRepopTime.getTime() - now.getTime();

            if (remainingMsToMax > 0) {
                // Phase 2: In POP Window (抽選期間内)
                isMaxOver = false;
                const elapsedInWindowMs = now.getTime() - minRepopTime.getTime();
                elapsedPercent = Math.max(0, Math.min(100, (elapsedInWindowMs / popDurationMs) * 100));

                const duration = formatDurationPart(remainingMsToMax);
                // 表示形式の改善: 進捗率を強調
                timeDisplay = `${elapsedPercent.toFixed(1)}% (残り: ${duration})`;
                sortValue = 10000 + elapsedPercent; // POP済みは10000+Xで、未POPより優先
                
            } else {
                // Phase 3: Max Repop Exceeded (最大湧き時間を超過)
                isMaxOver = true;
                const popElapsedMs = now.getTime() - maxRepopTime.getTime();
                const formattedElapsed = formatDurationPart(popElapsedMs, '+');
                
                // 表示形式の改善: 100%超を強調
                timeDisplay = `100.0% (${formattedElapsed})`;
                elapsedPercent = 100;
                // POP済みの中でも超過時間が長いほど優先度が高い
                sortValue = 100 + (popElapsedMs / 60000); // 100 + 超過時間(分)

            }
        }
    }

    return { 
        minRepop: minRepopTime, 
        maxRepop: maxRepopTime, 
        timeDisplay: timeDisplay, 
        elapsedPercent: elapsedPercent, 
        isPop: isPop, 
        isMaxOver: isMaxOver, 
        isUnknown: isUnknown,
        sortValue: sortValue
    };
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
            sort: currentSort, // ソート状態を保存
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

            // ランクフィルターのロード
            if (parsedState.rank && (TARGET_RANKS.includes(parsedState.rank) || parsedState.rank === 'ALL')) {
                currentFilter.rank = parsedState.rank;
            }

            // エリアフィルターのロード
            if (parsedState.areaSets) {
                for (const rank in parsedState.areaSets) {
                    if (currentFilter.areaSets[rank]) {
                        currentFilter.areaSets[rank] = new Set(parsedState.areaSets[rank]);
                    }
                }
            }

            // NEW: ソート状態のロード
            if (parsedState.sort && ['repop', 'area', 'rank'].includes(parsedState.sort)) {
                currentSort = parsedState.sort;
            }
        }
    } catch (e) {
        console.error('Failed to load filter state from localStorage:', e);
    }
}


// --- データフェッチと統合 ---

/**
 * 静的モブデータをロードする
 */
async function fetchBaseMobData() {
    displayError('モブデータをロード中...');
    try {
        const response = await fetch(MOB_DATA_URL);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        baseMobData = await response.json();
        
        // baseMobDataをソートし、エリアフィルタボタンを生成
        baseMobData.sort((a, b) => a['No.'] - b['No.']);
        generateAreaFilterButtons();

        displayError('討伐記録を取得中...');
        await fetchRecordsAndUpdate('initial');

    } catch (e) {
        console.error('Error fetching base mob data:', e);
        displayError(`静的モブデータのロードに失敗しました: ${e.message}`);
    }
}

/**
 * GASから討伐記録と湧き潰し状態を取得し、マージする
 */
async function fetchRecordsAndUpdate(type = 'manual', isSilent = false) {
    if (!isSilent) {
        displayError(type === 'initial' ? '討伐記録を初期取得中...' : 'データを更新中...');
    }
    
    try {
        const response = await fetch(`${GAS_ENDPOINT}?action=getRecords&userId=${userId}`);
        const result = await response.json();

        if (result.error) throw new Error(result.error);
        if (!result.records) throw new Error('サーバーから無効な応答がありました。');

        const recordsMap = new Map(result.records.map(r => [r['Mob No.'], r]));
        const cullsMap = new Map(result.culls.map(c => [c.key, c]));

        globalMobData = baseMobData.map(mob => {
            const record = recordsMap.get(mob['No.']);
            const cullStatus = cullsMap.get(mob['No.']); // 湧き潰し情報は Mob No. で取得

            const lastKill = record ? unixTimeToDate(record['Kill Date']) : null;
            
            // リポップ情報を計算
            const repopInfo = calculateRepop(mob, lastKill);

            return {
                ...mob,
                LastKillDate: lastKill,
                RepopInfo: repopInfo,
                isCulled: cullStatus ? cullStatus.status : false
            };
        });

        filterAndRender();

    } catch (e) {
        console.error('Error fetching records:', e);
        displayError(`データ取得に失敗しました: ${e.message}`);
    } finally {
        if (!isSilent) {
            displayError(''); // エラーメッセージをクリア
        }
    }
}


// --- モブリストのフィルタリングとレンダリング ---

/**
 * フィルターとソートを適用してリストを再描画する
 */
function filterAndRender() {
    const { rank } = currentFilter;
    const currentAreaSet = currentFilter.areaSets[rank];

    const filteredData = globalMobData.filter(mob => {
        // ランクフィルター
        const rankMatch = rank === 'ALL' || mob.Rank === rank;

        // エリアフィルター
        const areaName = mob.Area;
        const areaMatch = !currentAreaSet || currentAreaSet.has('ALL') || currentAreaSet.has(areaName);
        
        return rankMatch && areaMatch;
    });

    // ソートを適用
    const sortedData = sortGlobalMobData(filteredData);

    renderMobList(sortedData);
    saveFilterState();
    updateActiveFilterUI();
}

/**
 * データを現在のソート設定に基づいて並べ替える
 */
function sortGlobalMobData(data) {
    const rankMap = RANK_ORDER_MAP; // S:1, A:2, F:3, B:4

    return data.sort((a, b) => {
        // --- 1. Repop 優先度順ソート (標準) ---
        if (currentSort === 'repop') {
            const valA = a.RepopInfo.sortValue;
            const valB = b.RepopInfo.sortValue;
            
            // POP済み(正の値) または 未知(-1) の場合: 降順 (大きい方が優先)
            // 未POP(負の値) の場合: 昇順 (0に近い方が優先)
            
            if (valA === -1 && valB !== -1) return 1; // A unknown, B known -> A later
            if (valA !== -1 && valB === -1) return -1; // B unknown, A known -> B later
            if (valA === -1 && valB === -1) return b['No.'] - a['No.']; // Both unknown: Fallback to ID

            // どちらも POP済み (>= 10000) または どちらも未POP (< 0) の場合
            if ((valA >= 10000 && valB >= 10000) || (valA < 0 && valB < 0)) {
                 return valB - valA; // POP済みは経過率順(降順), 未POPは残り時間順(昇順)
            }
            
            // A: POP済み, B: 未POP -> A 優先
            if (valA >= 10000) return -1;
            // B: POP済み, A: 未POP -> B 優先
            if (valB >= 10000) return 1;

            return valB - valA; // 通常の降順 (should be caught by above logic)
        }

        // --- 2. エリア順ソート ---
        if (currentSort === 'area') {
            const idA = getMobIdDigits(a['No.']);
            const idB = getMobIdDigits(b['No.']);
            
            // 1. 拡張パック順 (5桁目)
            if (idA.expansion !== idB.expansion) return idA.expansion - idB.expansion;
            
            // 2. ランク順 (4桁目)
            if (idA.rank !== idB.rank) return idA.rank - idB.rank;
            
            // 3. モブ番号順 (2,3桁目)
            if (idA.mobNum !== idB.mobNum) return idA.mobNum - idB.mobNum;

            // 4. インスタンス番号順 (1桁目)
            return idA.instance - idB.instance;
        }

        // --- 3. ランク順ソート ---
        if (currentSort === 'rank') {
            const rankOrderA = rankMap[a.Rank] || 99;
            const rankOrderB = rankMap[b.Rank] || 99;

            if (rankOrderA !== rankOrderB) return rankOrderA - rankOrderB;
            
            // 同一ランク内ではMob No.順 (元の並び)
            return a['No.'] - b['No.'];
        }

        // デフォルト: Mob No.順
        return a['No.'] - b['No.'];
    });
}


/**
 * モブデータをカラムに分割してHTMLを生成し、DOMに挿入する
 */
function renderMobList(data) {
    if (columns.length === 0) return;

    columns.forEach(col => col.innerHTML = '');
    
    // モブカード生成とカラムへの振り分け
    data.forEach((mob, index) => {
        const columnIndex = index % columns.length;
        const html = mobCardHtml(mob);
        columns[columnIndex].insertAdjacentHTML('beforeend', html);
    });
}

/**
 * 個別のモブカードのHTMLを生成する
 */
function mobCardHtml(mob) {
    const isCulled = mob.isCulled;
    const rank = mob.Rank;
    const repop = mob.RepopInfo;
    const lastKillDate = mob.LastKillDate;

    // 討伐日時の表示: 絶対時刻 + 相対時刻 (1時間未満のみ)
    let lastKillText = formatDateForDisplay(lastKillDate);
    const relativeTime = timeSince(lastKillDate); // 1時間未満なら "X分前"

    if (relativeTime) {
        lastKillText = `${lastKillText} (${relativeTime})`;
    }


    // リポップ情報の表示
    let repopStatusText = '';
    let progressBarClass = 'bg-gray-700';
    let progressBarWidth = '0%';

    if (repop.isUnknown) {
        repopStatusText = `<span class="text-yellow-400">討伐日時不明 (推定POP: ${repop.timeDisplay.split(': ')[1]})</span>`;
    } else if (repop.isMaxOver) {
        repopStatusText = `<span class="font-extrabold text-red-500">${repop.timeDisplay}</span>`;
        progressBarClass = 'bg-red-800';
        progressBarWidth = '100%';
    } else if (repop.isPop) {
        // NEW: 進捗率を強調した表示
        repopStatusText = `<span class="font-extrabold text-green-400">${repop.timeDisplay}</span>`;
        progressBarClass = 'bg-green-700';
        progressBarWidth = `${repop.elapsedPercent}%`;
    } else {
        // POP前
        const remainingDuration = formatDurationPart(repop.minRepop.getTime() - new Date().getTime());
        repopStatusText = `<span class="text-gray-400">POP前 (約 ${remainingDuration})</span>`;
        progressBarClass = 'bg-blue-700';
        progressBarWidth = '0%'; // POP前は常に0%
    }
    
    // Aランクのみワンクリック報告を有効化
    const isA = rank === 'A';
    const reportButtonClass = isA ? 'report-button report-one-click-btn' : 'report-button report-modal-btn';
    
    // 湧き潰しUI（今回は既存ロジック維持のため、Bモブの特殊処理は行わない）
    const cullButtonHtml = rank !== 'F' && rank !== 'S' ? `
        <button data-mob-no="${mob['No.']}" data-cull-state="${isCulled ? 'true' : 'false'}" 
                class="cull-toggle-btn w-full py-1 rounded-lg text-xs font-semibold mt-2 transition 
                ${isCulled ? 'bg-gray-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}">
            湧き潰し ${isCulled ? '済み' : '未実施'}
        </button>` : '';


    return `
        <div data-mob-no="${mob['No.']}" data-rank="${rank}"
             class="mob-card bg-gray-800 p-4 rounded-xl shadow-xl transition-all duration-300 transform hover:shadow-2xl hover:scale-[1.01] mb-4 
             border border-gray-700">
            
            <!-- Mob Header -->
            <div class="flex justify-between items-start mb-2">
                <h3 class="text-xl font-bold ${rank === 'S' ? 'text-red-400' : rank === 'A' ? 'text-blue-400' : rank === 'F' ? 'text-yellow-400' : 'text-gray-400'}">
                    [${rank}] ${mob.Name} 
                </h3>
                <span class="text-sm font-semibold text-gray-500">ID: ${mob['No.']}</span>
            </div>
            
            <!-- Area & Map -->
            <p class="text-sm text-gray-400 mb-2">
                <span class="font-medium text-white">${mob.Area}</span> (Lv. ${mob.Level})
            </p>

            <!-- Repop Bar (Base) -->
            <div class="relative h-2 bg-gray-700 rounded-xl mb-3">
                <div class="progress-bar absolute ${progressBarClass} text-xs font-medium text-blue-100 text-center" 
                     style="width: ${progressBarWidth};">
                </div>
            </div>

            <!-- Repop Status -->
            <div class="text-sm font-mono mb-2">
                ${repopStatusText}
            </div>

            <!-- Last Kill Date -->
            <div class="text-xs text-gray-500 mb-3">
                最終討伐: <span class="font-mono text-white">${lastKillText}</span>
            </div>
            
            <!-- Actions and Info Toggle -->
            <div class="flex space-x-2">
                <!-- NEW: Aランクはワンクリック、その他はモーダル -->
                <button data-mob-no="${mob['No.']}" data-rank="${rank}"
                        class="${reportButtonClass} flex-1 py-2 rounded-lg text-sm font-semibold transition bg-green-600 text-white hover:bg-green-500">
                    報告する
                </button>
                
                <button data-mob-no="${mob['No.']}" class="toggle-details-btn flex-none py-2 px-3 rounded-lg text-sm font-semibold transition bg-gray-700 text-white hover:bg-gray-600">
                    詳細
                </button>
            </div>
            
            ${cullButtonHtml}

            <!-- Details Panel (Hidden by default) -->
            <div class="expandable-panel mt-3 p-3 bg-gray-900 rounded-lg" id="details-panel-${mob['No.']}">
                <p class="text-sm text-gray-400 mb-2">
                    <span class="font-semibold text-white">最小POP:</span> ${formatDurationPart(mob['REPOP(s)'] * 1000)}<br>
                    <span class="font-semibold text-white">最大POP:</span> ${formatDurationPart(mob['MAX(s)'] * 1000)}
                </p>
                <div class="text-sm text-gray-400 mb-2">
                    <span class="font-semibold text-white">出現条件:</span><br>
                    ${processText(mob.Conditions || 'なし')}
                </div>
                <div class="text-sm text-gray-400">
                    <span class="font-semibold text-white">ヒント:</span><br>
                    ${processText(mob.Hint || 'なし')}
                </div>

                <!-- Map Section -->
                <div class="map-content mt-3 rounded-lg overflow-hidden border border-gray-700">
                    <img src="${mob.MapUrl}" alt="${mob.Area} Map" class="w-full h-auto" onerror="this.onerror=null;this.src='https://placehold.co/400x200/4f46e5/ffffff?text=Map+Unavailable'" loading="lazy">
                    <div class="map-overlay" data-mob-no="${mob['No.']}">
                        <!-- Spawn points are added here by JS -->
                    </div>
                </div>
            </div>

        </div>
    `;
}


// --- 討伐報告ロジック ---

/**
 * 汎用的な討伐報告処理（Modal, One-Click共通）
 */
async function submitReport(mobNo, reportDate, memo) {
    if (!reportDate || !mobNo) {
        displayError('モブIDまたは報告日時が不正です。');
        return false;
    }

    const mob = getMobByNo(mobNo);
    if (!mob) {
        displayError('指定されたモブが見つかりません。');
        return false;
    }

    const jstIsoString = toJstAdjustedIsoString(reportDate);

    // 報告ステータスを表示
    const modalStatusEl = document.getElementById('report-status');
    if (modalStatusEl) {
        modalStatusEl.innerHTML = '報告を送信中...';
        modalStatusEl.classList.remove('hidden');
    }

    try {
        const payload = {
            action: 'reportKill',
            userId: userId,
            mobNo: mobNo,
            killTime: jstIsoString,
            memo: memo || ''
        };

        const response = await fetch(GAS_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (result.status === 'success') {
            // モーダルを閉じる
            if (reportModal && reportModal.classList.contains('flex')) {
                reportModal.classList.add('hidden');
                reportModal.classList.remove('flex');
            }
            // 成功メッセージ表示（今回はトーストは見送り）
            console.log(`Report successful for ${mob.Name}.`);
            
            // 報告成功後、データを自動更新
            await fetchRecordsAndUpdate('auto', true);
            
            // 報告成功のフィードバックをコンソールに表示
            console.log("データ同期完了。");
            return true;

        } else {
            throw new Error(result.message || '報告に失敗しました。');
        }
    } catch (e) {
        console.error('Submission error:', e);
        displayError(`報告エラー: ${e.message}`);
        if (modalStatusEl) {
             modalStatusEl.innerHTML = `報告エラー: ${e.message}`;
        }
        return false;
    }
}

/**
 * NEW: Aランク専用のワンクリック報告
 */
async function oneClickReport(mobNo) {
    const mob = getMobByNo(mobNo);
    if (!mob) return;

    // Aランク報告時は、現在時刻を即座に使用し、メモは空欄で送信
    const currentISODate = new Date().toISOString().substring(0, 16);
    
    // UIフィードバック (ボタンを一時的に変更)
    const button = document.querySelector(`.report-one-click-btn[data-mob-no="${mobNo}"]`);
    if (button) {
        button.disabled = true;
        button.textContent = '送信中...';
        button.classList.remove('bg-green-600', 'hover:bg-green-500');
        button.classList.add('bg-yellow-600');
    }

    const success = await submitReport(mobNo, currentISODate, null);

    // UIを元に戻す
    if (button) {
        button.disabled = false;
        button.textContent = '報告する';
        button.classList.remove('bg-yellow-600');
        
        if (success) {
            button.classList.add('bg-green-600', 'hover:bg-green-500');
        } else {
            // 失敗時は赤に戻す
            button.classList.add('bg-red-500', 'hover:bg-red-400');
            setTimeout(() => {
                 button.classList.remove('bg-red-500', 'hover:bg-red-400');
                 button.classList.add('bg-green-600', 'hover:bg-green-500');
            }, 3000);
        }
    }
}

/**
 * S/Fランク用のモーダル表示
 */
function openReportModal(mobNo) {
    const mob = getMobByNo(mobNo);
    if (!mob || mob.Rank === 'A') return; // Aランクはワンクリックで処理

    currentMobNo = mobNo;
    modalMobName.textContent = mob.Name;
    reportStatusEl.classList.add('hidden');

    // 現在時刻を設定
    const now = new Date();
    // ISO 8601形式 (YYYY-MM-DDThh:mm) に変換して datetime-local にセット
    const isoString = now.toISOString();
    reportDatetimeInput.value = isoString.substring(0, 16);
    reportMemoInput.value = '';

    reportModal.classList.remove('hidden');
    reportModal.classList.add('flex');
}

/**
 * モーダルからの報告実行
 */
submitReportBtn.onclick = async () => {
    const reportDate = reportDatetimeInput.value;
    const memo = reportMemoInput.value;
    if (await submitReport(currentMobNo, reportDate, memo)) {
        currentMobNo = null;
    }
};

/**
 * モーダルを閉じる
 */
function closeReportModal() {
    reportModal.classList.add('hidden');
    reportModal.classList.remove('flex');
    currentMobNo = null;
}
cancelReportBtn.onclick = closeReportModal;
reportModal.onclick = (e) => {
    if (e.target === reportModal) closeReportModal();
};


// --- フィルターUIと初期化 ---

/**
 * エリアフィルターボタンを生成する
 */
function generateAreaFilterButtons() {
    // 既存のALLボタン以外をクリア
    const existingButtons = areaFilterContainer.querySelectorAll('.area-filter-btn:not([data-area="ALL"])');
    existingButtons.forEach(btn => btn.remove());

    const rank = currentFilter.rank;
    const mobList = baseMobData.filter(m => rank === 'ALL' || m.Rank === rank);
    
    const uniqueAreas = new Set(mobList.map(m => m.Area));
    const sortedAreas = Array.from(uniqueAreas).sort();

    const areaButtonsHtml = sortedAreas.map(area => `
        <button data-area="${area}" class="area-filter-btn bg-gray-600 hover:bg-gray-500 text-white py-1 px-3 rounded-md text-sm transition">
            ${area}
        </button>
    `).join('');

    areaFilterContainer.querySelector('.flex-wrap').insertAdjacentHTML('beforeend', areaButtonsHtml);
    
    // エリアフィルタの開閉を調整
    const areaFilterOpen = currentFilter.rank !== 'ALL';
    areaFilterWrapper.classList.toggle('open', areaFilterOpen);
    // 開いている場合は max-height を設定
    if (areaFilterOpen) {
        areaFilterWrapper.style.maxHeight = areaFilterContainer.scrollHeight + 16 + 'px'; // +16px for padding/margin buffer
    } else {
        areaFilterWrapper.style.maxHeight = '0px';
    }
}

/**
 * アクティブなフィルターボタンとソートボタンのUIを更新
 */
function updateActiveFilterUI() {
    // 1. ランクタブの更新
    rankTabs.querySelectorAll('.tab-btn').forEach(btn => {
        const isActive = btn.dataset.rank === currentFilter.rank;
        btn.classList.toggle('bg-blue-600', isActive);
        btn.classList.toggle('bg-gray-700', !isActive);
        btn.classList.toggle('hover:bg-blue-500', isActive);
        btn.classList.toggle('hover:bg-gray-600', !isActive);
    });

    // 2. エリアフィルタボタンの更新
    const currentAreaSet = currentFilter.areaSets[currentFilter.rank] || new Set(['ALL']);
    areaFilterContainer.querySelectorAll('.area-filter-btn').forEach(btn => {
        const isActive = currentAreaSet.has(btn.dataset.area);
        btn.classList.toggle('bg-blue-600', isActive);
        btn.classList.toggle('bg-gray-600', !isActive);
        btn.classList.toggle('hover:bg-blue-500', isActive);
        btn.classList.toggle('hover:bg-gray-500', !isActive);
    });

    // 3. NEW: ソートボタンの更新
    sortOptionsContainer.querySelectorAll('.sort-btn').forEach(btn => {
        const isActive = btn.dataset.sort === currentSort;
        btn.classList.toggle('active', isActive);
        btn.classList.toggle('bg-blue-600', isActive);
        btn.classList.toggle('bg-gray-700', !isActive);
        btn.classList.toggle('hover:bg-blue-500', isActive);
        btn.classList.toggle('hover:bg-gray-600', !isActive);
    });
}

/**
 * すべてのイベントリスナーを設定する
 */
function attachEventListeners() {
    // --- フィルター関連リスナー ---
    
    // ランクタブ切り替え
    rankTabs.addEventListener('click', (e) => {
        const btn = e.target.closest('.tab-btn');
        if (btn) {
            const newRank = btn.dataset.rank;
            if (currentFilter.rank !== newRank) {
                currentFilter.rank = newRank;
                generateAreaFilterButtons(); // ランク変更時にエリアボタン再生成
                filterAndRender();
            }
        }
    });

    // エリアフィルターボタン切り替え
    areaFilterContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.area-filter-btn');
        if (btn) {
            const newArea = btn.dataset.area;
            const rank = currentFilter.rank;
            const currentSet = currentFilter.areaSets[rank];

            if (newArea === 'ALL') {
                currentSet.clear();
                currentSet.add('ALL');
            } else {
                currentSet.delete('ALL');
                if (currentSet.has(newArea)) {
                    currentSet.delete(newArea);
                } else {
                    currentSet.add(newArea);
                }
                if (currentSet.size === 0) {
                    currentSet.add('ALL');
                }
            }
            filterAndRender();
        }
    });

    // --- NEW: ソートボタンリスナー ---
    sortOptionsContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.sort-btn');
        if (btn) {
            const newSort = btn.dataset.sort;
            if (currentSort !== newSort) {
                currentSort = newSort;
                filterAndRender(); // フィルターとソートを適用して再描画
            }
        }
    });

    // --- 報告・詳細リスナー (デリゲート) ---
    contentColumns.addEventListener('click', (e) => {
        // 詳細トグル
        const toggleBtn = e.target.closest('.toggle-details-btn');
        if (toggleBtn) {
            const mobNo = toggleBtn.dataset.mobNo;
            const card = toggleBtn.closest('.mob-card');
            const panel = card.querySelector(`#details-panel-${mobNo}`);
            
            card.classList.toggle('open');
            
            if (card.classList.contains('open')) {
                // 開くときに高さを設定
                panel.style.maxHeight = panel.scrollHeight + 30 + 'px';
            } else {
                // 閉じるときに高さをリセット
                panel.style.maxHeight = '0px';
            }
            return;
        }

        // 湧き潰しトグル (Bモブのロジック変更なし)
        const cullBtn = e.target.closest('.cull-toggle-btn');
        if (cullBtn) {
            // 既存の湧き潰しロジック呼び出し
            updateCullStatus(parseInt(cullBtn.dataset.mobNo), cullBtn.dataset.cullState === 'false');
            return;
        }

        // モーダル報告ボタン (S/F/Bランク)
        const modalReportBtn = e.target.closest('.report-modal-btn');
        if (modalReportBtn) {
            openReportModal(parseInt(modalReportBtn.dataset.mobNo));
            return;
        }

        // NEW: ワンクリック報告ボタン (Aランク)
        const oneClickReportBtn = e.target.closest('.report-one-click-btn');
        if (oneClickReportBtn) {
            oneClickReport(parseInt(oneClickReportBtn.dataset.mobNo));
            return;
        }
    });
}

/**
 * 湧き潰し状態をGASに送信し、リストを更新する
 * (Bモブに関するロジック変更は行わない)
 */
async function updateCullStatus(mobNo, newStatus) {
    if (!mobNo || typeof newStatus !== 'boolean') return;
    
    // UIを即時更新 (楽観的更新)
    const mob = globalMobData.find(m => m['No.'] === mobNo);
    if (mob) mob.isCulled = newStatus;
    filterAndRender();

    try {
        const payload = {
            action: 'updateCullStatus',
            userId: userId,
            mobNo: mobNo,
            status: newStatus
        };

        await fetch(GAS_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        // サーバー側で成功した場合、特に何もしない

    } catch (e) {
        console.error('Cull status update error:', e);
        displayError('湧き潰し状態の更新に失敗しました。');
        
        // 失敗した場合はUIを元に戻す (悲観的更新)
        const mob = globalMobData.find(m => m['No.'] === mobNo);
        if (mob) mob.isCulled = !newStatus;
        filterAndRender();
        setTimeout(() => displayError(''), 5000);
    }
}


// --- 初期化 ---

/**
 * アプリケーションの初期化
 */
async function initializeApp() {
    // ユーザーIDの生成/取得
    userId = localStorage.getItem('huntUserId');
    if (!userId) {
        userId = crypto.randomUUID();
        localStorage.setItem('huntUserId', userId);
    }
    uuidDisplayEl.textContent = `ID: ${userId}`;
    uuidDisplayEl.classList.remove('hidden');

    // フィルター状態のロード
    loadFilterState();

    // UI要素の調整 (ヘッダーの高さに基づくスペーサー)
    const setSpacerHeight = () => {
        contentSpacer.style.paddingTop = fixedHeaderContent.offsetHeight + 16 + 'px'; // 16pxはバッファ
    };
    window.addEventListener('resize', setSpacerHeight);
    setSpacerHeight();

    // イベントリスナーの設定
    attachEventListeners();
    
    // ソートボタンの初期アクティブ状態を反映
    updateActiveFilterUI();

    // モブデータのロードを開始
    await fetchBaseMobData();
}

// アプリケーション起動
window.onload = initializeApp;
