import { getState, setFilter, EXPANSION_MAP, setNotificationEnabled, setNotificationVolume, safeJsonParse, RANKS, CONFIG, DOM, handleAppError, setTelopRead, mobAliasMap } from "./dataManager";
import { filterAndRender } from "./app";
import { openUserManual, closeUserManual } from "./readme";
import { cloneTemplate } from "./mobCard";
import { now as serverNow } from "./servertime";
import { Mob } from "./types/mob";

// ─── 定数・DOM ──────────────────────────────────────────
const SOUND_FILE = "./sound/01 FFXIV_Linkshell_Transmission.mp3";

let audioCtx: AudioContext | null = null;
let audioBuffer: AudioBuffer | null = null;
let audioUnlocked = false;
const notifiedCycles = new Set<string>();
let currentPanel: string | null = null;
(window as any).errorLog = (window as any).errorLog || [];
const MAX_ERROR_LOG = 50;

// ─── ポップアップ表示(告知/メンテ/エラー) & PCフローティング窓 ───
const POPUP_PANELS = new Set(["telop", "maintenance", "error"]);
const desktopMq = window.matchMedia("(min-width: 900px)");
let popupBackdrop: HTMLElement | null = null;
let floatingInitialized = false;
let searchFloatingInitialized = false;
let isRankOpen = false;
let isSearchOpen = false;
let searchQuery = "";

function normalizeSearchText(str: string): string {
    return str
        .trim()
        .replace(/[\u3041-\u3096]/g, ch => String.fromCharCode(ch.charCodeAt(0) + 0x60))
        .toLowerCase();
}

function getMainPanelEl(): HTMLElement | null {
    return (document.getElementById("appnav-panel") || DOM.appNav?.querySelector(".appnav-panel")) as HTMLElement | null;
}

function getRankPanelEl(): HTMLElement | null {
    return document.getElementById("appnav-rank-panel") as HTMLElement | null;
}

function getSearchPanelEl(): HTMLElement | null {
    return document.getElementById("appnav-search-panel") as HTMLElement | null;
}

function attachPanelChrome(panelEl: HTMLElement | null, onClose: () => void): void {
    if (!panelEl || panelEl.dataset.chromeAttached === "1") return;
    panelEl.dataset.chromeAttached = "1";

    ["tl", "tr", "bl", "br"].forEach(pos => {
        const corner = document.createElement("i");
        corner.className = `ff-corner ${pos}`;
        panelEl.appendChild(corner);
    });

    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "appnav-popup-close";
    closeBtn.setAttribute("aria-label", "閉じる");
    closeBtn.textContent = "✕";
    closeBtn.addEventListener("click", onClose);
    panelEl.appendChild(closeBtn);
}

function getDefaultFloatingPos(panelArea: HTMLElement): { x: number; y: number } {
    const rect = panelArea.getBoundingClientRect();
    return {
        x: Math.round((window.innerWidth - rect.width) / 2),
        y: Math.round(window.innerHeight - rect.height - 58)
    };
}

function clampFloatingPos(x: number, y: number, panelArea: HTMLElement): { x: number; y: number } {
    const rect = panelArea.getBoundingClientRect();
    const margin = 8;
    const maxX = Math.max(margin, window.innerWidth - rect.width - margin);
    const maxY = Math.max(margin, window.innerHeight - rect.height - margin);
    return {
        x: Math.min(Math.max(margin, Math.round(x)), maxX),
        y: Math.min(Math.max(margin, Math.round(y)), maxY)
    };
}

function applyFloatingPosition(panelArea: HTMLElement, posKey: "rankWindowPos" | "searchWindowPos" = "rankWindowPos"): void {
    if (!panelArea.classList.contains("is-floating")) return;
    const stored = loadSidebarState();
    const pos = stored[posKey];
    const raw = (pos && typeof pos.x === "number" && typeof pos.y === "number")
        ? pos
        : getDefaultFloatingPos(panelArea);
    const clamped = clampFloatingPos(raw.x, raw.y, panelArea);
    panelArea.style.left = `${clamped.x}px`;
    panelArea.style.top = `${clamped.y}px`;
}

function applyRankPanelMode(): void {
    const rankPanel = getRankPanelEl();
    if (!rankPanel) return;

    const isFloating = isRankOpen && desktopMq.matches;
    const isDocked = isRankOpen && !desktopMq.matches;

    rankPanel.classList.toggle("expanded", isRankOpen);
    rankPanel.classList.toggle("is-floating", isFloating);
    rankPanel.classList.toggle("is-docked", isDocked);

    if (isFloating) {
        applyFloatingPosition(rankPanel, "rankWindowPos");
        requestAnimationFrame(() => applyFloatingPosition(rankPanel, "rankWindowPos"));
    } else {
        rankPanel.style.left = "";
        rankPanel.style.top = "";
    }

    const rankSection = document.getElementById("sidebar-panel-rank");
    rankSection?.classList.toggle("hidden", !isRankOpen);
    if (isRankOpen) {
        renderSidebarFilterAccordion();
    }

    // モバイルのドック時のみ本文余白を確保（他のパネルが開いていない場合）
    if (isDocked) {
        DOM.appNav?.classList.add("expanded");
        DOM.body.classList.add("sidebar-expanded");
    } else if (!currentPanel || POPUP_PANELS.has(currentPanel)) {
        DOM.appNav?.classList.remove("expanded");
        DOM.body.classList.remove("sidebar-expanded");
    }
}

