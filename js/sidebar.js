import { getState, setFilter, EXPANSION_MAP, setNotificationEnabled } from "./dataManager.js";
import { filterAndRender } from "./app.js";
import { openUserManual } from "./readme.js";
import { cloneTemplate, escapeHtml } from "./mobCard.js";

// ─── 定数・DOM ──────────────────────────────────────────
const SOUND_FILE = "./sound/01 FFXIV_Linkshell_Transmission.mp3";

let audio = null;
const notifiedCycles = new Set();
let manualLoaded = false;
let currentPanel = null;
window.errorLog = window.errorLog || [];
const MAX_ERROR_LOG = 50;

// ─── 通知 ───────────────────────────────────────────────
export function initNotification() {
    audio = new Audio(SOUND_FILE);
    audio.load();

    const toggle = document.getElementById('appnav-notification-toggle');
    if (!toggle) return;

    const isEnabled = getState().notificationEnabled;
    toggle.checked = isEnabled;

    const label = toggle.closest('.appnav-btn');
    if (label) {
        label.classList.toggle('is-disabled', !isEnabled);
    }

    toggle.addEventListener('change', (e) => {
        const enabled = e.target.checked;
        if (label) {
            label.classList.toggle('is-disabled', !enabled);
        }
        setNotificationEnabled(enabled);

        if (enabled) {
            requestNotificationPermission();
            playNotificationSound(true);
        }
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
    if (rank === 'S rank' || rank === 'S') return 'S';
    if (rank === 'A rank' || rank === 'A') return 'A';
    if (rank === 'FATE' || rank === 'F.A.T.E.' || rank === 'F') return 'F';
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
        const container = document.createElement("div");
        container.className = "appnav-area-filter-wrapper";

        const allBtnWrapper = document.createElement("div");
        allBtnWrapper.className = "area-all-container";

        const allBtn = document.createElement("button");
        allBtn.className = `area-filter-btn area-select-all ${isAllSelected ? 'is-selected' : ''}`;
        allBtn.textContent = isAllSelected ? "全解除" : "全選択";
        allBtn.dataset.value = "ALL";
        allBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            handleAreaFilterClick(e);
        });
        allBtnWrapper.appendChild(allBtn);
        container.appendChild(allBtnWrapper);

        const grid = document.createElement("div");
        grid.className = "area-grid-container";

        items.forEach(item => {
            const isSelected = currentSet.has(item);
            const btn = document.createElement("button");
            btn.className = `area-filter-btn ${isSelected ? 'is-selected' : ''}`;
            btn.textContent = (state.filter.rank === 'FATE' && item === 'F') ? 'FATE' : (state.filter.rank === 'ALL' ? (item === 'F' ? 'FATE' : `${item} rank`) : item);
            btn.dataset.value = item;
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                handleAreaFilterClick(e);
            });
            grid.appendChild(btn);
        });

        container.appendChild(grid);
        return container;
    };

    if (customContainer) {
        customContainer.innerHTML = "";
        customContainer.appendChild(createPanelContent());
        return;
    }

    const activeExpansion = document.querySelector("#appnav .appnav-rank-item.appnav-active .area-grid-container");
    if (activeExpansion) {
        activeExpansion.innerHTML = "";
        activeExpansion.appendChild(createPanelContent());
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

            if (targetSet.size === 0) return false; 
            if (targetSet.size === allExpansions) return true;

            return targetSet.has(mobExpansion);
        } else {
            const normUiRank = normalizeRank(uiRank);
            const isRankMatch =
                (normUiRank === 'S' && mobRank === 'S') ||
                (normUiRank === 'A' && (mobRank === 'A' || mobRank.startsWith('B'))) ||
                (normUiRank === 'F' && mobRank === 'F');

            if (!isRankMatch) return false;

            const targetSet =
                areaSets?.[filterKey] instanceof Set ? areaSets[filterKey] : new Set();

            if (targetSet.size === 0) return false; 
            if (targetSet.size === allExpansions) return true;

            return targetSet.has(mobExpansion);
        }
    });
}

