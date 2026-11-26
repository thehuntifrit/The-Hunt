import { Mob, RepopInfo, CullStatus } from "./types/mob";
import { AppState, FilterState } from "./types/state";
import { calculateRepop } from "./cal";
import { subscribeMobStatusDocs, subscribeMobLocations, subscribeMobMemos, subscribeMaintenance } from "./server";
import { now as serverNow } from "./servertime";

// 定数
export const EXPANSION_MAP: Record<number, string> = { 1: "新生", 2: "蒼天", 3: "紅蓮", 4: "漆黒", 5: "暁月", 6: "黄金" };

export const RANKS = {
    S: "S",
    A: "A",
    F: "F",
    ALL: "ALL",
    S_RANK: "S rank",
    A_RANK: "A rank",
    FATE: "FATE",
    FATE_FULL: "F.A.T.E."
};

const MOB_DATA_URL = "./json/mob_data.json";
const MOB_LOCATIONS_URL = "./json/mob_locations.json";
const MAINTENANCE_URL = "./json/maintenance.json";

// 設定値
export const CONFIG = {
    APP_LOAD_TIMEOUT: 6000,
    TIER_B_UPDATE_INTERVAL: 60000,
    TOAST_DURATION: 4000,
    CLICK_THRESHOLD: 1000,
    DEBOUNCE_DELAY: 100,
    BREAKPOINT_PC: 1024,
    NOTIFICATION_OFFSET_MS: 120000,
    MAINTENANCE_SHOW_BEFORE_MS: 604800000,
    MAINTENANCE_SHOW_AFTER_MS: 345600000,
    MAP_ZOOM_SCALE: 2.0,
    AUTH_TIMEOUT: 10000,
    REPORT_FUTURE_THRESHOLD: 600000,
    REPORT_EARLY_THRESHOLD: 300000,
    MEMO_MAX_LENGTH: 30,
    FIRESTORE_LOAD_TIMEOUT: 8000
};

export const STATUS_LABELS: Record<string, string | { S: string; others: string }> = {
    Maintenance: "停止",
    MaxOver: "超過",
    ConditionActive: "‼️",
    PopWindow: "残り",
    Next: { S: "次回", others: "残り" },
    NextCondition: "⏳",
    Unknown: "未定"
};

export const DOM = {
    pcLeftList: document.getElementById('moblist-container'),
    pcRightDetail: document.getElementById('mobcard-detail'),
    reportModal: document.getElementById('report-modal'),
    reportForm: document.getElementById('report-form') as HTMLFormElement | null,
    modalMobName: document.getElementById('modal-mob-name'),
    modalStatus: document.getElementById('modal-status'),
    modalTimeInput: document.getElementById('report-datetime') as HTMLInputElement | null,
    modalForceSubmit: document.getElementById('report-force-submit') as HTMLInputElement | null,
    authModal: document.getElementById('auth-modal'),
    authVCode: document.getElementById('auth-v-code'),
    authStatus: document.getElementById('auth-modal-status'),
    authLodestoneId: document.getElementById('auth-lodestone-id') as HTMLInputElement | null,
    loadingOverlay: document.getElementById('loading-overlay'),
    appNav: document.getElementById('appnav'),
    manualModal: document.getElementById('manual-modal'),
    readmeContainer: document.getElementById('readme-container'),
    body: document.body,
    filterAccordion: document.getElementById('sidebar-filter-accordion'),
    appNavPanelItems: document.querySelectorAll(".appnav-panel .js-appnav-panel-item"),
    cardTemplate: document.getElementById('mobcard-card-template') as HTMLTemplateElement | null,
    globalMagnifier: document.getElementById('global-magnifier'),
    authCopyCodeBtn: document.getElementById('auth-copy-code'),
    authVerifyBtn: document.getElementById('auth-verify') as HTMLButtonElement | null,
    closeManualModalBtn: document.getElementById('close-manual-modal'),
    notificationToggle: document.getElementById('appnav-notification-toggle') as HTMLInputElement | null,
    notifyPopup: document.querySelector('.js-notify-popup') as HTMLElement | null,
    volumeSlider: document.getElementById('notify-volume-slider') as HTMLInputElement | null,
    cancelReportBtn: document.getElementById('cancel-report'),
    authCancelBtn: document.getElementById('auth-cancel')
};

