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
        const type = reportBtn.dataset.reportType;
        if (type === "modal") {
            openReportModal(mobNo);
        } else if (type === "instant") {
            handleInstantReport(mobNo, rank);
        }
        return;
    }
}
