// dataManager.js

import { calculateRepop } from "./cal.js";
import { subscribeMobStatusDocs, subscribeMobLocations, subscribeMobMemos } from "./server.js";
import { filterAndRender, updateProgressBars } from "./uiRender.js";

const EXPANSION_MAP = { 1: "新生", 2: "蒼天", 3: "紅蓮", 4: "漆黒", 5: "暁月", 6: "黄金" };

const state = {
    userId: localStorage.getItem("user_uuid") || null,
    baseMobData: [],
    mobs: [],
    mobLocations: {},
    maintenance: null,

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
        : null
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

const getState = () => state;

function setUserId(uid) {
    state.userId = uid;
    localStorage.setItem("user_uuid", uid);
}

function setMobs(data) {
    state.mobs = data;
}

function setFilter(partial) {
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
}

function setOpenMobCardNo(no) {
    state.openMobCardNo = no;
    if (no === null) {
        localStorage.removeItem("openMobCardNo");
    } else {
        localStorage.setItem("openMobCardNo", no);
    }
}

const PROGRESS_CLASSES = {
    P0_60: "progress-p0-60",
    P60_80: "progress-p60-80",
    P80_100: "progress-p80-100",
    MAX_OVER: "progress-max-over",
    TEXT_NEXT: "text-next",
    TEXT_POP: "text-pop",
    BLINK_WHITE: "progress-blink-white"
};

const MOB_DATA_URL = "./mob_data.json";
const MAINTENANCE_URL = "./maintenance.json";
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

async function loadBaseMobData() {
    const maintenance = await loadMaintenance();

    const cachedDataStr = localStorage.getItem(MOB_DATA_CACHE_KEY);
    let cachedData = null;

    // 永続化された特殊条件キャッシュを読み込み
    const persistedSpawnCache = loadSpawnCache();

    if (cachedDataStr) {
        try {
            cachedData = JSON.parse(cachedDataStr);
            console.log("Using cached mob data");
            // フェーズ1: 特殊天候計算をスキップして高速レンダリング
            const processed = processMobData(cachedData, maintenance, { skipConditionCalc: true });

            // 永続化キャッシュを適用
            processed.forEach(mob => {
                if (persistedSpawnCache[mob.No]) {
                    mob._spawnCache = persistedSpawnCache[mob.No];
                }
            });

            state.baseMobData = processed;
            setMobs([...processed]);
            filterAndRender({ isInitialLoad: true });

            // フェーズ2: 特殊条件モブの計算を非同期で実行
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

            // 永続化キャッシュを適用
            processed.forEach(mob => {
                if (persistedSpawnCache[mob.No]) {
                    mob._spawnCache = persistedSpawnCache[mob.No];
                }
            });

            state.baseMobData = processed;
            setMobs([...processed]);

            if (!cachedData) {
                filterAndRender({ isInitialLoad: true });
            } else {
                filterAndRender();
            }

            // フェーズ2: 特殊条件モブの計算を非同期で実行
            scheduleConditionCalculation(processed, maintenance, persistedSpawnCache);
        } else {
            console.log("Mob data is up to date");
        }

    } catch (e) {
        console.error("Failed to load base data from network:", e);
        if (!cachedData) {
            console.error("データの読み込みに失敗しました。");
        }
    }
}

function scheduleConditionCalculation(mobs, maintenance, existingCache) {
    // 特殊条件を持つモブのみ抽出
    const conditionMobs = mobs.filter(mob =>
        mob.moonPhase || mob.timeRange || mob.timeRanges ||
        mob.weatherSeedRange || mob.weatherSeedRanges || mob.conditions
    );

    if (conditionMobs.length === 0) return;

    const doCalculation = () => {
        let updatedCount = 0;
        const newCache = { ...existingCache };

        conditionMobs.forEach(mob => {
            // 完全な計算を実行
            mob.repopInfo = calculateRepop(mob, maintenance);

            // キャッシュを永続化用に保存
            if (mob._spawnCache) {
                newCache[mob.No] = mob._spawnCache;
            }
            updatedCount++;
        });

        // キャッシュを永続化
        saveSpawnCache(newCache);

        // UIを更新
        setMobs([...state.baseMobData]);
        filterAndRender();
        updateProgressBars();

        console.log(`Condition calculation completed for ${updatedCount} mobs`);
    };

    // requestIdleCallbackがあれば使用、なければsetTimeoutでフォールバック
    if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(doCalculation, { timeout: 2000 });
    } else {
        setTimeout(doCalculation, 100);
    }
}

let unsubscribes = [];

function startRealtime() {
    unsubscribes.forEach(fn => fn && fn());
    unsubscribes = [];

    const unsubStatus = subscribeMobStatusDocs(mobStatusDataMap => {
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

        const merged = current.map(m => {
            const dyn = map.get(m.No);
            if (!dyn) return m;

            const updatedMob = { ...m, ...dyn };
            updatedMob.repopInfo = calculateRepop(updatedMob, state.maintenance);
            return updatedMob;
        });

        setMobs(merged);
        filterAndRender();
        updateProgressBars();
    });
    unsubscribes.push(unsubStatus);

    const unsubLoc = subscribeMobLocations(locationsMap => {
        const current = state.mobs;
        state.mobLocations = locationsMap;

        const merged = current.map(m => {
            const dyn = locationsMap[m.No];
            const updatedMob = { ...m };
            updatedMob.spawn_cull_status = dyn || {};
            return updatedMob;
        });

        setMobs(merged);
        filterAndRender();
    });
    unsubscribes.push(unsubLoc);

    const unsubMemo = subscribeMobMemos(memoData => {
        const current = state.mobs;

        const merged = current.map(m => {
            const memos = memoData[m.No] || [];
            const latest = memos[0];

            const updatedMob = { ...m };
            if (latest) {
                updatedMob.memo_text = latest.memo_text;
                updatedMob.memo_updated_at = latest.created_at?.seconds || 0;
            } else {
                updatedMob.memo_text = "";
            }
            return updatedMob;
        });

        setMobs(merged);
        filterAndRender();
    });
    unsubscribes.push(unsubMemo);
}

export {
    state, EXPANSION_MAP, getState, setUserId, loadBaseMobData,
    startRealtime, setFilter, setOpenMobCardNo, PROGRESS_CLASSES
};
