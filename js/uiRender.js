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

    const reportSidebar = card.querySelector('.report-side-bar');
    if (reportSidebar) {
        reportSidebar.dataset.reportType = rank === 'A' ? 'instant' : 'modal';
        reportSidebar.dataset.mobNo = mob.No;
        reportSidebar.classList.add(`rank-${rank.toLowerCase()}`);
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
    const mapSection = mapImg?.closest('.mobile-expand-section');
    if (mapImg && mob.Map) {
        mapImg.src = `./maps/${mob.Map}`;
        mapImg.alt = `${mob.Area} Map`;
        mapImg.dataset.mobMap = mob.Map;
    } else if (mapSection) {
        mapSection.style.display = 'none';
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
    const card = document.createElement("div");
    const rank = mob.Rank;
    const { elapsedPercent, nextMinRepopDate, nextConditionSpawnDate, conditionWindowEnd, minRepop, maxRepop, status, isInConditionWindow, timeRemaining } = mob.repopInfo || {};
    
    // Time formatters
    const fmt = (val) => val ? formatMMDDHHmm(val) : "--/-- --:--";
    
    let nextPossibleTime = "--/-- --:--";
    if (nextConditionSpawnDate) {
        nextPossibleTime = formatMMDDHHmm(nextConditionSpawnDate);
    } else if (minRepop) {
        nextPossibleTime = formatMMDDHHmm(minRepop);
    }

    const mapFile = mob.Map;

    const layout = `
        <div class="pc-detail-header">
            <div class="flex items-center justify-between mb-0">
                <h2 class="pc-detail-name">${mob.Name}</h2>
                <div class="pc-detail-rank">${mob.Rank}</div>
            </div>
            <div class="pc-detail-area-row">
                <span class="text-yellow-500 font-bold">${mob.Area}</span>
                <span class="text-gray-500 font-normal">${mob.Expansion}</span>
            </div>
        </div>

        <div class="pc-detail-progress-section">
            <div class="flex justify-end mb-1">
                <div class="pc-detail-progress-text">
                    <span class="percent">${Math.floor(elapsedPercent || 0)}%</span>
                </div>
            </div>
            <div class="pc-detail-progress-container">
                <div class="pc-detail-progress-bar" style="width: ${elapsedPercent || 0}%"></div>
            </div>
        </div>

        <div class="pc-detail-grid">
            <div class="pc-detail-info-item">
                <div class="label">最短POP</div>
                <div class="value">${fmt(minRepop)}</div>
            </div>
            <div class="pc-detail-info-item">
                <div class="label">最大POP</div>
                <div class="value">${fmt(maxRepop)}</div>
            </div>
            <div class="pc-detail-info-item highlight">
                <div class="label">次回POP可能</div>
                <div class="value">${nextPossibleTime}</div>
            </div>
            <div class="pc-detail-info-item">
                <div class="label">前回討伐</div>
                <div class="value">${fmt(mob.last_kill_time)}</div>
            </div>
        </div>

        <div class="pc-detail-content">
            <div class="pc-detail-section">
                <div class="section-label">出現条件</div>
                <div class="section-content condition">
                    ${processText(mob.Condition || "特殊な出現条件はありません。")}
                </div>
            </div>

            <div class="pc-detail-section">
                <div class="section-label">MEMO</div>
                <div class="pc-detail-memo-box">
                    <input type="text" class="memo-input pc-detail-memo-input"
                        placeholder="全角30文字まで" maxlength="30" data-action="save-memo" data-mob-no="${mob.No}"
                        value="${mob.memo_text || ''}">
                </div>
            </div>

            ${mapFile ? `
            <div class="pc-detail-section">
                <div class="section-label">出現マップ</div>
                <div class="pc-detail-map-container">
                    <img src="./maps/${mapFile}" class="pc-detail-map mob-map-img" 
                        data-mob-map="${mapFile}" alt="${mob.Name} Map">
                    <div class="pc-detail-map-overlay map-overlay"></div>
                </div>
            </div>
            ` : ''}
        </div>

        <div class="report-side-bar absolute top-0 right-0 w-12 bottom-0 opacity-0 cursor-pointer pointer-events-auto z-10" 
            data-report-type="${rank === 'A' ? 'instant' : 'modal'}" data-mob-no="${mob.No}">
        </div>
    `;

    card.innerHTML = layout;
    card.className = "pc-detail-card pc-detail-card-inner relative h-full flex flex-col";
    card.dataset.mobNo = mob.No;

    const mapOverlay = card.querySelector(".pc-detail-map-overlay");
    if (mapOverlay && mob.spawn_points) {
        const state = getState();
        const mobLocationsData = state.mobLocations?.[mob.No];
        const spawnCullStatus = mobLocationsData || mob.spawn_cull_status;
        const validSpawnPoints = getValidSpawnPoints(mob, spawnCullStatus);
        const isOneLeft = validSpawnPoints.length === 1;

        mapOverlay.innerHTML = (mob.spawn_points || []).map(p => {
            const isLastOne = isOneLeft && p.id === validSpawnPoints[0]?.id;
            const rankToPass = p.mob_ranks.includes("B2") ? "B2" : p.mob_ranks.includes("B1") ? "B1" : p.mob_ranks[0];
            return drawSpawnPoint(p, spawnCullStatus, mob.No, rankToPass, isLastOne, isOneLeft);
        }).join("");
    }

    return card;
}

export function updateProgressBar(card, mob) {
    const bar = card.querySelector(".progress-bar-bg") || card.querySelector(".pc-detail-progress-bar");
    const wrapper = bar?.parentElement;
    const text = card.querySelector(".progress-text") || card.querySelector(".pc-detail-progress-text");
    if (!bar || !wrapper || !text) return;

    const { elapsedPercent, status } = mob.repopInfo;
    const currentWidth = parseFloat(bar.style.width) || 0;
    if (Math.abs(elapsedPercent - currentWidth) > 0.001) {
        if (currentWidth === 0 || elapsedPercent < currentWidth) {
            bar.style.transition = "none";
        } else {
            bar.style.transition = "width linear 60s";
        }
        bar.style.width = `${elapsedPercent}%`;
    }

    const currentStatus = card.dataset.lastStatus;
    const currentInCondition = card.dataset.lastInCondition === "true";
    const isInCondition = !!mob.repopInfo.isInConditionWindow;

    if (currentStatus === status && currentInCondition === isInCondition) return;
    card.dataset.lastStatus = status;
    card.dataset.lastInCondition = isInCondition;

    bar.classList.remove(PROGRESS_CLASSES.P0_60, PROGRESS_CLASSES.P60_80, PROGRESS_CLASSES.P80_100, PROGRESS_CLASSES.MAX_OVER);
    text.classList.remove(PROGRESS_CLASSES.TEXT_NEXT, PROGRESS_CLASSES.TEXT_POP);
    wrapper.classList.remove(PROGRESS_CLASSES.BLINK_WHITE);

    if (elapsedPercent < 60) bar.classList.add(PROGRESS_CLASSES.P0_60);
    else if (elapsedPercent < 80) bar.classList.add(PROGRESS_CLASSES.P60_80);
    else if (elapsedPercent < 100) bar.classList.add(PROGRESS_CLASSES.P80_100);

    if (status === "PopWindow" || status === "ConditionActive") {
        if (elapsedPercent > 90 && !mob.repopInfo?.isMaintenanceStop && !mob.repopInfo?.isBlockedByMaintenance) wrapper.classList.add(PROGRESS_CLASSES.BLINK_WHITE);
        text.classList.add(PROGRESS_CLASSES.TEXT_POP);
    } else if (status === "MaxOver") {
        bar.classList.add(PROGRESS_CLASSES.MAX_OVER);
        text.classList.add(PROGRESS_CLASSES.TEXT_POP);
        if (mob.repopInfo.isInConditionWindow && !mob.repopInfo?.isMaintenanceStop && !mob.repopInfo?.isBlockedByMaintenance) wrapper.classList.add(PROGRESS_CLASSES.BLINK_WHITE);
    } else {
        text.classList.add(PROGRESS_CLASSES.TEXT_NEXT);
    }
}

export function updateProgressText(card, mob) {
    const text = card.querySelector(".progress-text") || card.querySelector(".pc-detail-progress-text");
    if (!text) return;
    const { elapsedPercent, nextMinRepopDate, nextConditionSpawnDate, minRepop, status, isInConditionWindow, timeRemaining, conditionRemaining, repopTimeStr } = mob.repopInfo || {};
    const isMaint = !!(mob.repopInfo?.isBlockedByMaintenance || mob.repopInfo?.isMaintenanceStop);
    const nowSec = Date.now() / 1000;
    let leftStr = timeRemaining || "未確定";
    const percentStr = (status !== "MaxOver" && ((minRepop && nowSec >= minRepop) || status === "PopWindow" || status === "ConditionActive")) ? ` (${Number(elapsedPercent || 0).toFixed(0)}%)` : "";
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
        if (mobNameEl) mobNameEl.style.color = `var(--rank-${mob.Rank.toLowerCase()})`;
    }

    if (isMaint) card.classList.add("maintenance-gray-out");
    else card.classList.remove("maintenance-gray-out");

    let rightStr = (isInConditionWindow && conditionRemaining) ? conditionRemaining : (repopTimeStr || "未確定");
    let isSpecialCondition = isInConditionWindow;
    
    if (!isSpecialCondition) {
        if (nextConditionSpawnDate) {
            try { rightStr = `🔔 ${dateFormatter.format(nextConditionSpawnDate)}`; isSpecialCondition = true; } catch { rightStr = "未確定"; }
        } else if (nextMinRepopDate) {
            try { rightStr = `in ${dateFormatter.format(nextMinRepopDate)}`; } catch { rightStr = "未確定"; }
        }
    }

    const isDetail = card.classList.contains("pc-detail-card");
    let newHTML = "";
    if (isDetail) {
        newHTML = `<span class="percent">${Math.floor(elapsedPercent || 0)}%</span>`;
    } else {
        newHTML = `<div class="truncate min-w-0 ${status === "MaxOver" ? 'time-over' : 'time-normal'}">${leftStr}${percentStr}</div><div class="truncate min-w-0 text-right"><span class="${isSpecialCondition ? 'label-next' : ''}">${rightStr}</span></div>`;
    }
    
    const cacheKey = `${leftStr}|${percentStr}|${rightStr}|${isSpecialCondition}|${status}|${isDetail}`;
    if (text.dataset.cacheKey !== cacheKey) {
        text.dataset.cacheKey = cacheKey;
        text.innerHTML = newHTML;
    }
    if (status === "MaxOver") text.classList.add("max-over");
    else text.classList.remove("max-over");

    
    if (!isMaint && (status === "ConditionActive" || (status === "MaxOver" && isInConditionWindow))) card.classList.add("blink-border-white");
    else card.classList.remove("blink-border-white");
}

