// app.js

import { getState, setFilter, setOpenMobCardNo, FILTER_TO_DATA_RANK_MAP } from "./dataManager.js"; 
import { openReportModal, closeReportModal } from "./modal.js"; 
import { attachLocationEvents } from "./location.js"; 
import { submitReport, toggleCrushStatus } from "./server.js"; 
import { debounce, toJstAdjustedIsoString, } from "./cal.js"; 
import { DOM, filterAndRender, renderRankTabs, renderAreaFilterPanel, sortAndRedistribute, toggleAreaFilterPanel } from "./uiRender.js";

function attachFilterEvents() {
  // Rank tabs
  DOM.rankTabs.addEventListener("click", e => {
    const btn = e.target.closest(".tab-button");
    if (!btn) return;
    const newRank = btn.dataset.rank.toUpperCase();
    const state = getState();
    let clickCount = parseInt(btn.dataset.clickCount || 0, 10);

    if (newRank !== state.filter.rank) {
      setFilter({
        rank: newRank,
        areaSets: {
          ...state.filter.areaSets,
          [newRank]: state.filter.areaSets[newRank] instanceof Set ? state.filter.areaSets[newRank] : new Set()
        }
      });
      clickCount = 1;
      toggleAreaFilterPanel(true);
      filterAndRender({ isInitialLoad: true });
    } else {
      if (newRank === "ALL") {
        toggleAreaFilterPanel(true);
        clickCount = 0;
  	  } else {
        clickCount = (clickCount % 3) + 1;
        if (clickCount === 2) toggleAreaFilterPanel(false);
        else if (clickCount === 3) {
          toggleAreaFilterPanel(true);
          clickCount = 0;
        }
      }
    }
    btn.dataset.clickCount = String(clickCount);
  });

  // Area filter
  DOM.areaFilterPanel.addEventListener("click", e => {
    const btn = e.target.closest(".area-filter-btn");
    if (!btn) return;
    const state = getState();
    const uiRank = state.filter.rank;
    const dataRank = FILTER_TO_DATA_RANK_MAP[uiRank] || uiRank;
    const currentSet = state.filter.areaSets[uiRank] instanceof Set ? state.filter.areaSets[uiRank] : new Set();

    if (btn.dataset.area === "ALL") {
      const allAreas = Array.from(
        state.mobs
          .filter(m => (dataRank === "A" || dataRank === "F") ? (m.Rank === dataRank || m.Rank.startsWith("B")) : (m.Rank === dataRank))
          .reduce((set, m) => {
            const mobExpansion = m.Rank.startsWith("B")
              ? state.mobs.find(x => x.No === m.related_mob_no)?.Expansion || m.Expansion
              : m.Expansion;
            if (mobExpansion) set.add(mobExpansion);
            return set;
          }, new Set())
      );
      const nextSet = (currentSet.size === allAreas.length) ? new Set() : new Set(allAreas);
      setFilter({ areaSets: { ...state.filter.areaSets, [uiRank]: nextSet } });
    } else {
      const area = btn.dataset.area;
      if (currentSet.has(area)) currentSet.delete(area);
      else currentSet.add(area);
      setFilter({ areaSets: { ...state.filter.areaSets, [uiRank]: new Set(currentSet) } });
    }

    renderAreaFilterPanel();
    sortAndRedistribute(); // debounce内でfilterAndRenderが呼ばれる
  });

}

// Column container delegation (report/map/card header) (app.js の責務: attachEventListeners)
function attachCardEvents() {
  DOM.colContainer.addEventListener("click", e => {
    const card = e.target.closest(".mob-card");
    if (!card) return;
    const mobNo = parseInt(card.dataset.mobNo, 10);
    const rank = card.dataset.rank;

    // Report buttons (MODAL/INSTANT)
    const reportBtn = e.target.closest("button[data-report-type]");
    if (reportBtn) {
      e.stopPropagation();
      const type = reportBtn.dataset.reportType;
      if (type === "modal") {
        openReportModal(mobNo);
      } else if (type === "instant") {
        const iso = toJstAdjustedIsoString(new Date());
        submitReport(mobNo, iso, `${rank}ランク即時報告`);
      }
      return;
    }

    // 湧き潰しボタンのクリック処理 (LOCATION)
    const point = e.target.closest(".spawn-point");
    if (point && point.dataset.isInteractive === "true") {
      e.preventDefault();
      e.stopPropagation();
      const locationId = point.dataset.locationId;
      const isCurrentlyCulled = point.dataset.isCulled === "true";
      toggleCrushStatus(mobNo, locationId, isCurrentlyCulled);
      return;
    }

    // Expand/collapse
    if (e.target.closest("[data-toggle='card-header']")) {
      if (rank === "S" || rank === "A" || rank === "F") {
        const panel = card.querySelector(".expandable-panel");
        if (panel) {
          if (!panel.classList.contains("open")) {
            document.querySelectorAll(".expandable-panel.open").forEach(p => {
              if (p.closest(".mob-card") !== card) p.classList.remove("open");
            });
            panel.classList.add("open");
            setOpenMobCardNo(mobNo);
          } else {
            panel.classList.remove("open");
            setOpenMobCardNo(null);
          }
        }
      }
    }
  });
}

function attachWindowResizeEvents() {
    window.addEventListener("resize", debounce(() => sortAndRedistribute(), 200));
}

function attachEventListeners() {
  renderRankTabs();
  attachFilterEvents();
  attachCardEvents();
  attachWindowResizeEvents();
  attachLocationEvents();
}

document.addEventListener("DOMContentLoaded", () => {
  attachEventListeners();
  const currentRank = JSON.parse(localStorage.getItem("huntFilterState"))?.rank || "ALL";
  DOM.rankTabs.querySelectorAll(".tab-button").forEach(btn => {
    btn.dataset.clickCount = btn.dataset.rank === currentRank ? "1" : "0";
  });
});

export { attachEventListeners };
