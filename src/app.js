
// app.js

import { getState, setFilter, loadBaseMobData, setOpenMobCardNo, FILTER_TO_DATA_RANK_MAP, setUserId, startRealtime } from "./dataManager.js";
import { openReportModal, closeReportModal, initModal } from "./modal.js";
import { attachLocationEvents } from "./location.js";
import { submitReport, toggleCrushStatus, initializeAuth } from "./server.js";
import { debounce, toJstAdjustedIsoString, } from "./cal.js";
import { DOM, filterAndRender, sortAndRedistribute } from "./uiRender.js";
import { renderRankTabs, renderAreaFilterPanel, updateFilterUI, handleAreaFilterClick } from "./filterUI.js";

async function loadMaintenance() {
    try {
        const res = await fetch('./maintenance.json', { cache: 'no-store' });
        if (!res.ok) return null;
        const data = await res.json();

        const start = new Date(data.maintenance.start);
        const end = new Date(data.maintenance.end);
        const serverUp = new Date(data.maintenance.serverUp);
        const now = new Date();

        const showFrom = new Date(start.getTime() - 7 * 24 * 60 * 60 * 1000);
        const showUntil = new Date(end.getTime() + 4 * 24 * 60 * 60 * 1000);

        if (now >= showFrom && now <= showUntil) {
            renderStatusBar(start, end, serverUp);
        } else {
            clearStatusBar();
        }

        if (now >= start && now < serverUp) {
            updateMobCards();
        }

        // 計算用に返す値
        return {
            start,
            end,
            serverUp,
            serverUpSec: serverUp.getTime() / 1000
        };

    } catch (err) {
        console.error('maintenance.json 読み込み失敗:', err);
        return null;
    }
}


function renderStatusBar(start, end, serverUp) {
    const el = document.getElementById('status-message');
    if (!el) return;
    el.innerHTML = `
    <div class="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3">
      <div class="font-semibold">メンテナンス予定: ${formatDate(start)} ～ ${formatDate(end)}</div>
      <div class="text-gray-300">サーバー起動: ${formatDate(serverUp)}</div>
    </div>
  `;
    el.classList.remove('hidden');
}

function clearStatusBar() {
    const el = document.getElementById('status-message');
    if (!el) return;
    el.innerHTML = '';
}

function updateMobCards() {
    document.querySelectorAll('.mob-card').forEach(card => {
        card.classList.add('mob-card-disabled');
    });
}

function formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const h = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${y}/${m}/${d} ${h}:${min}`;
}

function attachFilterEvents() {
    const tabs = document.getElementById("rank-tabs");
    if (!tabs) return;

    tabs.addEventListener("click", (e) => {
        const btn = e.target.closest(".tab-button");
        if (!btn) return;

        const newRank = btn.dataset.rank.toUpperCase();
        const state = getState();

        const nextAreaSets = { ...state.filter.areaSets };
        if (!(nextAreaSets[newRank] instanceof Set)) {
            nextAreaSets[newRank] = new Set();
        }

        setFilter({
            rank: newRank,
            areaSets: nextAreaSets
        });
        filterAndRender();
    });

    document.getElementById("area-filter-panel-mobile")?.addEventListener("click", handleAreaFilterClick);
    document.getElementById("area-filter-panel-desktop")?.addEventListener("click", handleAreaFilterClick);

}

function attachCardEvents() {
    DOM.colContainer.addEventListener("click", e => {
        const card = e.target.closest(".mob-card");
        if (!card) return;
        const mobNo = parseInt(card.dataset.mobNo, 10);
        const rank = card.dataset.rank;

        const reportBtn = e.target.closest("button[data-report-type]");
        if (reportBtn) {
            e.stopPropagation();
            const type = reportBtn.dataset.reportType;
            if (type === "modal") {
                openReportModal(mobNo);
            } else if (type === "instant") {
                const iso = toJstAdjustedIsoString(new Date());
                submitReport(mobNo, iso, `${rank}ランク即時報告`);
            }
            return;
        }

        const point = e.target.closest(".spawn-point");
        if (point && point.dataset.isInteractive === "true") {
            e.preventDefault();
            e.stopPropagation();
            const locationId = point.dataset.locationId;
            const isCurrentlyCulled = point.dataset.isCulled === "true";
            toggleCrushStatus(mobNo, locationId, isCurrentlyCulled);
            return;
        }

        if (e.target.closest("[data-toggle='card-header']")) {
            if (rank === "S") {
                const panel = card.querySelector(".expandable-panel");
                if (panel) {
                    if (!panel.classList.contains("open")) {
                        document.querySelectorAll(".expandable-panel.open").forEach(p => {
                            if (p.closest(".mob-card") !== card) p.classList.remove("open");
                        });
                        panel.classList.add("open");
                        setOpenMobCardNo(mobNo);
                    } else {
                        panel.classList.remove("open");
                        setOpenMobCardNo(null);
                    }
                }
            }
        }
    });
}

function attachWindowResizeEvents() {
    window.addEventListener("resize", debounce(() => sortAndRedistribute(), 200));
}

async function handleReportSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const mobNo = parseInt(form.dataset.mobNo, 10);
    const timeISO = form.elements["kill-time"].value;
    const memo = form.elements["kill-memo"].value;

    await submitReport(mobNo, timeISO, memo);
}

function attachEventListeners() {
    renderRankTabs();
    attachFilterEvents();
    attachCardEvents();
    attachWindowResizeEvents();
    attachLocationEvents();

    if (DOM.reportForm) {
        DOM.reportForm.addEventListener("submit", handleReportSubmit);
    }
}

async function initializeAuthenticationAndRealtime() {
    try {
        const userId = await initializeAuth();
        setUserId(userId);
        startRealtime();
        console.log("App: 認証とリアルタイム購読を開始しました。");
    } catch (error) {
        console.error("App: 認証処理中にエラーが発生しました。", error);
        setUserId(null);
    }
}


document.addEventListener('DOMContentLoaded', () => {
    initializeAuthenticationAndRealtime();
    attachEventListeners?.();
    loadBaseMobData?.();
    initModal?.();
    loadMaintenance();

    const currentRank = JSON.parse(localStorage.getItem('huntFilterState'))?.rank || 'ALL';
    DOM?.rankTabs?.querySelectorAll('.tab-button').forEach(btn => {
        btn.dataset.clickCount = btn.dataset.rank === currentRank ? '1' : '0';
    });
});

export { attachEventListeners, updateMobCards, loadMaintenance };