function openRankPanel(): void {
    isRankOpen = true;
    saveState("rankOpen", true);
    applyRankPanelMode();
    setActiveNavItem(currentPanel || "home");
}

function closeRankPanel(): void {
    isRankOpen = false;
    saveState("rankOpen", false);
    applyRankPanelMode();
    setActiveNavItem(currentPanel || "home");
}

function initFloatingRankWindow(): void {
    if (floatingInitialized) return;
    const panelArea = getRankPanelEl();
    const header = document.querySelector("#sidebar-panel-rank .appnav-section-header") as HTMLElement | null;
    if (!panelArea || !header) return;
    floatingInitialized = true;

    header.addEventListener("pointerdown", (e: PointerEvent) => {
        if (e.button !== 0 || !panelArea.classList.contains("is-floating")) return;
        if ((e.target as HTMLElement).closest(".appnav-popup-close")) return;
        e.preventDefault();

        const rect = panelArea.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;
        panelArea.classList.add("is-dragging");

        const onMove = (ev: PointerEvent) => {
            const next = clampFloatingPos(ev.clientX - offsetX, ev.clientY - offsetY, panelArea);
            panelArea.style.left = `${next.x}px`;
            panelArea.style.top = `${next.y}px`;
        };

        const onEnd = () => {
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onEnd);
            window.removeEventListener("pointercancel", onEnd);
            panelArea.classList.remove("is-dragging");
            const x = parseFloat(panelArea.style.left);
            const y = parseFloat(panelArea.style.top);
            if (!Number.isNaN(x) && !Number.isNaN(y)) {
                saveState("rankWindowPos", { x, y });
            }
        };

        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onEnd);
        window.addEventListener("pointercancel", onEnd);
    });

    header.addEventListener("dblclick", () => {
        if (!panelArea.classList.contains("is-floating")) return;
        saveState("rankWindowPos", null);
        const def = getDefaultFloatingPos(panelArea);
        const clamped = clampFloatingPos(def.x, def.y, panelArea);
        panelArea.style.left = `${clamped.x}px`;
        panelArea.style.top = `${clamped.y}px`;
    });

    desktopMq.addEventListener("change", () => {
        if (isRankOpen) {
            if (!desktopMq.matches && currentPanel) {
                closePanel();
            }
            applyRankPanelMode();
        }
    });

    window.addEventListener("resize", () => {
        if (panelArea.classList.contains("is-floating")) {
            applyFloatingPosition(panelArea, "rankWindowPos");
        }
    });
}

// ─── 検索パネル（ランクフィルターと対称） ──────────────────
function applySearchPanelMode(): void {
    const searchPanel = getSearchPanelEl();
    if (!searchPanel) return;

    const isFloating = isSearchOpen && desktopMq.matches;
    const isDocked = isSearchOpen && !desktopMq.matches;

    searchPanel.classList.toggle("expanded", isSearchOpen);
    searchPanel.classList.toggle("is-floating", isFloating);
    searchPanel.classList.toggle("is-docked", isDocked);

    if (isFloating) {
        applyFloatingPosition(searchPanel, "searchWindowPos");
        requestAnimationFrame(() => applyFloatingPosition(searchPanel, "searchWindowPos"));
    } else {
        searchPanel.style.left = "";
        searchPanel.style.top = "";
    }

    const searchSection = document.getElementById("sidebar-panel-search");
    searchSection?.classList.toggle("hidden", !isSearchOpen);

    // モバイルのドック時のみ本文余白を確保
    if (isDocked) {
        DOM.appNav?.classList.add("expanded");
        DOM.body.classList.add("sidebar-expanded");
    } else if (!currentPanel || POPUP_PANELS.has(currentPanel)) {
        DOM.appNav?.classList.remove("expanded");
        DOM.body.classList.remove("sidebar-expanded");
    }
}

export function openSearchPanel(): void {
    isSearchOpen = true;
    if (desktopMq.matches) saveState("searchOpen", true);
    applySearchPanelMode();
    setActiveNavItem(currentPanel || "home");
}

export function closeSearchPanel(): void {
    isSearchOpen = false;
    if (desktopMq.matches) saveState("searchOpen", false);
    applySearchPanelMode();
    setActiveNavItem(currentPanel || "home");
}

/** モブカードを開いた時など「検索を終了」させる処理。
 *  PC: 窓は維持しつつ検索クエリだけクリア
 *  モバイル: パネルも閉じる + クリア
 */
export function dismissSearch(): void {
    clearSearch();
    if (!desktopMq.matches) {
        closeSearchPanel();
    }
}

export function clearSearch(): void {
    searchQuery = "";
    const input = document.getElementById("sidebar-search-input") as HTMLInputElement | null;
    const clearBtn = document.getElementById("sidebar-search-clear");
    const searchNavBtns = document.querySelectorAll('.appnav-btn[data-nav-id="search"]');
    if (input) input.value = "";
    clearBtn?.classList.add("hidden");
    searchNavBtns.forEach(btn => btn.classList.remove("has-alert"));
    window.dispatchEvent(new CustomEvent("filterChanged"));
}

