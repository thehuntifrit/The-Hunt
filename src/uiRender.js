
// uiRender.js

import { calculateRepop, findNextSpawnTime, formatDuration, formatLastKillTime } from "./cal.js";
import { drawSpawnPoint } from "./location.js";
import { getState, setFilter, RANK_COLORS, PROGRESS_CLASSES, EXPANSION_MAP, FILTER_TO_DATA_RANK_MAP } from "./dataManager.js";
import { debounce } from "./cal.js"; 

// DOM 定義 (仕様に基づき、uiRender.jsの責務として組み込む)
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
  modalMemoInput: document.getElementById('report-memo')
};

function displayStatus(message, type = "info") {
  const el = document.getElementById("status-message");
  if (!el) return;
  el.textContent = message;
  el.className = `status ${type}`;
  setTimeout(() => { el.textContent = ""; }, 5000);
}

function processText(text) {
  if (typeof text !== "string" || !text) return "";
  return text.replace(/\/\//g, "<br>");
}

// createMobCard
function createMobCard(mob) {
  const rank = mob.Rank;
  const rankConfig = RANK_COLORS[rank] || RANK_COLORS.A;
  const rankLabel = rankConfig.label || rank;

  const isExpandable = rank === "S";
  const { openMobCardNo } = getState();
  const isOpen = isExpandable && mob.No === openMobCardNo;

  const isS_LastOne = rank === "S" && mob.spawn_points && mob.spawn_points.some(
    p => p.is_last_one && (p.mob_ranks.includes("S") || p.mob_ranks.includes("A"))
  );

  const spawnPointsHtml = (rank === "S" && mob.Map)
    ? (mob.spawn_points ?? []).map(point => drawSpawnPoint(
        point,
        mob.spawn_cull_status,
        mob.No,
        mob.Rank,
        point.is_last_one,
        isS_LastOne,
        mob.last_kill_time,
        mob.prev_kill_time
      )).join("")
    : "";

  const cardHeaderHTML = `
<div class="px-2 py-1 space-y-1 bg-gray-800/70" data-toggle="card-header">
  <!-- 上段：ランク・モブ名・報告ボタン -->
  <div class="grid grid-cols-[auto_1fr_auto] items-center w-full gap-2">
    <!-- 左：ランク -->
    <span class="w-6 h-6 flex items-center justify-center rounded-full text-white text-xs font-bold ${rankConfig.bg}">
      ${rankLabel}
    </span>

    <!-- 中央：モブ名＋エリア名 -->
    <div class="flex flex-col min-w-0">
      <span class="text-base font-bold truncate">${mob.Name}</span>
      <span class="text-xs text-gray-400 truncate">${mob.Area} (${mob.Expansion})</span>
    </div>

    <!-- 右端：報告ボタン（見た目は統一、動作だけ分岐） -->
    <div class="flex-shrink-0 flex items-center justify-end">
      <button 
        data-report-type="${rank === 'A' || rank === 'F' ? 'instant' : 'modal'}" 
        data-mob-no="${mob.No}"
        class="w-8 h-8 flex items-center justify-center text-[12px] rounded 
               bg-green-600 hover:bg-green-800 selected:bg-green-400 
               text-white font-semibold transition text-center leading-tight whitespace-pre-line">
        報告<br>する
      </button>
    </div>
  </div>
  
  <!-- 下段：プログレスバー（構造のみ） -->
  <div class="progress-bar-wrapper h-6 rounded-full relative overflow-hidden transition-all duration-100 ease-linear">
    <div class="progress-bar-bg absolute left-0 top-0 h-full rounded-full transition-all duration-100 ease-linear" style="width: 0%"></div>
    <div class="progress-text absolute inset-0 text-sm font-semibold" style="line-height: 1;"></div>
  </div>
</div>
`;

  const expandablePanelHTML = isExpandable ? `
<div class="expandable-panel ${isOpen ? 'open' : ''}">
  <div class="px-1 py-1 text-sm space-y-0.5">
    <div class="flex justify-between items-start flex-wrap">
      <div class="w-full text-right text-sm font-mono text-green-300" data-next-time></div>
      <div class="w-full text-right text-xs text-gray-400 pt-1" data-last-kill></div>
      <div class="w-full text-left text-sm text-gray-300 mb-2">Memo: <span data-last-memo></span></div>
      <div class="w-full font-semibold text-yellow-300 border-t border-gray-600">抽出条件</div>
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
<div class="mob-card bg-gray-700 rounded-lg shadow-xl overflow-hidden cursor-pointer border border-gray-700 transition duration-150"
     data-mob-no="${mob.No}" data-rank="${rank}">
  ${cardHeaderHTML}
  ${expandablePanelHTML}
</div>
`;
}

// filterAndRender
function filterAndRender({ isInitialLoad = false } = {}) {
    const state = getState();
    const uiRank = state.filter.rank;
    const dataRank = FILTER_TO_DATA_RANK_MAP[uiRank] || uiRank;
    const areaSets = state.filter.areaSets; // ランクごとのエリア選択を保持している想定
    
    const filtered = state.mobs.filter(mob => {
        // --- ALL の場合 ---
        if (dataRank === "ALL") {
            // mob のランクに対応するエリアセットを取得
            const mobRank = mob.Rank.startsWith("B")
                ? (mob.Rank.includes("A") ? "A" : "F") // B系はA/Fに寄せる
                : mob.Rank;
            if (!["S", "A", "F"].includes(mobRank)) return false;

            const areaSetForRank = areaSets[mobRank];
            const mobExpansion = mob.Rank.startsWith("B")
                ? state.mobs.find(m => m.No === mob.related_mob_no)?.Expansion || mob.Expansion
                : mob.Expansion;

            // そのランクでエリア選択が無ければ表示対象
            if (!areaSetForRank || !(areaSetForRank instanceof Set) || areaSetForRank.size === 0) {
                return true;
            }
            // 選択されているエリアに含まれていれば表示
            return areaSetForRank.has(mobExpansion);
        }

        // --- A/F/S 単独ランクの場合 ---
        if (dataRank === "A") {
            if (mob.Rank !== "A" && !mob.Rank.startsWith("B")) return false;
        } else if (dataRank === "F") {
            if (mob.Rank !== "F" && !mob.Rank.startsWith("B")) return false;
        } else if (mob.Rank !== dataRank) {
            return false;
        }

        const mobExpansion = mob.Rank.startsWith("B")
            ? state.mobs.find(m => m.No === mob.related_mob_no)?.Expansion || mob.Expansion
            : mob.Expansion;

        const areaSet = areaSets[uiRank];
        if (!areaSet || !(areaSet instanceof Set) || areaSet.size === 0) return true;
        return areaSet.has(mobExpansion);
    });

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
    updateFilterUI();

    if (isInitialLoad) {
        updateProgressBars();
    }
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

// updateProgressBars
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
    if (elapsedPercent <= 60) bar.classList.add(PROGRESS_CLASSES.P0_60);
    else if (elapsedPercent <= 80) bar.classList.add(PROGRESS_CLASSES.P60_80);
    else bar.classList.add(PROGRESS_CLASSES.P80_100);
    text.classList.add(PROGRESS_CLASSES.TEXT_POP);
  } else if (status === "MaxOver") {
    bar.classList.add(PROGRESS_CLASSES.P80_100);
    text.classList.add(PROGRESS_CLASSES.TEXT_POP);
    wrapper.classList.add(PROGRESS_CLASSES.MAX_OVER_BLINK);
  } else {
    text.classList.add(PROGRESS_CLASSES.TEXT_NEXT);
  }
}

