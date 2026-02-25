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
  const rankList = ["ALL", "S", "A", "FATE"];
  const container = FilterDOM.rankTabs;
  if (!container) return;

  container.innerHTML = "";

  rankList.forEach(rank => {
    const isSelected = state.filter.rank === rank;
    const btn = document.createElement("button");
    btn.dataset.rank = rank;
    btn.textContent = rank;

    btn.className =
      `tab-button filter-tab-base text-white transition ` +
      (isSelected
        ? (rank === "ALL" ? "bg-rose-500" : rank === "S" ? "bg-rank-s" : rank === "A" ? "bg-rank-a" : rank === "FATE" ? "bg-rank-f" : "bg-green-500")
        : "bg-gray-500 hover:bg-gray-400");

    btn.addEventListener("click", () => {
      handleRankTabClick(rank);
    });

    container.appendChild(btn);
  });
};

export const renderAreaFilterPanel = () => {
  const state = getState();
  const uiRank = state.filter.rank;
  const targetRankKey = uiRank === 'FATE' ? 'F' : uiRank;

  let items = [];
  let currentSet = new Set();
  let isAllSelected = false;

  if (uiRank === 'ALL') {
    items = ["S", "A", "F"];
    currentSet = state.filter.allRankSet instanceof Set ? state.filter.allRankSet : new Set();
    isAllSelected = items.length > 0 && currentSet.size === items.length;
  } else {
    items = getAllAreas();
    currentSet =
      state.filter.areaSets[targetRankKey] instanceof Set
        ? state.filter.areaSets[targetRankKey]
        : new Set();
    isAllSelected = items.length > 0 && currentSet.size === items.length;

    const expansionEntries = Object.entries(EXPANSION_MAP).sort((a, b) => b[0] - a[0]);
    items = expansionEntries.map(e => e[1]);
  }

  const createButton = (label, isAll, isSelected, isDesktop) => {
    const btn = document.createElement("button");
    btn.textContent = label;

    let btnClass = 'filter-tab-base text-white transition';

    if (isAll) {
      btn.className = `area-filter-btn ${btnClass} ${isAllSelected ? "bg-red-500" : "bg-gray-500 hover:bg-gray-400"} ${isDesktop ? '' : 'w-[44px]'}`;
      btn.dataset.value = "ALL";
    } else {
      btn.className = `area-filter-btn ${btnClass} ${isSelected ? "bg-green-500" : "bg-gray-500 hover:bg-gray-400"} ${isDesktop ? '' : 'w-[44px]'}`;
      btn.dataset.value = label;
    }
    return btn;
  };

  const createPanelContent = (isDesktop) => {
    const panel = document.createDocumentFragment();

    items.forEach(item => {
      const isSelected = currentSet.has(item);
      panel.appendChild(createButton(item, false, isSelected, isDesktop));
    });

    const allBtn = createButton(isAllSelected ? "解除" : "全選", true, false, isDesktop);
    panel.appendChild(allBtn);

    return panel;
  };

  const mobilePanel = FilterDOM.areaFilterPanelMobile?.querySelector('.flex-wrap');
  const desktopPanel = FilterDOM.areaFilterPanelDesktop?.querySelector('.flex-wrap');

  if (mobilePanel) {
    mobilePanel.innerHTML = "";
    mobilePanel.appendChild(createPanelContent(false));
  }
  if (desktopPanel) {
    desktopPanel.innerHTML = "";
    desktopPanel.appendChild(createPanelContent(true));
  }
};

export const updateFilterUI = () => {
  const state = getState();
  const rankTabs = FilterDOM.rankTabs;
  if (!rankTabs) return;

  const stored = JSON.parse(localStorage.getItem("huntUIState")) || {};
  const clickStep = stored.clickStep || 1;
  const isMobile = window.matchMedia("(max-width: 1023px)").matches;

  rankTabs.querySelectorAll(".tab-button").forEach(btn => {
    const btnRank = btn.dataset.rank;
    const isCurrent = btnRank === state.filter.rank;

    btn.classList.remove(
      "bg-gray-500", "hover:bg-gray-400",
      "bg-rose-500", "bg-rank-s", "bg-rank-a", "bg-rank-f"
    );

    if (isCurrent) {
      btn.classList.add(
        btnRank === "ALL" ? "bg-rose-500"
          : btnRank === "S" ? "bg-rank-s"
            : btnRank === "A" ? "bg-rank-a"
              : btnRank === "FATE" ? "bg-rank-f"
                : "bg-gray-800"
      );

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
      btn.classList.add("bg-gray-500", "hover:bg-gray-400");
    }
  });
};

const handleRankTabClick = (rank) => {
  const state = getState();
  const prevRank = state.filter.rank;

  const stored = JSON.parse(localStorage.getItem("huntUIState")) || {};
  let clickStep = stored.clickStep || 1;

  if (prevRank !== rank) {
    clickStep = 1;
  } else {
    if (clickStep === 1) clickStep = 2;
    else if (clickStep === 2) clickStep = 3;
    else clickStep = 2;
  }

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
    renderAreaFilterPanel();
    return;
  }

  const targetRankKey = uiRank === 'FATE' ? 'F' : uiRank;
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
  renderAreaFilterPanel();
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
        (uiRank === 'FATE' && mobRank === 'F');

      if (!isRankMatch) return false;

      const targetSet =
        areaSets?.[filterKey] instanceof Set ? areaSets[filterKey] : new Set();

      if (targetSet.size === 0) return true;
      if (targetSet.size === allExpansions) return true;

      return targetSet.has(mobExpansion);
    }
  });
}
