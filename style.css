// Google Apps Script (GAS) のエンドポイントURL
const GAS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxyutpOIZYI9Ce51s4vawk6S460QgM4wYcaLFJKUBi00_LKhNXT9-6N0n178KdoXkP7wg/exec';
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
 * テキストを21文字ごとに強制的に折り返す関数 (既存の // による改行も処理)
 * @param {string} text 処理対象の文字列
 * @returns {string} <br>が挿入された文字列
 */
const forceWrapText = (text) => {
    // 既存の // を <br> に変換
    const initialText = text.replace(/\/\/\s*/g, '<br>');

    // <br>で分割し、各セグメントを21文字で折り返す
    const segments = initialText.split('<br>');
    
    const finalWrappedCondition = segments.map(segment => {
        let segmentResult = '';
        const limit = 21;
        for (let i = 0; i < segment.length; i += limit) {
            if (i > 0) {
                segmentResult += '<br>';
            }
            // 21文字ごとに切り出し
            segmentResult += segment.substring(i, i + limit);
        }
        return segmentResult;
    }).join('<br>'); // セグメント間は <br> で結合

    return finalWrappedCondition;
};

/**
 * 討伐日時からリポップ情報を計算する
 */
function calculateRepop(mob, lastKill) {
    const killTime = (lastKill instanceof Date) ? lastKill : new Date(lastKill);
    
    // lastKillが有効な日時でない場合
    if (!lastKill || isNaN(killTime.getTime())) {
        return {
            minRepop: '未討伐',
            maxRepop: null,
            timeRemaining: 'N/A',
            elapsedPercent: 0
        };
    }
    
    const now = new Date();
    const repopMinMs = mob['REPOP(s)'] * 1000;
    
    if (repopMinMs <= 0) {
        return {
            minRepop: 'N/A',
            maxRepop: null,
            timeRemaining: 'N/A',
            elapsedPercent: 0
        };
    }

    const minRepopTime = new Date(killTime.getTime() + repopMinMs);
    const elapsedMs = now.getTime() - killTime.getTime();
    const remainingMs = minRepopTime.getTime() - now.getTime();
    
    let normalizedElapsedPercent = Math.max(0, Math.min(100, (elapsedMs / repopMinMs) * 100));

    let timeRemainingStr;
    if (remainingMs <= 0) {
        timeRemainingStr = 'POP中';
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
        elapsedPercent: normalizedElapsedPercent
    };
}

/**
 * モブデータに基づいてHTMLカードを生成する
 */
function createMobCard(mob) {
    const lastKillDate = mob.LastKillDate ? new Date(mob.LastKillDate) : null;
    const { minRepop, timeRemaining, elapsedPercent } = calculateRepop(mob, lastKillDate);

    // 進捗バーの色定義
    let colorStart = '#10b981'; // green-500
    let colorEnd = '#34d399';   // green-400
    let timeStatusClass = 'text-green-400';
    let minPopStr = '未討伐';
    let lastKillStr = mob.LastKillDate || '不明'; // 討伐日時がない場合は「不明」

    if (lastKillDate) {
        minPopStr = minRepop instanceof Date ? minRepop.toLocaleString() : minRepop;

        if (timeRemaining === 'POP中') {
            colorStart = '#f59e0b'; // amber-500
            colorEnd = '#fbbf24';   // amber-400
            timeStatusClass = 'text-amber-400 font-bold';
        } else if (elapsedPercent >= 90) {
            colorStart = '#ef4444'; // red-500
            colorEnd = '#f87171';   // red-400
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
    const isPop = timeRemaining === 'POP中';
    const canReport = !isPop || !lastKillDate; 
    
    const reportBtnClass = !canReport ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500 active:bg-green-700 report-btn';
    
    // 討伐報告ボタンの2行表示コンテンツ (「討伐」「報告」ともに text-sm font-bold に統一)
    let reportBtnContent;
    if (!canReport) {
        // POP中の場合 (報告不可)
        reportBtnContent = `<span class="text-sm font-bold">POP中</span><span class="text-xs">(報告不可)</span>`;
    } else {
        // 報告可能な場合
        reportBtnContent = `<span class="text-sm font-bold">討伐</span><span class="text-sm font-bold">報告</span>`;
    }

    // 討伐報告ボタンの全体サイズを調整 (幅 w-14)
    const reportBtnHtml = `
        <button class="${reportBtnClass} text-xs text-white px-1 py-1 rounded-md shadow-md transition h-10 w-14 flex flex-col items-center justify-center leading-none" 
                data-mobno="${mob['No.']}" 
                ${!canReport ? 'disabled' : ''}>
            ${reportBtnContent}
        </button>
    `;
    
    // マップ詳細表示トグルボタン (2行表示、サイズを h-12 に変更)
    const toggleMapBtn = mob.Map ? `
        <button class="toggle-details-btn text-sm font-semibold py-1 px-2 rounded-full bg-gray-600 hover:bg-gray-500 flex flex-col items-center justify-center leading-tight w-auto h-12">
            <span>マップ</span>
            <span>詳細</span>
        </button>
    ` : '';
    
    // 抽選条件の処理: 21文字折り返し処理を追加、Sモブの固定高適用
    let conditionHtml = '';
    if (mob.Condition) {
        // PC (lg:サイズ以上) では折り返し処理を適用しないためのクラス分岐
        // isLgOrGreater() は pure JavaScript ではないため、条件分岐で対応
        
        let displayCondition = '';
        // 現在のウィンドウ幅が Tailwind の 'lg' ブレイクポイント (1024px) 以上かチェック
        if (window.innerWidth >= 1024) {
            // PC版: // のみを <br> に変換し、21文字折り返しは適用しない
            displayCondition = mob.Condition.replace(/\/\/\s*/g, '<br>');
        } else {
            // スマホ版: 21文字で折り返し処理を適用
            displayCondition = forceWrapText(mob.Condition);
        }

        // Sモブの場合は固定高クラス (h-16: 約4行分, overflow-hidden) を適用
        const conditionClass = mob.Rank === 'S' ? 'h-16 overflow-hidden' : 'h-auto';
        
        conditionHtml = `<p class="text-xs text-gray-400 leading-tight ${conditionClass}">${displayCondition}</p>`;
    }
    
    // 抽選条件がない場合、フッターコンテンツを非表示
    const footerContent = conditionHtml || toggleMapBtn ? `
        <div class="mt-3 flex justify-between items-start min-h-[1.5rem]"> 
            ${conditionHtml}
            ${toggleMapBtn}
        </div>
    ` : '';


    return `
        <div class="mob-card bg-gray-800 rounded-xl shadow-2xl overflow-hidden transform hover:scale-[1.01] transition duration-300 relative" 
             data-rank="${mob.Rank}" 
             data-mobno="${mob['No.']}"
             data-lastkill="${mob.LastKillDate || ''}"
             data-minrepop="${mob['REPOP(s)']}"
             data-maxrepop="${mob['MAX(s)']}">

            <div class="repop-bar-bg absolute top-0 left-0 h-1 w-full"
                 style="--progress-percent: ${elapsedPercent.toFixed(1)}%; 
                        --progress-color-start: ${colorStart}; 
                        --progress-color-end: ${colorEnd};">
            </div>

            <div class="p-4 fixed-content">
                <div class="flex justify-between items-start mb-3">
                    <div class="flex items-center space-x-3">
                        <div class="rank-icon ${rankBgClass} ${rankTextColor} font-bold text-sm w-7 h-7 flex items-center justify-center rounded-lg shadow-lg">
                            ${mob.Rank}
                        </div>
                        <div>
                            <h2 class="text-lg font-bold text-outline text-yellow-200 leading-tight">${mob.Name}</h2>
                            <p class="text-xs text-gray-400 leading-tight">${mob.Area}</p>
                        </div>
                    </div>
                    
                    ${reportBtnHtml}
                </div>

                <div class="mt-3 bg-gray-700 p-2 rounded-lg text-xs flex flex-col space-y-1">
                    
                    <div class="flex justify-between items-baseline">
                        <span class="text-gray-300 w-24 flex-shrink-0 text-base">予測POP:</span>
                        <span class="repop-time text-base ${timeStatusClass} font-bold">${minPopStr}</span>
                    </div>
                    
                    <div class="flex justify-between">
                        <span class="text-gray-300 w-24 flex-shrink-0 text-base">残り (%):</span> 
                        <span class="font-mono time-remaining text-base text-white">${timeRemaining} (${elapsedPercent.toFixed(1)}%)</span>
                    </div>

                    <div class="flex justify-between">
                        <span class="text-gray-300 w-24 flex-shrink-0">前回討伐:</span> 
                        <span class="last-kill-date text-white">${lastKillStr}</span>
                    </div>
                </div>

                ${footerContent}
            </div>

            <div class="mob-details border-t border-gray-700 bg-gray-900" 
                 id="details-${mob['No.']}">
                ${mob.Map ? `
                    <div class="relative mt-2 p-2">
                        <img src="./maps/${mob.Map}" alt="${mob.Area} Map" class="w-full h-auto rounded-lg shadow-md map-image" data-area="${mob.Area}">
                        <div class="absolute inset-0 map-overlay" data-area="${mob.Area}">
                            </div>
                    </div>
                ` : '<p class="text-sm text-gray-500 italic p-4">このモブのマップデータはありません。</p>'}
            </div>
        </div>
    `;
}

/**
 * MobNoからモブデータを取得する
 */
function getMobByNo(mobNo) {
    return globalMobData.find(mob => mob['No.'] === mobNo);
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
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('bg-blue-600', 'hover:bg-blue-500');
        btn.classList.add('bg-gray-700', 'hover:bg-gray-600');
        if (btn.dataset.rank === rank) {
            btn.classList.remove('bg-gray-700', 'hover:bg-gray-600');
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
        if (button.dataset.mobno && !button.disabled) {
            button.onclick = (e) => openReportModal(e.currentTarget.dataset.mobno);
        }
    });
    
    // マップ詳細トグルボタン
    document.querySelectorAll('.toggle-details-btn').forEach(button => {
        button.onclick = (e) => toggleMobDetails(e.currentTarget);
        
        // 初期のボタン表示を2行に設定 (DOM生成時にも行われているが念のため)
        if (button.textContent === 'マップ詳細') {
            button.innerHTML = `<span>マップ</span><span>詳細</span>`;
        }
    });
}

/**
 * マップ詳細パネルの表示/非表示を切り替える
 */
function toggleMobDetails(button) {
    const card = button.closest('.mob-card');
    const mobNo = card.dataset.mobno;
    const detailsPanel = document.getElementById(`details-${mobNo}`);
    const mob = getMobByNo(parseInt(mobNo));

    if (detailsPanel.classList.contains('open')) {
        detailsPanel.classList.remove('open');
        // 2行表示に戻す
        button.innerHTML = `<span>マップ</span><span>詳細</span>`;
    } else {
        detailsPanel.classList.add('open');
        // 1行表示に変更
        button.innerHTML = '詳細を隠す';
        
        const mapOverlay = detailsPanel.querySelector('.map-overlay');
        if (mapOverlay && mapOverlay.children.length === 0 && mob.spawn_points) {
            drawSpawnPoints(mapOverlay, mob.spawn_points, mobNo);
        }
    }
}

/**
 * マップにスポーンポイントを描画する
 */
function drawSpawnPoints(overlayEl, spawnPoints, currentMobNo) {
    overlayEl.innerHTML = '';
    
    const mob = getMobByNo(parseInt(currentMobNo));
    
    spawnPoints.forEach(point => {
        const isImportant = point.mob_ranks.includes(mob.Rank); 
        
        const xPercent = point.x;
        const yPercent = point.y;
        
        const pointEl = document.createElement('div');
        pointEl.className = 'spawn-point';
        pointEl.setAttribute('data-id', point.id);
        pointEl.setAttribute('data-important', isImportant ? 'true' : 'false');
        
        if (isImportant && mob.Rank === 'S') {
            pointEl.classList.add('important-ring');
            pointEl.style.boxShadow = '0 0 0 4px #f59e0b'; // amber-500 ring
            pointEl.style.filter = 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.8))';
        } else if (isImportant && mob.Rank === 'A') {
            pointEl.style.backgroundColor = '#3b82f6'; // blue-500
        } else {
            pointEl.style.backgroundColor = '#9ca3af'; // gray-400
            pointEl.style.opacity = '0.4';
        }

        pointEl.style.left = `${xPercent}%`;
        pointEl.style.top = `${yPercent}%`;
        
        if (isImportant) {
            pointEl.onclick = () => {
                alert(`ポイント [${point.id}] をクリックしました。湧き潰し機能は未実装です。`);
            };
        }
        
        overlayEl.appendChild(pointEl);
    });
}