function initFloatingSearchWindow(): void {
    if (searchFloatingInitialized) return;
    const panelArea = getSearchPanelEl();
    const header = document.querySelector("#sidebar-panel-search .appnav-section-header") as HTMLElement | null;
    if (!panelArea || !header) return;
    searchFloatingInitialized = true;

    attachPanelChrome(panelArea, closeSearchPanel);

    header.addEventListener("pointerdown", (e: PointerEvent) => {
        if (e.button !== 0 || !panelArea.classList.contains("is-floating")) return;
        if ((e.target as HTMLElement).closest(".appnav-popup-close")) return;
        e.preventDefault();

        const rect = panelArea.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;
        panelArea.classList.add("is-dragging");

        const onMove = (ev: PointerEvent) => {
            const next = clampFloatingPos(ev.clientX - offsetX, ev.clientY - offsetY, panelArea);
            panelArea.style.left = `${next.x}px`;
            panelArea.style.top = `${next.y}px`;
        };

        const onEnd = () => {
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onEnd);
            window.removeEventListener("pointercancel", onEnd);
            panelArea.classList.remove("is-dragging");
            const x = parseFloat(panelArea.style.left);
            const y = parseFloat(panelArea.style.top);
            if (!Number.isNaN(x) && !Number.isNaN(y)) {
                saveState("searchWindowPos", { x, y });
            }
        };

        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onEnd);
        window.addEventListener("pointercancel", onEnd);
    });

    header.addEventListener("dblclick", () => {
        if (!panelArea.classList.contains("is-floating")) return;
        saveState("searchWindowPos", null);
        const def = getDefaultFloatingPos(panelArea);
        const clamped = clampFloatingPos(def.x, def.y, panelArea);
        panelArea.style.left = `${clamped.x}px`;
        panelArea.style.top = `${clamped.y}px`;
    });

    desktopMq.addEventListener("change", () => {
        if (isSearchOpen) {
            if (!desktopMq.matches && currentPanel) {
                closePanel();
            }
            applySearchPanelMode();
        }
    });

    window.addEventListener("resize", () => {
        if (panelArea.classList.contains("is-floating")) {
            applyFloatingPosition(panelArea, "searchWindowPos");
        }
    });
}

function ensurePopupChrome(): void {
    const panelArea = getMainPanelEl();
    const rankPanel = getRankPanelEl();
    if (!panelArea || popupBackdrop) return;

    popupBackdrop = document.createElement("div");
    popupBackdrop.className = "appnav-backdrop";
    popupBackdrop.addEventListener("click", closePanel);
    popupBackdrop.addEventListener("wheel", (e) => e.preventDefault(), { passive: false });
    document.body.appendChild(popupBackdrop);

    attachPanelChrome(panelArea, closePanel);
    attachPanelChrome(rankPanel, closeRankPanel);
    // 検索パネルのchrome（ドラッグ用ヘッダーなど）はinitFloatingSearchWindowで初期化

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && currentPanel && POPUP_PANELS.has(currentPanel)) closePanel();
    });
}

function applyPanelMode(panelName: string | null): void {
    const nav = DOM.appNav;
    const panelArea = getMainPanelEl();
    const isPopup = !!panelName && POPUP_PANELS.has(panelName);

    panelArea?.classList.toggle("is-popup", isPopup);
    panelArea?.classList.toggle("is-docked", !!panelName && !isPopup);

    if (panelArea) {
        if (isPopup) {
            panelArea.setAttribute("role", "dialog");
            panelArea.setAttribute("aria-modal", "true");
        } else {
            panelArea.removeAttribute("role");
            panelArea.removeAttribute("aria-modal");
        }
    }
    popupBackdrop?.classList.toggle("is-open", isPopup);

    // ポップアップは下から押し上げるパネルではないので、本文の余白調整は不要
    if (isPopup) DOM.body.classList.remove("sidebar-expanded");

    // フッター以外の背面をクリック・フォーカス不可にする
    Array.from(document.body.children).forEach(el => {
        if (el === popupBackdrop || el.tagName === "SCRIPT") return;
        if (nav && el.contains(nav)) return;   // フッターを含む要素は対象外
        el.toggleAttribute("inert", isPopup);
    });
}

// ─── 通知 ───────────────────────────────────────────────
let gainNode: GainNode | null = null;

async function loadAudioBuffer(): Promise<void> {
    try {
        audioCtx = new AudioContext();
        gainNode = audioCtx.createGain();
        gainNode.gain.value = getState().notificationVolume / 100;
        gainNode.connect(audioCtx.destination);

        const res = await fetch(SOUND_FILE);
        const arrayBuf = await res.arrayBuffer();
        audioBuffer = await audioCtx.decodeAudioData(arrayBuf);
    } catch (e) {
        handleAppError(e, "通知音の読み込み失敗", false);
    }
}

function unlockAudio(): Promise<void> {
    if (audioCtx && audioCtx.state === "suspended") {
        return audioCtx.resume()
            .then(() => { audioUnlocked = audioCtx!.state === "running"; })
            .catch(err => { handleAppError(err, "音声の有効化失敗", false); });
    }
    audioUnlocked = true;
    return Promise.resolve();
}

function openVolumePopup(): void {
    DOM.notifyPopup?.classList.add('is-open');
}

function closeVolumePopup(): void {
    DOM.notifyPopup?.classList.remove('is-open');
}

