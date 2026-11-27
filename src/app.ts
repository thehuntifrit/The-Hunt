import { getState, loadBaseMobData, startRealtime, setOpenMobCardNo, setUserId, setLodestoneId, setCharacterName, setVerified, CONFIG, DOM, handleAppError, recalcIfStale } from "./dataManager";
import { calculateRepop, formatDurationColon, formatMMDDHHmm, debounce, getEorzeaTime, getEorzeaMoonInfo, EORZEA_MINUTE_MS } from "./cal";
import { createMobCard, updateProgressBar, updateProgressText, updateExpandablePanel, updateMemoIcon, updateMobCount, updateMapOverlay, createSimpleMobItem, updateSimpleMobItem, escapeHtml, initGlobalMagnifier, adjustMemoHeight, preloadMapImages } from "./mobCard";
import { getGroupKey, GROUP_LABELS, getSortedFilteredMobs, getFilteredMobs, invalidateFilterCache, invalidateSortCache, hasMobSortKeyChanged, rememberMobSortKeys } from "./mobSorter";
import { closeReportModal, openAuthModal, openReportModal, initModal } from "./modal";
import { handleAreaFilterClick, initAppNav, togglePanel, closePanel, setActiveNavItem, checkAndNotify, updateErrorPanel, dismissSearch } from "./sidebar";
import { initializeAuth, getUserData, submitReport, submitMemo, toggleCrushStatus } from "./server";
import { now as serverNow, startTimeSync, onTimeSynced } from "./servertime";
import { Mob, RepopInfo } from "./types/mob";

// 定数
export const cardCache = new Map<string, Set<HTMLElement>>();

const visibleCards = new Set<string>();

const CULLED_CLASS_MAP: Record<string, string> = {
  "color-b1": "color-b1-culled",
  "color-b2": "color-b2-culled",
};

const UNCULLED_CLASS_MAP: Record<string, string> = {
  "color-b1-culled": "color-b1",
  "color-b2-culled": "color-b2",
};

let lastClickTime = 0;
let lastClickLocationId: string | null = null;
let locationEventsAttached = false;
let loadingTimeout: any = null;

// スクロールバー幅計測
function updateScrollbarWidthVar(): void {
  const probe = document.createElement("div");
  probe.style.cssText = "position:absolute;top:-9999px;width:100px;height:100px;overflow:scroll;scrollbar-width:thin;";
  document.body.appendChild(probe);
  const width = probe.offsetWidth - probe.clientWidth;
  probe.remove();
  document.documentElement.style.setProperty("--sbw", `${width}px`);
}

// 初期化
let isAppInitialized = false;

async function initApp(): Promise<void> {
  if (isAppInitialized || (window as any).__theHuntInitialized) {
    return;
  }
  isAppInitialized = true;
  (window as any).__theHuntInitialized = true;

  try {
    updateScrollbarWidthVar();
    window.addEventListener("resize", debounce(updateScrollbarWidthVar, 200));   // ズームの変更などに追従
    initAppEventListeners();
    attachMobCardEvents();
    initGlobalMagnifier();

    onTimeSynced(() => { updateHeaderTime(); scheduleHeaderClock(); });
    startTimeSync();

    void loadBaseMobData().then(() => {
      preloadMapImages(getState().mobs);
    });

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
      handleAppError(err, "Auth初期化失敗");
      setVerified(false);
      window.dispatchEvent(new CustomEvent('initialDataLoaded'));
    });

    startRealtime();
    setOpenMobCardNo(null);
    initModal();
    updateHeaderTime();
    scheduleHeaderClock();
    initAppNav();
    initMoonTooltip();
    attachLocationEvents();
    attachGlobalEventListeners();
    (window as any).renderMaintenanceStatus = renderMaintenanceStatus;

    loadingTimeout = setTimeout(() => {
      const overlay = DOM.loadingOverlay;
      if (overlay && !overlay.classList.contains("hidden")) {
        console.warn("Loading timeout: Forcing UI display.");
        if (!getState().initialLoadComplete) {
          window.dispatchEvent(new CustomEvent('initialDataLoaded'));
        }
        overlay.classList.add("hidden");
        showToast("データ同期がタイムアウトしました。既存のデータで表示します。", "info");
      }
    }, CONFIG.APP_LOAD_TIMEOUT);

  } catch (e) {
    handleAppError(e, "アプリ初期化致命的エラー");
    DOM.loadingOverlay?.classList.add("hidden");
  }
}

// メンテナンス表示
interface MaintStatus {
  is_active: boolean;
  scheduled: boolean;
  start_time?: string;
  end_time?: string;
  message: string;
}

