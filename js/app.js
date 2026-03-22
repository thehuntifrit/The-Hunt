import { loadBaseMobData, startRealtime, setOpenMobCardNo, getState, setUserId, setLodestoneId, setCharacterName, setVerified } from "./dataManager.js";
import { initializeAuth, getUserData, submitReport, submitMemo } from "./server.js";
import { attachMobCardEvents, toggleCardExpand, closeCard } from "./mobCard.js";
import { attachLocationEvents } from "./location.js";
import { openReportModal, closeReportModal, initModal, openAuthModal } from "./modal.js";
import { renderRankTabs, handleAreaFilterClick, updateFilterUI } from "./filterUI.js";
import { DOM, sortAndRedistribute, showColumnContainer, updateHeaderTime } from "./uiRender.js";
import { debounce } from "./cal.js";
import { initTooltip } from "./tooltip.js";
import { initGlobalMagnifier } from "./magnifier.js";
import { initSidebar } from "./sidebar.js";
import "./readme.js";
import { initNotification } from "./notificationManager.js";

export function showToast(message, type = "error") {
    let container = document.getElementById("toast-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        container.className = "fixed top-20 right-4 z-[9999] flex flex-col gap-2 pointer-events-none";
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    const bgColor = type === "error" ? "bg-red-900/90 border-red-500" : "bg-cyan-900/90 border-cyan-500";
    toast.className = `px-4 py-3 rounded shadow-2xl border ${bgColor} text-white text-sm font-bold transform transition-all duration-300 translate-x-full opacity-0 max-w-sm break-words`;
    toast.innerHTML = message.replace(/\n/g, "<br>");

    container.appendChild(toast);

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            toast.classList.remove("translate-x-full", "opacity-0");
        });
    });

    setTimeout(() => {
        toast.classList.add("translate-x-full", "opacity-0");
        toast.addEventListener("transitionend", () => toast.remove());
    }, 4000);
}

async function initApp() {
    try {
        initNotification();
        initTooltip();
        initGlobalMagnifier();
        loadBaseMobData();

        initializeAuth().then(async (userId) => {
            if (userId) {
                setUserId(userId);
                const userData = await getUserData(userId);
                if (userData && userData.lodestone_id) {
                    setLodestoneId(userData.lodestone_id);
                    if (userData.character_name) setCharacterName(userData.character_name);
                    setVerified(true);
                } else {
                    setVerified(false);
                    setLodestoneId(null);
                    setCharacterName(null);
                }
            } else {
                setVerified(false);
                setUserId(null);
                setLodestoneId(null);
                setCharacterName(null);
            }
        }).catch(err => {
            console.error("Auth initialization error:", err);
            setVerified(false);
        });

        startRealtime();

        let storedUI = {};
        try {
            storedUI = JSON.parse(localStorage.getItem("huntUIState")) || {};
        } catch (e) {
            console.warn("huntUIState parse error", e);
        }

        if (storedUI.openMobCardNo !== undefined) {
            delete storedUI.openMobCardNo;
            try {
                localStorage.setItem("huntUIState", JSON.stringify(storedUI));
            } catch (e) { }
        }
        setOpenMobCardNo(null);

        renderRankTabs();
        updateFilterUI();
        initModal();
        renderMaintenanceStatus();
        updateHeaderTime();
        initSidebar();
        attachMobCardEvents();
        attachLocationEvents();
        attachGlobalEventListeners();

        window.addEventListener('maintenanceUpdated', () => {
            renderMaintenanceStatus();
        });

        window.addEventListener('pageshow', (event) => {
            if (event.persisted) {
                setOpenMobCardNo(null);
                document.querySelectorAll('.expandable-panel.open').forEach(el => el.classList.remove('open'));
            }
        });

        initHeaderObserver();

        window.addEventListener('initialDataLoaded', () => {
            try {
                renderMaintenanceStatus();
            } catch (e) {
                console.error("Initial maintenance render failed:", e);
            }
        }, { once: true });

        const loadingTimeout = setTimeout(() => {
            const overlay = document.getElementById("loading-overlay");
            if (overlay && !overlay.classList.contains("hidden")) {
                console.warn("Loading timeout: Forcing UI display.");
                if (!getState().initialLoadComplete) {
                    window.dispatchEvent(new CustomEvent('initialDataLoaded'));
                }
                showColumnContainer();
                overlay.classList.add("hidden");
                showToast("データ同期がタイムアウトしました。既存のデータで表示します。", "info");
            }
        }, 10000);

        window.addEventListener('initialSortComplete', () => {
            clearTimeout(loadingTimeout);
            try {
                renderMaintenanceStatus();
                showColumnContainer();

                const isFirstVisit = !localStorage.getItem("has_visited");
                if (isFirstVisit) {
                    localStorage.setItem("has_visited", "true");
                    if (window.openUserManual) {
                        window.openUserManual();
                    }
                }
            } catch (e) {
                console.error("Initial render show failed:", e);
                const overlay = document.getElementById("loading-overlay");
                if (overlay) overlay.classList.add("hidden");
            }
        }, { once: true });

        window.addEventListener('maintenanceUpdated', () => {
            renderMaintenanceStatus();
        });

    } catch (e) {
        console.error("App initialization failed:", e);
        const overlay = document.getElementById("loading-overlay");
        if (overlay) {
            overlay.classList.add("hidden");
        }
    }
}

