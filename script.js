// ... (GAS_ENDPOINT, MOB_DATA_URL, baseMobData, globalMobData, currentMobNo, userId, autoUpdateSuccessCount, uuidDisplayEl は変更なし)

// --- グローバル変数 (変更) ---
// rank と area のフィルタリング状態を保持
let currentFilter = {
    rank: 'S', // 初期表示はSランク
    area: 'ALL' // 初期エリアはALL
};

// --- DOMエレメント (変更) ---
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
const areaDropdownToggle = document.getElementById('area-dropdown-toggle');
const areaDropdownMenu = document.getElementById('area-dropdown-menu');
const currentAreaLabel = document.getElementById('current-area-label');


// ... (ユーティリティ関数: unixTimeToDate, formatDurationPart, processText, toJstAdjustedIsoString は変更なし)


/**
 * エラーメッセージを指定エリアに表示/非表示にする
 * 【修正点】: 表示条件 (初回/手動のみ) をここから削除し、呼び出し元で制御
 */
function displayError(message) {
    if (!errorMessageContainer) return;
    
    const baseClasses = ['p-2', 'text-sm', 'font-semibold', 'text-center'];
    const errorClasses = ['bg-red-800', 'text-red-100', 'rounded-lg'];
    const loadingClasses = ['bg-blue-800', 'text-blue-100', 'rounded-lg']; // ロード中は青色に変更
    
    if (message) {
        errorMessageContainer.classList.remove('hidden');
        // メッセージの内容に応じて色を変更 (便宜上、'更新中'なら青、それ以外は赤)
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


// ... (calculateRepop, getMobByNo は変更なし)


// ... (createMobCard は変更なし - Bランクの処理は mob_data.json のデータで自動的に調整されます)


/**
 * フィルターに基づいてモブカードリストをレンダリングする
 * 【修正点】: rank と area の両方でフィルタリング
 */
function renderMobList() {
    
    const { rank, area } = currentFilter;

    // 1. ランクでフィルタリング (Bランクは削除したので、表示対象は S, A, FATE のみ)
    let filteredByRank = globalMobData;
    if (rank !== 'ALL') {
        filteredByRank = globalMobData.filter(mob => mob.Rank === rank);
    }
    
    // 2. エリアでフィルタリング
    const filteredByArea = area === 'ALL'
        ? filteredByRank
        : filteredByRank.filter(mob => mob.Expansion === area); 


    // 3. レンダリング処理 (以前のロジックを維持)
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
    
    // 5. エリアラベルの更新
    if (currentAreaLabel) {
        currentAreaLabel.textContent = area;
    }


    attachEventListeners();
    updateProgressBars();
}

/**
 * イベントリスナーをカードとボタンにアタッチする (省略 - 変更なし)
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


// ... (toggleMobDetails, drawSpawnPoints, toggleCullStatus は変更なし)
// ... (openReportModal, closeReportModal, submitReport は変更なし)
// ... (fetchBaseMobData は変更なし - mob_data.jsonにExpansionデータがあることを前提とします)


/**
 * GASから最新の討伐記録と湧き潰し状態を取得し、グローバルデータを更新する
 * 【修正点】: メッセージ表示条件の制御ロジック
 */
async function fetchRecordsAndUpdate(updateType = 'initial', shouldFetchBase = true) {
    
    // ----------------------------------------------------
    // 1. メッセージ表示制御 (初回/手動時のみ表示)
    // ----------------------------------------------------
    let shouldDisplayLoading = false;
    
    if (updateType === 'initial' || updateType === 'manual') {
        shouldDisplayLoading = true;
    } else if (updateType === 'auto') {
        // 自動更新の場合、成功回数が0回（初回自動更新）の場合のみ表示 (通常は非表示)
        if (autoUpdateSuccessCount === 
// ... (initializeApp, updateProgressBars は変更なし)

// --- サイトの初期化処理 ---
function initializeApp() {
    // 1. UUIDの取得/生成
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
        rankTabs.querySelectorAll('.tab-btn').forEach(button => {
            button.onclick = (e) => {
                currentFilter.rank = e.currentTarget.dataset.rank;
                // ランクが変わったら、エリアは「ALL」にリセットする (操作性の都合)
                currentFilter.area = 'ALL'; 
                renderMobList(); 
                // 画面表示はローカルで完結するため、通信更新は不要
            }
        });
    }

    // エリアドロップダウントグルのリスナー
    if (areaDropdownToggle && areaDropdownMenu) {
        areaDropdownToggle.onclick = () => {
            areaDropdownMenu.classList.toggle('hidden');
        };
    }
    
    // エリアフィルタボタンのリスナー
    document.querySelectorAll('.area-filter-btn').forEach(button => {
        button.onclick = (e) => {
            const newArea = e.currentTarget.dataset.area;
            currentFilter.area = newArea;
            renderMobList(); 
            areaDropdownMenu?.classList.add('hidden');
            // ラベルの更新は renderMobList 内で行われます
        }
    });


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
    // 'auto' タイプで実行 (2回目以降は通信帯を非表示)
    setInterval(() => fetchRecordsAndUpdate('auto', false), 10 * 60 * 1000);

    // プログレスバーの定期更新を 1秒ごと に変更
    setInterval(updateProgressBars, 1000);
}

document.addEventListener('DOMContentLoaded', initializeApp);
