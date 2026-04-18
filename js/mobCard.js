import { getDurationDHMParts, formatDurationDHM, formatMMDDHHmm } from "./cal.js";
import { getState, setOpenMobCardNo, isCulled, getStatusLabel } from "./dataManager.js";
import { toggleCrushStatus } from "./server.js";
import { openAuthModal, openReportModal } from "./modal.js";

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
  return escapeHtml(text).replace(/\/\//g, "<br>");
}

export function renderNameWithInstance(container, name) {
  if (!container) return;
  const match = name.match(/^([1-9])(.+)/);
  container.innerHTML = "";
  if (match) {
    const instance = match[1];
    const realName = match[2];
    const badge = document.createElement("span");
    badge.className = "instance-badge";
    badge.textContent = instance;
    container.appendChild(badge);
    container.appendChild(document.createTextNode(realName));
  } else {
    container.textContent = name;
  }
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
  let activeMapContainerRect = null;
  let magnifierRect = null;
  const ZOOM_SCALE = 2.0;

  const closeMagnifier = () => {
    magnifier.classList.add('hidden');
    document.body.classList.remove('magnifier-active');
    activeMapImg = null;
    activeMapContainer = null;
    activeMapContainerRect = null;
    wrapper.innerHTML = '';
    window.removeEventListener('mousemove', onMagnifierMouseMove);
  };

  const updateMagnifier = (e) => {
    if (!activeMapImg || !activeMapContainer || !activeMapContainerRect) return;

    const x = e.clientX - activeMapContainerRect.left;
    const y = e.clientY - activeMapContainerRect.top;

    if (x < 0 || y < 0 || x > activeMapContainerRect.width || y > activeMapContainerRect.height) {
      closeMagnifier();
      return;
    }

    magnifier.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;

    if (!magnifierRect) {
      magnifierRect = magnifier.getBoundingClientRect();
    }
    const centerX = magnifierRect.width / 2;
    const centerY = magnifierRect.height / 2;

    const translateX = centerX - (x * ZOOM_SCALE);
    const translateY = centerY - (y * ZOOM_SCALE);

    wrapper.style.transform = `translate(${translateX}px, ${translateY}px) scale(${ZOOM_SCALE})`;
  };

  let magnifierRafId = null;
  const onMagnifierMouseMove = (e) => {
    if (magnifierRafId) cancelAnimationFrame(magnifierRafId);
    const x = e.clientX;
    const y = e.clientY;
    magnifierRafId = requestAnimationFrame(() => {
      updateMagnifier({ clientX: x, clientY: y });
    });
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
    activeMapContainerRect = activeMapContainer.getBoundingClientRect();

    wrapper.innerHTML = '';
    const clone = mapContainer.cloneNode(true);

    clone.classList.remove('w-full', 'u-w-full', 'pc-map-box', 'cursor-crosshair', '!cursor-crosshair');
    clone.classList.add('magnifier-clone');

    clone.style.width = `${mapContainer.offsetWidth}px`;
    clone.style.height = `${mapContainer.offsetHeight}px`;

    wrapper.appendChild(clone);
    magnifier.classList.remove('hidden');
    document.body.classList.add('magnifier-active');

    magnifierRect = magnifier.getBoundingClientRect();

    window.addEventListener('mousemove', onMagnifierMouseMove);
    updateMagnifier(e);
  }, { capture: true });

  window.addEventListener('mouseup', (e) => {
    if (e.button === 2 && activeMapImg) {
      closeMagnifier();
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
  const info = mob.repopInfo || {};
  const now = Date.now() / 1000;
  
  if (!info.status) {
    return { label: "", timeValue: "--/-- --:--", isSpecialCondition: false, isTimeOver: false, isTimedMob: false, dhm: null };
  }

  const isMaint = !!(info.status === "Maintenance" || info.isMaintenanceStop || info.isBlockedByMaintenance);
  const isTimeOverRaw = (info.status === "MaxOver");
  const isInWindow = !!info.isInConditionWindow;
  const isNextWindow = !isInWindow && !!info.nextConditionSpawnDate && (now < info.nextConditionSpawnDate.getTime() / 1000);
  const isTimedMob = !!(info.isInConditionWindow || info.nextConditionSpawnDate);
  const isSpecialCondition = isTimedMob && (mob.rank === 'S') && (info.status !== "PopWindow");

  let labelStatus = info.status;
  if (isInWindow && (info.status === "MaxOver" || info.status === "PopWindow")) {
    labelStatus = "ConditionActive";
  } else if (isNextWindow && (info.status === "MaxOver" || info.status === "PopWindow")) {
    labelStatus = "NextCondition";
  }

  const label = getStatusLabel(labelStatus, mob.rank);

  let targetSec = info.nextBoundarySec || info.maxRepop || 0;

  const showAsOverdue = isTimeOverRaw && !isInWindow && !isNextWindow;

  if (showAsOverdue) {
    targetSec = info.maxRepop;
  }

  const secondsRemaining = Math.max(0, showAsOverdue ? (now - targetSec) : (targetSec - now));
  const dhm = getDurationDHMParts(secondsRemaining);
  const timeValue = formatDurationDHM(secondsRemaining);

  return { label, timeValue, isSpecialCondition, isTimeOver: showAsOverdue, isTimedMob, dhm, isInWindow };
}

function renderTimerRichHTML(label, dhm, isSpecialCondition, isTimeOver, isInWindow) {
  if (!dhm) {
    const fallback = document.createElement('div');
    fallback.className = 'mobcard-timer';
    fallback.textContent = "--/-- --:--";
    return fallback;
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
    countHtml = `<span class="pc-count-val text-cyan font-bold">📍${pointNumber}<span class="u-ml-1">番</span></span>`;
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

  const nameEl = card.querySelector('.mobcard-name');
  if (nameEl) {
    renderNameWithInstance(nameEl, mob.name);
    nameEl.dataset.rank = rank;
  }

  updateEl(card, '.mobcard-rank', { textContent: rank }, { rank });

  updateEl(card, '[data-min-repop]', { textContent: fmt(minRepop) });
  updateEl(card, '[data-max-repop]', { textContent: fmt(maxRepop) });
  updateEl(card, '[data-next-possible]', { textContent: nextConditionSpawnDate ? fmt(nextConditionSpawnDate) : "--/-- --:--" });
  updateEl(card, '[data-last-kill]', { textContent: fmt(mob.last_kill_time) });

  updateEl(card, '.condition-text', { innerHTML: processText(mob.condition || "特別な出現条件はありません。") });

  const memoEl = card.querySelector('.mobcard-memo-input');
  if (memoEl) {
    memoEl.value = mob.memo_text || '';
    memoEl.dataset.mobNo = mob.No;
    setTimeout(() => adjustMemoHeight(memoEl), 0);
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
    renderNameWithInstance(nameEl, mob.name);
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

  const lastPct = parseFloat(bar.dataset.lastPct) || 0;
  if (Math.abs(elapsedPercent - lastPct) > 0.05) {
    const isDetail = element.classList.contains('mobcard-card');
    if (!isDetail) {
      bar.style.transition = "none";
    } else {
      bar.style.transition = (lastPct === 0 || elapsedPercent < lastPct) ? "none" : "transform 0.4s ease-out";
    }
    bar.style.transform = `scaleX(${(elapsedPercent || 0) / 100})`;
    bar.dataset.lastPct = elapsedPercent;
  }

  if (bar.dataset.lastStatus !== status) {
    bar.classList.remove('status-max-over', 'status-condition-active', 'status-pop-window', 'status-next');
    if (status === "MaxOver") bar.classList.add("status-max-over");
    else if (status === "ConditionActive") bar.classList.add("status-condition-active");
    else if (status === "PopWindow") bar.classList.add("status-pop-window");
    else if (status === "Next" || status === "NextCondition") bar.classList.add("status-next");
    bar.dataset.lastStatus = status;
  }

  if (wrapper) {
    const isInCondition = !!mob.repopInfo.isInConditionWindow && !mob.repopInfo.isMaintenanceStop && !mob.repopInfo.isBlockedByMaintenance;
    const currentBlink = element.classList.contains('moblist-highlight-white');
    if (element.classList.contains('moblist-item') && currentBlink !== isInCondition) {
      element.classList.toggle('moblist-highlight-white', isInCondition);
    }
  }
}

export function updateProgressText(element, mob) {
  const { status, isInConditionWindow } = mob.repopInfo || {};
  const { label, dhm, isSpecialCondition, isTimeOver, isInWindow } = computeTimeLabel(mob);
  const isMaint = !!(mob.repopInfo?.isBlockedByMaintenance || mob.repopInfo?.isMaintenanceStop);

  const timeContainer = element.querySelector('.moblist-time');
  const percentEl = element.querySelector('.percent, .moblist-percent');

  if (timeContainer && element.classList.contains('moblist-item')) {
    const { d, h, m, rawS } = dhm || {};
    const displayValue = isInWindow ? Math.ceil((rawS || 0) / 60) : `${d || 0}-${h || 0}-${m || 0}`;
    const cacheKey = `timer-${label}-${isSpecialCondition}-${isTimeOver}-${isInWindow}-${displayValue}`;

    if (timeContainer._lastCacheKey !== cacheKey) {
      const timerNode = renderTimerRichHTML(label, dhm, isSpecialCondition, isTimeOver, isInWindow);
      timeContainer.innerHTML = "";
      const inner = document.createElement("div");
      inner.className = "timer-inner-grid";
      const labelSpan = document.createElement("span");
      labelSpan.className = `timer-label timer-label-base ${status ? 'status-' + status.toLowerCase() : ''} ${isSpecialCondition ? 'is-special' : ''}`;
      labelSpan.textContent = label;
      inner.appendChild(timerNode);
      inner.appendChild(labelSpan);
      timeContainer.appendChild(inner);
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

function getEl(parent, selector, key) {
  if (!parent._cache) parent._cache = {};
  if (parent._cache[key]) return parent._cache[key];
  const el = parent.querySelector(selector);
  if (el) parent._cache[key] = el;
  return el;
}

export function updateExpandablePanel(card, mob) {
  const { minRepop, maxRepop } = mob.repopInfo || {};

  const elMin = getEl(card, "[data-min-repop]", "minRepop");
  const elMax = getEl(card, "[data-max-repop]", "maxRepop");
  const elNext = getEl(card, "[data-next-possible]", "nextPossible");
  const elLast = getEl(card, "[data-last-kill]", "lastKill");

  const fmt = (val) => val ? formatMMDDHHmm(val) : "--/-- --:--";

  if (elMin) elMin.textContent = fmt(minRepop);
  if (elMax) elMax.textContent = fmt(maxRepop);

  if (elNext) {
    if (mob.repopInfo?.nextConditionSpawnDate) {
      const val = formatMMDDHHmm(mob.repopInfo.nextConditionSpawnDate);
      if (elNext.textContent !== val) elNext.textContent = val;
      elNext.classList.add('text-yellow');
      elNext.classList.remove('text-secondary');
    } else {
      if (elNext.textContent !== "--/-- --:--") elNext.textContent = "--/-- --:--";
      elNext.classList.remove('text-yellow');
      elNext.classList.add('text-secondary');
    }
  }

  if (elLast) {
    const val = fmt(mob.last_kill_time);
    if (elLast.textContent !== val) elLast.textContent = val;
  }

  const elMemoInput = getEl(card, ".mobcard-memo-input", "memoInput");
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

  const elCondition = getEl(card, ".condition-text", "conditionText");
  if (elCondition) {
    const conditionText = mob.condition ? processText(mob.condition) : "特別な出現条件はありません。";
    if (elCondition.innerHTML !== conditionText) elCondition.innerHTML = conditionText;

    const isPCDetail = card.classList.contains('mobcard-card');
    const sections = [
      elCondition.closest('.mobcard-section'),
      getEl(card, '.memo-section', 'memoSection'),
      getEl(card, '.map-section', 'mapSection')
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
  const memoIconContainer = getEl(card, '.memo-icon-container', 'memoIconContainer');
  if (!memoIconContainer) return;
  const shouldShowMemo = shouldDisplayMemo(mob);

  if (memoIconContainer._lastShow === shouldShowMemo) return;
  memoIconContainer._lastShow = shouldShowMemo;

  memoIconContainer.innerHTML = '';
  if (shouldShowMemo) {
    memoIconContainer.classList.remove('hidden');
    const span = document.createElement('span');
    span.classList.add('memo-icon');
    span.textContent = '📝';
    memoIconContainer.appendChild(span);
  } else {
    memoIconContainer.classList.add('hidden');
  }
}

export function updateMobCount(card, mob) {
  const countContainer = getEl(card, '.moblist-count', 'mobCount');
  if (!countContainer) return;
  const { countHtml } = getSpawnCountInfo(mob);
  if (countContainer.innerHTML !== countHtml) {
    countContainer.innerHTML = countHtml;
    countContainer._lastHtml = countHtml;
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
  el.style.height = el.scrollHeight + 'px';
}

export function updateMapOverlay(card, mob) {
  const isDetail = card.classList.contains('mobcard-card');
  const mapContainer = card.querySelector('.map-container');
  if (!mapContainer) return;

  if (mob.rank === 'F') {
    mapContainer.classList.add('hidden');
    const mapSection = mapContainer.closest('.map-section');
    if (mapSection) mapSection.classList.add('hidden');
    return;
  }

  const mapImg = mapContainer.querySelector('.mob-map-img');
  const mapOverlay = mapContainer.querySelector('.map-overlay');
  if (!mapOverlay) return;

  if (!isDetail) {
    if (mapOverlay.innerHTML !== "") {
      mapOverlay.innerHTML = "";
      delete mapOverlay._lastPointsHash;
    }
    return;
  }

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
  updateMobCount(item, mob);
  updateMemoIcon(item, mob);
}