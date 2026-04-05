import { getState, setFilter, EXPANSION_MAP, setNotificationEnabled } from "./dataManager.js";
import { filterAndRender } from "./app.js";
import { openUserManual } from "./readme.js";
import { cloneTemplate, escapeHtml } from "./mobCard.js";

// ─── 定数・DOM ──────────────────────────────────────────

const FilterDOM = {
    areaFilterPanelMobile: document.getElementById('area-filter-panel-mobile'),
    areaFilterPanelDesktop: document.getElementById('area-filter-panel-desktop')
};

const SOUND_FILE = "./sound/01 FFXIV_Linkshell_Transmission.mp3";

const NAV_ITEMS = [
    { id: "error", icon: "⚠️", label: "エラー", type: "panel" },
    { id: "telop", icon: "📢", label: "告知", type: "panel" },
    { id: "maintenance", icon: "🛠️", label: "メンテ", type: "panel" },
    { id: "rank", icon: "🏷️", label: "選択", type: "panel" },
    { id: "divider", type: "divider" },
    { id: "manual", icon: "📋", label: "説明", type: "panel" },
    { id: "notify", icon: "🔔", label: "通知", type: "toggle" }
];

let audio = null;
const notifiedCycles = new Set();
let manualLoaded = false;
let currentPanel = null;
let mobileCurrentPanel = null;
const errorLog = [];
const MAX_ERROR_LOG = 50;

// ─── 通知 ───────────────────────────────────────────────

export function initNotification() {
    audio = new Audio(SOUND_FILE);
    audio.load();

    const sidebarToggle = document.getElementById('sidebar-notification-toggle');
    const mobileToggle = document.getElementById('mobile-notification-toggle');
    const toggles = [sidebarToggle, mobileToggle].filter(t => t !== null);

    const isEnabled = getState().notificationEnabled;

    toggles.forEach(t => {
        t.checked = isEnabled;
        t.addEventListener('change', (e) => {
            const enabled = e.target.checked;

            toggles.forEach(other => {
                if (other !== t) other.checked = enabled;
            });

            setNotificationEnabled(enabled);

            if (enabled) {
                requestNotificationPermission();
                playNotificationSound(true);
            }
        });
    });
}

async function requestNotificationPermission() {
    if ("Notification" in window) {
        if (Notification.permission !== "granted" && Notification.permission !== "denied") {
            await Notification.requestPermission();
        }
    }
}

export function playNotificationSound(isSilent = false) {
    const isMobile = window.innerWidth < 1024;
    if (!isMobile) return;

    if (!audio) return;

    if (isSilent) {
        audio.muted = true;
        audio.play().then(() => {
            audio.pause();
            audio.muted = false;
        }).catch(() => { });
        return;
    }

    audio.currentTime = 0;
    try {
        audio.play().catch(err => {
            console.error("通知音の再生に失敗しました:", err);
        });
    } catch (err) {
        console.error("通知音の再生エラー:", err);
    }
}

export async function sendBrowserNotification(title, body) {
    if (!getState().notificationEnabled) return;
    if (!("Notification" in window) || Notification.permission !== "granted") return;

    const options = { body, icon: "./icon/The_Hunt.png" };

    try {
        if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
            const reg = await navigator.serviceWorker.ready;
            await reg.showNotification(title, options);
        } else {
            new Notification(title, options);
        }
    } catch (err) {
        console.error("システム通知の表示に失敗しました:", err);
    }
}

export function checkAndNotify(mob) {
    const state = getState();
    if (!state.notificationEnabled) return;

    const info = mob.repopInfo;
    if (!info || !info.nextConditionSpawnDate || !info.conditionWindowEnd) return;

    const now = Date.now();
    const spawnTime = info.nextConditionSpawnDate.getTime();
    const endTime = info.conditionWindowEnd.getTime();
    const oneMinBefore = spawnTime - 120000;

    const cycleKey = `${mob.No}-${spawnTime}`;

    const shouldNotify = (now >= oneMinBefore && now <= endTime);

    if (shouldNotify && !notifiedCycles.has(cycleKey)) {
        const title = `【POP info】 ${mob.name}`;
        const body = (now < spawnTime)
            ? `まもなく（2分前）`
            : `時間なう！`;

        sendBrowserNotification(title, body);
        playNotificationSound();
        notifiedCycles.add(cycleKey);
    }

    if (now > endTime && notifiedCycles.has(cycleKey)) {
        notifiedCycles.delete(cycleKey);
    }
}

