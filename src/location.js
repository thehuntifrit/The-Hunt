// location.js

import { DOM } from "./uiRender.js";
import { toggleCrushStatus } from "./server.js";
import { getState, getMobByNo } from "./dataManager.js";

function handleCrushToggle(e) {
    const point = e.target.closest(".spawn-point");
    if (point && point.dataset.isInteractive === "true") {
        e.preventDefault();
        e.stopPropagation();
        const card = e.target.closest(".mob-card");
        if (!card) return true;
        const mobNo = parseInt(card.dataset.mobNo, 10);
        const locationId = point.dataset.locationId;
        const isCurrentlyCulled = point.dataset.isCulled === "true";
        toggleCrushStatus(mobNo, locationId, isCurrentlyCulled);
        return true;
    }
    return false;
}

function updateCrushUI(mobNo, locationId, isCulled) {
    const marker = document.querySelector(
        `.spawn-point[data-mob-no="${mobNo}"][data-location-id="${locationId}"]`
    );
    if (marker) {
        marker.dataset.isCulled = isCulled.toString();
        marker.classList.toggle("spawn-point-culled", isCulled);
        marker.title = `湧き潰し: ${isCulled ? "済" : "未"}`;
    }
}

function drawSpawnPoint(point, spawnCullStatus, mobNo, mobRank, isLastOne, isSLastOne, lastKillTime, prevKillTime) {
    console.log(mobRank, point.id)
    const cullStatus = spawnCullStatus[point.id] || { culled_by: [] };
    const isCulled = cullStatus.culled_by.length > 0;

    const culledClass = isCulled ? 'spawn-point-culled' : 'spawn-point-active';

    const isB2Spawn = point.mob_ranks.some(rank => rank.startsWith('B2'));

    let colorClass = '';
    let pointShadowClass = '';
    let inlineStyle = `left: ${point.x}%; top: ${point.y}%;`; // 基本スタイルを初期化

    if (!isCulled) {
        if (isLastOne) {
            colorClass = 'color-lastone spawn-point-lastone';
            pointShadowClass = 'spawn-point-shadow-lastone';
        } else if (mobRank === 'A' || mobRank === 'S') {
            colorClass = 'color-b1 spawn-point-sa';
            pointShadowClass = 'spawn-point-shadow-sa';
            // S/A湧き潰しポイントにもB1色を強制適用（万全を期す）
            inlineStyle += ' background-color: var(--color-b1);';
        } else if (mobRank.startsWith('B')) {
            if (isB2Spawn) {
                colorClass = 'color-b2-only spawn-point-b-only';
                inlineStyle += ' background-color: var(--color-b2);';
            } else {
                colorClass = 'color-b1-only spawn-point-b-only';
                inlineStyle += ' background-color: var(--color-b1);';
            }
        }

    } else {
        colorClass = 'culled-with-white-border';
    }

    return `
<div class="spawn-point absolute w-3 h-3 rounded-full cursor-pointer transition-all ${culledClass} ${colorClass} ${pointShadowClass}"
  style="${inlineStyle}"
  title="湧き潰し: ${isCulled ? '済' : '未'}"
  data-mob-no="${mobNo}"
  data-location-id="${point.id}"
  data-is-culled="${isCulled ? 'true' : 'false'}"
  data-is-interactive="true"
></div>
`;
}

function attachLocationEvents() {
    const overlayContainers = document.querySelectorAll(".map-overlay");
    if (!overlayContainers.length) return;

    overlayContainers.forEach(overlay => {
        overlay.removeEventListener("click", handleCrushToggle);
        overlay.addEventListener("click", handleCrushToggle);
    });
}

export { drawSpawnPoint, handleCrushToggle, updateCrushUI, attachLocationEvents };