export function updateExpandablePanel(card, mob) {
    const { minRepop, maxRepop, nextConditionSpawnDate, elapsedPercent } = mob.repopInfo || {};
    
    // Metrics
    const elMin = card.querySelector("[data-min-repop]");
    const elMax = card.querySelector("[data-max-repop]");
    const elNext = card.querySelector("[data-next-possible]");
    const elLast = card.querySelector("[data-last-kill]");
    
    const fmt = (val) => val ? formatMMDDHHmm(val) : "--/-- --:--";
    
    if (elMin) elMin.textContent = fmt(minRepop);
    if (elMax) elMax.textContent = fmt(maxRepop);
    
    let nextPossibleTime = "--/-- --:--";
    if (nextConditionSpawnDate) {
        nextPossibleTime = formatMMDDHHmm(nextConditionSpawnDate);
    } else if (minRepop) {
        nextPossibleTime = formatMMDDHHmm(minRepop);
    }
    if (elNext) elNext.textContent = nextPossibleTime;
    
    const lastStr = formatLastKillTime(mob.last_kill_time);
    if (elLast) elLast.textContent = `前回: ${lastStr}`;
    
    // Memo
    const elMemoInput = card.querySelector("input[data-action='save-memo']");
    if (elMemoInput) {
        if (elMemoInput.dataset.mobNo !== String(mob.No)) elMemoInput.dataset.mobNo = mob.No;
        if (document.activeElement !== elMemoInput) {
            const newValue = mob.memo_text || "";
            if (elMemoInput.value !== newValue) elMemoInput.value = newValue;
        }
    }
    
    // Condition
    const elCondition = card.querySelector(".condition-text");
    if (elCondition && mob.Condition) {
        const processed = processText(mob.Condition);
        if (elCondition.innerHTML !== processed) elCondition.innerHTML = processed;
    }

    // Map logic for mobile
    const mapImg = card.querySelector(".mob-map-img");
    const mapOverlay = card.querySelector(".map-overlay");
    if (mapImg && !mapImg.src.includes(".webp")) {
        const mapFile = mob.Map;
        if (mapFile) mapImg.src = `./maps/${mapFile}`;
    }

    if (mapOverlay && mob.spawn_points && mapOverlay.innerHTML === "") {
        const state = getState();
        const mobLocationsData = state.mobLocations?.[mob.No];
        const spawnCullStatus = mobLocationsData || mob.spawn_cull_status;
        const validSpawnPoints = getValidSpawnPoints(mob, spawnCullStatus);
        const isOneLeft = validSpawnPoints.length === 1;

        mapOverlay.innerHTML = (mob.spawn_points || []).map(p => {
            const isLastOne = isOneLeft && p.id === validSpawnPoints[0]?.id;
            const rankToPass = p.mob_ranks.includes("B2") ? "B2" : p.mob_ranks.includes("B1") ? "B1" : p.mob_ranks[0];
            return drawSpawnPoint(p, spawnCullStatus, mob.No, rankToPass, isLastOne, isOneLeft);
        }).join("");
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
    const state = getState();
    const mobLocationsData = state.mobLocations?.[mob.No];
    const spawnCullStatus = mobLocationsData || mob.spawn_cull_status;
    let displayCountText = "";
    if (mob.Map && mob.spawn_points) {
        const validSpawnPoints = getValidSpawnPoints(mob, spawnCullStatus);
        const remainingCount = validSpawnPoints.length;
        if (remainingCount === 1) {
            const pointId = validSpawnPoints[0]?.id || "";
            const pointNumber = parseInt(pointId.slice(-2), 10);
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
    const areaInfoContainer = card.querySelector('.area-info-container');
    if (!areaInfoContainer) return;
    if (areaInfoContainer.dataset.initialized === "true") return;
    areaInfoContainer.dataset.initialized = "true";
    const areaInfoHtml = `<div class="truncate text-gray-300 leading-none mb-[3px]">${mob.Area}</div><div class="flex items-center justify-end gap-0.5 leading-none"><span>${mob.Expansion}</span><span class="inline-flex items-center justify-center w-[11px] h-[11px] border border-current rounded-[1px] text-[7px] leading-none">${mob.Rank}</span></div>`;
    areaInfoContainer.innerHTML = areaInfoHtml;
}

export function updateMapOverlay(card, mob) {
    const mapContainer = card.querySelector('.map-container') || card.querySelector('.pc-detail-map-container');
    if (!mapContainer) return;
    const mapImg = mapContainer.querySelector('.mob-map-img') || mapContainer.querySelector('.pc-detail-map');
    if (mapImg && mob.Map && mapImg.dataset.mobMap !== mob.Map) {
        mapImg.src = `./maps/${mob.Map}`;
        mapImg.alt = `${mob.Area} Map`;
        mapImg.dataset.mobMap = mob.Map;
        mapContainer.classList.remove('hidden');
        delete mapContainer.dataset.locationLoading;
    }
    if (mapContainer.classList.contains('hidden')) return;
    const mapOverlay = mapContainer.querySelector('.map-overlay') || mapContainer.querySelector('.pc-detail-map-overlay');
    if (!mapOverlay) return;
    let spawnPointsHtml = "";
    if (mob.Map && mob.spawn_points) {
        const state = getState();
        const mobLocationsData = state.mobLocations?.[mob.No];
        const spawnCullStatus = mobLocationsData || mob.spawn_cull_status;
        const validSpawnPoints = getValidSpawnPoints(mob, spawnCullStatus);
        const remainingCount = validSpawnPoints.length;
        const isLastOne = remainingCount === 1;
        spawnPointsHtml = (mob.spawn_points ?? []).map(point => {
            const isThisPointTheLastOne = isLastOne && point.id === validSpawnPoints[0]?.id;
            return drawSpawnPoint(point, spawnCullStatus, mob.No, point.mob_ranks.includes("B2") ? "B2" : point.mob_ranks.includes("B1") ? "B1" : point.mob_ranks[0], isThisPointTheLastOne, isLastOne);
        }).join("");
    }
    if (mapOverlay.innerHTML !== spawnPointsHtml) mapOverlay.innerHTML = spawnPointsHtml;
}

export function createSimpleMobItem(mob) {
    const item = document.createElement('div');
    item.className = `pc-list-item rank-${mob.Rank.toLowerCase()}`;
    item.dataset.mobNo = mob.No;
    item.dataset.rank = mob.Rank;
    item.innerHTML = `<div class="pc-list-name"></div><div class="pc-list-time"></div><div class="pc-list-progress-container"><div class="pc-list-progress-bar" style="width: 0%"></div></div><div class="pc-list-percent">0%</div><button class="pc-list-report-btn">REPORT</button>`;
    const nameEl = item.querySelector('.pc-list-name');
    if (nameEl) nameEl.textContent = mob.Name;
    updateSimpleMobItem(item, mob);
    return item;
}

export function updateSimpleMobItem(item, mob) {
    const { elapsedPercent, minRepop, maxRepop, status, isInConditionWindow, conditionWindowEnd, nextConditionSpawnDate } = mob.repopInfo || {};
    const isMaint = !!(mob.repopInfo?.isBlockedByMaintenance || mob.repopInfo?.isMaintenanceStop);
    const now = Date.now() / 1000;
    const timeEl = item.querySelector('.pc-list-time');
    const progressEl = item.querySelector('.pc-list-progress-bar');
    const percentEl = item.querySelector('.pc-list-percent');
    const isTimedMob = !!(mob.repopInfo?.isInConditionWindow || mob.repopInfo?.nextConditionSpawnDate);
    let label = "未確定", timeValue = "", isSpecialCondition = isTimedMob, isTimeOver = status === "MaxOver";

    if (isInConditionWindow && conditionWindowEnd) {
        label = "⏳"; timeValue = formatDurationM((conditionWindowEnd.getTime() / 1000) - now); isSpecialCondition = true;
    } else if (nextConditionSpawnDate && now >= minRepop) {
        label = "🔜"; timeValue = formatDurationColon((nextConditionSpawnDate.getTime() / 1000) - now); isSpecialCondition = true;
    } else if (minRepop && now < minRepop) { label = "🔜"; timeValue = formatDurationColon(minRepop - now); if (isTimedMob) isSpecialCondition = true;
    } else if (maxRepop && now < maxRepop) { label = "⏳"; if (isTimedMob) { timeValue = formatDurationM(maxRepop - now); isSpecialCondition = true; } else { timeValue = formatDurationColon(maxRepop - now); }
    } else if (maxRepop) { label = "💯"; if (isTimedMob) { timeValue = formatDurationM(now - maxRepop); isSpecialCondition = true; } else { timeValue = formatDurationColon(now - maxRepop); } isTimeOver = true; }

    if (timeEl) timeEl.innerHTML = `<span class="timer-label">${label}</span><span class="timer-value ${isSpecialCondition ? 'label-next' : ''} ${isTimeOver ? 'time-over' : ''}">${timeValue}</span>`;
    if (progressEl) {
        const currentWidth = parseFloat(progressEl.style.width) || 0;
        if (Math.abs(elapsedPercent - currentWidth) > 0.001) {
            progressEl.style.transition = (currentWidth === 0 || elapsedPercent < currentWidth) ? "none" : "width linear 60s";
            progressEl.style.width = `${elapsedPercent}%`;
        }
        progressEl.style.background = isTimeOver ? "var(--progress-max-over)" : "var(--progress-fill)";
    }
    if (percentEl) {
        let percentStr = status === "MaxOver" ? "100%" : (((minRepop && now >= minRepop) || status === "PopWindow" || status === "ConditionActive") ? `${Number(elapsedPercent || 0).toFixed(0)}%` : "0%");
        percentEl.textContent = percentStr;
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
  const elPCLT = document.getElementById("pc-time-lt");
  const elPCET = document.getElementById("pc-time-et");
  const elWelcome = document.getElementById("header-welcome-message");

  const elSidebarLT = document.getElementById("sidebar-lt-persistent");
  const elSidebarET = document.getElementById("sidebar-et-persistent");
  
  if (elLT && elET) {
    elLT.textContent = `${ltHours}:${ltMinutes}`;
    elET.textContent = `${et.hours}:${et.minutes}`;
  }
  if (elPCLT && elPCET) {
    elPCLT.textContent = `${ltHours}:${ltMinutes}`;
    elPCET.textContent = `${et.hours}:${et.minutes}`;
  }
  const elMobileLT = document.getElementById("mobile-time-lt");
  const elMobileET = document.getElementById("mobile-time-et");
  if (elMobileLT) elMobileLT.textContent = `${ltHours}:${ltMinutes}`;
  if (elMobileET) elMobileET.textContent = `${et.hours}:${et.minutes}`;
  if (elSidebarLT) elSidebarLT.textContent = `${ltHours}:${ltMinutes}`;
  if (elSidebarET) elSidebarET.textContent = `${et.hours}:${et.minutes}`;

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
  const lg = 1024;
  const isPC = width >= lg;

  const pcLayout = DOM.pcLayout || document.getElementById("pc-layout");
  const mobileLayout = DOM.mobileLayout || document.getElementById("mobile-layout");

  if (isPC) {
    if (pcLayout) {
        pcLayout.classList.remove("hidden");
        pcLayout.style.display = "flex"; // Force display
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

    const rightPane = DOM.pcRightDetail || document.getElementById("pc-right-detail");
    if (rightPane) {
      const state = getState();
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