export function getStatusLabel(status: string, rank: string): string {
    const mapping = STATUS_LABELS[status] || STATUS_LABELS.Unknown;
    if (typeof mapping === "object") {
        return rank === 'S' ? mapping.S : mapping.others;
    }
    return mapping;
}

export function safeJsonParse(str: string | null, fallback: any = null): any {
    if (!str) return fallback;
    try {
        return JSON.parse(str);
    } catch (e) {
        return fallback;
    }
}

export function extractLodestoneId(input: string | null): string | null {
    if (!input) return null;
    const trimmed = input.trim();
    const idMatch = trimmed.match(/character\/(\d+)/);
    const lodestoneId = idMatch ? idMatch[1] : trimmed.match(/^\d+$/) ? trimmed : null;

    if (!lodestoneId || lodestoneId.length > 20) return null;
    return lodestoneId;
}

export function handleAppError(error: any, context = "エラーが発生しました", notifyUser = true): void {
    const message = error.message || String(error);
    console.error(`[${context}]`, error);

    if (notifyUser) {
        window.dispatchEvent(new CustomEvent('appNotify', {
            detail: { message: `${context}: ${message}`, type: 'error' }
        }));
    }
}

// State
export const state: AppState = {
    userId: localStorage.getItem("user_uuid") || null,
    lodestoneId: localStorage.getItem("lodestone_id") || null,
    characterName: localStorage.getItem("character_name") || null,
    isVerified: localStorage.getItem("is_verified") === "true",
    mobs: [],
    maintenance: null,
    initialLoadComplete: false,

    filter: ((): FilterState => {
        const val = localStorage.getItem("huntFilterState");
        const parsed = safeJsonParse(val, null);
        const allAreas = Array.from(new Set(Object.values(EXPANSION_MAP)));
        const allRanks = [RANKS.S, RANKS.A, RANKS.F];

        if (!parsed) {
            return {
                rank: RANKS.ALL,
                clickStep: 2,
                areaSets: {
                    S: new Set<string>(allAreas),
                    A: new Set<string>(allAreas),
                    F: new Set<string>(allAreas),
                    ALL: new Set<string>(allAreas)
                },
                allRankSet: new Set<string>(allRanks)
            };
        }

        const clickStep = parsed.clickStep !== undefined ? parsed.clickStep : 2;

        const rawAreaSets = parsed.areaSets;
        const isOldEmptyAreaSets = !rawAreaSets || (
            (!rawAreaSets.S || rawAreaSets.S.length === 0) &&
            (!rawAreaSets.A || rawAreaSets.A.length === 0) &&
            (!rawAreaSets.F || rawAreaSets.F.length === 0)
        );

        const areaSets: Record<string, Set<string>> = isOldEmptyAreaSets
            ? {
                S: new Set<string>(allAreas),
                A: new Set<string>(allAreas),
                F: new Set<string>(allAreas),
                ALL: new Set<string>(allAreas)
            }
            : {
                S: new Set<string>(Array.isArray(rawAreaSets?.S) ? rawAreaSets.S : allAreas),
                A: new Set<string>(Array.isArray(rawAreaSets?.A) ? rawAreaSets.A : allAreas),
                F: new Set<string>(Array.isArray(rawAreaSets?.F) ? rawAreaSets.F : allAreas),
                ALL: new Set<string>(Array.isArray(rawAreaSets?.ALL) ? rawAreaSets.ALL : allAreas)
            };

        const allRankSet = new Set<string>(
            Array.isArray(parsed.allRankSet) && parsed.allRankSet.length > 0
                ? parsed.allRankSet
                : allRanks
        );

        return {
            rank: parsed.rank || RANKS.ALL,
            clickStep,
            areaSets,
            allRankSet
        };
    })(),
    openMobCardNo: null,
    notificationEnabled: localStorage.getItem("huntNotificationEnabled") === "true",
    notificationVolume: parseInt(localStorage.getItem("huntNotificationVolume") ?? "80", 10),
    pendingStatusMap: null,
    pendingMaintenanceData: null,
    pendingLocationsMap: null,
    pendingMemoData: null,
    _filterVersion: 0,
    sMobMap: new Map<string, Mob>(),
    mobsMap: new Map<string, Mob>(),
    hasUnreadTelop: false,
    mobLocations: {}
};

