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

    const mobileOverlay = document.getElementById("mobile-detail-overlay");
    if (mobileOverlay) {
        mobileOverlay.addEventListener("click", handleMobCardClick);
    }

    const overlayBackdrop = document.getElementById("card-overlay-backdrop");
    if (overlayBackdrop) {
        overlayBackdrop.addEventListener("click", (e) => {
            if (e.target === overlayBackdrop || e.target === mobileOverlay) {
                setOpenMobCardNo(null);
                sortAndRedistribute({ immediate: true });
            }
        });
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
        sortAndRedistribute({ immediate: true });
    }
}

function handleMobCardClick(e) {
    const card = e.target.closest(".mob-card, .pc-detail-card");
    if (!card) return;

    const mobNo = parseInt(card.dataset.mobNo, 10);
    const rank = card.dataset.rank;

    const reportBtn = e.target.closest(".report-side-bar, .pc-list-report-btn");
    if (reportBtn) {
        e.stopPropagation();
        if (!getState().isVerified) {
            openAuthModal();
            return;
        }

        const mobNoFromBtn = parseInt(reportBtn.dataset.mobNo, 10) || mobNo;
        const type = reportBtn.dataset.reportType;

        if (type === "modal") {
            openReportModal(mobNoFromBtn);
        } else if (type === "instant") {
            handleInstantReport(mobNoFromBtn, rank);
        }
        return;
    }

    const closeBtn = e.target.closest('[data-action="close-card"]');
    if (closeBtn) {
        e.stopPropagation();
        setOpenMobCardNo(null);
        sortAndRedistribute({ immediate: true });
        return;
    }
}
