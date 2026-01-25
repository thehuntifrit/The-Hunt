// app.js

import { loadBaseMobData, startRealtime, setOpenMobCardNo, getState, setUserId } from "./dataManager.js";
import { initializeAuth, submitReport, submitMemo } from "./server.js";
import { openReportModal, initModal } from "./modal.js";
import { renderRankTabs, handleAreaFilterClick, updateFilterUI } from "./filterUI.js";
import { DOM, sortAndRedistribute, showColumnContainer } from "./uiRender.js";
import { debounce } from "./cal.js";
import { initTooltip } from "./tooltip.js";
import { initGlobalMagnifier } from "./magnifier.js";
import "./readme.js";

async function initializeApp() {
    try {
        initTooltip();
        initGlobalMagnifier();
        await loadBaseMobData();

        const userId = await initializeAuth();
        if (userId) {
            setUserId(userId);
            startRealtime();
        }

        const storedUI = JSON.parse(localStorage.getItem("huntUIState")) || {};
        if (storedUI.clickStep !== 1) {
            storedUI.clickStep = 1;
            localStorage.setItem("huntUIState", JSON.stringify(storedUI));
        }

        renderRankTabs();
        updateFilterUI();
        initModal();
        renderMaintenanceStatus();
        attachGlobalEventListeners();
        initHeaderObserver();

        window.addEventListener('initialDataLoaded', () => {
            renderMaintenanceStatus();
            setTimeout(() => {
                showColumnContainer();
            }, 300);
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

function renderMaintenanceStatus() {
    const maintenance = getState().maintenance;
    if (!maintenance) return;

    const maintenanceEl = document.getElementById("status-message-maintenance");
    const telopEl = document.getElementById("status-message-telop");
    const container = document.getElementById("status-message");

    if (!maintenanceEl || !container) return;

    const now = new Date();
    let hasMaintenance = false;
    let hasMessage = false;

    if (maintenance.start && maintenance.end) {
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
    }

    if (telopEl) {
        if (maintenance.message && maintenance.message.trim() !== "") {
            telopEl.textContent = maintenance.message;
            hasMessage = true;
        } else {
            telopEl.textContent = "";
        }
    }

    if (hasMaintenance || hasMessage) {
        container.classList.remove("hidden");
    } else {
        container.classList.add("hidden");
    }
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
        const card = e.target.closest(".mob-card");
        if (!card) return;

        const mobNo = parseInt(card.dataset.mobNo, 10);
        const rank = card.dataset.rank;

        const reportBtn = e.target.closest(".report-side-bar");
        if (reportBtn) {
            e.stopPropagation();
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
    const isMobile = window.innerWidth < 1024;
    if (isMobile) {

        const openPanel = document.querySelector(".expandable-panel.open");
        if (openPanel) {
            openPanel.classList.remove("open");
            setOpenMobCardNo(null);
        }
    } else {
        closeCardPC();
    }
}

function toggleCardExpand(card, mobNo) {
    const panel = card.querySelector(".expandable-panel");
    if (!panel) return;

    const isMobile = window.innerWidth < 1024;

    if (isMobile) {
        if (!panel.classList.contains("open")) {
            document.querySelectorAll(".expandable-panel.open").forEach(p => {
                if (p.closest(".mob-card") !== card) {
                    p.classList.remove("open");
                }
            });
            panel.classList.add("open");
            setOpenMobCardNo(mobNo);

            requestAnimationFrame(() => {
                card.scrollIntoView({ behavior: "smooth", block: "start" });
            });
        } else {
            panel.classList.remove("open");
            setOpenMobCardNo(null);
        }
    } else {

        if (card.classList.contains("is-centered-active")) {
            closeCardPC();
        } else {
            openCardPC(card, mobNo);
        }
    }
}

function openCardPC(card, mobNo) {

    const existing = document.querySelector(".mob-card.is-centered-active");
    if (existing) {
        closeCardPC(true);
    }

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

    card.style.position = "fixed";
    card.style.top = `${top}px`;
    card.style.left = `${left}px`;
    card.style.width = `${width}px`;
    card.style.zIndex = "100";
    card.style.margin = "0";

    requestAnimationFrame(() => {
        card.classList.add("is-centered-active");

        card.style.top = "50%";
        card.style.left = "50%";
        card.style.transform = "translate(-50%, -50%)";

        panel.classList.add("open");
        setOpenMobCardNo(mobNo);

        const backdrop = document.getElementById("card-overlay-backdrop");
        backdrop?.classList.remove("hidden");
    });
}

function closeCardPC(immediate = false) {
    const card = document.querySelector(".mob-card.is-centered-active");
    if (!card) return;

    const panel = card.querySelector(".expandable-panel");
    const backdrop = document.getElementById("card-overlay-backdrop");
    const placeholderId = card.dataset.placeholderId;
    const placeholder = document.getElementById(placeholderId);

    panel.classList.remove("open");
    setOpenMobCardNo(null);
    backdrop?.classList.add("hidden");

    if (!placeholder) {

        card.classList.remove("is-centered-active");
        card.style = "";
        return;
    }

    if (immediate) {
        finishClose(card, placeholder);
        return;
    }

    const rect = placeholder.getBoundingClientRect();
    card.classList.remove("is-centered-active");
    card.style.transform = "";
    card.style.top = `${rect.top}px`;
    card.style.left = `${rect.left}px`;
    card.style.width = `${rect.width}px`;

    card.addEventListener("transitionend", function handler() {
        card.removeEventListener("transitionend", handler);
        finishClose(card, placeholder);
    }, { once: true });

    setTimeout(() => finishClose(card, placeholder), 350);
}

function finishClose(card, placeholder) {
    if (!card.parentElement) return;

    card.style = "";
    card.classList.remove("is-centered-active");
    delete card.dataset.placeholderId;

    if (placeholder && placeholder.parentElement) {
        placeholder.parentElement.removeChild(placeholder);
    }
}

async function handleInstantReport(mobNo, rank) {
    const now = new Date();
    const iso = now.toISOString();
    await submitReport(mobNo, iso);
}

async function handleReportSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const mobNo = parseInt(form.dataset.mobNo, 10);
    const timeISO = form.elements["kill-time"].value;

    await submitReport(mobNo, timeISO);
}

document.addEventListener('DOMContentLoaded', initializeApp);
