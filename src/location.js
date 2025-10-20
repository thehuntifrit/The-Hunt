
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

function drawSpawnPoint(mob) {
  const state = getState();
  const card = DOM.colContainer.querySelector(`.mob-card[data-mob-no="${mob.No}"]`);
  const overlay = card?.querySelector(".spawn-points-overlay");
  if (!overlay) return;

  overlay.innerHTML = '';

  if (mob.spawn_locations) {
    Object.entries(mob.spawn_locations).forEach(([id, point]) => {
      const isCulled = point.culled_by.length > 0;
      const marker = document.createElement('div');
      marker.className = `spawn-point absolute w-3 h-3 rounded-full cursor-pointer transition-all ${isCulled ? 'bg-red-500' : 'bg-green-500'}`;
      marker.style.left = `${point.x}%`;
      marker.style.top = `${point.y}%`;
      marker.title = `湧き潰し: ${isCulled ? '済' : '未'}`;
      marker.dataset.mobNo = mob.No;
      marker.dataset.locationId = id;
      marker.dataset.isCulled = isCulled ? 'true' : 'false';
      marker.dataset.isInteractive = 'true';

      overlay.appendChild(marker);
    });
  }
}

function attachLocationEvents() {
  const overlayContainers = document.querySelectorAll(".spawn-points-overlay");
  if (!overlayContainers.length) return;

  overlayContainers.forEach(overlay => {
    overlay.addEventListener("click", e => {
      const point = e.target.closest(".spawn-point");
      if (!point) return;

      if (point.dataset.isInteractive !== "true") return;

      const mobNo = point.dataset.mobNo;
      const locationId = point.dataset.locationId;
      const isCurrentlyCulled = point.dataset.isCulled === "true";

      toggleCrushStatus(mobNo, locationId, isCurrentlyCulled);

      point.dataset.isCulled = (!isCurrentlyCulled).toString();
      point.classList.toggle("spawn-point-culled", !isCurrentlyCulled);
      point.title = `湧き潰し: ${!isCurrentlyCulled ? "済" : "未"}`;
    });
  });
}

export { drawSpawnPoint, handleCrushToggle, updateCrushUI, attachLocationEvents };
