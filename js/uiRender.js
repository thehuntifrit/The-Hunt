// uiRender.js

import { calculateRepop, formatDurationHM, formatLastKillTime, debounce, getEorzeaTime, EORZEA_MINUTE_MS } from "./cal.js";
import { drawSpawnPoint, isCulled, attachLocationEvents } from "./location.js";
import { getState, recalculateMob, requestWorkerCalculation, PROGRESS_CLASSES } from "./dataManager.js";
import { filterMobsByRankAndArea } from "./filterUI.js";
import { openReportModal } from "./modal.js";
import { allTabComparator } from "./mobSorter.js";
import { updateStatusContainerVisibility } from "./app.js";
import { createMobCard, updateProgressBar, updateProgressText, updateExpandablePanel, updateMemoIcon, updateMobCount, updateAreaInfo, updateMapOverlay } from "./mobCard.js";
import { checkAndNotify } from "./notificationManager.js";

const FIFTEEN_MINUTES_SEC = 15 * 60;

export const DOM = {
  masterContainer: document.getElementById('master-mob-container'),
  colContainer: document.getElementById('column-container'),
  cols: [],
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
  authModal: document.getElementById('auth-modal'),
  authLodestoneId: document.getElementById('auth-lodestone-id'),
  authVCode: document.getElementById('auth-v-code'),
  authStatus: document.getElementById('auth-modal-status'),
};

const groupSectionCache = new Map();

function getGroupKey(mob) {
  const info = mob.repopInfo || {};
  if (info.isMaintenanceStop || info.isBlockedByMaintenance) return "MAINTENANCE";
  if (info.status === "MaxOver") return "MAX_OVER";
  if (info.status === "PopWindow" || info.status === "ConditionActive" || info.status === "NextCondition") return "WINDOW";
  return "NEXT";
}

const GROUP_LABELS = {
  MAX_OVER: "Time Over",
  WINDOW: "Pop Window",
  NEXT: "Before Respawn",
  MAINTENANCE: "Maintenance"
};

function getOrCreateGroupSection(groupKey) {
  if (groupSectionCache.has(groupKey)) return groupSectionCache.get(groupKey);

  const section = document.createElement("section");
  section.className = "status-group w-full hidden mb-2";
  section.innerHTML = `
      <div class="status-group-separator text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-slate-700/50 pb-1 mb-2 pl-2">
          <span class="status-group-label">${GROUP_LABELS[groupKey]}</span>
      </div>
      <div class="group-columns grid grid-cols-1 gap-2">
          <div class="col-1 flex flex-col gap-0 border border-slate-800 rounded-md overflow-hidden bg-slate-900 shadow"></div>
      </div>
  `;

  const cols = [
    section.querySelector(".col-1")
  ];

  const result = { section, cols };
  groupSectionCache.set(groupKey, result);
  DOM.colContainer.appendChild(section);
  return result;
}

let filterCacheVersion = -1;
let cachedFilteredMobs = null;
let cachedSortedMobs = null;
let sortCacheValid = false;
let lastRenderedOrderStr = "";
let lastRenderedGroupStr = "";
let cachedMobMap = null;
let mobMapVersion = -1;
let currentMobsRef = null;

function getFilteredMobs() {
  const state = getState();
  const version = state._filterVersion || 0;

  if (filterCacheVersion === version && cachedFilteredMobs) {
    return cachedFilteredMobs;
  }

  filterCacheVersion = version;
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
  filterCacheVersion = -1;
  cachedFilteredMobs = null;
  cachedSortedMobs = null;
  sortCacheValid = false;
}

function getMobMap() {
  const mobs = getState().mobs;
  if (mobs === currentMobsRef && cachedMobMap) return cachedMobMap;
  currentMobsRef = mobs;
  cachedMobMap = new Map(mobs.map(m => [String(m.No), m]));
  return cachedMobMap;
}

function invalidateSortCache() {
  sortCacheValid = false;
  cachedSortedMobs = null;
}

