// app.js

import { loadBaseMobData, startRealtime, setOpenMobCardNo, getState, setUserId, setLodestoneId, setCharacterName, setVerified } from "./dataManager.js";
import { initializeAuth, getUserData, submitReport, submitMemo } from "./server.js";
import { openReportModal, closeReportModal, initModal, openAuthModal } from "./modal.js";
import { renderRankTabs, handleAreaFilterClick, updateFilterUI } from "./filterUI.js";
import { DOM, sortAndRedistribute, showColumnContainer, updateHeaderTime } from "./uiRender.js";
import { debounce } from "./cal.js";
import { initTooltip } from "./tooltip.js";
import { initGlobalMagnifier } from "./magnifier.js";
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
        attachGlobalEventListeners();
        attachSidebarLogic();

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

    const infoBtn = document.getElementById("sidebar-info-btn");
    if (infoBtn) {
        if (hasMessage) infoBtn.classList.add("is-active");
        else infoBtn.classList.remove("is-active");
    }

    const maintBtn = document.getElementById("sidebar-maintenance-btn");
    if (maintBtn) {
        if (hasMaintenance) maintBtn.classList.add("is-active");
        else maintBtn.classList.remove("is-active");
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

function attachSidebarLogic() {
    const submenu = document.getElementById('sidebar-submenu');
    const submenuTitle = document.getElementById('submenu-title');
    const closeBtn = document.getElementById('submenu-close-btn');

    const sections = {
        info: document.getElementById('submenu-content-info'),
        maintenance: document.getElementById('submenu-content-maintenance'),
        select: document.getElementById('submenu-content-select'),
        readme: document.getElementById('submenu-content-readme')
    };

    let currentOpen = null;

    function openSubmenu(key, titleText) {
        if (currentOpen === key) {
            closeSubmenu();
            return;
        }
        currentOpen = key;
        if (submenuTitle) submenuTitle.textContent = titleText;
        Object.values(sections).forEach(sec => {
            if (sec) {
                if (sec === sections[key]) {
                    sec.classList.remove('hidden');
                    if (key === 'select') sec.classList.add('flex');
                } else {
                    sec.classList.add('hidden');
                    if (key === 'select') sec.classList.remove('flex');
                }
            }
        });
        if (submenu) submenu.classList.remove('-translate-x-full');
    }

    function closeSubmenu() {
        currentOpen = null;
        if (submenu) submenu.classList.add('-translate-x-full');
    }

    if (closeBtn) closeBtn.addEventListener('click', closeSubmenu);

    const infoBtn = document.getElementById('sidebar-info-btn');
    if (infoBtn) {
        infoBtn.addEventListener('click', () => openSubmenu('info', 'System Information'));
    }

    const maintBtn = document.getElementById('sidebar-maintenance-btn');
    if (maintBtn) {
        maintBtn.addEventListener('click', () => openSubmenu('maintenance', 'Maintenance Info.'));
    }

    const selectBtn = document.getElementById('sidebar-select-btn');
    if (selectBtn) {
        selectBtn.addEventListener('click', () => openSubmenu('select', 'Filter Settings'));
    }

    const readmeBtn = document.getElementById('sidebar-readme-btn');
    if (readmeBtn) {
        readmeBtn.addEventListener('click', async () => {
            openSubmenu('readme', 'User Manual');
            if (window.openUserManual) {
                await window.openUserManual({ scroll: false });
            }
        });
    }

    const notifBtn = document.getElementById('sidebar-notification-btn');
    if (notifBtn) {
        const updateIconState = () => {
            const isEnabled = getState().notificationEnabled;
            if (isEnabled) {
                notifBtn.classList.remove('grayscale', 'opacity-50');
            } else {
                notifBtn.classList.add('grayscale', 'opacity-50');
            }
        };
        updateIconState();

        notifBtn.addEventListener('click', () => {
            const toggle = document.getElementById('notification-toggle');
            if (toggle) {
                toggle.checked = !toggle.checked;
                toggle.dispatchEvent(new Event('change'));
                updateIconState();
            }
        });
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
    });

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
    const state = getState();
    if (state.openMobCardNo === mobNo) {
        closeCard();
    } else {
        openCard(card, mobNo);
    }
}

function openCard(card, mobNo) {
    const state = getState();
    if (state.openMobCardNo && state.openMobCardNo !== mobNo) {
        closeCard();
    }

    const panelContent = card.querySelector(".expandable-panel");
    const rightDetailsPanel = document.getElementById("selected-mob-details");
    
    if (panelContent && rightDetailsPanel) {
        // 現在のカードの中身（hiddenなラッパー内の要素）を右パネルに移動
        while (panelContent.firstChild) {
            rightDetailsPanel.appendChild(panelContent.firstChild);
        }
        
        // 以前のテキスト「モブを選択してください」等を消去（最初だけ）
        const placeholder = rightDetailsPanel.querySelector(".text-center.text-gray-500");
        if (placeholder) placeholder.remove();

        // 枠ごとのアクティブ表示（任意）
        card.classList.add("bg-slate-800");
        card.classList.remove("bg-slate-900");
        
        setOpenMobCardNo(mobNo);
    }
}

function closeCard() {
    const state = getState();
    if (!state.openMobCardNo) return;
    
    const card = document.querySelector(`.mob-card[data-mob-no="${state.openMobCardNo}"]`);
    const rightDetailsPanel = document.getElementById("selected-mob-details");
    
    if (card && rightDetailsPanel) {
        const panelContent = card.querySelector(".expandable-panel");
        if (panelContent) {
            // 右パネルの中身を元のカードの中へ戻す
            while (rightDetailsPanel.firstChild) {
                panelContent.appendChild(rightDetailsPanel.firstChild);
            }
        }
        card.classList.remove("bg-slate-800");
        card.classList.add("bg-slate-900");
    } else if (rightDetailsPanel) {
        // カードが見つからなくても中身はクリアする
        rightDetailsPanel.innerHTML = '';
    }
    
    // 表示プレースホルダーを戻す
    if (rightDetailsPanel && rightDetailsPanel.childNodes.length === 0) {
        rightDetailsPanel.innerHTML = '<div class="text-center text-gray-500 mt-20 text-sm">モブを選択してください</div>';
    }

    setOpenMobCardNo(null);
}

function handleReportResult(result) {
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

async function handleInstantReport(mobNo, rank) {
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
