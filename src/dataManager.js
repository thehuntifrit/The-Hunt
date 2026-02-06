//dataManager.js

import { calculateRepop } from "./cal.js";
import { subscribeMobStatusDocs, subscribeMobLocations, subscribeMobMemos, subscribeMaintenance } from "./server.js";

export const state = {
    userId: localStorage.getItem("user_uuid") || null,
    lodestoneId: localStorage.getItem("lodestone_id") || null,
    characterName: localStorage.getItem("character_name") || null,
    isVerified: localStorage.getItem("is_verified") === "true",
    baseMobData: [],
    mobs: [],
    mobLocations: {},
    maintenance: null,
    pendingInitialLoads: 0,
    initialLoadComplete: false,
    worker: null,

    filter: JSON.parse(localStorage.getItem("huntFilterState")) || {
        rank: "ALL",
        areaSets: {
            S: new Set(),
            A: new Set(),
            F: new Set(),
            ALL: new Set()
        },
        allRankSet: new Set()
    },
    openMobCardNo: localStorage.getItem("openMobCardNo")
        ? parseInt(localStorage.getItem("openMobCardNo"), 10)
        : null,
    pendingCalculationMobs: new Set(),
    pendingStatusMap: null,
    pendingMaintenanceData: null,
    pendingLocationsMap: null,
    pendingMemoData: null
};

export const EXPANSION_MAP = { 1: "新生", 2: "蒼天", 3: "紅蓮", 4: "漆黒", 5: "暁月", 6: "黄金" };

export const PROGRESS_CLASSES = {
    P0_60: "progress-p0-60",
    P60_80: "progress-p60-80",
    P80_100: "progress-p80-100",
    MAX_OVER: "progress-max-over",
    TEXT_NEXT: "text-next",
    TEXT_POP: "text-pop",
    BLINK_WHITE: "progress-blink-white"
};

if (state.filter.areaSets) {
    for (const k in state.filter.areaSets) {
        const v = state.filter.areaSets[k];
        if (Array.isArray(v)) {
            state.filter.areaSets[k] = new Set(v);
        } else if (!(v instanceof Set)) {
            state.filter.areaSets[k] = new Set();
        }
    }
} else {
    state.filter.areaSets = {
        S: new Set(),
        A: new Set(),
        F: new Set(),
        ALL: new Set()
    };
}

if (Array.isArray(state.filter.allRankSet)) {
    state.filter.allRankSet = new Set(state.filter.allRankSet);
} else if (!(state.filter.allRankSet instanceof Set)) {
    state.filter.allRankSet = new Set();
}

export function getState() {
    return state;
}

export function setUserId(uid) {
    state.userId = uid;
    localStorage.setItem("user_uuid", uid);
}

export function setLodestoneId(id) {
    state.lodestoneId = id;
    if (id) {
        localStorage.setItem("lodestone_id", id);
    } else {
        localStorage.removeItem("lodestone_id");
    }
}

export function setCharacterName(name) {
    state.characterName = name;
    if (name) {
        localStorage.setItem("character_name", name);
    } else {
        localStorage.removeItem("character_name");
    }
    window.dispatchEvent(new CustomEvent('characterNameSet'));
}

export function setVerified(verified) {
    state.isVerified = verified;
    localStorage.setItem("is_verified", verified ? "true" : "false");
}

function initWorker() {
    if (state.worker) return;
    state.worker = new Worker(new URL("./worker.js", import.meta.url), { type: "module" });
    state.worker.onmessage = (e) => {
        const { type, mobNo, repopInfo, spawnCache, error } = e.data;
        if (type === "RESULT") {
            const current = getState().mobs;
            const idx = current.findIndex(m => m.No === mobNo);
            state.pendingCalculationMobs.delete(mobNo);
            if (idx !== -1) {
                current[idx].repopInfo = repopInfo;
                if (spawnCache) {
                    current[idx]._spawnCache = spawnCache;
                    const fullCache = loadSpawnCache();
                    fullCache[mobNo] = spawnCache;
                    saveSpawnCache(fullCache);
                }
                setMobs([...current]);

                window.dispatchEvent(new CustomEvent('mobUpdated', { detail: { mobNo, mob: current[idx] } }));
            }
        } else if (type === "ERROR") {
            state.pendingCalculationMobs.delete(mobNo);
            console.error(`Worker error calculating mob ${mobNo}:`, error);
        }
    };
}

export function requestWorkerCalculation(mob, maintenance, options = {}) {
    if (state.pendingCalculationMobs.has(mob.No)) return;
    if (!state.worker) initWorker();
    state.pendingCalculationMobs.add(mob.No);
    state.worker.postMessage({
        type: "CALCULATE",
        mob,
        maintenance,
        options
    });
}

