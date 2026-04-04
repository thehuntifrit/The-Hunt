import { loadBaseMobData, startRealtime, setOpenMobCardNo, getState, setUserId, setLodestoneId, setCharacterName, setVerified } from "./dataManager.js";
import { initializeAuth, getUserData, submitReport, submitMemo } from "./server.js";
import { attachMobCardEvents } from "./mobCard.js";
import { attachLocationEvents } from "./location.js";
import { openReportModal, closeReportModal, initModal, openAuthModal } from "./modal.js";
import { handleAreaFilterClick } from "./filterUI.js";
import { DOM, sortAndRedistribute, showColumnContainer, updateHeaderTime, escapeHtml } from "./uiRender.js";
import { debounce, formatMMDDHHmm } from "./cal.js";
import { initTooltip } from "./tooltip.js";
import { initGlobalMagnifier } from "./magnifier.js";
import { initSidebar } from "./sidebar.js";
import "./readme.js";
import { initNotification } from "./notificationManager.js";

export function showToast(message, type = "error") {
    if (type === "error") {
        console.error(message);
    }
    let container = document.getElementById("toast-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        container.className = "toast-container-wrapper";
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    const colorClass = type === "error" ? "toast-error" : "toast-success";
    toast.className = `toast-item-base ${colorClass} opacity-0 translate-x-full`;
    toast.textContent = message;
    toast.classList.add("whitespace-pre-wrap");

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
        setOpenMobCardNo(null);
        initModal();
        renderMaintenanceStatus();
        updateHeaderTime();
        initSidebar();
        initNotification();
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

    } catch (e) {
        console.error("App initialization failed:", e);
        const overlay = document.getElementById("loading-overlay");
        if (overlay) {
            overlay.classList.add("hidden");
        }
    }
}

async function getMaintenanceStatus() {
    const state = getState();
    const maintenance = state.maintenance;

    if (!maintenance || !maintenance.start || !maintenance.end) {
        return {
            is_active: false,
            scheduled: false,
            message: maintenance ? maintenance.message : ""
        };
    }

    const now = new Date();
    const start = new Date(maintenance.start);
    const end = new Date(maintenance.end);
    const showFrom = new Date(start.getTime() - 7 * 24 * 60 * 60 * 1000);
    const showUntil = new Date(end.getTime() + 4 * 24 * 60 * 60 * 1000);

    const isWithinDisplayWindow = now >= showFrom && now <= showUntil;

    let status = {
        is_active: false,
        scheduled: false,
        start_time: maintenance.start,
        end_time: maintenance.end,
        message: maintenance.message || ""
    };

    if (isWithinDisplayWindow) {
        if (now >= start && now <= end) {
            status.is_active = true;
        } else if (now < start) {
            status.scheduled = true;
        }
    }

    return status;
}

export async function renderMaintenanceStatus() {
    window.renderMaintenanceStatus = renderMaintenanceStatus;

    const state = getState();
    const maintenance = await getMaintenanceStatus();
    const maintenanceEl = document.getElementById("status-message-maintenance");
    const telopEl = document.getElementById("status-message-telop");

    const maintPanels = document.querySelectorAll(".js-maintenance-content");
    const telopPanels = document.querySelectorAll(".js-telop-content");

    let hasMaintenance = false;
    let hasMessage = false;
    let maintMobileHtml = "";
    let maintPCHtml = "";

    if (maintenance && (maintenance.is_active || maintenance.scheduled)) {
        const start = formatMMDDHHmm(maintenance.start_time);
        const end = formatMMDDHHmm(maintenance.end_time);
        maintMobileHtml = end ? `${start} ～ ${end}` : `${start} ～`;
        maintPCHtml = end ? `${start} ～<br>&nbsp;&nbsp;&nbsp;&nbsp;${end}` : `${start} ～`;
        hasMaintenance = true;
    }

    if (maintenanceEl) {
        if (hasMaintenance) {
            maintenanceEl.textContent = maintMobileHtml;
            maintenanceEl.classList.remove("hidden");
        } else {
            maintenanceEl.textContent = "";
            maintenanceEl.classList.add("hidden");
        }
    }

    maintPanels.forEach(p => {
        if (!hasMaintenance) {
            p.textContent = "現在予定されているメンテナンスはありません";
            return;
        }
        const isPC = p.closest('#app-sidebar') || p.closest('.sidebar-panel-content');
        if (isPC) {
            p.innerHTML = maintPCHtml;
        } else {
            p.textContent = maintMobileHtml;
        }
    });

    const telopMsg = (maintenance && maintenance.message && maintenance.message.trim() !== "") ? maintenance.message : "";
    hasMessage = telopMsg !== "";

    if (telopEl) {
        if (hasMessage) {
            telopEl.textContent = telopMsg;
            telopEl.classList.remove("hidden");
        } else {
            telopEl.textContent = "";
            telopEl.classList.add("hidden");
        }
    }

    const nameToDisplay = (state.isVerified && state.characterName) ? state.characterName : "名無しさん";

    telopPanels.forEach(p => {
        p.innerHTML = "";
        const welcome = document.createElement("div");
        welcome.className = "sidebar-welcome-msg";
        welcome.textContent = `ようこそ ${nameToDisplay}`;
        p.appendChild(welcome);

        const msgSpan = document.createElement("span");
        if (telopMsg) {
            msgSpan.innerHTML = escapeHtml(telopMsg).replace(/\/\//g, "<br>");
        } else {
            msgSpan.textContent = "メッセージはありません。";
        }
        p.appendChild(msgSpan);
    });

    document.querySelectorAll('.sidebar-icon-btn[data-panel="maintenance"], .mobile-footer-btn[data-panel="maintenance"]')
        .forEach(btn => btn.classList.toggle("has-alert", hasMaintenance));

    document.querySelectorAll('.sidebar-icon-btn[data-panel="telop"], .mobile-footer-btn[data-panel="telop"]')
        .forEach(btn => btn.classList.toggle("has-alert", hasMessage));

    const errorLogCount = window.errorLog ? window.errorLog.length : 0;
    const hasError = errorLogCount > 0;
    document.querySelectorAll('.sidebar-icon-btn[data-panel="error"], .mobile-footer-btn[data-panel="error"]')
        .forEach(btn => btn.classList.toggle("has-alert", hasError));

    document.querySelectorAll('.sidebar-icon-btn[data-panel="rank"], .mobile-footer-btn[data-panel="rank"]')
        .forEach(btn => btn.classList.remove("has-alert"));
}

window.addEventListener('characterNameSet', () => {
    renderMaintenanceStatus();
});

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
        if (e.target === DOM.cardOverlayBackdrop) {
            setOpenMobCardNo(null);
            sortAndRedistribute({ immediate: true });
        }
    });

    DOM.colContainer.addEventListener("click", (e) => {
        if (e.target.closest(".report-side-bar")) return;

        if (e.target.closest("[data-toggle='card-header']")) {
            const card = e.target.closest(".mob-card");
            if (card) {
                const mobNo = parseInt(card.dataset.mobNo, 10);
                const currentOpen = getState().openMobCardNo;
                const nextOpen = (currentOpen === mobNo) ? null : mobNo;

                setOpenMobCardNo(nextOpen);
                sortAndRedistribute({ immediate: true });
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

}

export function handleReportResult(result) {
    if (!result.success) {
        if (result.code === "permission-denied" || (result.error && result.error.includes("permission"))) {
            showToast("アクセス権限エラーが発生しました。\n再度認証を行ってください。", "error");
            openAuthModal();
        } else {
            showToast("報告エラー: " + (result.error || "不明なエラー"), "error");
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
