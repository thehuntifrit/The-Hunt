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

function drawSpawnPoint(point, spawnCullStatus, mobNo, rank, isLastOne, isS_LastOne) {
  const isCulled = spawnCullStatus?.[point.id] === true;

  const hasS = point.mob_ranks.includes("S");
  const hasA = point.mob_ranks.includes("A");
  const hasB1 = point.mob_ranks.includes("B1");
  const hasB2 = point.mob_ranks.includes("B2");

  const isSharedB1 = (hasS || hasA) && hasB1;
  const isSharedB2 = (hasS || hasA) && hasB2;
  const isBOnly   = !hasS && !hasA && (hasB1 || hasB2);

  let sizeClass = "";
  let colorClass = "";
  let specialClass = "";

  if (isLastOne) {
    sizeClass = "spawn-point-lastone";
    colorClass = "color-lastone";
    specialClass = "spawn-point-shadow-lastone";
  } else if (isSharedB1) {
    // S/A + B1
    sizeClass = "spawn-point-sa";
    colorClass = "color-b1";
    specialClass = isCulled
      ? "culled-with-white-border"
      : "spawn-point-shadow-sa spawn-point-interactive";
  } else if (isSharedB2) {
    // S/A + B2
    sizeClass = "spawn-point-sa";
    colorClass = "color-b2";
    specialClass = isCulled
      ? "culled-with-white-border"
      : "spawn-point-shadow-sa spawn-point-interactive";
  } else if (isBOnly) {
    // B専用
    sizeClass = "spawn-point-b-only";
    if (isS_LastOne) {
      colorClass = "color-b-inverted";
    } else if (hasB1) {
      colorClass = "color-b1-only";
    } else if (hasB2) {
      colorClass = "color-b2-only";
    }
    specialClass = "spawn-point-b-border";
  }

  return `
    <div class="spawn-point ${sizeClass} ${colorClass} ${specialClass}"
         style="left:${point.x}%; top:${point.y}%;"
         data-location-id="${point.id}"
         data-mob-no="${mobNo}"
         data-rank="${rank}"
         data-is-culled="${isCulled}">
    </div>
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
