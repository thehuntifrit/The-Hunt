// uiRender.js

import { calculateRepop, formatDurationHM, formatLastKillTime, debounce, getEorzeaTime, EORZEA_MINUTE_MS } from "./cal.js";
import { drawSpawnPoint, isCulled, attachLocationEvents } from "./location.js";
import { getState, PROGRESS_CLASSES, recalculateMob, requestWorkerCalculation } from "./dataManager.js";
import { filterMobsByRankAndArea } from "./filterUI.js";
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
  modalForceSubmit: document.getElementById('report-force-submit'),
  statusMessageTemp: document.getElementById('status-message-temp'),
};

const FIFTEEN_MINUTES_SEC = 15 * 60;

let cachedFilterString = null;
let cachedFilteredMobs = null;
let cachedSortedMobs = null;
let sortCacheValid = false;

const mobIdPartsCache = new Map();

function getValidSpawnPoints(mob, spawnCullStatus) {
  return (mob.spawn_points ?? []).filter(point => {
    const isS_SpawnPoint = point.mob_ranks.includes("S");
    if (!isS_SpawnPoint) return false;
    const pointStatus = spawnCullStatus?.[point.id];
    return !isCulled(pointStatus, mob.No);
  });
}

function getFilteredMobs() {
  const state = getState();
  const filterString = JSON.stringify(state.filter);

  if (cachedFilterString === filterString && cachedFilteredMobs) {
    return cachedFilteredMobs;
  }

  cachedFilterString = filterString;
  cachedFilteredMobs = filterMobsByRankAndArea(state.mobs);
  sortCacheValid = false;
  return cachedFilteredMobs;
}

function getSortedFilteredMobs() {
  if (sortCacheValid && cachedSortedMobs) {
    return cachedSortedMobs;
  }
  cachedSortedMobs = getFilteredMobs().slice().sort(allTabComparator);
  sortCacheValid = true;
  return cachedSortedMobs;
}

function invalidateFilterCache() {
  cachedFilterString = null;
  cachedFilteredMobs = null;
  cachedSortedMobs = null;
  sortCacheValid = false;
}

function invalidateSortCache() {
  sortCacheValid = false;
  cachedSortedMobs = null;
}

function updateEorzeaTime() {
  const et = getEorzeaTime(new Date());
  const el = document.getElementById("eorzea-time");
  if (el) {
    el.textContent = `ET ${et.hours}:${et.minutes}`;
  }
}
updateEorzeaTime();
setInterval(updateEorzeaTime, EORZEA_MINUTE_MS);