// State Accessors
export function getState(): AppState {
    return state;
}

export function setUserId(uid: string | null): void {
    state.userId = uid;
    if (uid) {
        localStorage.setItem("user_uuid", uid);
    } else {
        localStorage.removeItem("user_uuid");
    }
}

export function setLodestoneId(id: string | null): void {
    state.lodestoneId = id;
    if (id) {
        localStorage.setItem("lodestone_id", id);
    } else {
        localStorage.removeItem("lodestone_id");
    }
}

export function setCharacterName(name: string | null): void {
    state.characterName = name;
    if (name) {
        localStorage.setItem("character_name", name);
    } else {
        localStorage.removeItem("character_name");
    }
    window.dispatchEvent(new CustomEvent('characterNameSet'));
}

export function setVerified(verified: boolean): void {
    state.isVerified = verified;
    localStorage.setItem("is_verified", verified ? "true" : "false");
}

function setMobs(data: Mob[]): void {
    state.mobs = data;
    state.mobsMap.clear();
    data.forEach(m => state.mobsMap.set(String(m.No), m));
    updateSMobMap();
}

export function updateSMobMap(): void {
    state.sMobMap.clear();
    state.mobs.forEach(m => {
        if (m.rank === "S") {
            const instance = m.No % 10;
            state.sMobMap.set(`${m.area}_${instance}`, m);
        }
    });
}

export function setFilter(partial: Partial<FilterState>): void {
    state.filter = { ...state.filter, ...partial } as FilterState;
    state._filterVersion++;
    const serialized = {
        ...state.filter,
        areaSets: Object.keys(state.filter.areaSets).reduce((acc: Record<string, string[]>, key) => {
            const v = (state.filter.areaSets as any)[key];
            acc[key] = v instanceof Set ? Array.from(v) : v;
            return acc;
        }, {}),
        allRankSet: Array.from(state.filter.allRankSet || [])
    };
    localStorage.setItem("huntFilterState", JSON.stringify(serialized));
    window.dispatchEvent(new CustomEvent('filterChanged'));
}

export function setOpenMobCardNo(no: number | null): void {
    state.openMobCardNo = no;
}

export function setNotificationEnabled(enabled: boolean): void {
    state.notificationEnabled = enabled;
    localStorage.setItem("huntNotificationEnabled", enabled ? "true" : "false");
    window.dispatchEvent(new CustomEvent('notificationSettingChanged', { detail: { enabled } }));
}

export function setNotificationVolume(volume: number): void {
    state.notificationVolume = Math.max(0, Math.min(100, volume));
    localStorage.setItem("huntNotificationVolume", String(state.notificationVolume));
}

const LAST_SEEN_TELOP_KEY = "huntLastSeenTelopMessage";

export function checkTelopUnread(msg: string | null): void {
    const message = msg || "";
    if (message.trim() === "") {
        state.hasUnreadTelop = false;
        return;
    }
    const lastSeen = localStorage.getItem(LAST_SEEN_TELOP_KEY) || "";
    state.hasUnreadTelop = message !== lastSeen;
}

