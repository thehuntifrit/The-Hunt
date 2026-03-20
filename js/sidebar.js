import { getState } from "./dataManager.js";
import { getEorzeaTime, EORZEA_MINUTE_MS } from "./cal.js";

let currentPanel = null;

const PANELS = ["telop", "maintenance", "rank"];

function highlightDateTime(isoStr) {
    if (!isoStr) return "";
    const d = new Date(isoStr);
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const h = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${m}/${day} ${h}:${min}`;
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
        const state = getState();
        const maintContainer = maintenanceTarget;
        if (!maintContainer) return;

        let hasContent = false;
        if (state.maintenance && state.maintenance.start && state.maintenance.end) {
            const start = highlightDateTime(state.maintenance.start);
            const end = highlightDateTime(state.maintenance.end);
            maintContainer.innerHTML = `<div class="maintenance-box"><div class="time-val">${start}</div><div class="time-sep">～</div><div class="time-val">${end}</div></div>`;
            hasContent = true;
        } else {
            maintContainer.textContent = "現在予定されているメンテナンスはありません。";
        }
        maintenanceBtn?.classList.toggle("has-alert", hasContent);

        const title = document.querySelector('#sidebar-panel-maintenance .sidebar-section-title');
        if (title) {
            title.textContent = `Maintenance info.`;
        }
    }

    function syncTelop() {
        if (!telopSource || !telopTarget) return;
        const text = telopSource.textContent.trim();
        const hasContent = text !== "";
        telopTarget.textContent = text;
        telopBtn?.classList.toggle("has-alert", hasContent);

        const title = document.querySelector('#sidebar-panel-telop .sidebar-section-title');
        if (title) {
            title.textContent = `ANNOUNCEMENT`;
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
    if (target) {
        target.classList.remove("hidden");
        if (panelName === "rank") {
            renderSidebarFilterAccordion();
        }
    }
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
        { key: "S", label: "S Rank", color: "var(--rank-s)" },
        { key: "A", label: "A Rank", color: "var(--rank-a)" },
        { key: "FATE", label: "FATE", color: "var(--rank-f)" },
    ];

    const state = getState();
    const activeRank = state.filter.rank || "ALL";

    let html = `<div class="sidebar-section-title" style="text-align: center; margin-bottom: 12px; opacity: 0.6;">Filter</div>`;
    html += ranks.map(r => `
        <div class="rank-accordion-item ${r.key === activeRank ? 'active' : ''}" data-rank="${r.key}">
            <button class="rank-header" style="${r.key === activeRank ? `color: ${r.color};` : ''}">
                ${r.label}
            </button>
            <div class="area-expansion">
                <div class="area-grid"></div>
            </div>
        </div>
    `).join("");
    
    container.innerHTML = html;

    container.querySelectorAll(".rank-header").forEach(header => {
        header.addEventListener("click", () => {
            const item = header.closest(".rank-accordion-item");
            const rankKey = item.dataset.rank;
            const origBtn = document.querySelector(`#rank-tabs .tab-button[data-rank="${rankKey}"]`);
            if (origBtn) origBtn.click();
        });
    });

    // Populate area grid for the active item
    const activeExpansion = container.querySelector(".rank-accordion-item.active .area-expansion");
    if (activeExpansion) {
        const desktopPanel = document.getElementById("area-filter-panel-desktop");
        if (desktopPanel) {
            // Force render original buttons to ensure they exist
            import("./filterUI.js").then(m => m.renderAreaFilterPanel());
            
            const origButtons = Array.from(desktopPanel.querySelectorAll(".area-filter-btn"));
            if (origButtons.length > 0) {
                const firstOrig = origButtons[0];
                const allBtn = document.createElement("button");
                allBtn.className = `area-filter-btn area-select-all ${firstOrig.classList.contains('is-selected') ? 'active' : ''}`;
                allBtn.textContent = firstOrig.textContent;
                allBtn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    firstOrig.click();
                });
                activeExpansion.appendChild(allBtn);

                const grid = activeExpansion.querySelector(".area-grid");
                origButtons.slice(1).forEach(orig => {
                    const btn = document.createElement("button");
                    btn.className = `area-filter-btn ${orig.classList.contains('is-selected') ? 'active' : ''}`;
                    btn.textContent = orig.textContent;
                    btn.dataset.area = orig.dataset.area || orig.dataset.value;
                    btn.addEventListener("click", (e) => {
                        e.stopPropagation();
                        orig.click();
                    });
                    grid.appendChild(btn);
                });
            }
        }
    }
}

window.addEventListener("filterChanged", () => {
    renderSidebarFilterAccordion();
});