function setMobs(data) {
    state.mobs = data;
}

export function setFilter(partial) {
    state.filter = { ...state.filter, ...partial };
    const serialized = {
        ...state.filter,
        areaSets: Object.keys(state.filter.areaSets).reduce((acc, key) => {
            const v = state.filter.areaSets[key];
            acc[key] = v instanceof Set ? Array.from(v) : v;
            return acc;
        }, {}),
        allRankSet: Array.from(state.filter.allRankSet || [])
    };
    localStorage.setItem("huntFilterState", JSON.stringify(serialized));
    window.dispatchEvent(new CustomEvent('filterChanged'));
}

export function setOpenMobCardNo(no) {
    state.openMobCardNo = no;
    if (no === null) {
        localStorage.removeItem("openMobCardNo");
    } else {
        localStorage.setItem("openMobCardNo", no);
    }
}

const MOB_DATA_URL = "./mob_data.json?v=" + new Date().getTime();
const MOB_LOCATIONS_URL = "./mob_locations.json?v=" + new Date().getTime();
const MAINTENANCE_URL = "./maintenance.json?v=" + new Date().getTime();
const MOB_DATA_CACHE_KEY = "mobDataCache";

async function loadMaintenance() {
    try {
        const res = await fetch(MAINTENANCE_URL);
        if (!res.ok) throw new Error("Maintenance data failed to load.");
        const data = await res.json();
        state.maintenance = (data && data.maintenance) ? data.maintenance : data;
        return state.maintenance;
    } catch (e) {
        console.error("Maintenance load error:", e);
        return null;
    }
}

function processMobData(rawMobData, maintenance, options = {}) {
    const { skipConditionCalc = false } = options;
    return Object.entries(rawMobData.mobs).map(([no, mob]) => ({
        No: parseInt(no, 10),
        Rank: mob.rank,
        Name: mob.name,
        Area: mob.area,
        Condition: mob.condition || "",
        Expansion: EXPANSION_MAP[Math.floor(no / 10000)] || "Unknown",
        ExpansionId: Math.floor(no / 10000),
        REPOP_s: mob.repopSeconds,
        MAX_s: mob.maxRepopSeconds,
        moonPhase: mob.moonPhase || null,
        conditions: mob.conditions || null,
        timeRange: mob.timeRange || null,
        timeRanges: mob.timeRanges || null,
        weatherSeedRange: mob.weatherSeedRange || null,
        weatherSeedRanges: mob.weatherSeedRanges || null,
        weatherDuration: mob.weatherDuration || null,
        Map: mob.mapImage || "",
        spawn_points: mob.locations || [],
        last_kill_time: 0,
        prev_kill_time: 0,
        spawn_cull_status: {},
        memo_text: "",
        memo_updated_at: 0,

        repopInfo: calculateRepop({
            REPOP_s: mob.repopSeconds,
            MAX_s: mob.maxRepopSeconds,
            last_kill_time: 0,
        }, maintenance, { skipConditionCalc })
    }));
}

const SPAWN_CACHE_KEY = "spawnConditionCache";

function loadSpawnCache() {
    try {
        const cached = localStorage.getItem(SPAWN_CACHE_KEY);
        return cached ? JSON.parse(cached) : {};
    } catch (e) {
        return {};
    }
}

function saveSpawnCache(cache) {
    try {
        localStorage.setItem(SPAWN_CACHE_KEY, JSON.stringify(cache));
    } catch (e) {
        console.warn("Failed to save spawn cache:", e);
    }
}