function getMaintenanceStatus(): MaintStatus {
  const state = getState();
  const maintenance = state.maintenance;

  if (!maintenance || !maintenance.start || !maintenance.end) {
    return {
      is_active: false,
      scheduled: false,
      message: maintenance ? maintenance.message : ""
    };
  }

  const now = new Date(serverNow());
  const start = new Date(maintenance.start);
  const end = new Date(maintenance.end);
  const showFrom = new Date(start.getTime() - CONFIG.MAINTENANCE_SHOW_BEFORE_MS);
  const showUntil = new Date(end.getTime() + CONFIG.MAINTENANCE_SHOW_AFTER_MS);

  const isWithinDisplayWindow = now >= showFrom && now <= showUntil;

  const status: MaintStatus = {
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

export function renderMaintenanceStatus(): void {
  const state = getState();
  const maintenance = getMaintenanceStatus();

  const maintPanels = document.querySelectorAll(".js-maintenance-content");
  const telopPanels = document.querySelectorAll(".js-telop-content");

  let hasMaintenance = false;

  if (maintenance && (maintenance.is_active || maintenance.scheduled)) {
    hasMaintenance = true;
  }

  maintPanels.forEach(p => {
    p.innerHTML = "";
    if (!hasMaintenance) {
      p.textContent = "現在予定されているメンテナンスはありません";
      return;
    }
    const start = formatMMDDHHmm(maintenance.start_time);
    const end = maintenance.end_time ? formatMMDDHHmm(maintenance.end_time) : "";
    p.textContent = end ? `${start} ～ ${end}` : `${start} ～`;
  });

  const telopMsg = (maintenance && maintenance.message && maintenance.message.trim() !== "") ? maintenance.message : "";

  const nameToDisplay = (state.isVerified && state.characterName) ? state.characterName : "名無しさん";

  const welcomeArea = document.getElementById("sidebar-welcome-area");
  if (welcomeArea) {
    welcomeArea.textContent = "";
    const welcome = document.createElement("div");
    welcome.className = "sidebar-welcome-msg";

    const nameSpan = document.createElement("span");
    nameSpan.className = "sidebar-welcome-name";
    nameSpan.textContent = nameToDisplay;
    welcome.appendChild(nameSpan);

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
    .forEach(btn => btn.classList.toggle("has-alert", state.hasUnreadTelop));

  const errorLogCount = (window as any).errorLog ? (window as any).errorLog.length : 0;
  const hasError = errorLogCount > 0;
  document.querySelectorAll(`.appnav-btn[data-nav-id="error"]`)
    .forEach(btn => btn.classList.toggle("has-alert", hasError));

  document.querySelectorAll(`.appnav-btn[data-nav-id="rank"]`)
    .forEach(btn => btn.classList.remove("has-alert"));
}

// ヘッダー時刻
let headerClocks: { lt: Element[]; et: Element[]; moon: HTMLElement[]; moonTooltip: HTMLElement[] } | null = null;
let lastLtStr = "";
let lastEtStr = "";
let lastMoonIcon = "";
let lastMoonName = "";

// PC用: ツールチップをマウスの右側に表示する
function positionTooltipAtMouse(tip: HTMLElement, e: MouseEvent): void {
  const OFFSET = 14;
  tip.style.position = 'fixed';
  tip.style.right = 'auto';
  tip.style.bottom = 'auto';
  tip.style.transform = 'none';
  tip.style.pointerEvents = 'none'; // ツールチップ自体がマウスを受けないようにする

  let left = e.clientX + OFFSET;
  let top = e.clientY - tip.offsetHeight / 2;

  // 画面の右端からはみ出す場合だけ、マウスの左側に出す
  if (left + tip.offsetWidth > window.innerWidth - 8) {
    left = e.clientX - OFFSET - tip.offsetWidth;
  }
  top = Math.max(8, Math.min(top, window.innerHeight - tip.offsetHeight - 8));

  tip.style.left = `${left}px`;
  tip.style.top = `${top}px`;
}

function initMoonTooltip(): void {
  const btns = document.querySelectorAll<HTMLElement>('.js-moon-clock');
  const tooltips = document.querySelectorAll<HTMLElement>('.js-moon-tooltip');
  if (btns.length === 0 || tooltips.length === 0) return;

  const closeAll = () => {
    tooltips.forEach(t => t.classList.remove('is-open'));
  };

  const canHover = window.matchMedia('(hover: hover)');

  btns.forEach(btn => {
    const wrap = btn.closest('.mobile-clock-moon-wrap');
    const tip = wrap?.querySelector<HTMLElement>('.js-moon-tooltip');
    if (!tip) return;

    // PC: マウスを乗せている間だけ、マウスの右側に表示して追従させる
    btn.addEventListener('mouseenter', (e) => {
      if (!canHover.matches) return;
      closeAll();
      tip.classList.add('is-open');
      positionTooltipAtMouse(tip, e);
    });
    btn.addEventListener('mousemove', (e) => {
      if (!canHover.matches || !tip.classList.contains('is-open')) return;
      positionTooltipAtMouse(tip, e);
    });
    btn.addEventListener('mouseleave', () => {
      if (!canHover.matches) return;
      tip.classList.remove('is-open');
    });

    // スマホ: 従来どおりタップで開閉
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (canHover.matches) return;
      const willOpen = !tip.classList.contains('is-open');
      closeAll();
      if (willOpen) tip.classList.add('is-open');
    });
  });

  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (!target.closest('.mobile-clock-moon-wrap')) {
      closeAll();
    }
  });
}

// ヘッダー時計を、LT/ETの「分」が切り替わる瞬間に合わせて更新する
const ET_MINUTE_MS_EXACT = 175000 / 60;
let headerTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleHeaderClock(): void {
  if (headerTimer !== null) clearTimeout(headerTimer);
  const t = serverNow();
  const toNextLt = 60000 - (t % 60000);
  const toNextEt = ET_MINUTE_MS_EXACT - (t % ET_MINUTE_MS_EXACT);
  // 境界ちょうどだと早発火で前の表示のままになることがあるので、少し後ろにずらす
  const delay = Math.min(toNextLt, toNextEt) + 5;
  headerTimer = setTimeout(() => {
    updateHeaderTime();
    scheduleHeaderClock();
  }, delay);
}