// ─── フィルタ ───────────────────────────────────────────

function normalizeRank(rank) {
    if (rank === 'F.A.T.E.' || rank === 'FATE') return 'F';
    return rank;
}

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
        const mobRank = m.rank;
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

// ─── サイドバー ─────────────────────────────────────────

function getStoredState() {
    try {
        return JSON.parse(localStorage.getItem("sidebarState")) || {};
    } catch { return {}; }
}

function saveState(key, value) {
    const s = getStoredState();
    s[key] = value;
    localStorage.setItem("sidebarState", JSON.stringify(s));
}

export function initSidebar() {
    const sidebar = document.getElementById("app-sidebar");
    if (!sidebar) return;

    captureErrors();
    document.body.classList.add("has-sidebar");

    const stored = getStoredState();
    if (stored.panel && stored.panel !== "manual") {
        currentPanel = stored.panel;
        sidebar.classList.add("expanded");
        document.body.classList.add("sidebar-expanded");
        const btn = sidebar.querySelector(`[data-panel="${currentPanel}"]`);
        if (btn) btn.classList.add("active");
        showPanel(currentPanel);
    }

    const navCol = sidebar.querySelector(".sidebar-icon-col");
    if (navCol) {
        renderNavItems(navCol, "sidebar");
    }

    const logo = sidebar.querySelector(".sidebar-logo");
    if (logo) {
        logo.addEventListener("click", () => {
            if (sidebar.classList.contains("expanded")) {
                closePanel();
            }
        });
    }

    if (currentPanel !== "rank") {
        renderSidebarFilterAccordion();
    }
    initMobileFooter();
}

function renderNavItems(container, layout) {
    container.innerHTML = "";
    NAV_ITEMS.forEach(item => {
        if (item.type === "divider") {
            if (layout === "sidebar") {
                const div = document.createElement("div");
                div.className = "sidebar-divider";
                container.appendChild(div);
            }
            return;
        }

        if (item.type === "panel") {
            const btn = document.createElement("button");
            btn.className = `${layout === "sidebar" ? "sidebar-icon-btn" : "mobile-footer-btn"} app-nav-btn`;
            btn.dataset.panel = item.id;
            btn.innerHTML = `
                <span class="nav-icon">${item.icon}</span>
                <span class="nav-label">${item.label}</span>
            `;
            btn.addEventListener("click", () => {
                if (layout === "sidebar") togglePanel(item.id);
                else toggleMobilePanel(item.id);
            });
            container.appendChild(btn);
        } else if (item.type === "toggle") {
            const toggleDiv = document.createElement("div");
            const isMobile = layout === "mobile";
            toggleDiv.className = isMobile ? "mobile-footer-btn mobile-footer-notify" : "sidebar-notification-toggle app-nav-toggle";
            const id = `${layout === "sidebar" ? "sidebar" : "mobile"}-notification-toggle`;
            const name = `${layout === "sidebar" ? "sidebar" : "mobile"}-notify`;
            toggleDiv.innerHTML = `
                <label for="${id}" class="nav-item-content">
                    <input type="checkbox" id="${id}" name="${name}" class="hidden-toggle">
                    <span class="nav-icon">${item.icon}</span>
                    <span class="nav-label">${item.label}</span>
                </label>
            `;
            container.appendChild(toggleDiv);
        }
    });
}

function togglePanel(panelName) {
    if (panelName === "manual") {
        if (typeof window.openUserManual === "function") {
            window.openUserManual();
        }
        return;
    }

    const sidebar = document.getElementById("app-sidebar");
    if (!sidebar) return;

    if (currentPanel === panelName) {
        closePanel();
        return;
    }

    sidebar.querySelectorAll(".app-nav-btn").forEach(b => b.classList.remove("active"));
    const btn = sidebar.querySelector(`[data-panel="${panelName}"]`);
    if (btn) btn.classList.add("active");

    sidebar.classList.add("expanded");
    document.body.classList.add("sidebar-expanded");
    showPanel(panelName);
    currentPanel = panelName;
    saveState("panel", panelName);
}

