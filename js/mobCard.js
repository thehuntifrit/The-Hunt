import { calculateRepop, getDurationDHMParts, formatDurationDHM, formatMMDDHHmm } from "./cal.js";
import { getState, PROGRESS_CLASSES, setOpenMobCardNo, isCulled } from "./dataManager.js";
import { toggleCrushStatus } from "./server.js";
import { openAuthModal, openReportModal } from "./modal.js";
import { sortAndRedistribute, handleInstantReport } from "./app.js";

// ─── 汎用ユーティリティ ─────────────────────────────────

function updateEl(parent, selector, props = {}, dataset = {}) {
  const el = parent.querySelector(selector);
  if (!el) return;
  Object.assign(el, props);
  for (const [key, val] of Object.entries(dataset)) {
    el.dataset[key] = val;
  }
}

export function cloneTemplate(id) {
  const template = document.getElementById(id);
  if (!template) return null;
  return template.content.cloneNode(true).firstElementChild;
}

export function escapeHtml(str) {
  if (typeof str !== "string") return str;
  return str.replace(/[&<>"']/g, function (m) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[m];
  });
}

export function processText(text) {
  if (typeof text !== "string" || !text) return "";
  return escapeHtml(text).replace(/\/\//g, "<br>");
}

// ─── ツールチップ ───────────────────────────────────────

let tooltip = null;
let currentTarget = null;

export function initTooltip() {
  tooltip = document.createElement("div");
  tooltip.id = "custom-tooltip";
  tooltip.className = "custom-tooltip hidden";
  document.body.appendChild(tooltip);

  document.addEventListener("mousemove", (e) => {
    if (!currentTarget) return;

    if (!document.body.contains(currentTarget)) {
      currentTarget = null;
      tooltip.classList.add("hidden");
      return;
    }

    const offset = 15;
    const x = e.clientX;
    const y = e.clientY - offset;

    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
  });

  document.addEventListener("mouseover", (e) => {
    const target = e.target.closest("[data-tooltip]");
    if (!target) return;

    const text = target.getAttribute("data-tooltip");
    if (!text) return;

    currentTarget = target;
    tooltip.textContent = text;
    tooltip.classList.remove("hidden");

    const offset = 15;
    tooltip.style.left = `${e.clientX}px`;
    tooltip.style.top = `${e.clientY - offset}px`;
  });

  document.addEventListener("mouseout", (e) => {
    const target = e.target.closest("[data-tooltip]");
    if (target && target === currentTarget) {
      currentTarget = null;
      tooltip.classList.add("hidden");
    }
  });
}

export function hideTooltip() {
  if (tooltip) {
    tooltip.classList.add("hidden");
  }
  currentTarget = null;
}

// ─── 拡大鏡 ─────────────────────────────────────────────

export function initGlobalMagnifier() {
  if (window.magnifierInitialized) return;
  window.magnifierInitialized = true;

  const magnifier = document.getElementById('global-magnifier');
  const wrapper = magnifier?.querySelector('.magnifier-content-wrapper');
  if (!magnifier || !wrapper) return;

  let activeMapImg = null;
  let activeMapContainer = null;
  const ZOOM_SCALE = 2.0;

  const updateMagnifier = (e) => {
    if (!activeMapImg || !activeMapContainer) return;

    const rect = activeMapContainer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
      magnifier.classList.add('hidden');
      document.body.classList.remove('magnifier-active');
      activeMapImg = null;
      activeMapContainer = null;
      wrapper.innerHTML = '';
      return;
    }

    magnifier.style.left = `${e.clientX}px`;
    magnifier.style.top = `${e.clientY}px`;

    const magRect = magnifier.getBoundingClientRect();
    const centerX = magRect.width / 2;
    const centerY = magRect.height / 2;

    const translateX = centerX - (x * ZOOM_SCALE);
    const translateY = centerY - (y * ZOOM_SCALE);

    wrapper.style.transform = `translate(${translateX}px, ${translateY}px) scale(${ZOOM_SCALE})`;
  };

  document.addEventListener('mousedown', (e) => {
    if (e.button !== 2) return;

    const mapContainer = e.target.closest('.map-container');
    if (!mapContainer) return;

    const mapImg = mapContainer.querySelector('.mob-map-img');
    if (!mapImg) return;

    e.preventDefault();
    activeMapContainer = mapContainer;
    activeMapImg = mapImg;

    wrapper.innerHTML = '';
    const clone = mapContainer.cloneNode(true);

    clone.classList.remove('w-full', 'u-w-full', 'pc-map-box', 'cursor-crosshair', '!cursor-crosshair');
    clone.classList.add('magnifier-clone');

    clone.style.width = `${mapContainer.offsetWidth}px`;
    clone.style.height = `${mapContainer.offsetHeight}px`;

    wrapper.appendChild(clone);
    magnifier.classList.remove('hidden');
    document.body.classList.add('magnifier-active');
    updateMagnifier(e);
  }, { capture: true });

  window.addEventListener('mousemove', (e) => {
    if (activeMapImg) {
      updateMagnifier(e);
    }
  });

  window.addEventListener('mouseup', (e) => {
    if (e.button === 2) {
      magnifier.classList.add('hidden');
      document.body.classList.remove('magnifier-active');
      activeMapImg = null;
      activeMapContainer = null;
      wrapper.innerHTML = '';
    }
  });

  document.addEventListener('contextmenu', (e) => {
    if (e.target.closest('.map-container')) {
      e.preventDefault();
    }
  });
}

