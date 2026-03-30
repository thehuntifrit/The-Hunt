import { calculateRepop, getDurationDHMParts, formatDurationDHM, formatDurationColon, formatMMDDHHmm, debounce, getEorzeaTime, EORZEA_MINUTE_MS } from "./cal.js";
import { isCulled, attachLocationEvents } from "./location.js";
import { getState, recalculateMob, requestWorkerCalculation, PROGRESS_CLASSES, EXPANSION_MAP } from "./dataManager.js";
import { filterMobsByRankAndArea } from "./filterUI.js";
import { openReportModal } from "./modal.js";
import { allTabComparator } from "./mobSorter.js";
import { checkAndNotify } from "./notificationManager.js";

function updateEl(parent, selector, props = {}, dataset = {}) {
  const el = parent.querySelector(selector);
  if (!el) return;
  Object.assign(el, props);
  for (const [key, val] of Object.entries(dataset)) {
    el.dataset[key] = val;
  }
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

  if (isInConditionWindow && conditionWindowEnd) {
    label = "残り";
    secondsRemaining = (conditionWindowEnd.getTime() / 1000) - now;
    isSpecialCondition = true;
  } else if (nextConditionSpawnDate) {
    label = "次回"; secondsRemaining = (nextConditionSpawnDate.getTime() / 1000) - now; isSpecialCondition = true;
  } else if (minRepop && now < minRepop) {
    label = "次回"; secondsRemaining = minRepop - now; if (isTimedMob) isSpecialCondition = true;
  } else if (maxRepop && now < maxRepop) {
    label = "残り"; secondsRemaining = maxRepop - now; if (isTimedMob) isSpecialCondition = true;
  } else if (maxRepop) {
    label = "超過"; secondsRemaining = now - maxRepop; if (isTimedMob) isSpecialCondition = true;
    isTimeOver = true;
  }

  const dhm = secondsRemaining >= 0 ? getDurationDHMParts(secondsRemaining) : null;
  const timeValue = dhm ? formatDurationDHM(secondsRemaining) : "--/-- --:--";

  if (isMaint) label = "中止";

  return { label, timeValue, isSpecialCondition, isTimeOver, isTimedMob, dhm, isInWindow: !!isInConditionWindow };
}

function renderTimerRichHTML(label, dhm, isSpecialCondition, isTimeOver, isInWindow) {
  if (!dhm) return `<div class="timer-value">--/-- --:--</div>`;
  const { d, h, m, rawS, rawD, rawH } = dhm;
  let html = '';

  if (isInWindow) {
    const totalMinutes = Math.ceil((dhm.rawS || 0) / 60);
    html = `<span class="timer-part"><span class="timer-unit" style="font-size: 11px; margin-right: 2px;">残り</span><span class="timer-num">${totalMinutes}</span><span class="timer-unit">分</span></span>`;
  } else {
    if (rawD > 0) html += `<span class="timer-part d-part"><span class="timer-num">${d}</span><span class="timer-unit">d</span></span>`;
    if (rawH > 0 || rawD > 0) html += `<span class="timer-part h-part"><span class="timer-num">${h}</span><span class="timer-unit">h</span></span>`;
    html += `<span class="timer-part m-part"><span class="timer-num">${m}</span><span class="timer-unit">m</span></span>`;
  }

  return `<span class="timer-value ${isSpecialCondition ? 'label-next' : ''} ${isTimeOver ? 'time-over' : ''} ${isInWindow ? 'special-timer' : ''}">${html}</span>`;
}

export function getSpawnCountInfo(mob) {
  const state = getState();
  const mobLocationsData = state.mobLocations?.[mob.No];
  const spawnCullStatus = mobLocationsData || mob.spawn_cull_status;
  if (!mob.Map || !mob.spawn_points) return { countHtml: "", remainingCount: 0, spawnCullStatus };
  const validSpawnPoints = getValidSpawnPoints(mob, spawnCullStatus);
  const remainingCount = validSpawnPoints.length;
  let countHtml = "";
  if (remainingCount === 1) {
    const pointNumber = parseInt(validSpawnPoints[0]?.id?.slice(-2) || "0", 10);
    countHtml = `<span class="pc-count-val font-bold text-yellow-500">📍${pointNumber}番</span>`;
  } else if (remainingCount > 1) {
    countHtml = `<span class="pc-count-val font-bold text-slate-400">📍@ ${remainingCount}</span>`;
  }
  return { countHtml, remainingCount, spawnCullStatus, validSpawnPoints };
}

