// modal.js

import { DOM as UiDOM } from "./uiRender.js";
import { getState } from "./dataManager.js";
import { formatLastKillTime } from "./cal.js";
import { processText, getValidSpawnPoints } from "./mobCard.js";
import { drawSpawnPoint } from "./location.js";
import { submitMemo } from "./server.js";


export async function openReportModal(mobNo) {
    const mob = getState().mobs.find(m => m.No === mobNo);
    if (!mob) return;

    const now = new Date();
    const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);

    UiDOM.reportForm.dataset.mobNo = String(mobNo);
    UiDOM.modalMobName.textContent = `${mob.Name}`;
    UiDOM.modalTimeInput.value = localIso;

    UiDOM.reportModal.classList.remove("hidden");
    UiDOM.reportModal.classList.add("flex");
}

export function closeReportModal() {
    UiDOM.reportModal.classList.add("hidden");
    UiDOM.reportModal.classList.remove("flex");
    UiDOM.modalTimeInput.value = "";
    UiDOM.modalStatus.textContent = "";
    UiDOM.modalForceSubmit.checked = false;
}

const cardDetailDOM = {
    modal: null,
    backdrop: null,
    mobName: null,
    area: null,
    expansion: null,
    lastKill: null,
    memo: null,
    conditionWrapper: null,
    condition: null,
    mapWrapper: null,
    mapImg: null,
    mapOverlay: null,
    accent: null,
    currentMobNo: null
};

function initCardDetailDOM() {
    cardDetailDOM.modal = document.getElementById("card-detail-modal");
    cardDetailDOM.backdrop = document.getElementById("card-overlay-backdrop");
    cardDetailDOM.mobName = document.getElementById("card-detail-mob-name");
    cardDetailDOM.area = document.getElementById("card-detail-area");
    cardDetailDOM.expansion = document.getElementById("card-detail-expansion");
    cardDetailDOM.lastKill = document.getElementById("card-detail-last-kill");
    cardDetailDOM.memo = document.getElementById("card-detail-memo");
    cardDetailDOM.conditionWrapper = document.getElementById("card-detail-condition-wrapper");
    cardDetailDOM.condition = document.getElementById("card-detail-condition");
    cardDetailDOM.mapWrapper = document.getElementById("card-detail-map-wrapper");
    cardDetailDOM.mapImg = document.getElementById("card-detail-map-img");
    cardDetailDOM.mapOverlay = document.getElementById("card-detail-map-overlay");
    cardDetailDOM.accent = document.getElementById("card-detail-accent");
}

export function openCardDetailModal(mobNo) {
    if (!cardDetailDOM.modal) initCardDetailDOM();

    const mob = getState().mobs.find(m => m.No === mobNo);
    if (!mob) return;

    cardDetailDOM.currentMobNo = mobNo;
    const rank = mob.Rank;

    cardDetailDOM.mobName.textContent = mob.Name;
    cardDetailDOM.mobName.style.color = `var(--rank-${rank.toLowerCase()})`;
    cardDetailDOM.area.textContent = mob.Area;
    cardDetailDOM.expansion.textContent = mob.Expansion;
    cardDetailDOM.lastKill.textContent = `前回: ${formatLastKillTime(mob.last_kill_time)}`;
    cardDetailDOM.memo.value = mob.memo_text || "";
    cardDetailDOM.memo.dataset.mobNo = mobNo;

    const accentColors = { S: "from-yellow-500 to-amber-600", A: "from-green-500 to-emerald-600", F: "from-indigo-500 to-purple-600" };
    cardDetailDOM.accent.className = `absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${accentColors[rank] || "from-cyan-500 to-blue-600"}`;

    if (rank === "S" && mob.Condition) {
        cardDetailDOM.conditionWrapper.classList.remove("hidden");
        cardDetailDOM.condition.innerHTML = processText(mob.Condition);
    } else {
        cardDetailDOM.conditionWrapper.classList.add("hidden");
    }

    if (rank === "S" && mob.Map) {
        cardDetailDOM.mapWrapper.classList.remove("hidden");
        cardDetailDOM.mapImg.src = `./maps/${mob.Map}`;
        cardDetailDOM.mapImg.alt = `${mob.Area} Map`;

        const state = getState();
        const mobLocationsData = state.mobLocations?.[mob.No];
        const spawnCullStatus = mobLocationsData || mob.spawn_cull_status;
        const validSpawnPoints = getValidSpawnPoints(mob, spawnCullStatus);
        const remainingCount = validSpawnPoints.length;
        const isLastOne = remainingCount === 1;

        const spawnPointsHtml = (mob.spawn_points ?? []).map(point => {
            const isThisPointTheLastOne = isLastOne && point.id === validSpawnPoints[0]?.id;
            return drawSpawnPoint(
                point, spawnCullStatus, mob.No,
                point.mob_ranks.includes("B2") ? "B2" : point.mob_ranks.includes("B1") ? "B1" : point.mob_ranks[0],
                isThisPointTheLastOne, isLastOne
            );
        }).join("");
        cardDetailDOM.mapOverlay.innerHTML = spawnPointsHtml;
    } else {
        cardDetailDOM.mapWrapper.classList.add("hidden");
    }

    cardDetailDOM.backdrop.classList.remove("hidden");
    cardDetailDOM.modal.classList.remove("hidden");
    cardDetailDOM.modal.classList.add("flex");
}

export function closeCardDetailModal() {
    if (!cardDetailDOM.modal) return;
    cardDetailDOM.modal.classList.add("hidden");
    cardDetailDOM.modal.classList.remove("flex");
    cardDetailDOM.backdrop.classList.add("hidden");
    cardDetailDOM.currentMobNo = null;
}

export function initModal() {
    initCardDetailDOM();

    const cancelReportBtn = document.getElementById("cancel-report");
    if (cancelReportBtn) {
        cancelReportBtn.addEventListener("click", closeReportModal);
    }
    UiDOM.reportModal.addEventListener("click", (e) => {
        if (e.target === UiDOM.reportModal) {
            closeReportModal();
        }
    });

    const closeCardDetailBtn = document.getElementById("close-card-detail");
    if (closeCardDetailBtn) {
        closeCardDetailBtn.addEventListener("click", closeCardDetailModal);
    }
    cardDetailDOM.modal?.addEventListener("click", (e) => {
        if (e.target === cardDetailDOM.modal) {
            closeCardDetailModal();
        }
    });
    cardDetailDOM.backdrop?.addEventListener("click", closeCardDetailModal);

    cardDetailDOM.memo?.addEventListener("change", async () => {
        const mobNo = parseInt(cardDetailDOM.memo.dataset.mobNo, 10);
        const text = cardDetailDOM.memo.value;
        await submitMemo(mobNo, text);
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            if (!UiDOM.reportModal.classList.contains("hidden")) closeReportModal();
            if (!cardDetailDOM.modal?.classList.contains("hidden")) closeCardDetailModal();
        }
    });
}