export function updateHeaderTime() {
  const state = getState();
  if (!state) return;

  const now = new Date();
  const et = getEorzeaTime(now);
  const ltHours = String(now.getHours()).padStart(2, "0");
  const ltMinutes = String(now.getMinutes()).padStart(2, "0");
  const name = state.characterName || "";
  const elLT = document.getElementById("header-time-lt");
  const elET = document.getElementById("header-time-et");
  const elWelcome = document.getElementById("header-welcome-message");

  if (elLT && elET) {
    elLT.textContent = `${ltHours}:${ltMinutes}`;
    elET.textContent = `${et.hours}:${et.minutes}`;
  }

  if (elWelcome) {
    elWelcome.textContent = "";
  }
}

setInterval(updateHeaderTime, EORZEA_MINUTE_MS);

window.addEventListener('characterNameSet', () => {
  updateHeaderTime();
});

window.addEventListener('initialDataLoaded', () => {
  updateHeaderTime();
  filterAndRender({ isInitialLoad: true });
  sortAndRedistribute({ immediate: true });
  updateProgressBars();
});

window.addEventListener('mobUpdated', (e) => {
  const { mobNo, mob } = e.detail;
  checkAndNotify(mob);
  const card = cardCache.get(String(mobNo));
  if (card) {
    updateCardFull(card, mob);
    invalidateSortCache();
    sortAndRedistribute();
  }
});

window.addEventListener('filterChanged', () => {
  invalidateFilterCache();
  filterAndRender();
});

window.addEventListener('mobsUpdated', () => {
  updateProgressBars();
});

window.addEventListener('locationDataReady', () => {
  updateVisibleCards();
});

window.addEventListener('locationsUpdated', () => {
  invalidateFilterCache();
  const mobMap = getMobMap();

  cardCache.forEach((card, mobNoStr) => {
    const mob = mobMap.get(mobNoStr);
    if (mob) {
      updateMobCount(card, mob);
      updateMapOverlay(card, mob);
    }
  });
});

const visibleCards = new Set();
const cardObserver = new IntersectionObserver((entries) => {
  const mobMap = getMobMap();
  for (const entry of entries) {
    const mobNo = entry.target.dataset.mobNo;
    if (entry.isIntersecting) {
      visibleCards.add(mobNo);
      const mob = mobMap.get(mobNo);
      if (mob) updateCardFull(entry.target, mob);
    } else {
      visibleCards.delete(mobNo);
    }
  }
}, { threshold: 0 });

function updateCardFull(card, mob) {
  updateProgressText(card, mob);
  updateProgressBar(card, mob);
  updateMobCount(card, mob);
  updateMapOverlay(card, mob);
  updateExpandablePanel(card, mob);
  updateMemoIcon(card, mob);
}

function updateVisibleCards() {
  const mobMap = getMobMap();
  for (const mobNoStr of visibleCards) {
    const card = cardCache.get(mobNoStr);
    const mob = mobMap.get(mobNoStr);
    if (card && mob) updateCardFull(card, mob);
  }
}

const cardCache = new Map();

export const sortAndRedistribute = (options = {}) => {
  const { immediate = false } = options;
  const run = () => {
    filterAndRender();
    if (isInitialLoading) {
      isInitialLoading = false;
      // Double rAF to ensure browser has flushed DOM changes to the screen
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.dispatchEvent(new CustomEvent('initialSortComplete'));
        });
      });
    }
  };

  if (immediate) {
    run();
  } else {
    debouncedSortAndRedistribute();
  }
};

const debouncedSortAndRedistribute = debounce(() => {
  sortAndRedistribute({ immediate: true });
}, 200);

let isInitialLoading = false;

