// filterUI.js

import { getState, FILTER_TO_DATA_RANK_MAP, setFilter } from "./dataManager.js";
import { EXPANSION_MAP } from "./dataManager.js";
import { filterAndRender } from "./uiRender.js";

const DOM = {
    rankTabs: document.getElementById('rank-tabs'),
    areaFilterPanelMobile: document.getElementById('area-filter-panel-mobile'),
    areaFilterPanelDesktop: document.getElementById('area-filter-panel-desktop')
};

// 既存コードを維持: Setを使ってエリア名を生成
const getAllAreas = () => {
    return Array.from(new Set(Object.values(EXPANSION_MAP)));
};

const renderRankTabs = () => {
    const state = getState();
    const rankList = ["ALL", "S", "A", "FATE"];
    const container = DOM.rankTabs;
    if (!container) return;
    container.innerHTML = "";
    container.className = "grid grid-cols-4 gap-2";

    const storedState = JSON.parse(localStorage.getItem('huntFilterState')) || {};

    rankList.forEach(rank => {
        const isSelected = state.filter.rank === rank;
        const btn = document.createElement("button");
        btn.dataset.rank = rank;
        btn.textContent = rank;

        btn.className = `tab-button px-2 py-1 text-sm rounded font-semibold text-white text-center transition ${isSelected ? "bg-green-500" : "bg-gray-500 hover:bg-gray-400"}`;

        const clickCount = (rank === state.filter.rank) ? (storedState.clickCount || '1') : '1';
        btn.dataset.clickCount = clickCount;

        container.appendChild(btn);
    });
};

const renderAreaFilterPanel = () => {
    const state = getState();
    const uiRank = state.filter.rank;

    if (uiRank === 'ALL') return;

    const targetRankKey = uiRank === 'FATE' ? 'F' : uiRank;
    const areas = getAllAreas();

    const currentSet = state.filter.areaSets[targetRankKey] instanceof Set ? state.filter.areaSets[targetRankKey] : new Set();
    const isAllSelected = areas.length > 0 && currentSet.size === areas.length;

    // 既存コードを維持: ソートロジック
    const sortedAreas = areas.sort((a, b) => {
        const indexA = Object.values(EXPANSION_MAP).indexOf(a);
        const indexB = Object.values(EXPANSION_MAP).indexOf(b);
        return indexB - indexA;
    });

    const createButton = (area, isAll, isSelected) => {
        const btn = document.createElement("button");
        btn.textContent = area;

        // UI維持: w-auto を維持
        const btnClass = 'py-1 px-2 text-sm rounded font-semibold text-white text-center transition w-auto';

        if (isAll) {
            btn.className = `area-filter-btn ${btnClass} ${isAllSelected ? "bg-red-500" : "bg-gray-500 hover:bg-gray-400"}`;
            btn.dataset.area = "ALL";
        } else {
            btn.className = `area-filter-btn ${btnClass} ${isSelected ? "bg-green-500" : "bg-gray-500 hover:bg-gray-400"}`;
            btn.dataset.area = area;
        }
        return btn;
    };

    const createPanelContent = (isDesktop) => {
        const panel = document.createDocumentFragment();

        const allBtn = createButton(isAllSelected ? "全解除" : "全選択", true, false);
        panel.appendChild(allBtn);

        // UI維持: モバイルダミー要素
        if (!isDesktop) {
            const dummy = document.createElement("div");
            dummy.className = "w-full";
            panel.appendChild(dummy);
        }

        sortedAreas.forEach(area => {
            const isSelected = currentSet.has(area);
            panel.appendChild(createButton(area, false, isSelected));
        });

        return panel;
    };

    const mobilePanel = DOM.areaFilterPanelMobile?.querySelector('div');
    const desktopPanel = DOM.areaFilterPanelDesktop?.querySelector('div');

    if (mobilePanel) {
        mobilePanel.innerHTML = "";
        mobilePanel.appendChild(createPanelContent(false));
    }

    if (desktopPanel) {
        desktopPanel.innerHTML = "";
        desktopPanel.appendChild(createPanelContent(true));
    }
};