// ─── アプリナビ ─────────────────────────────────────────
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

export function initAppNav() {
    const nav = document.getElementById("appnav");
    if (!nav) return;

    captureErrors();

    const stored = getStoredState();
    if (stored.panel && stored.panel !== "manual") {
        currentPanel = stored.panel;
        nav.classList.add("expanded");
        document.body.classList.add("sidebar-expanded");
        showPanel(currentPanel);
        setActiveNavItem(currentPanel);
    } else {
        setActiveNavItem(null);
    }

    bindNavItems();

    const logo = nav.querySelector(".appnav-logo");
    if (logo) {
        logo.addEventListener("click", () => {
            if (nav.classList.contains("expanded")) closePanel();
            setActiveNavItem('home');
        });
    }

    if (currentPanel !== "rank") {
        renderSidebarFilterAccordion();
    }
}

function bindNavItems() {
    const navButtons = document.querySelectorAll('.appnav-btn[data-nav-id]');

    navButtons.forEach(btn => {
        const navId = btn.dataset.navId;

        btn.addEventListener('click', (e) => {
            if (navId === 'notify') return;

            e.preventDefault();
            e.stopPropagation();

            if (navId === 'home') {
                closePanel();
                const container = document.getElementById("moblist-container");
                if (container) container.scrollTo({ top: 0, behavior: "smooth" });
                setActiveNavItem('home');
                return;
            }

            togglePanel(navId);
        });
    });

    setTimeout(() => initNotification(), 0);
}

function setActiveNavItem(id) {
    document.querySelectorAll(".appnav-btn[data-nav-id]").forEach(btn => {
        btn.classList.toggle("appnav-active", btn.dataset.navId === id);
    });
}

export async function togglePanel(panelName) {
    if (panelName === "manual") {
        if (typeof openUserManual === "function") openUserManual();
        return;
    }

    const nav = document.getElementById("appnav");
    if (!nav) return;

    if (currentPanel === panelName) {
        closePanel();
        return;
    }

    nav.classList.add("expanded");
    document.body.classList.add("sidebar-expanded");
    showPanel(panelName);
    currentPanel = panelName;
    setActiveNavItem(panelName);
    saveState("panel", panelName);
}

function closePanel() {
    const nav = document.getElementById("appnav");
    if (!nav) return;

    nav.classList.remove("expanded");
    document.body.classList.remove("sidebar-expanded");
    
    const panelArea = nav.querySelector(".appnav-panel");
    if (panelArea) {
        panelArea.classList.remove("expanded");
    }

    currentPanel = null;
    setActiveNavItem('home');
    saveState("panel", null);

    document.querySelectorAll(".appnav-panel .js-appnav-panel-item").forEach(p => p.classList.add("hidden"));
}

function showPanel(panelName) {
    const nav = document.getElementById("appnav");
    const panelArea = nav.querySelector(".appnav-panel");
    if (panelArea) panelArea.classList.add("expanded");

    document.querySelectorAll(".appnav-panel .js-appnav-panel-item").forEach(p => p.classList.add("hidden"));
    const target = document.getElementById(`sidebar-panel-${panelName}`);
    if (target) {
        target.classList.remove("hidden");
        syncPanelContents(panelName, target);
    }
}

async function syncPanelContents(panelName, container) {
    if (panelName === "rank") renderSidebarFilterAccordion(container);
    else if (panelName === "manual") loadManualContent(container);
    else if (panelName === "error") updateErrorPanel(container);
    else if (panelName === "telop" || panelName === "maintenance") {
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
        window.errorLog.unshift({ time, msg });
        if (window.errorLog.length > MAX_ERROR_LOG) window.errorLog.pop();
        updateErrorPanel();
        updateErrorBadge();
    };

    window.addEventListener("error", (e) => {
        const time = new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
        window.errorLog.unshift({ time, msg: e.message || "Unknown error" });
        if (window.errorLog.length > MAX_ERROR_LOG) window.errorLog.pop();
        updateErrorPanel();
        updateErrorBadge();
    });

    window.addEventListener("unhandledrejection", (e) => {
        const time = new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
        window.errorLog.unshift({ time, msg: String(e.reason) });
        if (window.errorLog.length > MAX_ERROR_LOG) window.errorLog.pop();
        updateErrorPanel();
        updateErrorBadge();
    });
}

