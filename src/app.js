// app.js
import { getState, setFilter, loadBaseMobData, setOpenMobCardNo, FILTER_TO_DATA_RANK_MAP } from "./dataManager.js"; 
import { openReportModal, closeReportModal, initModal } from "./modal.js"; 
import { attachLocationEvents } from "./location.js"; 
import { submitReport, toggleCrushStatus } from "./server.js"; 
import { debounce, toJstAdjustedIsoString, } from "./cal.js"; 
import { DOM, filterAndRender, renderRankTabs, renderAreaFilterPanel, sortAndRedistribute, toggleAreaFilterPanel } from "./uiRender.js";

function attachFilterEvents() {
  const tabs = document.getElementById("rank-tabs");
  if (!tabs) return;

  tabs.addEventListener("click", (e) => {
    const btn = e.target.closest(".tab-button");
    if (!btn) return;

    const newRank = btn.dataset.rank.toUpperCase();
    const state = getState();
    const prevRank = state.filter.rank;

    const nextAreaSets = { ...state.filter.areaSets };
    if (!(nextAreaSets[newRank] instanceof Set)) {
      nextAreaSets[newRank] = new Set();
    }

    setFilter({
      rank: newRank,
      areaSets: nextAreaSets
    });

    const isInitialLoad = prevRank !== newRank;
    filterAndRender({ isInitialLoad });

    toggleAreaFilterPanel(newRank !== "ALL");
    renderRankTabs();
    renderAreaFilterPanel();
  });

  document.getElementById("area-filter-panel")?.addEventListener("click", (e) => {
    const btn = e.target.closest(".area-filter-btn");
    if (!btn) return;

    const state = getState();
    const uiRank = state.filter.rank;
    const dataRank = FILTER_TO_DATA_RANK_MAP[uiRank] || uiRank;

    const areas = state.mobs
      .filter((m) =>
        dataRank === "A" || dataRank === "F"
          ? m.Rank === dataRank || m.Rank.startsWith("B")
          : m.Rank === dataRank
      )
      .reduce((set, m) => {
        const mobExpansion =
          m.Rank.startsWith("B")
            ? state.mobs.find((x) => x.No === m.related_mob_no)?.Expansion || m.Expansion
            : m.Expansion;
        if (mobExpansion) set.add(mobExpansion);
        return set;
      }, new Set());

    const currentSet =
      state.filter.areaSets[uiRank] instanceof Set
        ? state.filter.areaSets[uiRank]
        : new Set();

    if (btn.dataset.area === "ALL") {
      if (currentSet.size === areas.size) {
        state.filter.areaSets[uiRank] = new Set();
      } else {
        state.filter.areaSets[uiRank] = new Set(areas);
      }
    } else {
      const area = btn.dataset.area;
      const next = new Set(currentSet);
      if (next.has(area)) next.delete(area);
      else next.add(area);
      state.filter.areaSets[uiRank] = next;
    }

    setFilter({
      rank: uiRank,
      areaSets: state.filter.areaSets
    });

    filterAndRender();
    renderAreaFilterPanel();
  });
}

function attachCardEvents() {
  DOM.colContainer.addEventListener("click", e => {
    const card = e.target.closest(".mob-card");
    if (!card) return;
    const mobNo = parseInt(card.dataset.mobNo, 10);
    const rank = card.dataset.rank;

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

    const point = e.target.closest(".spawn-point");
    if (point && point.dataset.isInteractive === "true") {
      e.preventDefault();
      e.stopPropagation();
      const locationId = point.dataset.locationId;
      const isCurrentlyCulled = point.dataset.isCulled === "true";
      toggleCrushStatus(mobNo, locationId, isCurrentlyCulled);
      return;
    }
      
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
    loadBaseMobData();
    initModal();
  const currentRank = JSON.parse(localStorage.getItem("huntFilterState"))?.rank || "ALL";
  DOM.rankTabs.querySelectorAll(".tab-button").forEach(btn => {
    btn.dataset.clickCount = btn.dataset.rank === currentRank ? "1" : "0";
  });
});

export { attachEventListeners };