function closePanel() {
    const sidebar = document.getElementById("app-sidebar");
    if (!sidebar) return;

    sidebar.querySelectorAll(".app-nav-btn").forEach(b => b.classList.remove("active"));
    sidebar.classList.remove("expanded");
    document.body.classList.remove("sidebar-expanded");
    currentPanel = null;
    saveState("panel", null);

    document.querySelectorAll(".sidebar-panel-content").forEach(p => p.classList.add("hidden"));
}

function showPanel(panelName) {
    document.querySelectorAll(".sidebar-panel-content").forEach(p => p.classList.add("hidden"));
    const target = document.getElementById(`sidebar-panel-${panelName}`);
    if (target) {
        target.classList.remove("hidden");
        if (panelName === "rank") {
            renderSidebarFilterAccordion(target);
        } else if (panelName === "manual") {
            loadManualContent(target);
        } else if (panelName === "error") {
            updateErrorPanel(target);
        }
    }
}

// ─── モバイルフッター ───────────────────────────────────

function initMobileFooter() {
    const footerBar = document.getElementById("mobile-footer-bar");
    if (!footerBar) return;

    const iconCol = footerBar.querySelector(".mobile-footer-icons");
    if (iconCol) {
        renderNavItems(iconCol, "mobile");
    }
}

async function toggleMobilePanel(panelName) {
    const panel = document.getElementById("mobile-footer-panel");
    const footerBar = document.getElementById("mobile-footer-bar");
    if (!panel || !footerBar) return;

    footerBar.querySelectorAll(".app-nav-btn").forEach(b => b.classList.remove("active"));

    if (mobileCurrentPanel === panelName) {
        panel.classList.remove("open");
        panel.classList.add("hidden");
        mobileCurrentPanel = null;
        return;
    }

    const btn = footerBar.querySelector(`[data-panel="${panelName}"]`);
    if (btn) btn.classList.add("active");
    mobileCurrentPanel = panelName;

    const sourcePanel = document.getElementById(`sidebar-panel-${panelName}`);
    if (sourcePanel) {
        panel.innerHTML = sourcePanel.innerHTML;
    } else {
        panel.innerHTML = "";
    }

    if (panelName === "rank") {
        renderSidebarFilterAccordion(panel);
    } else if (panelName === "manual") {
        loadManualContent(panel);
    } else if (panelName === "error") {
        updateErrorPanel(panel);
    }

    panel.classList.remove("hidden");
    panel.classList.add("open");

    if (panelName === "telop" || panelName === "maintenance") {
        const { renderMaintenanceStatus } = await import("./app.js");
        if (typeof renderMaintenanceStatus === "function") {
            renderMaintenanceStatus();
        }
    }
}

// ─── エラー ─────────────────────────────────────────────

function captureErrors() {
    const origError = console.error;
    console.error = (...args) => {
        origError.apply(console, args);
        const msg = args.map(a => (typeof a === "object" ? JSON.stringify(a, null, 2) : String(a))).join(" ");
        const time = new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
        errorLog.unshift({ time, msg });
        if (errorLog.length > MAX_ERROR_LOG) errorLog.pop();
        updateErrorPanel();
        updateErrorBadge();
    };

    window.addEventListener("error", (e) => {
        const time = new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
        errorLog.unshift({ time, msg: e.message || "Unknown error" });
        if (errorLog.length > MAX_ERROR_LOG) errorLog.pop();
        updateErrorPanel();
        updateErrorBadge();
    });

    window.addEventListener("unhandledrejection", (e) => {
        const time = new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
        errorLog.unshift({ time, msg: String(e.reason) });
        if (errorLog.length > MAX_ERROR_LOG) errorLog.pop();
        updateErrorPanel();
        updateErrorBadge();
    });
}

function updateErrorPanel(targetContainer = null) {
    const panels = targetContainer ? [targetContainer.querySelector(".js-error-content") || targetContainer] : document.querySelectorAll(".js-error-content");
    if (panels.length === 0 || (panels.length === 1 && !panels[0])) return;

    const fragment = document.createDocumentFragment();
    errorLog.forEach(e => {
        const el = cloneTemplate('sidebar-error-item-template');
        if (el) {
            const timeEl = el.querySelector(".error-time");
            const msgEl = el.querySelector(".error-msg");
            if (timeEl) timeEl.textContent = e.time;
            if (msgEl) msgEl.textContent = e.msg;
            fragment.appendChild(el);
        }
    });

    panels.forEach(el => {
        if (!el) return;
        if (el.classList.contains("mobile-footer-panel") || el.id === "mobile-footer-panel") {
            el.innerHTML = '<div class="sidebar-section"><div class="sidebar-section-title">ERRORS</div><div class="sidebar-alert-content js-error-content"></div></div>';
            const inner = el.querySelector(".js-error-content");
            inner.appendChild(fragment.cloneNode(true));
        } else {
            el.innerHTML = "";
            el.appendChild(fragment.cloneNode(true));
        }
    });
}

