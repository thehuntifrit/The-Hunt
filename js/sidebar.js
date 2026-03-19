import { getState } from "./dataManager.js";
import { getEorzeaTime, EORZEA_MINUTE_MS } from "./cal.js";

let currentPanel = null;

const PANELS = ["telop", "maintenance", "rank"];

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

    renderSidebarRankTabs();
    renderSidebarAreaFilter();
    updateSidebarClocks();

    setInterval(updateSidebarClocks, EORZEA_MINUTE_MS);

    setupSidebarNotification();
    initAlertMirroring();
}

function initAlertMirroring() {
    const maintenanceSource = document.getElementById("status-message-maintenance");
    const telopSource = document.getElementById("status-message-telop");
    
    const maintenanceTarget = document.getElementById("sidebar-maintenance-content");
    const telopTarget = document.getElementById("sidebar-telop-content");
    
    const maintenanceBtn = document.querySelector('.sidebar-icon-btn[data-panel="maintenance"]');
    const telopBtn = document.querySelector('.sidebar-icon-btn[data-panel="telop"]');

    function syncMaintenance() {
        if (!maintenanceSource || !maintenanceTarget) return;
        const html = maintenanceSource.innerHTML.trim();
        const hasContent = html !== "";
        maintenanceTarget.innerHTML = html;
        maintenanceBtn?.classList.toggle("has-alert", hasContent);

        // Add a badge to the title if has content
        const title = document.querySelector('#sidebar-panel-maintenance .sidebar-section-title');
        if (title) {
            title.innerHTML = `MAINTENANCE ${hasContent ? '<span class="sidebar-new-badge">NEW</span>' : ''}`;
        }
    }

    function syncTelop() {
        if (!telopSource || !telopTarget) return;
        const text = telopSource.textContent.trim();
        const hasContent = text !== "";
        telopTarget.textContent = text;
        telopBtn?.classList.toggle("has-alert", hasContent);
        
        // Add a badge to the title if has content
        const title = document.querySelector('#sidebar-panel-telop .sidebar-section-title');
        if (title) {
            title.innerHTML = `ANNOUNCEMENT ${hasContent ? '<span class="sidebar-new-badge">NEW</span>' : ''}`;
        }
    }

    if (maintenanceSource) {
        new MutationObserver(syncMaintenance).observe(maintenanceSource, { childList: true, subtree: true, characterData: true });
        syncMaintenance();
    }
    if (telopSource) {
        new MutationObserver(syncTelop).observe(telopSource, { childList: true, subtree: true, characterData: true });
        syncTelop();
    }
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
    if (target) target.classList.remove("hidden");
}

function updateSidebarClocks() {
    const now = new Date();
    const et = getEorzeaTime(now);
    const ltH = String(now.getHours()).padStart(2, "0");
    const ltM = String(now.getMinutes()).padStart(2, "0");
    const ltStr = `${ltH}:${ltM}`;
    const etStr = `${et.hours}:${et.minutes}`;

    ["sidebar-lt-persistent", "pc-time-lt", "header-time-lt"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = ltStr;
    });
    ["sidebar-et-persistent", "pc-time-et", "header-time-et"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = etStr;
    });
}

function setupSidebarNotification() {
    const origToggle = document.getElementById("notification-toggle");
    const origVolume = document.getElementById("notification-volume");
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

function renderSidebarRankTabs() {
    const container = document.getElementById("sidebar-rank-tabs");
    if (!container) return;

    const ranks = [
        { key: "ALL", label: "ALL", color: "#fff" },
        { key: "S", label: "S Rank", color: "var(--rank-s)" },
        { key: "A", label: "A Rank", color: "var(--rank-a)" },
        { key: "FATE", label: "FATE", color: "var(--rank-f)" },
    ];

    const state = getState();
    const activeRank = state.selectedRank || "ALL";

    container.innerHTML = ranks.map(r => `
        <button class="tab-button ${r.key === activeRank ? 'active' : ''}"
                data-rank="${r.key}"
                style="${r.key === activeRank ? `color: ${r.color}; border-color: ${r.color};` : ''}">
            ${r.key}
        </button>
    `).join("");

    container.addEventListener("click", (e) => {
        const btn = e.target.closest(".tab-button");
        if (!btn) return;
        const origBtn = document.querySelector(`#rank-tabs .tab-button[data-rank="${btn.dataset.rank}"]`);
        if (origBtn) origBtn.click();

        container.querySelectorAll(".tab-button").forEach(b => {
            b.classList.remove("active");
            b.style.color = "";
            b.style.borderColor = "";
        });
        btn.classList.add("active");
        const r = ranks.find(r => r.key === btn.dataset.rank);
        if (r) {
            btn.style.color = r.color;
            btn.style.borderColor = r.color;
        }
    });
}

function renderSidebarAreaFilter() {
    const container = document.getElementById("sidebar-area-filter");
    if (!container) return;

    const observer = new MutationObserver(() => {
        syncAreaFilter();
    });

    const desktopPanel = document.getElementById("area-filter-panel-desktop");
    if (desktopPanel) {
        observer.observe(desktopPanel, { childList: true, subtree: true });
        setTimeout(syncAreaFilter, 500);
    }
}

function syncAreaFilter() {
    const container = document.getElementById("sidebar-area-filter");
    const desktopPanel = document.getElementById("area-filter-panel-desktop");
    if (!container || !desktopPanel) return;

    const origButtons = desktopPanel.querySelectorAll(".area-filter-btn");
    if (origButtons.length === 0) return;

    container.innerHTML = "";
    origButtons.forEach(orig => {
        const btn = orig.cloneNode(true);
        btn.addEventListener("click", () => {
            orig.click();
            setTimeout(syncAreaFilter, 50);
        });
        container.appendChild(btn);
    });
}

window.addEventListener("filterChanged", () => {
    const sidebarRankTabs = document.getElementById("sidebar-rank-tabs");
    if (sidebarRankTabs) {
        const state = getState();
        const activeRank = state.selectedRank || "ALL";
        const ranks = [
            { key: "ALL", label: "ALL", color: "#fff" },
            { key: "S", label: "S Rank", color: "var(--rank-s)" },
            { key: "A", label: "A Rank", color: "var(--rank-a)" },
            { key: "FATE", label: "FATE", color: "var(--rank-f)" },
        ];
        sidebarRankTabs.querySelectorAll(".tab-button").forEach(btn => {
            const isActive = btn.dataset.rank === activeRank;
            btn.classList.toggle("active", isActive);
            const r = ranks.find(r => r.key === btn.dataset.rank);
            if (r) {
                btn.style.color = isActive ? r.color : "";
                btn.style.borderColor = isActive ? r.color : "";
            }
        });
    }
    syncAreaFilter();
});
