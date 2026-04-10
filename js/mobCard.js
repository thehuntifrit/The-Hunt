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
  if (window.tooltipInitialized) return;
  window.tooltipInitialized = true;

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
    fallback.className = 'mobcard-timer';
    fallback.textContent = "--/-- --:--";
    return fallback;
  }

  if (isInWindow) {
    const totalMinutes = Math.ceil((dhm.rawS || 0) / 60);
    const span = document.createElement('span');
    span.className = 'mobcard-timer special-timer';
    span.innerHTML = `<span class="mobcard-timer-part"><span class="mobcard-timer-num">${totalMinutes}</span><span class="mobcard-timer-unit">分</span></span>`;
    return span;
  }

  const el = cloneTemplate('timer-rich-template');
  if (!el) return document.createElement('span');

  if (isSpecialCondition) el.classList.add('label-next');
  if (isTimeOver) el.classList.add('time-over');

  const { d, h, m } = dhm;

  const format = (elPart, num, unit) => {
    const numEl = elPart.querySelector('.mobcard-timer-num');
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
  if (isDetailView) return renderMobCard(mob);
  return createSimpleMobItem(mob);
}

export function renderMobCard(mob) {
  const template = document.getElementById('mobcard-card-template');
  const clone = template.content.cloneNode(true);
  const card = clone.querySelector('.mobcard-card');

  const rank = mob.rank;
  const { nextConditionSpawnDate, minRepop, maxRepop } = mob.repopInfo || {};
  const fmt = (val) => val ? formatMMDDHHmm(val) : "--/-- --:--";

  card.dataset.mobNo = mob.No;
  card.dataset.rank = rank;

  updateEl(card, '.mobcard-name', { textContent: mob.name });
  const nameEl = card.querySelector('.mobcard-name');
  if (nameEl) nameEl.dataset.rank = rank;

  updateEl(card, '.mobcard-rank', { textContent: rank }, { rank });

  updateEl(card, '[data-min-repop]', { textContent: fmt(minRepop) });
  updateEl(card, '[data-max-repop]', { textContent: fmt(maxRepop) });
  updateEl(card, '[data-next-possible]', { textContent: nextConditionSpawnDate ? fmt(nextConditionSpawnDate) : "--/-- --:--" });
  updateEl(card, '[data-last-kill]', { textContent: fmt(mob.last_kill_time) });

  updateEl(card, '.section-content.condition', { innerHTML: processText(mob.condition || "特別な出現条件はありません。") });

  const memoEl = card.querySelector('.mobcard-memo-input');
  if (memoEl) {
    memoEl.value = mob.memo_text || '';
    memoEl.dataset.mobNo = mob.No;
    setTimeout(() => adjustMemoHeight(memoEl), 0);
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

  const reportBtn = card.querySelector('.moblist-report-btn');
  if (reportBtn) {
    reportBtn.dataset.reportType = rank === 'A' ? 'instant' : 'modal';
    reportBtn.dataset.mobNo = mob.No;
  }

  updateAreaInfo(card, mob);
  updateDetailCardRealtime(card, mob);

  return card;
}

export function createSimpleMobItem(mob) {
  const item = cloneTemplate('moblist-item-template');
  if (!item) return document.createElement('div');

  item.classList.add(`rank-${mob.rank.toLowerCase()}`);
  item.dataset.mobNo = String(mob.No);
  item.dataset.rank = mob.rank;

  const reportBtn = item.querySelector('.moblist-report-btn');
  if (reportBtn) {
    reportBtn.dataset.mobNo = String(mob.No);
    reportBtn.dataset.rank = mob.rank;
  }

  const nameEl = item.querySelector('.moblist-name');
  if (nameEl) {
    nameEl.textContent = mob.name;
    nameEl.dataset.rank = mob.rank;
  }

  updateSimpleMobItem(item, mob);
  return item;
}

// ─── リアルタイム更新用 ─────────────────────────
export function updateDetailCardRealtime(card, mob) {
  updateProgressBar(card, mob);
  updateProgressText(card, mob);
  updateExpandablePanel(card, mob);
  updateMobCount(card, mob);
}

export function updateProgressBar(element, mob) {
  const { elapsedPercent, status } = mob.repopInfo || {};
  const bar = element.querySelector('.mobcard-progress-bar, .moblist-bg-bar');
  const wrapper = element.querySelector('.mobcard-progress-container, .moblist-bg-gauge');
  if (!bar) return;

  const currentWidth = parseFloat(bar.style.width) || 0;
  if (Math.abs(elapsedPercent - currentWidth) > 0.1) {
    bar.style.transition = (currentWidth === 0 || elapsedPercent < currentWidth) ? "none" : "width 10s linear";
    bar.style.width = `${elapsedPercent || 0}%`;
  }

  bar.classList.remove('status-max-over', 'status-condition-active', 'status-pop-window', 'status-next');
  if (status === "MaxOver") bar.classList.add("status-max-over");
  else if (status === "ConditionActive") bar.classList.add("status-condition-active");
  else if (status === "PopWindow") bar.classList.add("status-pop-window");
  else if (status === "Next" || status === "NextCondition") bar.classList.add("status-next");

  if (wrapper) {
    const isInCondition = !!mob.repopInfo.isInConditionWindow && !mob.repopInfo.isMaintenanceStop && !mob.repopInfo.isBlockedByMaintenance;
    wrapper.classList.toggle(PROGRESS_CLASSES.BLINK_WHITE, isInCondition);
    element.classList.toggle('blink-border-white', isInCondition);
  }
}

export function updateProgressText(element, mob) {
  const { status, isInConditionWindow } = mob.repopInfo || {};
  const { label, dhm, isSpecialCondition, isTimeOver, isInWindow } = computeTimeLabel(mob);
  const isMaint = !!(mob.repopInfo?.isBlockedByMaintenance || mob.repopInfo?.isMaintenanceStop);

  const timeContainer = element.querySelector('.mobcard-progress-text, .moblist-time');
  const percentEl = element.querySelector('.percent, .moblist-percent');

  if (timeContainer) {
    const timerNode = renderTimerRichHTML(label, dhm, isSpecialCondition, isTimeOver, isInWindow);
    const cacheKey = `timer-${label}-${isSpecialCondition}-${isTimeOver}-${isInWindow}-${dhm?.rawS || 0}`;

    if (timeContainer._lastCacheKey !== cacheKey) {
      timeContainer.innerHTML = "";
      if (element.classList.contains('moblist-item')) {
        // リスト用レイアウト: [Timer] [Label]
        const inner = document.createElement("div");
        inner.className = "timer-inner-grid";
        const labelSpan = document.createElement("span");
        labelSpan.className = `timer-label timer-label-base ${status ? 'status-' + status.toLowerCase() : ''} ${isSpecialCondition ? 'is-special' : ''}`;
        labelSpan.textContent = label;
        inner.appendChild(timerNode);
        inner.appendChild(labelSpan);
        timeContainer.appendChild(inner);
      } else {
        // カード用レイアウト: [Timer]
        timeContainer.appendChild(timerNode);
      }
      timeContainer._lastCacheKey = cacheKey;
    }
  }

  if (percentEl) {
    const { elapsedPercent } = mob.repopInfo || {};
    const percentValue = status === "MaxOver" ? "100" : String(Math.max(0, Math.min(100, Math.floor(elapsedPercent || 0))));
    percentEl.innerHTML = `${percentValue}<span class="percent-unit">%</span>`;
    percentEl.classList.toggle("max-over", status === "MaxOver");
  }

  element.classList.toggle("is-pre-repop", status === "Next" || status === "Maintenance");
  element.classList.toggle("maintenance-gray-out", isMaint);
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

  const elMemoInput = card.querySelector(".mobcard-memo-input");
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

    const isPCDetail = card.classList.contains('mobcard-card');
    const sections = [
      elCondition.closest('.mobcard-section') || elCondition.closest('.mobcard-section'),
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
  const countContainer = card.querySelector('.mob-count-container, .moblist-count');
  if (!countContainer) return;
  const { countHtml } = getSpawnCountInfo(mob);
  if (countContainer.innerHTML !== countHtml) {
    countContainer.innerHTML = countHtml;
  }
}

export function updateAreaInfo(card, mob) {
  const areaName = mob.area || "--";
  const expName = mob.Expansion || "--";
  const rank = mob.rank || "A";

  card.querySelectorAll('.mob-rank-badge, .mobcard-rank').forEach(badge => {
    badge.textContent = rank;
    badge.dataset.rank = rank;
  });

  card.querySelectorAll('.detail-area').forEach(el => el.textContent = areaName);
  card.querySelectorAll('.detail-expansion').forEach(el => el.textContent = `| ${expName}`);
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
  updateProgressBar(item, mob);
  updateProgressText(item, mob);
  const countInner = item.querySelector('.moblist-count');
  if (countInner) {
    const { countHtml } = getSpawnCountInfo(mob);
    countInner.innerHTML = countHtml;
  }
  updateMemoIcon(item, mob);
}

// ─── イベント ───────────────────────────────────────────
export function attachMobCardEvents() {
  const containers = [
    document.getElementById("moblist-container"),
    document.getElementById("mobcard-detail"),
    document.getElementById("mobcard-overlay")
  ].filter(Boolean);

  containers.forEach(c => c.addEventListener("click", handleGeneralClick));

  const overlayBackdrop = document.getElementById("mobcard-overlay-backdrop");
  if (overlayBackdrop) {
    overlayBackdrop.addEventListener("click", (e) => {
      if (e.target === overlayBackdrop) {
        setOpenMobCardNo(null);
        sortAndRedistribute({ immediate: true });
      }
    });
  }
}

function handleGeneralClick(e) {
  const target = e.target;
  const item = target.closest(".moblist-item, .mobcard-card");
  if (!item) return;

  const mobNo = parseInt(item.dataset.mobNo, 10);
  const mob = getState().mobs.find(m => m.No === mobNo);
  if (!mob) return;

  const reportBtn = target.closest(".moblist-report-btn");
  if (reportBtn) {
    e.preventDefault();
    e.stopPropagation();
    if (!getState().isVerified) {
      openAuthModal();
      return;
    }
    const type = reportBtn.dataset.reportType || (mob.rank === 'A' ? 'instant' : 'modal');
    if (type === "modal") openReportModal(mobNo);
    else handleInstantReport(mobNo, mob.rank);
    return;
  }

  if (target.closest('[data-action="close-card"]')) {
    e.stopPropagation();
    setOpenMobCardNo(null);
    sortAndRedistribute({ immediate: true });
    return;
  }

  if (target.closest(".moblist-item") || target.classList.contains('mobcard-card')) {
    const currentOpen = getState().openMobCardNo;
    setOpenMobCardNo(currentOpen === mobNo ? null : mobNo);
    sortAndRedistribute({ immediate: true });
  }
}
