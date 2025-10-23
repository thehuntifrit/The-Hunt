// filterUI.js

import { getState, FILTER_TO_DATA_RANK_MAP } from "./dataManager.js";
import { EXPANSION_MAP } from "./dataManager.js";

const DOM = {
    rankTabs: document.getElementById('rank-tabs'),
    areaFilterPanelMobile: document.getElementById('area-filter-panel-mobile'),
    areaFilterPanelDesktop: document.getElementById('area-filter-panel-desktop')
};

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
        
        btn.className = `tab-button px-4 py-1.5 text-sm rounded font-semibold text-white text-center transition ${isSelected ? "bg-green-500" : "bg-gray-500 hover:bg-gray-400"}`;
        
        const clickCount = JSON.parse(localStorage.getItem('huntFilterState'))?.rank === rank ? '1' : '0';
        btn.dataset.clickCount = clickCount;

        container.appendChild(btn);
    });
};

const renderAreaFilterPanel = () => {
    const state = getState();
    const uiRank = state.filter.rank;
    const dataRank = FILTER_TO_DATA_RANK_MAP[uiRank] || uiRank;

    const areas = state.mobs
        .filter(m => (dataRank === "A" || dataRank === "F") ? (m.Rank === dataRank || m.Rank.startsWith("B")) : (m.Rank === dataRank))
        .reduce((set, m) => {
            const mobExpansion = m.Rank.startsWith("B")
                ? state.mobs.find(x => x.No === m.related_mob_no)?.Expansion || m.Expansion
                : m.Expansion;
            if (mobExpansion) set.add(mobExpansion);
            return set;
        }, new Set());

    const currentSet = state.filter.areaSets[uiRank] instanceof Set ? state.filter.areaSets[uiRank] : new Set();
    const isAllSelected = areas.size > 0 && currentSet.size === areas.size;

    const sortedAreas = Array.from(areas).sort((a, b) => {
        const indexA = Object.values(EXPANSION_MAP).indexOf(a);
        const indexB = Object.values(EXPANSION_MAP).indexOf(b);
        return indexB - indexA;
    });

    // スマホ用：横いっぱい2列
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

    // PC用：ランクボタン下に収まる2列（ボタン幅制限）
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

const updateFilterUI = () => {
    const state = getState();
    const currentRankKeyForColor = FILTER_TO_DATA_RANK_MAP[state.filter.rank] || state.filter.rank;

    DOM.rankTabs.querySelectorAll(".tab-button").forEach(btn => {
        btn.classList.remove("bg-blue-800", "bg-red-800", "bg-yellow-800", "bg-indigo-800", "bg-gray-500", "hover:bg-gray-400", "bg-green-500");
        btn.classList.add("bg-gray-500");
        
        let clickCount = parseInt(btn.dataset.clickCount, 10) || 0;

        if (btn.dataset.rank === state.filter.rank) {
            // 選択中のタブの場合: クリック回数をインクリメントし、3を超えたら 1 にリセット
            clickCount = clickCount + 1;
            if (clickCount > 3) clickCount = 1;

            btn.classList.remove("bg-gray-500");
            const rank = btn.dataset.rank;
            btn.classList.add(
                rank === "ALL" ? "bg-blue-800"
                    : currentRankKeyForColor === "S" ? "bg-red-800"
                        : currentRankKeyForColor === "A" ? "bg-yellow-800"
                            : currentRankKeyForColor === "F" ? "bg-indigo-800"
                                : "bg-gray-800"
            );
        } else {
            clickCount = 1; // ランク切り替え時は 1 に設定 (1回目のクリックに相当)
            btn.classList.add("hover:bg-gray-400");
        }

        btn.dataset.clickCount = String(clickCount);
        if (btn.dataset.rank === state.filter.rank) {
            if (DOM.areaFilterPanelMobile) {
                if (clickCount === 2) {
                    DOM.areaFilterPanelMobile.classList.remove('hidden'); // 開く
                } else {
                    DOM.areaFilterPanelMobile.classList.add('hidden');      // 閉じる
                }
            }
        } else {
            if (DOM.areaFilterPanelMobile) {
                DOM.areaFilterPanelMobile.classList.add('hidden');
            }
        }
    });
    if (DOM.areaFilterPanelDesktop) {
        DOM.areaFilterPanelDesktop.classList.add('hidden');
    }
};

export { renderRankTabs, renderAreaFilterPanel, updateFilterUI };
