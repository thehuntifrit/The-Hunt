// filterUI.js

import { getState, EXPANSION_MAP, setFilter } from "./dataManager.js";
import { filterAndRender } from "./uiRender.js";

const FilterDOM = {
  rankTabs: document.getElementById('rank-tabs'),
  areaFilterPanelMobile: document.getElementById('area-filter-panel-mobile'),
  areaFilterPanelDesktop: document.getElementById('area-filter-panel-desktop')
};

const getAllAreas = () => {
  return Array.from(new Set(Object.values(EXPANSION_MAP)));
};

export const renderRankTabs = () => {
  const state = getState();
  const rankList = ["ALL", "S", "A", "F.A.T.E."];
  const container = FilterDOM.rankTabs;
  if (!container) return;

  container.innerHTML = "";

  const indicator = document.createElement("div");
  indicator.className = "tab-indicator";
  container.appendChild(indicator);

  rankList.forEach(rank => {
    const btn = document.createElement("button");
    btn.dataset.rank = rank;
    btn.textContent = rank;
    btn.className = "tab-button filter-tab-base transition-colors duration-300";

    btn.addEventListener("click", () => {
      handleRankTabClick(rank);
    });

    container.appendChild(btn);
  });

  updateFilterUI();
};

export const renderAreaFilterPanel = (customContainer = null) => {
  const state = getState();
  const targetRankKey = normalizeRank(state.filter.rank);

  let items = [];
  let currentSet = new Set();
  let isAllSelected = false;

  if (state.filter.rank === 'ALL') {
    items = ["S", "A", "F"];
    currentSet = state.filter.allRankSet instanceof Set ? state.filter.allRankSet : new Set();
    isAllSelected = items.length > 0 && currentSet.size === items.length;
  } else {
    const expansionEntries = Object.entries(EXPANSION_MAP).sort((a, b) => b[0] - a[0]);
    items = expansionEntries.map(e => e[1]);
    currentSet = state.filter.areaSets[targetRankKey] instanceof Set ? state.filter.areaSets[targetRankKey] : new Set();
    isAllSelected = items.length > 0 && currentSet.size === items.length;
  }

    const createPanelContent = () => {
        const fragment = document.createDocumentFragment();
        const allBtn = document.createElement("button");
        allBtn.className = `area-filter-btn area-select-all ${isAllSelected ? 'is-selected' : ''}`;
        allBtn.textContent = isAllSelected ? "全解除" : "全選択";
        allBtn.dataset.value = "ALL";
        allBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            handleAreaFilterClick(e);
        });
        fragment.appendChild(allBtn);

        items.forEach(item => {
            const isSelected = currentSet.has(item);
            const btn = document.createElement("button");
            btn.className = `area-filter-btn ${isSelected ? 'is-selected' : ''}`;
            btn.textContent = (state.filter.rank === 'F.A.T.E.' && item === 'F') ? 'F.A.T.E.' : (state.filter.rank === 'ALL' ? (item === 'F' ? 'F.A.T.E.' : `${item} RANK`) : item);
            btn.dataset.value = item;
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                handleAreaFilterClick(e);
            });
            fragment.appendChild(btn);
        });

        return fragment;
    };

  if (customContainer) {
    customContainer.innerHTML = "";
    customContainer.appendChild(createPanelContent());
    return;
  }

  const mobilePanel = FilterDOM.areaFilterPanelMobile?.querySelector('.flex-wrap');
  const desktopPanel = FilterDOM.areaFilterPanelDesktop?.querySelector('.flex-wrap');

  if (mobilePanel) {
    mobilePanel.innerHTML = "";
    mobilePanel.appendChild(createPanelContent());
  }
  if (desktopPanel) {
    desktopPanel.innerHTML = "";
    desktopPanel.appendChild(createPanelContent());
  }
};

export const updateFilterUI = () => {
  const state = getState();
  const rankTabs = FilterDOM.rankTabs;
  if (!rankTabs) return;

  const indicator = rankTabs.querySelector(".tab-indicator");
  const buttons = Array.from(rankTabs.querySelectorAll(".tab-button"));
  const stored = JSON.parse(localStorage.getItem("huntUIState")) || {};
  const clickStep = stored.clickStep || 1;
  const isMobile = window.matchMedia("(max-width: 1023px)").matches;

  buttons.forEach((btn, idx) => {
    const btnRank = btn.dataset.rank;
    const isCurrent = btnRank === state.filter.rank;

    if (isCurrent) {
      btn.style.color = "#fff";
      btn.style.zIndex = "2";

      if (indicator) {
        const rect = btn.getBoundingClientRect();
        const parentRect = rankTabs.getBoundingClientRect();
        indicator.style.width = `${rect.width}px`;
        indicator.style.left = `${rect.left - parentRect.left}px`;
        
        const colorClass = btnRank === "ALL" ? "bg-rose-500"
                         : btnRank === "S" ? "bg-rank-s"
                         : btnRank === "A" ? "bg-rank-a"
                         : btnRank === "F.A.T.E." ? "bg-rank-f"
                         : "bg-cyan-600";
        
        indicator.className = `tab-indicator ${colorClass} transition-all duration-300 ease-out`;
      }

      const panels = [FilterDOM.areaFilterPanelMobile, FilterDOM.areaFilterPanelDesktop];
      if (clickStep === 1 || clickStep === 3) {
        panels.forEach(p => {
          p?.classList.add("hidden");
          p?.classList.remove("flex", "block");
        });
      } else if (clickStep === 2) {
        renderAreaFilterPanel();
        if (isMobile) {
          FilterDOM.areaFilterPanelMobile?.classList.remove("hidden");
          FilterDOM.areaFilterPanelMobile?.classList.add("block");
          FilterDOM.areaFilterPanelDesktop?.classList.add("hidden");
          FilterDOM.areaFilterPanelDesktop?.classList.remove("flex");
        } else {
          FilterDOM.areaFilterPanelDesktop?.classList.remove("hidden");
          FilterDOM.areaFilterPanelDesktop?.classList.add("flex");
          FilterDOM.areaFilterPanelMobile?.classList.add("hidden");
          FilterDOM.areaFilterPanelMobile?.classList.remove("block");
        }
      }
    } else {
      btn.style.color = "#94a3b8";
      btn.style.zIndex = "1";
    }
  });
};