// ─── タイマー表示 ────────────────────────────────────────

export function shouldDisplayMemo(mob) {
  const hasMemo = mob.memo_text?.trim();
  const isMemoNewer = (mob.memo_updated_at || 0) >= (mob.last_kill_time || 0);
  return hasMemo && (isMemoNewer || !mob.last_kill_time);
}

export function computeTimeLabel(mob) {
  const { minRepop, maxRepop, status, isInConditionWindow, conditionWindowEnd, nextConditionSpawnDate, isMaintenanceStop, isBlockedByMaintenance } = mob.repopInfo || {};
  const now = Date.now() / 1000;
  const isMaint = !!(isMaintenanceStop || isBlockedByMaintenance);
  const isTimedMob = !!(isInConditionWindow || nextConditionSpawnDate);

  if (!minRepop && !maxRepop && !isTimedMob) {
    return { label: "", timeValue: "--/-- --:--", isSpecialCondition: false, isTimeOver: false, isTimedMob: false, dhm: null };
  }

  let label = "", isSpecialCondition = isTimedMob, isTimeOver = status === "MaxOver";
  let secondsRemaining = 0;

  if (isInConditionWindow && conditionWindowEnd && now < (conditionWindowEnd.getTime() / 1000)) {
    label = "残り";
    secondsRemaining = (conditionWindowEnd.getTime() / 1000) - now;
    isSpecialCondition = true;
  } else if (nextConditionSpawnDate && now < (nextConditionSpawnDate.getTime() / 1000)) {
    label = "次回";
    secondsRemaining = (nextConditionSpawnDate.getTime() / 1000) - now;
    isSpecialCondition = true;
  } else if (minRepop && now < minRepop) {
    label = "次回";
    secondsRemaining = minRepop - now;
    if (isTimedMob) isSpecialCondition = true;
  } else if (maxRepop && now < maxRepop) {
    label = "残り";
    secondsRemaining = maxRepop - now;
    if (isTimedMob) isSpecialCondition = true;
  } else if (maxRepop) {
    label = "超過";
    secondsRemaining = now - maxRepop;
    if (isTimedMob) isSpecialCondition = true;
    isTimeOver = true;
  }

  const dhm = secondsRemaining >= 0 ? getDurationDHMParts(secondsRemaining) : null;
  const timeValue = dhm ? formatDurationDHM(secondsRemaining) : "--/-- --:--";

  if (isMaint) label = "中止";

  return { label, timeValue, isSpecialCondition, isTimeOver, isTimedMob, dhm, isInWindow: !!isInConditionWindow };
}

function renderTimerRichHTML(label, dhm, isSpecialCondition, isTimeOver, isInWindow) {
  if (!dhm) {
    const fallback = document.createElement('div');
    fallback.className = 'timer-value';
    fallback.textContent = "--/-- --:--";
    return fallback;
  }

  if (isInWindow) {
    const totalMinutes = Math.ceil((dhm.rawS || 0) / 60);
    const span = document.createElement('span');
    span.className = 'timer-value special-timer';
    span.innerHTML = `<span class="timer-part"><span class="timer-num">${totalMinutes}</span><span class="timer-unit">分</span></span>`;
    return span;
  }

  const el = cloneTemplate('timer-rich-template');
  if (!el) return document.createElement('span');

  if (isSpecialCondition) el.classList.add('label-next');
  if (isTimeOver) el.classList.add('time-over');

  const { d, h, m } = dhm;

  const format = (elPart, num, unit) => {
    const numEl = elPart.querySelector('.timer-num');
    const isHidden = unit === 'h' && (Number(num) === 0 || !num);
    elPart.classList.toggle('hidden', isHidden);
    if (!isHidden) {
      numEl.innerHTML = String(num || 0).padStart(2, '0').replace(/^0/, '&nbsp;');
    }
  };

  format(el.querySelector('.h-part'), h, 'h');
  format(el.querySelector('.m-part'), m, 'm');

  return el;
}

