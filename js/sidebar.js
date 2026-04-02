import { getState } from "./dataManager.js";
import { renderAreaFilterPanel, handleRankTabClick } from "./filterUI.js";
import { escapeHtml, cloneTemplate } from "./uiRender.js";

let currentPanel = null;

const PANELS = ["error", "telop", "maintenance", "rank", "manual"];

const errorLog = [];
window.errorLog = errorLog;
const MAX_ERROR_LOG = 50;
let manualLoaded = false;

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

function updateErrorPanel() {
    const panels = document.querySelectorAll(".js-error-content");
    if (panels.length === 0) return;

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
        el.innerHTML = "";
        el.appendChild(fragment.cloneNode(true));
    });
}

function updateErrorBadge() {
    if (typeof window.renderMaintenanceStatus === "function") {
        window.renderMaintenanceStatus();
    }
}



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

    sidebar.querySelectorAll(".sidebar-icon-btn[data-panel]").forEach(btn => {
        btn.addEventListener("click", () => {
            togglePanel(btn.dataset.panel);
        });
    });

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

let mobileCurrentPanel = null;

function initMobileFooter() {
    const footerBar = document.getElementById("mobile-footer-bar");
    if (!footerBar) return;

    footerBar.querySelectorAll(".mobile-footer-btn[data-panel]").forEach(btn => {
        btn.addEventListener("click", () => {
            toggleMobilePanel(btn.dataset.panel);
        });
    });
}

function toggleMobilePanel(panelName) {
    const panel = document.getElementById("mobile-footer-panel");
    const footerBar = document.getElementById("mobile-footer-bar");
    if (!panel || !footerBar) return;

    footerBar.querySelectorAll(".mobile-footer-btn").forEach(b => b.classList.remove("active"));

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
        renderMobileFilterAccordion(panel);
    } else if (panelName === "manual") {
        loadMobileManual(panel);
    } else if (panelName === "error") {
        renderMobileErrors(panel);
    }

    panel.classList.remove("hidden");
    panel.classList.add("open");

    if (panelName === "telop" || panelName === "maintenance") {
        if (typeof window.renderMaintenanceStatus === "function") {
            window.renderMaintenanceStatus();
        }
    }
}

function renderMobileFilterAccordion(panel) {
    const state = getState();
    const ranks = [
        { key: "ALL", label: "ALL", color: "#fff" },
        { key: "S", label: "S RANK", color: "var(--rank-s)" },
        { key: "A", label: "A RANK", color: "var(--rank-a)" },
        { key: "F.A.T.E.", label: "F.A.T.E.", color: "var(--rank-f)" },
    ];
    const activeRank = state.filter.rank || "ALL";
    const clickStep = state.filter.clickStep || 1;

    let container = document.createElement("div");
    container.className = "sidebar-filter-accordion";
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
                header.style.color = r.color;
                header.textContent = r.label;
                header.addEventListener("click", () => {
                    const rankKey = header.closest(".rank-accordion-item").dataset.rank;
                    handleRankTabClick(rankKey);
                    setTimeout(() => renderMobileFilterAccordion(panel), 50);
                });
            }
            container.appendChild(itemEl);
        }
    });
    panel.innerHTML = "";
    panel.appendChild(container);

    const activeExpansion = panel.querySelector(".rank-accordion-item.active .area-grid-container");
    if (activeExpansion) {
        activeExpansion.className = "area-grid-container area-grid";
        renderAreaFilterPanel(activeExpansion);
    }
}

async function loadMobileManual(panel) {
    panel.innerHTML = '<div class="sidebar-manual-content"><p style="text-align:center;color:rgba(255,255,255,0.4)">読み込み中...</p></div>';
    try {
        const response = await fetch("./README.md");
        if (!response.ok) throw new Error("マニュアル取得失敗");
        const text = await response.text();
        if (typeof marked !== "undefined") {
            marked.setOptions({ breaks: true, gfm: true });
            const html = marked.parse(text);
            panel.innerHTML = `<div class="sidebar-manual-content">${DOMPurify.sanitize(html)}</div>`;
        } else {
            panel.querySelector(".sidebar-manual-content").textContent = text;
        }
    } catch {
        panel.innerHTML = '<div class="sidebar-manual-content"><p style="color:#ef4444;text-align:center">読み込み失敗</p></div>';
    }
}

function renderMobileErrors(panel) {
    const el = document.getElementById("sidebar-error-content");
    if (el) {
        panel.innerHTML = "";
        const section = document.createElement("div");
        section.className = "sidebar-section";
        // REMOVE WHITESPACE to allow :empty CSS to work correctly
        section.innerHTML = `
            <div class="sidebar-section-title">ERRORS</div>
            <div class="sidebar-alert-content js-error-content">${el.innerHTML.trim()}</div>
        `;
        panel.appendChild(section);
        // FORCE SYNC immediately after construction
        updateErrorPanel();
    }
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

    sidebar.querySelectorAll(".sidebar-icon-btn").forEach(b => b.classList.remove("active"));
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

    sidebar.querySelectorAll(".sidebar-icon-btn").forEach(b => b.classList.remove("active"));
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
            renderSidebarFilterAccordion();
        } else if (panelName === "manual" && !manualLoaded) {
            loadManualContent();
        } else if (panelName === "error") {
            updateErrorPanel();
        }
    }
}

async function loadManualContent() {
    const container = document.getElementById("sidebar-manual-content");
    if (!container) return;

    container.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.4)">読み込み中...</p>';

    try {
        const response = await fetch("./README.md");
        if (!response.ok) throw new Error("マニュアル読み込み失敗");
        const text = await response.text();
        if (typeof marked !== "undefined") {
            marked.setOptions({ breaks: true, gfm: true });
            const html = marked.parse(text);
            container.innerHTML = DOMPurify.sanitize(html);
        } else {
            container.textContent = text;
        }
        manualLoaded = true;
    } catch {
        container.innerHTML = '<p style="color:#ef4444;text-align:center">読み込み失敗</p>';
    }
}



function renderSidebarFilterAccordion() {
    const container = document.getElementById("sidebar-filter-accordion");
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

    container.innerHTML = "";
    const title = document.createElement("div");
    title.className = "sidebar-filter-title";
    title.textContent = "Filter";
    container.appendChild(title);

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
                header.style.color = r.color;
                header.textContent = r.label;
                header.addEventListener("click", () => {
                    const rankKey = header.closest(".rank-accordion-item").dataset.rank;
                    handleRankTabClick(rankKey);
                });
            }
            container.appendChild(itemEl);
        }
    });

    const activeExpansion = container.querySelector(".rank-accordion-item.active .area-grid-container");
    if (activeExpansion) {
        activeExpansion.className = "area-grid-container area-grid";
        renderAreaFilterPanel(activeExpansion);
    }
}

window.addEventListener("filterChanged", () => {
    renderSidebarFilterAccordion();
});
