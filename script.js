// Google Apps Script (GAS) のエンドポイントURL
// ユーザーから提供された正確なURLを設定 (大文字小文字を区別)
const GAS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbyuTg_uO7ZnxPGz1eun3kUKjni5oLj-UpfH4g1N0wQmzB57KhBWFnAvcSQYlbNcUelT3g/exec';
// 静的モブデータ (mob_data.json) のURL (同階層のファイルを参照)
const MOB_DATA_URL = './mob_data.json';


// --- グローバル変数 ---
let baseMobData = [];
let globalMobData = [];
// rank と area のフィルタリング状態を保持
let currentFilter = {
    rank: 'ALL', // 初期表示はALLランク
    // NEW: 選択された拡張パック名を保持するSet (複数選択可能)
    areas: new Set(['ALL']) 
};
let currentMobNo = null;
let userId = null;
// NEW: 自動更新が成功した回数を追跡するためのカウンター
let autoUpdateSuccessCount = 0;

// --- DOMエレメント ---
const appEl = document.getElementById('app');
// エラーメッセージコンテナの取得 (index.htmlで位置変更済み)
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
const uuidDisplayEl = document.getElementById('uuid-display'); 

// NEW: エリアフィルタ関連のDOM要素
const areaFilterContainer = document.getElementById('area-filter-container');


// --- 定数: 拡張パック名定義 ---
const EXPANSION_MAP = {
    1: '新生',
    2: '蒼天',
    3: '紅蓮',
    4: '漆黒',
    5: '暁月',
    6: '黄金'
};


// --- ユーティリティ関数 ---

/**
 * UNIX秒 (サーバー時間) を Dateオブジェクトに変換する
 */
function unixTimeToDate(unixtime) {
    return new Date(unixtime * 1000); 
}

/**
 * 日付オブジェクトを MM/DD HH:MM 形式にフォーマットする
 * @param {Date | string | null} dateInput - 日付オブジェクトまたは文字列
 * @returns {string} - フォーマットされた文字列または 'N/A'
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
    const loadingClasses = ['bg-blue-800', 'text-blue-100', 'rounded-lg']; // ロード中は青色に変更
    
    if (message) {
        errorMessageContainer.classList.remove('hidden');
        
        // メッセージの内容に応じて色を変更 ('更新中', 'ロード中'なら青、それ以外は赤)
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
    const repopMaxMs = mob['MAX(s)'] * 1000; // Max Repop Duration from Kill
    const popDurationMs = repopMaxMs - repopMinMs; // Duration of the POP Window

    let minRepopTime;
    let maxRepopTime;
    let timeRemainingStr; // Next POP (MM/DD HH:MM) または Remaining (00h 00m (00.0%))
    let elapsedPercent = 0; // POPウィンドウ内の経過率 (0% to 100%)
    let isPop = false; // Min Repop Timeに到達したか
    let isMaxOver = false; // Max Repop Timeを超過したか

    if (repopMinMs <= 0 || repopMaxMs <= repopMinMs) {
        return {
            minRepop: 'N/A', 
            maxRepop: 'N/A',
            timeDisplay: 'N/A', // 1行表示用のテキスト
            isPop: false,
            isMaxOver: false,
            isUnknown: true,
            elapsedPercent: 0,
        };
    }
    
    const now = new Date();

    if (isUnknown) {
        minRepopTime = new Date(now.getTime() + repopMinMs); 
        // 変更: データ不明時はNext: (推定Min POP時刻)
        timeRemainingStr = `Next: ${formatDateForDisplay(minRepopTime)}`; 
        isPop = false; 
        elapsedPercent = 0;
    } else {
        minRepopTime = new Date(killTime.getTime() + repopMinMs);
        maxRepopTime = new Date(killTime.getTime() + repopMaxMs);

        const remainingMsToMin = minRepopTime.getTime() - now.getTime();
        
        if (remainingMsToMin > 0) {
            // --- Phase 1: Pre-Min Repop (Countdown Phase, 1行 Next: Min POP時刻) ---
            isPop = false; 
            timeRemainingStr = `Next: ${formatDateForDisplay(minRepopTime)}`;
            elapsedPercent = 0; 
            
        } else {
            // --- Phase 2 & 3: In or After POP Window (1行 残り (%): 時間 (%)) ---
            isPop = true;
            
            const remainingMsToMax = maxRepopTime.getTime() - now.getTime();
            
            if (remainingMsToMax > 0) {
                // --- Phase 2: In POP Window ---
                isMaxOver = false;
                
                const elapsedInWindowMs = now.getTime() - minRepopTime.getTime();
                
                // POPウィンドウ内の経過率 (0% to 100%)
                elapsedPercent = Math.max(0, Math.min(100, (elapsedInWindowMs / popDurationMs) * 100));

                // 変更: 残り (%) の形式
                const duration = formatDurationPart(remainingMsToMax);
                timeRemainingStr = `残り (%): ${duration} (${elapsedPercent.toFixed(1)}%)`;
                
            } else {
                // --- Phase 3: Max Repop Exceeded (Max Over/Overdue) ---
                isMaxOver = true;
                
                const popElapsedMs = now.getTime() - maxRepopTime.getTime();
                
                // 変更: 残り (%) の形式 (+超過時間 (100.0%))
                const formattedElapsed = formatDurationPart(popElapsedMs, '+');
                timeRemainingStr = `残り (%): ${formattedElapsed} (100.0%)`; 
                elapsedPercent = 100;
            }
        }
    }

    return {
        minRepop: minRepopTime,
        maxRepop: maxRepopTime, 
        timeDisplay: timeRemainingStr, // 1行表示用の文字列
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

// --- DOM操作/イベントハンドラ ---

/**
 * モブデータに基づいてHTMLカードを生成する
 */