// ─── スポーンポイント ───────────────────────────────────

export function getSpawnCountInfo(mob) {
  const state = getState();
  const instance = mob.No % 10;
  const key = `${mob.area}_${instance}`;
  const mobLocationsData = state.mobLocations?.[key];
  const spawnCullStatus = mobLocationsData || mob.spawn_cull_status;
  if (!mob.mapImage || !mob.locations || mob.rank === 'F') return { countHtml: "", remainingCount: 0, spawnCullStatus };
  const validSpawnPoints = getValidSpawnPoints(mob, spawnCullStatus);
  const remainingCount = validSpawnPoints.length;
  let countHtml = "";
  if (remainingCount === 1) {
    const pointNumber = parseInt(validSpawnPoints[0]?.id?.slice(-2) || "0", 10);
    countHtml = `<span class="pc-count-val count-warn font-bold">📍${pointNumber}<span class="u-ml-1">番</span></span>`;
  } else if (remainingCount > 1) {
    countHtml = `<span class="pc-count-val font-bold">📍@<span class="u-ml-1">${remainingCount}</span></span>`;
  }
  return { countHtml, remainingCount, spawnCullStatus, validSpawnPoints };
}

export function getValidSpawnPoints(mob, spawnCullStatus) {
  return (mob.locations ?? []).filter(point => {
    const isTargetRank = point.mob_ranks.some(r => r === "S" || r === "A");
    if (!isTargetRank) return false;
    const pointStatus = spawnCullStatus?.[point.id];
    return !isCulled(pointStatus, mob.No, mob);
  });
}

export function drawSpawnPoint(point, spawnCullStatus, mobNo, rank, isLastOne, isS_LastOne) {
  const el = cloneTemplate('spawn-point-template');
  if (!el) return null;

  const pointStatus = spawnCullStatus?.[point.id];
  const isCulledFlag = isCulled(pointStatus, mobNo);
  const isS_A_Cullable = point.mob_ranks.some(r => r === "S" || r === "A");
  const isB_Only = point.mob_ranks.every(r => r.startsWith("B"));

  let colorClass = "";
  let dataIsInteractive = "false";

  if (isLastOne) {
    colorClass = "color-lastone";
    dataIsInteractive = "false";
  } else if (isS_A_Cullable) {
    const rankB = point.mob_ranks.find(r => r.startsWith("B"));
    if (isCulledFlag) {
      colorClass = rankB === "B1" ? "color-b1-culled" : "color-b2-culled";
    } else {
      colorClass = rankB === "B1" ? "color-b1" : "color-b2";
    }
    dataIsInteractive = "true";
  } else if (isB_Only) {
    const rankB = point.mob_ranks[0];
    colorClass = rankB === "B1" ? "color-b1-only" : "color-b2-only";
    dataIsInteractive = "false";
  }

  el.className = `spawn-point ${colorClass}`;
  el.style.left = `${point.x}%`;
  el.style.top = `${point.y}%`;

  const pointNumber = parseInt(point.id.slice(-2), 10);
  const titleText = `${pointNumber}${isCulledFlag ? " (済)" : ""}`;

  Object.assign(el.dataset, {
    tooltip: titleText,
    locationId: point.id,
    mobNo: mobNo,
    rank: rank,
    isCulled: isCulledFlag,
    isLastone: isLastOne ? "true" : "false",
    isInteractive: dataIsInteractive
  });

  return el;
}

// ─── カード作成 ─────────────────────────────────────────

export function createMobCard(mob, isDetailView = false) {
  if (isDetailView) return createPCDetailCard(mob);
  return createSimpleMobItem(mob);
}