export function setTelopRead(): void {
    const currentMsg = (state.maintenance && state.maintenance.message) ? state.maintenance.message : "";
    localStorage.setItem(LAST_SEEN_TELOP_KEY, currentMsg);
    state.hasUnreadTelop = false;
    window.dispatchEvent(new CustomEvent('maintenanceUpdated', { detail: { maintenance: state.maintenance } }));
}

// mobNoごとの境界タイマーを管理するMap
const repopTimers = new Map<number, any>();

/**
 * repopInfoのnextBoundarySecに基づいてタイマーをセットし、
 * 境界到達時にforceRecalc: trueで再計算する。
 */
function scheduleRepopTimer(mobNo: number, repopInfo: RepopInfo) {
    if (repopTimers.has(mobNo)) {
        clearTimeout(repopTimers.get(mobNo));
        repopTimers.delete(mobNo);
    }

    const bSec = repopInfo.nextBoundarySec;
    if (!bSec || bSec === Infinity) return;

    const nowSec = serverNow() / 1000;
    const delayMs = (bSec - nowSec) * 1000;

    if (delayMs <= 0 || delayMs > 7 * 24 * 3600 * 1000) return;

    const timer = setTimeout(() => {
        repopTimers.delete(mobNo);
        const mob = state.mobsMap.get(String(mobNo));
        if (mob) {
            recalcMob(mob, state.maintenance, { forceRecalc: true });
        }
    }, delayMs);

    repopTimers.set(mobNo, timer);
}

function recalcMob(mob: Mob, maintenance: any, options: { forceRecalc?: boolean } = {}): void {
    try {
        mob.repopInfo = calculateRepop(mob, maintenance, options);
        scheduleRepopTimer(mob.No, mob.repopInfo);
        window.dispatchEvent(new CustomEvent('mobUpdated', { detail: { mobNo: mob.No, mob } }));
    } catch (err) {
        handleAppError(err, `時間計算失敗 (Mob ${mob.No})`, false);
    }
}

// 境界を過ぎているのに状態が進んでいないモブを再計算させる
const lastStaleRecalc = new Map<number, number>();
const STALE_RECALC_INTERVAL_MS = 15000;

export function recalcIfStale(mob: Mob, nowSec: number): void {
    const info = mob.repopInfo;
    if (!info || info.status === "Maintenance" || info.status === "MaxOver") return;

    const boundary = info.nextBoundarySec || info.maxRepop || 0;
    if (!boundary || boundary > nowSec) return;

    const nowMs = Date.now();
    if (nowMs - (lastStaleRecalc.get(mob.No) || 0) < STALE_RECALC_INTERVAL_MS) return;
    lastStaleRecalc.set(mob.No, nowMs);

    recalcMob(mob, state.maintenance, { forceRecalc: true });
}

// データ加工
function processMobData(rawMobData: any, locationsData?: any): Mob[] {
    return Object.entries(rawMobData.mobs).map(([no, mobVal]: [string, any]) => {
        const area = mobVal.a;
        const locInfo = locationsData?.[area];
        const mappedMob: Mob = {
            ...mobVal,
            No: parseInt(no, 10),
            rank: mobVal.r,
            name: mobVal.n,
            area,
            repopSeconds: mobVal.min,
            maxRepopSeconds: mobVal.max,
            condition: mobVal.cond || "",
            Expansion: EXPANSION_MAP[Math.floor(parseInt(no, 10) / 10000)] || "Unknown",
            ExpansionId: Math.floor(parseInt(no, 10) / 10000),
            mapImage: locInfo?.mapImage || "",
            locations: locInfo?.locations || [],
            last_kill_time: 0,
            prev_kill_time: 0,
            spawn_cull_status: {},
            memo_text: "",
            memo_updated_at: 0
        };
        delete (mappedMob as any).r;
        delete (mappedMob as any).n;
        delete (mappedMob as any).a;
        delete (mappedMob as any).min;
        delete (mappedMob as any).max;
        delete (mappedMob as any).cond;

        return mappedMob;
    });
}