const updateFilterUI = () => {
    const state = getState();
    const currentRankKeyForColor = FILTER_TO_DATA_RANK_MAP[state.filter.rank] || state.filter.rank;
    const rankTabs = DOM.rankTabs;
    if (!rankTabs) return;

    const storedFilterState = JSON.parse(localStorage.getItem('huntFilterState')) || {};
    const prevRank = storedFilterState.rank; // 前回選択されていたランク

    rankTabs.querySelectorAll(".tab-button").forEach(btn => {
        const btnRank = btn.dataset.rank;
        const isCurrentRank = btnRank === state.filter.rank;

        btn.classList.remove("bg-blue-800", "bg-red-800", "bg-yellow-800", "bg-indigo-800", "bg-gray-500", "hover:bg-gray-400", "bg-green-500");
        
        let clickCount = parseInt(btn.dataset.clickCount, 10) || 1;

        if (isCurrentRank) {
            
            // 【バグ修正統合ロジック】: ランク切り替え時にクリックカウントを強制的に1に戻す
            if (prevRank !== btnRank) {
                clickCount = 1; // ランクが切り替わったら、無条件で1（非表示）から開始
            } else {
                // 同じランクを再度クリックした場合、現在のUI上のclickCountを巡回させるロジックを維持
                if (clickCount === 1) {
                    clickCount = 2; // 1クリック目 -> 2クリック目 (表示)
                } else {
                    clickCount = (clickCount === 2) ? 3 : 2; // 3クリック目(非表示)と4クリック目(表示)を巡回
                }
            }
            
            // 色の変更ロジックは維持
            btn.classList.remove("bg-gray-500", "hover:bg-gray-400");
            btn.classList.add(
                btnRank === "ALL" ? "bg-blue-800"
                    : currentRankKeyForColor === "S" ? "bg-red-800"
                        : currentRankKeyForColor === "A" ? "bg-yellow-800"
                            : currentRankKeyForColor === "F" ? "bg-indigo-800"
                                : "bg-gray-800"
            );

            // パネル表示制御ロジックは維持
            const panels = [DOM.areaFilterPanelMobile, DOM.areaFilterPanelDesktop];
            
            if (btnRank === 'ALL' || clickCount !== 2) {
                panels.forEach(p => p?.classList.add('hidden'));
            } else if (clickCount === 2) {
                renderAreaFilterPanel();
                panels.forEach(p => p?.classList.remove('hidden'));
            }

            // ローカルストレージに新しい状態を保存
            const newFilterState = { ...storedFilterState, rank: btnRank, clickCount: clickCount };
            localStorage.setItem("huntFilterState", JSON.stringify(newFilterState));

        } else {
          
            // 現在のランクではないタブはクリックカウントを1にリセット（UI維持）
            clickCount = 1; 
            btn.classList.add("bg-gray-500", "hover:bg-gray-400");
            
            const panels = [DOM.areaFilterPanelMobile, DOM.areaFilterPanelDesktop];
            panels.forEach(p => p?.classList.add('hidden'));
        }

        btn.dataset.clickCount = String(clickCount);
    });
};

function handleAreaFilterClick(e) {
    const btn = e.target.closest(".area-filter-btn");
    if (!btn) return;

    const state = getState();
    const uiRank = state.filter.rank;
    const targetRankKey = uiRank === 'FATE' ? 'F' : uiRank;
    const allAreas = getAllAreas();

    if (uiRank === 'ALL') return;

    // 既存コードを維持: Set操作ロジック
    const currentSet = state.filter.areaSets[targetRankKey] instanceof Set ? state.filter.areaSets[targetRankKey] : new Set();
    const nextAreaSets = { ...state.filter.areaSets };

    if (btn.dataset.area === "ALL") {
        if (currentSet.size === allAreas.length) {
            nextAreaSets[targetRankKey] = new Set();
        } else {
            nextAreaSets[targetRankKey] = new Set(allAreas);
        }
    } else {
        const area = btn.dataset.area;
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

// 【フィルタリングバグ修正統合ロジック】: ALLモードでのエリアフィルタリングを修正
function filterMobsByRankAndArea(mobs) {
    const filter = getState().filter;
    const uiRank = filter.rank;
    const areaSets = filter.areaSets;
    const allExpansions = getAllAreas().length;

    const getMobRankKey = (rank) => {
        if (rank === 'S' || rank === 'A') return rank;
        if (rank === 'F') return 'F';
        if (rank.startsWith('B')) return 'A'; 
        return null;
    };

    return mobs.filter(m => {
        const mobRank = m.Rank;
        const mobExpansion = m.Expansion; // モブデータ内の拡張エリア名
        const mobRankKey = getMobRankKey(mobRank);

        if (!mobRankKey) return false;

        const filterKey = mobRankKey; 

        // 1. ALLタブ選択時のロジック統合
        if (uiRank === 'ALL') {
            if (filterKey !== 'S' && filterKey !== 'A' && filterKey !== 'F') return false; 
            
            const targetSet = areaSets[filterKey];

            // フィルタセットが存在しない、または空の場合は、そのランクは全て表示
            if (!(targetSet instanceof Set) || targetSet.size === 0) return true;
            // 全選択されている場合も全て表示
            if (targetSet.size === allExpansions) return true;

            // 選択されたエリアに含まれているか判定
            return targetSet.has(mobExpansion);

        } 
        // 2. S/A/FATEタブ選択時のロジック統合
        else {

            // ランクの一致判定（Bモブの扱いを考慮）
            const isRankMatch = (uiRank === 'S' && mobRank === 'S') ||
                (uiRank === 'A' && (mobRank === 'A' || mobRank.startsWith('B'))) ||
                (uiRank === 'FATE' && mobRank === 'F');

            if (!isRankMatch) return false;

            // 該当ランクのフィルタセットを参照
            const targetSet = areaSets[filterKey];

            // フィルタセットが存在しない、または空の場合は、そのランクのモブは全て表示
            if (!(targetSet instanceof Set) || targetSet.size === 0) return true;
            // 全選択されている場合も全て表示
            if (targetSet.size === allExpansions) return true;

            // 選択されたエリアに含まれているか判定
            return targetSet.has(mobExpansion);
        }
    });
}

export { renderRankTabs, renderAreaFilterPanel, updateFilterUI, handleAreaFilterClick, filterMobsByRankAndArea };