function processText(text) {
  if (typeof text !== "string" || !text) return "";
  return text.replace(/\/\//g, "<br>");
}

function createMobCard(mob) {
  const template = document.getElementById('mob-card-template');
  const clone = template.content.cloneNode(true);
  const card = clone.querySelector('.mob-card');

  const rank = mob.Rank;
  const rankLabel = rank;
  const isExpandable = true;
  const { openMobCardNo } = getState();
  const isOpen = isExpandable && mob.No === openMobCardNo;


  const hasMemo = mob.memo_text && mob.memo_text.trim() !== "";
  const isMemoNewer = (mob.memo_updated_at || 0) >= (mob.last_kill_time || 0);
  const shouldShowMemo = hasMemo && (isMemoNewer || (mob.last_kill_time || 0) === 0);

  const memoIcon = shouldShowMemo
    ? ` <span data-tooltip="${mob.memo_text}" style="font-size: 1rem">📝</span>`
    : "";

  card.dataset.mobNo = mob.No;
  card.dataset.rank = rank;
  if (mob.repopInfo?.isMaintenanceStop || mob.repopInfo?.isBlockedByMaintenance) {
    card.classList.add("maintenance-gray-out");
  } else {
    card.classList.remove("maintenance-gray-out");
  }

  const mobNameEl = card.querySelector('.mob-name');
  mobNameEl.textContent = mob.Name;
  mobNameEl.style.color = `var(--rank-${rank.toLowerCase()})`;

  const memoIconContainer = card.querySelector('.memo-icon-container');
  memoIconContainer.innerHTML = memoIcon;

  const reportSidebar = card.querySelector('.report-side-bar');
  if (reportSidebar) {
    reportSidebar.dataset.reportType = rank === 'A' ? 'instant' : 'modal';
    reportSidebar.dataset.mobNo = mob.No;
    reportSidebar.classList.add(`rank-${rank.toLowerCase()}`);

    let touchStartX = 0;
    reportSidebar.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    reportSidebar.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].screenX;
      if (touchEndX - touchStartX > 30) {
        const type = reportSidebar.dataset.reportType;
        if (type === 'modal') {
          openReportModal(mob.No);
        } else {
          reportSidebar.click();
        }
      }
    }, { passive: true });
  }

  const expandablePanel = card.querySelector('.expandable-panel');
  if (isExpandable) {
    if (isOpen) {
      expandablePanel.classList.add('open');
    }

    const memoInput = card.querySelector('.memo-input');
    memoInput.value = shouldShowMemo ? (mob.memo_text || "") : "";
    memoInput.dataset.mobNo = mob.No;

    if (rank !== 'S') {
      const conditionWrapper = card.querySelector('.condition-text')?.closest('.w-full.mt-2');
      if (conditionWrapper) conditionWrapper.remove();
      const mapContainer = card.querySelector('.map-container');
      if (mapContainer) mapContainer.remove();
    } else {
      const conditionText = card.querySelector('.condition-text');
      if (conditionText) conditionText.innerHTML = processText(mob.Condition);

      const mapContainer = card.querySelector('.map-container');
      if (mob.Map) {
        const mapImg = mapContainer.querySelector('.mob-map-img');
        mapImg.src = `./maps/${mob.Map}`;
        mapImg.alt = `${mob.Area} Map`;
      } else if (mapContainer) {
        mapContainer.remove();
      }
    }

  } else {
    expandablePanel.remove();
  }

  updateAreaInfo(card, mob);
  updateMobCount(card, mob);
  updateMapOverlay(card, mob);

  return card;
}

function rankPriority(rank) {
  switch (rank) {
    case "S": return 0;
    case "A": return 1;
    case "F": return 2;
    default: return 99;
  }
}

const EXPANSION_PRIORITY = {
  "黄金": 6, "暁月": 5, "漆黒": 4, "紅蓮": 3, "蒼天": 2, "新生": 1
};

function getExpansionPriority(expansionName) {
  return EXPANSION_PRIORITY[expansionName] ?? 0;
}

function parseMobIdParts(no) {
  if (mobIdPartsCache.has(no)) {
    return mobIdPartsCache.get(no);
  }
  const str = String(no).padStart(5, "0");
  const result = {
    mobNo: parseInt(str.slice(2, 4), 10),
    instance: parseInt(str[4], 10),
  };
  mobIdPartsCache.set(no, result);
  return result;
}

function allTabComparator(a, b) {
  const aInfo = a.repopInfo || {};
  const bInfo = b.repopInfo || {};
  const aStatus = aInfo.status;
  const bStatus = bInfo.status;

  const aIsAfterMaintenance =
    aInfo.isMaintenanceStop || aInfo.isBlockedByMaintenance;
  const bIsAfterMaintenance =
    bInfo.isMaintenanceStop || bInfo.isBlockedByMaintenance;

  if (aIsAfterMaintenance && !bIsAfterMaintenance) return 1;
  if (!aIsAfterMaintenance && bIsAfterMaintenance) return -1;

  const isAMaxOver = aStatus === "MaxOver";
  const isBMaxOver = bStatus === "MaxOver";

  if (isAMaxOver && !isBMaxOver) return -1;
  if (!isAMaxOver && isBMaxOver) return 1;

  if (isAMaxOver && isBMaxOver) {
    const aActive = aInfo.isInConditionWindow;
    const bActive = bInfo.isInConditionWindow;

    if (aActive && !bActive) return -1;
    if (!aActive && bActive) return 1;

    const getMaxOverRankPriority = (r) => {
      if (r === 'S') return 0;
      if (r === 'F') return 1;
      if (r === 'A') return 2;
      return 99;
    };

    const rankDiff = getMaxOverRankPriority(a.Rank) - getMaxOverRankPriority(b.Rank);
    if (rankDiff !== 0) return rankDiff;

    const expA = getExpansionPriority(a.Expansion);
    const expB = getExpansionPriority(b.Expansion);
    if (expA !== expB) return expB - expA;

    const pa = parseMobIdParts(a.No);
    const pb = parseMobIdParts(b.No);
    if (pa.mobNo !== pb.mobNo) return pa.mobNo - pb.mobNo;

    return pa.instance - pb.instance;
  }

  const isAConditionActive = aStatus === "ConditionActive";
  const isBConditionActive = bStatus === "ConditionActive";

  if (isAConditionActive && !isBConditionActive) return -1;
  if (!isAConditionActive && isBConditionActive) return 1;

  const aPercent = aInfo.elapsedPercent || 0;
  const bPercent = bInfo.elapsedPercent || 0;

  if (Math.abs(aPercent - bPercent) > 0.001) {
    return bPercent - aPercent;
  }

  if (!aIsAfterMaintenance && !bIsAfterMaintenance) {
    const aTime = aInfo.minRepop || 0;
    const bTime = bInfo.minRepop || 0;
    if (aTime !== bTime) return aTime - bTime;
  }

  const rankDiff = rankPriority(a.Rank) - rankPriority(b.Rank);
  if (rankDiff !== 0) return rankDiff;

  const expA = getExpansionPriority(a.Expansion);
  const expB = getExpansionPriority(b.Expansion);
  if (expA !== expB) return expB - expA;

  const pa = parseMobIdParts(a.No);
  const pb = parseMobIdParts(b.No);
  if (pa.mobNo !== pb.mobNo) return pa.mobNo - pb.mobNo;

  return pa.instance - pb.instance;
}

