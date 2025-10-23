// filterUI.js

const renderRankTabs = () => {
    const state = getState();
    const rankList = ["ALL", "S", "A", "FATE"];
    const container = document.getElementById("rank-tabs");
    if (!container) return;
    container.innerHTML = "";

    container.className = "grid grid-cols-4 gap-2";

    rankList.forEach(rank => {
        const isSelected = state.filter.rank === rank;
        const btn = document.createElement("button");
        btn.dataset.rank = rank;
        btn.textContent = rank;
        btn.className = `tab-button px-4 py-1.5 text-sm rounded font-semibold text-white text-center transition ${isSelected ? "bg-green-500" : "bg-gray-500 hover:bg-gray-400"
            }`;
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
    const mobilePanel = document.getElementById("area-filter-panel-mobile");
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
    const desktopPanel = document.getElementById("area-filter-panel-desktop");
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

const sortAndRedistribute = debounce(() => filterAndRender(), 200);
const areaPanel = document.getElementById("area-filter-panel");

function toggleAreaFilterPanel(isDesktop) {
    if (isDesktop) {
        DOM.areaFilterPanelDesktop.classList.remove('hidden');
        DOM.areaFilterPanelMobile.classList.add('hidden');
        DOM.areaFilterWrapper.classList.remove('block');
    } else {
        DOM.areaFilterPanelDesktop.classList.add('hidden');

        if (DOM.areaFilterPanelMobile.classList.contains('hidden')) {
            DOM.areaFilterPanelMobile.classList.remove('hidden');
        } else {
            DOM.areaFilterPanelMobile.classList.add('hidden');
        }

        DOM.areaFilterWrapper.classList.add('block');
    }
}

function updateFilterUI() {
    const state = getState();
    const currentRankKeyForColor = FILTER_TO_DATA_RANK_MAP[state.filter.rank] || state.filter.rank;
    DOM.rankTabs.querySelectorAll(".tab-button").forEach(btn => {
        btn.classList.remove("bg-blue-800", "bg-red-800", "bg-yellow-800", "bg-indigo-800", "bg-gray-500", "hover:bg-gray-400"); // renderRankTabsと競合するため色を初期化
        btn.classList.add("bg-gray-500");
        if (btn.dataset.rank !== state.filter.rank) {
            btn.dataset.clickCount = "0";
        }
        if (btn.dataset.rank === state.filter.rank) {
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
            btn.classList.add("hover:bg-gray-400");
        }
    });
}
