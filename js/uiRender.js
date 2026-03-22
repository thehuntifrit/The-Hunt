import { calculateRepop, formatDurationHM, formatDurationColon, formatDurationM, formatLastKillTime, formatMMDDHHmm, debounce, getEorzeaTime, EORZEA_MINUTE_MS } from "./cal.js";
import { isCulled, attachLocationEvents } from "./location.js";
import { getState, recalculateMob, requestWorkerCalculation, PROGRESS_CLASSES, EXPANSION_MAP } from "./dataManager.js";
import { filterMobsByRankAndArea } from "./filterUI.js";
import { openReportModal } from "./modal.js";
import { allTabComparator } from "./mobSorter.js";
import { updateStatusContainerVisibility } from "./app.js";
import { checkAndNotify } from "./notificationManager.js";

const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Tokyo"
});

export function processText(text) {
  if (typeof text !== "string" || !text) return "";
  return text.replace(/\/\//g, "<br>");
}

export function shouldDisplayMemo(mob) {
  const hasMemo = mob.memo_text?.trim();
  const isMemoNewer = (mob.memo_updated_at || 0) >= (mob.last_kill_time || 0);
  return hasMemo && (isMemoNewer || !mob.last_kill_time);
}

export function computeTimeLabel(mob) {
  const { minRepop, maxRepop, status, isInConditionWindow, conditionWindowEnd, nextConditionSpawnDate, isMaintenanceStop, isBlockedByMaintenance, maintStart, maintEnd } = mob.repopInfo || {};
  const now = Date.now() / 1000;
  const isMaint = !!(isMaintenanceStop || isBlockedByMaintenance);
  const isTimedMob = !!(isInConditionWindow || nextConditionSpawnDate);

  if (!minRepop && !maxRepop && !isTimedMob) {
    return { label: "", timeValue: "--/-- --:--", isSpecialCondition: false, isTimeOver: false, isTimedMob: false };
  }

  let label = "", timeValue = "", isSpecialCondition = isTimedMob, isTimeOver = status === "MaxOver";

  if (isInConditionWindow && conditionWindowEnd) {
    label = "⏳"; timeValue = formatDurationM((conditionWindowEnd.getTime() / 1000) - now); isSpecialCondition = true;
  } else if (nextConditionSpawnDate && now >= (minRepop || 0)) {
    label = "🔜"; timeValue = formatDurationColon((nextConditionSpawnDate.getTime() / 1000) - now); isSpecialCondition = true;
  } else if (minRepop && now < minRepop) {
    label = "🔜"; timeValue = formatDurationColon(minRepop - now); if (isTimedMob) isSpecialCondition = true;
  } else if (maxRepop && now < maxRepop) {
    label = "⏳";
    if (isTimedMob) { timeValue = formatDurationM(maxRepop - now); isSpecialCondition = true; }
    else { timeValue = formatDurationColon(maxRepop - now); }
  } else if (maxRepop) {
    label = "🚨";
    if (isTimedMob) { timeValue = formatDurationM(now - maxRepop); isSpecialCondition = true; }
    else { timeValue = formatDurationColon(now - maxRepop); }
    isTimeOver = true;
  } else {
    label = ""; timeValue = "--/-- --:--"; isSpecialCondition = false; isTimedMob = false;
  }

  if (isMaint) {
    label = "🛠️";
  }

  return { label, timeValue, isSpecialCondition, isTimeOver, isTimedMob };
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
    countHtml = `<span class="pc-count-val font-bold text-yellow-500">${pointNumber}番</span>`;
  } else if (remainingCount > 1) {
    countHtml = `<span class="pc-count-val font-bold text-slate-400">@ ${remainingCount}</span>`;
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
        data-tooltip="${titleText}"
        data-location-id="${point.id}"
        data-mob-no="${mobNo}"
        data-rank="${rank}"
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

  const memoInput = card.querySelector('.memo-input');
  if (memoInput) {
    memoInput.dataset.mobNo = mob.No;
    memoInput.value = mob.memo_text || "";
  }

  const mobNameEl = card.querySelector('.mob-name');
  if (mobNameEl) {
    mobNameEl.textContent = mob.Name;
    mobNameEl.style.color = `var(--rank-${rank.toLowerCase()})`;
  }

  const mobRankBadge = card.querySelector('.mob-rank-badge');
  if (mobRankBadge) {
    mobRankBadge.textContent = rank;
    mobRankBadge.style.color = `var(--rank-${rank.toLowerCase()})`;
  }

  const reportSidebar = card.querySelector('.report-side-bar');
  if (reportSidebar) {
    reportSidebar.dataset.reportType = rank === 'A' ? 'instant' : 'modal';
    reportSidebar.dataset.mobNo = mob.No;
  }

  const expandablePanel = card.querySelector('.expandable-panel');
  if (isOpen && expandablePanel) {
    expandablePanel.classList.add('open');
  }

  const conditionText = card.querySelector('.condition-text');
  if (conditionText && mob.Condition) {
    conditionText.innerHTML = processText(mob.Condition);
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

  const nameEl = card.querySelector('.pc-detail-name');
  if (nameEl) {
    nameEl.textContent = mob.Name;
    nameEl.style.color = `var(--rank-${rank.toLowerCase()})`;
  }

  const rankEl = card.querySelector('.pc-detail-rank');
  if (rankEl) {
    rankEl.textContent = rank;
    rankEl.dataset.rank = rank;
  }

  const progressBar = card.querySelector('.pc-detail-progress-bar');
  if (progressBar) progressBar.style.width = `${elapsedPercent || 0}%`;

  card.querySelector('[data-min-repop]').textContent = fmt(minRepop);
  card.querySelector('[data-max-repop]').textContent = fmt(maxRepop);
  card.querySelector('[data-next-possible]').textContent = nextConditionSpawnDate ? fmt(nextConditionSpawnDate) : "--/-- --:--";
  card.querySelector('[data-last-kill]').textContent = fmt(mob.last_kill_time);

  const conditionEl = card.querySelector('.section-content.condition');
  if (conditionEl) conditionEl.innerHTML = processText(mob.Condition || "\u7279\u6b8a\u306a\u51fa\u73fe\u6761\u4ef6\u306f\u3042\u308a\u307e\u305b\u3093\u3002");

  const memoInput = card.querySelector('.memo-input');
  if (memoInput) {
    memoInput.dataset.mobNo = mob.No;
    memoInput.value = mob.memo_text || '';
  }

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
    if (bar.classList.contains('pc-detail-progress-bar')) {
      bar.style.background = status === "MaxOver" ? "var(--progress-max-over)" : "var(--progress-fill)";
    } else {
      let color = "rgba(107, 114, 128, 0.2)";
      if (status === "MaxOver") color = "rgba(30, 58, 138, 0.3)";
      else if (status === "ConditionActive") color = "rgba(251, 191, 36, 0.3)";
      else if (status === "PopWindow") color = "rgba(59, 130, 246, 0.3)";
      bar.style.background = color;
    }
    bar.classList.remove(PROGRESS_CLASSES.P0_60, PROGRESS_CLASSES.P60_80, PROGRESS_CLASSES.P80_100, PROGRESS_CLASSES.MAX_OVER);
    if (elapsedPercent < 60) bar.classList.add(PROGRESS_CLASSES.P0_60);
    else if (elapsedPercent < 80) bar.classList.add(PROGRESS_CLASSES.P60_80);
    else if (elapsedPercent < 100) bar.classList.add(PROGRESS_CLASSES.P80_100);
    if (status === "MaxOver") bar.classList.add(PROGRESS_CLASSES.MAX_OVER);
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
  const { elapsedPercent, status, isInConditionWindow, repopTimeStr } = mob.repopInfo || {};
  const { label, timeValue, isSpecialCondition, isTimeOver } = computeTimeLabel(mob);
  const isMaint = !!(mob.repopInfo?.isBlockedByMaintenance || mob.repopInfo?.isMaintenanceStop);
  const nowSec = Date.now() / 1000;

  let safePercent = Math.max(0, Math.min(100, Math.floor(elapsedPercent || 0)));
  const percentStr = isTimeOver ? "100%" : `${safePercent}%`;

  const iconArea = card.querySelector('.mobile-icon-area');
  const timeArea = card.querySelector('.mobile-time-area');
  const percentArea = card.querySelector('.mobile-percent-area');
  const progressTextNodes = card.querySelectorAll('.progress-text, .pc-detail-progress-text');

  if (timeArea && iconArea && percentArea) {
    iconArea.innerHTML = `<span class="detail-label-icon text-[13px] text-yellow-500">${label}</span>`;
    timeArea.innerHTML = `<span class="detail-time-val font-bold text-[12px] text-gray-100 ${isSpecialCondition ? 'label-next' : ''} ${isTimeOver ? 'text-red-400' : ''}">${timeValue}</span>`;
    percentArea.textContent = percentStr;
    percentArea.classList.add("text-gray-300");
  }

  const pcProgressTextHTML = `<span class="font-bold text-[14px] text-gray-100">${percentStr}</span>`;
  const defaultProgressTextHTML = `
        <div class="flex items-center justify-between w-full">
            <div class="flex items-center gap-1.5">
                ${label ? `<span class="detail-label-icon text-[12px] opacity-80">${label}</span>` : ''}
                <span class="detail-time-val font-bold text-[13px] ${isSpecialCondition ? 'label-next' : ''}">${timeValue}</span>
            </div>
            <span class="font-bold text-[13px] ml-4">${percentStr}</span>
        </div>`;

  progressTextNodes.forEach(text => {
    if (text.classList.contains('pc-detail-progress-text')) {
      text.innerHTML = pcProgressTextHTML;
    } else {
      text.innerHTML = defaultProgressTextHTML;
    }
    if (status === "MaxOver") text.classList.add("max-over");
    else text.classList.remove("max-over");
  });

  const mobNameEl = card.querySelector('.mob-name');
  const shouldDimCard = isMaint || status === "Next" || (status === "NextCondition" && nowSec < (mob.repopInfo?.minRepop || 0));
  const reportSidebar = card.querySelector('.report-side-bar');

  if (shouldDimCard) {
    card.classList.add("is-pre-repop");
    card.classList.remove("is-active-neon");
    if (reportSidebar) reportSidebar.classList.remove("is-active-neon");
  } else {
    card.classList.remove("is-pre-repop");
    card.classList.add("is-active-neon");
    if (reportSidebar) reportSidebar.classList.add("is-active-neon");
  }
  if (mobNameEl) mobNameEl.style.color = '#fff';

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
  const { remainingCount } = getSpawnCountInfo(mob);
  let displayCountText = "";
  if (mob.Map && mob.spawn_points) {
    if (remainingCount === 1) {
      const { validSpawnPoints } = getSpawnCountInfo(mob);
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
    const color = `var(--rank-${rank.toLowerCase()})`;
    badge.style.color = color;
    badge.style.borderColor = color;
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
        <div class="pc-list-name font-bold" style="color: #fff;"></div>
        <div class="pc-list-count"></div>
        <div class="pc-list-time"></div>
        <div class="pc-list-progress-container"><div class="pc-list-progress-bar" style="width: 0%"></div></div>
        <div class="pc-list-percent">0%</div>
        <button class="pc-list-report-btn">REPORT</button>`;
  const nameEl = item.querySelector('.pc-list-name');
  if (nameEl) nameEl.textContent = mob.Name;
  updateSimpleMobItem(item, mob);
  return item;
}

export function updateSimpleMobItem(item, mob) {
  const { elapsedPercent, status, isInConditionWindow } = mob.repopInfo || {};
  const isMaint = !!(mob.repopInfo?.isBlockedByMaintenance || mob.repopInfo?.isMaintenanceStop);
  const now = Date.now() / 1000;
  const timeEl = item.querySelector('.pc-list-time');
  const progressEl = item.querySelector('.pc-list-progress-bar');
  const percentEl = item.querySelector('.pc-list-percent');
  const { countHtml } = getSpawnCountInfo(mob);
  const { label, timeValue, isSpecialCondition, isTimeOver } = computeTimeLabel(mob);

  if (timeEl) {
    timeEl.innerHTML = `
        <div class="grid items-center w-full h-full" style="grid-template-columns: 30px 75px; gap: 1px;">
            <span class="timer-label text-[14px] text-right opacity-90">${label}</span>
            <span class="timer-value font-bold text-[14px] text-left ${isSpecialCondition ? 'label-next' : ''} ${isTimeOver ? 'time-over' : ''}">${timeValue}</span>
        </div>`;
  }
  const countEl = item.querySelector('.pc-list-count');
  if (countEl) {
    countEl.innerHTML = countHtml;
  }
  if (progressEl) {
    const currentWidth = parseFloat(progressEl.style.width) || 0;
    if (Math.abs(elapsedPercent - currentWidth) > 0.001) {
      progressEl.style.transition = (currentWidth === 0 || elapsedPercent < currentWidth) ? "none" : "width linear 60s";
      progressEl.style.width = `${elapsedPercent}%`;
    }
    progressEl.style.background = isTimeOver ? "var(--progress-max-over)" : "var(--progress-fill)";
  }
  if (percentEl) {
    let safePercent = Math.max(0, Math.min(100, Math.floor(elapsedPercent || 0)));
    percentEl.textContent = isTimeOver ? "100%" : `${safePercent}%`;
  }
  item.style.opacity = (isMaint || status === "Next" || (status === "NextCondition" && now < (mob.repopInfo?.minRepop || 0))) ? "0.4" : "1";
  item.style.filter = (isMaint || status === "Next" || (status === "NextCondition" && now < (mob.repopInfo?.minRepop || 0))) ? "grayscale(1)" : "none";
  if (!isMaint && (status === "ConditionActive" || (status === "MaxOver" && isInConditionWindow))) item.classList.add("blink-active");
  else item.classList.remove("blink-active");
}

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
  pcLayout: document.getElementById('pc-layout'),
  mobileLayout: document.getElementById('mobile-layout'),
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
  const lt = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const etStr = `${et.hours}:${et.minutes}`;

  ["header-time-lt", "pc-time-lt", "mobile-time-lt", "sidebar-lt-persistent"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = lt;
  });
  ["header-time-et", "pc-time-et", "mobile-time-et", "sidebar-et-persistent"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = etStr;
  });

  const elWelcome = document.getElementById("header-welcome-message");
  if (elWelcome) elWelcome.textContent = state.characterName ? `ようこそ ${state.characterName}` : "";
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
const simpleItemCache = new Map();

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

  const md = 768;
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

  if (DOM.pcLeftList) {
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

  const hasActiveAlpha = state.mobs.some(m => {
    const isS = m.Rank === "S";
    const isA = m.Rank === "A";
    if (!isS && !isA) return false;
    const { status, nextConditionSpawnDate } = m.repopInfo || {};
    if (status === "MaxOver") return true;
    if (isS && nextConditionSpawnDate && Date.now() >= nextConditionSpawnDate.getTime()) return true;
    return false;
  });
  const rankBtn = document.querySelector('.mobile-footer-btn[data-panel="rank"]');
  if (rankBtn) rankBtn.classList.toggle("has-alert", hasActiveAlpha);
}

setInterval(() => {
  updateProgressBars();
}, EORZEA_MINUTE_MS);