function createMobCard(mob) {
    const lastKillDate = mob.LastKillDate ? new Date(mob.LastKillDate) : null;
    const { minRepop, maxRepop, timeDisplay, elapsedPercent, isPop, isMaxOver, isUnknown } = calculateRepop(mob, lastKillDate);

    // NEW: Min POP 未到達時は緑、到達時は黄色系のテキスト
    let repopTimeColorClass = isPop ? 'text-amber-300 font-bold' : 'text-green-400';
    if (isMaxOver) {
        repopTimeColorClass = 'text-orange-400 font-bold';
    } else if (isUnknown) {
        repopTimeColorClass = 'text-gray-400';
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

    const reportBtnClass = 'bg-green-600 hover:bg-green-500 active:bg-green-700 report-btn'; 
    const reportBtnContent = `<span class="text-xs font-bold">報告</span><span class="text-xs font-bold">する</span>`;

    const reportBtnHtml = `
        <button class="${reportBtnClass} text-white px-1 py-1 rounded-md shadow-md transition h-10 w-10 flex flex-col items-center justify-center leading-none" 
                data-mobno="${mob['No.']}">
            ${reportBtnContent}
        </button>
    `;
    
    // --- 展開パネル内のコンテンツ生成 ---
    
    // 1. 抽選条件 (左揃え, 存在しない場合は空)
    let conditionHtml = '';
    if (mob.Condition) {
        // NEW: 余白 pt-1, pb-1 に削減
        conditionHtml = `
            <div class="px-4 pt-1 pb-1 condition-content text-left">
                <p class="text-xs font-medium text-gray-300">抽選条件:</p>
                <p class="text-sm text-white leading-snug">${processText(mob.Condition)}</p>
            </div>
        `;
    }

    // 2. 開始時間 (右揃え)
    const minRepopStr = formatDateForDisplay(minRepop);
    let minRepopHtml = `
        <div class="px-4 pt-1 pb-1 repop-start-content flex justify-end">
            <p class="text-sm font-semibold text-gray-400">開始時間: <span class="text-base text-gray-200 font-mono">${minRepopStr}</span></p>
        </div>
    `;

    // 3. 前回時間 (右揃え)
    const lastKillStr = formatDateForDisplay(lastKillDate);
    let lastKillHtml = `
        <div class="px-4 pt-1 pb-1 last-kill-content flex justify-end">
            <p class="text-sm font-semibold text-gray-400">前回時間: <span class="text-base text-gray-200 font-mono">${lastKillStr}</span></p>
        </div>
    `;

    // 4. 地図 (中央揃え, 存在しない場合は空)
    let mapDetailsHtml = '';
    if (mob.Map) {
        // NEW: pt-1 に削減し、下部余白は panel-padding-bottom で一括制御
        mapDetailsHtml = `
            <div class="mob-details pt-1 px-4 text-center map-content">
                <div class="relative inline-block w-full max-w-sm">
                    <img src="./maps/${mob.Map}" alt="${mob.Area} Map" class="w-full h-auto rounded-lg shadow-md map-image" data-area="${mob.Area}">
                    <div class="absolute inset-0 map-overlay" data-area="${mob.Area}">
                        </div>
                </div>
            </div>
        `;
    }
    
    // パネルコンテンツの結合 (順番: 抽選条件, 開始時間, 前回時間, 地図)
    let panelContent = conditionHtml + minRepopHtml + lastKillHtml + mapDetailsHtml;
    
    // NEW: 下部余白を追加
    if (panelContent.trim()) {
        panelContent = `<div class="panel-padding-bottom">${panelContent}</div>`;
    }

    let expandablePanel = '';
    if (panelContent.trim()) {
        // NEW: 上部余白を削除 (px-0, pt-0)
        expandablePanel = `
            <div class="expandable-panel overflow-hidden transition-all duration-300 ease-in-out max-height-0 pt-0 px-0">
                ${panelContent}
            </div>
        `;
    }


    // --- 進捗バーエリアのHTML (1行表示に統一) ---
    
    const remainingTimeClass = 'font-mono text-gray-200'; 
    const repopInfoHtml = `
        <div class="mt-1 bg-gray-700 p-2 rounded-xl text-xs flex flex-col space-y-1 relative overflow-hidden shadow-inner h-10">
            <div class="flex items-center relative z-10 h-full">
                <span class="repop-info-display text-base ${repopTimeColorClass} font-mono w-full text-center">
                    ${timeDisplay}
                </span>
            </div>

            <div class="progress-bar" style="z-index: 0;"></div>
        </div>
    `;


    // --- モブカードの最終構造 ---
    return `
        <div class="mob-card bg-gray-800 rounded-xl shadow-2xl overflow-hidden transform hover:scale-[1.01] transition duration-300 relative" 
             data-rank="${mob.Rank}" 
             data-mobno="${mob['No.']}"
             data-lastkill="${mob.LastKillDate || ''}"
             data-minrepop="${mob['REPOP(s)']}"
             data-maxrepop="${mob['MAX(s)']}"
             data-expansion="${mob.Expansion || 'その他'}"> 

            <div class="p-2 fixed-content toggle-handler cursor-pointer">
                <div class="flex justify-between items-start mb-1">
                    <div class="flex items-center space-x-2">
                        <div class="rank-icon ${rankBgClass} ${rankTextColor} font-bold text-sm w-7 h-7 flex items-center justify-center rounded-lg shadow-lg">
                            ${mob.Rank}
                        </div>
                        <div class="min-w-0 flex-1"> 
                            <h2 class="text-base font-bold text-outline text-yellow-200 leading-tight truncate">${mob.Name}</h2>
                            <p class="text-xs text-gray-400 leading-tight truncate">${mob.Area} (${mob.Expansion || '?'})</p>
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
    
    const { rank, areas } = currentFilter;

    // 1. ランクでフィルタリング
    let filteredByRank = globalMobData;
    if (rank !== 'ALL') {
        // 'ALL' 以外のタブが選択されている場合、そのランクに限定
        filteredByRank = globalMobData.filter(mob => mob.Rank === rank);
    }
    
    // 2. エリア (拡張パック) でフィルタリング
    let filteredByArea = filteredByRank;
    
    // NEW: areas Set に 'ALL' 以外の要素がある場合のみフィルタリング
    if (!areas.has('ALL') && areas.size > 0) {
        filteredByArea = filteredByRank.filter(mob => areas.has(mob.Expansion));
    }


    // 3. レンダリング処理
    const columns = [
        document.getElementById('column-1'),
        document.getElementById('column-2'),
        document.getElementById('column-3')
    ].filter(col => col); 

    columns.forEach(col => col.innerHTML = '');

    if (columns.length === 0) {
        return; 
    }

    filteredByArea.forEach((mob, index) => {
        // Bランクは mob_data.json のデータで自動的に調整される
        const cardHtml = createMobCard(mob); 
        
        let targetColumn = columns[0];
        if (columns.length > 1) {
            targetColumn = columns[index % columns.length];
        }

        const div = document.createElement('div');
        div.innerHTML = cardHtml.trim();
        targetColumn.appendChild(div.firstChild);
    });

    // 4. アクティブなタブをハイライト
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
    
    // 5. エリアフィルタボタンのハイライトとコンテナの表示制御
    
    // エリアフィルタコンテナの表示制御
    if (areaFilterContainer) {
        if (rank === 'S' || rank === 'A' || rank === 'F') {
            // S, A, FATE が選択されたら表示
            areaFilterContainer.classList.remove('hidden');
        } else {
            // ALL が選択されたら非表示
            areaFilterContainer.classList.add('hidden');
        }
    }
    
    // エリアフィルタボタンのハイライト
    document.querySelectorAll('.area-filter-btn').forEach(btn => {
        btn.classList.remove('bg-blue-600', 'hover:bg-blue-500');
        btn.classList.add('bg-gray-600', 'hover:bg-gray-500');
        
        // NEW: areas Setに含まれているボタンをハイライト
        if (currentFilter.areas.has(btn.dataset.area)) {
            btn.classList.remove('bg-gray-600', 'hover:bg-gray-500');
            btn.classList.add('bg-blue-600', 'hover:bg-blue-500');
        }
    });

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
            // 安全マージンを追加 (今回は下部余白が0.6remなので、それを反映させる)
            panel.style.maxHeight = (targetHeight + 5) + 'px'; // 5pxは誤差吸収用

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

    // --- NEW: ポイントの基本スタイル設定 ---
    const pointDiameter = '12px'; 
    const pointBorderWidth = '2px'; 
    
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

        // Bランク専用ポイントは強調表示なし
        if (!isCullTarget) {
            if (point.mob_ranks.length === 1 && (includesB1 || includesB2)) {
                const pointEl = document.createElement('div');
                pointEl.className = 'spawn-point-b-only';
                pointEl.style.left = `${point.x}%`;
                pointEl.style.top = `${point.y}%`;
                pointEl.style.transform = 'translate(-50%, -50%)';
                
                pointEl.style.width = pointDiameter;
                pointEl.style.height = pointDiameter;
                pointEl.style.borderRadius = '50%';
                pointEl.style.position = 'absolute';
                
                pointEl.style.backgroundColor = includesB1 ? B1_INTERNAL_COLOR : B2_INTERNAL_COLOR; // B2の色を適用
                pointEl.style.border = 'none';
                pointEl.style.boxShadow = '0 0 8px rgba(0, 0, 0, 0.7)'; 
                
                overlayEl.appendChild(pointEl);
            }
            return;
        }

        // --- 湧き潰し対象ポイントの描画ロジック ---
        
        const isCulled = mob.cullStatusMap[point.id] || false;
        
        let outlineColor = '#9ca3af'; 
        let internalColor = '#d1d5db'; 

        // B1/B2の色分け
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

        // 要素作成とスタイル適用
        const pointEl = document.createElement('div');
        pointEl.className = `spawn-point hover:scale-150 transition-transform duration-100 cursor-pointer`; 
        pointEl.setAttribute('data-id', point.id);
        pointEl.setAttribute('data-isculltarget', 'true');

        pointEl.style.left = `${point.x}%`;
        pointEl.style.top = `${point.y}%`;
        pointEl.style.transform = 'translate(-50%, -50%)';
        pointEl.style.boxShadow = 'none';

        pointEl.style.width = pointDiameter;
        pointEl.style.height = pointDiameter;
        pointEl.style.borderRadius = '50%';
        pointEl.style.position = 'absolute';
        pointEl.style.zIndex = '10'; 

        
        // 輪郭と内部色を設定
        pointEl.style.border = `${pointBorderWidth} solid ${outlineColor}`;
        pointEl.style.backgroundColor = internalColor;
        
        // S/A抽選対象ポイントに影を追加 (湧き潰し済みでない場合のみ)
        if (!isCulled && isCullTarget) {
            pointEl.style.boxShadow = `0 0 8px 1px ${outlineColor}`; 
        }

        // 湧き潰し済みの表示
        if (isCulled) {
            pointEl.classList.add('culled');
            pointEl.style.border = `${pointBorderWidth} solid white`; 
            pointEl.style.backgroundColor = 'rgba(100, 100, 100, 0.5)'; // グレーアウト
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

    // ボタンを初期状態に戻す
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
    
    if (!mob || !killTimeLocal) {
        console.error('討伐日時が未入力です。');
        return;
    }

    const killTimeJstIso = toJstAdjustedIsoString(killTimeLocal);

    // 送信開始時にボタンを灰色無効化 (送信中...)
    submitReportBtn.disabled = true;
    submitReportBtn.textContent = '送信中...';
    submitReportBtn.classList.remove('bg-green-600', 'hover:bg-green-500', 'bg-red-600', 'hover:bg-red-500');
    submitReportBtn.classList.add('bg-gray-500');
    
    reportStatusEl.classList.remove('hidden', 'text-green-500', 'text-red-500');
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
            
            // 成功時: モーダルを自動で閉じ、データを更新
            submitReportBtn.textContent = '報告完了';
            submitReportBtn.classList.remove('bg-gray-500');
            submitReportBtn.classList.add('bg-green-600');
            submitReportBtn.disabled = false; // ボタンを再有効化
            // 手動更新として、ロードメッセージを表示
            await fetchRecordsAndUpdate('manual', false); 
            setTimeout(closeReportModal, 1500); 

        } else {
            // 失敗時
            reportStatusEl.textContent = `報告失敗: ${result.message}`;
            reportStatusEl.classList.add('text-red-500');
            submitReportBtn.textContent = '送信失敗';
            submitReportBtn.classList.remove('bg-gray-500');
            submitReportBtn.classList.add('bg-red-600', 'hover:bg-red-500');
            submitReportBtn.disabled = false; // ボタンを再有効化
        }

    } catch (error) {
        // 通信エラー時
        console.error('報告エラー:', error);
        reportStatusEl.textContent = '通信エラーが発生しました。';
        reportStatusEl.classList.add('text-red-500');
        submitReportBtn.textContent = '送信失敗';
        submitReportBtn.classList.remove('bg-gray-500');
        submitReportBtn.classList.add('bg-red-600', 'hover:bg-red-500');
        submitReportBtn.disabled = false; // ボタンを再有効化
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
            console.error(`Fetch Error: Status ${response.status} for ${MOB_DATA_URL}.`);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const jsonData = await response.json();
        
        if (jsonData && Array.isArray(jsonData.mobConfig)) {
            baseMobData = jsonData.mobConfig.map(mob => {
                const mobNo = parseInt(mob['No.']);
                
                // NEW: No.の1万の位から拡張パック名を決定
                const expansionKey = Math.floor(mobNo / 10000); 
                const expansionName = EXPANSION_MAP[expansionKey] || 'その他';
                
                return {
                    ...mob,
                    'No.': mobNo, 
                    Expansion: expansionName // Expansionプロパティを追加
                };
            });
            console.log('Base mob data (mobConfig) fetched and expanded successfully.');
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
    
    // 1. 基本データ (Base Mob Data) のロード
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

    // 基本データを元にリストを初期表示 (ローディング中の空の状態を防ぐ)
    globalMobData = [...baseMobData];
    renderMobList(); 
    
    // 2. メッセージ表示制御
    let shouldDisplayLoading = false;
    
    if (updateType === 'initial' || updateType === 'manual') {
        shouldDisplayLoading = true;
    } else if (updateType === 'auto') {
        // 自動更新の場合、成功回数が0回（初回自動更新）の場合のみ表示
        if (autoUpdateSuccessCount === 0) {
            shouldDisplayLoading = true;
        }
    }

    if (shouldDisplayLoading) {
        displayError(`討伐記録と湧き潰し状態を更新中...`);
    } else {
        // 自動更新でメッセージ非表示の場合
        displayError(null); 
    }

    // 3. 討伐記録と湧き潰し状態の取得と更新
    try {
        const response = await fetch(GAS_ENDPOINT + '?action=getRecords');
        const data = await response.json();
        
        if (data.status === 'success') {
            
            // Success: Clear the error/loading display 
            if (shouldDisplayLoading) {
                displayError(null); 
            }
            
            const records = data.records;
            const cullStatuses = data.cullStatuses || []; 
            
            // データをマージして globalMobData を再構築
            globalMobData = baseMobData.map(mob => {
                const mobNo = mob['No.']; 
                const record = records.find(r => r['No.'] === mobNo);
                const newMob = { ...mob }; 
                
                // 討伐記録の反映 (POP_Date_Unixは秒単位で返される)
                if (record && record.POP_Date_Unix) {
                    newMob.LastKillDate = unixTimeToDate(record.POP_Date_Unix).toLocaleString();
                } else {
                    newMob.LastKillDate = ''; 
                }
                
                // 湧き潰し状態を mob データに紐づける
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
            
            renderMobList();
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
    
    // 80%~ および最大超過時のバーの色 (薄いオレンジ)
    const ORANGE_BAR_COLOR_CLASS = 'bg-orange-400';
    // 最大超過時のリポップ時刻の色 (薄いオレンジのテキスト)
    const ORANGE_TEXT_COLOR_CLASS = 'text-orange-400';
    // Min POP 到達時のテキストの色 (黄色)
    const POP_TEXT_COLOR_CLASS = 'text-amber-300';
    // Min POP 未到達時のテキストの色 (緑)
    const NEXT_TEXT_COLOR_CLASS = 'text-green-400';
    
    
    document.querySelectorAll('.mob-card').forEach(card => {
        const lastKillStr = card.dataset.lastkill;
        const repop = parseInt(card.dataset.minrepop);
        const max = parseInt(card.dataset.maxrepop);
        
        const lastKillDate = lastKillStr ? new Date(lastKillStr) : null;
        
        const mobStub = {"REPOP(s)": repop, "MAX(s)": max};
        const repopData = calculateRepop(mobStub, lastKillDate);
        const percent = repopData.elapsedPercent || 0; 

        // テキスト要素とバーの取得
        const repopInfoDisplayEl = card.querySelector('.repop-info-display');
        const progressBarEl = card.querySelector('.progress-bar'); 

        // --- 1. 表示テキストと色の更新 ---
        if (repopInfoDisplayEl) {
            
            // 1.1 テキストの更新
            repopInfoDisplayEl.textContent = repopData.timeDisplay;
            
            // 1.2 色の更新
            repopInfoDisplayEl.classList.remove('text-gray-400', NEXT_TEXT_COLOR_CLASS, POP_TEXT_COLOR_CLASS, ORANGE_TEXT_COLOR_CLASS, 'font-bold'); 
            
            if (repopData.isUnknown) {
                repopInfoDisplayEl.classList.add('text-gray-400');
            } else if (repopData.isMaxOver) {
                // 最大超過時: 薄いオレンジのテキスト
                repopInfoDisplayEl.classList.add(ORANGE_TEXT_COLOR_CLASS, 'font-bold'); 
            } else if (repopData.isPop) {
                // POPウィンドウ内: 黄色 (font-bold を追加)
                repopInfoDisplayEl.classList.add(POP_TEXT_COLOR_CLASS, 'font-bold');
            } else {
                // Min POP未到達: 緑
                repopInfoDisplayEl.classList.add(NEXT_TEXT_COLOR_CLASS);
            }
        }
        
        
        // --- 2. プログレスバーの更新ロジック ---
        if (progressBarEl) {
            
            let barColorClass = '';
            let widthPercent = Math.min(100, percent); 
            let animateClass = '';

            if (!repopData.isPop || repopData.isUnknown) {
                // Min POP未到達時やデータ不明時はバーを非表示 (幅0%)
                widthPercent = 0;
            } else if (repopData.isMaxOver) {
                // 最大超過: 100%幅で薄いオレンジに点滅
                barColorClass = ORANGE_BAR_COLOR_CLASS; 
                widthPercent = 100;
                animateClass = 'animate-pulse';
            } else if (percent >= 80) {
                // 80% ～ 100%未満: 薄いオレンジ
                barColorClass = ORANGE_BAR_COLOR_CLASS; 
            } else if (percent >= 60) {
                // 60% ～ 80%未満: レモン色 (yellow-400)
                barColorClass = 'bg-yellow-400'; 
            } else {
                // 0% ～ 60%未満: 黄緑 (lime-500)
                barColorClass = 'bg-lime-500'; 
            }
            
            // 安定版のロジック: すべてのクラスを上書きして再設定
            progressBarEl.className = `progress-bar absolute inset-0 transition-all duration-100 ease-linear rounded-xl ${barColorClass} ${animateClass}`;

            progressBarEl.style.width = `${widthPercent}%`;
        }

        // --- 3. 討伐報告ボタンの状態を更新 (常に有効) ---
        const reportBtn = card.querySelector('button[data-mobno]');
        if (reportBtn) {
            // 常に報告可能にする
            reportBtn.disabled = false;
            reportBtn.classList.remove('bg-gray-500', 'cursor-not-allowed'); 
            reportBtn.classList.add('bg-green-600', 'hover:bg-green-500', 'active:bg-green-700'); 
            reportBtn.innerHTML = `<span class="text-xs font-bold">報告</span><span class="text-xs font-bold">する</span>`;
        }
    });
}


/**
 * サイトの初期化処理
 */
function initializeApp() {
    // 1. UUIDの取得/生成 (省略)
    userId = localStorage.getItem('user_uuid');
    if (!userId) {
        userId = crypto.randomUUID();
        localStorage.setItem('user_uuid', userId);
    }

    // UUIDの表示
    if (uuidDisplayEl && userId) {
        const maskedUuid = userId.substring(0, 5) + '****';
        uuidDisplayEl.textContent = `ID: ${maskedUuid}`;
        uuidDisplayEl.classList.remove('hidden');
    }

    // 2. イベントリスナーの設定
    
    // ランクタブのリスナー
    if (rankTabs) {
        document.querySelectorAll('.tab-btn').forEach(button => {
            button.onclick = (e) => {
                const newRank = e.currentTarget.dataset.rank;
                
                if (currentFilter.rank !== newRank) {
                    currentFilter.rank = newRank;
                    
                    // ALLタブに切り替えた際はエリアフィルタもALLにリセット
                    if (newRank === 'ALL') {
                        currentFilter.areas = new Set(['ALL']); 
                    }
                    
                    renderMobList(); 
                }
            }
        });
    }

    // NEW: エリアフィルタボタンのリスナー (複数選択対応)
    document.querySelectorAll('.area-filter-btn').forEach(button => {
        button.onclick = (e) => {
            const newArea = e.currentTarget.dataset.area;

            if (newArea === 'ALL') {
                // 'ALL'が押されたら、Setを['ALL']で上書き
                currentFilter.areas = new Set(['ALL']);
            } else {
                // 'ALL'以外のボタンが押されたら、まず'ALL'を削除
                if (currentFilter.areas.has('ALL')) {
                    currentFilter.areas.delete('ALL');
                }

                // 選択状態をトグル
                if (currentFilter.areas.has(newArea)) {
                    currentFilter.areas.delete(newArea);
                } else {
                    currentFilter.areas.add(newArea);
                }
                
                // 選択肢が空になったら、自動的に'ALL'に戻す
                if (currentFilter.areas.size === 0) {
                    currentFilter.areas.add('ALL');
                }
            }
            
            renderMobList(); 
        }
    });


    // モーダル関連のリスナー
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

    // 3. 初回データロードと定期更新
    // 初期ロード: 'initial' タイプで実行 (通信帯を表示)
    fetchRecordsAndUpdate('initial', true);

    // 討伐記録の定期更新 (10分ごと)
    setInterval(() => fetchRecordsAndUpdate('auto', false), 10 * 60 * 1000);

    // プログレスバーの定期更新を 1秒ごと に変更
    setInterval(updateProgressBars, 1000);
}

document.addEventListener('DOMContentLoaded', initializeApp);
