import { getState, recalculateMob, requestWorkerCalculation, PROGRESS_CLASSES, EXPANSION_MAP, updateAllMobCullStatuses, loadBaseMobData, startRealtime, setOpenMobCardNo, setUserId, setLodestoneId, setCharacterName, setVerified } from "./2dataManager.js";
import { calculateRepop, getDurationDHMParts, formatDurationDHM, formatDurationColon, formatMMDDHHmm, debounce, getEorzeaTime, EORZEA_MINUTE_MS } from "./2cal.js";
import { isCulled, attachLocationEvents, attachMobCardEvents, createMobCard, updateProgressBar, updateProgressText, updateExpandablePanel, updateMemoIcon, updateMobCount, updateAreaInfo, updateMapOverlay, createSimpleMobItem, updateSimpleMobItem, escapeHtml } from "./2mobCard.js";
import { ALL_RANK_TABS, getGroupKey, GROUP_LABELS, getOrCreateGroupSection, getSortedFilteredMobs, getFilteredMobs, invalidateFilterCache, invalidateSortCache, allTabComparator } from "./2mobSorter.js";
import { closeReportModal, openAuthModal, openReportModal, initModal, closeAuthModal } from "./2modal.js";
import { handleAreaFilterClick, initSidebar, initNotification, checkAndNotify } from "./2sidebar.js";
import { initializeAuth, getUserData, submitReport, submitMemo } from "./2server.js";
import { initTooltip } from "./2mobCard.js";
import { initGlobalMagnifier } from "./2mobCard.js";
import { initSidebar } from "./2sidebar.js";
import "./2readme.js";
import { initNotification } from "./2sidebar.js";

async function initApp() {
    try {
        initTooltip();
        initGlobalMagnifier();
        loadBaseMobData();

        initializeAuth().then(async (userId) => {
            if (userId) {
                setUserId(userId);
                const userData = await getUserData(userId);
                if (userData && userData.lodestone_id) {
                    setLodestoneId(userData.lodestone_id);
                    if (userData.character_name) setCharacterName(userData.character_name);
                    setVerified(true);
                } else {
                    setVerified(false);
                    setLodestoneId(null);
                    setCharacterName(null);
                }
            } else {
                setVerified(false);
                setUserId(null);
                setLodestoneId(null);
                setCharacterName(null);
            }
        }).catch(err => {
            console.error("Auth initialization error:", err);
            setVerified(false);
        });

        startRealtime();
        setOpenMobCardNo(null);
        initModal();
        renderMaintenanceStatus();
        updateHeaderTime();
        initSidebar();
        initNotification();
        attachMobCardEvents();
        attachLocationEvents();
        attachGlobalEventListeners();

        window.addEventListener('maintenanceUpdated', () => {
            renderMaintenanceStatus();
        });

        window.addEventListener('pageshow', (event) => {
            if (event.persisted) {
                setOpenMobCardNo(null);
                document.querySelectorAll('.expandable-panel.open').forEach(el => el.classList.remove('open'));
            }
        });

        window.addEventListener('initialDataLoaded', () => {
            try {
                renderMaintenanceStatus();
            } catch (e) {
                console.error("Initial maintenance render failed:", e);
            }
        }, { once: true });

        const loadingTimeout = setTimeout(() => {
            const overlay = document.getElementById("loading-overlay");
            if (overlay && !overlay.classList.contains("hidden")) {
                console.warn("Loading timeout: Forcing UI display.");
                if (!getState().initialLoadComplete) {
                    window.dispatchEvent(new CustomEvent('initialDataLoaded'));
                }
                showColumnContainer();
                overlay.classList.add("hidden");
                showToast("データ同期がタイムアウトしました。既存のデータで表示します。", "info");
            }
        }, 10000);

        window.addEventListener('initialSortComplete', () => {
            clearTimeout(loadingTimeout);
            try {
                renderMaintenanceStatus();
                showColumnContainer();

                const isFirstVisit = !localStorage.getItem("has_visited");
                if (isFirstVisit) {
                    localStorage.setItem("has_visited", "true");
                    if (window.openUserManual) {
                        window.openUserManual();
                    }
                }
            } catch (e) {
                console.error("Initial render show failed:", e);
                const overlay = document.getElementById("loading-overlay");
                if (overlay) overlay.classList.add("hidden");
            }
        }, { once: true });

    } catch (e) {
        console.error("App initialization failed:", e);
        const overlay = document.getElementById("loading-overlay");
        if (overlay) {
            overlay.classList.add("hidden");
        }
    }
}

