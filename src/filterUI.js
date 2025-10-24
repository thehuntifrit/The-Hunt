// filterUI.js

import { getState, FILTER_TO_DATA_RANK_MAP, setFilter } from "./dataManager.js";
import { EXPANSION_MAP } from "./dataManager.js";
import { filterAndRender } from "./uiRender.js"; 

const DOM = {
    rankTabs: document.getElementById('rank-tabs'),
    areaFilterPanelMobile: document.getElementById('area-filter-panel-mobile'),
    areaFilterPanelDesktop: document.getElementById('area-filter-panel-desktop')
};

// ----------------------------------------------------------------------
// 1. ランクタブの描画
// ----------------------------------------------------------------------
const renderRankTabs = () => {
    const state = getState();
    const rankList = ["ALL", "S", "A", "FATE"];
    const container = DOM.rankTabs;
    if (!container) return;
    container.innerHTML = "";

    container.className = "grid grid-cols-4 gap-2";

    rankList.forEach(rank => {
        const isSelected = state.filter.rank === rank;
        const btn = document.createElement("button");
        btn.dataset.rank = rank;
        btn.textContent = rank;

        btn.className = `tab-button px-2 py-1 text-sm rounded font-semibold text-white text-center transition ${isSelected ? "bg-green-500" : "bg-gray-500 hover:bg-gray-400"}`;

        // UI開閉不具合修正のため、クリックカウントの初期値を1とする
        const currentFilterState = JSON.parse(localStorage.getItem('huntFilterState'));
        const clickCount = (rank === state.filter.rank && currentFilterState && currentFilterState.rank === rank) ? currentFilterState.clickCount || '1' : '1';

        btn.dataset.clickCount = clickCount;

        container.appendChild(btn);
    });
};

// ----------------------------------------------------------------------
// 2. エリアフィルターパネルの描画
// ----------------------------------------------------------------------
const renderAreaFilterPanel = () => {
    const state = getState();
    const uiRank = state.filter.rank;
    const areas = Array.from(new Set(Object.values(EXPANSION_MAP)));
    const targetRankKey = uiRank === 'FATE' ? 'F' : uiRank;
    const currentSet = state.filter.areaSets[targetRankKey] instanceof Set ? state.filter.areaSets[targetRankKey] : new Set();
    const isAllSelected = areas.length > 0 && currentSet.size === areas.length;

    const sortedAreas = Array.from(areas).sort((a, b) => {
        const indexA = Object.values(EXPANSION_MAP).indexOf(a);
        const indexB = Object.values(EXPANSION_MAP).indexOf(b);
        return indexB - indexA;
    });

    // スマホ用：横いっぱい2列 (UI構造維持)
    const mobilePanel = DOM.areaFilterPanelMobile;
    if (!mobilePanel) return;
    mobilePanel.innerHTML = "";
    mobilePanel.className = "grid grid-cols-2 gap-2";

    const allBtnMobile = document.createElement("button");
    allBtnMobile.textContent = isAllSelected ? "全解除" : "全選択";
    allBtnMobile.className = `area-filter-btn py-1 text-xs rounded font-semibold text-white text-center transition w-full ${isAllSelected ? "bg-red-500" : "bg-gray-500 hover:bg-gray-400"}`;
    allBtnMobile.dataset.area = "ALL";
    mobilePanel.appendChild(allBtnMobile);

    sortedAreas.forEach(area => {
        const isSelected = currentSet.has(area);
        const btn = document.createElement("button");
        btn.textContent = area;
        btn.className = `area-filter-btn py-1 text-xs rounded font-semibold text-white text-center transition w-full ${isSelected ? "bg-green-500" : "bg-gray-500 hover:bg-gray-400"}`;
        btn.dataset.area = area;
        mobilePanel.appendChild(btn);
    });

    // PC用：ランクボタン下に収まる2列（ボタン幅制限） (UI構造維持)
    const desktopPanel = DOM.areaFilterPanelDesktop;
    if (!desktopPanel) return;
    desktopPanel.innerHTML = "";
    desktopPanel.className = "grid grid-cols-2 gap-2";

    const allBtnDesktop = document.createElement("button");
    allBtnDesktop.textContent = isAllSelected ? "全解除" : "全選択";
    allBtnDesktop.className = `area-filter-btn py-1 text-xs rounded font-semibold text-white text-center transition w-full max-w-[8rem] ${isAllSelected ? "bg-red-500" : "bg-gray-500 hover:bg-gray-400"}`;
    allBtnDesktop.dataset.area = "ALL";
    desktopPanel.appendChild(allBtnDesktop);

    const spacer = document.createElement("div");
    spacer.className = "hidden lg:block";
    desktopPanel.appendChild(spacer);

    sortedAreas.forEach(area => {
        const isSelected = currentSet.has(area);
        const btn = document.createElement("button");
        btn.textContent = area;
        btn.className = `area-filter-btn py-1 text-xs rounded font-semibold text-white text-center transition w-full max-w-[8rem] ${isSelected ? "bg-green-500" : "bg-gray-500 hover:bg-gray-400"}`;
        btn.dataset.area = area;
        desktopPanel.appendChild(btn);
    });
};

