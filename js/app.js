import { getState, recalculateMob, requestWorkerCalculation, PROGRESS_CLASSES, EXPANSION_MAP, updateAllMobCullStatuses, loadBaseMobData, startRealtime, setOpenMobCardNo, setUserId, setLodestoneId, setCharacterName, setVerified, isCulled } from "./dataManager.js";
import { calculateRepop, getDurationDHMParts, formatDurationDHM, formatDurationColon, formatMMDDHHmm, debounce, getEorzeaTime, EORZEA_MINUTE_MS } from "./cal.js";
import { attachMobCardEvents, createMobCard, updateProgressBar, updateProgressText, updateExpandablePanel, updateMemoIcon, updateMobCount, updateAreaInfo, updateMapOverlay, createSimpleMobItem, updateSimpleMobItem, escapeHtml, initTooltip, initGlobalMagnifier } from "./mobCard.js";
import { getGroupKey, GROUP_LABELS, getOrCreateGroupSection, getSortedFilteredMobs, getFilteredMobs, invalidateFilterCache, invalidateSortCache, allTabComparator } from "./mobSorter.js";
import { closeReportModal, openAuthModal, openReportModal, initModal, closeAuthModal } from "./modal.js";
import { handleAreaFilterClick, initAppNav, initNotification, checkAndNotify, updateErrorPanel } from "./sidebar.js";
import { initializeAuth, getUserData, submitReport, submitMemo, toggleCrushStatus } from "./server.js";
import { openUserManual } from "./readme.js";

// ─── 定数・DOM ──────────────────────────────────────────
export const DOM = {
  colContainer: document.getElementById('column-container'),
  pcLeftList: document.getElementById('moblist-container'),
  pcRightDetail: document.getElementById('mobcard-detail'),
  mobileDetailOverlay: document.getElementById('mobcard-overlay'),
  cardOverlayBackdrop: document.getElementById('mobcard-overlay-backdrop'),
  reportModal: document.getElementById('report-modal'),
  reportForm: document.getElementById('report-form'),
  modalMobName: document.getElementById('modal-mob-name'),
  modalStatus: document.getElementById('modal-status'),
  modalTimeInput: document.getElementById('report-datetime'),
  modalForceSubmit: document.getElementById('report-force-submit'),
  authModal: document.getElementById('auth-modal'),
  authVCode: document.getElementById('auth-v-code'),
  authStatus: document.getElementById('auth-modal-status'),
  authLodestoneId: document.getElementById('auth-lodestone-id'),
  loadingOverlay: document.getElementById('loading-overlay'),
};

export const cardCache = new Map();

const visibleCards = new Set();

const CULLED_CLASS_MAP = {
  "color-b1": "color-b1-culled",
  "color-b2": "color-b2-culled",
}

const UNCULLED_CLASS_MAP = {
  "color-b1-culled": "color-b1",
  "color-b2-culled": "color-b2",
}

let cachedMobMap = null;
let currentMobsRef = null;
let lastRenderedOrderStr = "";
let lastRenderedGroupStr = "";
let isInitialLoading = false;
let isInitialSortingSuppressed = false;
let lastClickTime = 0;
let lastClickLocationId = null;
let locationEventsAttached = false;

// ─── 初期化 ─────────────────────────────────────────────
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
      // 認証エラーでもUI構築を継続
      window.dispatchEvent(new CustomEvent('initialDataLoaded'));
    });

    startRealtime();
    setOpenMobCardNo(null);
    initModal();
    renderMaintenanceStatus();
    updateHeaderTime();
    initAppNav();
    initNotification();
    attachMobCardEvents();
    attachLocationEvents();
    attachGlobalEventListeners();
    window.renderMaintenanceStatus = renderMaintenanceStatus;

    window.addEventListener('maintenanceUpdated', () => {
      renderMaintenanceStatus();
    });

    window.addEventListener('pageshow', (event) => {
      if (event.persisted) {
        setOpenMobCardNo(null);
        document.querySelectorAll('.appnav-rank-item.appnav-active').forEach(el => el.classList.remove('appnav-active'));
      }
    });

    window.addEventListener('initialDataLoaded', () => {
      try {
        renderMaintenanceStatus();
        updateErrorPanel();
      } catch (e) {
        console.error("Initial maintenance render failed:", e);
      }
    }, { once: true });

    const loadingTimeout = setTimeout(() => {
      const overlay = DOM.loadingOverlay;
      if (overlay && !overlay.classList.contains("hidden")) {
        console.warn("Loading timeout: Forcing UI display.");
        if (!getState().initialLoadComplete) {
          window.dispatchEvent(new CustomEvent('initialDataLoaded'));
        }
        showColumnContainer();
        overlay.classList.add("hidden");
        showToast("データ同期がタイムアウトしました。既存のデータで表示します。", "info");
      }
    }, 6000);

    window.addEventListener('criticalDataLoadError', (e) => {
      clearTimeout(loadingTimeout);
      const overlay = DOM.loadingOverlay;
      if (overlay) {
        const spinner = overlay.querySelector('.loading-spinner');
        if (spinner) spinner.style.display = 'none';
        const text = overlay.querySelector('.loading-text');
        if (text) {
          text.style.whiteSpace = "pre-wrap";
          text.textContent = e.detail.message;
          text.style.color = '#ef4444';
        }
      }
    }, { once: true });

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
        showColumnContainer();
      }
    }, { once: true });

  } catch (e) {
    console.error("App initialization failed:", e);
    showColumnContainer();
  }
  syncMobCardPanePosition();
}