// データ読込
async function loadMaintenance(): Promise<any> {
    try {
        const res = await fetch(MAINTENANCE_URL);
        if (!res.ok) throw new Error("Maintenance data failed to load.");
        const data = await res.json();
        state.maintenance = (data && data.maintenance) ? data.maintenance : data;
        checkTelopUnread(state.maintenance?.message);
        return state.maintenance;
    } catch (e) {
        handleAppError(e, "メンテ情報読み込み失敗", false);
        return null;
    }
}

export async function loadBaseMobData(): Promise<void> {
    try {
        const [mobRes, locRes] = await Promise.all([
            fetch(MOB_DATA_URL),
            fetch(MOB_LOCATIONS_URL).catch(() => null)
        ]);

        if (!mobRes.ok) throw new Error("Mob data failed to load.");
        const freshData = await mobRes.json();

        let locationsData: any = null;
        if (locRes && locRes.ok) {
            locationsData = await locRes.json();
        } else {
            handleAppError(new Error("Location data failed to load."), "位置データ読み込み失敗", false);
        }

        const processed = processMobData(freshData, locationsData);
        setMobs(processed);

        if (locationsData) {
            window.dispatchEvent(new CustomEvent('locationDataReady'));
        }

        if (state.mobs.length > 0) {
            applyPendingRealtimeData();
        }
    } catch (e) {
        handleAppError(e, "基礎データ読み込み失敗");
        console.error("データの読み込みに失敗しました。");
        window.dispatchEvent(new CustomEvent('criticalDataLoadError', {
            detail: { message: "基礎データの読み込みに失敗しました。\nアプリをファイルから直接開いている場合は、VS CodeのLive Serverなどを使って開いてください。" }
        }));
    }
}

// ─── 初期化 ─────────────────────────────────────────────
const initialLoadState = {
    status: false,
    location: false,
    memo: false,
    maintenance: false
};

let hasPendingMaintenance = false;
let pendingStatusAllLoaded = false;
let initialLoadTimer: any = null;
let unsubscribes: (() => void)[] = [];

function applyPendingRealtimeData(): void {
    const current = state.mobs;

    if (hasPendingMaintenance) {
        if (state.pendingMaintenanceData) {
            state.maintenance = state.pendingMaintenanceData;
            checkTelopUnread(state.pendingMaintenanceData.message);
        }
        initialLoadState.maintenance = true;
        hasPendingMaintenance = false;
    }

    if (state.pendingStatusMap) {
        const map = new Map<number, { last_kill_time: number; prev_kill_time: number }>();
        Object.values(state.pendingStatusMap).forEach((docData: any) => {
            Object.entries(docData).forEach(([mobId, mobData]: [string, any]) => {
                const mobNo = parseInt(mobId, 10);
                map.set(mobNo, {
                    last_kill_time: mobData.last_kill_time?.seconds || 0,
                    prev_kill_time: mobData.prev_kill_time?.seconds || 0,
                });
            });
        });

        current.forEach(m => {
            const dyn = map.get(m.No);
            if (dyn) {
                m.last_kill_time = dyn.last_kill_time;
                m.prev_kill_time = dyn.prev_kill_time;
            }
        });
        if (pendingStatusAllLoaded) {
            initialLoadState.status = true;
            pendingStatusAllLoaded = false;
        }
        state.pendingStatusMap = null;
    }

    if (state.pendingLocationsMap) {
        state.mobLocations = state.pendingLocationsMap;
        current.forEach(m => {
            const instance = m.No % 10;
            const key = `${m.area}_${instance}`;
            const dyn = state.pendingLocationsMap[key];
            m.spawn_cull_status = dyn || {};
        });
        initialLoadState.location = true;
        state.pendingLocationsMap = null;
    }

    if (state.pendingMemoData) {
        const memoData = state.pendingMemoData;
        current.forEach(m => {
            const memos = memoData[m.No] || [];
            const latest = memos[0];
            if (latest) {
                m.memo_text = latest.memo_text;
                m.memo_updated_at = latest.created_at?.seconds || 0;
            } else {
                m.memo_text = "";
            }
        });
        initialLoadState.memo = true;
        state.pendingMemoData = null;
    }

    checkInitialLoadComplete();
}