export function updateHeaderTime(): void {
  if (document.visibilityState === 'hidden') return;

  const now = new Date(serverNow());
  const et = getEorzeaTime(now);
  const moon = getEorzeaMoonInfo(now);
  const ltStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const etStr = `${et.hours}:${et.minutes}`;

  if (ltStr === lastLtStr && etStr === lastEtStr && moon.icon === lastMoonIcon && moon.fullName === lastMoonName) return;

  lastLtStr = ltStr;
  lastEtStr = etStr;
  lastMoonIcon = moon.icon;
  lastMoonName = moon.fullName;

  if (!headerClocks) {
    headerClocks = {
      lt: Array.from(document.querySelectorAll('.js-lt-clock')),
      et: Array.from(document.querySelectorAll('.js-et-clock')),
      moon: Array.from(document.querySelectorAll<HTMLElement>('.js-moon-clock')),
      moonTooltip: Array.from(document.querySelectorAll<HTMLElement>('.js-moon-tooltip'))
    };
  }

  headerClocks.lt.forEach(el => { if (el.textContent !== ltStr) el.textContent = ltStr; });
  headerClocks.et.forEach(el => { if (el.textContent !== etStr) el.textContent = etStr; });
  headerClocks.moon.forEach(el => {
    if (el.textContent !== moon.icon) el.textContent = moon.icon;
    const label = `月齢: ${moon.fullName}`;
    if (el.getAttribute('aria-label') !== label) {
      el.setAttribute('aria-label', label);
    }
    if (el.hasAttribute('title')) el.removeAttribute('title');
  });
  headerClocks.moonTooltip.forEach(el => {
    if (el.textContent !== moon.fullName) el.textContent = moon.fullName;
  });
}

// ソート＆描画
function getMobMap(): Map<string, Mob> {
  return getState().mobsMap;
}

function updateVisibleCardsSet(updateNew = true): void {
  const container = document.getElementById('moblist-container');
  if (!container) return;

  const vh = window.innerHeight;
  const items = Array.from(container.querySelectorAll<HTMLElement>('.moblist-item'));
  const mobMap = getMobMap();
  const rects = items.map(el => el.getBoundingClientRect());

  const prevVisible = new Set(visibleCards);
  visibleCards.clear();
  const toUpdate: Array<[HTMLElement, Mob]> = [];

  items.forEach((htmlEl, i) => {
    const rect = rects[i];
    if (rect.bottom > -100 && rect.top < vh + 100) {
      const mobNo = htmlEl.dataset.mobNo!;
      visibleCards.add(mobNo);
      observeCard(htmlEl);

      if (!prevVisible.has(mobNo)) {
        const mob = mobMap.get(mobNo);
        if (mob) toUpdate.push([htmlEl, mob]);
      }
    }
  });

  if (updateNew) {
    toUpdate.forEach(([el, mob]) => updateCardFull(el, mob));
  }
}

const handleScroll = debounce(() => updateVisibleCardsSet(), 80);
window.addEventListener('scroll', handleScroll, { passive: true });
window.addEventListener('resize', handleScroll, { passive: true });

const moblistEl = document.getElementById('moblist-container');
if (moblistEl) moblistEl.addEventListener('scroll', handleScroll, { passive: true });

// スクロール中だけ、その領域に is-scrolling を付ける(止まって約0.12秒後に外す)。
// 付いている間は、中の要素がマウスに反応しない(ホバーの再描画を避けるため)
const scrollIdleTimers = new WeakMap<Element, number>();
document.addEventListener("scroll", (e) => {
  const el = e.target;
  if (!(el instanceof HTMLElement)) return;
  if (!el.matches("#moblist-container, .mobcard-content")) return;

  if (!el.classList.contains("is-scrolling")) el.classList.add("is-scrolling");
  window.clearTimeout(scrollIdleTimers.get(el));
  scrollIdleTimers.set(el, window.setTimeout(() => el.classList.remove("is-scrolling"), 120));
}, { capture: true, passive: true });

function attachMoblistBackgroundWheel(): void {
  const main = document.querySelector('.main-content-area') as HTMLElement | null;
  if (!main || (main as any).__moblistBgWheelAttached) return;
  (main as any).__moblistBgWheelAttached = true;

  const EASE = 0.18;
  let current = 0;
  let target = 0;
  let rafId: number | null = null;
  let lastTs = 0;

  const stop = () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  };

  const step = (ts: number) => {
    const el = document.getElementById('moblist-container');
    if (!el) { rafId = null; return; }

    const dt = lastTs ? Math.min(ts - lastTs, 50) : 16.67;
    lastTs = ts;

    const diff = target - current;
    if (Math.abs(diff) < 0.5) {
      current = target;
      el.scrollTop = current;
      rafId = null;
      lastTs = 0;
      return;
    }

    current += diff * (1 - Math.pow(1 - EASE, dt / 16.67));
    el.scrollTop = current;
    rafId = requestAnimationFrame(step);
  };

  const listEl = document.getElementById('moblist-container');
  if (listEl) {
    listEl.addEventListener('wheel', stop, { passive: true });
    listEl.addEventListener('pointerdown', stop, { passive: true });
  }

  main.addEventListener('wheel', (e: Event) => {
    const we = e as WheelEvent;
    if (we.defaultPrevented || we.deltaY === 0 || we.ctrlKey) return;

    const t = we.target instanceof Element ? we.target : null;
    if (!t) return;
    if (t.closest('#manual-modal:not(.hidden), #report-modal:not(.hidden), #auth-modal:not(.hidden)')) return;

    const list = document.getElementById('moblist-container');
    if (!list || list.scrollHeight <= list.clientHeight) return;
    if (t.closest('#moblist-container')) return;
    if (t.closest('.mobcard-card')) return;

    const pane = document.getElementById('mobcard-pane');
    if (pane && pane.classList.contains('is-active') && window.innerWidth < 900 && t.closest('#mobcard-pane')) {
      return;
    }

    let delta = we.deltaY;
    if (we.deltaMode === 1) delta *= 16;
    else if (we.deltaMode === 2) delta *= list.clientHeight;

    if (rafId === null) {
      current = list.scrollTop;
      target = current;
    }

    const max = list.scrollHeight - list.clientHeight;
    target = Math.max(0, Math.min(max, target + delta));

    if (rafId === null) {
      lastTs = 0;
      rafId = requestAnimationFrame(step);
    }
  }, { passive: true });
}

