// uiRender.js

import { calculateRepop, formatDurationHM, formatLastKillTime, debounce, getEorzeaTime, EORZEA_MINUTE_MS } from "./cal.js";
import { drawSpawnPoint, isCulled, attachLocationEvents } from "./location.js";
import { getState, PROGRESS_CLASSES } from "./dataManager.js";
import { filterMobsByRankAndArea } from "./filterUI.js";

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

function getFilteredMobs() {
  const state = getState();
  const filterString = JSON.stringify(state.filter);

  if (cachedFilterString === filterString && cachedFilteredMobs) {
    return cachedFilteredMobs;
  }

  cachedFilterString = filterString;
  cachedFilteredMobs = filterMobsByRankAndArea(state.mobs);
  return cachedFilteredMobs;
}

function invalidateFilterCache() {
  cachedFilterString = null;
  cachedFilteredMobs = null;
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
  const isExpandable = rank === "S";
  const { openMobCardNo } = getState();
  const isOpen = isExpandable && mob.No === openMobCardNo;

  const state = getState();

  const hasMemo = mob.memo_text && mob.memo_text.trim() !== "";
  const isMemoNewer = (mob.memo_updated_at || 0) > (mob.last_kill_time || 0);
  const shouldShowMemo = hasMemo && (isMemoNewer || (mob.last_kill_time || 0) === 0);

  const memoIcon = shouldShowMemo
    ? ` <span data-tooltip="${mob.memo_text}" style="font-size: 1rem">📝</span>`
    : "";

  // Card Attributes
  card.dataset.mobNo = mob.No;
  card.dataset.rank = rank;
  if (mob.repopInfo?.isMaintenanceStop) {
    card.classList.add("opacity-50", "grayscale");
  }

  // Rank Badge - Removed as requested
  const rankBadge = card.querySelector('.rank-badge');
  if (rankBadge) rankBadge.remove();

  // Adjust grid layout
  const headerGrid = card.querySelector('.mob-card-header > div');
  if (headerGrid) {
    headerGrid.classList.remove('grid-cols-[auto_1fr_auto]');
    headerGrid.classList.add('grid-cols-[1fr_auto]');
  }

  // Mob Name
  const mobNameEl = card.querySelector('.mob-name');
  mobNameEl.textContent = mob.Name;
  mobNameEl.style.color = `var(--rank-${rank.toLowerCase()})`;

  const memoIconContainer = card.querySelector('.memo-icon-container');
  memoIconContainer.innerHTML = memoIcon;

  // Report Button
  const reportBtn = card.querySelector('.report-btn');
  reportBtn.dataset.reportType = rank === 'A' ? 'instant' : 'modal';
  reportBtn.dataset.mobNo = mob.No;

  // Expandable Panel
  const expandablePanel = card.querySelector('.expandable-panel');
  if (isExpandable) {
    if (isOpen) {
      expandablePanel.classList.add('open');
    }

    // Memo Input
    const memoInput = card.querySelector('.memo-input');
    memoInput.value = shouldShowMemo ? (mob.memo_text || "") : "";
    memoInput.dataset.mobNo = mob.No;

    // Condition
    const conditionText = card.querySelector('.condition-text');
    conditionText.innerHTML = processText(mob.Condition);

    // Map
    const mapContainer = card.querySelector('.map-container');
    if (mob.Map && rank === 'S') {
      const mapImg = mapContainer.querySelector('.mob-map-img');
      mapImg.src = `./maps/${mob.Map}`;
      mapImg.alt = `${mob.Area} Map`;
    } else {
      mapContainer.remove();
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

function getExpansionPriority(expansionName) {
  switch (expansionName) {
    case "黄金": return 6;
    case "暁月": return 5;
    case "漆黒": return 4;
    case "紅蓮": return 3;
    case "蒼天": return 2;
    case "新生": return 1;
    default: return 0;
  }
}

function parseMobIdParts(no) {
  const str = String(no).padStart(5, "0");
  return {
    mobNo: parseInt(str.slice(2, 4), 10),
    instance: parseInt(str[4], 10),
  };
}

function allTabComparator(a, b) {
  const aInfo = a.repopInfo || {};
  const bInfo = b.repopInfo || {};
  const aStatus = aInfo.status;
  const bStatus = bInfo.status;
  const isAMaxOver = aStatus === "MaxOver";
  const isBMaxOver = bStatus === "MaxOver";
  const aHasCondition = aInfo.hasCondition;
  const bHasCondition = bInfo.hasCondition;
  const aEffectiveMaxOver = isAMaxOver && !aHasCondition;
  const bEffectiveMaxOver = isBMaxOver && !bHasCondition;

  if (aEffectiveMaxOver && bEffectiveMaxOver) {
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

  if (aEffectiveMaxOver && !bEffectiveMaxOver) return -1;
  if (!aEffectiveMaxOver && bEffectiveMaxOver) return 1;

  const isAMaint = aInfo.isMaintenanceStop || aInfo.isBlockedByMaintenance;
  const isBMaint = bInfo.isMaintenanceStop || bInfo.isBlockedByMaintenance;

  if (isAMaint && !isBMaint) return 1;
  if (!isAMaint && isBMaint) return -1;

  const aPercent = aInfo.elapsedPercent || 0;
  const bPercent = bInfo.elapsedPercent || 0;

  if (Math.abs(aPercent - bPercent) > 0.001) {
    return bPercent - aPercent;
  }

  if (!isAMaint && !isBMaint) {
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

function filterAndRender({ isInitialLoad = false } = {}) {
  const state = getState();

  if (!state.initialLoadComplete && !isInitialLoad) {
    return;
  }

  const filtered = getFilteredMobs();
  const sortedMobs = filtered.sort(allTabComparator);

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

  // Determine column count
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
        col.removeChild(col.lastChild);
      }
    } else {
      col.innerHTML = "";
    }
  });

  if (isInitialLoad) {
    attachLocationEvents();
    updateProgressBars();
  }

  // Restore focus
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
  if (elapsedPercent < currentWidth) {
    bar.style.transition = "none";
  } else {
    bar.style.transition = "width linear 60s";
  }
  bar.style.width = `${elapsedPercent}%`;

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
  const percentStr = (status === "PopWindow" || status === "ConditionActive")
    ? ` (${Number(elapsedPercent || 0).toFixed(0)}%)`
    : "";

  const now = Date.now() / 1000;
  const mobNameEl = card.querySelector('.mob-name');

  const isBeforeMinRepop = now < mob.repopInfo.minRepop;
  if (status === "Next" || (status === "NextCondition" && isBeforeMinRepop)) {
    card.classList.add("opacity-60");
    if (mobNameEl) {
      mobNameEl.style.color = "#999";
    }
  } else {
    card.classList.remove("opacity-60");
    if (mobNameEl) {
      mobNameEl.style.color = `var(--rank-${mob.Rank.toLowerCase()})`;
    }
  }

  if (isBlockedByMaintenance || mob.repopInfo.isMaintenanceStop) {
    card.classList.add("grayscale", "opacity-50");
  } else {
    card.classList.remove("grayscale", "opacity-50");
  }

  let rightStr = "未確定";
  let isNext = false;

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
      isNext = true;
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

  text.innerHTML = `
<div class="w-full h-full grid grid-cols-2 items-center text-sm font-bold">
<div class="pl-1 text-left truncate">${leftStr}${percentStr}</div>
<div class="pr-2 text-right truncate">${rightContent}</div>
</div>
`;

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
  const elNext = card.querySelector("[data-next-time]");
  const elLast = card.querySelector("[data-last-kill]");
  const elMemoInput = card.querySelector("input[data-action='save-memo']");

  const lastStr = formatLastKillTime(mob.last_kill_time);
  if (elLast) elLast.textContent = `前回: ${lastStr}`;

  if (elMemoInput) {
    if (document.activeElement !== elMemoInput) {
      const hasMemo = mob.memo_text && mob.memo_text.trim() !== "";
      const isMemoNewer = (mob.memo_updated_at || 0) > (mob.last_kill_time || 0);
      const shouldShowMemo = hasMemo && (isMemoNewer || (mob.last_kill_time || 0) === 0);
      elMemoInput.value = shouldShowMemo ? (mob.memo_text || "") : "";
    }
  }
}

function updateMemoIcon(card, mob) {
  const memoIconContainer = card.querySelector('.memo-icon-container');
  if (!memoIconContainer) return;

  const hasMemo = mob.memo_text && mob.memo_text.trim() !== "";
  const isMemoNewer = (mob.memo_updated_at || 0) > (mob.last_kill_time || 0);
  const shouldShowMemo = hasMemo && (isMemoNewer || (mob.last_kill_time || 0) === 0);

  if (shouldShowMemo) {
    const span = document.createElement('span');
    span.style.fontSize = '0.875rem';
    span.textContent = '📝';
    span.setAttribute('data-tooltip', mob.memo_text);
    memoIconContainer.innerHTML = '';
    memoIconContainer.appendChild(span);
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
    const validSpawnPoints = (mob.spawn_points ?? []).filter(point => {
      const isS_SpawnPoint = point.mob_ranks.includes("S");
      if (!isS_SpawnPoint) return false;
      const pointStatus = spawnCullStatus?.[point.id];
      return !isCulled(pointStatus, mob.No);
    });

    const remainingCount = validSpawnPoints.length;

    if (remainingCount === 1) {
      const pointId = validSpawnPoints[0]?.id || "";
      const pointNumber = parseInt(pointId.slice(-2), 10);
      displayCountText = `<span class="text-sm text-yellow-400 font-bold text-glow">${pointNumber}&thinsp;番</span>`;
    } else if (remainingCount > 1) {
      displayCountText = `<span class="text-sm text-gray-400 relative -top-[0.12rem]">@</span><span class="text-base text-gray-400 font-bold text-glow relative top-[0.04rem]">&thinsp;${remainingCount}</span>`;
    }

    displayCountText = `<span class="text-sm">📍</span>${displayCountText}`;
  }

  countContainer.innerHTML = displayCountText;
}

function updateAreaInfo(card, mob) {
  const areaInfoContainer = card.querySelector('.area-info-container');
  if (!areaInfoContainer) return;

  let areaInfoHtml = `<span class="flex items-center gap-1 font-normal"><span>${mob.Area}</span>
<span class="opacity-50">|</span>
<span class="flex items-center">${mob.Expansion}&thinsp;
<span class="inline-flex items-center justify-center w-[13px] h-[13px] border 
border-current rounded-[3px] text-[9px] leading-none relative">${mob.Rank}</span>`;

  areaInfoHtml += `</span></span>`;
  areaInfoContainer.innerHTML = areaInfoHtml;
}

function updateMapOverlay(card, mob) {
  const mapContainer = card.querySelector('.map-container');
  if (!mapContainer) return;
  const mapOverlay = mapContainer.querySelector('.map-overlay');
  if (!mapOverlay) return;

  if (mob.Map && mob.Rank === 'S') {
    const state = getState();
    const mobLocationsData = state.mobLocations?.[mob.No];
    const spawnCullStatus = mobLocationsData || mob.spawn_cull_status;

    let isLastOne = false;
    let validSpawnPoints = [];

    validSpawnPoints = (mob.spawn_points ?? []).filter(point => {
      const isS_SpawnPoint = point.mob_ranks.includes("S");
      if (!isS_SpawnPoint) return false;
      const pointStatus = spawnCullStatus?.[point.id];
      return !isCulled(pointStatus, mob.No);
    });

    const remainingCount = validSpawnPoints.length;
    isLastOne = remainingCount === 1;
    const isS_LastOne = isLastOne;

    const spawnPointsHtml = (mob.spawn_points ?? []).map(point => {
      const isThisPointTheLastOne = isLastOne && point.id === validSpawnPoints[0]?.id;
      return drawSpawnPoint(
        point,
        spawnCullStatus,
        mob.No,
        point.mob_ranks.includes("B2") ? "B2"
          : point.mob_ranks.includes("B1") ? "B1"
            : point.mob_ranks[0],
        isThisPointTheLastOne,
        isS_LastOne
      );
    }).join("");

    mapOverlay.innerHTML = spawnPointsHtml;
  }
}

let lastRenderedOrderStr = "";

function updateProgressBars() {
  const state = getState();
  const conditionMobs = [];
  const nowSec = Date.now() / 1000;

  state.mobs.forEach((mob) => {
    const hasCondition = !!(
      mob.moonPhase ||
      mob.timeRange ||
      mob.timeRanges ||
      mob.weatherSeedRange ||
      mob.weatherSeedRanges ||
      mob.conditions
    );

    if (hasCondition && mob.repopInfo) {
      const wasInWindow = mob.repopInfo.isInConditionWindow;
      const conditionStart = mob.repopInfo.nextConditionSpawnDate?.getTime() / 1000;
      const conditionEnd = mob.repopInfo.conditionWindowEnd?.getTime() / 1000;

      const shouldRecalculate =
        (wasInWindow && conditionEnd && nowSec >= conditionEnd) ||
        (!wasInWindow && conditionStart && nowSec >= conditionStart && conditionEnd && nowSec < conditionEnd);

      if (shouldRecalculate) {
        mob.repopInfo = calculateRepop(mob, state.maintenance);
      }
    }

    if (mob.repopInfo?.nextConditionSpawnDate && mob.repopInfo?.conditionWindowEnd) {
      const spawnSec = mob.repopInfo.nextConditionSpawnDate.getTime() / 1000;
      const endSec = mob.repopInfo.conditionWindowEnd.getTime() / 1000;
      if (nowSec >= (spawnSec - FIFTEEN_MINUTES_SEC) && nowSec <= endSec) {
        conditionMobs.push(mob.Name);
      }
    }
  });

  const filtered = getFilteredMobs();
  const sorted = filtered.sort(allTabComparator);
  const currentOrderStr = sorted.map(m => m.No).join(",");

  if (currentOrderStr !== lastRenderedOrderStr) {
    filterAndRender();
  } else {
    sorted.forEach(mob => {
      const card = document.querySelector(`.mob-card[data-mob-no="${mob.No}"]`);
      if (card) {
        updateProgressText(card, mob);
        updateProgressBar(card, mob);
        updateMobCount(card, mob);
        updateMapOverlay(card, mob);
      }
    });
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
  const mob = getState().mobs.find(m => m.No === mobId);
  if (!mob) return;

  mob.last_kill_time = Number(kill_time);
  mob.repopInfo = calculateRepop(mob, getState().maintenance);

  updateProgressBars();
}

setInterval(() => {
  updateProgressBars();
}, EORZEA_MINUTE_MS);

export {
  filterAndRender, updateProgressText, updateProgressBar, createMobCard, DOM, sortAndRedistribute, onKillReportReceived,
  updateProgressBars, updateAreaInfo, updateMapOverlay, updateMobCount, showColumnContainer, invalidateFilterCache
};