const visibleCards = new Set();
const cardObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const mobNo = entry.target.dataset.mobNo;
    if (entry.isIntersecting) {
      visibleCards.add(mobNo);
      const mob = getState().mobs.find(m => String(m.No) === mobNo);
      if (mob) {
        updateProgressText(entry.target, mob);
        updateProgressBar(entry.target, mob);
        updateMobCount(entry.target, mob);
        updateMapOverlay(entry.target, mob);
        updateExpandablePanel(entry.target, mob);
        updateMemoIcon(entry.target, mob);
      }
    } else {
      visibleCards.delete(mobNo);
    }
  });
}, { threshold: 0 });

function updateVisibleCards() {
  const sorted = getSortedFilteredMobs();
  const mobMap = new Map(sorted.map(m => [String(m.No), m]));

  visibleCards.forEach(mobNoStr => {
    const card = document.querySelector(`.mob-card[data-mob-no="${mobNoStr}"]`);
    if (card) {
      const mob = mobMap.get(mobNoStr);
      if (mob) {
        updateProgressText(card, mob);
        updateProgressBar(card, mob);
        updateMobCount(card, mob);
        updateMapOverlay(card, mob);
        updateExpandablePanel(card, mob);
        updateMemoIcon(card, mob);
      }
    }
  });
}

