// uiRender.js

import { calculateRepop, formatDurationHM, formatLastKillTime, debounce, getEorzeaTime, EORZEA_MINUTE_MS } from "./cal.js";
import { drawSpawnPoint, isCulled, attachLocationEvents } from "./location.js";
import { getState, recalculateMob, requestWorkerCalculation, PROGRESS_CLASSES } from "./dataManager.js";
import { filterMobsByRankAndArea } from "./filterUI.js";
import { openReportModal } from "./modal.js";
import { allTabComparator } from "./mobSorter.js";
import { updateStatusContainerVisibility } from "./app.js";
import { createMobCard, updateProgressBar, updateProgressText, updateExpandablePanel, updateMemoIcon, updateMobCount, updateAreaInfo, updateMapOverlay, createSimpleMobItem, updateSimpleMobItem } from "./mobCard.js";
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
  pcLeftList: document.getElementById('pc-left-list'),
  pcRightDetail: document.getElementById('pc-right-detail'),
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
  section.className = "status-group w-full hidden";
  section.innerHTML = `
      <div class="status-group-separator">
          <span class="status-group-label">${GROUP_LABELS[groupKey]}</span>
      </div>
      <div class="group-columns grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div class="col-1 flex flex-col gap-4"></div>
          <div class="col-2 flex flex-col gap-4"></div>
          <div class="col-3 flex flex-col gap-4"></div>
      </div>
  `;

  const cols = [
    section.querySelector(".col-1"),
    section.querySelector(".col-2"),
    section.querySelector(".col-3")
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
    if (name) {
      elWelcome.textContent = `ようこそ ${name}`;
    } else {
      elWelcome.textContent = "";
    }
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
const simpleItemCache = new Map();

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

  const width = window.innerWidth;
  const md = 768;
  const lg = 1024;
  let numCols = 1;
  if (width >= lg) numCols = 3;
  else if (width >= md) numCols = 2;

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

    // PC Layout specific rendering: Surgical update to prevent animation reset
    if (DOM.pcLeftList) {
      // Collect the current DOM nodes and their identifiers
      const currentNodes = Array.from(DOM.pcLeftList.children);
      const currentMap = new Map();
      currentNodes.forEach(node => {
          if (node.dataset.mobNo) currentMap.set(`mob-${node.dataset.mobNo}`, node);
          else if (node.textContent) currentMap.set(`header-${node.textContent}`, node);
      });

      // Prepare the intended child list
      const nextChildren = [];
      ["MAX_OVER", "WINDOW", "NEXT", "MAINTENANCE"].forEach(key => {
        const groupMobs = groups[key];
        if (groupMobs.length === 0) return;
        
        const headerText = GROUP_LABELS[key];
        const headerKey = `header-${headerText}`;
        let header = currentMap.get(headerKey);
        if (!header) {
          header = document.createElement("div");
          header.className = "text-xs font-bold text-gray-500 uppercase mt-2 mb-1 border-b border-gray-700/50 pb-1 pl-1";
          header.textContent = headerText;
        }
        nextChildren.push(header);

        groupMobs.forEach(mob => {
          const mobKey = `mob-${mob.No}`;
          let item = currentMap.get(mobKey);
          if (!item) {
            item = createSimpleMobItem(mob);
          } else {
            updateSimpleMobItem(item, mob);
          }
          
          const state = getState();
          if (state.openMobCardNo === mob.No) {
            item.classList.add("selected");
          } else {
            item.classList.remove("selected");
          }
          nextChildren.push(item);
        });
      });

      nextChildren.forEach((child, index) => {
        if (DOM.pcLeftList.children[index] !== child) {
          DOM.pcLeftList.insertBefore(child, DOM.pcLeftList.children[index] || null);
        }
      });

      while (DOM.pcLeftList.children.length > nextChildren.length) {
        DOM.pcLeftList.removeChild(DOM.pcLeftList.lastElementChild);
      }

      // Sync selected state even if order didn't change
      const state = getState();
      Array.from(DOM.pcLeftList.children).forEach(child => {
          if (child.dataset.mobNo) {
              if (parseInt(child.dataset.mobNo, 10) === state.openMobCardNo) {
                  child.classList.add("selected");
              } else {
                  child.classList.remove("selected");
              }
          }
      });
    }

    if (DOM.pcRightDetail) {
      const state = getState();
      if (state.openMobCardNo) {
        const targetMob = state.mobs.find(m => m.No === state.openMobCardNo);
        if (targetMob) {
            updateCardFull(DOM.pcRightDetail, targetMob);
        }
      } else {
        DOM.pcRightDetail.innerHTML = '<div class="text-center text-gray-500 mt-20 text-sm">モブを選択すると詳細が表示されます</div>';
      }
    }
    
    if (navigator.userAgent.includes("Safari") && !navigator.userAgent.includes("Chrome")) {
      const headers = DOM.pcLeftList.querySelectorAll(".text-xs");
      headers.forEach(header => {
        header.style.transform = "translateZ(0)";
      });
    }
  
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