export function createPCDetailCard(mob) {
  const template = document.getElementById('pc-detail-card-template');
  const clone = template.content.cloneNode(true);
  const card = clone.querySelector('.pc-detail-card');

  const rank = mob.rank;
  const { elapsedPercent, nextConditionSpawnDate, minRepop, maxRepop } = mob.repopInfo || {};
  const fmt = (val) => val ? formatMMDDHHmm(val) : "--/-- --:--";

  card.dataset.mobNo = mob.No;
  card.dataset.rank = rank;

  updateEl(card, '.pc-detail-name', { textContent: mob.name });
  const nameEl = card.querySelector('.pc-detail-name');
  if (nameEl) nameEl.dataset.rank = rank;

  updateEl(card, '.pc-detail-rank', { textContent: rank }, { rank });

  const progressBar = card.querySelector('.pc-detail-progress-bar');
  if (progressBar) progressBar.style.width = `${elapsedPercent || 0}%`;

  updateEl(card, '[data-min-repop]', { textContent: fmt(minRepop) });
  updateEl(card, '[data-max-repop]', { textContent: fmt(maxRepop) });
  updateEl(card, '[data-next-possible]', { textContent: nextConditionSpawnDate ? fmt(nextConditionSpawnDate) : "--/-- --:--" });
  updateEl(card, '[data-last-kill]', { textContent: fmt(mob.last_kill_time) });

  updateEl(card, '.section-content.condition', { innerHTML: processText(mob.condition || "\u7279\u6b8a\u306a\u51fa\u73fe\u6761\u4ef6\u306f\u3042\u308a\u307e\u305b\u3093\u3002") });
  
  const memoEl = card.querySelector('.detail-memo-input');
  if (memoEl) {
    memoEl.value = mob.memo_text || '';
    memoEl.dataset.mobNo = mob.No;
    // 初期表示時の高さ調整
    setTimeout(() => adjustMemoHeight(memoEl), 0);
    
    // 入力時の自動リサイズ
    memoEl.addEventListener('input', () => adjustMemoHeight(memoEl));
  }

  const mapSection = card.querySelector('.map-section');
  if (mapSection) {
    if (mob.mapImage && mob.rank !== 'F') {
      mapSection.classList.remove('hidden');
      updateMapOverlay(card, mob);
    } else {
      mapSection.classList.add('hidden');
    }
  }

  const reportBtn = card.querySelector('.pc-list-report-btn');
  if (reportBtn) {
    reportBtn.dataset.reportType = rank === 'A' ? 'instant' : 'modal';
    reportBtn.dataset.mobNo = mob.No;
  }

  updateAreaInfo(card, mob);
  updateMobCount(card, mob);
  updateExpandablePanel(card, mob);

  return card;
}

export function createSimpleMobItem(mob) {
  const item = cloneTemplate('pc-list-item-template');
  if (!item) return document.createElement('div');

  item.classList.add(`rank-${mob.rank.toLowerCase()}`);
  item.dataset.mobNo = mob.No;
  item.dataset.rank = mob.rank;

  const nameEl = item.querySelector('.pc-list-mob-name');
  if (nameEl) {
    nameEl.textContent = mob.name;
    nameEl.dataset.rank = mob.rank;
  }

  const rankBadge = item.querySelector('.list-rank-badge');
  if (rankBadge) {
    rankBadge.textContent = mob.rank;
    rankBadge.dataset.rank = mob.rank;
  }

  updateSimpleMobItem(item, mob);
  return item;
}

// ─── カード更新 ─────────────────────────────────────────

export function updateProgressBar(card, mob) {
  const { elapsedPercent, status } = mob.repopInfo || {};
  const bars = card.querySelectorAll('.progress-bar-bg, .pc-detail-progress-bar');
  const texts = card.querySelectorAll('.progress-text, .pc-detail-progress-text');
  const wrappers = card.querySelectorAll('.progress-bar-wrapper, .pc-detail-progress-container');
  const isInCondition = !!mob.repopInfo.isInConditionWindow;
  const isPreRepop = status === "Next" || status === "Maintenance";
  card.classList.toggle('is-pre-repop', isPreRepop);

  bars.forEach(bar => {
    const currentWidth = parseFloat(bar.style.width) || 0;
    if (Math.abs(elapsedPercent - currentWidth) > 0.1) {
      bar.style.transition = (currentWidth === 0 || elapsedPercent < currentWidth) ? "none" : "width 10s linear";
      bar.style.width = `${elapsedPercent || 0}%`;
    }
    bar.classList.remove('status-max-over', 'status-condition-active', 'status-pop-window', 'status-next');
    bar.style.background = "";
    if (status === "MaxOver") bar.classList.add("status-max-over");
    else if (status === "ConditionActive") bar.classList.add("status-condition-active");
    else if (status === "PopWindow") bar.classList.add("status-pop-window");
    else if (status === "Next" || status === "NextCondition") bar.classList.add("status-next");
  });

  texts.forEach(text => {
    text.classList.remove(PROGRESS_CLASSES.TEXT_NEXT, PROGRESS_CLASSES.TEXT_POP);
    if (status === "PopWindow" || status === "ConditionActive" || status === "MaxOver") {
      text.classList.add(PROGRESS_CLASSES.TEXT_POP);
    }
  });

  wrappers.forEach(wrapper => {
    wrapper.classList.remove(PROGRESS_CLASSES.BLINK_WHITE);
    if (isInCondition && !mob.repopInfo?.isMaintenanceStop && !mob.repopInfo?.isBlockedByMaintenance) {
      wrapper.classList.add(PROGRESS_CLASSES.BLINK_WHITE);
      card.classList.add('blink-border-white');
    } else {
      card.classList.remove('blink-border-white');
    }
  });
}

