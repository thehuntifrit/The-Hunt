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

  // 各地点が持つランク配列
  const ranks = Array.isArray(point.mob_ranks) ? point.mob_ranks : [];

  const isS = ranks.includes("S");
  const isA = ranks.includes("A");
  const isB1 = ranks.includes("B1");
  const isB2 = ranks.includes("B2");
  const isShared = isS || isA; // S/A と共有される地点

  let colorClass = "";
  let shadowClass = "";
  const inlineStyle = `left: ${point.x}%; top: ${point.y}%;`;

  if (isCulled) {
    colorClass = "culled-with-white-border";
  } else if (isLastOne) {
    colorClass = "color-lastone spawn-point-lastone";
    shadowClass = "spawn-point-shadow-lastone";
  } else if (isS || isA) {
    // S/A の湧き地点（B1/B2 と共有している場合もある）
    colorClass = "color-b1 spawn-point-sa";
  } else if (isB1) {
    // B1 専用 or 共有
    colorClass = isShared
      ? "color-b1 spawn-point-shared"
      : "color-b1-only spawn-point-b-only";
  } else if (isB2) {
    // B2 専用 or 共有
    colorClass = isShared
      ? "color-b2 spawn-point-shared"
      : "color-b2-only spawn-point-b-only";
  } else {
    // フォールバック（定義漏れ時）
    colorClass = "color-b1 spawn-point-sa";
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