function attachGlobalEventListeners() {
    let prevWidth = window.innerWidth;
    window.addEventListener("resize", debounce(() => {
        const currentWidth = window.innerWidth;
        if (currentWidth !== prevWidth) {
            prevWidth = currentWidth;
            sortAndRedistribute();
        }
    }, 100));

    document.addEventListener("click", (e) => {
        if (e.target.closest(".tab-button")) {
            return;
        }
        if (e.target.closest(".area-filter-btn")) {
            handleAreaFilterClick(e);
            return;
        }
        if (e.target === DOM.cardOverlayBackdrop) {
            setOpenMobCardNo(null);
            sortAndRedistribute({ immediate: true });
        }
    });

    DOM.colContainer.addEventListener("click", (e) => {
        if (e.target.closest(".report-side-bar")) return;

        if (e.target.closest("[data-toggle='card-header']")) {
            const card = e.target.closest(".mob-card");
            if (card) {
                const mobNo = parseInt(card.dataset.mobNo, 10);
                const currentOpen = getState().openMobCardNo;
                const nextOpen = (currentOpen === mobNo) ? null : mobNo;

                setOpenMobCardNo(nextOpen);
                sortAndRedistribute({ immediate: true });
            }
        }
    });

    if (DOM.reportForm) {
        DOM.reportForm.addEventListener("submit", handleReportSubmit);
    }

    document.addEventListener("change", async (e) => {
        if (e.target.matches("input[data-action='save-memo']")) {
            const input = e.target;
            const mobNo = parseInt(input.dataset.mobNo, 10);
            const text = input.value;

            if (!getState().isVerified) {
                input.value = "";
                openAuthModal();
                return;
            }

            await submitMemo(mobNo, text);
        }
    });

    let touchStartX = 0;
    document.addEventListener("touchstart", (e) => {
        const reportBtn = e.target.closest(".report-side-bar");
        if (reportBtn) {
            touchStartX = e.changedTouches[0].screenX;
        }
    }, { passive: true });

    document.addEventListener("touchend", (e) => {
        const reportBtn = e.target.closest(".report-side-bar");
        if (reportBtn) {
            const touchEndX = e.changedTouches[0].screenX;
            if (touchEndX - touchStartX > 30) {
                const mobNo = parseInt(reportBtn.dataset.mobNo, 10);
                const type = reportBtn.dataset.reportType;
                if (type === 'modal') {
                    openReportModal(mobNo);
                } else {
                    reportBtn.click();
                }
            }
        }
    }, { passive: true });

    document.addEventListener("keydown", (e) => {
        if (e.target.matches("input[data-action='save-memo']")) {
            if (e.key === "Enter") {
                e.target.blur();
            }
            e.stopPropagation();
        }
    });

    document.addEventListener("click", (e) => {
        if (e.target.matches("input[data-action='save-memo']")) {
            e.stopPropagation();
        }
    });

}

export const DOM = {
  masterContainer: null,
  colContainer: document.getElementById('column-container'),
  cols: [],
  rankTabs: null,
  areaFilterWrapper: null,
  areaFilterPanel: null,
  statusMessage: null,
  reportModal: document.getElementById('report-modal'),
  reportForm: document.getElementById('report-form'),
  modalMobName: document.getElementById('modal-mob-name'),
  modalStatus: document.getElementById('modal-status'),
  modalTimeInput: document.getElementById('report-datetime'),
  modalForceSubmit: document.getElementById('report-force-submit'),
  statusMessageTemp: null,
  authModal: document.getElementById('auth-modal'),
  authLodestoneId: document.getElementById('auth-lodestone-id'),
  authVCode: document.getElementById('auth-v-code'),
  authStatus: document.getElementById('auth-modal-status'),
  pcLeftList: document.getElementById('pc-left-list'),
  pcRightDetail: document.getElementById('pc-right-detail'),
  pcLayout: document.getElementById('pc-layout'),
  mobileLayout: document.getElementById('mobile-layout'),
  cardOverlayBackdrop: document.getElementById('card-overlay-backdrop'),
  mobileDetailOverlay: document.getElementById('mobile-detail-overlay'),
};