export async function loadBaseMobData() {
    const maintenance = null;

    const cachedDataStr = localStorage.getItem(MOB_DATA_CACHE_KEY);
    let cachedData = null;

    const persistedSpawnCache = loadSpawnCache();

    if (cachedDataStr) {
        try {
            cachedData = JSON.parse(cachedDataStr);
            console.log("Using cached mob data");
            const processed = processMobData(cachedData, maintenance, { skipConditionCalc: true });

            processed.forEach(mob => {
                if (persistedSpawnCache[mob.No]) {
                    mob._spawnCache = persistedSpawnCache[mob.No];
                    mob.repopInfo = calculateRepop(mob, maintenance, { skipConditionCalc: true });
                }
            });

            state.baseMobData = processed;
            setMobs([...processed]);

            scheduleConditionCalculation(processed, maintenance, persistedSpawnCache);
        } catch (e) {
            console.warn("Cache parse error:", e);
        }
    }

    try {
        const mobRes = await fetch(MOB_DATA_URL);
        if (!mobRes.ok) throw new Error("Mob data failed to load.");

        const freshData = await mobRes.json();

        const freshDataStr = JSON.stringify(freshData);
        if (freshDataStr !== cachedDataStr) {
            console.log("Updating mob data from network");
            localStorage.setItem(MOB_DATA_CACHE_KEY, freshDataStr);

            const processed = processMobData(freshData, maintenance, { skipConditionCalc: true });

            processed.forEach(mob => {
                if (persistedSpawnCache[mob.No]) {
                    mob._spawnCache = persistedSpawnCache[mob.No];
                    mob.repopInfo = calculateRepop(mob, maintenance, { skipConditionCalc: true });
                }
            });

            state.baseMobData = processed;
            setMobs([...processed]);

            scheduleConditionCalculation(processed, maintenance, persistedSpawnCache);
        } else {
            console.log("Mob data is up to date");
        }

        loadLocationData();

        if (Object.keys(state.pendingStatusMap || {}).length > 0 ||
            state.pendingLocationsMap ||
            state.pendingMemoData ||
            state.pendingMaintenanceData !== undefined) {
            applyPendingRealtimeData();
        }
    } catch (e) {
        console.error("Failed to load base data from network:", e);
        if (!cachedData) {
            console.error("データの読み込みに失敗しました。");
        }
    }


    if (state.baseMobData.length > 0) {
        applyPendingRealtimeData();
    }
}