export function filterAndRender({ isInitialLoad = false } = {}) {
  const state = getState();

  if (!state.initialLoadComplete && !isInitialLoad) {
    return;
  }

  if (isInitialLoad) {
    isInitialLoading = true;
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

  let numCols = 1;

  const groups = {
    MAX_OVER: [],
    WINDOW: [],
    NEXT: [],
    MAINTENANCE: []
  };

  sortedMobs.forEach(mob => {
    groups[getGroupKey(mob)].push(mob);
  });

  const renderPromises = ["MAX_OVER", "WINDOW", "NEXT", "MAINTENANCE"].map(key => {
    const groupMobs = groups[key];
    const { section, cols } = getOrCreateGroupSection(key);

    if (groupMobs.length === 0) {
      section.classList.add("hidden");
      return;
    }
    section.classList.remove("hidden");

    cols.forEach((col, idx) => {
      if (idx >= numCols) col.classList.add("hidden");
      else col.classList.remove("hidden");
    });

    const colPointers = Array(numCols).fill(0);
    groupMobs.forEach((mob, index) => {
      const colIdx = index % numCols;
      const targetCol = cols[colIdx];
      let card = cardCache.get(String(mob.No));

      if (!card) {
        card = createMobCard(mob);
        cardCache.set(String(mob.No), card);
        cardObserver.observe(card);
      }

      const isFloating = card.classList.contains("is-floating-active");

      if (isFloating) {
        const placeholderId = card.dataset.placeholderId;
        const placeholder = placeholderId ? document.getElementById(placeholderId) : null;
        if (placeholder) {
          const currentAtPos = targetCol.children[colPointers[colIdx]];
          if (currentAtPos !== placeholder) {
            targetCol.insertBefore(placeholder, currentAtPos || null);
          }
          colPointers[colIdx]++;

          if (placeholder.nextSibling !== card) {
            targetCol.insertBefore(card, placeholder.nextSibling || null);
          }
          colPointers[colIdx]++;
        } else {
          const currentAtPos = targetCol.children[colPointers[colIdx]];
          if (currentAtPos !== card) {
            targetCol.insertBefore(card, currentAtPos || null);
          }
          colPointers[colIdx]++;
        }
      } else {
        while (targetCol.children[colPointers[colIdx]]?.classList.contains("mob-card-placeholder")) {
          colPointers[colIdx]++;
        }
        const currentAtPos = targetCol.children[colPointers[colIdx]];
        if (currentAtPos !== card) {
          targetCol.insertBefore(card, currentAtPos || null);
        }
        colPointers[colIdx]++;
      }

      if (isInitialLoad || visibleCards.has(String(mob.No))) {
        updateCardFull(card, mob);
      }
    });

    cols.forEach((col, i) => {
      const limit = (i < numCols) ? colPointers[i] : 0;
      let j = col.children.length - 1;
      while (j >= limit) {
        const child = col.children[j];
        if (child?.classList.contains("mob-card-placeholder")) {
          j--;
          continue;
        }
        if (child?.classList.contains("is-floating-active")) {
          j--;
          continue;
        }

        if (child?.classList.contains('mob-card')) {
          visibleCards.delete(child.dataset.mobNo);
        }
        col.removeChild(child);
        j--;
      }
    });
  });

  lastRenderedOrderStr = sortedMobs.map(m => m.No).join(",");
  lastRenderedGroupStr = sortedMobs.map(m => getGroupKey(m)).join(",");

  if (isInitialLoad) {
    isInitialSortingSuppressed = true;
    attachLocationEvents();

    setTimeout(() => {
      isInitialSortingSuppressed = false;
      sortAndRedistribute();
    }, 100);

    setTimeout(() => {
      isInitialSortingSuppressed = false;
    }, 3000);
  }

  updateVisibleCards();

  if (focusedMobNo) {
    const card = cardCache.get(String(focusedMobNo));
    if (card && focusedAction) {
      const input = card.querySelector(`input[data-action="${focusedAction}"]`);
      if (input) {
        input.focus();
        if (selectionStart !== null && selectionEnd !== null) {
          try { input.setSelectionRange(selectionStart, selectionEnd); } catch (e) { }
        }
      }
    }
  }
}

export function showColumnContainer() {
  if (!DOM.colContainer) return;

  requestAnimationFrame(() => {
    DOM.colContainer.classList.remove("opacity-0");

    requestAnimationFrame(() => {
      const overlay = document.getElementById("loading-overlay");
      if (overlay) {
        overlay.classList.add("hidden");
      }
    });
  });
}

let isInitialSortingSuppressed = false;

function updateProgressBars() {
  const state = getState();
  const conditionMobs = [];
  const nowSec = Date.now() / 1000;
  const mobMap = getMobMap();

  state.mobs.forEach(mob => {
    let needsWorkerRecalc = false;
    if (mob.repopInfo?.conditionWindowEnd && nowSec > mob.repopInfo.conditionWindowEnd.getTime() / 1000) {
      recalculateMob(mob.No);
      needsWorkerRecalc = true;
    }

    if (!needsWorkerRecalc && mob.repopInfo?.nextConditionSpawnDate && mob.repopInfo?.minRepop) {
      const spawnSec = mob.repopInfo.nextConditionSpawnDate.getTime() / 1000;
      if (nowSec >= mob.repopInfo.minRepop && spawnSec > nowSec) {
        recalculateMob(mob.No);
        needsWorkerRecalc = true;
      }
    }

    if (!needsWorkerRecalc) {
      mob.repopInfo = calculateRepop(mob, state.maintenance, {
        skipConditionCalc: true
      });
    }

    if (mob.repopInfo?.nextConditionSpawnDate && mob.repopInfo?.conditionWindowEnd) {
      const spawnSec = mob.repopInfo.nextConditionSpawnDate.getTime() / 1000;
      const endSec = mob.repopInfo.conditionWindowEnd.getTime() / 1000;
      if (nowSec >= (spawnSec - FIFTEEN_MINUTES_SEC) && nowSec <= endSec) {
        if (nowSec < spawnSec) {
          const diffMin = Math.ceil((spawnSec - nowSec) / 60);
          conditionMobs.push(`${mob.Name} (${diffMin}分前)`);
        }
      }
    }
  });

  for (const mobNoStr of visibleCards) {
    const card = cardCache.get(mobNoStr);
    const mob = mobMap.get(mobNoStr);
    if (card && mob) {
      checkAndNotify(mob);
      updateProgressText(card, mob);
      updateProgressBar(card, mob);
    }
  }

  invalidateSortCache();
  const sorted = getSortedFilteredMobs();
  const currentOrderStr = sorted.map(m => m.No).join(",");
  const currentGroupStr = sorted.map(m => getGroupKey(m)).join(",");

  if (!isInitialSortingSuppressed) {
    if (currentOrderStr !== lastRenderedOrderStr || currentGroupStr !== lastRenderedGroupStr) {
      sortAndRedistribute();
    }
  }

  if (DOM.statusMessageTemp) {
    if (conditionMobs.length > 0) {
      const newText = `🔜 ${conditionMobs.join(" / ")}`;
      if (DOM.statusMessageTemp.textContent !== newText) {
        DOM.statusMessageTemp.textContent = newText;
        DOM.statusMessageTemp.className = "text-amber-400 font-bold animate-pulse";
        DOM.statusMessageTemp.classList.remove("hidden");
      }
    } else {
      if (!DOM.statusMessageTemp.classList.contains("hidden")) {
        DOM.statusMessageTemp.textContent = "";
        DOM.statusMessageTemp.classList.add("hidden");
      }
    }
    updateStatusContainerVisibility();
  }
}

setInterval(() => {
  updateProgressBars();
}, EORZEA_MINUTE_MS);

export function renderSidebar() {
  if (document.getElementById('sidebar-menu')) return;
  
  const sidebar = document.createElement('aside');
  sidebar.id = 'sidebar-menu';
  sidebar.className = 'fixed left-0 top-0 h-full w-[56px] bg-slate-900 border-r border-slate-700/50 flex flex-col z-[100] text-gray-400';
  
  sidebar.innerHTML = `
    <div class="flex-1 flex flex-col items-center py-4 gap-6">
      <div class="text-[10px] font-bold leading-tight text-center text-cyan-400 mb-2">
        The<br>Hunt
      </div>
      <button id="sidebar-error-btn" style="display: none;" class="w-10 h-10 flex flex-col items-center justify-center rounded hover:bg-slate-800 transition-colors group">
        <span class="text-lg group-[.is-active]:text-red-500 group-[.is-active]:animate-pulse">⚠️</span>
        <span class="text-[8px] mt-0.5 group-[.is-active]:text-red-400 font-bold">エラー</span>
      </button>
      <button id="sidebar-info-btn" class="w-10 h-10 flex flex-col items-center justify-center rounded hover:bg-slate-800 transition-colors group">
        <span class="text-lg group-[.is-active]:text-cyan-400 group-[.is-active]:drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">📢</span>
        <span class="text-[8px] mt-0.5 group-[.is-active]:text-cyan-300 font-bold">告知</span>
      </button>
      <button id="sidebar-maintenance-btn" class="w-10 h-10 flex flex-col items-center justify-center rounded hover:bg-slate-800 transition-colors group">
        <span class="text-lg group-[.is-active]:text-yellow-400 group-[.is-active]:drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]">🛠️</span>
        <span class="text-[8px] mt-0.5 group-[.is-active]:text-yellow-300 font-bold">メンテ</span>
      </button>
      <button id="sidebar-select-btn" class="w-10 h-10 flex flex-col items-center justify-center rounded hover:bg-slate-800 transition-colors">
        <span class="text-lg">🏷️</span>
        <span class="text-[8px] mt-0.5">選択</span>
      </button>
    </div>
    
    <div class="w-8 mx-auto border-t border-slate-700"></div>
    
    <div class="flex flex-col items-center py-4 gap-4">
      <button id="sidebar-readme-btn" class="w-10 h-10 flex flex-col items-center justify-center rounded hover:bg-slate-800 transition-colors">
        <span class="text-lg">📋</span>
        <span class="text-[8px] mt-0.5">説明</span>
      </button>
      <button id="sidebar-notification-btn" class="w-10 h-10 flex flex-col items-center justify-center rounded hover:bg-slate-800 transition-colors">
        <span class="text-lg">🔔</span>
        <span class="text-[8px] mt-0.5">通知</span>
      </button>
    </div>
  `;
  document.body.appendChild(sidebar);

  const submenu = document.createElement('div');
  submenu.id = 'sidebar-submenu';
  submenu.className = 'fixed left-[56px] top-0 h-full w-[300px] bg-slate-800 border-r border-slate-700 shadow-2xl transform -translate-x-full transition-transform duration-300 z-[90] overflow-y-auto flex flex-col';
  
  submenu.innerHTML = `
    <div class="p-4 flex-1 flex flex-col">
      <div class="flex justify-between items-center mb-4 border-b border-slate-700 pb-2 shrink-0">
        <h2 id="submenu-title" class="text-base font-bold text-cyan-400 font-mono tracking-tight"></h2>
        <button id="submenu-close-btn" class="text-gray-400 hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded hover:bg-slate-700 bg-slate-800 border border-slate-600">✕</button>
      </div>
      <div class="border border-slate-600 rounded p-3 text-sm text-gray-300 flex-1 overflow-y-auto w-full">
        <div id="submenu-content-info" class="hidden w-full whitespace-pre-wrap"></div>
        <div id="submenu-content-maintenance" class="hidden w-full text-center"></div>
        <div id="submenu-content-select" class="hidden flex-col gap-4 items-start w-full"></div>
        <div id="submenu-content-readme" class="hidden w-full relative"></div>
      </div>
    </div>
  `;
  document.body.appendChild(submenu);

  const moveIfExists = (srcId, destId) => {
    const src = document.getElementById(srcId);
    const dest = document.getElementById(destId);
    if (src && dest) {
      dest.appendChild(src);
    }
  };

  moveIfExists('status-message-telop', 'submenu-content-info');
  moveIfExists('status-message-maintenance', 'submenu-content-maintenance');
  moveIfExists('rank-tabs', 'submenu-content-select');
  moveIfExists('area-filter-panel-desktop', 'submenu-content-select');
  moveIfExists('area-filter-panel-mobile', 'submenu-content-select');
  moveIfExists('readme-container', 'submenu-content-readme');

  const rc = document.getElementById('readme-container');
  if (rc) {
      rc.classList.remove('hidden', 'mt-8', 'bg-slate-900/80', 'p-6', 'rounded-xl', 'shadow-2xl');
      rc.classList.add('w-full', 'bg-transparent', 'border-none', 'p-0');
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderSidebar);
} else {
  renderSidebar();
}