attachMoblistBackgroundWheel();

export function observeCard(el: HTMLElement): void {
  if (el && el.dataset.mobNo) {
    const mobNo = el.dataset.mobNo;
    let set = cardCache.get(mobNo);
    if (!set) {
      set = new Set<HTMLElement>();
      cardCache.set(mobNo, set);
    }
    set.add(el);
  }
}

export function unobserveCard(el: HTMLElement): void {
  if (el && el.dataset.mobNo) {
    const mobNo = el.dataset.mobNo;
    const set = cardCache.get(mobNo);
    if (set) {
      set.delete(el);
      if (set.size === 0) {
        cardCache.delete(mobNo);
      }
    }
    visibleCards.delete(mobNo);
  }
}

export function updateCardFull(card: HTMLElement, mob: Mob): void {
  const info = mob.repopInfo || {} as RepopInfo;

  let cullHash = "";
  if (mob.spawn_cull_status) {
    for (const key in mob.spawn_cull_status) {
      const s = mob.spawn_cull_status[key];
      const c = (s.culled_at as any)?.seconds || 0;
      const u = (s.uncull_at as any)?.seconds || 0;
      const r = (s as any).reporter_id || "";
      cullHash += `${key}:${c},${u},${r};`;
    }
  }

  const memoHash = `${mob.memo_updated_at || 0}:${mob.memo_text || ""}`;
  const stateHash = `${info.status}|${info.timeRemaining}|${info.elapsedPercent}|${info.isInConditionWindow}|${cullHash}|${memoHash}|${getState().lodestoneId || ""}`;

  if ((card as any)._lastStateHash === stateHash) return;
  (card as any)._lastStateHash = stateHash;

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

export const updateVisibleCards = function (): void {
  const mobMap = getMobMap();
  for (const mobNoStr of visibleCards) {
    const cards = cardCache.get(mobNoStr);
    const mob = mobMap.get(mobNoStr);
    if (cards && mob) {
      cards.forEach(card => updateCardFull(card, mob));
    }
  }
  updateVisibleDetailCard(mobMap);
};

export function updateVisibleDetailCard(mobMap: Map<string, Mob>): void {
  const rightPane = DOM.pcRightDetail || document.getElementById("mobcard-detail");
  if (!rightPane || (rightPane as HTMLElement).offsetParent === null) return;

  if (rightPane.dataset.renderedMobNo && rightPane.dataset.renderedMobNo !== "none") {
    const detailCard = rightPane.firstElementChild as HTMLElement | null;
    const mob = mobMap.get(rightPane.dataset.renderedMobNo);
    if (detailCard && mob) updateCardFull(detailCard, mob);
  }
}

const debouncedSortAndRedistribute = debounce(() => {
  sortAndRedistribute({ immediate: true });
}, 200);

export const sortAndRedistribute = (options: { immediate?: boolean } = {}): void => {
  const { immediate = false } = options;
  if (immediate) {
    filterAndRender();
  } else {
    debouncedSortAndRedistribute();
  }
};

const collapsedGroups = new Set<string>();

export const syncDomOrder = function (): void {
  if (!DOM.pcLeftList) return;

  const sortedMobs = getSortedFilteredMobs();
  const groups: Record<string, Mob[]> = { MAX_OVER: [], WINDOW: [], NEXT: [], MAINTENANCE: [] };
  sortedMobs.forEach(m => {
    groups[getGroupKey(m)].push(m);
  });

  const idealNodes: HTMLElement[] = [];
  const currentNodes = Array.from(DOM.pcLeftList.children) as HTMLElement[];
  const nodeMap = new Map<string, HTMLElement>();
  currentNodes.forEach(node => {
    if (node.dataset.mobNo) nodeMap.set(`mob-${node.dataset.mobNo}`, node);
    else if (node.dataset.groupKey) nodeMap.set(`header-${node.dataset.groupKey}`, node);
  });

  const groupOrder = ["MAX_OVER", "WINDOW", "NEXT", "MAINTENANCE"];
  groupOrder.forEach(key => {
    const groupMobs = groups[key];
    if (key === "MAINTENANCE" && groupMobs.length === 0) return;

    const headerText = (GROUP_LABELS as any)[key];
    const headerKey = `header-${key}`;
    let header = nodeMap.get(headerKey);
    const isCollapsed = collapsedGroups.has(key);

    if (!header) {
      header = document.createElement("div");
      header.className = "moblist-group-header status-group-separator";
      header.dataset.groupKey = key;
      header.setAttribute("role", "button");
      header.setAttribute("tabindex", "0");
      header.title = "クリックで折りたたみ / 展開";

      const labelSpan = document.createElement("span");
      labelSpan.className = "status-group-label";
      labelSpan.textContent = headerText;
      header.appendChild(labelSpan);

      const countBadge = document.createElement("span");
      countBadge.className = "status-group-count";
      header.appendChild(countBadge);

      const toggleIcon = document.createElement("span");
      toggleIcon.className = "status-group-toggle-icon";
      toggleIcon.textContent = "▼";
      header.appendChild(toggleIcon);

      const toggleHandler = () => {
        if (collapsedGroups.has(key)) {
          collapsedGroups.delete(key);
        } else {
          collapsedGroups.add(key);
        }
        syncDomOrder();
      };

      header.addEventListener("click", toggleHandler);
      header.addEventListener("keydown", (e: KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggleHandler();
        }
      });
    }

    header.classList.toggle("is-collapsed", isCollapsed);
    const countEl = header.querySelector(".status-group-count");
    if (countEl) countEl.textContent = String(groupMobs.length);

    idealNodes.push(header);

    if (!isCollapsed) {
      groupMobs.forEach(m => {
        const itemKey = `mob-${m.No}`;
        let item = nodeMap.get(itemKey);
        if (!item) {
          item = createSimpleMobItem(m);
        }
        item.dataset.groupKey = key;
        idealNodes.push(item);
      });
    }
  });

  for (let i = 0; i < idealNodes.length; i++) {
    const ideal = idealNodes[i];
    const current = DOM.pcLeftList.children[i] as HTMLElement | null;

    if (current !== ideal) {
      DOM.pcLeftList.insertBefore(ideal, current || null);
    }
    if (ideal.dataset.mobNo) observeCard(ideal);
  }

  while (DOM.pcLeftList.children.length > idealNodes.length) {
    DOM.pcLeftList.removeChild(DOM.pcLeftList.lastChild!);
  }

  // 今回の並び順に対応するソート条件を保存する
  rememberMobSortKeys(sortedMobs);
};