export function initNotification(): void {
    loadAudioBuffer();

    const toggle = DOM.notificationToggle;
    if (!toggle) return;

    const popup = DOM.notifyPopup;
    const volSlider = DOM.volumeSlider;

    const isEnabled = getState().notificationEnabled;
    toggle.checked = isEnabled;

    const label = toggle.closest('.appnav-btn') as HTMLElement | null;
    if (label) {
        label.classList.toggle('is-disabled', !isEnabled);
    }

    // 音量スライダー初期値
    const vol = getState().notificationVolume;
    if (volSlider) {
        volSlider.value = String(vol);
        const valEl = popup?.querySelector('.js-volume-value') as HTMLElement | null;
        if (valEl) valEl.textContent = String(vol);
    }

    // ユーザー操作でAudioContext unlock
    const onFirstUserAction = () => {
        unlockAudio().then(() => {
            if (!audioUnlocked) return;   // 失敗したら次の操作で再試行
            document.removeEventListener('click', onFirstUserAction);
            document.removeEventListener('touchend', onFirstUserAction);
        });
    };
    document.addEventListener('click', onFirstUserAction);
    document.addEventListener('touchend', onFirstUserAction);

    // 通知設定変更イベント（外部からの同期用）
    window.addEventListener('notificationSettingChanged', (e: Event) => {
        const detail = (e as CustomEvent).detail;
        if (detail && typeof detail.enabled === 'boolean') {
            toggle.checked = detail.enabled;
            if (label) {
                label.classList.toggle('is-disabled', !detail.enabled);
            }
        }
    });

    // トグル変更
    toggle.addEventListener('change', () => {
        const enabled = toggle.checked;
        if (label) {
            label.classList.toggle('is-disabled', !enabled);
        }
        setNotificationEnabled(enabled);

        if (enabled) {
            requestNotificationPermission();
            const unlocking = unlockAudio();
            openVolumePopup();
            unlocking.then(() => playNotificationSound());
        } else {
            closeVolumePopup();
        }
    });

    // 長押しでスライダーを開閉（通知ONのまま音量窓だけ開きたい場合用）
    let longPressTimer: ReturnType<typeof setTimeout> | null = null;
    let isLongPress = false;
    const startLongPress = () => {
        isLongPress = false;
        longPressTimer = setTimeout(() => {
            isLongPress = true;
            if (getState().notificationEnabled) {
                if (popup?.classList.contains('is-open')) {
                    closeVolumePopup();
                } else {
                    openVolumePopup();
                }
            }
        }, 500);
    };
    const cancelLongPress = () => {
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
        }
    };

    label?.addEventListener('touchstart', startLongPress, { passive: true });
    label?.addEventListener('touchend', cancelLongPress);
    label?.addEventListener('touchmove', cancelLongPress);
    label?.addEventListener('mousedown', startLongPress);
    label?.addEventListener('mouseup', cancelLongPress);
    label?.addEventListener('mouseleave', cancelLongPress);
    label?.addEventListener('click', (e) => {
        // 音量バーが開いている間は、ベルを押しても OFF にしない
        if (popup?.classList.contains('is-open') && getState().notificationEnabled) {
            e.preventDefault();
            e.stopPropagation();
            isLongPress = false;
            return;
        }
        if (isLongPress) {
            e.preventDefault();
            e.stopPropagation();
            isLongPress = false;
        }
    });

    // 音量スライダー操作
    volSlider?.addEventListener('input', () => {
        const newVol = parseInt(volSlider.value, 10);
        const valEl = popup?.querySelector('.js-volume-value') as HTMLElement | null;
        if (valEl) valEl.textContent = String(newVol);
        setNotificationVolume(newVol);
        if (gainNode) gainNode.gain.value = newVol / 100;
    });

    // スライダー変更確定時にテスト再生
    volSlider?.addEventListener('change', () => {
        playNotificationSound();
    });

    // ポップアップ外タップ/クリックで閉じる（capture: true で他の要素の stopPropagation をすり抜ける）
    const handleOutside = (e: Event) => {
        if (!popup?.classList.contains('is-open')) return;
        const target = e.target as Node | null;
        if (!target) return;
        if (popup.contains(target) || (label && label.contains(target))) {
            return;
        }
        closeVolumePopup();
    };

    document.addEventListener('pointerdown', handleOutside, true);
    document.addEventListener('touchstart', handleOutside, true);
    document.addEventListener('click', handleOutside, true);

    // 画面スクロール時にも閉じる
    window.addEventListener('scroll', () => {
        if (popup?.classList.contains('is-open')) {
            closeVolumePopup();
        }
    }, { passive: true });
}

async function requestNotificationPermission(): Promise<void> {
    if ("Notification" in window) {
        if (Notification.permission !== "granted" && Notification.permission !== "denied") {
            await Notification.requestPermission();
        }
    }
}

export function playNotificationSound(): void {
    if (!audioCtx || !audioBuffer || !gainNode) return;
    if (!audioUnlocked) return;

    const doPlay = () => {
        const source = audioCtx!.createBufferSource();
        source.buffer = audioBuffer!;
        source.connect(gainNode!);
        source.start(0);
    };

    if (audioCtx.state === "suspended") {
        audioCtx.resume().then(doPlay).catch(err => {
            handleAppError(err, "通知音の再生失敗", false);
        });
    } else {
        doPlay();
    }
}

export async function sendBrowserNotification(title: string, body: string): Promise<void> {
    if (!getState().notificationEnabled) return;
    if (!("Notification" in window) || Notification.permission !== "granted") return;

    const options = { body, icon: "./icon/The_Hunt.png" };

    try {
        if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
            const reg = await navigator.serviceWorker.ready;
            await reg.showNotification(title, options);
        } else {
            new Notification(title, options);
        }
    } catch (err) {
        handleAppError(err, "システム通知の表示失敗", false);
    }
}