function updateProgressText(card, mob) {
  const text = card.querySelector(".progress-text");
  if (!text) return;

  const { elapsedPercent, nextMinRepopDate, maxRepop } = mob.repopInfo;
  const conditionTime = findNextSpawnTime(mob);
  const displayTime = (nextMinRepopDate && conditionTime)
    ? (conditionTime > nextMinRepopDate ? conditionTime : nextMinRepopDate)
    : (nextMinRepopDate || conditionTime);

  const absFmt = { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tokyo' };
  const nextTimeStr = displayTime
    ? new Intl.DateTimeFormat('ja-JP', absFmt).format(displayTime)
    : "未確定";

  const remainingStr = maxRepop
    ? `残り ${formatDuration(maxRepop - Date.now() / 1000)}`
    : "";

  // 3カラム：左=残り、中央=次回、右=%
  text.innerHTML = `
    <div class="w-full grid grid-cols-2 items-center text-sm font-semibold" style="line-height:1;">
      <div class="pl-2 text-left">${remainingStr} ( ${elapsedPercent.toFixed(0)}% )</div>
      <div class="pr-2 text-right">Next: ${nextTimeStr}</div>
    </div>
  `;
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

  if (elNext) elNext.textContent = `次回: ${nextStr}`;
  if (elLast) elLast.textContent = `前回: ${lastStr}`;
  if (elMemo) elMemo.textContent = memoStr;
}

const renderRankTabs = () => {
    const state = getState();
    const rankList = ["ALL", "S", "A", "FATE"];
    const container = document.getElementById("rank-tabs"); // DOM.rankTabs を使用すべきだが、元のコードを維持
    if (!container) return;
    container.innerHTML = "";

    // グリッドレイアウト適用
    container.className = "grid grid-cols-4 gap-2";

    rankList.forEach(rank => {
        const isSelected = state.filter.rank === rank;
        const btn = document.createElement("button");
        btn.dataset.rank = rank;
        btn.textContent = rank;
        btn.className = `tab-button px-4 py-1.5 text-sm rounded font-semibold text-white text-center transition ${isSelected ? "bg-green-500" : "bg-gray-500 hover:bg-gray-400"
            }`;
        container.appendChild(btn);
    });
};

const renderAreaFilterPanel = () => {
  const state = getState();
  const uiRank = state.filter.rank;
  const dataRank = FILTER_TO_DATA_RANK_MAP[uiRank] || uiRank;

  const areas = state.mobs
    .filter(m => (dataRank === "A" || dataRank === "F") ? (m.Rank === dataRank || m.Rank.startsWith("B")) : (m.Rank === dataRank))
    .reduce((set, m) => {
      const mobExpansion = m.Rank.startsWith("B")
        ? state.mobs.find(x => x.No === m.related_mob_no)?.Expansion || m.Expansion
        : m.Expansion;
      if (mobExpansion) set.add(mobExpansion);
      return set;
    }, new Set());

  const currentSet = state.filter.areaSets[uiRank] instanceof Set ? state.filter.areaSets[uiRank] : new Set();
  const isAllSelected = areas.size > 0 && currentSet.size === areas.size;

  const sortedAreas = Array.from(areas).sort((a, b) => {
    const indexA = Object.values(EXPANSION_MAP).indexOf(a);
    const indexB = Object.values(EXPANSION_MAP).indexOf(b);
    return indexB - indexA;
  });

  // 📱 スマホ用：横いっぱい2列
  const mobilePanel = document.getElementById("area-filter-panel-mobile");
  mobilePanel.innerHTML = "";
  mobilePanel.className = "grid grid-cols-2 gap-2";

  const allBtnMobile = document.createElement("button");
  allBtnMobile.textContent = isAllSelected ? "全解除" : "全選択";
  allBtnMobile.className = `area-filter-btn py-1 text-xs rounded font-semibold text-white text-center transition w-full ${isAllSelected ? "bg-red-500" : "bg-gray-500 hover:bg-gray-400"}`;
  allBtnMobile.dataset.area = "ALL";
  mobilePanel.appendChild(allBtnMobile);

  sortedAreas.forEach(area => {
    const isSelected = currentSet.has(area);
    const btn = document.createElement("button");
    btn.textContent = area;
    btn.className = `area-filter-btn py-1 text-xs rounded font-semibold text-white text-center transition w-full ${isSelected ? "bg-green-500" : "bg-gray-500 hover:bg-gray-400"}`;
    btn.dataset.area = area;
    mobilePanel.appendChild(btn);
  });

  // 💻 PC用：ランクボタン下に収まる2列（ボタン幅制限）
  const desktopPanel = document.getElementById("area-filter-panel-desktop");
  desktopPanel.innerHTML = "";
  desktopPanel.className = "grid grid-cols-2 gap-2";

  const allBtnDesktop = document.createElement("button");
  allBtnDesktop.textContent = isAllSelected ? "全解除" : "全選択";
  allBtnDesktop.className = `area-filter-btn py-1 text-xs rounded font-semibold text-white text-center transition w-full max-w-[8rem] ${isAllSelected ? "bg-red-500" : "bg-gray-500 hover:bg-gray-400"}`;
  allBtnDesktop.dataset.area = "ALL";
  desktopPanel.appendChild(allBtnDesktop);

  const spacer = document.createElement("div");
  spacer.className = "hidden lg:block";
  desktopPanel.appendChild(spacer);

  sortedAreas.forEach(area => {
    const isSelected = currentSet.has(area);
    const btn = document.createElement("button");
    btn.textContent = area;
    btn.className = `area-filter-btn py-1 text-xs rounded font-semibold text-white text-center transition w-full max-w-[8rem] ${isSelected ? "bg-green-500" : "bg-gray-500 hover:bg-gray-400"}`;
    btn.dataset.area = area;
    desktopPanel.appendChild(btn);
  });
};

const sortAndRedistribute = debounce(() => filterAndRender(), 200);

const areaPanel = document.getElementById("area-filter-panel");

function toggleAreaPanel(show) {
    areaPanel.classList.toggle("hidden", !show);
}

toggleAreaPanel(true);  // 表示
toggleAreaPanel(false); // 非表示

function updateFilterUI() {
    const state = getState();
    const currentRankKeyForColor = FILTER_TO_DATA_RANK_MAP[state.filter.rank] || state.filter.rank;
    DOM.rankTabs.querySelectorAll(".tab-button").forEach(btn => {
        btn.classList.remove("bg-blue-800", "bg-red-800", "bg-yellow-800", "bg-indigo-800", "bg-gray-500", "hover:bg-gray-400"); // renderRankTabsと競合するため色を初期化
        btn.classList.add("bg-gray-500");
        if (btn.dataset.rank !== state.filter.rank) {
            btn.dataset.clickCount = "0";
        }
        if (btn.dataset.rank === state.filter.rank) {
            btn.classList.remove("bg-gray-500");
            const rank = btn.dataset.rank;
            btn.classList.add(
                rank === "ALL" ? "bg-blue-800"
                    : currentRankKeyForColor === "S" ? "bg-red-800"
                        : currentRankKeyForColor === "A" ? "bg-yellow-800"
                            : currentRankKeyForColor === "F" ? "bg-indigo-800"
                                : "bg-gray-800"
            );
        } else {
            btn.classList.add("hover:bg-gray-400");
        }
    });
}

// 討伐報告受信ハンドラ
function onKillReportReceived(mobId, kill_time) {
  const mob = mobsById[mobId];
  if (!mob) return;

  mob.last_kill_time = Number(kill_time);
  mob.repopInfo = calculateRepop(mob);

  // 即時更新
  const card = document.querySelector(`.mob-card[data-mob-no="${mob.No}"]`);
  if (card) {
    updateProgressText(card, mob);
    updateProgressBar(card, mob);
  }
}

// 定期ループ（60秒ごとに全カードを更新）
setInterval(() => {
  const state = getState();
  state.mobs.forEach(mob => {
    const card = document.querySelector(`.mob-card[data-mob-no="${mob.No}"]`);
    if (card) {
      updateProgressText(card, mob);
      updateProgressBar(card, mob);
    }
  });
}, 60000);

// ← この下に export をまとめる
export { filterAndRender, distributeCards, updateProgressText, updateProgressBar, createMobCard, displayStatus, DOM,
        renderAreaFilterPanel, renderRankTabs, sortAndRedistribute, updateFilterUI, toggleAreaPanel, onKillReportReceived };