function filterAndRender({ isInitialLoad = false } = {}) {
  const state = getState();

  if (!state.initialLoadComplete && !isInitialLoad) {
    return;
  }

  invalidateSortCache();
  const sortedMobs = getSortedFilteredMobs();

  const activeElement = document.activeElement;
  let focusedMobNo = null;
  let focusedAction = null;
  let selectionStart = null;
  let selectionEnd = null;

  if (activeElement && activeElement.closest('.mob-card')) {
    focusedMobNo = activeElement.closest('.mob-card').dataset.mobNo;
    if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') {
      focusedAction = activeElement.dataset.action;
      selectionStart = activeElement.selectionStart;
      selectionEnd = activeElement.selectionEnd;
    }
  }

  const existingCards = new Map();
  document.querySelectorAll('.mob-card').forEach(card => {
    const mobNo = card.getAttribute('data-mob-no');
    existingCards.set(mobNo, card);
  });

  const width = window.innerWidth;
  const md = 768;
  const lg = 1024;
  let numCols = 1;
  if (width >= lg) {
    numCols = 3;
    DOM.cols[2].classList.remove("hidden");
  } else if (width >= md) {
    numCols = 2;
    DOM.cols[2].classList.add("hidden");
  } else {
    numCols = 1;
    DOM.cols[2].classList.add("hidden");
  }

  const colPointers = Array(numCols).fill(0);

  lastRenderedOrderStr = sortedMobs.map(m => m.No).join(",");

  sortedMobs.forEach((mob, index) => {
    const mobNoStr = String(mob.No);
    let card = existingCards.get(mobNoStr);

    if (!card) {
      card = createMobCard(mob);
      cardObserver.observe(card);
      updateProgressText(card, mob);
      updateProgressBar(card, mob);
      updateExpandablePanel(card, mob);
    }

    if (card) {
      const targetColIndex = index % numCols;
      const targetCol = DOM.cols[targetColIndex];
      const currentChild = targetCol.children[colPointers[targetColIndex]];
      if (currentChild !== card) {
        if (currentChild) {
          targetCol.insertBefore(card, currentChild);
        } else {
          targetCol.appendChild(card);
        }
      }
      colPointers[targetColIndex]++;
    }
  });

  DOM.cols.forEach((col, idx) => {
    if (idx < numCols) {
      while (col.children.length > colPointers[idx]) {
        const cardToRemove = col.lastChild;
        if (cardToRemove && cardToRemove.classList?.contains('mob-card')) {
          cardObserver.unobserve(cardToRemove);
          visibleCards.delete(cardToRemove.dataset.mobNo);
        }
        col.removeChild(cardToRemove);
      }
    } else {
      col.querySelectorAll('.mob-card').forEach(c => {
        cardObserver.unobserve(c);
        visibleCards.delete(c.dataset.mobNo);
      });
      col.innerHTML = "";
    }
  });

  if (isInitialLoad) {
    attachLocationEvents();
    updateProgressBars();
  } else {
    updateVisibleCards();
  }

  if (focusedMobNo) {
    const card = document.querySelector(`.mob-card[data-mob-no="${focusedMobNo}"]`);
    if (card) {
      if (focusedAction) {
        const input = card.querySelector(`input[data-action="${focusedAction}"]`);
        if (input) {
          input.focus();
          if (selectionStart !== null && selectionEnd !== null) {
            try {
              input.setSelectionRange(selectionStart, selectionEnd);
            } catch (e) { }
          }
        }
      }
    }
  }
}

function showColumnContainer() {
  setTimeout(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (DOM.colContainer) {
          DOM.colContainer.classList.remove("opacity-0");
        }
        const overlay = document.getElementById("loading-overlay");
        if (overlay) {
          overlay.classList.add("hidden");
        }
      });
    });
  }, 100);
}

function updateProgressBar(card, mob) {
  const bar = card.querySelector(".progress-bar-bg");
  const wrapper = bar?.parentElement;
  const text = card.querySelector(".progress-text");
  if (!bar || !wrapper || !text) return;

  const { elapsedPercent, status } = mob.repopInfo;

  const currentWidth = parseFloat(bar.style.width) || 0;
  if (Math.abs(elapsedPercent - currentWidth) > 0.001) {
    if (elapsedPercent < currentWidth) {
      bar.style.transition = "none";
    } else {
      bar.style.transition = "width linear 60s";
    }
    bar.style.width = `${elapsedPercent}%`;
  }

  const currentStatus = card.dataset.lastStatus;
  const currentInCondition = card.dataset.lastInCondition === "true";
  const isInCondition = !!mob.repopInfo.isInConditionWindow;

  if (currentStatus === status && currentInCondition === isInCondition) {
    return;
  }
  card.dataset.lastStatus = status;
  card.dataset.lastInCondition = isInCondition;

  bar.classList.remove(
    PROGRESS_CLASSES.P0_60,
    PROGRESS_CLASSES.P60_80,
    PROGRESS_CLASSES.P80_100,
    PROGRESS_CLASSES.MAX_OVER
  );
  text.classList.remove(
    PROGRESS_CLASSES.TEXT_NEXT,
    PROGRESS_CLASSES.TEXT_POP
  );
  wrapper.classList.remove(PROGRESS_CLASSES.BLINK_WHITE);

  if (elapsedPercent < 60) {
    bar.classList.add(PROGRESS_CLASSES.P0_60);
  } else if (elapsedPercent < 80) {
    bar.classList.add(PROGRESS_CLASSES.P60_80);
  } else if (elapsedPercent < 100) {
    bar.classList.add(PROGRESS_CLASSES.P80_100);
  }

  if (status === "PopWindow" || status === "ConditionActive") {
    if (elapsedPercent > 90) {
      wrapper.classList.add(PROGRESS_CLASSES.BLINK_WHITE);
    }
    text.classList.add(PROGRESS_CLASSES.TEXT_POP);

  } else if (status === "MaxOver") {
    bar.classList.add(PROGRESS_CLASSES.MAX_OVER);
    text.classList.add(PROGRESS_CLASSES.TEXT_POP);

    if (mob.repopInfo.isInConditionWindow) {
      wrapper.classList.add(PROGRESS_CLASSES.BLINK_WHITE);
    }
  } else {
    text.classList.add(PROGRESS_CLASSES.TEXT_NEXT);
  }
}

