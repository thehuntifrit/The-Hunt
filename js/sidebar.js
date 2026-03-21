import { getState, EXPANSION_MAP } from "./dataManager.js";
import { renderAreaFilterPanel } from "./filterUI.js";

let currentPanel = null;

const PANELS = ["error", "telop", "maintenance", "rank", "manual"];

const errorLog = [];
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
    const el = document.getElementById("sidebar-error-content");
    if (!el) return;
    if (errorLog.length === 0) {
        el.innerHTML = "";
        return;
    }
    el.innerHTML = errorLog.map(e =>
        `<div class="sidebar-error-item"><span class="error-time">${e.time}</span><span class="error-msg">${escapeHtml(e.msg)}</span></div>`
    ).join("");
}

function updateErrorBadge() {
    const btn = document.querySelector('.sidebar-icon-btn[data-panel="error"]');
    if (btn) btn.classList.toggle("has-alert", errorLog.length > 0);
}

function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
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
    if (stored.panel) {
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

    renderSidebarFilterAccordion();
    setupSidebarNotification();
}

function togglePanel(panelName) {
    const sidebar = document.getElementById("app-sidebar");
    if (!sidebar) return;

    if (currentPanel === panelName) {
        closePanel();
        return;
    }

    sidebar.querySelectorAll(".sidebar-icon-btn").forEach(b => b.classList.remove("active"));
    const btn = sidebar.querySelector(`[data-panel="${panelName}"]`);
    if (btn) btn.classList.add("active");

    currentPanel = panelName;
    sidebar.classList.add("expanded");
    document.body.classList.add("sidebar-expanded");
    saveState("panel", panelName);

    showPanel(panelName);
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
        if (!response.ok) throw new Error("Failed to load");
        const text = await response.text();
        if (typeof marked !== "undefined") {
            marked.setOptions({ breaks: true, gfm: true });
            container.innerHTML = marked.parse(text);
        } else {
            container.textContent = text;
        }
        manualLoaded = true;
    } catch {
        container.innerHTML = '<p style="color:#ef4444;text-align:center">読み込み失敗</p>';
    }
}

function setupSidebarNotification() {
    const origToggle = document.getElementById("notification-toggle");
    const sidebarToggle = document.getElementById("sidebar-notification-toggle");
    if (sidebarToggle && origToggle) {
        sidebarToggle.checked = origToggle.checked;
        sidebarToggle.addEventListener("change", () => {
            origToggle.checked = sidebarToggle.checked;
            origToggle.dispatchEvent(new Event("change"));
        });
        origToggle.addEventListener("change", () => {
            sidebarToggle.checked = origToggle.checked;
        });
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

    let html = `<div class="sidebar-section-title" style="text-align: center; margin-bottom: 12px; opacity: 0.6;">Filter</div>`;
    html += ranks.map(r => `
        <div class="rank-accordion-item ${r.key === activeRank ? 'active' : ''}" data-rank="${r.key}">
            <button class="rank-header" style="color: ${r.color};">
                ${r.label}
            </button>
            <div class="area-expansion">
                <div class="area-grid-container"></div>
            </div>
        </div>
    `).join("");
    
    container.innerHTML = html;

    container.querySelectorAll(".rank-header").forEach(header => {
        header.addEventListener("click", () => {
            const rankKey = header.closest(".rank-accordion-item").dataset.rank;
            const origBtn = document.querySelector(`#rank-tabs .tab-button[data-rank="${rankKey}"]`);
            if (origBtn) origBtn.click();
        });
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