const handleRankTabClick = (rank) => {
  const state = getState();
  const prevRank = state.filter.rank;

  const stored = JSON.parse(localStorage.getItem("huntUIState")) || {};
  let clickStep = 2;

  setFilter({
    rank,
    areaSets: state.filter.areaSets
  });

  localStorage.setItem("huntUIState", JSON.stringify({
    ...stored,
    rank,
    clickStep
  }));

  filterAndRender();
  updateFilterUI();
};

export function handleAreaFilterClick(e) {
  const btn = e.target.closest(".area-filter-btn");
  if (!btn) return;
  const customContainer = btn.closest(".area-grid-container");

  const state = getState();
  const uiRank = state.filter.rank;

  if (uiRank === 'ALL') {
    const currentSet = state.filter.allRankSet instanceof Set ? state.filter.allRankSet : new Set();
    const nextSet = new Set(currentSet);
    const val = btn.dataset.value;

    if (val === "ALL") {
      if (currentSet.size === 3) {
        nextSet.clear();
      } else {
        nextSet.add("S").add("A").add("F");
      }
    } else {
      if (nextSet.has(val)) nextSet.delete(val);
      else nextSet.add(val);
    }

    setFilter({
      rank: uiRank,
      allRankSet: nextSet
    });

    filterAndRender();
    renderAreaFilterPanel(customContainer);
    if (customContainer) renderAreaFilterPanel(); // グローバル設定用にも呼び出し
    return;
  }

  const targetRankKey = normalizeRank(uiRank);
  const allAreas = getAllAreas();

  const currentSet =
    state.filter.areaSets[targetRankKey] instanceof Set
      ? state.filter.areaSets[targetRankKey]
      : new Set();

  const nextAreaSets = { ...state.filter.areaSets };
  const val = btn.dataset.value || btn.dataset.area;

  if (val === "ALL") {
    if (currentSet.size === allAreas.length) {
      nextAreaSets[targetRankKey] = new Set();
    } else {
      nextAreaSets[targetRankKey] = new Set(allAreas);
    }
  } else {
    const area = val;
    const next = new Set(currentSet);
    if (next.has(area)) next.delete(area);
    else next.add(area);
    nextAreaSets[targetRankKey] = next;
  }

  setFilter({
    rank: uiRank,
    areaSets: nextAreaSets
  });

  filterAndRender();
  renderAreaFilterPanel(customContainer);
  if (customContainer) renderAreaFilterPanel(); // グローバル設定用にも呼び出し
}

export function filterMobsByRankAndArea(mobs) {
  const filter = getState().filter;
  const uiRank = filter.rank;
  const areaSets = filter.areaSets;
  const allRankSet = filter.allRankSet;
  const allExpansions = getAllAreas().length;

  const getMobRankKey = (rank) => {
    if (rank === 'S' || rank === 'A') return rank;
    if (rank === 'F') return 'F';
    if (rank.startsWith('B')) return 'A';
    return null;
  };

  return mobs.filter(m => {
    const mobRank = m.Rank;
    const mobExpansion = m.Expansion;
    const mobRankKey = getMobRankKey(mobRank);

    if (!mobRankKey) return false;

    const filterKey = mobRankKey;

    if (uiRank === 'ALL') {
      if (filterKey !== 'S' && filterKey !== 'A' && filterKey !== 'F') return false;

      if (allRankSet && allRankSet.size > 0 && allRankSet.size < 3) {
        if (!allRankSet.has(filterKey)) return false;
      }

      const targetSet =
        areaSets?.[filterKey] instanceof Set ? areaSets[filterKey] : new Set();

      if (targetSet.size === 0) return true;
      if (targetSet.size === allExpansions) return true;

      return targetSet.has(mobExpansion);
    } else {
      const isRankMatch =
        (uiRank === 'S' && mobRank === 'S') ||
        (uiRank === 'A' && (mobRank === 'A' || mobRank.startsWith('B'))) ||
        (normalizeRank(uiRank) === 'F' && mobRank === 'F');

      if (!isRankMatch) return false;

      const targetSet =
        areaSets?.[filterKey] instanceof Set ? areaSets[filterKey] : new Set();

      if (targetSet.size === 0) return true;
      if (targetSet.size === allExpansions) return true;

      return targetSet.has(mobExpansion);
    }
  });
}

function normalizeRank(rank) {
    if (rank === 'F.A.T.E.' || rank === 'FATE') return 'F';
    return rank;
}