function updateProgressText(card, mob) {
  const text = card.querySelector(".progress-text");
  if (!text) return;

  const { elapsedPercent, nextMinRepopDate, nextConditionSpawnDate, minRepop,
    maxRepop, status, isInConditionWindow, timeRemaining, isBlockedByMaintenance
  } = mob.repopInfo || {};

  const nowSec = Date.now() / 1000;
  let leftStr = timeRemaining || "未確定";
  const percentStr =
    (status !== "MaxOver" &&
      (
        (minRepop && nowSec >= minRepop) ||
        status === "PopWindow" ||
        status === "ConditionActive"
      )
    )
      ? ` (${Number(elapsedPercent || 0).toFixed(0)}%)`
      : "";

  const now = Date.now() / 1000;
  const mobNameEl = card.querySelector('.mob-name');

  const shouldDimCard =
    status === "Next" ||
    (status === "NextCondition" && now < mob.repopInfo.minRepop);

  const reportSidebar = card.querySelector('.report-side-bar');

  if (shouldDimCard) {
    card.classList.add("opacity-60");
    card.classList.remove("is-active-neon");
    if (reportSidebar) reportSidebar.classList.remove("is-active-neon");
    if (mobNameEl) {
      mobNameEl.style.color = "#999";
    }
  } else {
    card.classList.remove("opacity-60");
    card.classList.add("is-active-neon");
    if (reportSidebar) reportSidebar.classList.add("is-active-neon");
    if (mobNameEl) {
      mobNameEl.style.color = `var(--rank-${mob.Rank.toLowerCase()})`;
    }
  }

  if (mob.repopInfo?.isBlockedByMaintenance || mob.repopInfo?.isMaintenanceStop) {
    card.classList.add("maintenance-gray-out");
  } else {
    card.classList.remove("maintenance-gray-out");
  }

  let rightStr = "未確定";
  let isSpecialCondition = false;

  if (isInConditionWindow && mob.repopInfo.conditionRemaining) {
    rightStr = mob.repopInfo.conditionRemaining;
    isSpecialCondition = true;
  } else if (nextConditionSpawnDate) {
    try {
      const dateStr = new Intl.DateTimeFormat("ja-JP", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Tokyo"
      }).format(nextConditionSpawnDate);

      rightStr = `🔔 ${dateStr}`;
      isSpecialCondition = true;
    } catch {
      rightStr = "未確定";
    }
  } else if (nextMinRepopDate) {
    try {
      const dateStr = new Intl.DateTimeFormat("ja-JP", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Tokyo"
      }).format(nextMinRepopDate);

      rightStr = `in ${dateStr}`;
    } catch {
      rightStr = "未確定";
    }
  }

  let rightContent = `<span class="${isSpecialCondition ? 'label-next' : ''}">${rightStr}</span>`;

  const newHTML = `
<div class="w-full h-full flex items-center justify-between text-[13px] font-bold px-1.5">
<div class="truncate">${leftStr}${percentStr}</div>
<div class="truncate">${rightContent}</div>
</div>
  `;
  if (text.innerHTML !== newHTML) {
    text.innerHTML = newHTML;
  }

  if (status === "MaxOver") text.classList.add("max-over");
  else text.classList.remove("max-over");

  if (minRepop - nowSec >= 3600) text.classList.add("long-wait");
  else text.classList.remove("long-wait");

  if (status === "ConditionActive" || (status === "MaxOver" && isInConditionWindow)) {
    card.classList.add("blink-border-white");
  } else {
    card.classList.remove("blink-border-white");
  }
}