function checkInitialLoadComplete(): void {
    if (state.mobs.length === 0 || state.initialLoadComplete) return;

    if (initialLoadState.status && initialLoadState.maintenance) {
        state.initialLoadComplete = true;
        if (initialLoadTimer) {
            clearTimeout(initialLoadTimer);
            initialLoadTimer = null;
        }

        const current = state.mobs;
        const maintenance = state.maintenance;
        current.forEach(mob => {
            mob.repopInfo = calculateRepop(mob, maintenance);
            scheduleRepopTimer(mob.No, mob.repopInfo);
        });

        window.dispatchEvent(new CustomEvent('initialDataLoaded'));
    }
}

// 位置情報の差分判定用。キーごとの前回の内容を文字列で持つ
const lastLocSig = new Map<string, string>();

function locationSignature(dyn: any): string {
    let sig = "";
    for (const id in dyn) {
        const s = dyn[id];
        sig += `${id}:${s?.culled_at?.seconds || 0},${s?.uncull_at?.seconds || 0},${s?.reporter_id || ""};`;
    }
    return sig;
}

// ─── リアルタイム ───────────────────────────────────────
export function startRealtime(options: { resume?: boolean } = {}): void {
    const { resume = false } = options;

    unsubscribes.forEach(fn => fn && fn());
    unsubscribes = [];

    if (!resume) {
        repopTimers.forEach(timer => clearTimeout(timer));
        repopTimers.clear();

        state.initialLoadComplete = false;
        initialLoadState.status = false;
        initialLoadState.location = false;
        initialLoadState.memo = false;
        initialLoadState.maintenance = false;

        if (initialLoadTimer) clearTimeout(initialLoadTimer);
        initialLoadTimer = setTimeout(() => {
            if (!state.initialLoadComplete) {
                console.warn("Firestore initial load timed out. Forcing completion with available data.");
                if (!initialLoadState.status) initialLoadState.status = true;
                if (!initialLoadState.maintenance) {
                    initialLoadState.maintenance = true;
                    if (!state.maintenance) {
                        loadMaintenance().then(fallback => {
                            if (fallback) state.maintenance = fallback;
                        });
                    }
                }
                checkInitialLoadComplete();
            }
        }, CONFIG.FIRESTORE_LOAD_TIMEOUT);
    }

    const unsubStatus = subscribeMobStatusDocs((mobStatusDataMap: any, isAllLoaded: boolean) => {
        if (state.mobs.length === 0) {
            state.pendingStatusMap = mobStatusDataMap;
            pendingStatusAllLoaded = isAllLoaded;
            return;
        }

        const current = state.mobsMap;
        let anyChanges = false;
        const updatedMobNos = new Set<number>();

        Object.values(mobStatusDataMap).forEach((docData: any) => {
            Object.entries(docData).forEach(([mobId, mobData]: [string, any]) => {
                const mob = current.get(mobId);
                if (!mob) return;

                const newLastKill = mobData.last_kill_time?.seconds || 0;
                const newPrevKill = mobData.prev_kill_time?.seconds || 0;

                if (mob.last_kill_time !== newLastKill || mob.prev_kill_time !== newPrevKill) {
                    mob.last_kill_time = newLastKill;
                    mob.prev_kill_time = newPrevKill;
                    if (state.initialLoadComplete) {
                        mob.repopInfo = calculateRepop(mob, state.maintenance, { forceRecalc: true });
                        scheduleRepopTimer(mob.No, mob.repopInfo);
                    }
                    anyChanges = true;
                    updatedMobNos.add(parseInt(mobId, 10));
                }
            });
        });

        if (!state.initialLoadComplete) {
            if (isAllLoaded) {
                initialLoadState.status = true;
                checkInitialLoadComplete();
            }
        }

        if (anyChanges) {
            if (state.initialLoadComplete) {
                window.dispatchEvent(new CustomEvent('mobsBatchUpdated', {
                    detail: {
                        mobNos: Array.from(updatedMobNos),
                        updateType: 'status'
                    }
                }));

                window.dispatchEvent(new CustomEvent('mobsUpdated'));
            }
        }
    });
    unsubscribes.push(unsubStatus);

    const unsubLoc = subscribeMobLocations((locationsMap: any) => {
        if (state.mobs.length === 0) {
            state.pendingLocationsMap = locationsMap;
            return;
        }

        state.mobLocations = locationsMap;
        const updatedMobNos: number[] = [];

        // 内容が変わったキーだけを調べる
        const changedKeys = new Set<string>();
        for (const key of Object.keys(locationsMap)) {
            const sig = locationSignature(locationsMap[key]);
            if (lastLocSig.get(key) !== sig) {
                lastLocSig.set(key, sig);
                changedKeys.add(key);
            }
        }

        const affectedAreas = new Set(Object.keys(locationsMap).map(k => k.split('_')[0]));

        state.mobs.forEach(m => {
            if (affectedAreas.has(m.area)) {
                const instance = m.No % 10;
                const key = `${m.area}_${instance}`;
                const dyn = locationsMap[key];
                if (dyn) {
                    m.spawn_cull_status = dyn;
                    if (state.initialLoadComplete && changedKeys.has(key)) {
                        updatedMobNos.push(m.No);
                    }
                }
            }
        });

        if (!state.initialLoadComplete) {
            initialLoadState.location = true;
            checkInitialLoadComplete();
        } else if (changedKeys.size > 0) {
            if (updatedMobNos.length > 0) {
                window.dispatchEvent(new CustomEvent('mobsBatchUpdated', {
                    detail: { mobNos: updatedMobNos, updateType: 'location' }
                }));
            }
            window.dispatchEvent(new CustomEvent('locationsUpdated', { detail: { locationsMap } }));
        }
    });
    unsubscribes.push(unsubLoc);

    const unsubMemo = subscribeMobMemos((memoData: any) => {
        if (state.mobs.length === 0) {
            state.pendingMemoData = memoData;
            return;
        }

        const memoMobNos = Object.keys(memoData);
        const updatedMobNosList: number[] = [];

        memoMobNos.forEach(mobNoStr => {
            const mob = state.mobsMap.get(mobNoStr);
            if (!mob) return;
            const mobNo = parseInt(mobNoStr, 10);

            const memos = memoData[mobNoStr] || [];
            const latest = memos[0];
            const oldMemo = mob.memo_text;

            if (latest) {
                mob.memo_text = latest.memo_text;
                mob.memo_updated_at = latest.created_at?.seconds || 0;
            } else {
                mob.memo_text = "";
                mob.memo_updated_at = 0;
            }

            if (state.initialLoadComplete && oldMemo !== mob.memo_text) {
                updatedMobNosList.push(mobNo);
            }
        });

        if (!state.initialLoadComplete) {
            initialLoadState.memo = true;
            checkInitialLoadComplete();
        } else {
            if (updatedMobNosList.length > 0) {
                window.dispatchEvent(new CustomEvent('mobsBatchUpdated', {
                    detail: {
                        mobNos: updatedMobNosList,
                        updateType: 'memo'
                    }
                }));
            }
            window.dispatchEvent(new CustomEvent('mobsUpdated'));
        }
    });
    unsubscribes.push(unsubMemo);

    const unsubMaintenance = subscribeMaintenance(async (maintenanceData: any) => {
        const normalized = (maintenanceData && maintenanceData.maintenance) ? maintenanceData.maintenance : maintenanceData;

        if (state.mobs.length === 0) {
            hasPendingMaintenance = true;
            state.pendingMaintenanceData = normalized;
            if (!normalized) {
                const fallback = await loadMaintenance();
                if (fallback) {
                    state.pendingMaintenanceData = fallback;
                }
            }
            return;
        }

        if (!state.initialLoadComplete) {
            if (normalized) {
                state.maintenance = normalized;
                checkTelopUnread(normalized.message);
            } else {
                const fallback = await loadMaintenance();
                if (fallback) {
                    state.maintenance = fallback;
                    checkTelopUnread(fallback.message);
                }
            }
            initialLoadState.maintenance = true;
            checkInitialLoadComplete();
        } else {
            if (!normalized) return;
            state.maintenance = normalized;
            checkTelopUnread(normalized.message);

            const current = state.mobs;
            current.forEach(mob => {
                mob.repopInfo = calculateRepop(mob, normalized);
                scheduleRepopTimer(mob.No, mob.repopInfo);
            });
            window.dispatchEvent(new CustomEvent('filterChanged'));
            window.dispatchEvent(new CustomEvent('mobsUpdated'));
            window.dispatchEvent(new CustomEvent('maintenanceUpdated'));
        }
    });
    unsubscribes.push(unsubMaintenance);
}

