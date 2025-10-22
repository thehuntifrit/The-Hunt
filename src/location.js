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

// uiRender.js からの呼び出しに合わせて引数を変更し、HTML文字列を返すように修正
function drawSpawnPoint(point, spawnCullStatus, mobNo, mobRank, isLastOne, isSLastOne, lastKillTime, prevKillTime) {
  // Mobオブジェクトには spawn_cull_status があり、それは { locationId: { culled_by: [] } } の形式を想定
  const cullStatus = spawnCullStatus[point.id] || { culled_by: [] };
  const isCulled = cullStatus.culled_by.length > 0;
  
  // 'spawn-point' に加えて、現在の湧き潰し状態を示すクラスを追加
  const culledClass = isCulled ? 'spawn-point-culled' : 'spawn-point-active';

  return `
    <div class="spawn-point absolute w-3 h-3 rounded-full cursor-pointer transition-all ${culledClass}"
         style="left: ${point.x}%; top: ${point.y}%;"
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

  // 既存のイベントリスナーを削除してから再登録
  overlayContainers.forEach(overlay => {
    overlay.removeEventListener("click", handleCrushToggle); 
    overlay.addEventListener("click", handleCrushToggle); 
  });
}

export { drawSpawnPoint, handleCrushToggle, updateCrushUI, attachLocationEvents };
