// Google Apps Script (GAS) のエンドポイントURL
// ユーザーから提供された正確なURLを設定 (大文字小文字を区別)
const GAS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbwxgb5APRPyTwEM3ZQtgG3WWdxrFqVZAgkvq4Qfh_FggBU2p21yYDkWIdp-jMfBtG92Gg/exec';
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
 * 例: 3661000ms -> "01h 01m"
 * (秒は含まない)
 * @param {number} ms - ミリ秒
 * @param {string} prefix - 接頭辞 ('+' for Max Overdue)
 * @returns {string} - フォーマットされた時間文字列 (秒は含まない)
 */
function formatDurationPart(ms, prefix = '') {
    // 秒を切り捨てて分単位で計算
    const totalMinutes = Math.floor(ms / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    
    // ご要望の「hの後の少しの余白」をここに追加: "03h 01m"
    return `${prefix}${formattedHours}h ${formattedMinutes}m`;
}


/**
 * Dateオブジェクトを「MM/DD HH:MM」形式の文字列にフォーマットする
 * @param {Date} date - フォーマットするDateオブジェクト
 * @returns {string} - フォーマットされた日付文字列
 */
function formatDateTime(date) {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
        return 'N/A';
    }
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${month}/${day} ${hours}:${minutes}`;
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
 * @param {string|null} message - 表示するエラーメッセージ、または null で非表示。
 */
function displayError(message) {
    if (!errorMessageContainer) return;
    
    const baseClasses = ['p-2', 'text-sm', 'font-semibold', 'text-center'];
    // ローディング/エラー時に使用する赤帯のクラス
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
        // メッセージがnullの場合、コンテナを非表示にする
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
    const repopMaxMs = mob['MAX(s)'] * 1000; // Max Repop Duration from Kill
    const popDurationMs = repopMaxMs - repopMinMs; // Duration of the POP Window

    let minRepopTime;
    let maxRepopTime;
    let timeRemainingStr; // 次回POPまでの残り時間、またはPOPウィンドウ内の残り時間、または超過時間
    let elapsedPercent = 0; // POPウィンドウ内の経過率 (0% to 100%)
    let isPop = false; // Min Repop Timeに到達したか
    let isMaxOver = false; // Max Repop Timeを超過したか

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
        // データがない場合、現在時刻からMinリポップを仮計算
        minRepopTime = new Date(now.getTime() + repopMinMs); 
        timeRemainingStr = 'データなし';
        isPop = false; 
        elapsedPercent = 0; // バー非表示のため0
    } else {
        minRepopTime = new Date(killTime.getTime() + repopMinMs);
        maxRepopTime = new Date(killTime.getTime() + repopMaxMs);

        const remainingMsToMin = minRepopTime.getTime() - now.getTime();
        
        if (remainingMsToMin > 0) {
            // --- Phase 1: Pre-Min Repop (Min POPまでのカウントダウン) ---
            isPop = false; 
            
            // NEW: ミリ秒から HHh MMm 形式に変換 (秒は含まない)
            timeRemainingStr = formatDurationPart(remainingMsToMin);
            elapsedPercent = 0; // バー非表示のため0%
            
        } else {
            // --- Phase 2 & 3: In or After POP Window ---
            isPop = true;
            
            const remainingMsToMax = maxRepopTime.getTime() - now.getTime();
            
            if (remainingMsToMax > 0) {
                // --- Phase 2: In POP Window (Max POPまでの残り時間) ---
                isMaxOver = false;
                
                const elapsedInWindowMs = now.getTime() - minRepopTime.getTime();
                
                // POPウィンドウ内の経過率 (0% to 100%)
                elapsedPercent = Math.max(0, Math.min(100, (elapsedInWindowMs / popDurationMs) * 100));

                // NEW: ミリ秒から HHh MMm 形式に変換 (Max POPまでの残り時間)
                timeRemainingStr = formatDurationPart(remainingMsToMax);
                
            } else {
                // --- Phase 3: Max Repop Exceeded (最大超過) ---
                isMaxOver = true;
                
                const popElapsedMs = now.getTime() - maxRepopTime.getTime();
                
                // NEW: ミリ秒から HHh MMm 形式に変換し、接頭辞を追加
                const formattedElapsed = formatDurationPart(popElapsedMs, '+');
                
                // timeRemainingには超過時間が入る
                timeRemainingStr = formattedElapsed; 
                elapsedPercent = 100; // フルバー表示
            }
        }
    }

    return {
        minRepop: minRepopTime, // POP開始予定時刻 (常に絶対時間)
        maxRepop: maxRepopTime, // POP終了予定時刻 (常に絶対時間)
        timeRemaining: timeRemainingStr, // Phase 1: Min POPまでの残り時間, Phase 2: Max POPまでの残り時間, Phase 3: 超過時間(+HHh MMm)
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
    // MobNoは5桁のIDに対応するため、数値として比較
    return globalMobData.find(mob => mob['No.'] === parseInt(mobNo));
}

/**
 * Dateオブジェクトを「MM/DD HH:MM」形式の文字列にフォーマットする
 * @param {Date} date - フォーマットするDateオブジェクト
 * @returns {string} - フォーマットされた日付文字列
 */
function formatDateTime(date) {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
        return 'N/A';
    }
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${month}/${day} ${hours}:${minutes}`;
}