// 通知時刻ちょうどに checkAndNotify を再実行するためのタイマー。
// 周期的な更新(数秒おき)を待たずに通知できる。
// 発火時は最新の repopInfo で改めて判定するので、討伐報告などで時刻が変わっていても誤通知しない。
const recheckTimers = new Map<string, ReturnType<typeof setTimeout>>();
const RECHECK_HORIZON_MS = 10 * 60 * 1000;   // これより先の通知は、次回の checkAndNotify で仕掛ける
const RECHECK_MARGIN_MS = 30;                // タイマーが僅かに早く発火しても取りこぼさないための余裕

function scheduleRecheck(mobNo: number, key: string, delayMs: number): void {
    if (delayMs > RECHECK_HORIZON_MS) return;
    if (recheckTimers.has(key) || notifiedCycles.has(key)) return;

    const timer = setTimeout(() => {
        recheckTimers.delete(key);
        const mob = getState().mobsMap.get(String(mobNo));
        if (mob) checkAndNotify(mob);
    }, delayMs + RECHECK_MARGIN_MS);

    recheckTimers.set(key, timer);
}

function fireNotification(mob: Mob, kind: "before" | "at"): void {
    const body = kind === "before" ? `まもなく（2分前）` : `時間なう！`;
    if (window.innerWidth >= 1024) {
        sendBrowserNotification(`【POP info】 ${mob.name}`, body);
    } else {
        playNotificationSound();
    }
}

export function checkAndNotify(mob: Mob): void {
    const state = getState();
    if (!state.notificationEnabled) return;

    const info = mob.repopInfo;
    if (!info || !info.nextConditionSpawnDate || !info.conditionWindowEnd) return;

    const now = serverNow();
    const spawnTime = info.nextConditionSpawnDate.getTime();
    const endTime = info.conditionWindowEnd.getTime();
    const beforeTime = spawnTime - CONFIG.NOTIFICATION_OFFSET_MS;

    const cycleKeyBase = `${mob.No}-${spawnTime}`;
    const beforeKey = `${cycleKeyBase}-before`;
    const atKey = `${cycleKeyBase}-at`;

    if (now >= beforeTime && now < spawnTime && !notifiedCycles.has(beforeKey)) {
        fireNotification(mob, "before");
        notifiedCycles.add(beforeKey);
    }

    if (now >= spawnTime && now <= endTime && !notifiedCycles.has(atKey)) {
        fireNotification(mob, "at");
        notifiedCycles.add(atKey);
    }

    if (now > endTime) {
        if (notifiedCycles.has(beforeKey)) notifiedCycles.delete(beforeKey);
        if (notifiedCycles.has(atKey)) notifiedCycles.delete(atKey);
    }

    // 通知時刻がまだ先なら、その時刻ちょうどに再判定するタイマーを仕掛ける
    if (now < beforeTime) scheduleRecheck(mob.No, beforeKey, beforeTime - now);
    if (now < spawnTime) scheduleRecheck(mob.No, atKey, spawnTime - now);
}

// ─── フィルタ ───────────────────────────────────────────
function normalizeRank(rank: string): string {
    if (rank === RANKS.S_RANK || rank === RANKS.S) return RANKS.S;
    if (rank === RANKS.A_RANK || rank === RANKS.A) return RANKS.A;
    if (rank === RANKS.FATE || rank === RANKS.FATE_FULL || rank === RANKS.F) return RANKS.F;
    return rank;
}

const getAllAreas = (): string[] => {
    return Array.from(new Set(Object.values(EXPANSION_MAP)));
};

export const renderAreaFilterPanel = (customContainer: HTMLElement | null = null): void => {
    const stateVal = getState();
    const targetRankKey = normalizeRank(stateVal.filter.rank);

    let items: string[] = [];
    let currentSet = new Set<string>();

    if (stateVal.filter.rank === RANKS.ALL) {
        items = [RANKS.S, RANKS.A, RANKS.F];
        currentSet = stateVal.filter.allRankSet instanceof Set ? stateVal.filter.allRankSet : new Set();
    } else {
        const expansionEntries = Object.entries(EXPANSION_MAP).sort((a, b) => Number(b[0]) - Number(a[0]));
        items = expansionEntries.map(e => e[1]);
        currentSet = (stateVal.filter.areaSets as any)[targetRankKey] instanceof Set ? (stateVal.filter.areaSets as any)[targetRankKey] : new Set();
    }

    const container = customContainer || document.querySelector("#sidebar-panel-rank .area-grid-container") as HTMLElement | null;
    if (!container) return;

    container.innerHTML = "";

    items.forEach(item => {
        const isSelected = currentSet.has(item);
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = `area-filter-btn ${isSelected ? 'is-selected' : ''}`;
        btn.textContent = (stateVal.filter.rank === RANKS.FATE && item === RANKS.F) ? 'FATE' : (stateVal.filter.rank === RANKS.ALL ? (item === RANKS.F ? 'FATE' : `${item} rank`) : item);
        btn.dataset.value = item;
        container.appendChild(btn);
    });

    updateCarouselArrows();
};

export const handleRankTabClick = (rank: string): void => {
    if (!rank) return;
    const stateVal = getState();
    const prevRank = stateVal.filter.rank;

    if (prevRank === rank) {
        const nextStep = stateVal.filter.clickStep === 2 ? 1 : 2;
        setFilter({ clickStep: nextStep });
    } else {
        setFilter({
            rank,
            clickStep: 1,
            areaSets: stateVal.filter.areaSets
        });
    }

    filterAndRender();
};