function updateExpandablePanel(card, mob) {
  const elLast = card.querySelector("[data-last-kill]");
  const elMemoInput = card.querySelector("input[data-action='save-memo']");

  const lastStr = formatLastKillTime(mob.last_kill_time);
  if (elLast) elLast.textContent = `前回: ${lastStr}`;

  if (elMemoInput) {
    if (document.activeElement !== elMemoInput) {
      const hasMemo = mob.memo_text && mob.memo_text.trim() !== "";
      const isMemoNewer = (mob.memo_updated_at || 0) >= (mob.last_kill_time || 0);
      const shouldShowMemo = hasMemo && (isMemoNewer || (mob.last_kill_time || 0) === 0);
      elMemoInput.value = shouldShowMemo ? (mob.memo_text || "") : "";
    }
  }
}

function updateMemoIcon(card, mob) {
  const memoIconContainer = card.querySelector('.memo-icon-container');
  if (!memoIconContainer) return;

  const hasMemo = mob.memo_text && mob.memo_text.trim() !== "";
  const isMemoNewer = (mob.memo_updated_at || 0) >= (mob.last_kill_time || 0);
  const shouldShowMemo = hasMemo && (isMemoNewer || (mob.last_kill_time || 0) === 0);

  const prevState = memoIconContainer.dataset.memoState;
  const newState = shouldShowMemo ? mob.memo_text : "";

  if (prevState === newState) return;
  memoIconContainer.dataset.memoState = newState;

  if (shouldShowMemo) {
    let span = memoIconContainer.querySelector('span');
    if (!span) {
      span = document.createElement('span');
      span.style.fontSize = '0.875rem';
      span.textContent = '📝';
      memoIconContainer.appendChild(span);
    }
    span.setAttribute('data-tooltip', mob.memo_text);
  } else {
    memoIconContainer.innerHTML = '';
  }
}

function updateMobCount(card, mob) {
  const countContainer = card.querySelector('.mob-count-container');
  if (!countContainer) return;

  const state = getState();
  const mobLocationsData = state.mobLocations?.[mob.No];
  const spawnCullStatus = mobLocationsData || mob.spawn_cull_status;

  let displayCountText = "";

  if (mob.Map && mob.spawn_points) {
    const validSpawnPoints = getValidSpawnPoints(mob, spawnCullStatus);
    const remainingCount = validSpawnPoints.length;

    if (remainingCount === 1) {
      const pointId = validSpawnPoints[0]?.id || "";
      const pointNumber = parseInt(pointId.slice(-2), 10);
      displayCountText = `<span class="text-sm text-yellow-400 font-bold text-glow">${pointNumber}&thinsp;番</span>`;
    } else if (remainingCount > 1) {
      displayCountText = `<span class="text-sm text-gray-400 relative -top-[0.12rem]">@</span><span class="text-base text-gray-400 font-bold text-glow relative top-[0.04rem]">&thinsp;${remainingCount}</span>`;
    }

    if (displayCountText) {
      displayCountText = `<span class="text-sm">📍</span>${displayCountText}`;
    }
  }

  if (countContainer.innerHTML !== displayCountText) {
    countContainer.innerHTML = displayCountText;
  }
}
function updateAreaInfo(card, mob) {
  const areaInfoContainer = card.querySelector('.area-info-container');
  if (!areaInfoContainer) return;

  if (areaInfoContainer.dataset.initialized === "true") return;
  areaInfoContainer.dataset.initialized = "true";

  const areaInfoHtml = `<div class="truncate text-gray-300 leading-none mb-[3px]">${mob.Area}</div>
  <div class="flex items-center justify-end gap-0.5 opacity-60 leading-none">
    <span>${mob.Expansion}</span>
    <span class="inline-flex items-center justify-center w-[11px] h-[11px] border border-current rounded-[1px] text-[7px] leading-none">${mob.Rank}</span>
  </div>`;
  areaInfoContainer.innerHTML = areaInfoHtml;
}