export function updateProgressText(card, mob) {
  const { elapsedPercent, status, isInConditionWindow } = mob.repopInfo || {};
  const { label, timeValue, isSpecialCondition, isTimeOver, dhm, isInWindow } = computeTimeLabel(mob);
  const isMaint = !!(mob.repopInfo?.isBlockedByMaintenance || mob.repopInfo?.isMaintenanceStop);

  const isPCDetail = !!(card.id === 'pc-right-detail' || card.closest('#pc-right-detail') || card.classList.contains('pc-detail-card'));
  const rankBadge = card.querySelector('.list-rank-badge, .pc-detail-rank');
  const areaEl = card.querySelector('.mobile-header-area-text');

  if (rankBadge) {
    rankBadge.textContent = mob.rank;
    rankBadge.dataset.rank = mob.rank;
  }
  if (areaEl) {
    areaEl.textContent = ` ${mob.area} | ${mob.Expansion}`;
  }

  const iconEl = card.querySelector('.js-mobile-icon');
  const timeEl = card.querySelector('.js-mobile-time');
  const pcDetailEl = card.querySelector('.pc-detail-progress-text');

  if (iconEl) {
    iconEl.textContent = label || '';
    iconEl.className = 'js-mobile-icon timer-label-base';
    if (status) iconEl.classList.add(`status-${status.toLowerCase()}`);
    if (isSpecialCondition) iconEl.classList.add('is-special');
  }
  if (timeEl) {
    const timerNode = renderTimerRichHTML(label, dhm, isSpecialCondition, isTimeOver, isInWindow);
    const cacheKey = `${label}-${isSpecialCondition}-${isTimeOver}-${isInWindow}-${dhm?.rawS || 0}`;

    if (timeEl._lastCacheKey !== cacheKey) {
      timeEl.innerHTML = "";
      const inner = document.createElement("div");
      inner.className = "js-mobile-time-inner";
      inner.appendChild(timerNode);

      const percentSpan = document.createElement("span");
      percentSpan.className = "detail-percent-val";

      const { elapsedPercent, status: pStatus } = mob.repopInfo || {};
      const percentValue = pStatus === "MaxOver" ? "100" : String(Math.max(0, Math.min(100, Math.floor(elapsedPercent || 0))));
      percentSpan.innerHTML = `(${percentValue}%)`;

      inner.appendChild(percentSpan);

      timeEl.appendChild(inner);
      timeEl._lastCacheKey = cacheKey;
    }
    if (status === "MaxOver") timeEl.classList.add("max-over");
    else timeEl.classList.remove("max-over");
  }

  if (pcDetailEl) {
    const { elapsedPercent, status: dStatus } = mob.repopInfo || {};
    const percentValue = dStatus === "MaxOver" ? "100" : String(Math.max(0, Math.min(100, Math.floor(elapsedPercent || 0))));
    const pcText = `${percentValue}<span class="percent-unit">%</span>`;

    if (pcDetailEl._lastPercent !== pcText) {
      let span = pcDetailEl._cachedSpan;
      if (!span) {
        span = pcDetailEl.querySelector('span');
        if (!span) {
          span = document.createElement('span');
          span.className = 'pc-percent-inner';
          pcDetailEl.textContent = '';
          pcDetailEl.appendChild(span);
        }
        pcDetailEl._cachedSpan = span;
      }
      span.innerHTML = pcText;
      pcDetailEl._lastPercent = pcText;
    }
    if (status === "MaxOver") pcDetailEl.classList.add("max-over");
    else pcDetailEl.classList.remove("max-over");
  }

  const mobNameEl = card.querySelector('.mob-name');
  const shouldDimCard = isMaint;

  if (shouldDimCard) {
    card.classList.add("is-pre-repop");
  } else {
    card.classList.remove("is-pre-repop");
  }

  if (isMaint) card.classList.add("maintenance-gray-out");
  else card.classList.remove("maintenance-gray-out");

  if (!isMaint && (status === "ConditionActive" || (status === "MaxOver" && isInConditionWindow))) card.classList.add("blink-border-white");
  else card.classList.remove("blink-border-white");
}

