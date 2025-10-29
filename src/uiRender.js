import { calculateRepop, findNextSpawnTime, formatDuration, formatDurationHM, formatLastKillTime, debounce, getEorzeaTime } from "./cal.js";
import { drawSpawnPoint, isCulled, isActuallyCulled } from "./location.js"; 
import { getState, RANK_COLORS, PROGRESS_CLASSES, FILTER_TO_DATA_RANK_MAP } from "./dataManager.js";
import { renderRankTabs, renderAreaFilterPanel, updateFilterUI, filterMobsByRankAndArea } from "./filterUI.js";
import { submitReport } from "./server.js"; 
import { openReportModal } from "./modal.js"; 


const DOM = {
    masterContainer: document.getElementById('master-mob-container'),
    colContainer: document.getElementById('column-container'),
    cols: [document.getElementById('column-1'), document.getElementById('column-2'), document.getElementById('column-3')],
    rankTabs: document.getElementById('rank-tabs'),
    areaFilterWrapper: document.getElementById('area-filter-wrapper'),
    areaFilterPanel: document.getElementById('area-filter-panel'),
    statusMessage: document.getElementById('status-message'),
    reportModal: document.getElementById('report-modal'),
    reportForm: document.getElementById('report-form'),
    modalMobName: document.getElementById('modal-mob-name'),
    modalStatus: document.getElementById('modal-status'),
    modalTimeInput: document.getElementById('report-datetime'),
    modalMemoInput: document.getElementById('report-memo'),
};

function updateEorzeaTime() {
    const et = getEorzeaTime();
    const el = document.getElementById("eorzea-time");
    if (el) {
        el.textContent = `ET ${et.hours}:${et.minutes}`;
    }
}
updateEorzeaTime();
setInterval(updateEorzeaTime, 3000);

function displayStatus(message, type = "info") {
    const el = document.getElementById("status-message");
    if (!el) return;

    const typeClasses = {
        'success': 'bg-green-600',
        'error': 'bg-red-600', // エラー時
        'warning': 'bg-yellow-600',// 警告時
        'info': 'bg-blue-600' // 情報表示
    };

    Object.values(typeClasses).forEach(cls => el.classList.remove(cls));

    el.textContent = message;
    el.classList.add(typeClasses[type] || typeClasses['info']);

    setTimeout(() => {
        el.textContent = "";
        Object.values(typeClasses).forEach(cls => el.classList.remove(cls));
    }, 5000);
}