function initHeaderObserver() {
    const header = document.getElementById("main-header");
    const main = document.querySelector("main");
    if (!header || !main) return;

    const adjustPadding = () => {
        const headerHeight = header.offsetHeight;
        const isMobile = window.innerWidth < 1024;

        if (isMobile) {
            main.style.paddingTop = "1rem";
            main.style.paddingBottom = "2.5rem";
            document.body.style.paddingBottom = `${headerHeight + 20}px`;
        } else {
            main.style.paddingTop = `${headerHeight + 10}px`;
            main.style.paddingBottom = "2.5rem";
            document.body.style.paddingBottom = "0";
        }
    };

    adjustPadding();
    const resizeObserver = new ResizeObserver(() => {
        adjustPadding();
    });
    resizeObserver.observe(header);

    window.addEventListener("resize", adjustPadding);
}

export function updateStatusContainerVisibility() {
    const container = document.getElementById("status-message");
    if (!container) return;

    const maintenanceEl = document.getElementById("status-message-maintenance");
    const telopEl = document.getElementById("status-message-telop");
    const tempEl = document.getElementById("status-message-temp");

    const hasMaintenance = maintenanceEl && maintenanceEl.innerHTML.trim() !== "";
    const hasTelop = telopEl && telopEl.textContent.trim() !== "";
    const hasTemp = tempEl && tempEl.textContent.trim() !== "" && !tempEl.classList.contains("hidden");

    if (hasMaintenance || hasTelop || hasTemp) {
        container.classList.remove("hidden");
    } else {
        container.classList.add("hidden");
    }
}

function renderMaintenanceStatus() {
    window.renderMaintenanceStatus = renderMaintenanceStatus;
    const maintenance = getState().maintenance;
    const maintenanceEl = document.getElementById("status-message-maintenance");
    const telopEl = document.getElementById("status-message-telop");

    const maintPanels = document.querySelectorAll(".js-maintenance-content");
    const telopPanels = document.querySelectorAll(".js-telop-content");

    if (!maintenanceEl) return;

    let hasMaintenance = false;
    let hasMessage = false;

    if (maintenance && maintenance.start && maintenance.end) {
        const now = new Date();
        const start = new Date(maintenance.start);
        const end = new Date(maintenance.end);
        const showFrom = new Date(start.getTime() - 7 * 24 * 60 * 60 * 1000);
        const showUntil = new Date(end.getTime() + 4 * 24 * 60 * 60 * 1000);

        const isWithinDisplayWindow = now >= showFrom && now <= showUntil;

        if (isWithinDisplayWindow) {
            maintenanceEl.innerHTML = `
                <div class="font-semibold text-red-500">
                    ${formatDate(start)} ～ ${formatDate(end)}
                </div>
            `;
            hasMaintenance = true;
        } else {
            maintenanceEl.innerHTML = "";
        }

        const startStr = formatDate(start);
        const endStr = formatDate(end);
        const maintHtml = `
            <div class="maintenance-info-rich p-2 bg-red-900/20 border border-red-500/30 rounded">
                <div class="text-[14px] font-bold text-red-400 mb-1">🛠️ メンテナンス予定</div>
                <div class="text-[13px] text-gray-100">${startStr} ～ ${endStr}</div>
                <div class="text-[11px] text-gray-400 mt-2">※メンテナンス中はタイマーが一時停止し、終了後に再開されます。</div>
            </div>
        `;
        maintPanels.forEach(p => { p.innerHTML = maintHtml; });
    } else {
        maintenanceEl.innerHTML = "";
        maintPanels.forEach(p => { p.textContent = "現在予定されているメンテナンスはありません。"; });
    }

    if (telopEl) {
        if (maintenance && maintenance.message && maintenance.message.trim() !== "") {
            telopEl.textContent = maintenance.message;
            hasMessage = true;
        } else {
            telopEl.textContent = "";
        }
    }

    telopPanels.forEach(p => {
        p.textContent = hasMessage ? maintenance.message : "";
    });

    document.querySelectorAll('.sidebar-icon-btn[data-panel="maintenance"], .mobile-footer-btn[data-panel="maintenance"]')
        .forEach(btn => btn.classList.toggle("has-alert", hasMaintenance));

    document.querySelectorAll('.sidebar-icon-btn[data-panel="telop"], .mobile-footer-btn[data-panel="telop"]')
        .forEach(btn => btn.classList.toggle("has-alert", hasMessage));

    const errorLogCount = window.errorLog ? window.errorLog.length : 0;
    const hasError = errorLogCount > 0;
    document.querySelectorAll('.sidebar-icon-btn, .mobile-footer-btn').forEach(btn => {
        const panel = btn.dataset.panel;
        if (panel !== "error" && panel !== "telop" && panel !== "maintenance") {
            btn.classList.remove("has-alert");
        }
    });

    updateStatusContainerVisibility();
}

