// mobCard.js

import { calculateRepop, formatLastKillTime, formatDurationHM, formatDurationColon, formatDurationM } from "./cal.js";
import { drawSpawnPoint, isCulled } from "./location.js";
import { getState, PROGRESS_CLASSES, EXPANSION_MAP } from "./dataManager.js";

const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Tokyo"
});

export function createSimpleMobItem(mob) {
    const item = document.createElement('div');
    item.className = `pc-list-item rank-${mob.Rank.toLowerCase()}`;
    item.dataset.mobNo = mob.No;
    item.dataset.rank = mob.Rank;
    
    item.innerHTML = `
        <div class="pc-list-name"></div>
        <div class="pc-list-time"></div>
        <div class="pc-list-progress-container">
            <div class="pc-list-progress-bar" style="width: 0%"></div>
        </div>
        <div class="pc-list-percent">0%</div>
    `;

    const nameEl = item.querySelector('.pc-list-name');
    nameEl.textContent = mob.Name;

    updateSimpleMobItem(item, mob);
    
    return item;
}

export function updateSimpleMobItem(item, mob) {
    const { elapsedPercent, nextMinRepopDate, nextConditionSpawnDate, conditionWindowEnd, minRepop, maxRepop, status, isInConditionWindow, timeRemaining } = mob.repopInfo || {};
    
    const isMaint = !!(mob.repopInfo?.isBlockedByMaintenance || mob.repopInfo?.isMaintenanceStop);
    const now = Date.now() / 1000;
    
    const timeEl = item.querySelector('.pc-list-time');
    const progressEl = item.querySelector('.pc-list-progress-bar');
    const percentEl = item.querySelector('.pc-list-percent');

    // Time
    let timeStr = "未確定";
    let isSpecialCondition = false;
    let isTimeOver = status === "MaxOver";

    // Timer priority: Active Condition Window > Next Condition Window > standard Repop Window
    if (isInConditionWindow && conditionWindowEnd) {
        const remainingConditionSec = (conditionWindowEnd.getTime() / 1000) - now;
        timeStr = "残り" + formatDurationM(remainingConditionSec);
        isSpecialCondition = true;
    } else if (nextConditionSpawnDate && now >= minRepop) {
        const nextConditionSec = (nextConditionSpawnDate.getTime() / 1000) - now;
        timeStr = "次回" + formatDurationColon(nextConditionSec);
        isSpecialCondition = true; // Make timed-mob 'Next' gold as requested
    } else if (minRepop && now < minRepop) {
        timeStr = "次回" + formatDurationColon(minRepop - now);
    } else if (maxRepop && now < maxRepop) {
        timeStr = "残り" + formatDurationM(maxRepop - now);
    } else if (maxRepop) {
        timeStr = "超過" + formatDurationM(now - maxRepop);
        // Request: Timed mobs remain gold even in MaxOver
        if (mob.repopInfo?.isInConditionWindow || mob.repopInfo?.nextConditionSpawnDate) {
            isSpecialCondition = true;
        }
        isTimeOver = true;
    }

    if (timeEl) {
        timeEl.innerHTML = `<span class="${isSpecialCondition ? 'label-next' : ''} ${isTimeOver ? 'time-over' : ''}">${timeStr}</span>`;
    }

    // Progress bar width
    if (progressEl) {
        const currentWidth = parseFloat(progressEl.style.width) || 0;
        if (Math.abs(elapsedPercent - currentWidth) > 0.001) {
            if (currentWidth === 0 || elapsedPercent < currentWidth) {
                progressEl.style.transition = "none";
            } else {
                progressEl.style.transition = "width linear 60s";
            }
            progressEl.style.width = `${elapsedPercent}%`;
        }
        
        // Setup colors based on progress
        progressEl.style.background = isTimeOver ? "var(--progress-max-over)" : "var(--progress-fill)";
    }

    // Percent text
    if (percentEl) {
        let percentStr = "";
        if (status === "MaxOver") {
            percentStr = "100%";
        } else {
            let showPercent = (minRepop && now >= minRepop) || status === "PopWindow" || status === "ConditionActive";
            if (showPercent) {
                percentStr = `${Number(elapsedPercent || 0).toFixed(0)}%`;
            } else {
                percentStr = "0%";
            }
        }
        percentEl.textContent = percentStr;
    }

    // Dimming
    const shouldDimCard = isMaint || status === "Next" || (status === "NextCondition" && now < (mob.repopInfo?.minRepop || 0));
    if (shouldDimCard) {
        item.style.opacity = "0.4";
        item.style.filter = "grayscale(1)";
    } else {
        item.style.opacity = "1";
        item.style.filter = "none";
    }

    // Blink and Glow for active condition
    const isActuallyActive = !isMaint && (status === "ConditionActive" || (status === "MaxOver" && isInConditionWindow));
    if (isActuallyActive) {
        item.classList.add("blink-active");
    } else {
        item.classList.remove("blink-active");
    }
}