// --- DOM操作/イベントハンドラ ---

/**
 * モブデータに基づいてHTMLカードを生成する
 */
function createMobCard(mob) {
    const lastKillDate = mob.LastKillDate ? new Date(mob.LastKillDate) : null;
    const { minRepop, timeRemaining, elapsedPercent, isPop, isMaxOver, isUnknown } = calculateRepop(mob, lastKillDate);

    // 次回POPの初期色をご要望の青色に設定
    const minPopColorClass = 'text-blue-400 font-mono'; 
    
    let minPopStr;
    if (minRepop instanceof Date) {
        // formatDateTime関数を使用して「MM/DD HH:MM」形式にする
        minPopStr = formatDateTime(minRepop);
    } else {
        minPopStr = 'N/A';
    }

    // 「残り (%)」の時間部分のフォントを「次回POP」と同じにする
    // 修正1: POP到達時の文字色は、最大超過以外は黒 (text-gray-900) にする
    // 修正1: 文字サイズを 'text-lg' に上げる
    const remainingTimeClass = 'font-mono text-lg'; 

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

    // 討伐報告ボタンの機能と状態の分離。常に報告可能にする。
    const reportBtnClass = 'bg-green-600 hover:bg-green-500 active:bg-green-700 report-btn'; // 常に有効な青緑
    const reportBtnContent = `<span class="text-xs font-bold">報告</span><span class="text-xs font-bold">する</span>`;

    const reportBtnHtml = `
        <button class="${reportBtnClass} text-white px-1 py-1 rounded-md shadow-md transition h-10 w-10 flex flex-col items-center justify-center leading-none" 
                data-mobno="${mob['No.']}">
            ${reportBtnContent}
        </button>
    `;
    
    // --- 修正2: 展開パネル内の表示調整 ---
    const labelColorClass = 'text-gray-400'; // ラベル色を統一
    const valueColorClass = 'text-gray-200'; // 値の色を統一
    
    // POP開始時刻表示エリア (展開パネル内)
    const popStartTimeStr = minRepop instanceof Date ? formatDateTime(minRepop) : 'N/A';
    const popStartTimeHtml = `
        <div class="px-4 pt-2 pb-2 pop-start-time-display hidden text-right">
            <p class="text-sm font-semibold ${labelColorClass}">開始時間: <span class="text-base ${valueColorClass} font-mono pop-start-time-value">${popStartTimeStr}</span></p>
        </div>
    `;

    // 前回討伐
    let lastKillHtml = '';
    if (lastKillDate && !isNaN(lastKillDate.getTime())) {
        const lastKillStr = formatDateTime(lastKillDate);
        lastKillHtml = `
            <div class="px-4 pt-2 pb-4 last-kill-content text-right">
                <p class="text-sm font-semibold ${labelColorClass}">前回討伐: <span class="text-base ${valueColorClass} font-mono">${lastKillStr}</span></p>
            </div>
        `;
    }

    // 抽選条件
    let conditionHtml = '';
    if (mob.Condition) {
        const conditionBottomPadding = mob.Map ? 'pb-1' : 'pb-4';
        
        conditionHtml = `
            <div class="px-4 pt-1 ${conditionBottomPadding} condition-content">
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
                    <img src="./maps/${mob.Map}" alt="${mob.Area} Map" class="w-full h-auto rounded-lg shadow-md map-image" data-area="${mob.Area}" onerror="this.onerror=null; this.src='https://placehold.co/800x400/334155/f8fafc?text=${mob.Area}+Map+Placeholder';">
                    <div class="absolute inset-0 map-overlay" data-area="${mob.Area}">
                        </div>
                </div>
            </div>
        `;
    }
    
    // Sモブに関しては、抽選条件 -> POP開始時間 -> 前回討伐 -> マップ の順序
    let panelContent = '';
    if (mob.Rank === 'S') {
        panelContent = conditionHtml + popStartTimeHtml + lastKillHtml + mapDetailsHtml;
    } else {
        // A, B, FATEは POP開始時間 -> 前回討伐 -> 抽選条件/マップ の順序
        panelContent = popStartTimeHtml + lastKillHtml + conditionHtml + mapDetailsHtml;
    }
    
    let expandablePanel = '';
    if (panelContent.trim()) {
        expandablePanel = `
            <div class="expandable-panel overflow-hidden transition-all duration-300 ease-in-out max-h-0">
                ${panelContent}
            </div>
        `;
    }

    // Min POP未到達時は 'hidden' クラスを付与して「残り (%)」の行を非表示にする
    const remainingTimeContainerClass = !isPop || isUnknown ? 'hidden' : '';


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

                <div class="mt-2 bg-gray-700 p-2 rounded-xl text-xs flex flex-col space-y-1 relative overflow-hidden shadow-inner">
                    <div class="flex justify-between items-baseline relative z-10 repop-time-container">
                        <span class="text-gray-300 w-24 flex-shrink-0 text-base">次回POP:</span>
                        <span class="repop-time text-base ${minPopColorClass} font-bold font-mono">${minPopStr}</span>
                    </div>
                    
                    <div class="progress-container ${remainingTimeContainerClass} flex justify-between relative z-10">
                        <span class="text-gray-300 w-24 flex-shrink-0 text-base">残り (%):</span> 
                        <span class="${remainingTimeClass} time-remaining">${timeRemaining} (${elapsedPercent.toFixed(1)}%)</span>
                    </div>

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
    updateProgressBars(); // 初回レンダリング時にも進捗バーを更新
}