export function drawSpawnPoint(point, spawnCullStatus, mobNo, rank, isLastOne, isS_LastOne) {
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

  const pointNumber = parseInt(point.id.slice(-2), 10);
  const titleText = `${pointNumber}${isCulledFlag ? " (済)" : ""}`;

  return `
    <div class="spawn-point ${colorClass}"
        style="left:${point.x}%; top:${point.y}%;"
        data-tooltip="${escapeHtml(titleText)}"
        data-location-id="${escapeHtml(point.id)}"
        data-mob-no="${mobNo}"
        data-rank="${escapeHtml(rank)}"
        data-is-culled="${isCulledFlag}"
        data-is-lastone="${isLastOne ? "true" : "false"}"
        data-is-interactive="${dataIsInteractive}"
        tabindex="0">
    </div>
    `;
}

export function createMobCard(mob, isDetailView = false) {
  if (isDetailView) return createPCDetailCard(mob);

  const template = document.getElementById('mob-card-template');
  const clone = template.content.cloneNode(true);
  const card = clone.querySelector('.mob-card');

  const rank = mob.Rank;
  const { openMobCardNo } = getState();
  const isOpen = mob.No === openMobCardNo;

  card.dataset.mobNo = mob.No;
  card.dataset.rank = rank;

  updateEl(card, '.memo-input', { value: mob.memo_text || "" }, { mobNo: mob.No });
  updateEl(card, '.mob-name', { textContent: mob.Name }, { rank });
  updateEl(card, '.list-rank-badge', { textContent: rank }, { rank });
  updateEl(card, '.report-side-bar', {}, { reportType: rank === 'A' ? 'instant' : 'modal', mobNo: mob.No });

  const expandablePanel = card.querySelector('.expandable-panel');
  if (isOpen && expandablePanel) {
    card.classList.add('is-expanded', 'open');
    expandablePanel.classList.add('open');
  }

  if (mob.Condition) {
    updateEl(card, '.condition-text', { innerHTML: processText(mob.Condition) });
  }

  const mapImg = card.querySelector('.mob-map-img');
  const mapSection = mapImg?.closest('.map-section');
  if (mapImg && mob.Map) {
    mapImg.src = `./maps/${mob.Map}`;
    mapImg.alt = `${mob.Area} Map`;
    mapImg.dataset.mobMap = mob.Map;
  } else if (mapSection) {
    mapSection.classList.add('hidden');
  }
  updateAreaInfo(card, mob);
  updateMobCount(card, mob);
  updateMapOverlay(card, mob);
  updateExpandablePanel(card, mob);
  updateMemoIcon(card, mob);
  updateProgressBar(card, mob);
  updateProgressText(card, mob);

  return card;
}

export function createPCDetailCard(mob) {
  const template = document.getElementById('pc-detail-card-template');
  const clone = template.content.cloneNode(true);
  const card = clone.querySelector('.pc-detail-card');

  const rank = mob.Rank;
  const { elapsedPercent, nextConditionSpawnDate, minRepop, maxRepop } = mob.repopInfo || {};
  const fmt = (val) => val ? formatMMDDHHmm(val) : "--/-- --:--";

  card.dataset.mobNo = mob.No;
  card.dataset.rank = rank;

  updateEl(card, '.pc-detail-name', { textContent: mob.Name });
  const nameEl = card.querySelector('.pc-detail-name');
  if (nameEl) nameEl.style.color = `var(--rank-${rank.toLowerCase()})`;

  updateEl(card, '.pc-detail-rank', { textContent: rank }, { rank });

  const progressBar = card.querySelector('.pc-detail-progress-bar');
  if (progressBar) progressBar.style.width = `${elapsedPercent || 0}%`;

  updateEl(card, '[data-min-repop]', { textContent: fmt(minRepop) });
  updateEl(card, '[data-max-repop]', { textContent: fmt(maxRepop) });
  updateEl(card, '[data-next-possible]', { textContent: nextConditionSpawnDate ? fmt(nextConditionSpawnDate) : "--/-- --:--" });
  updateEl(card, '[data-last-kill]', { textContent: fmt(mob.last_kill_time) });

  updateEl(card, '.section-content.condition', { innerHTML: processText(mob.Condition || "\u7279\u6b8a\u306a\u51fa\u73fe\u6761\u4ef6\u306f\u3042\u308a\u307e\u305b\u3093\u3002") });
  updateEl(card, '.memo-input', { value: mob.memo_text || '' }, { mobNo: mob.No });

  const mapSection = card.querySelector('.map-section');
  if (mapSection) {
    if (mob.Map) {
      mapSection.classList.remove('hidden');
      updateMapOverlay(card, mob);
    } else {
      mapSection.classList.add('hidden');
    }
  }

  const reportSidebar = card.querySelector('.report-side-bar');
  if (reportSidebar) {
    reportSidebar.dataset.reportType = rank === 'A' ? 'instant' : 'modal';
    reportSidebar.dataset.mobNo = mob.No;
  }

  updateAreaInfo(card, mob);
  updateExpandablePanel(card, mob);

  return card;
}