export function updateExpandablePanel(card, mob) {
  const { minRepop, maxRepop, nextConditionSpawnDate } = mob.repopInfo || {};

  const elMin = card.querySelector("[data-min-repop]");
  const elMax = card.querySelector("[data-max-repop]");
  const elNext = card.querySelector("[data-next-possible]");
  const elLast = card.querySelector("[data-last-kill]");

  const fmt = (val) => val ? formatMMDDHHmm(val) : "--/-- --:--";

  if (elMin) elMin.textContent = fmt(minRepop);
  if (elMax) elMax.textContent = fmt(maxRepop);

  if (elNext) {
    if (mob.repopInfo?.nextConditionSpawnDate) {
      elNext.textContent = formatMMDDHHmm(mob.repopInfo.nextConditionSpawnDate);
      elNext.classList.add('text-yellow');
      elNext.classList.remove('text-secondary');
    } else {
      elNext.textContent = "--/-- --:--";
      elNext.classList.remove('text-yellow');
      elNext.classList.add('text-secondary');
    }
  }

  if (elLast) elLast.textContent = fmt(mob.last_kill_time);

  const elMemoInput = card.querySelector(".detail-memo-input");
  if (elMemoInput) {
    if (elMemoInput.dataset.mobNo !== String(mob.No)) elMemoInput.dataset.mobNo = mob.No;
    if (document.activeElement !== elMemoInput) {
      const newValue = mob.memo_text || "";
      if (elMemoInput.value !== newValue) {
        elMemoInput.value = newValue;
        adjustMemoHeight(elMemoInput);
      }
    }
  }

  const elCondition = card.querySelector(".condition-text");
  if (elCondition) {
    const conditionText = mob.condition ? processText(mob.condition) : "特別な出現条件はありません。";
    if (elCondition.innerHTML !== conditionText) elCondition.innerHTML = conditionText;

    const isPCDetail = card.classList.contains('pc-detail-card');
    const sections = [
      elCondition.closest('.detail-section') || elCondition.closest('.pc-detail-section'),
      card.querySelector('.memo-section'),
      card.querySelector('.map-section')
    ].filter(Boolean);

    sections.forEach(section => {
      if (isPCDetail && mob.condition) {
        section.classList.add('condition-section-neon');
      } else {
        section.classList.remove('condition-section-neon');
      }
    });
  }
}

export function updateMemoIcon(card, mob) {
  const memoIconContainer = card.querySelector('.memo-icon-container');
  if (!memoIconContainer) return;
  const shouldShowMemo = shouldDisplayMemo(mob);
  const newState = shouldShowMemo ? mob.memo_text : "";
  if (memoIconContainer.dataset.memoState === newState) return;
  memoIconContainer.dataset.memoState = newState;
  memoIconContainer.innerHTML = '';
  if (shouldShowMemo) {
    memoIconContainer.classList.remove('hidden');
    const span = document.createElement('span');
    span.classList.add('memo-icon');
    span.dataset.tooltip = mob.memo_text;
    span.textContent = '📝';
    memoIconContainer.appendChild(span);
  } else {
    memoIconContainer.classList.add('hidden');
  }
}

export function updateMobCount(card, mob) {
  const countContainer = card.querySelector('.mob-count-container');
  if (!countContainer) return;
  const { remainingCount, validSpawnPoints } = getSpawnCountInfo(mob);
  let displayCountText = "";
  if (mob.mapImage && mob.locations) {
    if (remainingCount === 1) {
      const pointNumber = parseInt(validSpawnPoints[0]?.id?.slice(-2) || "0", 10);
      displayCountText = `<span class="pc-count-val font-bold count-warn">📍${pointNumber}<span style="margin-left:2px;">番</span></span>`;
    } else if (remainingCount > 1) {
      displayCountText = `<span class="pc-count-val font-bold text-secondary">📍@<span style="margin-left:2px;">${remainingCount}</span></span>`;
    }
  }
  if (countContainer.dataset.cacheKey !== displayCountText) {
    countContainer.dataset.cacheKey = displayCountText;
    countContainer.innerHTML = displayCountText;
  }
}

export function updateAreaInfo(card, mob) {
  const areaName = mob.area || "--";
  const expName = mob.Expansion || "--";
  const rank = mob.rank || "A";

  card.querySelectorAll('.mob-rank-badge, .list-rank-badge').forEach(badge => {
    badge.textContent = rank;
    badge.dataset.rank = rank;
  });

  card.querySelectorAll('.detail-area').forEach(el => el.textContent = areaName);
  card.querySelectorAll('.detail-expansion').forEach(el => el.textContent = `| ${expName}`);

  const headerArea = card.querySelector('.mobile-header-area-text');
  if (headerArea) {
    headerArea.textContent = `${areaName} | ${expName}`;
  }
}

