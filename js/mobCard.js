import { openReportModal, openAuthModal } from "./modal.js";
import { getState, setOpenMobCardNo } from "./dataManager.js";
import { sortAndRedistribute } from "./uiRender.js";
import { handleInstantReport } from "./app.js";

export function attachMobCardEvents() {
    const colContainer = document.getElementById("column-container");
    if (colContainer) {
        colContainer.addEventListener("click", handleMobCardClick);
    }

    const pcLeftList = document.getElementById("pc-left-list");
    if (pcLeftList) {
        pcLeftList.addEventListener("click", handlePCListClick);
    }

    const pcRightPane = document.getElementById("pc-right-detail");
    if (pcRightPane) {
        pcRightPane.addEventListener("click", handleMobCardClick);
    }
}

function handlePCListClick(e) {
    const item = e.target.closest(".pc-list-item");
    if (!item) return;

    const mobNo = parseInt(item.dataset.mobNo, 10);
    const rank = item.dataset.rank;
    const reportBtn = e.target.closest(".pc-list-report-btn");

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
    } else {
        const currentOpen = getState().openMobCardNo;
        setOpenMobCardNo(currentOpen === mobNo ? null : mobNo);
        sortAndRedistribute();
    }
}

function handleMobCardClick(e) {
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
}

export function toggleCardExpand(card, mobNo) {
    if (card.dataset.isTransitioning === "true") return;
    if (card.classList.contains("is-floating-active")) {
        closeCard();
    } else {
        openCard(card, mobNo);
    }
}

export function openCard(card, mobNo) {
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

export function closeCard(cardToClose = null, immediate = false) {
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
