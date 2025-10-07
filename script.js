// Google Apps Script (GAS) のエンドポイントURL
const GAS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbwxgb5APRPyTwEM3ZQtgG3WWdxrFqVZAgkvq4Qfh_FggBU2p21yYDkWIdp-jMfBtG92Gg/exec';
// 静的モブデータ (mob_data.json) のURL (同階層のファイルを参照)
const MOB_DATA_URL = './mob_data.json'; 


// --- グローバル変数 ---
let baseMobData = [];
let globalMobData = [];
let currentFilter = 'ALL';
let currentMobNo = null;
let userId = null;

// --- DOMエレメント ---
const appEl = document.getElementById('app');
const errorMessageContainer = document.getElementById('error-message-container'); // NEW
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
        errorMessageContainer.classList.add('hidden');
        errorMessageContainer.classList.remove(...baseClasses, ...errorClasses);
        errorMessageContainer.innerHTML = '';
    }
}


/**
 * 討伐日時からリポップ情報を計算する
 */
function calculateRepop(mob, lastKill) {
    const killTime = (lastKill instanceof Date) ? lastKill : new Date(lastKill);
    
    if (!lastKill || isNaN(killTime.getTime())) {
        return {
            minRepop: '未討伐',
            maxRepop: null,
            timeRemaining: 'N/A',
            elapsedPercent: 0,
            isPop: false
        };
    }
    
    const now = new Date();
    const repopMinMs = mob['REPOP(s)'] * 1000;
    
    if (repopMinMs <= 0) {
        return {
            minRepop: 'N/A',
            maxRepop: null,
            timeRemaining: 'N/A',
            elapsedPercent: 0,
            isPop: false
        };
    }

    const minRepopTime = new Date(killTime.getTime() + repopMinMs);
    const elapsedMs = now.getTime() - killTime.getTime();
    const remainingMs = minRepopTime.getTime() - now.getTime();
    
    let normalizedElapsedPercent = Math.max(0, Math.min(100, (elapsedMs / repopMinMs) * 100));

    let timeRemainingStr;
    let isPop = false;
    if (remainingMs <= 0) {
        isPop = true;
        // POP後の経過時間を表示
        const popElapsedMs = now.getTime() - minRepopTime.getTime();
        const totalSeconds = Math.floor(popElapsedMs / 1000);
        
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        timeRemainingStr = `POP中 (+${hours}h ${minutes}m ${seconds}s)`;
        normalizedElapsedPercent = 100;
    } else {
        const totalSeconds = Math.floor(remainingMs / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        timeRemainingStr = `${hours}h ${minutes}m ${seconds}s`;
    }

    return {
        minRepop: minRepopTime,
        maxRepop: null,
        timeRemaining: timeRemainingStr,
        elapsedPercent: normalizedElapsedPercent,
        isPop: isPop
    };
}

/**
 * モブデータに基づいてHTMLカードを生成する
 */
function createMobCard(mob) {
    const lastKillDate = mob.LastKillDate ? new Date(mob.LastKillDate) : null;
    const { minRepop, timeRemaining, elapsedPercent, isPop } = calculateRepop(mob, lastKillDate);

    let timeStatusClass = 'text-green-400';
    let minPopStr = '未討伐';
    let lastKillStr = mob.LastKillDate || '不明'; 

    if (lastKillDate) {
        minPopStr = minRepop instanceof Date ? minRepop.toLocaleString() : minRepop;

        if (isPop) {
            timeStatusClass = 'text-amber-400 font-bold';
        } else if (elapsedPercent >= 90) {
            timeStatusClass = 'text-red-400';
        }
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

    // 討伐報告ボタンの状態
    const canReport = !isPop || !lastKillDate; 
    
    const reportBtnClass = !canReport ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500 active:bg-green-700 report-btn';
    
    // 討伐報告ボタンの文字サイズと形状
    let reportBtnContent;
    if (!canReport) {
        reportBtnContent = `<span class="text-xs font-bold">POP中</span><span class="text-xs leading-none">(報告不可)</span>`;
    } else {
        reportBtnContent = `<span class="text-xs font-bold">討伐</span><span class="text-xs font-bold">報告</span>`;
    }

    const reportBtnHtml = `
        <button class="${reportBtnClass} text-white px-1 py-1 rounded-md shadow-md transition h-10 w-10 flex flex-col items-center justify-center leading-none" 
                data-mobno="${mob['No.']}" 
                data-ispop="${isPop ? 'true' : 'false'}" 
                data-rank="${mob.Rank}"
                ${!canReport ? 'disabled' : ''}>
            ${reportBtnContent}
        </button>
    `;
    
    // --- 展開パネルの内容 ---
    
    // 3. 前回討伐履歴パネルの生成 (常に展開パネル用として生成)
    let lastKillHistoryHtml = '';
    if (lastKillDate) {
        // Sランクは抽選条件と同じ文字サイズ(text-sm)、その他は text-base
        const sizeClass = mob.Rank === 'S' ? 'text-sm' : 'text-base';
        // Sランク以外の場合は、展開パネルの最上部に来るので pt-4
        const topPadding = mob.Rank === 'S' ? 'pt-0' : 'pt-4'; 

        lastKillHistoryHtml = `
            <div class="last-kill-history ${topPadding} pb-3 px-4">
                <div class="flex justify-between items-baseline">
                    <span class="text-gray-300 w-24 flex-shrink-0 ${sizeClass}">前回討伐:</span> 
                    <span class="last-kill-date ${sizeClass} text-white">${lastKillStr}</span>
                </div>
            </div>
        `;
    }

    // 1. 抽選条件パネル
    let conditionHtml = '';
    if (mob.Condition) {
        const displayCondition = processText(mob.Condition);
        
        // Sランク: 前回討伐が後に続くため pb-1 (4px) で余白を狭く
        // Sランクは先頭に来るため pt-3 (固定コンテンツ p-3 との境界)
        const conditionTopPadding = mob.Rank === 'S' ? 'pt-3' : (lastKillHistoryHtml ? 'pt-1' : 'pt-4'); 
        const conditionBottomPadding = mob.Rank === 'S' ? 'pb-1' : 'pb-4';
        
        conditionHtml = `
            <div class="${conditionTopPadding} px-4 ${conditionBottomPadding} condition-content">
                <p class="text-sm text-gray-400 leading-snug">${displayCondition}</p>
            </div>
        `;
    }
    
    // 2. マップ詳細パネル
    let mapDetailsHtml = '';
    if (mob.Map) {
        // マップの上余白は、前の要素が存在しない場合は pt-4, 存在する場合は pt-1 (狭く)
        // Sランクは前回討伐が直前にある可能性が高いため pt-1
        const precedingContentExists = conditionHtml || lastKillHistoryHtml;
        const mapTopPaddingClass = precedingContentExists ? 'pt-1' : 'pt-4';
        
        mapDetailsHtml = `
            <div class="mob-details ${mapTopPaddingClass} px-4 pb-4 map-content">
                <div class="relative">
                    <img src="./maps/${mob.Map}" alt="${mob.Area} Map" class="w-full h-auto rounded-lg shadow-md map-image" data-area="${mob.Area}">
                    <div class="absolute inset-0 map-overlay" data-area="${mob.Area}">
                        <!-- スポーンポイントはJSで動的に配置 -->
                    </div>
                </div>
            </div>
        `;
    }
    
    // --- 展開パネルのコンテンツの順序決定 ---
    let panelContent = '';
    
    if (mob.Rank === 'S') {
        // Sランク: [抽選条件] -> [前回討伐] -> [マップ]
        panelContent = conditionHtml + lastKillHistoryHtml + mapDetailsHtml;
    } else {
        // A, B, FATE: [前回討伐] -> [抽選条件 (通常なし)] -> [マップ]
        panelContent = lastKillHistoryHtml + conditionHtml + mapDetailsHtml;
    }
    
    // 抽選条件、マップ、または前回討伐データがある場合のみパネルを生成
    let expandablePanel = '';
    if (panelContent.trim()) {
        expandablePanel = `
            <div class="expandable-panel overflow-hidden transition-all duration-300 ease-in-out max-h-0">
                ${panelContent}
            </div>
        `;
    }

    // --- カード全体 ---

    return `
        <div class="mob-card bg-gray-800 rounded-xl shadow-2xl overflow-hidden transform hover:scale-[1.01] transition duration-300 relative" 
             data-rank="${mob.Rank}" 
             data-mobno="${mob['No.']}"
             data-lastkill="${mob.LastKillDate || ''}"
             data-minrepop="${mob['REPOP(s)']}"
             data-maxrepop="${mob['MAX(s)']}">

            <!-- 固定情報ヘッダー (p-4をp-3に、mt-3をmt-2に修正し、余白を狭める) -->
            <div class="p-3 fixed-content toggle-handler cursor-pointer">
                <div class="flex justify-between items-start mb-3">
                    <!-- ランクアイコン + モンスター名/エリア名 (Flex) -->
                    <div class="flex items-center space-x-3">
                        <!-- ランクアイコン (正方形、角丸、サイズw-7 h-7) -->
                        <div class="rank-icon ${rankBgClass} ${rankTextColor} font-bold text-sm w-7 h-7 flex items-center justify-center rounded-lg shadow-lg">
                            ${mob.Rank}
                        </div>
                        <!-- モンスター名とエリア名 -->
                        <div>
                            <h2 class="text-lg font-bold text-outline text-yellow-200 leading-tight">${mob.Name}</h2>
                            <p class="text-xs text-gray-400 leading-tight">${mob.Area}</p>
                        </div>
                    </div>
                    
                    <!-- 討伐報告ボタン (これはトグルに含まれない) -->
                    ${reportBtnHtml}
                </div>

                <!-- リポップ情報 (前回討伐を削除し、mt-3をmt-2に修正) -->
                <div class="mt-2 bg-gray-700 p-2 rounded-lg text-xs flex flex-col space-y-1">
                    
                    <!-- 1. 予測POP (ラベル/結果の文字サイズを text-base に統一) -->
                    <div class="flex justify-between items-baseline">
                        <span class="text-gray-300 w-24 flex-shrink-0 text-base">予測POP:</span>
                        <span class="repop-time text-base ${timeStatusClass} font-bold">${minPopStr}</span>
                    </div>
                    
                    <!-- 2. 残り (%) に短縮 -->
                    <div class="flex justify-between">
                        <span class="text-gray-300 w-24 flex-shrink-0 text-base">残り (%):</span> 
                        <span class="font-mono time-remaining text-base text-white">${timeRemaining} (${elapsedPercent.toFixed(1)}%)</span>
                    </div>
                </div>
            </div>

            <!-- 展開パネル (抽選条件とマップ詳細) -->
            ${expandablePanel}
        </div>
    `;
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
 * フィルターに基づいてモブカードリストをレンダリングする
 */
function renderMobList(rank) {
    currentFilter = rank;

    const filteredMobs = rank === 'ALL' 
        ? globalMobData
        : globalMobData.filter(mob => mob.Rank === rank);

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
    updateProgressBars();
}

/**
 * イベントリスナーをカードとボタンにアタッチする
 */
function attachEventListeners() {
    // 討伐報告ボタン
    document.querySelectorAll('.report-btn').forEach(button => {
        if (button.dataset.mobno && !button.disabled) {
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
            // NOTE: 描画は常にここで行い、既存の要素を置き換える
            drawSpawnPoints(mapOverlay, mob.spawn_points, mobNo);
        }
        
        // 2. 瞬時に max-height を解除し、コンテンツの最終的な高さを取得
        panel.style.maxHeight = 'none'; 
        const targetHeight = panel.scrollHeight; 

        // 3. max-heightを 0 に設定し、アニメーションの開始点に戻す
        panel.style.maxHeight = '0';
        
        // 4. 取得した高さに安全マージンを加えてアニメーションを開始
        setTimeout(() => {
            panel.style.maxHeight = (targetHeight + 100) + 'px';

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
 * マップにスポーンポイントを描画する (新規ロジック)
 */
function drawSpawnPoints(overlayEl, spawnPoints, currentMobNo) {
    overlayEl.innerHTML = '';
    const mob = getMobByNo(parseInt(currentMobNo));
    
    // mob.cullStatusMap は fetchRecordsAndUpdate で初期化されている
    if (!mob || !mob.cullStatusMap) return;

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
        // SまたはAが含まれるか
        const isS_A_Point = point.mob_ranks.includes('S') || point.mob_ranks.includes('A');
        
        // B1またはB2が含まれるか
        const includesB1 = point.mob_ranks.includes('B1');
        const includesB2 = point.mob_ranks.includes('B2');

        // 湧き潰し管理対象かどうか (SまたはAが含まれるポイントのみ)
        const isCullTarget = isS_A_Point; 

        // Bランク専用ポイントは強調表示なし
        if (!isCullTarget) {
            // B1のみ、B2のみのポイントは湧き潰し対象外なので、薄い影をつけて終了
            if (point.mob_ranks.length === 1 && (includesB1 || includesB2)) {
                const pointEl = document.createElement('div');
                pointEl.className = 'spawn-point';
                pointEl.style.left = `${point.x}%`;
                pointEl.style.top = `${point.y}%`;
                pointEl.style.transform = 'translate(-50%, -50%)';
                pointEl.style.backgroundColor = 'rgba(156, 163, 175, 0.4)'; // Gray
                pointEl.style.border = 'none';
                pointEl.style.boxShadow = '0 0 4px rgba(0, 0, 0, 0.5)'; // 薄い影
                overlayEl.appendChild(pointEl);
            }
            return;
        }

        // --- 湧き潰し対象ポイントの描画ロジック ---
        
        const isCulled = mob.cullStatusMap[point.id] || false;
        
        let outlineColor = '#9ca3af'; // 濃いグレー
        let internalColor = '#d1d5db'; // 薄いグレー

        // B1/B2の色分け
        if (includesB1) {
            outlineColor = '#3b82f6'; // 濃い青 (Blue-500)
            internalColor = '#60a5fa'; // 薄い青 (Blue-400)
        } else if (includesB2) {
            outlineColor = '#ef4444'; // 濃い赤 (Red-500)
            internalColor = '#f87171'; // 薄い赤 (Red-400)
        }
        
        // 最後の1点判定
        // isCulled=false かつ S/A抽選に関与 かつ 未処理が残り1つ
        const isLastPoint = !isCulled && remainingCullCount === 1;

        if (isLastPoint) {
            // 最後の1点: エメラルドグリーン
            outlineColor = '#10b981'; // エメラルドグリーン (Emerald-500)
            internalColor = '#34d399'; // 薄いエメラルド (Emerald-400)
        }

        // 要素作成とスタイル適用
        const pointEl = document.createElement('div');
        pointEl.className = `spawn-point hover:scale-125 transition-transform duration-100 cursor-pointer`;
        pointEl.setAttribute('data-id', point.id);
        pointEl.setAttribute('data-isculltarget', 'true');

        pointEl.style.left = `${point.x}%`;
        pointEl.style.top = `${point.y}%`;
        pointEl.style.transform = 'translate(-50%, -50%)';
        pointEl.style.boxShadow = 'none';
        
        // 輪郭と内部色を設定
        pointEl.style.border = `3px solid ${outlineColor}`;
        pointEl.style.backgroundColor = internalColor;
        
        // 湧き潰し済みの表示
        if (isCulled) {
            pointEl.classList.add('culled');
            pointEl.style.border = '3px solid white'; // 白枠
            pointEl.style.backgroundColor = 'rgba(100, 100, 100, 0.5)'; // グレーアウト
            pointEl.style.opacity = '0.7';
            pointEl.classList.remove('hover:scale-125'); // 湧き潰し済みはホバー効果を弱める
        }

        // クリックイベント
        pointEl.onclick = (e) => {
            e.stopPropagation(); 
            // mobNoは5桁のID
            toggleCullStatus(mob['No.'], point.id, !isCulled);
        };
        
        overlayEl.appendChild(pointEl);
    });
}

/**
 * 湧き潰し状態をGAS経由で切り替える (新規)
 * @param {number} mobNo - モブの通し番号 (5桁ID)
 * @param {string} pointId - ポイントID (UN_01など)
 * @param {boolean} newStatus - 新しい状態 (true: 湧き潰し済み, false: 未処理)
 */
async function toggleCullStatus(mobNo, pointId, newStatus) {
    const mob = getMobByNo(mobNo);
    if (!mob) return;
    
    // 画面上に即時反映 (ユーザー体験向上)
    mob.cullStatusMap[pointId] = newStatus;
    // 現在のフィルターで再描画
    renderMobList(currentFilter); 

    try {
        const response = await fetch(GAS_ENDPOINT, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                action: 'updateCullStatus', // GASで新規定義したアクション
                mobNo: mobNo, // 5桁ID
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

/**
 * 討伐報告モーダルを開く
 */
function openReportModal(mobNo) {
    if (!reportModal || !modalMobName || !reportDatetimeInput) return;

    // mobNoはstringとして渡されるのでparseIntで数値化
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
    // ローカルタイムゾーンオフセットを考慮して、入力フィールドに現在時刻を設定
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
 * 討伐報告をGASに送信する (GASアクション名修正)
 */
async function submitReport() {
    if (!currentMobNo || !reportDatetimeInput || !submitReportBtn || !reportStatusEl) return;

    const killTimeLocal = reportDatetimeInput.value;
    const memo = reportMemoInput.value;
    const mob = getMobByNo(currentMobNo); // currentMobNoは既に数値
    
    if (!mob || !killTimeLocal) {
        // NOTE: alert() は使えないため、カスタムメッセージまたはコンソールログを使用
        console.error('討伐日時が未入力です。');
        return;
    }

    // タイムゾーン問題の修正: ローカルタイムとして入力された時刻をJSTとして扱うISO文字列に変換
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
                action: 'reportKill', // GASの新しいアクション名
                mobNo: currentMobNo, // 5桁IDを送信
                mobName: mob.Name,
                rank: mob.Rank, // リセットのためにランク情報も渡す
                killTime: killTimeJstIso, // JST調整済みのISO文字列を送信
                memo: memo,
                reporterId: userId 
            })
        });

        const result = await response.json();

        if (result.status === 'success') {
            reportStatusEl.textContent = `報告成功！ (${result.message})`;
            reportStatusEl.classList.add('text-green-500');
            displayError(null); 
            
            // 報告成功後、最新の討伐記録と湧き潰し状態を取得し、リセット状態を反映させる
            await fetchRecordsAndUpdate(false); 
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
 * 外部JSONからモブデータを取得する
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
            // Mob No. を数値に変換して格納 (GASからのデータと型を合わせるため)
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
 * GASから最新の討伐記録と湧き潰し状態を取得し、グローバルデータを更新する (NEW)
 */
async function fetchRecordsAndUpdate(shouldFetchBase = true) {
    // ----------------------------------------------------
    // 1. 基本データ (Base Mob Data) のロード
    // ----------------------------------------------------
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

    // エラー時でもカード表示を維持するため、まず baseMobData で初期化
    globalMobData = [...baseMobData];
    // NOTE: 湧き潰し状態がない状態で一度レンダリングを行う
    renderMobList(currentFilter);
    displayError(`討伐記録と湧き潰し状態を更新中...`);

    // ----------------------------------------------------
    // 2. 討伐記録と湧き潰し状態の取得と更新
    // ----------------------------------------------------
    try {
        const response = await fetch(GAS_ENDPOINT + '?action=getRecords');
        const data = await response.json();
        
        if (data.status === 'success') {
            displayError(null); // 成功したらエラー表示をクリア
            const records = data.records;
            const cullStatuses = data.cullStatuses || []; // NEW: 湧き潰し状態リストを受信
            
            // データをマージして globalMobData を再構築
            globalMobData = baseMobData.map(mob => {
                const mobNo = mob['No.']; // 既に数値
                const record = records.find(r => r['No.'] === mobNo);
                const newMob = { ...mob }; 
                
                // 討伐記録の反映 (POP_Date_Unixは秒単位で返される)
                if (record && record.POP_Date_Unix) {
                    newMob.LastKillDate = unixTimeToDate(record.POP_Date_Unix).toLocaleString();
                } else {
                    newMob.LastKillDate = ''; 
                }
                
                // NEW: 湧き潰し状態を mob データに紐づける
                newMob.cullStatusMap = {};
                cullStatuses
                    .filter(status => status.Mob_No === mobNo) // Mob_No (5桁ID) でフィルタ
                    .forEach(status => {
                        // GASから 'TRUE'/'FALSE' の文字列として受信
                        newMob.cullStatusMap[status.Point_ID] = status.Is_Culled === 'TRUE';
                    });

                return newMob;
            });
            console.log('Kill and cull statuses merged successfully.');

            renderMobList(currentFilter);
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
    document.querySelectorAll('.mob-card').forEach(card => {
        const lastKillStr = card.dataset.lastkill;
        const repop = parseInt(card.dataset.minrepop);
        const max = parseInt(card.dataset.maxrepop);
        
        if (!lastKillStr) return; 

        const lastKill = new Date(lastKillStr);
        
        if (isNaN(lastKill.getTime())) {
            return;
        }

        const mobStub = {"REPOP(s)": repop, "MAX(s)": max};
        const repopData = calculateRepop(mobStub, lastKill);
        const percent = repopData.elapsedPercent || 0; 

        // テキスト要素の更新
        const repopTimeEl = card.querySelector('.repop-time');
        const timeRemainingEl = card.querySelector('.time-remaining'); 

        // リポップ予測時刻の更新
        if (repopTimeEl) {
            const minPopStr = repopData.minRepop instanceof Date ? repopData.minRepop.toLocaleString() : repopData.minRepop;
            repopTimeEl.textContent = minPopStr;
            
            // 色の更新
            repopTimeEl.classList.remove('text-green-400', 'text-red-400', 'text-amber-400', 'font-bold');
            if (repopData.isPop) {
                repopTimeEl.classList.add('text-amber-400', 'font-bold');
            } else if (percent >= 90) {
                repopTimeEl.classList.add('text-red-400');
            } else {
                repopTimeEl.classList.add('text-green-400');
            }
        }
        
        // 残り時間（進捗率）の更新
        if (timeRemainingEl) {
            timeRemainingEl.textContent = `${repopData.timeRemaining} (${percent.toFixed(1)}%)`;
        }
        
        // 討伐報告ボタンの状態を更新 (パフォーマンス改善)
        const reportBtn = card.querySelector('button[data-mobno]');
        if (reportBtn) {
            const currentIsPop = reportBtn.dataset.ispop === 'true';
            
            if (repopData.isPop && !currentIsPop) {
                // POP中になった場合 (報告不可へ)
                reportBtn.disabled = true;
                reportBtn.dataset.ispop = 'true';
                reportBtn.innerHTML = `<span class="text-xs font-bold">POP中</span><span class="text-xs leading-none">(報告不可)</span>`;
                reportBtn.classList.remove('bg-green-600', 'hover:bg-green-500', 'active:bg-green-700');
                reportBtn.classList.add('bg-gray-500', 'cursor-not-allowed');
            } else if (!repopData.isPop && currentIsPop) {
                // POP中でなくなった場合 (報告可能へ)
                reportBtn.disabled = false;
                reportBtn.dataset.ispop = 'false';
                reportBtn.innerHTML = `<span class="text-xs font-bold">討伐</span><span class="text-xs font-bold">報告</span>`;
                reportBtn.classList.remove('bg-gray-500', 'cursor-not-allowed');
                reportBtn.classList.add('bg-green-600', 'hover:bg-green-500', 'active:bg-green-700');
            }
        }
    });
}


/**
 * サイトの初期化処理
 */
function initializeApp() {
    userId = localStorage.getItem('user_uuid');
    if (!userId) {
        userId = crypto.randomUUID();
        localStorage.setItem('user_uuid', userId);
    }

    // --- 防御的チェックとイベントリスナーの設定 ---
    if (rankTabs) {
        rankTabs.querySelectorAll('.tab-btn').forEach(button => {
            button.onclick = (e) => renderMobList(e.currentTarget.dataset.rank);
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
    // ------------------------------------------

    // 初期ロードは同期的に実行
    fetchRecordsAndUpdate(true);

    // 討伐記録の定期更新 (10分ごと)
    setInterval(() => fetchRecordsAndUpdate(false), 10 * 60 * 1000);

    // プログレスバーの定期更新 (60秒ごと)
    setInterval(updateProgressBars, 60 * 1000);
}

document.addEventListener('DOMContentLoaded', initializeApp);