export function adjustMemoHeight(el) {
  if (!el || el.tagName !== 'TEXTAREA') return;
  el.style.height = 'auto';
  el.style.height = (el.scrollHeight) + 'px';
}

export function updateMapOverlay(card, mob) {
  const mapContainer = card.querySelector('.map-container');
  if (!mapContainer) return;
  if (mob.rank === 'F') {
    mapContainer.classList.add('hidden');
    const mapSection = mapContainer.closest('.map-section');
    if (mapSection) mapSection.classList.add('hidden');
    return;
  }

  const mapImg = mapContainer.querySelector('.mob-map-img');
  if (mapImg && mob.mapImage && mapImg.dataset.mobMap !== mob.mapImage) {
    mapImg.src = `./maps/${mob.mapImage}`;
    mapImg.alt = `${mob.area} Map`;
    mapImg.dataset.mobMap = mob.mapImage;
    mapImg.decoding = "async";
    mapImg.loading = "eager";
    mapContainer.classList.remove('hidden');
    delete mapContainer.dataset.locationLoading;
  }
  if (mapContainer.classList.contains('hidden')) return;
  const mapOverlay = mapContainer.querySelector('.map-overlay');
  if (!mapOverlay) return;

  if (mob.mapImage && mob.locations) {
    const { spawnCullStatus, validSpawnPoints } = getSpawnCountInfo(mob);
    const isOneLeft = (validSpawnPoints?.length || 0) === 1;

    const currentPointsHash = (mob.locations ?? []).map(p => `${p.id}-${isCulled(spawnCullStatus?.[p.id], mob.No)}`).join("|") + `|${isOneLeft}`;
    if (mapOverlay._lastPointsHash !== currentPointsHash) {
      mapOverlay.innerHTML = "";
      const fragment = document.createDocumentFragment();
      (mob.locations ?? []).forEach(point => {
        const isThisPointTheLastOne = isOneLeft && point.id === validSpawnPoints[0]?.id;
        const pointEl = drawSpawnPoint(point, spawnCullStatus, mob.No, point.mob_ranks.includes("B2") ? "B2" : point.mob_ranks.includes("B1") ? "B1" : point.mob_ranks[0], isThisPointTheLastOne, isOneLeft);
        if (pointEl) fragment.appendChild(pointEl);
      });
      mapOverlay.appendChild(fragment);
      mapOverlay._lastPointsHash = currentPointsHash;
    }
  }
}

export function updateSimpleMobItem(item, mob) {
  const { elapsedPercent, status, isInConditionWindow } = mob.repopInfo || {};
  const isMaint = !!(mob.repopInfo?.isBlockedByMaintenance || mob.repopInfo?.isMaintenanceStop);
  const timeEl = item.querySelector('.pc-list-time');
  const progressEl = item.querySelector('.pc-list-bg-bar');
  const percentEl = item.querySelector('.pc-list-percent');
  const { countHtml } = getSpawnCountInfo(mob);
  const { label, timeValue, isSpecialCondition, isTimeOver, dhm, isInWindow } = computeTimeLabel(mob);

  if (timeEl) {
    const timerNode = renderTimerRichHTML(label, dhm, isSpecialCondition, isTimeOver, isInWindow);
    const cacheKey = `${label}-${status}-${isSpecialCondition}-${isTimeOver}-${isInWindow}-${dhm?.rawS || 0}`;

    if (timeEl._lastCacheKey !== cacheKey) {
      timeEl.innerHTML = "";
      const inner = document.createElement("div");
      inner.className = "timer-inner-grid";

      const labelSpan = document.createElement("span");
      labelSpan.className = `timer-label timer-label-base ${status ? 'status-' + status.toLowerCase() : ''} ${isSpecialCondition ? 'is-special' : ''} text-center opacity-90`;
      labelSpan.style.marginInlineStart = "4px";
      labelSpan.textContent = label;

      inner.appendChild(timerNode);
      inner.appendChild(labelSpan);
      timeEl.appendChild(inner);
      timeEl._lastCacheKey = cacheKey;
    }
  }
  const countInner = item.querySelector('.pc-list-count-inner');
  if (countInner) {
    countInner.innerHTML = countHtml;
  }

  const isPreRepop = status === "Next" || status === "Maintenance";
  item.classList.toggle('is-pre-repop', isPreRepop);
  if (progressEl) {
    const currentWidth = parseFloat(progressEl.style.width) || 0;
    if (Math.abs(elapsedPercent - currentWidth) > 0.001) {
      progressEl.style.transition = (currentWidth === 0 || elapsedPercent < currentWidth) ? "none" : "width linear 60s";
      progressEl.style.width = `${elapsedPercent}%`;
    }
    progressEl.classList.remove('status-max-over', 'status-condition-active', 'status-pop-window', 'status-next');
    if (isTimeOver) progressEl.classList.add("status-max-over");
    else if (status === "ConditionActive") progressEl.classList.add("status-condition-active");
    else if (status === "PopWindow") progressEl.classList.add("status-pop-window");
    else if (status === "Next" || status === "NextCondition") progressEl.classList.add("status-next");
  }
  if (percentEl) {
    const { elapsedPercent, status: listStatus } = mob.repopInfo || {};
    const isTimeOverVal = listStatus === "MaxOver";
    const percentValue = isTimeOverVal ? "100" : String(Math.max(0, Math.min(100, Math.floor(elapsedPercent || 0))));
    percentEl.innerHTML = `${percentValue}<span class="percent-unit">%</span>`;
  }
  if (isMaint) item.classList.add("maintenance-gray-out");
  else item.classList.remove("maintenance-gray-out");

  if (!isMaint && (status === "ConditionActive" || (status === "MaxOver" && isInConditionWindow))) item.classList.add("blink-active");
  else item.classList.remove("blink-active");
  updateMemoIcon(item, mob);
}

