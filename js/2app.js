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

document.addEventListener('DOMContentLoaded', initApp);


export const sortAndRedistribute = (options = {}) => {
    const { immediate = false } = options;
    const run = () => {
        filterAndRender();
        if (isInitialLoading) {
            isInitialLoading = false;
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    window.dispatchEvent(new CustomEvent('initialSortComplete'));
                });
            });
        }
    };

    if (immediate) {
        run();
    } else {
        debouncedSortAndRedistribute();
    }
};

const debouncedSortAndRedistribute = debounce(() => {
    sortAndRedistribute({ immediate: true });
}, 200);

let isInitialLoading = false;

window.addEventListener('initialDataLoaded', () => {
    updateHeaderTime();
    filterAndRender({ isInitialLoad: true });
    sortAndRedistribute({ immediate: true });
    updateProgressBars();
});

window.addEventListener('mobUpdated', (e) => {
    const { mobNo, mob } = e.detail;
    checkAndNotify(mob);
    const card = cardCache.get(String(mobNo));
    if (card) {
        updateCardFull(card, mob);
        invalidateSortCache();
        sortAndRedistribute();
    }
});

window.addEventListener('filterChanged', () => {
    invalidateFilterCache();
    filterAndRender();
});

window.addEventListener('mobsUpdated', () => {
    updateProgressBars();
});

window.addEventListener('locationDataReady', () => {
    updateVisibleCards();
});

window.addEventListener('locationsUpdated', () => {
    invalidateFilterCache();
    updateVisibleCards();
});

setInterval(() => {
    updateProgressBars();
}, 1000);

setInterval(() => {
    if (typeof updateHeaderTime === 'function') {
        updateHeaderTime();
    }
}, 2917);

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