function syncMobCardPanePosition() {
  const pane = document.getElementById('mobcard-pane');
  if (pane && window.innerWidth >= 1024) {
    pane.style.left = '';
    pane.style.width = '';
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

// ─── メンテナンス表示 ───────────────────────────────────
async function getMaintenanceStatus() {
  const state = getState();
  const maintenance = state.maintenance;

  if (!maintenance || !maintenance.start || !maintenance.end) {
    return {
      is_active: false,
      scheduled: false,
      message: maintenance ? maintenance.message : ""
    };
  }

  const now = new Date();
  const start = new Date(maintenance.start);
  const end = new Date(maintenance.end);
  const showFrom = new Date(start.getTime() - 7 * 24 * 60 * 60 * 1000);
  const showUntil = new Date(end.getTime() + 4 * 24 * 60 * 60 * 1000);

  const isWithinDisplayWindow = now >= showFrom && now <= showUntil;

  let status = {
    is_active: false,
    scheduled: false,
    start_time: maintenance.start,
    end_time: maintenance.end,
    message: maintenance.message || ""
  };

  if (isWithinDisplayWindow) {
    if (now >= start && now <= end) {
      status.is_active = true;
    } else if (now < start) {
      status.scheduled = true;
    }
  }

  return status;
}

export async function renderMaintenanceStatus() {
  const state = getState();
  const maintenance = await getMaintenanceStatus();

  const maintPanels = document.querySelectorAll(".js-maintenance-content");
  const telopPanels = document.querySelectorAll(".js-telop-content");

  let hasMaintenance = false;
  let hasMessage = false;
  let maintMobileHtml = "";
  let maintPCHtml = "";

  if (maintenance && (maintenance.is_active || maintenance.scheduled)) {
    const start = formatMMDDHHmm(maintenance.start_time);
    const end = formatMMDDHHmm(maintenance.end_time);
    maintMobileHtml = end ? `${start} ～ ${end}` : `${start} ～`;
    maintPCHtml = end ? `${start} ～<br>&nbsp;&nbsp;&nbsp;&nbsp;${end}` : `${start} ～`;
    hasMaintenance = true;
  }

  maintPanels.forEach(p => {
    if (!hasMaintenance) {
      p.textContent = "現在予定されているメンテナンスはありません";
      return;
    }
    const isPC = window.innerWidth >= 1024;
    if (isPC) {
      p.textContent = "";
      const lines = maintPCHtml.split('<br>');
      lines.forEach((line, i) => {
        const textNode = document.createTextNode(line.replace(/&nbsp;/g, '\u00A0'));
        p.appendChild(textNode);
        if (i < lines.length - 1) {
          p.appendChild(document.createElement('br'));
        }
      });
    } else {
      p.textContent = maintMobileHtml;
    }
  });

  const telopMsg = (maintenance && maintenance.message && maintenance.message.trim() !== "") ? maintenance.message : "";
  hasMessage = telopMsg !== "";

  const nameToDisplay = (state.isVerified && state.characterName) ? state.characterName : "名無しさん";

  const welcomeArea = document.getElementById("sidebar-welcome-area");
  if (welcomeArea) {
    welcomeArea.textContent = "";
    const welcome = document.createElement("div");
    welcome.className = "sidebar-welcome-msg";
    welcome.textContent = `ようこそ ${nameToDisplay}`;
    welcomeArea.appendChild(welcome);
  }

  telopPanels.forEach(p => {
    p.textContent = "";
    const msgSpan = document.createElement("span");
    if (telopMsg) {
      const parts = escapeHtml(telopMsg).split(/\/\/|<br>/i);
      parts.forEach((part, i) => {
        msgSpan.appendChild(document.createTextNode(part));
        if (i < parts.length - 1) {
          msgSpan.appendChild(document.createElement('br'));
        }
      });
    } else {
      msgSpan.textContent = "メッセージはありません。";
    }
    p.appendChild(msgSpan);
  });

  document.querySelectorAll(`.appnav-btn[data-nav-id="maintenance"]`)
    .forEach(btn => btn.classList.toggle("has-alert", hasMaintenance));

  document.querySelectorAll(`.appnav-btn[data-nav-id="telop"]`)
    .forEach(btn => btn.classList.toggle("has-alert", hasMessage));

  const errorLogCount = window.errorLog ? window.errorLog.length : 0;
  const hasError = errorLogCount > 0;
  document.querySelectorAll(`.appnav-btn[data-nav-id="error"]`)
    .forEach(btn => btn.classList.toggle("has-alert", hasError));

  document.querySelectorAll(`.appnav-btn[data-nav-id="rank"]`)
    .forEach(btn => btn.classList.remove("has-alert"));
}

// ─── ヘッダー時刻 ───────────────────────────────────────
export function updateHeaderTime() {
  const now = new Date();
  const et = getEorzeaTime(now);
  const ltStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const etStr = `${et.hours}:${et.minutes}`;

  document.querySelectorAll('.js-lt-clock').forEach(el => el.textContent = ltStr);
  document.querySelectorAll('.js-et-clock').forEach(el => el.textContent = etStr);
}

// ─── ソート＆描画 ───────────────────────────────────────
function getMobMap() {
  const mobs = getState().mobs;
  if (mobs === currentMobsRef && cachedMobMap) return cachedMobMap;
  currentMobsRef = mobs;
  cachedMobMap = new Map(mobs.map(m => [String(m.No), m]));
  return cachedMobMap;
}

const cardObserver = new IntersectionObserver((entries) => {
  const isMobile = window.innerWidth < 1024;
  if (isMobile && getState().openMobCardNo !== null) return;

  const mobMap = getMobMap();
  requestAnimationFrame(() => {
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
  });
}, { threshold: 0 });

export function updateCardFull(card, mob) {
  const isDetail = card.classList.contains('mobcard-card');
  const isListItem = card.classList.contains('moblist-item');

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
  const rightPane = DOM.pcRightDetail || document.getElementById("mobcard-detail");
  if (rightPane && rightPane.dataset.renderedMobNo && rightPane.dataset.renderedMobNo !== "none") {
    const detailCard = rightPane.firstElementChild;
    const mob = mobMap.get(rightPane.dataset.renderedMobNo);
    if (detailCard && mob) updateCardFull(detailCard, mob);
  }

  const mobileOverlay = DOM.mobileDetailOverlay || document.getElementById("mobcard-overlay");
  if (mobileOverlay && mobileOverlay.dataset.renderedMobNo && mobileOverlay.dataset.renderedMobNo !== "none") {
    const detailCard = mobileOverlay.querySelector('.mobcard-card');
    const mob = mobMap.get(mobileOverlay.dataset.renderedMobNo);
    if (detailCard && mob) {
      updateCardFull(detailCard, mob);
    }
  }
}

const debouncedSortAndRedistribute = debounce(() => {
  sortAndRedistribute({ immediate: true });
}, 200);

export const sortAndRedistribute = (options = {}) => {
  const { immediate = false } = options;
  const run = () => {
    filterAndRender();
    if (isInitialLoading) {
      isInitialLoading = false;
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

  if (activeElement && activeElement.closest('.mobcard-card, .moblist-item')) {
    focusedMobNo = activeElement.closest('.mobcard-card, .moblist-item').dataset.mobNo;
    if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') {
      focusedAction = activeElement.dataset.action;
      selectionStart = activeElement.selectionStart;
      selectionEnd = activeElement.selectionEnd;
    }
  }

  const isPC = window.innerWidth >= 1024;

  if (DOM.pcLeftList) {
    const currentNodes = Array.from(DOM.pcLeftList.children);
    const currentMap = new Map();
    currentNodes.forEach(node => {
      if (node.dataset.mobNo) currentMap.set(`mob-${node.dataset.mobNo}`, node);
      else if (node.textContent) currentMap.set(`header-${node.textContent}`, node);
    });

    const nextChildren = [];
    const groups = { MAX_OVER: [], WINDOW: [], NEXT: [], MAINTENANCE: [] };
    sortedMobs.forEach(mob => { groups[getGroupKey(mob)].push(mob); });

    ["MAX_OVER", "WINDOW", "NEXT", "MAINTENANCE"].forEach(key => {
      const groupMobs = groups[key];
      if (groupMobs.length === 0) return;
      const headerText = GROUP_LABELS[key];
      const headerKey = `header-${headerText}`;
      let header = currentMap.get(headerKey);
      if (!header) {
        header = document.createElement("div");
        header.className = "moblist-group-header font-bold text-gray-500 uppercase mt-2 mb-1 border-b border-gray-700/50 pb-1 pl-1";
        header.textContent = headerText;
      }
      nextChildren.push(header);

      groupMobs.forEach(mob => {
        const mobKey = `mob-${mob.No}`;
        let item = currentMap.get(mobKey);
        if (!item) item = createSimpleMobItem(mob);
        else updateSimpleMobItem(item, mob);
        nextChildren.push(item);
      });
    });

    const fragment = document.createDocumentFragment();
    nextChildren.forEach(child => fragment.appendChild(child));

    const orderChanged = lastRenderedOrderStr !== sortedMobs.map(m => m.No).join(",") ||
      lastRenderedGroupStr !== sortedMobs.map(m => getGroupKey(m)).join(",");

    if (orderChanged || DOM.pcLeftList.children.length !== nextChildren.length) {
      DOM.pcLeftList.innerHTML = "";
      DOM.pcLeftList.appendChild(fragment);
    } else {
    }
  }

  const detailContainer = document.getElementById("mobcard-detail");
  const pane = document.getElementById("mobcard-pane");

  if (detailContainer && pane) {
    const openMobNo = getState().openMobCardNo;
    if (openMobNo) {
      if (detailContainer.dataset.renderedMobNo !== String(openMobNo)) {
        const targetMob = getState().mobs.find(m => m.No === openMobNo);
        if (targetMob) {
          detailContainer.innerHTML = "";
          detailContainer.appendChild(createMobCard(targetMob, true));
          detailContainer.dataset.renderedMobNo = String(openMobNo);
        }
      }
      pane.classList.add("is-active");
      if (window.innerWidth < 1024) {
        document.body.classList.add('body-lock');
      }
    } else {
      if (detailContainer.dataset.renderedMobNo !== "none") {
        detailContainer.innerHTML = window.innerWidth >= 1024 ? '<div class="text-center text-gray-500 mt-20 text-sm">モブを選択すると詳細が表示されます</div>' : "";
        detailContainer.dataset.renderedMobNo = "none";
      }
      pane.classList.remove("is-active");
      document.body.classList.remove('body-lock');
    }
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

    isInitialLoading = false;
    const overlay = document.getElementById("loading-overlay");
    if (overlay) overlay.classList.add("hidden");
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

// ─── プログレスバー ─────────────────────────────────────
export function updateProgressBars({ forceAll = true } = {}) {
  const state = getState();
  const nowSec = Date.now() / 1000;
  const mobMap = getMobMap();
  const filtered = forceAll ? getFilteredMobs() : [];
  const isMobile = window.innerWidth < 1024;
  const isOverlayOpen = state.openMobCardNo !== null;

  if (forceAll && !(isMobile && isOverlayOpen)) {
    filtered.forEach(mob => {
      const info = mob.repopInfo;
      if (info) {
        let needsRecalc = false;
        const infoNow = nowSec;

        if (info.conditionWindowEnd && infoNow >= (info.conditionWindowEnd.getTime() / 1000) && info.isInConditionWindow) {
          needsRecalc = true;
        } else if (info.nextConditionSpawnDate && infoNow >= (info.nextConditionSpawnDate.getTime() / 1000) && info.status === "NextCondition") {
          needsRecalc = true;
        } else if (info.minRepop && infoNow >= info.minRepop && info.status === "Next") {
          needsRecalc = true;
        } else if (info.maxRepop && infoNow >= info.maxRepop && info.status === "PopWindow") {
          needsRecalc = true;
        }

        if (needsRecalc) {
          recalculateMob(mob.No);
        }
      }

      const card = cardCache.get(String(mob.No));
      if (card) {
        checkAndNotify(mob);
        updateProgressText(card, mob);
        updateProgressBar(card, mob);
      }
    });

    if (DOM.pcLeftList) {
      const listItems = DOM.pcLeftList.querySelectorAll('.moblist-item');
      listItems.forEach(item => {
        const mobNo = item.dataset.mobNo;
        const mob = mobMap.get(String(mobNo));
        if (mob) {
          updateSimpleMobItem(item, mob);
        }
      });
    }
  }

  updateDetailCardRealtime(mobMap);

  if (forceAll && !(isMobile && isOverlayOpen)) {
    invalidateSortCache();
    const sorted = getSortedFilteredMobs();
    const currentOrderStr = sorted.map(m => m.No).join(",");
    const currentGroupStr = sorted.map(m => getGroupKey(m)).join(",");

    if (!isInitialSortingSuppressed) {
      if (currentOrderStr !== lastRenderedOrderStr || currentGroupStr !== lastRenderedGroupStr) {
        sortAndRedistribute();
      }
    }
  }

  const rankBtn = document.querySelector('.appnav-btn[data-panel="rank"]');
  if (rankBtn) rankBtn.classList.remove("has-alert");
}

// ─── 報告処理 ───────────────────────────────────────────
export function showToast(message, type = "error") {
  if (type === "error") {
    console.error(message);
  }
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "toast-container-wrapper";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  const colorClass = type === "error" ? "toast-error" : "toast-success";
  toast.className = `toast-item-base ${colorClass} opacity-0 translate-x-full`;
  toast.textContent = message;
  toast.classList.add("whitespace-pre-wrap");

  container.appendChild(toast);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.classList.remove("translate-x-full", "opacity-0");
    });
  });

  setTimeout(() => {
    toast.classList.add("translate-x-full", "opacity-0");
    toast.addEventListener("transitionend", () => toast.remove());
  }, 4000);
}

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

export async function handleInstantReport(mobNo) {
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

// ─── スポーン操作 ───────────────────────────────────────
function applyOptimisticDOM(point, nextCulled) {
  point.dataset.isCulled = String(nextCulled);

  if (nextCulled) {
    for (const [from, to] of Object.entries(CULLED_CLASS_MAP)) {
      if (point.classList.contains(from)) {
        point.classList.replace(from, to);
        break;
      }
    }
  } else {
    for (const [from, to] of Object.entries(UNCULLED_CLASS_MAP)) {
      if (point.classList.contains(from)) {
        point.classList.replace(from, to);
        break;
      }
    }
  }

  const pointNumber = parseInt(point.dataset.locationId?.slice(-2), 10);
  point.dataset.tooltip = `${pointNumber}${nextCulled ? " (済)" : ""}`;
}

function applyOptimisticState(mobNo, area, locationId, nextCulled) {
  const state = getState();
  const instance = mobNo % 10;
  const key = `${area}_${instance}`;
  if (!state.mobLocations[key]) {
    state.mobLocations[key] = {};
  }
  if (!state.mobLocations[key][locationId]) {
    state.mobLocations[key][locationId] = {};
  }

  const now = { toMillis: () => Date.now() };
  if (nextCulled) {
    state.mobLocations[key][locationId].culled_at = now;
  } else {
    state.mobLocations[key][locationId].uncull_at = now;
  }

  state.mobs.forEach(m => {
    if (m.area === area && (m.No % 10) === instance) {
      m.spawn_cull_status = state.mobLocations[key];
    }
  });

  window.dispatchEvent(new CustomEvent("locationsUpdated", {
    detail: { locationsMap: state.mobLocations }
  }));
}

function handleCrushToggle(e) {
  const point = e.target.closest(".spawn-point");
  if (!point) return;

  const state = getState();
  if (!state.isVerified) {
    openAuthModal();
    return;
  }

  if (point.dataset.isInteractive !== "true") return;
  if (point.dataset.isLastone === "true") return;

  const card = e.target.closest(".mobcard-card");
  if (!card) return;

  e.preventDefault();
  e.stopPropagation();

  const mobNo = parseInt(card.dataset.mobNo, 10);
  const mob = state.mobs.find(m => m.No === mobNo);
  if (!mob) return;

  const locationId = point.dataset.locationId;
  const area = mob.area;

  const isTouchDevice = window.matchMedia("(hover: none)").matches;
  if (isTouchDevice) {
    const now = Date.now();
    const timeDiff = now - lastClickTime;

    if (locationId === lastClickLocationId && timeDiff < 1000) {
      lastClickTime = 0;
      lastClickLocationId = null;
    } else {
      lastClickTime = now;
      lastClickLocationId = locationId;
      return;
    }
  }

  const isCurrentlyCulled = point.dataset.isCulled === "true";
  const nextCulled = !isCurrentlyCulled;

  applyOptimisticDOM(point, nextCulled);
  applyOptimisticState(mobNo, area, locationId, nextCulled);

  toggleCrushStatus(mobNo, area, locationId, nextCulled).then(result => {
    if (!result?.success) {
      applyOptimisticDOM(point, !nextCulled);
      applyOptimisticState(mobNo, area, locationId, !nextCulled);
    }
  });
}

// ─── イベントリスナー ───────────────────────────────────
function attachGlobalEventListeners() {
  let prevWidth = window.innerWidth;
  window.addEventListener("resize", debounce(() => {
    const currentWidth = window.innerWidth;
    const wasPC = prevWidth >= 1024;
    const isNowPC = currentWidth >= 1024;

    if (wasPC !== isNowPC) {
      prevWidth = currentWidth;
      sortAndRedistribute();
    }
    syncMobCardPanePosition();
  }, 100));

  const appnav = document.getElementById('appnav');
  if (appnav) {
    appnav.addEventListener('transitionend', (e) => {
      if (e.propertyName === 'width') {
        syncMobCardPanePosition();
      }
    });
  }

  document.addEventListener('click', (e) => {
    if (e.target.closest('.tab-button')) {
      return;
    }
    if (e.target.closest('.area-filter-btn')) {
      handleAreaFilterClick(e);
      return;
    }
    if (e.target === DOM.cardOverlayBackdrop) {
      setOpenMobCardNo(null);
      sortAndRedistribute({ immediate: true });
    }
    if (e.target.matches("[data-action='save-memo']")) {
      e.stopPropagation();
    }
  });

  if (DOM.reportForm) {
    DOM.reportForm.addEventListener('submit', handleReportSubmit);
  }

  document.addEventListener('change', async (e) => {
    if (e.target.matches("[data-action='save-memo']")) {
      const input = e.target;
      const mobNo = parseInt(input.dataset.mobNo, 10);
      const text = input.value;

      if (!getState().isVerified) {
        input.value = '';
        openAuthModal();
        return;
      }

      await submitMemo(mobNo, text);
    }
  });

  let touchStartX = 0;
  document.addEventListener('touchstart', (e) => {
    const reportBtn = e.target.closest('.report-side-bar');
    if (reportBtn) {
      touchStartX = e.changedTouches[0].screenX;
    }
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    const reportBtn = e.target.closest('.report-side-bar');
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

  document.addEventListener('keydown', (e) => {
    if (e.target.matches("[data-action='save-memo']")) {
      if (e.key === 'Enter') {
        e.target.blur();
      }
      e.stopPropagation();
    }
  });

}

export function attachLocationEvents() {
  if (locationEventsAttached) return;

  const colContainer = document.getElementById("column-container");
  if (colContainer) {
    colContainer.addEventListener("click", handleCrushToggle);
  }

  const mobcardDetail = document.getElementById("mobcard-detail");
  if (mobcardDetail) {
    mobcardDetail.addEventListener("click", handleCrushToggle);
  }

  const mobcardOverlay = document.getElementById("mobcard-overlay");
  if (mobcardOverlay) {
    mobcardOverlay.addEventListener("click", handleCrushToggle);
  }

  locationEventsAttached = true;
}

// ─── グローバルイベント登録 ─────────────────────────────
window.addEventListener('characterNameSet', () => {
  renderMaintenanceStatus();
});

window.addEventListener('initialDataLoaded', () => {
  updateHeaderTime();
  filterAndRender({ isInitialLoad: true });
  updateProgressBars();
});

window.addEventListener('mobUpdated', (e) => {
  const { mobNo, mob } = e.detail;
  checkAndNotify(mob);
  const card = cardCache.get(String(mobNo));
  if (card) {
    updateCardFull(card, mob);
  }
  const mobMap = getMobMap();
  updateDetailCardRealtime(mobMap);
  sortAndRedistribute();
});

window.addEventListener('filterChanged', () => {
  invalidateFilterCache();
  filterAndRender();
});

window.addEventListener('mobsUpdated', () => {
  updateProgressBars({ forceAll: false });
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

document.addEventListener('DOMContentLoaded', initApp);