// ─── ユーティリティ ─────────────────────────────────────
export function updateAllMobCullStatuses(locationsMap: any = state.mobLocations): void {
    const current = state.mobs;
    state.mobLocations = locationsMap;
    current.forEach(m => {
        const instance = m.No % 10;
        const key = `${m.area}_${instance}`;
        const dyn = locationsMap[key];
        m.spawn_cull_status = dyn || {};
    });
}

export function isCulled(pointStatus: CullStatus | undefined, mobNo: number, mob: Mob | null = null): boolean {
    const s = getState();
    if (!mob) {
        mob = s.mobsMap.get(String(mobNo)) || null;
    }
    if (!mob) return false;

    const instance = mob.No % 10;
    const targetSMob = s.sMobMap.get(`${mob.area}_${instance}`);

    const baseLastKillTime = targetSMob ? (targetSMob.last_kill_time || 0) : (mob.last_kill_time || 0);

    const serverUpSec = s.maintenance?.serverUp
        ? new Date(s.maintenance.serverUp).getTime()
        : 0;

    const culledMs = pointStatus?.culled_at && typeof (pointStatus.culled_at as any).toMillis === "function"
        ? (pointStatus.culled_at as any).toMillis()
        : (pointStatus?.culled_at as any)?.seconds ? (pointStatus?.culled_at as any).seconds * 1000 : 0;

    const uncullMs = pointStatus?.uncull_at && typeof (pointStatus.uncull_at as any).toMillis === "function"
        ? (pointStatus.uncull_at as any).toMillis()
        : (pointStatus?.uncull_at as any)?.seconds ? (pointStatus?.uncull_at as any).seconds * 1000 : 0;

    const lastKillMs = typeof baseLastKillTime === "number" ? baseLastKillTime * 1000 : 0;
    const validCulledMs = culledMs > serverUpSec ? culledMs : 0;
    const validUnculledMs = uncullMs > serverUpSec ? uncullMs : 0;

    if (validCulledMs === 0 && validUnculledMs === 0) return false;

    const culledAfterKill = validCulledMs > lastKillMs;
    const unculledAfterKill = validUnculledMs > lastKillMs;

    if (culledAfterKill && (!unculledAfterKill || validCulledMs >= validUnculledMs)) return true;
    if (unculledAfterKill && (!culledAfterKill || validUnculledMs >= validCulledMs)) return false;

    return false;
}

// ─── 長時間の非表示(セーブモード等)からの復帰 ───────────
const RESUME_REFRESH_THRESHOLD_MS = 10 * 60 * 1000;
let hiddenAt = 0;

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
        hiddenAt = Date.now();
        return;
    }
    if (!hiddenAt) return;
    const awayMs = Date.now() - hiddenAt;
    hiddenAt = 0;
    if (awayMs < RESUME_REFRESH_THRESHOLD_MS) return;
    if (state.mobs.length === 0) return;

    startRealtime({ resume: true });
});