function formatDate(date) {
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const h = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${m}/${d} ${h}:${min}`;
}

function attachGlobalEventListeners() {
    let prevWidth = window.innerWidth;
    window.addEventListener("resize", debounce(() => {
        const currentWidth = window.innerWidth;
        if (currentWidth !== prevWidth) {
            prevWidth = currentWidth;
            sortAndRedistribute();
        }
    }, 100));

    document.addEventListener("click", (e) => {
        if (e.target.closest(".tab-button")) {
            return;
        }
        if (e.target.closest(".area-filter-btn")) {
            handleAreaFilterClick(e);
            return;
        }
    });

    DOM.colContainer.addEventListener("click", (e) => {
        if (e.target.closest(".report-side-bar")) return;
        
        if (e.target.closest("[data-toggle='card-header']")) {
            const card = e.target.closest(".mob-card");
            if (card) {
                const mobNo = parseInt(card.dataset.mobNo, 10);
                toggleCardExpand(card, mobNo);
            }
        }
    });

    if (DOM.reportForm) {
        DOM.reportForm.addEventListener("submit", handleReportSubmit);
    }

    document.addEventListener("change", async (e) => {
        if (e.target.matches("input[data-action='save-memo']")) {
            const input = e.target;
            const mobNo = parseInt(input.dataset.mobNo, 10);
            const text = input.value;

            if (!getState().isVerified) {
                input.value = "";
                openAuthModal();
                return;
            }

            await submitMemo(mobNo, text);
        }
    });

    let touchStartX = 0;
    document.addEventListener("touchstart", (e) => {
        const reportBtn = e.target.closest(".report-side-bar");
        if (reportBtn) {
            touchStartX = e.changedTouches[0].screenX;
        }
    }, { passive: true });

    document.addEventListener("touchend", (e) => {
        const reportBtn = e.target.closest(".report-side-bar");
        if (reportBtn) {
            const touchEndX = e.changedTouches[0].screenX;
            if (touchEndX - touchStartX > 30) {
                const mobNo = parseInt(reportBtn.dataset.mobNo, 10);
                const type = reportBtn.dataset.reportType;
                if (type === 'modal') {
                    openReportModal(mobNo);
                } else {
                    reportBtn.click();
                }
            }
        }
    }, { passive: true });

    document.addEventListener("keydown", (e) => {
        if (e.target.matches("input[data-action='save-memo']")) {
            if (e.key === "Enter") {
                e.target.blur();
            }
            e.stopPropagation();
        }
    });

    document.addEventListener("click", (e) => {
        if (e.target.matches("input[data-action='save-memo']")) {
            e.stopPropagation();
        }
    });

    const backdrop = document.getElementById("card-overlay-backdrop");
    if (backdrop) {
        backdrop.addEventListener("click", () => {
            closeCard();
        });
    }

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeCard();
        }
    });
}

export function handleReportResult(result) {
    if (!result.success) {
        if (result.code === "permission-denied" || (result.error && result.error.includes("permission"))) {
            showToast("認証情報の同期エラーが発生しました。\nお手数ですが、再度認証を行ってください。", "error");
            openAuthModal();
        } else {
            showToast("レポート送信エラー: " + result.error, "error");
        }
    } else {
        showToast("討伐報告を送信しました", "success");
    }
}

export async function handleInstantReport(mobNo, rank) {
    const result = await submitReport(mobNo, new Date().toISOString());
    handleReportResult(result);
}

async function handleReportSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const mobNo = parseInt(form.dataset.mobNo, 10);
    const timeISO = form.elements["kill-time"].value;
    const result = await submitReport(mobNo, timeISO);
    handleReportResult(result);
    if (result.success) closeReportModal();
}

document.addEventListener('DOMContentLoaded', initApp);