const visibleCards = new Set();
const cardObserver = new IntersectionObserver((entries) => {
  const state = getState();
  const isMobile = window.innerWidth < 1024;
  if (isMobile && state.openMobCardNo !== null) return;

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

export function updateCardFull(card, mob) {
  const isDetail = card.classList.contains('pc-detail-card');
  const isListItem = card.classList.contains('pc-list-item');

  if (isDetail) {
    updateProgressText(card, mob);
    updateProgressBar(card, mob);
    updateMobCount(card, mob);
    updateMapOverlay(card, mob);
    updateExpandablePanel(card, mob);
    updateMemoIcon(card, mob);
  } else if (isListItem) {
    updateSimpleMobItem(card, mob);
  }
}

export function updateVisibleCards() {
  const mobMap = getMobMap();
  for (const mobNoStr of visibleCards) {
    const card = cardCache.get(mobNoStr);
    const mob = mobMap.get(mobNoStr);
    if (card && mob) updateCardFull(card, mob);
  }
  updateDetailCardRealtime(mobMap);
}

export function updateDetailCardRealtime(mobMap) {
  const rightPane = DOM.pcRightDetail || document.getElementById("pc-right-detail");
  if (rightPane && rightPane.dataset.renderedMobNo && rightPane.dataset.renderedMobNo !== "none") {
    const detailCard = rightPane.firstElementChild;
    const mob = mobMap.get(rightPane.dataset.renderedMobNo);
    if (detailCard && mob) updateCardFull(detailCard, mob);
  }

  const mobileOverlay = DOM.mobileDetailOverlay || document.getElementById("mobile-detail-overlay");
  if (mobileOverlay && mobileOverlay.dataset.renderedMobNo && mobileOverlay.dataset.renderedMobNo !== "none") {
    const detailCard = mobileOverlay.querySelector('.pc-detail-card');
    const mob = mobMap.get(mobileOverlay.dataset.renderedMobNo);
    if (detailCard && mob) {
      updateCardFull(detailCard, mob);
    }
  }
}

export const cardCache = new Map();

function getMobMap() {
  const mobs = getState().mobs;
  if (mobs === currentMobsRef && cachedMobMap) return cachedMobMap;
  currentMobsRef = mobs;
  cachedMobMap = new Map(mobs.map(m => [String(m.No), m]));
  return cachedMobMap;
}
let cachedMobMap = null;
let currentMobsRef = null;

export function updateHeaderTime() {
    const state = getState();
    if (!state) return;

    const now = new Date();
    const et = getEorzeaTime(now);
    const lt = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const etStr = `${et.hours}:${et.minutes}`;

    ["pc-time-lt", "mobile-time-lt"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = lt;
    });
    ["pc-time-et", "mobile-time-et"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = etStr;
    });
}