function applyPendingRealtimeData() {
    const current = state.mobs;
    let hasChanges = false;

    if (state.pendingMaintenanceData !== undefined) {
        const maintenanceData = state.pendingMaintenanceData;
        if (maintenanceData) {
            state.maintenance = maintenanceData;
        }
        initialLoadState.maintenance = true;
    }

    if (state.pendingStatusMap) {
        const map = new Map();
        Object.values(state.pendingStatusMap).forEach(docData => {
            Object.entries(docData).forEach(([mobId, mobData]) => {
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
        initialLoadState.status = true;
        state.pendingStatusMap = null;
    }

    if (state.pendingLocationsMap) {
        state.mobLocations = state.pendingLocationsMap;
        current.forEach(m => {
            const dyn = state.pendingLocationsMap[m.No];
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

    const maintenance = state.maintenance;
    current.forEach(mob => {
        mob.repopInfo = calculateRepop(mob, maintenance, { skipConditionCalc: true });
    });

    setMobs([...current]);

    if (state.pendingMaintenanceData === undefined && !initialLoadState.maintenance) {
    } else {
        checkInitialLoadComplete();
    }
}

function scheduleConditionCalculation(mobs, maintenance, existingCache) {
    const conditionMobs = mobs.filter(mob =>
        mob.moonPhase || mob.timeRange || mob.timeRanges ||
        mob.weatherSeedRange || mob.weatherSeedRanges || mob.conditions
    );

    if (conditionMobs.length === 0) return;

    let updatedCount = 0;
    const newCache = { ...existingCache };

    conditionMobs.forEach(mob => {
        requestWorkerCalculation(mob, maintenance);
        updatedCount++;
    });

    setMobs([...state.mobs]);

    console.log(`Condition calculation completed for ${updatedCount} mobs`);
}

let unsubscribes = [];

const initialLoadState = {
    status: false,
    location: false,
    memo: false,
    maintenance: false
};

async function loadLocationData() {
    try {
        const res = await fetch(MOB_LOCATIONS_URL);
        if (!res.ok) throw new Error("Location data failed to load.");
        const locationsData = await res.json();

        state.mobs.forEach(mob => {
            const locInfo = locationsData[mob.No];
            if (locInfo) {
                mob.spawn_points = locInfo.locations || [];
                mob.Map = locInfo.mapImage || "";
            }
        });

        console.log("Location data loaded lazily");
        window.dispatchEvent(new CustomEvent('locationDataReady'));

    } catch (e) {
        console.warn("Lazy location load failed:", e);
    }
}

function checkInitialLoadComplete() {
    if (state.mobs.length === 0) return;

    if (initialLoadState.status && initialLoadState.maintenance) {
        if (!state.initialLoadComplete) {
            state.initialLoadComplete = true;
            console.log("Critical data (Status) loaded. Rendering UI...");

            const current = state.mobs;
            const maintenance = state.maintenance;
            current.forEach(mob => {
                mob.repopInfo = calculateRepop(mob, maintenance, { skipConditionCalc: true });
            });
            setMobs([...current]);

            window.dispatchEvent(new CustomEvent('initialDataLoaded'));

            scheduleConditionCalculation(current, maintenance);
        }
    }
}

export function recalculateMob(mobNo) {
    const state = getState();
    const mobIndex = state.mobs.findIndex(m => m.No === mobNo);
    if (mobIndex === -1) return;

    const mob = state.mobs[mobIndex];
    requestWorkerCalculation(mob, state.maintenance, { forceRecalc: true });

    return mob;
}

export function startRealtime() {
    unsubscribes.forEach(fn => fn && fn());
    unsubscribes = [];

    state.initialLoadComplete = false;
    initialLoadState.status = false;
    initialLoadState.location = false;
    initialLoadState.memo = false;
    initialLoadState.maintenance = false;

    const unsubStatus = subscribeMobStatusDocs(mobStatusDataMap => {
        if (state.mobs.length === 0) {
            state.pendingStatusMap = mobStatusDataMap;
            return;
        }

        const current = state.mobs;
        const map = new Map();

        Object.values(mobStatusDataMap).forEach(docData => {
            Object.entries(docData).forEach(([mobId, mobData]) => {
                const mobNo = parseInt(mobId, 10);
                map.set(mobNo, {
                    last_kill_time: mobData.last_kill_time?.seconds || 0,
                    prev_kill_time: mobData.prev_kill_time?.seconds || 0,
                });
            });
        });

        if (!state.initialLoadComplete) {
            current.forEach(m => {
                const dyn = map.get(m.No);
                if (dyn) {
                    m.last_kill_time = dyn.last_kill_time;
                    m.prev_kill_time = dyn.prev_kill_time;
                }
            });
            initialLoadState.status = true;
            checkInitialLoadComplete();
        } else {
            let hasChanges = false;
            current.forEach(m => {
                const dyn = map.get(m.No);
                if (dyn) {
                    if (m.last_kill_time !== dyn.last_kill_time || m.prev_kill_time !== dyn.prev_kill_time) {
                        m.last_kill_time = dyn.last_kill_time;
                        m.prev_kill_time = dyn.prev_kill_time;
                        requestWorkerCalculation(m, state.maintenance, { forceRecalc: true });
                        hasChanges = true;
                    }
                }
            });

            if (hasChanges) {
                setMobs([...current]);
                window.dispatchEvent(new CustomEvent('mobsUpdated'));
            }
        }
    });
    unsubscribes.push(unsubStatus);

    const unsubLoc = subscribeMobLocations(locationsMap => {
        if (state.mobs.length === 0) {
            state.pendingLocationsMap = locationsMap;
            return;
        }

        const current = state.mobs;
        state.mobLocations = locationsMap;

        current.forEach(m => {
            const dyn = locationsMap[m.No];
            m.spawn_cull_status = dyn || {};
        });

        if (!state.initialLoadComplete) {
            initialLoadState.location = true;
        }
        setMobs([...current]);
        window.dispatchEvent(new CustomEvent('locationsUpdated', { detail: { locationsMap } }));
    });
    unsubscribes.push(unsubLoc);

    const unsubMemo = subscribeMobMemos(memoData => {
        if (state.mobs.length === 0) {
            state.pendingMemoData = memoData;
            return;
        }

        const current = state.mobs;

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

        if (!state.initialLoadComplete) {
            initialLoadState.memo = true;
        }
        setMobs([...current]);
        window.dispatchEvent(new CustomEvent('mobsUpdated'));
    });
    unsubscribes.push(unsubMemo);

    const unsubMaintenance = subscribeMaintenance(async maintenanceData => {
        if (state.mobs.length === 0) {
            state.pendingMaintenanceData = maintenanceData;
            if (!maintenanceData) {
                const fallback = await loadMaintenance();
                if (fallback) {
                    state.pendingMaintenanceData = fallback;
                }
            }
            return;
        }

        if (!state.initialLoadComplete) {
            if (maintenanceData) {
                state.maintenance = maintenanceData;
            } else {
                const fallback = await loadMaintenance();
                if (fallback) {
                    state.maintenance = fallback;
                }
            }
            initialLoadState.maintenance = true;
            checkInitialLoadComplete();
        } else {
            if (!maintenanceData) return;
            state.maintenance = maintenanceData;

            const current = state.mobs;
            current.forEach(mob => {
                requestWorkerCalculation(mob, maintenanceData);
            });
            setMobs([...current]);
            window.dispatchEvent(new CustomEvent('filterChanged'));
            window.dispatchEvent(new CustomEvent('mobsUpdated'));
            window.dispatchEvent(new CustomEvent('maintenanceUpdated'));
        }
    });
    unsubscribes.push(unsubMaintenance);
}