function shouldDisplayMemo(mob) {
    const hasMemo = mob.memo_text?.trim();
    const isMemoNewer = (mob.memo_updated_at || 0) >= (mob.last_kill_time || 0);
    return hasMemo && (isMemoNewer || !mob.last_kill_time);
}

export function processText(text) {
    if (typeof text !== "string" || !text) return "";
    return text.replace(/\/\//g, "<br>");
}

export function createMobCard(mob) {
    const template = document.getElementById('mob-card-template');
    const clone = template.content.cloneNode(true);
    const card = clone.querySelector('.mob-card');

    const rank = mob.Rank;
    const { openMobCardNo } = getState();
    const isOpen = mob.No === openMobCardNo;


    card.dataset.mobNo = mob.No;
    card.dataset.rank = rank;
    if (mob.repopInfo?.isMaintenanceStop || mob.repopInfo?.isBlockedByMaintenance) {
        card.classList.add("maintenance-gray-out");
    } else {
        card.classList.remove("maintenance-gray-out");
        const memoInput = card.querySelector('.memo-input');
        if (memoInput) {
            memoInput.dataset.mobNo = mob.No;
        }
    }

    const mobNameEl = card.querySelector('.mob-name');
    mobNameEl.textContent = mob.Name;
    mobNameEl.style.color = `var(--rank-${rank.toLowerCase()})`;

    const memoIconContainer = card.querySelector('.memo-icon-container');

    const reportSidebar = card.querySelector('.report-side-bar');
    if (reportSidebar) {
        reportSidebar.dataset.reportType = rank === 'A' ? 'instant' : 'modal';
        reportSidebar.dataset.mobNo = mob.No;
        reportSidebar.classList.add(`rank-${rank.toLowerCase()}`);

        let touchStartX = 0;
        reportSidebar.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        reportSidebar.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].screenX;
            if (touchEndX - touchStartX > 30) {
                const type = reportSidebar.dataset.reportType;
                if (type === 'modal') {
                    openReportModal(mob.No);
                } else {
                    reportSidebar.click();
                }
            }
        }, { passive: true });
    }

    const expandablePanel = card.querySelector('.expandable-panel');
    if (isOpen) {
        expandablePanel.classList.add('open');
    }

    const memoInput = card.querySelector('.memo-input');
    if (memoInput) {
        memoInput.dataset.mobNo = mob.No;
    }

    const conditionWrapper = card.querySelector('.condition-text')?.closest('.w-full.mt-2');
    const mapContainer = card.querySelector('.map-container');

    if (rank !== 'S') {
        if (conditionWrapper) conditionWrapper.classList.add('hidden');
        if (mapContainer) mapContainer.classList.add('hidden');
    } else {
        const conditionText = card.querySelector('.condition-text');
        if (conditionText) {
            conditionText.innerHTML = processText(mob.Condition);
            if (conditionWrapper) conditionWrapper.classList.remove('hidden');
        }

        if (mapContainer) {
            if (mob.Map) {
                const mapImg = mapContainer.querySelector('.mob-map-img');
                if (mapImg) {
                    mapImg.src = `./maps/${mob.Map}`;
                    mapImg.alt = `${mob.Area} Map`;
                    mapImg.dataset.mobMap = mob.Map;
                }
                mapContainer.classList.remove('hidden');
                delete mapContainer.dataset.locationLoading;
            } else {
                mapContainer.classList.add('hidden');
                mapContainer.dataset.locationLoading = "true";
            }
        }
    }

    updateAreaInfo(card, mob);
    updateMobCount(card, mob);
    updateMapOverlay(card, mob);
    updateExpandablePanel(card, mob);
    updateMemoIcon(card, mob);

    return card;
}

