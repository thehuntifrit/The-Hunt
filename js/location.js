import { toggleCrushStatus } from "./server.js";
import { getState } from "./dataManager.js";
import { hideTooltip } from "./tooltip.js";
import { openAuthModal } from "./modal.js";

let lastClickTime = 0;
let lastClickLocationId = null;
let locationEventsAttached = false;

const CULLED_CLASS_MAP = {
    "color-b1": "color-b1-culled",
    "color-b2": "color-b2-culled",
};
const UNCULLED_CLASS_MAP = {
    "color-b1-culled": "color-b1",
    "color-b2-culled": "color-b2",
};

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

function applyOptimisticState(mobNo, locationId, nextCulled) {
    const state = getState();
    if (!state.mobLocations[mobNo]) {
        state.mobLocations[mobNo] = {};
    }
    if (!state.mobLocations[mobNo][locationId]) {
        state.mobLocations[mobNo][locationId] = {};
    }

    const now = { toMillis: () => Date.now() };
    if (nextCulled) {
        state.mobLocations[mobNo][locationId].culled_at = now;
    } else {
        state.mobLocations[mobNo][locationId].uncull_at = now;
    }

    const mob = state.mobs.find(m => m.No === mobNo);
    if (mob) {
        mob.spawn_cull_status = state.mobLocations[mobNo];
    }

    window.dispatchEvent(new CustomEvent("locationsUpdated", {
        detail: { locationsMap: state.mobLocations }
    }));
}

function handleCrushToggle(e) {
    const point = e.target.closest(".spawn-point");
    if (!point) return;

    if (!getState().isVerified) {
        openAuthModal();
        return;
    }

    if (point.dataset.isInteractive !== "true") return;
    if (point.dataset.isLastone === "true") return;

    const card = e.target.closest(".mob-card, .pc-detail-card");
    if (!card) return;

    e.preventDefault();
    e.stopPropagation();

    const mobNo = parseInt(card.dataset.mobNo, 10);
    const locationId = point.dataset.locationId;

    const isTouchDevice = window.matchMedia("(hover: none)").matches;
    if (isTouchDevice) {
        const now = Date.now();
        const timeDiff = now - lastClickTime;

        if (locationId === lastClickLocationId && timeDiff < 1000) {
            lastClickTime = 0;
            lastClickLocationId = null;
            hideTooltip();
        } else {
            lastClickTime = now;
            lastClickLocationId = locationId;
            return;
        }
    }

    const isCurrentlyCulled = point.dataset.isCulled === "true";
    const nextCulled = !isCurrentlyCulled;

    applyOptimisticDOM(point, nextCulled);
    applyOptimisticState(mobNo, locationId, nextCulled);

    toggleCrushStatus(mobNo, locationId, nextCulled).then(result => {
        if (!result?.success) {
            applyOptimisticDOM(point, !nextCulled);
            applyOptimisticState(mobNo, locationId, !nextCulled);
        }
    });
}

export function isCulled(pointStatus, mobNo, mob = null) {
    const state = getState();
    if (!mob) {
        mob = state.mobs.find(m => m.No === mobNo);
    }
    const mobLastKillTime = mob?.last_kill_time || 0;
    const serverUpSec = state.maintenance?.serverUp
        ? new Date(state.maintenance.serverUp).getTime()
        : 0;
    const culledMs = pointStatus?.culled_at && typeof pointStatus.culled_at.toMillis === "function"
        ? pointStatus.culled_at.toMillis()
        : 0;

    const uncullMs = pointStatus?.uncull_at && typeof pointStatus.uncull_at.toMillis === "function"
        ? pointStatus.uncull_at.toMillis()
        : 0;
    const lastKillMs = typeof mobLastKillTime === "number" ? mobLastKillTime * 1000 : 0;
    const validCulledMs = culledMs > serverUpSec ? culledMs : 0;
    const validUnculledMs = uncullMs > serverUpSec ? uncullMs : 0;
    if (validCulledMs === 0 && validUnculledMs === 0) return false;

    const culledAfterKill = validCulledMs > lastKillMs;
    const unculledAfterKill = validUnculledMs > lastKillMs;
    if (culledAfterKill && (!unculledAfterKill || validCulledMs >= validUnculledMs)) return true;
    if (unculledAfterKill && (!culledAfterKill || validUnculledMs >= validCulledMs)) return false;

    return false;
}


export function attachLocationEvents() {
    if (locationEventsAttached) return;

    const colContainer = document.getElementById("column-container");
    if (colContainer) {
        colContainer.addEventListener("click", handleCrushToggle, { capture: true });
    }

    const pcRightPane = document.getElementById("pc-right-detail");
    if (pcRightPane) {
        pcRightPane.addEventListener("click", handleCrushToggle, { capture: true });
    }

    locationEventsAttached = true;
}