/**
 * MobNoからモブデータを取得する (変更なし)
 */
function getMobByNo(mobNo) {
    // MobNoは5桁のIDに対応するため、数値として比較
    return globalMobData.find(mob => mob['No.'] === parseInt(mobNo));
}

/**
 * イベントリスナーをカードとボタンにアタッチする (変更なし)
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
 * マップ詳細パネルの表示/非表示を切り替える (変更なし)
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
            drawSpawnPoints(mapOverlay, mob.spawn_points, mobNo);
        }
        
        // 2. 瞬時に max-height を解除し、コンテンツの最終的な高さを取得
        panel.style.maxHeight = 'none'; 
        const targetHeight = panel.scrollHeight; 

        // 3. max-heightを 0 に設定し、アニメーションの開始点に戻す
        panel.style.maxHeight = '0';
        
        // 4. 取得した高さに安全マージンを加えてアニメーションを開始
        setTimeout(() => {
            // 安全マージンを追加 (例えば20px)
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
 * マップにスポーンポイントを描画する (サイズとUXを修正)
 */
function drawSpawnPoints(overlayEl, spawnPoints, currentMobNo) {
    overlayEl.innerHTML = '';
    const mob = getMobByNo(parseInt(currentMobNo));
    
    if (!mob || !mob.cullStatusMap) return;

    // --- NEW/UPDATED: ポイントの基本スタイル設定 ---
    // ▼ サイズを修正
    const POINT_DIAMETER_SA_INNER = '8px';  // S/A地点の内円
    const POINT_DIAMETER_SA_OUTER = '12px'; // S/A地点の外円（コンテナ）
    const POINT_DIAMETER_B_ONLY = '10px';   // B1/B2のみの地点
    const POINT_BORDER_WIDTH = '2px';
    
    const B1_INTERNAL_COLOR = '#60a5fa'; // Blue-400
    const B2_INTERNAL_COLOR = '#f87171'; // Red-400
    // ------------------------------------

    // S/A抽選に関わるポイントをフィルタリング
    const cullTargetPoints = spawnPoints.filter(point => 
        point.mob_ranks.includes('S') || point.mob_ranks.includes('A')
    );
    
    // 未処理のS/A抽選ポイントの数をカウント (グローバル状態に依存)
    let remainingCullCount = 0;
    cullTargetPoints.forEach(point => {
        const isCulled = mob.cullStatusMap[point.id] || false;
        if (!isCulled) {
            remainingCullCount++;
        }
    });

    spawnPoints.forEach(point => {
        const isS_A_Point = point.mob_ranks.includes('S') || point.mob_ranks.includes('A');
        const includesB1 = point.mob_ranks.includes('B1');
        const includesB2 = point.mob_ranks.includes('B2');

        const isCullTarget = isS_A_Point; 

        // Bランク専用ポイントは強調表示なし (単一円 10px)
        if (!isCullTarget) {
            if (point.mob_ranks.length === 1 && (includesB1 || includesB2)) {
                
                // --- Bランク専用ポイントの描画 ---
                const pointEl = document.createElement('div');
                pointEl.className = 'spawn-point-b-only select-none'; // select-noneを追加
                pointEl.style.left = `${point.x}%`;
                pointEl.style.top = `${point.y}%`;
                pointEl.style.transform = 'translate(-50%, -50%)';
                
                // 修正後のサイズ: 10px
                pointEl.style.width = POINT_DIAMETER_B_ONLY;
                pointEl.style.height = POINT_DIAMETER_B_ONLY;
                pointEl.style.borderRadius = '50%';
                pointEl.style.position = 'absolute';
                pointEl.style.zIndex = '1';
                
                pointEl.style.backgroundColor = includesB1 ? B1_INTERNAL_COLOR : B2_INTERNAL_COLOR; 
                pointEl.style.border = 'none';
                pointEl.style.boxShadow = '0 0 4px rgba(0, 0, 0, 0.5)';
                // ▼ カーソルと点滅防止のスタイルを追加
                pointEl.style.cursor = 'pointer';
                pointEl.style.userSelect = 'none';

                pointEl.onclick = (e) => {
                    e.stopPropagation(); 
                    // Bランク専用ポイントもクリックで湧き潰し状態をトグルする想定
                    // (S/Aポイントではないため、通常はトグルしないが、ここではクリック防止のため関数を割り当てる)
                };

                overlayEl.appendChild(pointEl);
            }
            return;
        }

        // --- S/A抽選対象ポイントの描画ロジック (二重円) ---
        
        const isCulled = mob.cullStatusMap[point.id] || false;
        
        let outlineColor = '#9ca3af'; // Gray-400 (外円/輪郭)
        let internalColor = '#d1d5db'; // Gray-300 (内円)

        // B1/B2の色分け (抽選対象として)
        if (includesB1) {
            outlineColor = '#3b82f6'; // Blue-500
            internalColor = '#60a5fa'; // Blue-400
        } else if (includesB2) {
            outlineColor = '#ef4444'; // Red-500
            internalColor = '#f87171'; // Red-400
        }
        
        // 最後の1点判定
        const isLastPoint = !isCulled && remainingCullCount === 1;

        if (isLastPoint) {
            // 最後の1点: エメラルドグリーン
            outlineColor = '#10b981'; // Emerald-500
            internalColor = '#34d399'; // Emerald-400
        }

        // 要素作成 (外円コンテナ: 12px)
        const pointEl = document.createElement('div');
        // select-noneを追加
        pointEl.className = `spawn-point hover:scale-150 transition-transform duration-100 cursor-pointer flex items-center justify-center select-none`; 
        pointEl.setAttribute('data-id', point.id);
        pointEl.setAttribute('data-isculltarget', 'true');

        pointEl.style.left = `${point.x}%`;
        pointEl.style.top = `${point.y}%`;
        pointEl.style.transform = 'translate(-50%, -50%)';
        pointEl.style.boxShadow = 'none';
        
        // S/A地点の外円サイズを適用: 12px
        pointEl.style.width = POINT_DIAMETER_SA_OUTER; 
        pointEl.style.height = POINT_DIAMETER_SA_OUTER;
        pointEl.style.borderRadius = '50%';
        pointEl.style.position = 'absolute';
        pointEl.style.zIndex = '10'; 

        // ▼ カーソルと点滅防止のスタイルを追加
        pointEl.style.cursor = 'pointer';
        pointEl.style.userSelect = 'none';

        // 輪郭 (外円) の設定
        pointEl.style.border = `${POINT_BORDER_WIDTH} solid ${outlineColor}`;
        pointEl.style.backgroundColor = 'transparent'; // 外円内部は透明

        // 内円の作成と追加 (内円: 8px)
        const innerCircle = document.createElement('div');
        innerCircle.style.width = POINT_DIAMETER_SA_INNER;
        innerCircle.style.height = POINT_DIAMETER_SA_INNER;
        innerCircle.style.borderRadius = '50%';
        innerCircle.style.backgroundColor = internalColor;
        pointEl.appendChild(innerCircle);
        
        // S/A抽選対象ポイントに影を追加 (湧き潰し済みでない場合のみ)
        if (!isCulled && isCullTarget) {
            pointEl.style.boxShadow = `0 0 8px 1px ${outlineColor}`; 
        }

        // 湧き潰し済みの表示
        if (isCulled) {
            pointEl.classList.add('culled');
            pointEl.style.border = `${POINT_BORDER_WIDTH} solid white`; 
            innerCircle.style.backgroundColor = 'rgba(100, 100, 100, 0.5)'; // グレーアウト
            pointEl.style.opacity = '0.7';
            pointEl.classList.remove('hover:scale-150'); 
            pointEl.style.boxShadow = 'none'; 
        }

        // クリックイベント
        pointEl.onclick = (e) => {
            e.stopPropagation(); 
            toggleCullStatus(mob['No.'], point.id, !isCulled);
        };
        
        overlayEl.appendChild(pointEl);
    });
}


