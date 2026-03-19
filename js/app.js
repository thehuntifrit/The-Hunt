// app.js

import { loadBaseMobData, startRealtime, setOpenMobCardNo, getState, setUserId, setLodestoneId, setCharacterName, setVerified } from "./dataManager.js";
import { initializeAuth, getUserData, submitReport, submitMemo } from "./server.js";
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
        attachGlobalEventListeners();

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

        window.addEventListener('initialSortComplete', () => {
            try {
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
    const maintenance = getState().maintenance;
    const maintenanceEl = document.getElementById("status-message-maintenance");
    const telopEl = document.getElementById("status-message-telop");

    if (!maintenanceEl) return;

    let hasMaintenance = false;
    let hasMessage = false;

    if (maintenance && maintenance.start && maintenance.end) {
        const now = new Date();
        const start = new Date(maintenance.start);
        const end = new Date(maintenance.end);
        const showFrom = new Date(start.getTime() - 7 * 24 * 60 * 60 * 1000);
        const showUntil = new Date(end.getTime() + 4 * 24 * 60 * 60 * 1000);

        if (now >= showFrom && now <= showUntil) {
            maintenanceEl.innerHTML = `
                <div class="font-semibold text-red-500">
                    メンテ日時 ${formatDate(start)} ～ ${formatDate(end)}
                </div>
            `;
            hasMaintenance = true;
        } else {
            maintenanceEl.innerHTML = "";
        }
    } else {
        maintenanceEl.innerHTML = "";
    }

    if (telopEl) {
        if (maintenance && maintenance.message && maintenance.message.trim() !== "") {
            telopEl.textContent = maintenance.message;
            hasMessage = true;
        } else {
            telopEl.textContent = "";
        }
    }

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

    if (DOM.pcLeftList) {
        DOM.pcLeftList.addEventListener("click", (e) => {
            const reportBtn = e.target.closest(".pc-list-report-btn");
            const item = e.target.closest(".pc-list-item");
            if (!item) return;

            const mobNo = parseInt(item.dataset.mobNo, 10);
            const rank = item.dataset.rank;

            if (reportBtn) {
                e.stopPropagation();
                if (!getState().isVerified) {
                    openAuthModal();
                    return;
                }
                if (rank === 'A') {
                    handleInstantReport(mobNo, rank);
                } else {
                    openReportModal(mobNo);
                }
                return;
            }

            const { openMobCardNo } = getState();

            if (openMobCardNo === mobNo) {
                setOpenMobCardNo(null);
            } else {
                setOpenMobCardNo(mobNo);
            }
            sortAndRedistribute();
        });
    }

    if (DOM.pcRightDetail) {
        DOM.pcRightDetail.addEventListener("click", (e) => {
            const card = e.target.closest(".mob-card");
            if (!card) return;

            const mobNo = parseInt(card.dataset.mobNo, 10);
            const rank = card.dataset.rank;

            const reportBtn = e.target.closest(".report-side-bar");
            if (reportBtn) {
                e.stopPropagation();
                if (!getState().isVerified) {
                    openAuthModal();
                    return;
                }
                const type = reportBtn.dataset.reportType;
                if (type === "modal") {
                    openReportModal(mobNo);
                } else if (type === "instant") {
                    handleInstantReport(mobNo, rank);
                }
                return;
            }
        });
    }

    DOM.colContainer.addEventListener("click", (e) => {
        const card = e.target.closest(".mob-card");
        if (!card) return;

        const mobNo = parseInt(card.dataset.mobNo, 10);
        const rank = card.dataset.rank;

        const reportBtn = e.target.closest(".report-side-bar");
        if (reportBtn) {
            e.stopPropagation();
            if (!getState().isVerified) {
                openAuthModal();
                return;
            }
            const type = reportBtn.dataset.reportType;
            if (type === "modal") {
                openReportModal(mobNo);
            } else if (type === "instant") {
                handleInstantReport(mobNo, rank);
            }
            return;
        }

        if (e.target.closest("[data-toggle='card-header']")) {
            toggleCardExpand(card, mobNo);
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
            closeActiveCard();
        });
    }

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeActiveCard();
        }
    });
}

function closeActiveCard() {
    closeCard();
}

function toggleCardExpand(card, mobNo) {
    if (card.dataset.isTransitioning === "true") return;

    if (card.classList.contains("is-floating-active")) {
        closeCard();
    } else {
        openCard(card, mobNo);
    }
}