export function updateErrorPanel(targetContainer = null) {
    const panels = document.querySelectorAll(".js-error-content");
    if (panels.length === 0) return;

    const fragment = document.createDocumentFragment();
    if (!window.errorLog || window.errorLog.length === 0) {
        const emptyMsg = document.createElement("div");
        emptyMsg.className = "text-center u-text-sm text-gray-500 mt-10";
        emptyMsg.textContent = "現在エラーはありません";
        fragment.appendChild(emptyMsg);
    } else {
        window.errorLog.forEach(e => {
            const el = cloneTemplate('appnav-error-item-template');
            if (el) {
                const timeEl = el.querySelector(".appnav-error-time");
                const msgEl = el.querySelector(".error-msg");
                if (timeEl) timeEl.textContent = e.time;
                if (msgEl) msgEl.textContent = e.msg;
                fragment.appendChild(el);
            }
        });
    }

    panels.forEach(el => {
        if (!el) return;
        el.innerHTML = "";
        el.appendChild(fragment.cloneNode(true));
    });
}

function updateErrorBadge() {
    const { renderMaintenanceStatus } = import("./app.js").then(m => {
        if (typeof m.renderMaintenanceStatus === "function") m.renderMaintenanceStatus();
    });
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
    const container = document.getElementById("sidebar-filter-accordion");
    if (!container) return;

    const ranks = [
        { key: "ALL", label: "ALL", color: "var(--color-all-rank)" },
        { key: "S rank", label: "S rank", color: "var(--color-rank-s)" },
        { key: "A rank", label: "A rank", color: "var(--color-rank-a)" },
        { key: "FATE", label: "FATE", color: "var(--color-rank-f)" },
    ];

    const state = getState();
    const activeRank = state.filter.rank || "ALL";
    const clickStep = state.filter.clickStep || 1;

    const fragment = document.createDocumentFragment();
    const section = document.createElement("div");
    section.className = "appnav-section";

    const title = document.createElement("div");
    title.className = "appnav-filter-title";
    title.textContent = "Filter";
    section.appendChild(title);
    fragment.appendChild(section);

    ranks.forEach(r => {
        const isActive = r.key === activeRank;
        const isExpanded = isActive && clickStep === 2;

        const itemEl = cloneTemplate('rank-accordion-item-template');
        if (itemEl) {
            if (isActive) itemEl.classList.add('appnav-active');
            if (isExpanded) itemEl.classList.add('appnav-is-expanded');
            itemEl.dataset.rank = r.key;
            itemEl.style.setProperty('--current-rank', r.color);
            const rgb = r.color.replace('var(--', '').replace(')', '-rgb');
            itemEl.style.setProperty('--current-rank-rgb', `var(--${rgb})`);

            const header = itemEl.querySelector(".appnav-rank-header");
            if (header) {
                header.dataset.rank = r.key;
                header.textContent = r.label;
                header.addEventListener("click", () => {
                    const rankKey = header.closest(".appnav-rank-item").dataset.rank;
                    handleRankTabClick(rankKey);
                });
            }
            fragment.appendChild(itemEl);
        }
    });

    container.innerHTML = "";
    container.appendChild(fragment);

    const activeExpansion = container.querySelector(".appnav-rank-item.appnav-active .area-grid-container");
    if (activeExpansion) {
        activeExpansion.className = "area-grid-container appnav-area-grid";
        renderAreaFilterPanel(activeExpansion);
    }
}

// ─── イベントリスナー ───────────────────────────────────
window.addEventListener("filterChanged", () => {
    renderSidebarFilterAccordion();
});