// ----------------------------------------------------------------------
// 3. UIの更新制御
// ----------------------------------------------------------------------
const updateFilterUI = () => {
    const state = getState();
    const currentRankKeyForColor = FILTER_TO_DATA_RANK_MAP[state.filter.rank] || state.filter.rank;
    const rankTabs = DOM.rankTabs;
    if (!rankTabs) return;

    const storedFilterState = JSON.parse(localStorage.getItem('huntFilterState')) || {};
    const prevRank = storedFilterState.rank;

    rankTabs.querySelectorAll(".tab-button").forEach(btn => {
        btn.classList.remove("bg-blue-800", "bg-red-800", "bg-yellow-800", "bg-indigo-800", "bg-gray-500", "hover:bg-gray-400", "bg-green-500");
        btn.classList.add("bg-gray-500", "hover:bg-gray-400");

        let clickCount = parseInt(btn.dataset.clickCount, 10) || 1; 

        if (btn.dataset.rank === state.filter.rank) {
            
            if (prevRank !== state.filter.rank) {
                clickCount = 1; 
            } else {
                clickCount = (clickCount % 3) + 1; 
            }
            
            btn.classList.remove("bg-gray-500", "hover:bg-gray-400");
            const rank = btn.dataset.rank;

            btn.classList.add(
                rank === "ALL" ? "bg-blue-800"
                    : currentRankKeyForColor === "S" ? "bg-red-800"
                        : currentRankKeyForColor === "A" ? "bg-yellow-800"
                            : currentRankKeyForColor === "F" ? "bg-indigo-800"
                                : "bg-gray-800"
            );

            if (DOM.areaFilterPanelMobile && DOM.areaFilterPanelDesktop) {
                const panels = [DOM.areaFilterPanelMobile, DOM.areaFilterPanelDesktop];
                if (clickCount === 2) {
                    renderAreaFilterPanel();
                    panels.forEach(p => p.classList.remove('hidden'));
                } else {
                    panels.forEach(p => p.classList.add('hidden'));
                }
            } else if (DOM.areaFilterPanelMobile) {
                if (clickCount === 2) {
                    renderAreaFilterPanel();
                    DOM.areaFilterPanelMobile.classList.remove('hidden');
                } else {
                    DOM.areaFilterPanelMobile.classList.add('hidden');
                }
            }

            // ローカルストレージに新しい状態を保存
            const newFilterState = { ...storedFilterState, rank: state.filter.rank, clickCount: clickCount };
            localStorage.setItem("huntFilterState", JSON.stringify(newFilterState));

        } else {
            // 選択されていないタブはクリック数を 1 にリセット
            clickCount = 1; 
            btn.classList.add("hover:bg-gray-400");
            
            // 選択されていないランクの場合、パネルは非表示
            if (DOM.areaFilterPanelMobile) DOM.areaFilterPanelMobile.classList.add('hidden');
            if (DOM.areaFilterPanelDesktop) DOM.areaFilterPanelDesktop.classList.add('hidden');
        }

        btn.dataset.clickCount = String(clickCount);
    });
};

// ----------------------------------------------------------------------
// 4. エリアフィルターのクリック処理
// ----------------------------------------------------------------------
function handleAreaFilterClick(e) {
    const btn = e.target.closest(".area-filter-btn");
    if (!btn) return;

    const state = getState();
    const uiRank = state.filter.rank;
    const targetRankKey = uiRank === 'FATE' ? 'F' : uiRank;
    const allAreas = Array.from(new Set(Object.values(EXPANSION_MAP)));

    const currentSet = state.filter.areaSets[targetRankKey] instanceof Set ? state.filter.areaSets[targetRankKey] : new Set();

    if (btn.dataset.area === "ALL") {
        if (currentSet.size === allAreas.length) {
            state.filter.areaSets[targetRankKey] = new Set();
        } else {
            state.filter.areaSets[targetRankKey] = new Set(allAreas);
        }
    } else {
        const area = btn.dataset.area;
        const next = new Set(currentSet);
        if (next.has(area)) next.delete(area);
        else next.add(area);
        state.filter.areaSets[targetRankKey] = next;
    }

    setFilter({
        rank: uiRank,
        areaSets: state.filter.areaSets
    });

    // filterAndRender() を呼び出し、モブリストを更新
    filterAndRender();
    // パネルの状態を更新 (全選択/全解除ボタンの色など)
    renderAreaFilterPanel();
}

// ----------------------------------------------------------------------
// 5. モブ絞り込みロジック
// ----------------------------------------------------------------------
function filterMobsByRankAndArea(mobs) {
    const filter = getState().filter;
    const uiRank = filter.rank;
    const areaSets = filter.areaSets;
    const allExpansions = Object.values(EXPANSION_MAP).length;

    return mobs.filter(m => {
        const mobRank = m.Rank;
        const mobExpansion = m.Expansion;
        const mobRankKey = mobRank === 'S' || mobRank === 'A' || mobRank.startsWith('B') ? (mobRank.startsWith('B') ? 'A' : mobRank) : 'F';

        if (uiRank === 'ALL') {
            const isRelevantRank = mobRankKey === 'S' || mobRankKey === 'A' || mobRankKey === 'F';
            if (!isRelevantRank) return true;
          
            const targetSet = areaSets[mobRankKey];

            if (!(targetSet instanceof Set) || targetSet.size === 0) return true;
            if (targetSet.size === allExpansions) return true;

            return targetSet.has(mobExpansion);

        } else {
            
            const isRankMatch = (uiRank === 'S' && mobRank === 'S') ||
                                (uiRank === 'A' && (mobRank === 'A' || mobRank.startsWith('B'))) ||
                                (uiRank === 'FATE' && mobRank === 'F');
            
            if (!isRankMatch) return false;
            const targetSet = areaSets[mobRankKey];
            
            if (!(targetSet instanceof Set) || targetSet.size === 0) return true;
            if (targetSet.size === allExpansions) return true;

            return targetSet.has(mobExpansion);
        }
    });
}

export { renderRankTabs, renderAreaFilterPanel, updateFilterUI, handleAreaFilterClick, filterMobsByRankAndArea };