export function updateProgressBar(card, mob) {
  const { elapsedPercent, status } = mob.repopInfo || {};
  const bars = card.querySelectorAll('.progress-bar-bg, .pc-detail-progress-bar');
  const texts = card.querySelectorAll('.progress-text, .pc-detail-progress-text');
  const wrappers = card.querySelectorAll('.progress-bar-wrapper, .pc-detail-progress-container');
  const isInCondition = !!mob.repopInfo.isInConditionWindow;

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
    if ((status === "PopWindow" || status === "ConditionActive") && elapsedPercent > 90 && !mob.repopInfo?.isMaintenanceStop && !mob.repopInfo?.isBlockedByMaintenance) {
      wrapper.classList.add(PROGRESS_CLASSES.BLINK_WHITE);
    } else if (status === "MaxOver" && isInCondition && !mob.repopInfo?.isMaintenanceStop && !mob.repopInfo?.isBlockedByMaintenance) {
      wrapper.classList.add(PROGRESS_CLASSES.BLINK_WHITE);
    }
  });
}

export function updateProgressText(card, mob) {
  const { elapsedPercent, status, isInConditionWindow } = mob.repopInfo || {};
  const { label, timeValue, isSpecialCondition, isTimeOver, dhm, isInWindow } = computeTimeLabel(mob);
  const isMaint = !!(mob.repopInfo?.isBlockedByMaintenance || mob.repopInfo?.isMaintenanceStop);

  let safePercent = Math.max(0, Math.min(100, Math.floor(elapsedPercent || 0)));
  const percentStr = isTimeOver ? "100%" : `${safePercent}%`;
  const rankBadge = card.querySelector('.list-rank-badge');
  const areaEl = card.querySelector('.mobile-header-area-text');

  if (rankBadge) {
    rankBadge.textContent = mob.Rank;
    rankBadge.dataset.rank = mob.Rank;
  }
  if (areaEl) {
    areaEl.textContent = ` ${mob.Area} | ${mob.Expansion}`;
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
    const timerHTML = renderTimerRichHTML(label, dhm, isSpecialCondition, isTimeOver, isInWindow);
    const newHTML = `<div class="js-mobile-time-inner">${timerHTML}<span class="detail-percent-val">(${percentStr})</span></div>`;
    if (timeEl._lastHTML !== newHTML) {
      timeEl.innerHTML = newHTML;
      timeEl._lastHTML = newHTML;
    }
    if (status === "MaxOver") timeEl.classList.add("max-over");
    else timeEl.classList.remove("max-over");
  }
  if (pcDetailEl) {
    const pcText = percentStr;
    if (pcDetailEl._lastPercent !== pcText) {
      let span = pcDetailEl._cachedSpan;
      if (!span) {
        span = pcDetailEl.querySelector('span');
        if (!span) {
          span = document.createElement('span');
          span.className = 'text-[13px] text-gray-100';
          pcDetailEl.textContent = '';
          pcDetailEl.appendChild(span);
        }
        pcDetailEl._cachedSpan = span;
      }
      span.textContent = pcText;
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
      elNext.classList.add('text-yellow-500');
      elNext.classList.remove('text-gray-400');
    } else {
      elNext.textContent = "--/-- --:--";
      elNext.classList.remove('text-yellow-500');
      elNext.classList.add('text-gray-400');
    }
  }

  if (elLast) elLast.textContent = fmt(mob.last_kill_time);

  const elMemoInput = card.querySelector("input[data-action='save-memo']");
  if (elMemoInput) {
    if (elMemoInput.dataset.mobNo !== String(mob.No)) elMemoInput.dataset.mobNo = mob.No;
    if (document.activeElement !== elMemoInput) {
      const newValue = mob.memo_text || "";
      if (elMemoInput.value !== newValue) elMemoInput.value = newValue;
    }
  }

  const elCondition = card.querySelector(".condition-text");
  if (elCondition) {
    const conditionText = mob.Condition ? processText(mob.Condition) : "特別な出現条件はありません。";
    if (elCondition.innerHTML !== conditionText) elCondition.innerHTML = conditionText;

    const isPCDetail = card.classList.contains('pc-detail-card');
    const sections = [
      elCondition.closest('.detail-section') || elCondition.closest('.pc-detail-section'),
      card.querySelector('.memo-section'),
      card.querySelector('.map-section')
    ].filter(Boolean);

    sections.forEach(section => {
      if (isPCDetail && mob.Condition) {
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
  if (shouldShowMemo) {
    let span = memoIconContainer.querySelector('span');
    if (!span) {
      span = document.createElement('span');
      span.style.fontSize = '1rem';
      span.textContent = '📝';
      memoIconContainer.appendChild(span);
    }
    if (span.getAttribute('data-tooltip') !== mob.memo_text) span.setAttribute('data-tooltip', mob.memo_text);
  } else {
    memoIconContainer.innerHTML = '';
  }
}

export function getValidSpawnPoints(mob, spawnCullStatus) {
  return (mob.spawn_points ?? []).filter(point => {
    const isS_SpawnPoint = point.mob_ranks.includes("S");
    if (!isS_SpawnPoint) return false;
    const pointStatus = spawnCullStatus?.[point.id];
    return !isCulled(pointStatus, mob.No, mob);
  });
}

export function updateMobCount(card, mob) {
  const countContainer = card.querySelector('.mob-count-container');
  if (!countContainer) return;
  const { remainingCount, validSpawnPoints } = getSpawnCountInfo(mob);
  let displayCountText = "";
  if (mob.Map && mob.spawn_points) {
    if (remainingCount === 1) {
      const pointNumber = parseInt(validSpawnPoints[0]?.id?.slice(-2) || "0", 10);
      displayCountText = `<span class="text-sm text-yellow-400 font-bold text-glow">${pointNumber}&thinsp;番</span>`;
    } else if (remainingCount > 1) {
      displayCountText = `<span class="text-sm text-gray-400 relative -top-[0.12rem]">@</span><span class="text-base text-gray-400 font-bold text-glow relative top-[0.04rem]">&thinsp;${remainingCount}</span>`;
    }
    if (displayCountText) displayCountText = `<span class="text-sm">📍</span>${displayCountText}`;
  }
  if (countContainer.dataset.cacheKey !== displayCountText) {
    countContainer.dataset.cacheKey = displayCountText;
    countContainer.innerHTML = displayCountText;
  }
}

export function updateAreaInfo(card, mob) {
  const areaName = mob.Area || "--";
  const expName = mob.Expansion || "--";
  const rank = mob.Rank || "A";

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

export function updateMapOverlay(card, mob) {
  const mapContainer = card.querySelector('.map-container');
  if (!mapContainer) return;
  const mapImg = mapContainer.querySelector('.mob-map-img');
  if (mapImg && mob.Map && mapImg.dataset.mobMap !== mob.Map) {
    mapImg.src = `./maps/${mob.Map}`;
    mapImg.alt = `${mob.Area} Map`;
    mapImg.dataset.mobMap = mob.Map;
    mapContainer.classList.remove('hidden');
    delete mapContainer.dataset.locationLoading;
  }
  if (mapContainer.classList.contains('hidden')) return;
  const mapOverlay = mapContainer.querySelector('.map-overlay');
  if (!mapOverlay) return;
  let spawnPointsHtml = "";
  if (mob.Map && mob.spawn_points) {
    const { spawnCullStatus, validSpawnPoints } = getSpawnCountInfo(mob);
    const isOneLeft = (validSpawnPoints?.length || 0) === 1;
    spawnPointsHtml = (mob.spawn_points ?? []).map(point => {
      const isThisPointTheLastOne = isOneLeft && point.id === validSpawnPoints[0]?.id;
      return drawSpawnPoint(point, spawnCullStatus, mob.No, point.mob_ranks.includes("B2") ? "B2" : point.mob_ranks.includes("B1") ? "B1" : point.mob_ranks[0], isThisPointTheLastOne, isOneLeft);
    }).join("");
  }
  if (mapOverlay.innerHTML !== spawnPointsHtml) mapOverlay.innerHTML = spawnPointsHtml;
}

export function createSimpleMobItem(mob) {
  const item = document.createElement('div');
  item.className = `pc-list-item rank-${mob.Rank.toLowerCase()}`;
  item.dataset.mobNo = mob.No;
  item.dataset.rank = mob.Rank;
  item.innerHTML = `
        <div class="pc-list-name font-bold flex items-center min-w-0">
          <span class="truncate"></span>
          <span class="memo-icon-container flex-shrink-0 text-[12px] h-4 flex items-center"></span>
          <span class="pc-list-count-inner flex-shrink-0"></span>
        </div>
        <div class="pc-list-time"></div>
        <div class="pc-list-progress-container"><div class="pc-list-progress-bar" style="width: 0%"></div></div>
        <div class="pc-list-percent">0%</div>
        <button class="pc-list-report-btn">REPORT</button>`;
  const nameEl = item.querySelector('.pc-list-name span:first-child');
  if (nameEl) nameEl.textContent = mob.Name;
  updateSimpleMobItem(item, mob);
  return item;
}

export function updateSimpleMobItem(item, mob) {
  const { elapsedPercent, status, isInConditionWindow } = mob.repopInfo || {};
  const isMaint = !!(mob.repopInfo?.isBlockedByMaintenance || mob.repopInfo?.isMaintenanceStop);
  const timeEl = item.querySelector('.pc-list-time');
  const progressEl = item.querySelector('.pc-list-progress-bar');
  const percentEl = item.querySelector('.pc-list-percent');
  const { countHtml } = getSpawnCountInfo(mob);
  const { label, timeValue, isSpecialCondition, isTimeOver, dhm, isInWindow } = computeTimeLabel(mob);

  if (timeEl) {
    const timerHTML = renderTimerRichHTML(label, dhm, isSpecialCondition, isTimeOver, isInWindow);
    timeEl.innerHTML = `<div class="grid items-center w-full h-full" style="grid-template-columns:auto 1fr;gap:8px;"><span class="timer-label timer-label-base ${status ? 'status-' + status.toLowerCase() : ''} ${isSpecialCondition ? 'is-special' : ''} text-[11px] text-center opacity-90">${label}</span>${timerHTML}</div>`;
  }
  const countInner = item.querySelector('.pc-list-count-inner');
  if (countInner) {
    countInner.innerHTML = countHtml;
  }
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
    let safePercent = Math.max(0, Math.min(100, Math.floor(elapsedPercent || 0)));
    percentEl.textContent = isTimeOver ? "100%" : `${safePercent}%`;
  }
  if (isMaint) item.classList.add("maintenance-gray-out");
  else item.classList.remove("maintenance-gray-out");

  if (!isMaint && (status === "ConditionActive" || (status === "MaxOver" && isInConditionWindow))) item.classList.add("blink-active");
  else item.classList.remove("blink-active");
  updateMemoIcon(item, mob);
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
  MAX_OVER: "🔚 Time Over",
  WINDOW: "⏳ Pop Window",
  NEXT: "🔜 Respawning",
  MAINTENANCE: "🛠️ Maintenance"
};

function getOrCreateGroupSection(groupKey) {
  if (groupSectionCache.has(groupKey)) return groupSectionCache.get(groupKey);

  const section = document.createElement("section");
  section.className = "status-group w-full hidden";
  section.innerHTML = `
      <div class="status-group-separator">
          <span class="status-group-label">${GROUP_LABELS[groupKey]}</span>
      </div>
      <div class="group-columns grid grid-cols-1 lg:grid-cols-3 gap-0.5 lg:gap-4">
          <div class="col-1 flex flex-col gap-0.5 lg:gap-4"></div>
          <div class="col-2 flex flex-col gap-0.5 lg:gap-4"></div>
          <div class="col-3 flex flex-col gap-0.5 lg:gap-4"></div>
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

setInterval(updateHeaderTime, EORZEA_MINUTE_MS);

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
  const { openMobCardNo } = getState();
  const isOpen = mob.No === openMobCardNo;
  const expandablePanel = card.querySelector('.expandable-panel');
  const isMobile = window.innerWidth < 1024;

  if (isOpen && expandablePanel) {
    card.classList.add('is-expanded');
    card.classList.add('open');
    if (!expandablePanel.classList.contains('open')) {
      if (isMobile) {
        expandablePanel.classList.add('open');
      } else {
        expandablePanel.classList.add('is-animating');
        expandablePanel.classList.add('open');
        expandablePanel.style.maxHeight = expandablePanel.scrollHeight + 'px';
        const onEnd = () => {
          expandablePanel.style.maxHeight = 'none';
          expandablePanel.classList.remove('is-animating');
          expandablePanel.removeEventListener('transitionend', onEnd);
        };
        expandablePanel.addEventListener('transitionend', onEnd, { once: true });
      }
    }
  } else if (expandablePanel) {
    if (expandablePanel.classList.contains('open')) {
      if (isMobile || expandablePanel.style.maxHeight === 'none' || expandablePanel.style.maxHeight === '') {
        expandablePanel.style.maxHeight = '';
        expandablePanel.classList.remove('open', 'is-animating');
      } else {
        expandablePanel.style.maxHeight = expandablePanel.scrollHeight + 'px';
        requestAnimationFrame(() => {
          expandablePanel.style.maxHeight = '0px';
          expandablePanel.classList.add('is-animating');
          const onEnd = () => {
            expandablePanel.classList.remove('open', 'is-animating');
            expandablePanel.style.maxHeight = '';
            expandablePanel.removeEventListener('transitionend', onEnd);
          };
          expandablePanel.addEventListener('transitionend', onEnd, { once: true });
        });
      }
    }
    card.classList.remove('is-expanded');
    card.classList.remove('open');
  }

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
  updateDetailCardRealtime(mobMap);
}

function updateDetailCardRealtime(mobMap) {
  const rightPane = DOM.pcRightDetail || document.getElementById("pc-right-detail");
  if (rightPane && rightPane.dataset.renderedMobNo && rightPane.dataset.renderedMobNo !== "none") {
    const detailCard = rightPane.firstElementChild;
    const mob = mobMap.get(rightPane.dataset.renderedMobNo);
    if (detailCard && mob) updateCardFull(detailCard, mob);
  }
}

const cardCache = new Map();

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
  const lg = 1024;
  const isPC = width >= lg;

  const pcLayout = DOM.pcLayout || document.getElementById("pc-layout");
  const mobileLayout = DOM.mobileLayout || document.getElementById("mobile-layout");

  if (isPC) {
    if (pcLayout) {
      pcLayout.classList.remove("hidden");
      pcLayout.style.display = "flex";
    }
    if (mobileLayout) mobileLayout.classList.add("hidden");
  } else {
    if (pcLayout) {
      pcLayout.classList.add("hidden");
      pcLayout.style.display = "none";
    }
    if (mobileLayout) mobileLayout.classList.remove("hidden");
  }

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

      if (isInitialLoad || visibleCards.has(String(mob.No))) {
        updateCardFull(card, mob);
      }
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

  const rightPane = DOM.pcRightDetail || document.getElementById("pc-right-detail");
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

  if (_isSafari && !_safariHackApplied && DOM.pcLeftList) {
    const headers = DOM.pcLeftList.querySelectorAll(".text-xs");
    headers.forEach(header => {
      header.style.transform = "translateZ(0)";
    });
    _safariHackApplied = true;
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
const _isSafari = navigator.userAgent.includes("Safari") && !navigator.userAgent.includes("Chrome");
let _safariHackApplied = false;

function updateProgressBars() {
  const state = getState();
  const nowSec = Date.now() / 1000;
  const mobMap = getMobMap();
  const filtered = getFilteredMobs();


  filtered.forEach(mob => {
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

  const rightPane = DOM.pcRightDetail || document.getElementById("pc-right-detail");
  if (rightPane && rightPane.dataset.renderedMobNo && rightPane.dataset.renderedMobNo !== "none") {
    const detailCard = rightPane.firstElementChild;
    const mob = mobMap.get(rightPane.dataset.renderedMobNo);
    if (detailCard && mob) {
      updateProgressText(detailCard, mob);
      updateProgressBar(detailCard, mob);
      updateExpandablePanel(detailCard, mob);
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

  const rankBtn = document.querySelector('.mobile-footer-btn[data-panel="rank"]');
  if (rankBtn) rankBtn.classList.remove("has-alert");
}

setInterval(() => {
  updateProgressBars();
}, EORZEA_MINUTE_MS);