// 詳細ペイン(PC右ペイン / モバイルのオーバーレイ)だけを描き直す。
// 一覧の再ソートやDOM並べ替えは行わない。
function renderDetailPane(): void {
  const detailContainer = document.getElementById("mobcard-detail");
  const pane = document.getElementById("mobcard-pane");

  if (!detailContainer || !pane) return;

  const openMobNo = getState().openMobCardNo;
  if (openMobNo) {
    let cardEl: HTMLElement | null = null;
    if (detailContainer.dataset.renderedMobNo !== String(openMobNo)) {
      const targetMob = getState().mobs.find(m => m.No === openMobNo);
      if (targetMob) {
        detailContainer.innerHTML = "";
        const newCard = createMobCard(targetMob, true);
        detailContainer.appendChild(newCard);
        observeCard(newCard);
        detailContainer.dataset.renderedMobNo = String(openMobNo);
        cardEl = newCard;
      }
    } else {
      cardEl = detailContainer.querySelector(".mobcard-card") as HTMLElement | null;
    }
    if (cardEl) {
      cardEl.classList.add("is-open");
    }
    pane.classList.add("is-active");
    if (window.innerWidth < 1024) {
      document.body.classList.add('body-lock');
    }
  } else {
    const cardEl = detailContainer.querySelector(".mobcard-card") as HTMLElement | null;
    if (cardEl) {
      cardEl.classList.remove("is-open");
    }
    if (detailContainer.dataset.renderedMobNo !== "none") {
      detailContainer.innerHTML = window.innerWidth >= 1024 ? '<div class="text-center text-gray-500 mt-20 text-sm">モブを選択すると詳細が表示されます</div>' : "";
      detailContainer.dataset.renderedMobNo = "none";
    }
    pane.classList.remove("is-active");
    document.body.classList.remove('body-lock');
  }
}

// カードの開閉専用。並び順は変わらないので、詳細ペインの描き直しだけを行う。
function showDetailOnly(): void {
  if (!getState().initialLoadComplete) return;
  renderDetailPane();
  updateVisibleDetailCard(getMobMap());
}

export function filterAndRender(options: { isInitialLoad?: boolean } = {}): void {
  const { isInitialLoad = false } = options;
  const state = getState();
  if (!state.initialLoadComplete && !isInitialLoad) {
    return;
  }

  const activeElement = document.activeElement as HTMLElement | null;
  let focusedMobNo: string | null = null;
  let focusedAction: string | null = null;
  let selectionStart: number | null = null;
  let selectionEnd: number | null = null;

  if (activeElement && activeElement.closest('.mobcard-card, .moblist-item')) {
    const container = activeElement.closest('.mobcard-card, .moblist-item') as HTMLElement;
    focusedMobNo = container.dataset.mobNo || null;
    if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') {
      focusedAction = (activeElement as any).dataset.action || null;
      selectionStart = (activeElement as HTMLInputElement).selectionStart;
      selectionEnd = (activeElement as HTMLInputElement).selectionEnd;
    }
  }

  if (DOM.pcLeftList) {
    syncDomOrder();
  }

  renderDetailPane();

  if (isInitialLoad) {
    const overlay = document.getElementById("loading-overlay");
    if (overlay) overlay.classList.add("hidden");
  }

  updateVisibleCardsSet(false);
  updateVisibleCards();

  if (focusedMobNo) {
    const cards = cardCache.get(String(focusedMobNo));
    if (cards && focusedAction) {
      for (const card of cards) {
        const input = card.querySelector(`input[data-action="${focusedAction}"], textarea[data-action="${focusedAction}"]`) as HTMLInputElement | null;
        if (input) {
          input.focus();
          if (selectionStart !== null && selectionEnd !== null) {
            try { input.setSelectionRange(selectionStart, selectionEnd); } catch (e) { }
          }
          break;
        }
      }
    }
  }
}

let lastTierBTime = 0;
let lastTierCTime = 0;

const URGENT_WINDOW_SEC = 125;   // 2分前通知(120秒)より少し広く取る
const TICK_TOLERANCE_MS = 100;   // 周期判定の余裕(ミリ秒)