// ─── イベント ───────────────────────────────────────────

export function attachMobCardEvents() {
  const colContainer = document.getElementById("column-container");
  if (colContainer) {
    colContainer.addEventListener("click", handleMobCardClick);
  }

  const pcLeftList = document.getElementById("pc-left-list");
  if (pcLeftList) {
    pcLeftList.addEventListener("click", handlePCListClick);
  }

  const pcRightPane = document.getElementById("pc-right-detail");
  if (pcRightPane) {
    pcRightPane.addEventListener("click", handleMobCardClick);
  }

  const mobileOverlay = document.getElementById("mobile-detail-overlay");
  if (mobileOverlay) {
    mobileOverlay.addEventListener("click", handleMobCardClick);
  }

  const overlayBackdrop = document.getElementById("card-overlay-backdrop");
  if (overlayBackdrop) {
    overlayBackdrop.addEventListener("click", (e) => {
      if (e.target === overlayBackdrop || e.target === mobileOverlay) {
        setOpenMobCardNo(null);
        sortAndRedistribute({ immediate: true });
      }
    });
  }
}

function handlePCListClick(e) {
  const item = e.target.closest(".pc-list-item");
  if (!item) return;

  const mobNo = parseInt(item.dataset.mobNo, 10);
  const rank = item.dataset.rank;
  const reportBtn = e.target.closest(".pc-list-report-btn");

  if (reportBtn) {
    e.stopPropagation();
    if (!getState().isVerified) {
      openAuthModal();
      return;
    }
    if (rank === 'A') {
      handleInstantReport(mobNo, rank);
    } else {
      openReportModal(mobNo);
    }
  } else {
    const currentOpen = getState().openMobCardNo;
    setOpenMobCardNo(currentOpen === mobNo ? null : mobNo);
    sortAndRedistribute({ immediate: true });
  }
}

function handleMobCardClick(e) {
  const card = e.target.closest(".pc-list-item, .mob-card, .pc-detail-card");
  if (!card) return;

  const mobNo = parseInt(card.dataset.mobNo, 10);
  const rank = card.dataset.rank;

  const reportBtn = e.target.closest(".report-side-bar, .pc-list-report-btn");
  if (reportBtn) {
    e.stopPropagation();
    if (!getState().isVerified) {
      openAuthModal();
      return;
    }

    const mobNoFromBtn = parseInt(reportBtn.dataset.mobNo, 10) || mobNo;
    const type = reportBtn.dataset.reportType;

    if (type === "modal") {
      openReportModal(mobNoFromBtn);
    } else if (type === "instant") {
      handleInstantReport(mobNoFromBtn, rank);
    }
    return;
  }

  const closeBtn = e.target.closest('[data-action="close-card"]');
  if (closeBtn) {
    e.stopPropagation();
    setOpenMobCardNo(null);
    sortAndRedistribute({ immediate: true });
    return;
  }

  if (card.classList.contains('pc-list-item') || card.classList.contains('mob-card')) {
    const currentOpen = getState().openMobCardNo;
    setOpenMobCardNo(currentOpen === mobNo ? null : mobNo);
    sortAndRedistribute({ immediate: true });
  }
}