document.addEventListener('DOMContentLoaded', initApp);


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
  const lg = 1024;
  const isPC = width >= lg;

  const pcLayout = DOM.pcLayout || document.getElementById("pc-layout");
  const mobileLayout = DOM.mobileLayout || document.getElementById("mobile-layout");

  if (isPC) {
    if (pcLayout) pcLayout.classList.remove("hidden");
    if (mobileLayout) mobileLayout.classList.add("hidden");
  } else {
    if (pcLayout) pcLayout.classList.add("hidden");
    if (mobileLayout) mobileLayout.classList.remove("hidden");
  }
  const isMobile = !isPC;
  const isOverlayOpen = state.openMobCardNo !== null;

  if (isMobile && isOverlayOpen) {
  } else {
    let numCols = 1;
    if (isPC) numCols = 3;

    const groups = {
      MAX_OVER: [],
      WINDOW: [],
      NEXT: [],
      MAINTENANCE: []
    };

    sortedMobs.forEach(mob => {
      groups[getGroupKey(mob)].push(mob);
    });

    ["MAX_OVER", "WINDOW", "NEXT", "MAINTENANCE"].forEach(key => {
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

        updateCardFull(card, mob);
      });

      cols.forEach((col, i) => {
        const limit = (i < numCols) ? colPointers[i] : 0;
        let j = col.children.length - 1;
        while (j >= limit) {
          const child = col.children[j];
          if (child?.classList.contains("mob-card-placeholder") || child?.classList.contains("is-floating-active")) {
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

    if (isPC && DOM.pcLeftList) {
      const currentNodes = Array.from(DOM.pcLeftList.children);
      const currentMap = new Map();
      currentNodes.forEach(node => {
        if (node.dataset.mobNo) currentMap.set(`mob-${node.dataset.mobNo}`, node);
        else if (node.textContent) currentMap.set(`header-${node.textContent}`, node);
      });

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

    }
  }

  const rightPane = DOM.pcRightDetail || document.getElementById("pc-right-detail");
  const mobileOverlay = DOM.mobileDetailOverlay || document.getElementById("mobile-detail-overlay");
  const overlayBackdrop = DOM.cardOverlayBackdrop || document.getElementById("card-overlay-backdrop");

  if (isPC) {
    if (rightPane) {
      if (state.openMobCardNo) {
        if (rightPane.dataset.renderedMobNo !== String(state.openMobCardNo)) {
          const targetMob = state.mobs.find(m => m.No === state.openMobCardNo);
          if (targetMob) {
            rightPane.innerHTML = "";
            rightPane.appendChild(createMobCard(targetMob, true));
            rightPane.dataset.renderedMobNo = String(state.openMobCardNo);
          }
        }
      } else {
        if (rightPane.dataset.renderedMobNo !== "none") {
          rightPane.innerHTML = '<div class="text-center text-gray-500 mt-20 text-sm">モブを選択すると詳細が表示されます</div>';
          rightPane.dataset.renderedMobNo = "none";
        }
      }
    }
    if (overlayBackdrop) overlayBackdrop.classList.add("hidden");
  } else {
    if (mobileOverlay && overlayBackdrop) {
      if (state.openMobCardNo) {
        if (mobileOverlay.dataset.renderedMobNo !== String(state.openMobCardNo)) {
          const targetMob = state.mobs.find(m => m.No === state.openMobCardNo);
          if (targetMob) {
            mobileOverlay.innerHTML = "";
            mobileOverlay.appendChild(createMobCard(targetMob, true));
            mobileOverlay.dataset.renderedMobNo = String(state.openMobCardNo);

            overlayBackdrop.classList.remove("hidden");
          }
        }
      } else {
        mobileOverlay.innerHTML = "";
        mobileOverlay.dataset.renderedMobNo = "none";
        overlayBackdrop.classList.add("hidden");
      }
    }
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
    DOM.colContainer.classList.add("is-ready");

    requestAnimationFrame(() => {
      const overlay = document.getElementById("loading-overlay");
      if (overlay) {
        overlay.classList.add("hidden");
      }
    });
  });
}

let isInitialSortingSuppressed = false;

export function updateProgressBars() {
  const state = getState();
  const mobMap = getMobMap();
  const filtered = getFilteredMobs();
  const isMobile = window.innerWidth < 1024;
  const isOverlayOpen = state.openMobCardNo !== null;

  if (!(isMobile && isOverlayOpen)) {
    filtered.forEach(mob => {
      const card = cardCache.get(String(mob.No));
      if (card) {
        checkAndNotify(mob);
        updateProgressText(card, mob);
        updateProgressBar(card, mob);
      }
    });

    if (DOM.pcLeftList) {
      const listItems = DOM.pcLeftList.querySelectorAll('.pc-list-item');
      listItems.forEach(item => {
        const mobNo = item.dataset.mobNo;
        const mob = mobMap.get(String(mobNo));
        if (mob) {
          updateSimpleMobItem(item, mob);
        }
      });
    }
  }

  const rightPane = DOM.pcRightDetail || document.getElementById("pc-right-detail");
  const mobileOverlay = DOM.mobileDetailOverlay || document.getElementById("mobile-detail-overlay");

  [rightPane, mobileOverlay].forEach(container => {
    if (container && container.dataset.renderedMobNo && container.dataset.renderedMobNo !== "none") {
      const detailCard = container.querySelector('.pc-detail-card') || container.firstElementChild;
      const mob = mobMap.get(container.dataset.renderedMobNo);
      if (detailCard && mob) {
        updateCardFull(detailCard, mob);
      }
    }
  });

  if (!(isMobile && isOverlayOpen)) {
    invalidateSortCache();
    const sorted = getSortedFilteredMobs();
    const currentOrderStr = sorted.map(m => m.No).join(",");
    const currentGroupStr = sorted.map(m => getGroupKey(m)).join(",");

    if (!isInitialSortingSuppressed) {
      if (currentOrderStr !== lastOrderStr || currentGroupStr !== lastGroupStr) {
        sortAndRedistribute();
      }
    }
    lastOrderStr = currentOrderStr;
    lastGroupStr = currentGroupStr;
  }
}
let lastOrderStr = "";
let lastGroupStr = "";

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
    updateVisibleCards();
});

setInterval(() => {
    updateProgressBars();
}, 1000);

setInterval(updateHeaderTime, EORZEA_MINUTE_MS);

export function handleReportResult(result) {
    if (!result.success) {
        if (result.code === "permission-denied" || (result.error && result.error.includes("permission"))) {
            showToast("アクセス権限エラーが発生しました。\n再度認証を行ってください。", "error");
            openAuthModal();
        } else {
            showToast("報告エラー: " + (result.error || "不明なエラー"), "error");
        }
    } else {
        showToast("討伐報告を送信しました", "success");
    }
}

export async function handleInstantReport(mobNo, rank) {
    const result = await submitReport(mobNo, new Date().toISOString());
    handleReportResult(result);
}

async function handleReportSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const mobNo = parseInt(form.dataset.mobNo, 10);
    const timeISO = form.elements["kill-time"].value;
    const result = await submitReport(mobNo, timeISO);
    handleReportResult(result);
    if (result.success) closeReportModal();
}