export const updateProgressBarsOptimized = function (force = false): void {
  if (document.visibilityState === 'hidden' && !force) return;

  const state = getState();
  const now = Date.now();            // 更新周期(経過時間)の判定用。補正しない
  const nowSec = serverNow() / 1000; // 湧き時刻の判定用

  // setInterval の発火は数ms揺らぎ、Date.now() は整数ミリ秒なので、
  // 厳密に「>= 周期」で比べると約3割の周期が1回飛ばされる。余裕を持たせる。
  const isTierB = force || (now - lastTierBTime >= CONFIG.TIER_B_UPDATE_INTERVAL - TICK_TOLERANCE_MS);
  const isTierC = force || (now - lastTierCTime >= EORZEA_MINUTE_MS - TICK_TOLERANCE_MS);

  if (!isTierB && !isTierC) return;

  const filtered = getFilteredMobs();
  let anyStateChanged = false;
  let sortKeyChanged = false;

  if (isTierB) {
    filtered.forEach(mob => {
      const info = mob.repopInfo;
      if (!info || info.status === "Maintenance") return;

      if (updateMobState(mob, nowSec, state)) {
        anyStateChanged = true;
      }

      if (hasMobSortKeyChanged(mob)) {
        sortKeyChanged = true;
      }

      checkAndNotify(mob);
    });

    lastTierBTime = now;
    lastTierCTime = now;
  } else {
    filtered.forEach(mob => {
      const info = mob.repopInfo;
      if (!info || info.status === "Maintenance") return;

      const boundary = info.nextBoundarySec || info.maxRepop || 0;

      if (boundary && (boundary - nowSec) <= URGENT_WINDOW_SEC) {
        if (updateMobState(mob, nowSec, state)) {
          anyStateChanged = true;
        }

        if (hasMobSortKeyChanged(mob)) {
          sortKeyChanged = true;
        }

        checkAndNotify(mob);
      }
    });

    lastTierCTime = now;
  }

  if (sortKeyChanged) {
    invalidateSortCache();
    syncDomOrder();
  }

  if (document.visibilityState === 'visible') {
    updateVisibleCards();
  }
};

const updateMobState = function (mob: Mob, nowSec: number, state: any): boolean {
  const info = mob.repopInfo;
  if (!info) return false;

  let hasSignificantChange = false;
  const oldStatus = info.status;

  const isBoundaryCrossed = (info.nextBoundarySec && nowSec >= info.nextBoundarySec) ||
    (info.maxRepop && nowSec >= info.maxRepop && info.status !== "MaxOver") ||
    (info.minRepop && nowSec >= info.minRepop && info.status === "Next");

  if (isBoundaryCrossed) {
    mob.repopInfo = calculateRepop(mob, state.maintenance);
    hasSignificantChange = true;
  } else {
    if (info.maxRepop && nowSec >= info.maxRepop) {
      info.status = "MaxOver";
      info.elapsedPercent = 100;
      info.timeRemaining = formatDurationColon(nowSec - info.maxRepop);
    } else {
      const targetSec = info.nextBoundarySec || info.maxRepop || 0;
      info.timeRemaining = formatDurationColon(Math.max(0, targetSec - nowSec));

      if (info.minRepop && info.maxRepop) {
        const range = info.maxRepop - info.minRepop;
        info.elapsedPercent = (range <= 0 || nowSec < info.minRepop) ? 0 : Math.min(100, ((nowSec - info.minRepop) / range) * 100);
      }
    }
  }

  if (oldStatus !== mob.repopInfo!.status) {
    hasSignificantChange = true;
  }

  recalcIfStale(mob, nowSec);

  return hasSignificantChange;
};

// 報告処理
export function showToast(message: string, type: "error" | "success" | "info" = "error"): void {
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
  const colorClass = type === "error" ? "toast-error" : type === "success" ? "toast-success" : "toast-info";
  toast.className = `toast-item-base ${colorClass} opacity-0 translate-x-full whitespace-pre-wrap`;
  toast.textContent = message;

  container.appendChild(toast);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.classList.remove("translate-x-full", "opacity-0");
    });
  });

  setTimeout(() => {
    toast.classList.add("translate-x-full", "opacity-0");
    const removeToast = () => {
      if (toast.parentElement) toast.remove();
    };
    toast.addEventListener("transitionend", removeToast, { once: true });
    // Fallback removal in case transitionend does not fire
    setTimeout(removeToast, 500);
  }, CONFIG.TOAST_DURATION);
}