export function handleAreaFilterClick(e: Event): void {
    const target = e.target as HTMLElement;
    const btn = target.closest(".area-filter-btn") as HTMLElement | null;
    if (!btn) return;
    const customContainer = btn.closest(".area-grid-container") as HTMLElement | null;

    const stateVal = getState();
    const uiRank = stateVal.filter.rank;

    if (uiRank === 'ALL') {
        const currentSet = stateVal.filter.allRankSet instanceof Set ? stateVal.filter.allRankSet : new Set<string>();
        const nextSet = new Set<string>(currentSet);
        const val = btn.dataset.value;

        if (val) {
            if (nextSet.has(val)) nextSet.delete(val);
            else nextSet.add(val);
        }

        setFilter({
            rank: uiRank,
            allRankSet: nextSet
        });

        filterAndRender();
        renderAreaFilterPanel(customContainer);
        return;
    }

    const targetRankKey = normalizeRank(uiRank);
    const currentSet =
        (stateVal.filter.areaSets as any)[targetRankKey] instanceof Set
            ? (stateVal.filter.areaSets as any)[targetRankKey]
            : new Set<string>();

    const nextAreaSets = { ...stateVal.filter.areaSets };
    const val = btn.dataset.value || btn.dataset.area;

    if (val) {
        const area = val;
        const next = new Set<string>(currentSet);
        if (next.has(area)) next.delete(area);
        else next.add(area);
        nextAreaSets[targetRankKey] = next;
    }

    setFilter({
        rank: uiRank,
        areaSets: nextAreaSets
    });

    filterAndRender();
    renderAreaFilterPanel(customContainer);
}

export function filterMobsByRankAndArea(mobs: Mob[]): Mob[] {
    const filter = getState().filter;
    const uiRank = filter.rank;
    const areaSets = filter.areaSets;
    const allRankSet = filter.allRankSet;
    const allExpansions = getAllAreas().length;

    const getMobRankKey = (rankStr: string) => {
        if (rankStr === RANKS.S || rankStr === RANKS.A) return rankStr;
        if (rankStr === RANKS.F) return RANKS.F;
        if (rankStr.startsWith('B')) return RANKS.A;
        return null;
    };

    return mobs.filter(m => {
        if (searchQuery) {
            const normalizedName = normalizeSearchText(m.name);
            // モブ名自体にヒット
            if (normalizedName.includes(searchQuery)) {
                // OK（部分一致）
            } else {
                // エイリアス辞書も検索
                const aliases = mobAliasMap.get(m.name) || [];
                const aliasHit = aliases.some(alias => normalizeSearchText(alias).includes(searchQuery));
                if (!aliasHit) return false;
            }
        }

        const mobRank = m.rank;
        const mobExpansion = m.Expansion;
        const mobRankKey = getMobRankKey(mobRank);

        if (!mobRankKey || !mobExpansion) return false;

        const filterKey = mobRankKey;

        if (uiRank === 'ALL') {
            if (filterKey !== 'S' && filterKey !== 'A' && filterKey !== 'F') return false;

            if (allRankSet && allRankSet.size < 3) {
                if (!allRankSet.has(filterKey)) return false;
            }

            const targetSet =
                areaSets?.[filterKey] instanceof Set ? areaSets[filterKey] : new Set<string>();

            if (targetSet.size === 0) return false;
            if (targetSet.size === allExpansions) return true;

            return targetSet.has(mobExpansion);
        } else {
            const normUiRank = normalizeRank(uiRank);
            const isRankMatch =
                (normUiRank === 'S' && mobRank === 'S') ||
                (normUiRank === 'A' && (mobRank === 'A' || mobRank.startsWith('B'))) ||
                (normUiRank === 'F' && mobRank === 'F');

            if (!isRankMatch) return false;

            const targetSet =
                areaSets?.[filterKey] instanceof Set ? areaSets[filterKey] : new Set<string>();

            if (targetSet.size === 0) return false;
            if (targetSet.size === allExpansions) return true;

            return targetSet.has(mobExpansion);
        }
    });
}

// ─── アプリナビ ─────────────────────────────────────────
function loadSidebarState(): any {
    return safeJsonParse(localStorage.getItem("sidebarState"), {});
}

function saveState(key: string, value: any): void {
    const s = loadSidebarState();
    s[key] = value;
    localStorage.setItem("sidebarState", JSON.stringify(s));
}

export function initAppNav(): void {
    const nav = DOM.appNav;
    if (!nav) return;

    captureErrors();
    ensurePopupChrome();
    initFloatingRankWindow();
    initFloatingSearchWindow();

    const stored = loadSidebarState();
    const shouldRestoreRank = stored.rankOpen === true || stored.panel === "rank";
    if (stored.panel === "rank") {
        saveState("panel", null);
        saveState("rankOpen", true);
    }

    if (shouldRestoreRank) {
        openRankPanel();
    } else {
        setActiveNavItem('home');
    }

    if (stored.searchOpen === true && desktopMq.matches) {
        isSearchOpen = true;
        applySearchPanelMode();
        setActiveNavItem(currentPanel || "home");
    }

    initNotification();

    nav.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const rankBtn = target.closest('.appnav-rank-tab, .appnav-rank-header') as HTMLElement | null;
        if (rankBtn) {
            e.preventDefault();
            e.stopPropagation();
            handleRankTabClick(rankBtn.dataset.rank || "");
        }
    });

    if (!isRankOpen) {
        renderSidebarFilterAccordion();
    }

    initSearchPanel();
}

