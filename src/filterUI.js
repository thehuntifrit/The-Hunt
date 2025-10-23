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
    if (!mobilePanel) return; // DOM要素が取得できない場合は処理を中止
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
    if (!desktopPanel) return; // DOM要素が取得できない場合は処理を中止
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

// toggleAreaFilterPanel 関数は、DOM定義の不足と、クリック回数制御の仕様変更により不要になるため、
// 呼び出し元で削除を指示し、代わりに updateFilterUI にロジックを統合する
function toggleAreaFilterPanel(isDesktop) {
    // この関数は app.js 側で削除されることを前提に、ここでは空にするか、削除します。
    // ただし、import/export を維持するため、引数を削除しロジックを削除した形で残します。
    // console.warn("toggleAreaFilterPanel: クリック回数制御のため updateFilterUI にロジックを統合しました。");
}

function updateFilterUI() {
    const state = getState();
    const currentRankKeyForColor = FILTER_TO_DATA_RANK_MAP[state.filter.rank] || state.filter.rank;

    DOM.rankTabs.querySelectorAll(".tab-button").forEach(btn => {
        // [仕様 2.1. 色の競合解消]: bg-green-500 を削除対象に追加
        btn.classList.remove("bg-blue-800", "bg-red-800", "bg-yellow-800", "bg-indigo-800", "bg-gray-500", "hover:bg-gray-400", "bg-green-500");
        btn.classList.add("bg-gray-500");
        
        // [仕様 2.2. クリック回数管理]
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
            // 選択中でないタブの場合: クリック回数は 1 にリセット
            clickCount = 1; // ランク切り替え時は 1 に設定 (1回目のクリックに相当)
            btn.classList.add("hover:bg-gray-400");
        }

        btn.dataset.clickCount = String(clickCount);

        // [仕様 2.3. パネル表示制御]
        if (btn.dataset.rank === state.filter.rank) {
            if (DOM.areaFilterPanelMobile) {
                // モバイル用パネルは count=2 のときのみ表示
                if (clickCount === 2) {
                    DOM.areaFilterPanelMobile.classList.remove('hidden'); // 開く
                } else {
                    DOM.areaFilterPanelMobile.classList.add('hidden');      // 閉じる
                }
            }
        } else {
            // 選択中のタブ以外のボタンが押された場合（ランク切り替え時）は、パネルを閉じる状態にする
            if (DOM.areaFilterPanelMobile) {
                DOM.areaFilterPanelMobile.classList.add('hidden');
            }
        }
    });
    // デスクトップ用パネルは常に非表示
    if (DOM.areaFilterPanelDesktop) {
        DOM.areaFilterPanelDesktop.classList.add('hidden');
    }
}