export function handleReportResult(result: any): void {
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

export async function handleInstantReport(mobNo: number): Promise<void> {
  const result = await submitReport(mobNo, new Date(serverNow()).toISOString());
  handleReportResult(result);
}

async function handleReportSubmit(e: Event): Promise<void> {
  e.preventDefault();
  const form = e.target as HTMLFormElement;
  const mobNo = parseInt(form.dataset.mobNo!, 10);
  const timeISO = (form.elements.namedItem("kill-time") as HTMLInputElement).value;
  const result = await submitReport(mobNo, timeISO);
  handleReportResult(result);
  if (result.success) closeReportModal();
}

// スポーン操作
function applyOptimisticDOM(point: HTMLElement, nextCulled: boolean): void {
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
}

function applyOptimisticState(mobNo: number, area: string, locationId: string, nextCulled: boolean): void {
  const stateVal = getState();
  const instance = mobNo % 10;
  const key = `${area}_${instance}`;
  if (!stateVal.mobLocations) {
    stateVal.mobLocations = {};
  }
  if (!stateVal.mobLocations[key]) {
    stateVal.mobLocations[key] = {};
  }
  if (!stateVal.mobLocations[key][locationId]) {
    stateVal.mobLocations[key][locationId] = {};
  }
  const t = serverNow();
  const now = { toMillis: () => t, seconds: Math.floor(t / 1000) };
  if (nextCulled) {
    stateVal.mobLocations[key][locationId].culled_at = now;
  } else {
    stateVal.mobLocations[key][locationId].uncull_at = now;
  }
  (stateVal.mobLocations[key][locationId] as any).reporter_id = stateVal.lodestoneId;

  stateVal.mobs.forEach(m => {
    if (m.area === area && (m.No % 10) === instance) {
      m.spawn_cull_status = stateVal.mobLocations![key];
    }
  });

  window.dispatchEvent(new CustomEvent("locationsUpdated", {
    detail: { locationsMap: stateVal.mobLocations }
  }));
}

function handleCrushToggle(e: Event): void {
  const target = e.target as HTMLElement;
  const point = target.closest(".spawn-point") as HTMLElement | null;
  if (!point) return;

  const stateVal = getState();
  if (!stateVal.isVerified) {
    openAuthModal();
    return;
  }

  if (point.dataset.isInteractive !== "true") return;
  if (point.dataset.isLastone === "true") return;

  const card = target.closest(".mobcard-card") as HTMLElement | null;
  if (!card) return;

  e.preventDefault();
  e.stopPropagation();

  const mobNo = parseInt(card.dataset.mobNo!, 10);
  const mob = stateVal.mobs.find(m => m.No === mobNo);
  if (!mob) return;

  const locationId = point.dataset.locationId!;
  const area = mob.area;

  const isTouchDevice = window.matchMedia("(hover: none)").matches;
  if (isTouchDevice) {
    const now = Date.now();
    const timeDiff = now - lastClickTime;

    if (locationId === lastClickLocationId && timeDiff < CONFIG.CLICK_THRESHOLD) {
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

export function attachLocationEvents(): void {
  if (locationEventsAttached) return;

  const moblistContainer = document.getElementById("moblist-container");
  if (moblistContainer) {
    moblistContainer.addEventListener("click", handleCrushToggle);
  }

  const mobcardDetail = document.getElementById("mobcard-detail");
  if (mobcardDetail) {
    mobcardDetail.addEventListener("click", handleCrushToggle);
  }

  locationEventsAttached = true;
}

// イベント委譲
function attachGlobalEventListeners(): void {
  let prevWidth = window.innerWidth;
  window.addEventListener("resize", debounce(() => {
    const currentWidth = window.innerWidth;
    if ((prevWidth >= CONFIG.BREAKPOINT_PC) !== (currentWidth >= CONFIG.BREAKPOINT_PC)) {
      prevWidth = currentWidth;
      sortAndRedistribute();
    }
  }, CONFIG.DEBOUNCE_DELAY));

  document.body.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;

    const navBtn = target.closest('.appnav-btn[data-nav-id]') as HTMLElement | null;
    if (navBtn) {
      const navId = navBtn.dataset.navId!;
      if (navId === 'notify') return;
      e.preventDefault();
      e.stopPropagation();
      if (navId === 'home') {
        closePanel();
        const container = document.getElementById("moblist-container");
        if (container) container.scrollTo({ top: 0, behavior: "smooth" });
        setActiveNavItem('home');
      } else {
        togglePanel(navId);
      }
      return;
    }

    const filterBtn = target.closest(".area-filter-btn");
    if (filterBtn) {
      e.stopPropagation();
      handleAreaFilterClick(e);
      return;
    }

    if (target.closest('.appnav-logo')) {
      window.location.reload();
      return;
    }
  });

  if (DOM.reportForm) {
    DOM.reportForm.addEventListener('submit', handleReportSubmit);
  }

  document.body.addEventListener('input', (e) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('mobcard-memo-input') || target.matches("[data-action='save-memo']")) {
      adjustMemoHeight(target);
    }
  });

  document.body.addEventListener('change', async (e) => {
    const input = e.target as HTMLInputElement;
    if (input.classList.contains('mobcard-memo-input') || input.matches("[data-action='save-memo']")) {
      const mobNo = parseInt(input.dataset.mobNo!, 10);
      const value = input.value.replace(/[\r\n]/g, '').trim();
      if (!isNaN(mobNo)) {
        if (!getState().isVerified) {
          input.value = '';
          openAuthModal();
          return;
        }

        // 楽観的更新: サーバー応答を待たずに手元のモブデータとUI（リスト＋詳細カード）を即時反映
        const mobMap = getMobMap();
        const mob = mobMap?.get(String(mobNo));
        if (mob) {
          mob.memo_text = value;
          mob.memo_updated_at = Math.floor(serverNow() / 1000);
          const cards = cardCache.get(String(mobNo));
          if (cards) {
            cards.forEach(card => updateCardFull(card, mob));
          }
        }

        await submitMemo(mobNo, value);
      }
    }
  });

  document.body.addEventListener('keydown', (e) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('mobcard-memo-input') || target.matches("[data-action='save-memo']")) {
      if (e.key === 'Enter' && !e.isComposing) {
        (target as HTMLElement).blur();
      }
    }
  });

  let touchStartX = 0;
  document.body.addEventListener('touchstart', (e) => {
    const target = e.target as HTMLElement;
    const reportBtn = target.closest('.report-side-bar') as HTMLElement | null;
    if (reportBtn) touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  document.body.addEventListener('touchend', (e) => {
    const target = e.target as HTMLElement;
    const reportBtn = target.closest('.report-side-bar') as HTMLElement | null;
    if (reportBtn) {
      const touchEndX = e.changedTouches[0].screenX;
      if (touchEndX - touchStartX > 30) {
        const mobNo = parseInt(reportBtn.dataset.mobNo!, 10);
        if (reportBtn.dataset.reportType === 'modal') openReportModal(mobNo);
        else reportBtn.click();
      }
    }
  }, { passive: true });
}

// イベント
function initAppEventListeners(): void {
  window.addEventListener('maintenanceUpdated', () => renderMaintenanceStatus());

  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      setOpenMobCardNo(null);
      document.querySelectorAll('.appnav-rank-item.appnav-active').forEach(el => el.classList.remove('appnav-active'));
    }
  });

  window.addEventListener('initialDataLoaded', () => {
    if (loadingTimeout) clearTimeout(loadingTimeout);
    try {
      renderMaintenanceStatus();
      updateErrorPanel();
      updateHeaderTime();
      filterAndRender({ isInitialLoad: true });
      lastTierBTime = 0;
      lastTierCTime = 0;
      updateProgressBarsOptimized();

      const isFirstVisit = !localStorage.getItem("has_visited");
      if (isFirstVisit) {
        localStorage.setItem("has_visited", "true");
        if ((window as any).openUserManual) (window as any).openUserManual();
      }
    } catch (e) {
      console.error("初期ロード処理失敗:", e);
      DOM.loadingOverlay?.classList.add("hidden");
    }
  }, { once: true });

  window.addEventListener('criticalDataLoadError', (e: any) => {
    if (loadingTimeout) clearTimeout(loadingTimeout);
    const overlay = DOM.loadingOverlay;
    if (overlay) {
      const spinner = overlay.querySelector('.loading-spinner');
      if (spinner) spinner.classList.add('u-hidden');
      const text = overlay.querySelector('.loading-text');
      if (text) {
        text.classList.add('u-pre-wrap', 'u-text-error');
        text.textContent = e.detail.message;
      }
    }
  }, { once: true });

  window.addEventListener('characterNameSet', () => renderMaintenanceStatus());

  window.addEventListener('mobsBatchUpdated', (e: any) => {
    const { mobNos } = e.detail;
    const mobMap = getMobMap();

    if (!mobMap) return;

    let needsSort = false;

    mobNos.forEach((mobNo: number) => {
      const mob = mobMap.get(String(mobNo));
      if (!mob) return;

      checkAndNotify(mob);

      const cards = cardCache.get(String(mobNo));
      if (cards) {
        cards.forEach(card => updateCardFull(card, mob));
      }

      if (hasMobSortKeyChanged(mob)) {
        needsSort = true;
      }
    });

    updateVisibleDetailCard(mobMap);

    if (needsSort) {
      invalidateSortCache();
      sortAndRedistribute();
    }
  });

  window.addEventListener('mobUpdated', (e: any) => {
    const { mobNo, mob } = e.detail;
    const mobMap = getMobMap();

    if (!mobMap) return;

    const cards = cardCache.get(String(mobNo));

    if (cards) {
      cards.forEach(card => updateCardFull(card, mob));
    }

    updateVisibleDetailCard(mobMap);

    if (hasMobSortKeyChanged(mob)) {
      invalidateSortCache();
      sortAndRedistribute();
    }
  });

  window.addEventListener('filterChanged', () => {
    invalidateFilterCache();
    filterAndRender();
  });

  window.addEventListener('mobsUpdated', () => updateProgressBarsOptimized());
  window.addEventListener('locationDataReady', () => {
    updateVisibleCards();
    const mobMap = getMobMap();
    if (mobMap) updateVisibleDetailCard(mobMap);
  });
  window.addEventListener('locationsUpdated', () => {
    invalidateFilterCache();
    updateVisibleCards();
    const mobMap = getMobMap();
    if (mobMap) updateVisibleDetailCard(mobMap);
  });

  window.addEventListener('appNotify', (e: any) => {
    const { message, type } = e.detail;
    showToast(message, type);
  });
}