function updateErrorBadge() {
    if (typeof window.renderMaintenanceStatus === "function") {
        window.renderMaintenanceStatus();
    }
}

// ─── マニュアル ─────────────────────────────────────────

async function loadManualContent(targetContainer = null) {
    const container = targetContainer || document.getElementById("sidebar-manual-content");
    if (!container) return;

    container.innerHTML = '<div class="sidebar-manual-content"><p style="text-align:center;color:rgba(255,255,255,0.4)">読み込み中...</p></div>';

    try {
        const response = await fetch("./README.md");
        if (!response.ok) throw new Error("マニュアル読み込み失敗");
        const text = await response.text();
        if (typeof marked !== "undefined") {
            marked.setOptions({ breaks: true, gfm: true });
            const html = marked.parse(text);
            container.innerHTML = `<div class="sidebar-manual-content">${DOMPurify.sanitize(html)}</div>`;
        } else {
            container.innerHTML = `<div class="sidebar-manual-content">${escapeHtml(text)}</div>`;
        }
        manualLoaded = true;
    } catch {
        container.innerHTML = '<div class="sidebar-manual-content"><p style="color:#ef4444;text-align:center">読み込み失敗</p></div>';
    }
}

// ─── アコーディオン ─────────────────────────────────────

function renderSidebarFilterAccordion(targetContainer = null) {
    const container = targetContainer?.id === "mobile-footer-panel" ? targetContainer :
        (targetContainer?.querySelector(".sidebar-filter-accordion") || document.getElementById("sidebar-filter-accordion"));
    if (!container) return;

    const ranks = [
        { key: "ALL", label: "ALL", color: "#fff" },
        { key: "S", label: "S RANK", color: "var(--rank-s)" },
        { key: "A", label: "A RANK", color: "var(--rank-a)" },
        { key: "F.A.T.E.", label: "F.A.T.E.", color: "var(--rank-f)" },
    ];

    const state = getState();
    const activeRank = state.filter.rank || "ALL";
    const clickStep = state.filter.clickStep || 1;

    const fragment = document.createDocumentFragment();
    const title = document.createElement("div");
    title.className = "sidebar-filter-title";
    title.textContent = "Filter";
    fragment.appendChild(title);

    ranks.forEach(r => {
        const isActive = r.key === activeRank;
        const isExpanded = isActive && clickStep === 2;

        const itemEl = cloneTemplate('rank-accordion-item-template');
        if (itemEl) {
            if (isActive) itemEl.classList.add('active');
            if (isExpanded) itemEl.classList.add('is-expanded');
            itemEl.dataset.rank = r.key;

            const header = itemEl.querySelector(".rank-header");
            if (header) {
                header.dataset.rank = isActive ? r.key : "";
                header.textContent = r.label;
                header.addEventListener("click", () => {
                    const rankKey = header.closest(".rank-accordion-item").dataset.rank;
                    handleRankTabClick(rankKey);
                });
            }
            fragment.appendChild(itemEl);
        }
    });

    container.innerHTML = "";
    container.appendChild(fragment);

    const activeExpansion = container.querySelector(".rank-accordion-item.active .area-grid-container");
    if (activeExpansion) {
        activeExpansion.className = "area-grid-container area-grid";
        renderAreaFilterPanel(activeExpansion);
    }
}

// ─── イベントリスナー ───────────────────────────────────

window.addEventListener("filterChanged", () => {
    // デスクトップ用サイドバー
    renderSidebarFilterAccordion();

    // モバイル用フッターパネル
    const mobilePanel = document.getElementById("mobile-footer-panel");
    if (mobilePanel && mobileCurrentPanel === "rank") {
        renderSidebarFilterAccordion(mobilePanel);
    }
});