/**
 * 湧き潰し状態をGAS経由で切り替える (変更なし)
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
            
            // 修正: 討伐報告は手動操作なので 'manual' フラグを付けて更新
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

/**
 * 外部JSONからモブデータを取得する (変更なし)
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
 * GASから最新の討伐記録と湧き潰し状態を取得し、グローバルデータを更新する (変更なし)
 * @param {string} updateType - 'initial', 'manual', 'auto'
 * @param {boolean} shouldFetchBase - 基本モブデータを取得するか
 */
async function fetchRecordsAndUpdate(updateType = 'initial', shouldFetchBase = true) {
    
    // ----------------------------------------------------
    // 1. 基本データ (Base Mob Data) のロード
    // ----------------------------------------------------
    if (shouldFetchBase) {
        // 初回ロード時は常に表示
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
    
    // ----------------------------------------------------
    // 2. ローディングメッセージ表示制御
    // ----------------------------------------------------
    let shouldDisplayLoading = false;
    
    if (updateType === 'initial' || updateType === 'manual') {
        // 初回起動時、手動更新時は必ず表示
        shouldDisplayLoading = true;
    } else if (updateType === 'auto') {
        // 自動更新の場合、成功回数が0回（初回自動更新）の場合のみ表示
        if (autoUpdateSuccessCount === 0) {
            shouldDisplayLoading = true;
        }
        // 2回目以降は false のまま（非表示）
    }

    if (shouldDisplayLoading) {
        displayError(`討伐記録と湧き潰し状態を更新中...`);
    } 

    // ----------------------------------------------------
    // 3. 討伐記録と湧き潰し状態の取得と更新
    // ----------------------------------------------------
    try {
        const response = await fetch(GAS_ENDPOINT + '?action=getRecords');
        const data = await response.json();
        
        if (data.status === 'success') {
            
            // Success: Clear the error/loading display
            displayError(null); 
            
            const records = data.records;
            const cullStatuses = data.cullStatuses || []; 
            
            // データをマージして globalMobData を再構築
            globalMobData = baseMobData.map(mob => {
                const mobNo = mob['No.']; 
                const record = records.find(r => r['No.'] === mobNo);
                const newMob = { ...mob }; 
                
                // 討伐記録の反映 (POP_Date_Unixは秒単位で返される)
                if (record && record.POP_Date_Unix) {
                    newMob.LastKillDate = unixTimeToDate(record.POP_Date_Unix); // Dateオブジェクトのまま保持
                } else {
                    newMob.LastKillDate = ''; 
                }
                
                // NEW: 湧き潰し状態を mob データに紐づける
                newMob.cullStatusMap = {};
                cullStatuses
                    .filter(status => status.Mob_No === mobNo) 
                    .forEach(status => {
                        newMob.cullStatusMap[status.Point_ID] = status.Is_Culled === 'TRUE';
                    });

                return newMob;
            });
            console.log('Kill and cull statuses merged successfully.');

            // Success: Increment count if auto update
            if (updateType === 'auto') {
                autoUpdateSuccessCount++;
            }
            
            renderMobList(currentFilter);
        } else {
            // Failure: Always display the error message
            const errorMessage = `エラー: 共有データの取得に失敗しました。 (${data.message})`;
            console.error('GASからのデータ取得失敗:', errorMessage);
            displayError(errorMessage);
        }
    } catch (error) {
        // Failure: Always display the communication error
        const errorMessage = `エラー: サーバーとの通信に失敗しました。`;
        console.error('GAS通信エラー:', error);
        displayError(errorMessage);
    }
}

/**
 * 各モブカードの進捗バーを更新する (1秒ごと)
 */
function updateProgressBars() {
    // ------------------------------------------------------------------
    // 進捗バーの色定義 (変更なし)
    // ------------------------------------------------------------------
    // 次回POP時刻の色 (暗いコーンフラワー ブルー1 相当)
    const TEXT_POP_TIME_COLOR_CLASS = 'text-blue-400'; 
    
    // 進捗バーの色
    const COLOR_GREEN_3 = 'bg-lime-500'; 
    const COLOR_YELLOW_3 = 'bg-yellow-400'; 
    const COLOR_ORANGE_3 = 'bg-orange-400'; 
    // 最大超過時のリポップ時刻の色 (オレンジのテキスト)
    const MAX_OVER_TEXT_COLOR_CLASS = COLOR_ORANGE_3.replace('bg-', 'text-'); 
    
    // 修正: モバイルで視認性を上げるため、暗い背景に映える明るい赤(text-red-400)に変更します
    const OVERDUE_DURATION_COLOR_CLASS = 'text-red-400'; 
    
    // 修正1: POP到達時の残り時間/割合の文字色 (黒色)
    const IN_POP_TEXT_COLOR_CLASS = 'text-gray-900'; 
    // ------------------------------------------------------------------
    
    document.querySelectorAll('.mob-card').forEach(card => {
        const lastKillStr = card.dataset.lastkill;
        const repop = parseInt(card.dataset.minrepop);
        const max = parseInt(card.dataset.maxrepop);
        
        // Dateオブジェクトとして取得
        const lastKillDate = globalMobData.find(mob => mob['No.'] === parseInt(card.dataset.mobno)).LastKillDate;
        
        const mobStub = {"REPOP(s)": repop, "MAX(s)": max};
        const repopData = calculateRepop(mobStub, lastKillDate);
        const percent = repopData.elapsedPercent || 0; 

        // テキスト要素とコンテナの取得
        const repopTimeContainerEl = card.querySelector('.repop-time-container');
        const repopTimeEl = card.querySelector('.repop-time');
        const timeRemainingEl = card.querySelector('.time-remaining'); 
        const progressContainer = card.querySelector('.progress-container');
        const progressBarEl = card.querySelector('.progress-bar');
        
        // NEW: 展開パネル内の要素
        const popStartTimeDisplayEl = card.querySelector('.pop-start-time-display');
        const popStartTimeValueEl = card.querySelector('.pop-start-time-value');
        const lastKillContentEl = card.querySelector('.last-kill-content');

        // --- 1. POPウィンドウ到達/超過判定とコンテナ表示切り替え ---
        if (repopData.isPop) {
            // POP中: 「残り (%)」コンテナを表示し、プログレスバー内の「次回POP」コンテナを非表示
            progressContainer?.classList.remove('hidden');
            repopTimeContainerEl?.classList.add('hidden'); 
            popStartTimeDisplayEl?.classList.remove('hidden'); // NEW: 展開パネル内の開始時間を表示
            
        } else {
            // Min POP未到達: 「残り (%)」コンテナを非表示にし、プログレスバー内の「次回POP」コンテナを表示
            progressContainer?.classList.add('hidden');
            repopTimeContainerEl?.classList.remove('hidden'); 
            popStartTimeDisplayEl?.classList.add('hidden'); // NEW: 展開パネル内の開始時間を非表示
        }


        // --- 2. リポップ予測時刻の更新 (repopTimeEl / popStartTimeValueEl) ---
        let displayTimeStr;
        if (repopData.isUnknown) {
             displayTimeStr = 'N/A';
        } else {
             // Min Repop Time（予測POP開始時刻）を常に取得
             displayTimeStr = repopData.minRepop instanceof Date ? formatDateTime(repopData.minRepop) : 'N/A';
        }

        // a) 進捗バー内の「次回POP」を更新 (POP未達時のみ表示)
        if (repopTimeEl) {
            // 時刻は常に Min Repop Timeの絶対時刻を表示 (MM/DD HH:MM形式)
            repopTimeEl.textContent = displayTimeStr; 
            
            // POP未達時は青色を維持
            repopTimeEl.classList.remove(MAX_OVER_TEXT_COLOR_CLASS); 
            repopTimeEl.classList.add(TEXT_POP_TIME_COLOR_CLASS, 'font-bold'); 
        }
        
        // b) 展開パネル内の「開始時間:」を更新 (POP達時のみ表示)
        if (popStartTimeValueEl) {
            // MM/DD HH:MM形式
            const timeOnly = repopData.minRepop instanceof Date ? formatDateTime(repopData.minRepop) : 'N/A';
            popStartTimeValueEl.textContent = timeOnly;
        }

        // c) 展開パネル内の「前回討伐:」を更新 (LastKillDateがDateオブジェクトのため再取得)
        if (lastKillContentEl) {
            const lastKillMob = globalMobData.find(mob => mob['No.'] === parseInt(card.dataset.mobno));
            if (lastKillMob && lastKillMob.LastKillDate && !isNaN(lastKillMob.LastKillDate.getTime())) {
                const lastKillStr = formatDateTime(lastKillMob.LastKillDate);
                // 既に createMobCard で設定された HTML を使っているので、ここでは再生成のみ行う
                const lastKillValueEl = lastKillContentEl.querySelector('span.font-mono');
                if(lastKillValueEl) {
                    lastKillValueEl.textContent = lastKillStr;
                }
            }
        }
        
        // --- 3. 残り時間（進捗率）の更新 (timeRemainingEl) ---
        if (repopData.isPop && timeRemainingEl) {
            
            // 既存の色クラスを削除
            timeRemainingEl.classList.remove(IN_POP_TEXT_COLOR_CLASS, OVERDUE_DURATION_COLOR_CLASS);
            
            if (repopData.isMaxOver) {
                // 最大超過: 経過時間（+HHh MMm）を「残り (%)」の欄に表示し、「最大超過」と追記
                timeRemainingEl.textContent = `${repopData.timeRemaining} (最大超過)`; 
                // 修正: 明るい赤色クラスを適用
                timeRemainingEl.classList.add(OVERDUE_DURATION_COLOR_CLASS); 
            } else {
                // 通常の In-Pop 表示 (HHh MMm (P.P%)) は黒色
                timeRemainingEl.textContent = `${repopData.timeRemaining} (${percent.toFixed(1)}%)`;
                timeRemainingEl.classList.add(IN_POP_TEXT_COLOR_CLASS); 
            }
        }
        
        // --- 4. プログレスバーの更新ロジック (変更なし) ---
        if (progressBarEl) {
            
            let barColorClass = '';
            let widthPercent = Math.min(100, percent); 

            if (!repopData.isPop || repopData.isUnknown) {
                // Min POP未到達時やデータ不明時はバーを非表示 (幅0%)
                widthPercent = 0;
                progressBarEl.classList.remove('animate-pulse');
            } else if (repopData.isMaxOver) {
                // 最大超過: 100%幅で明るいオレンジに点滅 (バーの色は変えない)
                barColorClass = COLOR_ORANGE_3; 
                widthPercent = 100;
                progressBarEl.classList.add('animate-pulse');
            } else if (percent >= 80) {
                // 80% ～ 100%未満: 明るいオレンジ 3
                barColorClass = COLOR_ORANGE_3; 
                progressBarEl.classList.remove('animate-pulse');
            } else if (percent >= 60) {
                // 60% ～ 80%未満: 明るい黄 3
                barColorClass = COLOR_YELLOW_3; 
                progressBarEl.classList.remove('animate-pulse');
            } else {
                // 0% ～ 60%未満: 明るい緑 3
                barColorClass = COLOR_GREEN_3; 
                progressBarEl.classList.remove('animate-pulse');
            }
            
            // クラスの付け替えと幅の更新
            progressBarEl.className = `progress-bar absolute inset-0 transition-all duration-100 ease-linear ${barColorClass} rounded-xl`;
            progressBarEl.style.width = `${widthPercent}%`;
        }

        // --- 5. 討伐報告ボタンの状態を更新 (機能を削除し、常に有効) ---
        const reportBtn = card.querySelector('button[data-mobno]');
        if (reportBtn) {
            // 常に報告可能にする
            reportBtn.disabled = false;
            reportBtn.classList.remove('bg-gray-500', 'cursor-not-allowed'); // 無効化関連クラスを削除
            reportBtn.classList.add('bg-green-600', 'hover:bg-green-500', 'active:bg-green-700'); 
            reportBtn.innerHTML = `<span class="text-xs font-bold">報告</span><span class="text-xs font-bold">する</span>`;
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
            // 修正: 手動操作なので 'manual' フラグを付けて更新 (手動更新ロジックの再利用)
            button.onclick = (e) => {
                renderMobList(e.currentTarget.dataset.rank);
                // フィルタリングはローカルで行うため、ここでは通信更新は不要
            }
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

    // 初期ロード: 'initial' タイプで実行 (通信帯を表示)
    fetchRecordsAndUpdate('initial', true);

    // 討伐記録の定期更新 (10分ごと)
    // 'auto' タイプで実行 (2回目以降は通信帯を非表示)
    setInterval(() => fetchRecordsAndUpdate('auto', false), 10 * 60 * 1000);

    // プログレスバーの定期更新を 1秒ごと に変更
    setInterval(updateProgressBars, 1000);
}

document.addEventListener('DOMContentLoaded', initializeApp);