function attachMobCardEvents(): void {
  const containers = [
    document.getElementById("moblist-container"),
    document.getElementById("mobcard-detail")
  ].filter(Boolean) as HTMLElement[];

  containers.forEach(c => c.addEventListener("click", handleGeneralClick));

  const pane = document.getElementById("mobcard-pane");
  if (pane) {
    pane.addEventListener("click", (e) => {
      closePanel();
      if (e.target === pane && window.innerWidth < CONFIG.BREAKPOINT_PC) {
        setOpenMobCardNo(null);
        showDetailOnly();
      }
    });
  }
}

function handleGeneralClick(e: Event): void {
  const target = e.target as HTMLElement;
  const item = target.closest(".moblist-item, .mobcard-card") as HTMLElement | null;
  if (!item) return;

  const mobNo = parseInt(item.dataset.mobNo!, 10);
  const mob = getState().mobs.find(m => m.No === mobNo);
  if (!mob) return;

  const reportBtn = target.closest(".moblist-report-btn") as HTMLElement | null;
  if (reportBtn) {
    e.preventDefault();
    e.stopPropagation();
    if (!getState().isVerified) {
      openAuthModal();
      return;
    }
    const type = reportBtn.dataset.reportType || (mob.rank === 'A' ? 'instant' : 'modal');
    if (type === "modal") openReportModal(mobNo);
    else handleInstantReport(mobNo);
    return;
  }

  if (target.closest('[data-action="close-card"]')) {
    e.stopPropagation();
    closePanel();
    setOpenMobCardNo(null);
    showDetailOnly();
    return;
  }

  if (target.closest(".moblist-item") || target.classList.contains('mobcard-card')) {
    closePanel();
    // モブカードを開く際、検索を終了（PC窓は維持＆クリア、スマホはパネルも閉じる）
    dismissSearch();
    const currentOpen = getState().openMobCardNo;
    setOpenMobCardNo(currentOpen === mobNo ? null : mobNo);
    showDetailOnly();
  }
}

if ((window as any).appInterval) clearInterval((window as any).appInterval);
(window as any).appInterval = setInterval(() => {
  if (document.visibilityState === 'hidden') return;
  updateProgressBarsOptimized();
}, EORZEA_MINUTE_MS);

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    updateHeaderTime();
    updateProgressBarsOptimized(true);
  }
});

if (document.readyState === "loading") {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  queueMicrotask(initApp);
}
