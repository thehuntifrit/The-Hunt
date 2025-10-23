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

  const isB1Spawn = point.mob_ranks.includes("B1");
  const isB2Spawn = point.mob_ranks.includes("B2");
  const isShared = point.mob_ranks.includes("S") || point.mob_ranks.includes("A");

  let colorClass = "";
  let shadowClass = "";
  let inlineStyle = `left: ${point.x}%; top: ${point.y}%;`;

  if (isCulled) {
    colorClass = "culled-with-white-border";
  } else if (isLastOne) {
    colorClass = "color-lastone spawn-point-lastone";
    shadowClass = "spawn-point-shadow-lastone";
  } else if (mobRank === "S" || mobRank === "A") {
    // S/A のカード描画時
    colorClass = "color-b1 spawn-point-sa";
    inlineStyle += " background-color: var(--color-b1);";
  } else if (mobRank === "B") {
    // B のカード描画時
    if (isShared) {
      // 共有地点 → B1/B2 を色分けしつつ「共有地点」であることを示すクラスを追加
      if (isB2Spawn) {
        colorClass = "color-b2 spawn-point-shared";
        inlineStyle += " background-color: var(--color-b2);";
      } else {
        colorClass = "color-b1 spawn-point-shared";
        inlineStyle += " background-color: var(--color-b1);";
      }
    } else {
      // B専用地点
      if (isB2Spawn) {
        colorClass = "color-b2-only spawn-point-b-only";
        inlineStyle += " background-color: var(--color-b2);";
      } else {
        colorClass = "color-b1-only spawn-point-b-only";
        inlineStyle += " background-color: var(--color-b1);";
      }
    }
  }

  return `
<div class="spawn-point absolute w-3 h-3 rounded-full cursor-pointer transition-all 
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