export function updateProgressBar(card, mob) {
    const bar = card.querySelector(".progress-bar-bg");
    const wrapper = bar?.parentElement;
    const text = card.querySelector(".progress-text");
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

    if (currentStatus === status && currentInCondition === isInCondition) {
        return;
    }
    card.dataset.lastStatus = status;
    card.dataset.lastInCondition = isInCondition;

    bar.classList.remove(
        PROGRESS_CLASSES.P0_60,
        PROGRESS_CLASSES.P60_80,
        PROGRESS_CLASSES.P80_100,
        PROGRESS_CLASSES.MAX_OVER
    );
    text.classList.remove(
        PROGRESS_CLASSES.TEXT_NEXT,
        PROGRESS_CLASSES.TEXT_POP
    );
    wrapper.classList.remove(PROGRESS_CLASSES.BLINK_WHITE);

    if (elapsedPercent < 60) {
        bar.classList.add(PROGRESS_CLASSES.P0_60);
    } else if (elapsedPercent < 80) {
        bar.classList.add(PROGRESS_CLASSES.P60_80);
    } else if (elapsedPercent < 100) {
        bar.classList.add(PROGRESS_CLASSES.P80_100);
    }

    if (status === "PopWindow" || status === "ConditionActive") {
        if (elapsedPercent > 90 && !mob.repopInfo?.isMaintenanceStop && !mob.repopInfo?.isBlockedByMaintenance) {
            wrapper.classList.add(PROGRESS_CLASSES.BLINK_WHITE);
        }
        text.classList.add(PROGRESS_CLASSES.TEXT_POP);

    } else if (status === "MaxOver") {
        bar.classList.add(PROGRESS_CLASSES.MAX_OVER);
        text.classList.add(PROGRESS_CLASSES.TEXT_POP);

        if (mob.repopInfo.isInConditionWindow && !mob.repopInfo?.isMaintenanceStop && !mob.repopInfo?.isBlockedByMaintenance) {
            wrapper.classList.add(PROGRESS_CLASSES.BLINK_WHITE);
        }
    } else {
        text.classList.add(PROGRESS_CLASSES.TEXT_NEXT);
    }
}

export function updateProgressText(card, mob) {
    const text = card.querySelector(".progress-text");
    if (!text) return;

    const { elapsedPercent, nextMinRepopDate, nextConditionSpawnDate, minRepop,
        status, isInConditionWindow, timeRemaining
    } = mob.repopInfo || {};

    const isMaint = !!(mob.repopInfo?.isBlockedByMaintenance || mob.repopInfo?.isMaintenanceStop);
    const nowSec = Date.now() / 1000;
    let leftStr = timeRemaining || "未確定";
    const percentStr =
        (status !== "MaxOver" &&
            (
                (minRepop && nowSec >= minRepop) ||
                status === "PopWindow" ||
                status === "ConditionActive"
            )
        )
            ? ` (${Number(elapsedPercent || 0).toFixed(0)}%)`
            : "";
    const mobNameEl = card.querySelector('.mob-name');
    const shouldDimCard =
        isMaint ||
        status === "Next" ||
        (status === "NextCondition" && nowSec < mob.repopInfo.minRepop);

    const reportSidebar = card.querySelector('.report-side-bar');

    if (shouldDimCard) {
        card.classList.add("is-pre-repop");
        card.classList.remove("is-active-neon");
        if (reportSidebar) reportSidebar.classList.remove("is-active-neon");
    } else {
        card.classList.remove("is-pre-repop");
        card.classList.add("is-active-neon");
        if (reportSidebar) reportSidebar.classList.add("is-active-neon");
        if (mobNameEl) {
            mobNameEl.style.color = `var(--rank-${mob.Rank.toLowerCase()})`;
        }
    }

    if (mob.repopInfo?.isBlockedByMaintenance || mob.repopInfo?.isMaintenanceStop) {
        card.classList.add("maintenance-gray-out");
    } else {
        card.classList.remove("maintenance-gray-out");
    }

    let rightStr = "未確定";
    let isSpecialCondition = false;

    if (isInConditionWindow && mob.repopInfo.conditionRemaining) {
        rightStr = mob.repopInfo.conditionRemaining;
        isSpecialCondition = true;
    } else if (nextConditionSpawnDate) {
        try {
            rightStr = `🔔 ${dateFormatter.format(nextConditionSpawnDate)}`;
            isSpecialCondition = true;
        } catch {
            rightStr = "未確定";
        }
    } else if (nextMinRepopDate) {
        try {
            rightStr = `in ${dateFormatter.format(nextMinRepopDate)}`;
        } catch {
            rightStr = "未確定";
        }
    }

    let rightContent = `<span class="${isSpecialCondition ? 'label-next' : ''}">${rightStr}</span>`;

    const newHTML = `
<div class="truncate min-w-0 ${status === "MaxOver" ? 'time-over' : 'time-normal'}">${leftStr}${percentStr}</div>
<div class="truncate min-w-0 text-right">${rightContent}</div>
  `;
    const cacheKey = `${leftStr}|${percentStr}|${rightStr}|${isSpecialCondition}|${status}`;
    if (text.dataset.cacheKey !== cacheKey) {
        text.dataset.cacheKey = cacheKey;
        text.innerHTML = newHTML;
    }

    if (status === "MaxOver") text.classList.add("max-over");
    else text.classList.remove("max-over");

    if (minRepop - nowSec >= 3600) text.classList.add("long-wait");
    else text.classList.remove("long-wait");

    if (!isMaint && (status === "ConditionActive" || (status === "MaxOver" && isInConditionWindow))) {
        card.classList.add("blink-border-white");
    } else {
        card.classList.remove("blink-border-white");
    }
}

