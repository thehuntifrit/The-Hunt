// =========================================================================
// グローバル変数と定数
// =========================================================================

const EXPANSION_MAP = {
    1: '新生',
    2: '蒼天',
    3: '紅蓮',
    4: '漆黒',
    5: '暁月',
    6: '黄金' // 将来の拡張
};
const TARGET_RANKS = ['S', 'A', 'F'];
const ALL_EXPANSION_NAMES = Object.values(EXPANSION_MAP);
const MOB_DATA_URL = 'mob_data.json';
// --- 変更箇所 1: GAS URLを適用 ---
const GAS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbyuTg_uO7ZnxPGz1eun3kUKjni5oLj-UpfH4g1N0wQmzB57KhBWFnAvcSQYlbNcUelT3g/exec'; 
// ----------------

let userId = null;
let baseMobData = []; // mob_data.jsonからの基本データ
let globalMobData = []; // 討伐記録とマージされた最新データ
let currentFilter = {
    rank: 'ALL',
    areaSets: { // ランクごとの選択エリアセットを保持 (例: Sランクで蒼天と紅蓮を選択)
        'S': new Set(['ALL']),
        'A': new Set(['ALL']),
        'F': new Set(['ALL'])
    }
};
let currentMobNo = null; // 報告モーダルで使用
let autoUpdateSuccessCount = 0;


// =========================================================================
// DOM要素の取得
// =========================================================================

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
    areaFilterWrapper: document.getElementById('area-filter-wrapper'),
    areaFilterContainer: document.getElementById('area-filter-container'),
    fixedHeaderContent: document.getElementById('fixed-header-content'),
    contentSpacer: document.getElementById('content-spacer'),
    mobListColumns: document.getElementById('mob-list-columns'), 
    mobListContainer: document.getElementById('mob-list') // 念のため残す
};

const { errorMessageContainer, rankTabs, reportModal, modalMobName, reportDatetimeInput, reportMemoInput, submitReportBtn, cancelReportBtn, reportStatusEl, uuidDisplayEl, areaFilterWrapper, areaFilterContainer, fixedHeaderContent, contentSpacer, mobListColumns, mobListContainer } = DOMElements;


// =========================================================================
// ユーティリティ関数
// =========================================================================

/**
 * UNIXタイムスタンプをDateオブジェクトに変換する
 */
function unixTimeToDate(unixTimestamp) {
    if (!unixTimestamp) return null;
    return new Date(unixTimestamp * 1000);
}

/**
 * mobNoに基づいてモブデータを取得する
 */
function getMobByNo(mobNo) {
    return globalMobData.find(mob => mob['No.'] === mobNo);
}

/**
 * ローカル日時入力値 (YYYY-MM-DDTHH:MM) をJSTのISO 8601文字列に変換する
 */
