// uiRender.js

import { calculateRepop, formatDurationHM, formatLastKillTime, debounce, getEorzeaTime, EORZEA_MINUTE_MS } from "./cal.js";
import { drawSpawnPoint, isCulled, attachLocationEvents } from "./location.js";
import { getState, recalculateMob, requestWorkerCalculation, PROGRESS_CLASSES } from "./dataManager.js";
import { filterMobsByRankAndArea } from "./filterUI.js";
import { openReportModal } from "./modal.js";
import { allTabComparator } from "./mobSorter.js";
import {
  createMobCard, updateProgressBar, updateProgressText, updateExpandablePanel,
  updateMemoIcon, updateMobCount, updateAreaInfo, updateMapOverlay
} from "./mobCard.js";

export const DOM = {
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
let lastRenderedOrderStr = "";

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

// --- Event Listeners ---
window.addEventListener('initialDataLoaded', () => {
  filterAndRender({ isInitialLoad: true });
  updateProgressBars();
});

window.addEventListener('mobUpdated', (e) => {
  const { mobNo, mob } = e.detail;
  const card = document.querySelector(`.mob-card[data-mob-no="${mobNo}"]`);
  if (card) {
    updateProgressText(card, mob);
    updateProgressBar(card, mob);
    updateMobCount(card, mob);
    updateMapOverlay(card, mob);
    updateExpandablePanel(card, mob);
    updateMemoIcon(card, mob);
  }
});

window.addEventListener('filterChanged', () => {
  invalidateFilterCache();
  filterAndRender();
});

window.addEventListener('mobsUpdated', () => {
  updateProgressBars();
});

window.addEventListener('locationsUpdated', (e) => {
  const { locationsMap } = e.detail;
  invalidateFilterCache();
  const sorted = getSortedFilteredMobs();
  const mobMap = new Map(sorted.map(m => [String(m.No), m]));

  for (const mobNoStr of visibleCards) {
    const card = document.querySelector(`.mob-card[data-mob-no="${mobNoStr}"]`);
    if (card) {
      const mob = mobMap.get(mobNoStr);
      if (mob) {
        updateMobCount(card, mob);
        updateMapOverlay(card, mob);
      }
    }
  }
});

const visibleCards = new Set();
const cardObserver = new IntersectionObserver((entries) => {
  const mobMap = new Map(getState().mobs.map(m => [String(m.No), m]));
  for (const entry of entries) {
    const mobNo = entry.target.dataset.mobNo;
    if (entry.isIntersecting) {
      visibleCards.add(mobNo);
      const mob = mobMap.get(mobNo);
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
  }
}, { threshold: 0 });

function updateVisibleCards() {
  const sorted = getSortedFilteredMobs();
  const mobMap = new Map(sorted.map(m => [String(m.No), m]));

  for (const mobNoStr of visibleCards) {
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
  }
}

export function filterAndRender({ isInitialLoad = false } = {}) {
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

export function showColumnContainer() {
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


function updateProgressBars() {
  const state = getState();
  const conditionMobs = [];
  const nowSec = Date.now() / 1000;
  const mobMap = new Map(state.mobs.map(m => [String(m.No), m]));

  for (const mobNoStr of visibleCards) {
    const mob = mobMap.get(mobNoStr);
    if (!mob || !mob.repopInfo) continue;

    mob.repopInfo = calculateRepop(mob, state.maintenance, {
      skipConditionCalc: false
    });

    if (mob.repopInfo.conditionWindowEnd && nowSec > mob.repopInfo.conditionWindowEnd.getTime() / 1000) {
      recalculateMob(mob.No);
    }
  }

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

export const sortAndRedistribute = debounce(() => filterAndRender(), 200);

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