function initSearchPanel(): void {
    const input = document.getElementById("sidebar-search-input") as HTMLInputElement | null;
    const clearBtn = document.getElementById("sidebar-search-clear");
    const searchNavBtns = document.querySelectorAll('.appnav-btn[data-nav-id="search"]');
    if (!input) return;

    const applySearch = () => {
        searchQuery = normalizeSearchText(input.value);
        clearBtn?.classList.toggle("hidden", input.value.length === 0);
        searchNavBtns.forEach(btn => btn.classList.toggle("has-alert", searchQuery.length > 0));
        window.dispatchEvent(new CustomEvent("filterChanged"));
    };

    input.addEventListener("input", applySearch);
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            input.blur();
        }
    });

    clearBtn?.addEventListener("click", () => {
        input.value = "";
        applySearch();
        input.focus();
    });
}

export function setActiveNavItem(id: string | null): void {
    document.querySelectorAll(".appnav-btn[data-nav-id]").forEach(btn => {
        const htmlBtn = btn as HTMLElement;
        const navId = htmlBtn.dataset.navId;
        const isActive = navId === id || (navId === "rank" && isRankOpen) || (navId === "search" && isSearchOpen);
        htmlBtn.classList.toggle("appnav-active", isActive);
    });
}

export async function togglePanel(panelName: string): Promise<void> {
    closeVolumePopup();

    // RANKフィルターはPC時は独立窓として他のボタンと独立して開閉する
    if (panelName === "rank") {
        const wasOpen = isRankOpen;
        if (!desktopMq.matches) {
            closePanel();
        }
        if (wasOpen) {
            closeRankPanel();
        } else {
            openRankPanel();
        }
        return;
    }

    // 検索もPC時は独立窓として他のボタンと独立して開閉する
    if (panelName === "search") {
        const wasOpen = isSearchOpen;
        if (!desktopMq.matches) {
            closePanel();
        }
        if (wasOpen) {
            closeSearchPanel();
        } else {
            openSearchPanel();
        }
        setActiveNavItem(isSearchOpen ? "search" : (currentPanel || "home"));
        return;
    }

    // 他のパネルを開く場合、検索はモバイルのみ閉じる（PC窓は維持）
    if (!desktopMq.matches && isSearchOpen) {
        closeSearchPanel();
    }

    // モバイル時は画面が狭いため、他パネルを開く前にランクドックを閉じる
    if (!desktopMq.matches && isRankOpen) {
        closeRankPanel();
    }

    if (panelName === "manual") {
        const modal = DOM.manualModal;
        if (modal && !modal.classList.contains('hidden')) {
            closeUserManual();
            setActiveNavItem('home');
        } else {
            closePanel();
            if (typeof openUserManual === "function") await openUserManual();
            setActiveNavItem("manual");
        }
        return;
    }

    // 他のパネルを開くときは説明モーダルを閉じる
    closeUserManual();

    const nav = DOM.appNav;
    if (!nav) return;

    if (currentPanel === panelName) {
        closePanel();
        return;
    }

    nav.classList.add("expanded");
    document.body.classList.add("sidebar-expanded");
    showPanel(panelName);
    currentPanel = panelName;
    if (panelName === "telop") {
        setTelopRead();
    }
    setActiveNavItem(panelName);
    saveState("panel", panelName);
}

export function closePanel(): void {
    closeVolumePopup();
    closeUserManual();

    if (!desktopMq.matches && isRankOpen) {
        closeRankPanel();
    }
    if (!desktopMq.matches && isSearchOpen) {
        closeSearchPanel();
    }

    const nav = DOM.appNav;
    if (!nav) return;

    if ((!isRankOpen && !isSearchOpen) || desktopMq.matches) {
        nav.classList.remove("expanded");
        DOM.body.classList.remove("sidebar-expanded");
    }
    applyPanelMode(null);

    const panelArea = getMainPanelEl();
    if (panelArea) {
        panelArea.classList.remove("expanded");
        panelArea.querySelectorAll<HTMLElement>(".js-appnav-panel-item").forEach(p => p.classList.add("hidden"));
    }

    currentPanel = null;
    setActiveNavItem('home');
    saveState("panel", null);
}
function showPanel(panelName: string): void {
    const nav = DOM.appNav;
    if (!nav) return;
    const panelArea = getMainPanelEl();

    panelArea?.querySelectorAll<HTMLElement>(".js-appnav-panel-item").forEach(p => p.classList.add("hidden"));
    const target = document.getElementById(`sidebar-panel-${panelName}`);
    if (target) {
        target.classList.remove("hidden");
        syncPanelContents(panelName);
    }

    applyPanelMode(panelName);
    if (panelArea) panelArea.classList.add("expanded");
}

function syncPanelContents(panelName: string): void {
    if (panelName === "rank") renderSidebarFilterAccordion();
    else if (panelName === "error") updateErrorPanel();
    else if (panelName === "telop" || panelName === "maintenance") {
        if (typeof (window as any).renderMaintenanceStatus === "function") {
            (window as any).renderMaintenanceStatus();
        }
    }
}

// ─── エラー ─────────────────────────────────────────────
function captureErrors(): void {
    const origError = console.error;
    console.error = (...args) => {
        origError.apply(console, args);
        const msg = args.map(a => (typeof a === "object" ? JSON.stringify(a, null, 2) : String(a))).join(" ");
        const time = new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
        (window as any).errorLog.unshift({ time, msg });
        if ((window as any).errorLog.length > MAX_ERROR_LOG) (window as any).errorLog.pop();
        updateErrorPanel();
        updateErrorBadge();
    };

    window.addEventListener("error", (e) => {
        const time = new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
        (window as any).errorLog.unshift({ time, msg: e.message || "Unknown error" });
        if ((window as any).errorLog.length > MAX_ERROR_LOG) (window as any).errorLog.pop();
        updateErrorPanel();
        updateErrorBadge();
    });

    window.addEventListener("unhandledrejection", (e) => {
        const time = new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
        (window as any).errorLog.unshift({ time, msg: String(e.reason) });
        if ((window as any).errorLog.length > MAX_ERROR_LOG) (window as any).errorLog.pop();
        updateErrorPanel();
        updateErrorBadge();
    });
}