function openCard(card, mobNo) {
    if (card.dataset.isTransitioning === "true") return;

    document.querySelectorAll(".mob-card.is-floating-active").forEach(existing => {
        closeCard(existing, true);
    });

    const panel = card.querySelector(".expandable-panel");
    const rect = card.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const top = rect.top;
    const left = rect.left;

    const placeholder = document.createElement("div");
    placeholder.className = "mob-card-placeholder mob-card";
    placeholder.style.width = `${width}px`;
    placeholder.style.height = `${height}px`;
    placeholder.style.margin = getComputedStyle(card).margin;

    card.parentNode.insertBefore(placeholder, card);
    card.dataset.placeholderId = "temp-" + Date.now();
    placeholder.id = card.dataset.placeholderId;

    const targetLeft = (window.innerWidth - width) / 2;
    const header = document.getElementById("main-header");
    const headerHeight = header ? header.offsetHeight : 0;
    const isMobile = window.innerWidth < 1024;
    const targetTop = isMobile ? 12 : headerHeight + 24;

    card.classList.add("is-floating-active");
    card.style.position = "fixed";
    card.style.top = `${targetTop}px`;
    card.style.left = `${targetLeft}px`;
    card.style.width = `${width}px`;
    card.style.zIndex = "45";
    card.style.margin = "0";
    card.dataset.isTransitioning = "true";

    const dx = left - targetLeft;
    const dy = top - targetTop;

    card.style.transition = "none";
    card.style.transform = `translate(${dx}px, ${dy}px)`;

    void card.offsetWidth;

    requestAnimationFrame(() => {
        panel.classList.add("open");
        setOpenMobCardNo(mobNo);
        const backdrop = document.getElementById("card-overlay-backdrop");
        backdrop?.classList.remove("hidden");

        card.style.transition = "";
        card.style.transform = `translate(0, 0)`;

        setTimeout(() => {
            delete card.dataset.isTransitioning;
            card.style.transform = "";
        }, 500);
    });
}

function closeCard(cardToClose = null, immediate = false) {
    const card = cardToClose || document.querySelector(".mob-card.is-floating-active");
    if (!card) return;
    if (!immediate && card.dataset.isTransitioning === "true") return;

    const panel = card.querySelector(".expandable-panel");
    const backdrop = document.getElementById("card-overlay-backdrop");
    const placeholderId = card.dataset.placeholderId;
    const placeholder = document.getElementById(placeholderId);

    setOpenMobCardNo(null);
    backdrop?.classList.add("hidden");

    if (!placeholder) {
        card.classList.remove("is-floating-active");
        card.style = "";
        delete card.dataset.isTransitioning;
        return;
    }

    if (immediate) {
        finishClose(card, placeholder);
        return;
    }

    card.dataset.isTransitioning = "true";
    panel.classList.remove("open");

    const rect = placeholder.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();

    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;

    card.classList.remove("is-floating-active");
    card.style.position = "absolute";
    card.style.top = `${rect.top + scrollY}px`;
    card.style.left = `${rect.left + scrollX}px`;
    card.style.width = `${rect.width}px`;

    const dx = cardRect.left - rect.left;
    const dy = cardRect.top - rect.top;

    card.style.transition = "none";
    card.style.transform = `translate(${dx}px, ${dy}px)`;

    void card.offsetWidth;

    card.style.transition = "";
    card.style.transform = "translate(0, 0)";

    let finished = false;
    const timer = setTimeout(() => {
        if (!finished) {
            finished = true;
            finishClose(card, placeholder);
        }
    }, 450);

    const onEnd = (e) => {
        if (e.propertyName === 'transform') {
            if (!finished) {
                finished = true;
                clearTimeout(timer);
                card.removeEventListener("transitionend", onEnd);
                finishClose(card, placeholder);
            }
        }
    };
    card.addEventListener("transitionend", onEnd);
}

function finishClose(card, placeholder) {
    if (!card.parentElement) return;

    card.style = "";
    card.classList.remove("is-floating-active");
    delete card.dataset.placeholderId;
    delete card.dataset.isTransitioning;

    if (placeholder && placeholder.parentElement) {
        placeholder.parentElement.removeChild(placeholder);
    }

    document.querySelectorAll(`.mob-card-placeholder`).forEach(p => {
        const owner = document.querySelector(`.mob-card[data-placeholder-id='${p.id}']`);
        if (!owner) {
            p.remove();
        }
    });

    if (!document.querySelector(".mob-card.is-floating-active")) {
        const backdrop = document.getElementById("card-overlay-backdrop");
        backdrop?.classList.add("hidden");
    }
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