function toJstAdjustedIsoString(localDateTimeStr) {
    if (!localDateTimeStr) return null;

    // ローカルタイムゾーンとして解釈
    const localDate = new Date(localDateTimeStr);
    
    // JST (+9時間) との時差を調整してISO 8601形式で出力
    // タイムゾーン情報を含まないISO形式にする
    const jstOffset = 9 * 60 * 60 * 1000;
    const jstDate = new Date(localDate.getTime() + jstOffset);

    // YYYY-MM-DDTHH:MM:SSZ 形式に変換
    return jstDate.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

/**
 * エラーメッセージを表示または非表示にする
 */
function displayError(message) {
    if (!errorMessageContainer) return;

    if (message) {
        errorMessageContainer.classList.remove('hidden');
        errorMessageContainer.innerHTML = `
            <div class="bg-red-900/50 text-red-300 p-2 rounded-lg font-medium text-sm border border-red-800">
                ${message}
            </div>
        `;
    } else {
        errorMessageContainer.classList.add('hidden');
        errorMessageContainer.innerHTML = '';
    }
}

/**
 * 固定ヘッダーの高さに基づいてコンテンツのパディングを調整する
 */
function adjustContentPadding() {
    if (!fixedHeaderContent || !contentSpacer) return;
    const headerHeight = fixedHeaderContent.offsetHeight;
    contentSpacer.style.height = `${headerHeight}px`;
}


// =========================================================================
// リポップ計算ロジック
// =========================================================================

/**
 * リポップ状況を計算する
 */
function calculateRepop(mobStub, lastKillDate) {
    const repopMinSeconds = mobStub['REPOP(s)'] || 0;
    const repopMaxSeconds = mobStub['MAX(s)'] || 0;
    const now = Date.now();
    let timeDisplay = '不明';
    let elapsedPercent = 0;
    let isPop = false;
    let isMaxOver = false;
    let isUnknown = !lastKillDate;

    if (lastKillDate && repopMinSeconds > 0) {
        const lastKillTime = lastKillDate.getTime();
        const minPopTime = lastKillTime + repopMinSeconds * 1000;
        const maxPopTime = lastKillTime + repopMaxSeconds * 1000;
        const elapsedSeconds = (now - lastKillTime) / 1000;
        
        if (now < minPopTime) {
            // リポップ前
            const remainingSeconds = Math.max(0, (minPopTime - now) / 1000);
            
            // 進捗率 (0% to 100%)
            elapsedPercent = (elapsedSeconds / repopMinSeconds) * 100;
            
            const hours = Math.floor(remainingSeconds / 3600);
            const minutes = Math.floor((remainingSeconds % 3600) / 60);
            
            timeDisplay = `次まで ${hours}h ${minutes}m`;
        
        } else {
            // リポップ抽選期間中または超過
            isPop = true;
            
            if (now >= maxPopTime) {
                // 最大リポップ時間を超過
                isMaxOver = true;
                const overSeconds = (now - maxPopTime) / 1000;
                const hours = Math.floor(overSeconds / 3600);
                const minutes = Math.floor((overSeconds % 3600) / 60);
                
                timeDisplay = `POP中 (Max超過: ${hours}h ${minutes}m)`;
                elapsedPercent = 100;
                
            } else {
                // リポップ抽選期間中
                
                // 抽選期間内の進捗率をバーで表示
                elapsedPercent = Math.min(100, (elapsedSeconds / repopMaxSeconds) * 100);

                timeDisplay = 'POP中';
            }
        }

    } else if (lastKillDate) {
        // Bランクなどリポップ時間不明だが討伐記録がある場合
        timeDisplay = 'リポップ設定不明';
        isUnknown = true;
    }

    return {
        timeDisplay,
        elapsedPercent,
        isPop,
        isMaxOver,
        isUnknown
    };
}


// =========================================================================
// DOM描画・操作
// =========================================================================

/**
 * フィルター状態に基づいてモブカード一覧を再描画する
 * **物理的なカラム分割ロジックを維持しています。**
 */
function renderMobList() {
    // 1. フィルタリングとソート
    let filteredMobs = globalMobData
        .filter(mob => {
            // ランクフィルタ
            if (currentFilter.rank !== 'ALL' && mob.Rank !== currentFilter.rank) {
                return false;
            }
            
            // エリアフィルタ (S, A, FATEのみ適用)
            const targetRank = TARGET_RANKS.includes(currentFilter.rank) ? currentFilter.rank : 'S';
            const areaSet = currentFilter.areaSets[targetRank];
            
            if (areaSet && !areaSet.has('ALL')) {
                // ALL以外のエリアが一つでも選択されている場合、そのエリアに属さないモブは非表示
                if (!areaSet.has(mob.Expansion)) {
                    return false;
                }
            }
            
            return true;
        })
        .sort((a, b) => {
            // ALLタブでのみNo.順ソート (デフォルトのロード順を維持)
            if (currentFilter.rank === 'ALL') {
                return a['No.'] - b['No.'];
            }
            // 他のタブではソートなし
            return 0;
        });

    // 2. DOMのクリア (mobListColumns内のカラムをクリア)
    const columns = mobListColumns ? Array.from(mobListColumns.children) : [];
    columns.forEach(col => col.innerHTML = '');
    
    // 3. レンダリング処理 - カラム分割を維持
    if (columns.length > 0) { 
        filteredMobs.forEach((mob, index) => {
            const cardHtml = createMobCard(mob);
            const targetColumn = columns[index % columns.length]; // 物理的なカラムに順番に追加
            
            const div = document.createElement('div');
            div.innerHTML = cardHtml.trim();
            targetColumn.appendChild(div.firstChild);
        });
    }

    // 4. UIの更新
    updateRankTabs();
    updateAreaFilterButtons();
    attachEventListeners();
    updateProgressBars();
    saveFilterState();
}

/**
 * ランクフィルタタブの表示を更新する
 */
function updateRankTabs() {
    if (!rankTabs) return;

    document.querySelectorAll('.tab-btn').forEach(button => {
        const rank = button.dataset.rank;
        const isActive = rank === currentFilter.rank;

        button.classList.remove('bg-gray-700', 'bg-accent-blue', 'hover:bg-gray-600', 'text-white', 'text-gray-400');

        if (isActive) {
            button.classList.add('bg-accent-blue', 'text-white');
        } else {
            button.classList.add('bg-gray-700', 'text-gray-400', 'hover:bg-gray-600');
        }
    });
}

/**
 * エリアフィルタボタンの表示を更新する
 */
function updateAreaFilterButtons() {
    if (!areaFilterContainer) return;

    const targetRank = TARGET_RANKS.includes(currentFilter.rank) ? currentFilter.rank : 'S';
    const areaSet = currentFilter.areaSets[targetRank];
    if (!areaSet) return;
    
    // 現在のランクに応じてエリアフィルタパネルの表示/非表示を決定
    if (TARGET_RANKS.includes(currentFilter.rank)) {
        areaFilterWrapper.classList.remove('hidden-init');
    } else {
        areaFilterWrapper.classList.add('hidden-init');
    }

    document.querySelectorAll('.area-filter-btn').forEach(button => {
        const area = button.dataset.area;
        const isSelected = areaSet.has(area);
        const isTargetRank = area === 'ALL' || ALL_EXPANSION_NAMES.includes(area); // 拡張エリアのボタン

        // ランクがALLの場合、Sランクのフィルタ状態を反映
        if (currentFilter.rank === 'ALL' && !TARGET_RANKS.includes(currentFilter.rank)) {
            // ALLタブ選択時もエリアフィルタはSランクのものを表示・操作させる
        }

        button.classList.remove('bg-accent-blue', 'bg-gray-700', 'hover:bg-gray-600', 'text-white', 'text-gray-400');

        if (isSelected) {
            button.classList.add('bg-accent-blue', 'text-white');
        } else {
            button.classList.add('bg-gray-700', 'text-gray-400', 'hover:bg-gray-600');
        }
    });
}


/**
 * モブカードのHTMLを生成する
 */
function createMobCard(mob) {
    const isS_A_F = ['S', 'A', 'F'].includes(mob.Rank);
    const repop = mob['REPOP(s)'] || 0;
    const max = mob['MAX(s)'] || 0;
    const lastKillDate = mob.LastKillDate ? new Date(mob.LastKillDate) : null;
    const repopData = calculateRepop(mob, lastKillDate);
    
    let rankBgClass = 'bg-gray-500';
    let icon = '';

    switch (mob.Rank) {
        case 'S':
            rankBgClass = 'bg-red-600';
            icon = 'S';
            break;
        case 'A':
            rankBgClass = 'bg-blue-600';
            icon = 'A';
            break;
        case 'B':
            rankBgClass = 'bg-purple-600';
            icon = 'B';
            break;
        case 'F':
            rankBgClass = 'bg-yellow-600';
            icon = 'F';
            break;
    }

    // 変更箇所 2: マップ画像パスに 'maps/' を再追加
    const mapHtml = mob.Map ? `
        <div class="mt-4 p-2 bg-gray-800 rounded-xl shadow-inner panel-padding-bottom">
            <h4 class="text-sm font-semibold text-gray-400 mb-2">スポーンマップ (クリックで湧き潰しトグル)</h4>
            <div class="relative w-full overflow-hidden rounded-lg shadow-xl">
                <img src="maps/${mob.Map}" alt="${mob.Name} マップ" class="map-image w-full h-auto rounded-lg"> 
                <div class="map-overlay" data-mobno="${mob['No.']}">
                    </div>
            </div>
        </div>
    ` : '';
    
    const cullConditionHtml = mob['Cull Condition'] ? `
        <div class="mt-4 p-2 bg-gray-800 rounded-xl shadow-inner panel-padding-bottom">
            <h4 class="text-sm font-semibold text-gray-400 mb-2">抽選条件</h4>
            <p class="text-sm text-gray-300 whitespace-pre-wrap">${mob['Cull Condition']}</p>
        </div>
    ` : '';
    
    const repopTimeHtml = repop > 0 ? `
        <p class="text-xs text-gray-400 mt-2">
            REPOP: ${Math.floor(repop / 3600)}h ${Math.floor((repop % 3600) / 60)}m 〜 
            ${Math.floor(max / 3600)}h ${Math.floor((max % 3600) / 60)}m
        </p>
    ` : '';

    return `
        <div class="mob-card bg-card-bg rounded-xl shadow-2xl overflow-hidden transition-all duration-300 ${repopData.isPop ? 'border-2 border-accent-red' : 'border border-gray-700/50'}"
            data-mobno="${mob['No.']}"
            data-rank="${mob.Rank}"
            data-expansion="${mob.Expansion}"
            data-minrepop="${repop}"
            data-maxrepop="${max}"
            data-lastkill="${mob.LastKillDate || ''}">
            
            <div class="toggle-handler p-4 cursor-pointer">
                <div class="flex items-start justify-between">
                    <div class="flex items-center space-x-3 flex-1 min-w-0">
                        <div class="rank-icon w-8 h-8 flex items-center justify-center text-lg font-extrabold text-white rounded-full ${rankBgClass}">
                            ${icon}
                        </div>
                        <div class="min-w-0 flex-1">
                            <h3 class="text-lg font-bold text-white truncate text-outline">${mob.Name}</h3>
                            <p class="text-xs text-gray-400">${mob.Expansion} (${mob.Rank}ランク)</p>
                        </div>
                    </div>
                    
                    ${isS_A_F ? `
                        <button class="report-btn flex-shrink-0 ml-3 px-3 py-1 text-xs font-bold bg-green-600 hover:bg-green-500 text-white rounded-lg shadow-md transition-colors duration-200" data-mobno="${mob['No.']}">
                            報告
                        </button>
                    ` : ''}
                </div>
                
                <div class="mt-3">
                    <p class="text-sm font-semibold mb-1 text-gray-400">
                        最終討伐: ${mob.LastKillDate || '記録なし'}
                    </p>
                    ${repopTimeHtml}
                    <div class="h-4 bg-gray-700 rounded-xl shadow-lg mt-2 relative overflow-hidden">
                        <div class="progress-bar-container relative h-full">
                            <div class="progress-bar progress-bar-base" style="width: 0%;"></div>
                            <div class="absolute inset-0 flex items-center justify-center text-xs font-bold">
                                <span class="repop-info-display text-gray-400" style="z-index: 1;">${repopData.timeDisplay}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="expandable-panel bg-gray-800/50 max-h-0 overflow-hidden">
                <div class="p-4 pt-0">
                    <p class="text-sm text-gray-300">
                        ${mob.Memo || '特になし'}
                    </p>
                    ${mapHtml}
                    ${cullConditionHtml}
                </div>
            </div>
        </div>
    `;
}

/**
 * モブカードのイベントリスナーを設定する
 */
function attachEventListeners() {
    // 1. 詳細パネルのトグル
    document.querySelectorAll('.mob-card').forEach(card => {
        const toggleHandler = card.querySelector('.toggle-handler');
        const expandablePanel = card.querySelector('.expandable-panel');
        const mapOverlay = card.querySelector('.map-overlay');
        const mobNo = card.dataset.mobno;
        
        // 既存のリスナーを削除 (renderMobListのたびに再追加されるのを防ぐ)
        if (toggleHandler.toggleClickListener) {
            toggleHandler.removeEventListener('click', toggleHandler.toggleClickListener);
        }

        toggleHandler.toggleClickListener = () => {
            const isOpen = card.classList.toggle('open');
            
            if (isOpen) {
                // 開く
                // scrollHeightを直接設定することでアニメーション
                expandablePanel.style.maxHeight = `${expandablePanel.scrollHeight}px`; 
                
                // マップがあれば湧き潰しポイントを描画
                if (mapOverlay) {
                    const mob = getMobByNo(parseInt(mobNo));
                    if (mob) {
                        drawSpawnPoints(mapOverlay, mob.spawn_points, mobNo);
                    }
                }
            } else {
                // 閉じる
                expandablePanel.style.maxHeight = '0';
            }
        };
        toggleHandler.addEventListener('click', toggleHandler.toggleClickListener);
    });

    // 2. 報告ボタンのリスナー
    document.querySelectorAll('.report-btn').forEach(button => {
        // 既存のリスナーを削除
        if (button.reportClickListener) {
            button.removeEventListener('click', button.reportClickListener);
        }
        
        button.reportClickListener = (e) => {
            e.stopPropagation();
            openReportModal(e.currentTarget.dataset.mobno);
        };
        button.addEventListener('click', button.reportClickListener);
    });
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

// --- フィルタ状態の保存/ロード ---

function saveFilterState() {
    try {
        const serializableFilter = {
            ...currentFilter,
            areaSets: {
                'S': Array.from(currentFilter.areaSets['S']),
                'A': Array.from(currentFilter.areaSets['A']),
                'F': Array.from(currentFilter.areaSets['F'])
            }
        };
        localStorage.setItem('huntTrackerFilter', JSON.stringify(serializableFilter));
    } catch (e) {
        console.warn('フィルタ状態の保存に失敗しました:', e);
    }
}

function loadFilterState() {
    try {
        const savedState = localStorage.getItem('huntTrackerFilter');
        if (savedState) {
            const loadedFilter = JSON.parse(savedState);
            currentFilter.rank = loadedFilter.rank || 'ALL';
            
            // areaSetsをSetに戻す
            ['S', 'A', 'F'].forEach(rank => {
                if (loadedFilter.areaSets && loadedFilter.areaSets[rank]) {
                    currentFilter.areaSets[rank] = new Set(loadedFilter.areaSets[rank]);
                }
            });
        }
    } catch (e) {
        console.warn('フィルタ状態のロードに失敗しました。デフォルト設定を使用します。', e);
        // エラー時はデフォルト設定に戻す
        currentFilter = {
            rank: 'ALL',
            areaSets: { 'S': new Set(['ALL']), 'A': new Set(['ALL']), 'F': new Set(['ALL']) }
        };
    }
}

// --- 初期化 ---

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