export function updateErrorPanel(): void {
    const panels = document.querySelectorAll(".js-error-content");
    if (panels.length === 0) return;

    const fragment = document.createDocumentFragment();
    if (!(window as any).errorLog || (window as any).errorLog.length === 0) {
        const emptyMsg = document.createElement("div");
        emptyMsg.className = "u-text-base text-gray-500 mt-10";
        emptyMsg.textContent = "現在エラーはありません";
        fragment.appendChild(emptyMsg);
    } else {
        (window as any).errorLog.forEach((e: any) => {
            const el = cloneTemplate('appnav-error-item-template');
            if (el) {
                const timeEl = el.querySelector(".appnav-error-time");
                const msgEl = el.querySelector(".error-msg");
                if (timeEl) timeEl.textContent = e.time;
                if (msgEl) msgEl.textContent = e.msg;
                fragment.appendChild(el);
            }
        });
    }

    panels.forEach(el => {
        if (!el) return;
        el.innerHTML = "";
        el.appendChild(fragment.cloneNode(true));
    });
}

function updateErrorBadge(): void {
    if (typeof (window as any).renderMaintenanceStatus === "function") {
        (window as any).renderMaintenanceStatus();
    }
}

export function updateCarouselArrows(): void {
    const carousel = document.querySelector("#sidebar-panel-rank .appnav-area-carousel") as HTMLElement | null;
    if (!carousel) return;

    const prevBtn = document.querySelector("#sidebar-panel-rank .carousel-arrow-prev") as HTMLElement | null;
    const nextBtn = document.querySelector("#sidebar-panel-rank .carousel-arrow-next") as HTMLElement | null;

    if (!prevBtn || !nextBtn) return;

    const canScrollLeft = carousel.scrollLeft > 2;
    const canScrollRight = carousel.scrollLeft + carousel.clientWidth < carousel.scrollWidth - 2;

    if (carousel.scrollWidth > carousel.clientWidth + 4) {
        prevBtn.classList.toggle("hidden", !canScrollLeft);
        nextBtn.classList.toggle("hidden", !canScrollRight);
    } else {
        prevBtn.classList.add("hidden");
        nextBtn.classList.add("hidden");
    }
}

// ─── ランク＆エリアフィルター ─────────────────────────────
function renderSidebarFilterAccordion(): void {
    const container = DOM.filterAccordion;
    if (!container) return;

    const stateVal = getState();
    const activeRank = stateVal.filter.rank || RANKS.ALL;

    let wrapper = container.querySelector(".appnav-filter-wrapper") as HTMLElement | null;
    if (!wrapper) {
        const templateEl = cloneTemplate('rank-filter-panel-template');
        if (templateEl) {
            container.innerHTML = "";
            container.appendChild(templateEl);
            wrapper = container.querySelector(".appnav-filter-wrapper");
        }
    }

    if (!wrapper) return;

    const tabButtons = wrapper.querySelectorAll<HTMLButtonElement>(".appnav-rank-tab");
    tabButtons.forEach(btn => {
        const rank = btn.dataset.rank;
        const isActive = rank === activeRank;
        btn.classList.toggle("is-active", isActive);
    });

    const isCarouselOpen = stateVal.filter.clickStep === 2;
    const carouselWrapper = wrapper.querySelector(".appnav-area-carousel-wrapper") as HTMLElement | null;
    if (carouselWrapper) {
        carouselWrapper.classList.toggle("hidden", !isCarouselOpen);
    }

    const track = wrapper.querySelector(".area-grid-container") as HTMLElement | null;
    if (track && isCarouselOpen) {
        renderAreaFilterPanel(track);
    }

    const carousel = wrapper.querySelector(".appnav-area-carousel") as HTMLElement | null;
    if (carousel && !(carousel as any)._hasScrollBound) {
        (carousel as any)._hasScrollBound = true;
        carousel.addEventListener("scroll", () => {
            updateCarouselArrows();
        }, { passive: true });
    }

    const prevBtn = wrapper.querySelector(".carousel-arrow-prev") as HTMLButtonElement | null;
    if (prevBtn && !(prevBtn as any)._hasClickBound) {
        (prevBtn as any)._hasClickBound = true;
        prevBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            if (carousel) {
                carousel.scrollBy({ left: -carousel.clientWidth * 0.8, behavior: "smooth" });
            }
        });
    }

    const nextBtn = wrapper.querySelector(".carousel-arrow-next") as HTMLButtonElement | null;
    if (nextBtn && !(nextBtn as any)._hasClickBound) {
        (nextBtn as any)._hasClickBound = true;
        nextBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            if (carousel) {
                carousel.scrollBy({ left: carousel.clientWidth * 0.8, behavior: "smooth" });
            }
        });
    }

    requestAnimationFrame(() => {
        updateCarouselArrows();
        const panelArea = getRankPanelEl();
        if (panelArea?.classList.contains("is-floating")) {
            applyFloatingPosition(panelArea);
        }
    });
}

// ─── イベントリスナー ───────────────────────────────────
window.addEventListener("filterChanged", () => {
    renderSidebarFilterAccordion();
});