function updateMapOverlay(card, mob) {
  const mapContainer = card.querySelector('.map-container');
  if (!mapContainer) return;
  const mapOverlay = mapContainer.querySelector('.map-overlay');
  if (!mapOverlay) return;

  let spawnPointsHtml = "";
  if (mob.Map && mob.Rank === 'S') {
    const state = getState();
    const mobLocationsData = state.mobLocations?.[mob.No];
    const spawnCullStatus = mobLocationsData || mob.spawn_cull_status;

    const validSpawnPoints = getValidSpawnPoints(mob, spawnCullStatus);
    const remainingCount = validSpawnPoints.length;
    const isLastOne = remainingCount === 1;

    spawnPointsHtml = (mob.spawn_points ?? []).map(point => {
      const isThisPointTheLastOne = isLastOne && point.id === validSpawnPoints[0]?.id;
      return drawSpawnPoint(
        point,
        spawnCullStatus,
        mob.No,
        point.mob_ranks.includes("B2") ? "B2"
          : point.mob_ranks.includes("B1") ? "B1"
            : point.mob_ranks[0],
        isThisPointTheLastOne,
        isLastOne
      );
    }).join("");
  }

  if (mapOverlay.innerHTML !== spawnPointsHtml) {
    mapOverlay.innerHTML = spawnPointsHtml;
  }
}

let lastRenderedOrderStr = "";

function updateProgressBars() {
  const state = getState();
  const conditionMobs = [];
  const nowSec = Date.now() / 1000;

  // 可視カードのモブのみ calculateRepop を呼び出す（パフォーマンス最適化）
  visibleCards.forEach((mobNoStr) => {
    const mob = state.mobs.find(m => String(m.No) === mobNoStr);
    if (!mob || !mob.repopInfo) return;

    mob.repopInfo = calculateRepop(mob, state.maintenance, {
      skipConditionCalc: false
    });

    // 条件ウィンドウが終了した場合は Worker で再計算
    if (mob.repopInfo.conditionWindowEnd && nowSec > mob.repopInfo.conditionWindowEnd.getTime() / 1000) {
      recalculateMob(mob.No);
    }
  });

  // 条件モブの通知メッセージ用（全モブをチェックするが、既存の repopInfo を使用）
  state.mobs.forEach((mob) => {
    if (mob.repopInfo?.nextConditionSpawnDate && mob.repopInfo?.conditionWindowEnd) {
      const spawnSec = mob.repopInfo.nextConditionSpawnDate.getTime() / 1000;
      const endSec = mob.repopInfo.conditionWindowEnd.getTime() / 1000;
      if (nowSec >= (spawnSec - FIFTEEN_MINUTES_SEC) && nowSec <= endSec) {
        if (nowSec < spawnSec) {
          const diffMin = Math.ceil((spawnSec - nowSec) / 60);
          conditionMobs.push(`${mob.Name} (${diffMin}分前)`);
        } else {
          conditionMobs.push(mob.Name);
        }
      }
    }
  });

  invalidateSortCache();
  const sorted = getSortedFilteredMobs();
  const currentOrderStr = sorted.map(m => m.No).join(",");

  if (currentOrderStr !== lastRenderedOrderStr) {
    filterAndRender();
  } else {
    updateVisibleCards();
  }

  if (DOM.statusMessageTemp) {
    if (conditionMobs.length > 0) {
      DOM.statusMessageTemp.textContent = `🔜 ${conditionMobs.join(" / ")}`;
      DOM.statusMessageTemp.className = "text-cyan-300 font-bold animate-pulse";
      DOM.statusMessageTemp.classList.remove("hidden");
    } else {
      DOM.statusMessageTemp.textContent = "";
      DOM.statusMessageTemp.classList.add("hidden");
    }
  }
}

const sortAndRedistribute = debounce(() => filterAndRender(), 200);

function onKillReportReceived(mobId, kill_time) {
  const state = getState();
  const mob = state.mobs.find(m => m.No === mobId);
  if (!mob) return;

  mob.last_kill_time = Number(kill_time);
  requestWorkerCalculation(mob, state.maintenance, { forceRecalc: true });
}

setInterval(() => {
  updateProgressBars();
}, EORZEA_MINUTE_MS);

export {
  filterAndRender, updateProgressText, updateProgressBar, createMobCard, DOM, sortAndRedistribute, onKillReportReceived,
  updateProgressBars, updateAreaInfo, updateMapOverlay, updateMobCount, showColumnContainer, invalidateFilterCache
};