// --- モーダル/フォーム操作 ---

/**
 * 討伐報告モーダルを開く
 */
function openReportModal(mobNo) {
    currentMobNo = parseInt(mobNo);
    const mob = getMobByNo(currentMobNo);
    
    if (!mob) return;

    modalMobName.textContent = mob.Name;
    reportMemoInput.value = '';
    reportStatusEl.textContent = '';
    reportStatusEl.classList.add('hidden');

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
    reportModal.classList.add('hidden');
    reportModal.classList.remove('flex');
    currentMobNo = null;
}

/**
 * 討伐報告をGASに送信する
 */
async function submitReport() {
    if (!currentMobNo) return;

    const killTime = reportDatetimeInput.value;
    const memo = reportMemoInput.value;
    const mob = getMobByNo(currentMobNo);

    if (!killTime) {
        alert('討伐日時を入力してください。');
        return;
    }

    submitReportBtn.disabled = true;
    submitReportBtn.textContent = '送信中...';
    reportStatusEl.classList.remove('hidden');
    reportStatusEl.classList.remove('text-green-500', 'text-red-500');
    reportStatusEl.textContent = 'サーバーに送信中...';
    
    const killDate = new Date(killTime); 

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
                killTime: killDate.toISOString(), 
                memo: memo,
                reporterId: userId 
            })
        });

        const result = await response.json();

        if (result.status === 'success') {
            reportStatusEl.textContent = `報告成功！ (${result.message})`;
            reportStatusEl.classList.add('text-green-500');
            // データ取得と更新
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

// --- データ取得/更新 ---

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
            baseMobData = jsonData.mobConfig;
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
 * GASから最新の討伐記録を取得し、グローバルデータを更新する 
 */
async function fetchRecordsAndUpdate(shouldFetchBase = true) {
    if (shouldFetchBase) {
        await fetchBaseMobData();
    }
    
    if (baseMobData.length === 0) {
        console.warn('Base mob data is empty, skipping record update.');
        renderMobList(currentFilter);
        return;
    }

    try {
        const response = await fetch(GAS_ENDPOINT + '?action=getRecords');
        const data = await response.json();
        
        if (data.status === 'success') {
            const records = data.records;
            
            globalMobData = baseMobData.map(mob => {
                const record = records.find(r => r['No.'] === mob['No.']);
                const newMob = { ...mob }; 
                
                // 討伐日時を記録する新しいフィールド 'LastKillDate' を設定
                if (record && record.POP_Date_Unix) {
                    newMob.LastKillDate = unixTimeToDate(record.POP_Date_Unix).toLocaleString();
                } else {
                    newMob.LastKillDate = ''; 
                }
                
                // mob_data.jsonのConditionフィールドをそのまま使用
                newMob.Condition = mob.Condition || '';

                return newMob;
            });
            console.log('Kill records merged successfully.');

            renderMobList(currentFilter);
        } else {
            console.error('GASからのデータ取得失敗:', data.message);
            globalMobData = baseMobData;
            renderMobList(currentFilter);
        }
    } catch (error) {
        console.error('GAS通信エラー:', error);
        globalMobData = baseMobData;
        renderMobList(currentFilter);
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
        
        // 討伐日時がない場合は更新しない 
        if (!lastKillStr) return; 

        const lastKill = new Date(lastKillStr);
        
        if (isNaN(lastKill.getTime())) {
            // LastKillDateが '不明' などの場合は計算をスキップ
            return;
        }

        const mobStub = {"REPOP(s)": repop, "MAX(s)": max};
        const repopData = calculateRepop(mobStub, lastKill);
        const percent = repopData.elapsedPercent || 0; 

        // 進捗バーのCSS変数を更新
        const repopBarBg = card.querySelector('.repop-bar-bg');
        if (repopBarBg) {
            repopBarBg.style.setProperty('--progress-percent', `${percent.toFixed(1)}%`);
        }
        
        // テキスト要素の更新
        const repopTimeEl = card.querySelector('.repop-time');
        const timeRemainingEl = card.querySelector('.time-remaining'); 

        if (repopTimeEl) {
            const minPopStr = repopData.minRepop instanceof Date ? repopData.minRepop.toLocaleString() : repopData.minRepop;
            repopTimeEl.textContent = minPopStr;
            
            // 色の更新
            if (repopData.timeRemaining === 'POP中') {
                repopTimeEl.classList.remove('text-green-400', 'text-red-400');
                repopTimeEl.classList.add('text-amber-400', 'font-bold');
            } else if (percent >= 90) {
                repopTimeEl.classList.remove('text-green-400', 'text-amber-400', 'font-bold');
                repopTimeEl.classList.add('text-red-400');
            } else {
                repopTimeEl.classList.remove('text-amber-400', 'text-red-400', 'font-bold');
                repopTimeEl.classList.add('text-green-400');
            }
        }
        
        // 残り時間 (%) を 残り (%) に修正
        if (timeRemainingEl) {
            timeRemainingEl.textContent = `${repopData.timeRemaining} (${percent.toFixed(1)}%)`;
        }
        
        // 討伐報告ボタンの状態を更新 (文字サイズ修正を適用)
        const reportBtn = card.querySelector('.report-btn');
        if (repopData.timeRemaining === 'POP中') {
            if (reportBtn) {
                reportBtn.disabled = true;
                reportBtn.innerHTML = `<span class="text-sm font-bold">POP中</span><span class="text-xs">(報告不可)</span>`;
                reportBtn.classList.remove('bg-green-600', 'hover:bg-green-500', 'active:bg-green-700');
                reportBtn.classList.add('bg-gray-500', 'cursor-not-allowed');
            }
        } else {
            if (reportBtn) {
                reportBtn.disabled = false;
                // 「報告」の文字サイズを「討伐」と同じ text-sm font-bold に統一
                reportBtn.innerHTML = `<span class="text-sm font-bold">討伐</span><span class="text-sm font-bold">報告</span>`;
                reportBtn.classList.remove('bg-gray-500', 'cursor-not-allowed');
                reportBtn.classList.add('bg-green-600', 'hover:bg-green-500', 'active:bg-green-700');
            }
        }
        
        // マップ詳細ボタンの更新 (POP中から復帰時など)
        const toggleBtn = card.querySelector('.toggle-details-btn');
        const detailsPanel = card.querySelector('.mob-details');
        if (toggleBtn) {
             if (detailsPanel && detailsPanel.classList.contains('open')) {
                toggleBtn.innerHTML = '詳細を隠す';
            } else {
                toggleBtn.innerHTML = `<span>マップ</span><span>詳細</span>`;
            }
        }
    });
    
    // **画面サイズ変更時の再レンダリング**
    // 画面サイズが変わったときに、抽選条件の表示（折り返しの有無）を再計算するために再レンダリングする
    const currentWindowWidth = window.innerWidth;
    const isLg = currentWindowWidth >= 1024; // Tailwind の lg ブレイクポイント

    if (updateProgressBars.lastIsLg !== isLg) {
        updateProgressBars.lastIsLg = isLg;
        // 画面幅が変わった場合のみ、表示を更新
        renderMobList(currentFilter);
    }
}
updateProgressBars.lastIsLg = window.innerWidth >= 1024; // 初期値設定

/**
 * サイトの初期化処理
 */
function initializeApp() {
    userId = localStorage.getItem('user_uuid');
    if (!userId) {
        userId = crypto.randomUUID();
        localStorage.setItem('user_uuid', userId);
    }

    rankTabs.querySelectorAll('.tab-btn').forEach(button => {
        button.onclick = (e) => renderMobList(e.currentTarget.dataset.rank);
    });
    cancelReportBtn.onclick = closeReportModal;
    submitReportBtn.onclick = submitReport;

    reportModal.addEventListener('click', (e) => {
        if (e.target.id === 'report-modal') {
            closeReportModal();
        }
    });
    
    fetchRecordsAndUpdate(true);

    // 画面サイズ変更時にも進捗バーを更新（折り返し対応のため）
    window.addEventListener('resize', updateProgressBars);

    setInterval(() => fetchRecordsAndUpdate(false), 10 * 60 * 1000);

    setInterval(updateProgressBars, 60 * 1000);
}

document.addEventListener('DOMContentLoaded', initializeApp);