function processText(text) {
    if (typeof text !== "string" || !text) return "";
    return text.replace(/\/\//g, "<br>");
}

function createMobCard(mob) {
	const rank = mob.Rank;
	const rankConfig = RANK_COLORS[rank] || RANK_COLORS.A;
	const rankLabel = rankConfig.label || rank;

	const isExpandable = rank === "S";
	const { openMobCardNo } = getState();
	const isOpen = isExpandable && mob.No === openMobCardNo;

	let isLastOne = false;
	let validSpawnPoints = [];

	if (mob.Map && mob.spawn_points) {
		// ラストワン判定は純粋な湧き潰し状態だけで判定
		validSpawnPoints = (mob.spawn_points ?? []).filter(point => {
			const pointStatus = mob.spawn_cull_status?.[point.id];
			return !isActuallyCulled(pointStatus);
		});
		isLastOne = validSpawnPoints.length === 1;
	}

	const isS_LastOne = rank === "S" && isLastOne;

	const spawnPointsHtml = (rank === "S" && mob.Map)
		? (mob.spawn_points ?? []).map(point => drawSpawnPoint(
			point,
			mob.spawn_cull_status,
			mob.No,
			point.mob_ranks.includes("B2") ? "B2"
				: point.mob_ranks.includes("B1") ? "B1"
					: point.mob_ranks[0],
			isLastOne && point.id === validSpawnPoints[0]?.id,
			isS_LastOne
		)).join("")
		: "";

    const cardHeaderHTML = `
<div class="px-2 py-1 space-y-1 bg-gray-800/70" data-toggle="card-header">
    <!-- 上段：ランク・モブ名・報告ボタン -->
    <div class="grid grid-cols-[auto_1fr_auto] items-center w-full gap-2">
        <!-- 左：ランク -->
        <span
            class="w-6 h-6 flex items-center justify-center rounded-full text-white text-xs font-bold ${rankConfig.bg}">
            ${rankLabel}
        </span>

        <!-- 中央：モブ名＋エリア名 -->
        <div class="flex flex-col min-w-0">
            <span class="text-base font-bold truncate">${mob.Name}</span>
            <span class="text-xs text-gray-400 truncate">${mob.Area} (${mob.Expansion})</span>
        </div>

        <!-- 右端：報告ボタン（見た目は統一、動作だけ分岐） -->
        <div class="flex-shrink-0 flex items-center justify-end">
            <button data-report-type="${rank === 'A' || rank === 'F' ? 'instant' : 'modal'}" data-mob-no="${mob.No}"
                class="w-8 h-8 flex items-center justify-center text-[12px] rounded bg-green-600 hover:bg-green-800 selected:bg-green-400 
               text-white font-semibold transition text-center leading-tight whitespace-pre-line">報告<br>する</button>
        </div>
    </div>

    <!-- 下段：プログレスバー（構造のみ） -->
    <div class="progress-bar-wrapper h-5 rounded-lg relative overflow-hidden transition-all duration-100 ease-linear">
        <div class="progress-bar-bg absolute left-0 top-0 h-full rounded-full transition-all duration-100 ease-linear"
            style="width: 0%"></div>
        <div class="progress-text absolute inset-0 flex items-center justify-center text-sm font-semibold"
            style="line-height: 1;"></div>
    </div>
</div>
    `;

    const expandablePanelHTML = isExpandable ? `
    <div class="expandable-panel bg-gray-800/70 ${isOpen ? 'open' : ''}">
        <div class="px-2 py-0 text-sm space-y-0.5">
            <div class="flex justify-between items-start flex-wrap">
                <div class="w-full text-right text-xs text-gray-400 pt-1" data-last-kill></div>
                <div class="w-full text-left text-sm text-gray-300 mb-2">Memo: <span data-last-memo></span></div>
                <div class="w-full font-semibold text-yellow-300 border-t border-gray-600">抽選条件</div>
                <div class="w-full text-gray-300 mb-2">${processText(mob.Condition)}</div>
            </div>
            ${mob.Map && rank === 'S' ? `
            <div class="map-content py-0.5 flex justify-center relative">
                <img src="./maps/${mob.Map}" alt="${mob.Area} Map"
                    class="mob-crush-map w-full h-auto rounded shadow-lg border border-gray-600" data-mob-no="${mob.No}">
                <div class="map-overlay absolute inset-0" data-mob-no="${mob.No}">${spawnPointsHtml}</div>
            </div>
            ` : ''}
        </div>
    </div>
    ` : '';

    return `
    <div class="mob-card bg-gray-700 rounded-lg shadow-xl overflow-hidden cursor-pointer border border-gray-700 
transition duration-150" data-mob-no="${mob.No}" data-rank="${rank}">${cardHeaderHTML}${expandablePanelHTML}</div>
    `;
}

function filterAndRender({ isInitialLoad = false } = {}) {
	const state = getState();
	const filtered = filterMobsByRankAndArea(state.mobs);

	filtered.sort((a, b) => a.No - b.No);

	const frag = document.createDocumentFragment();
	filtered.forEach(mob => {
		const temp = document.createElement("div");
		temp.innerHTML = createMobCard(mob);
		const card = temp.firstElementChild;
		frag.appendChild(card);

		updateProgressText(card, mob);
		updateProgressBar(card, mob);
		updateExpandablePanel(card, mob);
	});

	DOM.masterContainer.innerHTML = "";
	DOM.masterContainer.appendChild(frag);
	distributeCards();
    // 💡 イベントリスナーの設定を呼び出し
    setupReportListeners(); 

	if (isInitialLoad) {
		updateProgressBars();
	}
}

// 💡 報告ボタンクリック時の処理
async function handleReportButtonClick(event) {
    const button = event.currentTarget;
    const reportType = button.getAttribute('data-report-type');
    const mobNo = parseInt(button.getAttribute('data-mob-no'), 10);
    const state = getState();
    const mob = state.mobs.find(m => m.No === mobNo);

    if (!mob) {
        displayStatus("モブデータが見つかりません。", "error");
        return;
    }

    if (reportType === 'instant') {
        // Aモブ即時報告の場合
        // timeISOとmemoを空文字で渡すことで、server.jsのsubmitReport内でサーバー時刻がフォールバックされる
        await submitReport(mobNo, "", ""); 
    } else if (reportType === 'modal') {
        // S/Fモブモーダル報告の場合
        // openReportModal は modal.js に定義されている想定
        if (typeof openReportModal === 'function') {
             openReportModal(mobNo);
        } else {
             displayStatus("モーダル機能が読み込まれていません。", "error");
        }
    }
}

// 💡 報告ボタンイベントリスナーの設定
function setupReportListeners() {
    // ページ全体で報告ボタンを検索
    const reportButtons = document.querySelectorAll('button[data-report-type]');
    reportButtons.forEach(button => {
        // 複数回登録を防ぐために、一度削除してから登録
        button.removeEventListener('click', handleReportButtonClick);
        button.addEventListener('click', handleReportButtonClick);
    });
}

function distributeCards() {
    const width = window.innerWidth;
    const md = 768;
    const lg = 1024;
    let cols = 1;
    if (width >= lg) {
        cols = 3;
        DOM.cols[2].classList.remove("hidden");
    } else if (width >= md) {
        cols = 2;
        DOM.cols[2].classList.add("hidden");
    } else {
        cols = 1;
        DOM.cols[2].classList.add("hidden");
    }

    DOM.cols.forEach(col => (col.innerHTML = ""));
    const cards = Array.from(DOM.masterContainer.children);
    cards.forEach((card, idx) => {
        const target = idx % cols;
        DOM.cols[target].appendChild(card);
    });
}

function updateProgressBar(card, mob) {
    const bar = card.querySelector(".progress-bar-bg");
    const wrapper = bar?.parentElement;
    const text = card.querySelector(".progress-text");
    if (!bar || !wrapper || !text) return;

    const { elapsedPercent, status } = mob.repopInfo;

    bar.style.transition = "width linear 60s";
    bar.style.width = `${elapsedPercent}%`;

    bar.classList.remove(PROGRESS_CLASSES.P0_60, PROGRESS_CLASSES.P60_80, PROGRESS_CLASSES.P80_100);
    text.classList.remove(PROGRESS_CLASSES.TEXT_NEXT, PROGRESS_CLASSES.TEXT_POP);
    wrapper.classList.remove(PROGRESS_CLASSES.MAX_OVER_BLINK);

    if (status === "PopWindow") {
        if (elapsedPercent <= 60) bar.classList.add(PROGRESS_CLASSES.P0_60); else if (elapsedPercent <= 80)
            bar.classList.add(PROGRESS_CLASSES.P60_80); else bar.classList.add(PROGRESS_CLASSES.P80_100);
        text.classList.add(PROGRESS_CLASSES.TEXT_POP);
    } else if (status === "MaxOver") {
        bar.classList.add(PROGRESS_CLASSES.P80_100); text.classList.add(PROGRESS_CLASSES.TEXT_POP);
        wrapper.classList.add(PROGRESS_CLASSES.MAX_OVER_BLINK);
    } else { text.classList.add(PROGRESS_CLASSES.TEXT_NEXT); }
}

function updateProgressText(card, mob) {
    const text = card.querySelector(".progress-text");
    if (!text) return;

    const { elapsedPercent, nextMinRepopDate, nextConditionSpawnDate, minRepop, maxRepop, status } = mob.repopInfo;

    const absFmt = {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Tokyo'
    };
    const inTimeStr = nextMinRepopDate
        ? new Intl.DateTimeFormat('ja-JP', absFmt).format(nextMinRepopDate)
        : "未確定";
    const nextTimeStr = nextConditionSpawnDate
        ? new Intl.DateTimeFormat('ja-JP', absFmt).format(nextConditionSpawnDate)
        : null;
    let rightStr = "";
    const nowSec = Date.now() / 1000;
    if (status === "Maintenance" || status === "Next") {
        rightStr = `Next ${formatDurationHM(minRepop - nowSec)}`;
    } else if (status === "PopWindow") {
        rightStr = `残り ${formatDurationHM(maxRepop - nowSec)}`;
    } else if (status === "MaxOver") {
        rightStr = `Over (100%)`;
    } else {
        rightStr = `未確定`;
    }
    // 左側に in と Next の両方を置き、Next は初期非表示
    text.innerHTML = `
    <div class="w-full grid grid-cols-2 items-center text-sm font-semibold" style="line-height:1;">
        <div class="pl-2 text-left toggle-container">
          <span class="label-in">in ${inTimeStr}</span>
          <span class="label-next" style="display:none;">${nextTimeStr ? `Next ${nextTimeStr}` : ""}</span>
        </div>
        <div class="pr-1 text-right">
          ${rightStr}${status !== "MaxOver" && status !== "Unknown" ? ` (${elapsedPercent.toFixed(0)}%)` : ""}
        </div>
    </div>
  `;

    // 初回のみ切り替え処理を開始
    const toggleContainer = text.querySelector(".toggle-container");
    if (toggleContainer && !toggleContainer.dataset.toggleStarted) {
        startToggleInNext(toggleContainer);
        toggleContainer.dataset.toggleStarted = "true";
    }
}
function startToggleInNext(container) {
    const inLabel = container.querySelector(".label-in");
    const nextLabel = container.querySelector(".label-next");
    let showingIn = true;

    setInterval(() => {
        if (nextLabel.textContent.trim() === "") return; // Next が無い場合は切り替え不要

        if (showingIn) {
            inLabel.style.display = "none";
            nextLabel.style.display = "inline";
        } else {
            inLabel.style.display = "inline";
            nextLabel.style.display = "none";
        }
        showingIn = !showingIn;
    }, 5000);
}

function updateExpandablePanel(card, mob) {
    const elNext = card.querySelector("[data-next-time]");
    const elLast = card.querySelector("[data-last-kill]");
    const elMemo = card.querySelector("[data-last-memo]");
    if (!elNext && !elLast && !elMemo) return;

    const absFmt = { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tokyo' };

    const nextMin = mob.repopInfo?.nextMinRepopDate;
    const conditionTime = findNextSpawnTime(mob);
    const displayTime = (nextMin && conditionTime)
        ? (conditionTime > nextMin ? conditionTime : nextMin)
        : (nextMin || conditionTime);

    const nextStr = displayTime
        ? new Intl.DateTimeFormat('ja-JP', absFmt).format(displayTime)
        : "未確定";

    const lastStr = formatLastKillTime(mob.last_kill_time);
    const memoStr = mob.last_kill_memo || "なし";

    if (elLast) elLast.textContent = `前回: ${lastStr}`;
    if (elMemo) elMemo.textContent = memoStr;
}

function updateProgressBars() {
    const state = getState();
    state.mobs.forEach((mob) => {
        const card = document.querySelector(`.mob-card[data-mob-no="${mob.No}"]`);
        if (card) {
            updateProgressText(card, mob);
            updateProgressBar(card, mob);
        }
    });
}

const sortAndRedistribute = debounce(() => filterAndRender(), 200);
const areaPanel = document.getElementById("area-filter-panel");

// 討伐報告受信ハンドラ
function onKillReportReceived(mobId, kill_time) {
	const mob = getState().mobs.find(m => m.No === mobId);
	if (!mob) return;

	mob.last_kill_time = Number(kill_time);
	mob.repopInfo = calculateRepop(mob);
	// 即時更新
	const card = document.querySelector(`.mob-card[data-mob-no="${mob.No}"]`);
	if (card) {
		updateProgressText(card, mob);
		updateProgressBar(card, mob);
	}
	if (mob.Rank === "S" || mob.Rank === "A") {
		filterAndRender(); 
	}
}

// 定期ループ（60秒ごとに全カードを更新）
setInterval(() => {
    updateProgressBars();
}, 60000);

export {
    filterAndRender, distributeCards, updateProgressText, updateProgressBar, createMobCard, displayStatus, DOM,
    renderAreaFilterPanel, renderRankTabs, sortAndRedistribute, updateFilterUI, onKillReportReceived, updateProgressBars, setupReportListeners
};
