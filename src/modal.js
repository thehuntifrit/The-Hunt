// modal.js

import { DOM } from "./uiRender.js";
import { getState } from "./dataManager.js";
import { toJstAdjustedIsoString } from "./cal.js";
import { submitReport, getServerTimeUTC } from "./server.js";

async function openReportModal(mobNo) {
    const mob = getState().mobs.find(m => m.No === mobNo);
    if (!mob) return;
    const serverDateUTC = await getServerTimeUTC();
    const iso = toJstAdjustedIsoString(serverDateUTC);

    DOM.reportForm.dataset.mobNo = String(mobNo);
    DOM.modalMobName.textContent = `${mob.Name}`;
    DOM.modalTimeInput.value = iso;
    DOM.modalMemoInput.value = mob.last_kill_memo || "";
    DOM.modalMemoInput.placeholder = `任意`;
    DOM.modalStatus.textContent = "";
    DOM.reportModal.classList.remove("hidden");
    DOM.reportModal.classList.add("flex");
}

function closeReportModal() {
    DOM.reportModal.classList.add("hidden");
    DOM.reportModal.classList.remove("flex");
    DOM.modalTimeInput.value = "";
    DOM.modalMemoInput.value = "";
}

function setupModalCloseHandlers() {
    const cancelButton = document.getElementById("cancel-report");
    if (cancelButton) {
        cancelButton.addEventListener("click", closeReportModal);
    }
    DOM.reportModal.addEventListener("click", (e) => {
        if (e.target === DOM.reportModal) {
            closeReportModal();
        }
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !DOM.reportModal.classList.contains("hidden")) {
            closeReportModal();
        }
    });
}

async function handleMasterContainerClick(event) {
    const reportButton = event.target.closest('button[data-report-type]');
    if (reportButton) {
        const mobNo = parseInt(reportButton.dataset.mobNo, 10);
        const reportType = reportButton.dataset.reportType;

        if (reportType === 'instant') {
            await submitReport(mobNo, "", "");
        } else if (reportType === 'modal') {
            await openReportModal(mobNo);
        }
        return;
    }

    const cardHeader = event.target.closest('[data-toggle="card-header"]');
    if (cardHeader) {
        const card = cardHeader.closest('.mob-card');
        const mobNo = parseInt(card.dataset.mobNo, 10);
        if (card.dataset.rank === 'S') {
            // 必要なら開閉処理を追加
        }
    }
}

function setupReportListeners() {
    if (!DOM.masterContainer.dataset.delegatedListeners) {
        DOM.masterContainer.addEventListener('click', handleMasterContainerClick);
        DOM.masterContainer.dataset.delegatedListeners = 'true';
    }

    DOM.reportForm.onsubmit = async (e) => {
        e.preventDefault();
        const mobNo = parseInt(DOM.reportForm.dataset.mobNo, 10);
        const timeISO = DOM.modalTimeInput.value;
        const memo = DOM.modalMemoInput.value;
        await submitReport(mobNo, timeISO, memo);
    };
}

function initModal() {
    setupModalCloseHandlers();
    setupReportListeners();
}

export { openReportModal, closeReportModal, initModal };