export function updateExpandablePanel(card, mob) {
    const elLast = card.querySelector("[data-last-kill]");
    const elMemoInput = card.querySelector("input[data-action='save-memo']");

    const lastStr = formatLastKillTime(mob.last_kill_time);
    if (elLast && elLast.textContent !== `前回: ${lastStr}`) {
        elLast.textContent = `前回: ${lastStr}`;
    }

    if (elMemoInput) {
        if (document.activeElement !== elMemoInput) {
            const shouldShowMemo = shouldDisplayMemo(mob);
            const newValue = shouldShowMemo ? (mob.memo_text || "") : "";
            if (elMemoInput.value !== newValue) {
                elMemoInput.value = newValue;
            }
        }
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
        if (span.getAttribute('data-tooltip') !== mob.memo_text) {
            span.setAttribute('data-tooltip', mob.memo_text);
        }
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

        if (displayCountText) {
            displayCountText = `<span class="text-sm">📍</span>${displayCountText}`;
        }
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

    const areaInfoHtml = `<div class="truncate text-gray-300 leading-none mb-[3px]">${mob.Area}</div>
  <div class="flex items-center justify-end gap-0.5 leading-none">
    <span>${mob.Expansion}</span>
    <span class="inline-flex items-center justify-center w-[11px] h-[11px] border border-current rounded-[1px] text-[7px] leading-none">${mob.Rank}</span>
  </div>`;
    areaInfoContainer.innerHTML = areaInfoHtml;
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
    if (mob.Map && mob.Rank === 'S') {
        const state = getState();
        const mobLocationsData = state.mobLocations?.[mob.No];
        const spawnCullStatus = mobLocationsData || mob.spawn_cull_status;

        const validSpawnPoints = getValidSpawnPoints(mob, spawnCullStatus);
        const remainingCount = validSpawnPoints.length;
        const isLastOne = remainingCount === 1;

        spawnPointsHtml = (mob.spawn_points ?? []).map(point => {
            const isThisPointTheLastOne = isLastOne && point.id === validSpawnPoints[0]?.id;
            return drawSpawnPoint(
                point,
                spawnCullStatus,
                mob.No,
                point.mob_ranks.includes("B2") ? "B2"
                    : point.mob_ranks.includes("B1") ? "B1"
                        : point.mob_ranks[0],
                isThisPointTheLastOne,
                isLastOne
            );
        }).join("");
    }

    if (mapOverlay.innerHTML !== spawnPointsHtml) {
        mapOverlay.innerHTML = spawnPointsHtml;
    }
}
