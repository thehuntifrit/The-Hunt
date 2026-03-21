// mobCard.js

import { calculateRepop, formatLastKillTime } from "./cal.js";
import { drawSpawnPoint, isCulled } from "./location.js";
import { getState, PROGRESS_CLASSES, EXPANSION_MAP } from "./dataManager.js";

const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Tokyo"
});

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

    const rankText = card.querySelector('[data-rank-text]');
    if (rankText) {
        rankText.textContent = rank;
        rankText.style.color = `var(--rank-${rank.toLowerCase()})`;
    }

    const mobNameEl = card.querySelector('.mob-name');
    if (mobNameEl) {
        mobNameEl.textContent = mob.Name;
        mobNameEl.style.color = `var(--rank-${rank.toLowerCase()})`;
    }

    const detailName = card.querySelector('.mob-name-detail');
    if (detailName) detailName.textContent = mob.Name;

    const detailArea = card.querySelector('.mob-area-detail');
    if (detailArea) detailArea.textContent = mob.Area;

    const detailExpansion = card.querySelector('.mob-expansion-detail');
    if (detailExpansion) {
        detailExpansion.textContent = EXPANSION_MAP[mob.Expansion] || mob.Expansion;
    }

    const detailRank = card.querySelector('.mob-rank-detail');
    if (detailRank) {
        detailRank.textContent = rank;
        detailRank.style.color = `var(--rank-${rank.toLowerCase()})`;
    }

    const memoIconContainer = card.querySelector('.memo-icon-container');

    const reportSidebar = card.querySelector('.report-side-bar');
    if (reportSidebar) {
        reportSidebar.dataset.reportType = rank === 'A' ? 'instant' : 'modal';
        reportSidebar.dataset.mobNo = mob.No;
        reportSidebar.classList.add(`rank-${rank.toLowerCase()}`);
        
        reportSidebar.addEventListener('click', (e) => {
            e.stopPropagation();
            import("./app.js").then(m => {
                const state = getState();
                if (!state.isVerified) {
                    import("./modal.js").then(mod => mod.openAuthModal());
                    return;
                }
                if (rank === 'A') m.handleInstantReport(mob.No, rank);
                else import("./modal.js").then(mod => mod.openReportModal(mob.No));
            });
        });
    }

    const memoInput = card.querySelector('.memo-input');
    if (memoInput) {
        memoInput.dataset.mobNo = mob.No;
        memoInput.dataset.action = 'save-memo';
    }

    const conditionWrapper = card.querySelector('.condition-text')?.closest('.w-full.mt-2') || card.querySelector('.condition-text')?.parentElement;
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
    const detailBar = card.querySelector(".detail-progress-bar-bg");
    if (!bar) return;

    const { elapsedPercent, status } = mob.repopInfo;

    const currentWidth = parseFloat(bar.style.width) || 0;
    if (Math.abs(elapsedPercent - currentWidth) > 0.001) {
        if (currentWidth === 0 || elapsedPercent < currentWidth) {
            bar.style.transition = "none";
            if (detailBar) detailBar.style.transition = "none";
        } else {
            bar.style.transition = "width linear 60s";
            if (detailBar) detailBar.style.transition = "width linear 60s";
        }
        bar.style.width = `${elapsedPercent}%`;
        if (detailBar) detailBar.style.width = `${elapsedPercent}%`;
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
    if (detailBar) detailBar.classList.remove(PROGRESS_CLASSES.P0_60, PROGRESS_CLASSES.P60_80, PROGRESS_CLASSES.P80_100, PROGRESS_CLASSES.MAX_OVER);

    if (elapsedPercent < 60) {
        bar.classList.add(PROGRESS_CLASSES.P0_60);
        if (detailBar) detailBar.classList.add(PROGRESS_CLASSES.P0_60);
    } else if (elapsedPercent < 80) {
        bar.classList.add(PROGRESS_CLASSES.P60_80);
        if (detailBar) detailBar.classList.add(PROGRESS_CLASSES.P60_80);
    } else if (elapsedPercent < 100) {
        bar.classList.add(PROGRESS_CLASSES.P80_100);
        if (detailBar) detailBar.classList.add(PROGRESS_CLASSES.P80_100);
    }

    if (status === "MaxOver") {
        bar.classList.add(PROGRESS_CLASSES.MAX_OVER);
        if (detailBar) detailBar.classList.add(PROGRESS_CLASSES.MAX_OVER);
    }
}

function formatTimeDiff(diffSec) {
    if (diffSec < 0) return "0:00";
    if (diffSec >= 3600000) return "999:59"; // Max display cap roughly
    const m = Math.floor(diffSec / 60);
    const s = Math.floor(diffSec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}

export function updateProgressText(card, mob) {
    const textEl = card.querySelector(".progress-text");
    const iconEl = card.querySelector(".mob-status-icon");
    const pctEl = card.querySelector(".progress-percentage");
    const detailPctEl = card.querySelector(".detail-progress-percentage");
    if (!textEl || !iconEl || !pctEl) return;

    const { elapsedPercent, nextMinRepopDate, nextConditionSpawnDate, minRepop, maxRepop,
        status, isInConditionWindow
    } = mob.repopInfo || {};

    const isMaint = !!(mob.repopInfo?.isBlockedByMaintenance || mob.repopInfo?.isMaintenanceStop);
    const nowSec = Date.now() / 1000;
    
    let timeStr = "";
    let iconStr = "";
    let displayPercent = Math.min(100, Math.max(0, Math.floor(elapsedPercent || 0)));

    if (status === "MaxOver") {
        iconStr = "💯"; // 最大時間超え
        displayPercent = 100;
        const excessSec = nowSec - maxRepop;
        timeStr = formatTimeDiff(excessSec);
    } else if (isInConditionWindow) {
        iconStr = "⏳️"; // 時限モブ時間内
        const diffSec = (mob.repopInfo.conditionWindowEnd?.getTime() / 1000) - nowSec;
        timeStr = formatTimeDiff(diffSec);
    } else if (status === "PopWindow" || status === "ConditionActive" || (nowSec >= minRepop)) {
        iconStr = "⏳️"; // 最短REPOP超え
        const diffSec = maxRepop - nowSec;
        timeStr = formatTimeDiff(diffSec);
    } else {
        iconStr = "🔜"; // 最短REPOP前・時限機能時間外
        if (nextConditionSpawnDate && nextConditionSpawnDate.getTime() / 1000 > nowSec) {
            const diffSec = (nextConditionSpawnDate.getTime() / 1000) - nowSec;
            timeStr = formatTimeDiff(diffSec);
        } else {
            const diffSec = minRepop - nowSec;
            timeStr = formatTimeDiff(diffSec);
        }
        displayPercent = 0;
    }

    if (isMaint) {
        iconStr = "🛠️";
        timeStr = "メンテ中";
    }

    const cacheKey = `${timeStr}|${iconStr}|${displayPercent}|${status}`;
    if (textEl.dataset.cacheKey !== cacheKey) {
        textEl.dataset.cacheKey = cacheKey;
        textEl.textContent = timeStr;
        iconEl.textContent = iconStr;
        pctEl.textContent = `${displayPercent}%`;
        if (detailPctEl) detailPctEl.textContent = `${displayPercent}%`;
    }

    if (status === "MaxOver") {
        textEl.classList.add("text-red-400");
        textEl.classList.remove("text-gray-300");
    } else {
        textEl.classList.remove("text-red-400");
        textEl.classList.add("text-gray-300");
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
