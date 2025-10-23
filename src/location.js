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

function drawSpawnPoint(point, spawnCullStatus, mobNo, mobRank, isLastOne) {
  const cullStatus = spawnCullStatus[point.id] || { culled_by: [] };
  const isCulled = cullStatus.culled_by.length > 0;

  const ranks = Array.isArray(point.mob_ranks) ? point.mob_ranks : [];

  const hasS = ranks.includes("S");
  const hasA = ranks.includes("A");
  const hasB1 = ranks.includes("B1");
  const hasB2 = ranks.includes("B2");

  let colorClass = "";
  let shadowClass = "";
  const inlineStyle = `left: ${point.x}%; top: ${point.y}%;`;

  if (isCulled) {
    colorClass = "culled-with-white-border";
  } else if (isLastOne) {
    colorClass = "color-lastone spawn-point-lastone";
    shadowClass = "spawn-point-shadow-lastone";
  } else if ((hasS || hasA) && hasB1) {
    // S/A + B1
    colorClass = "color-b1 spawn-point-shared";
  } else if ((hasS || hasA) && hasB2) {
    // S/A + B2
    colorClass = "color-b2 spawn-point-shared";
  } else if (hasB1) {
    // B1専用
    colorClass = "color-b1-only spawn-point-b-only";
  } else if (hasB2) {
    // B2専用
    colorClass = "color-b2-only spawn-point-b-only";
  } else {
    // フォールバック
    colorClass = "color-b1 spawn-point-shared";
  }

  return `
<div class="spawn-point absolute rounded-full transition-all 
            ${isCulled ? "spawn-point-culled" : "spawn-point-active"} 
            ${colorClass} ${shadowClass}"
     style="${inlineStyle}"
     title="湧き潰し: ${isCulled ? "済" : "未"}"
     data-mob-no="${mobNo}"
     data-location-id="${point.id}"
     data-is-culled="${isCulled}"
     data-is-interactive="true">
</div>`;
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
