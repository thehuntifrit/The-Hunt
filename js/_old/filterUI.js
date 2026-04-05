import { getState, EXPANSION_MAP, setFilter } from "./dataManager.js";
import { filterAndRender } from "./uiRender.js";

const FilterDOM = {
  areaFilterPanelMobile: document.getElementById('area-filter-panel-mobile'),
  areaFilterPanelDesktop: document.getElementById('area-filter-panel-desktop')
};

const getAllAreas = () => {
  return Array.from(new Set(Object.values(EXPANSION_MAP)));
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

export const handleRankTabClick = (rank) => {
  const state = getState();
  const prevRank = state.filter.rank;
  let clickStep = state.filter.clickStep || 1;

  if (rank === prevRank) {
    if (clickStep === 1) clickStep = 2;
    else if (clickStep === 2) clickStep = 3;
    else if (clickStep === 3) clickStep = 2;

    setFilter({ clickStep });
  } else {
    clickStep = 1;
    setFilter({
      rank,
      clickStep,
      areaSets: state.filter.areaSets
    });
  }

  filterAndRender();
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
    if (customContainer) renderAreaFilterPanel();
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
  if (customContainer) renderAreaFilterPanel();
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
