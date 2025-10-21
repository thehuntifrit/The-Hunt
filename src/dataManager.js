// dataManager.js

// 🚨 修正1 (パス修正): 外部依存関係のインポート
import { filterAndRender, updateProgressBars, displayStatus } from "./uiRender.js";
import { subscribeMobStatusDocs, subscribeMobLocations, initializeAuth } from "./server.js";

const EXPANSION_MAP = { 1: "新生", 2: "蒼天", 3: "紅蓮", 4: "漆黒", 5: "暁月", 6: "黄金" };

const state = {
  userId: localStorage.getItem("user_uuid") || null,
  baseMobData: [],
  mobs: [],
  filter: JSON.parse(localStorage.getItem("huntFilterState")) || {
    rank: "ALL",
    areaSets: {
      S: new Set(),
      A: new Set(),
      F: new Set(),
      ALL: new Set()
    }
  },
  openMobCardNo: localStorage.getItem("openMobCardNo")
    ? parseInt(localStorage.getItem("openMobCardNo"), 10)
    : null
};

// Set復元ロジック
for (const k in state.filter.areaSets) {
  const v = state.filter.areaSets[k];
  if (Array.isArray(v)) state.filter.areaSets[k] = new Set(v);
  else if (!(v instanceof Set)) state.filter.areaSets[k] = new Set();
}

const getState = () => state;
const getMobByNo = no => state.mobs.find(m => m.No === no);

function setUserId(uid) {
  state.userId = uid;
  localStorage.setItem("user_uuid", uid);
}

function setBaseMobData(data) {
  state.baseMobData = data;
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
    }, {})
  };
  localStorage.setItem("huntFilterState", JSON.stringify(serialized));
}

function setOpenMobCardNo(no) {
  state.openMobCardNo = no;
  localStorage.setItem("openMobCardNo", no ?? "");
}

// 静的定義の追記
const RANK_COLORS = {
  S: {bg: 'bg-red-600', hover: 'hover:bg-red-700', text: 'text-red-600', hex: '#dc2626', label: 'S'},
  A: {bg: 'bg-yellow-600', hover: 'hover:bg-yellow-700', text: 'text-yellow-600', hex: '#ca8a04', label: 'A'},
  F: {bg: 'bg-indigo-600', hover: 'hover:bg-indigo-700', text: 'text-indigo-600', hex: '#4f46e5', label: 'F'},
};

const PROGRESS_CLASSES = {
  P0_60: 'progress-p0-60',
  P60_80: 'progress-p60-80',
  P80_100: 'progress-p80-100',
  TEXT_NEXT: 'progress-next-text',
  TEXT_POP: 'progress-pop-text',
  MAX_OVER_BLINK: 'progress-max-over-blink'
};

const FILTER_TO_DATA_RANK_MAP = { FATE: 'F', ALL: 'ALL', S: 'S', A: 'A'};

const MOB_DATA_URL = "./mob_data.json";
let progressInterval = null;
let unsubscribes = [];



async function loadBaseMobData() {
  const resp = await fetch(MOB_DATA_URL);
  if (!resp.ok) throw new Error("Mob data failed to load.");
  const data = await resp.json();

const baseMobData = Object.entries(data.mobs).map(([no, mob]) => ({
    No: parseInt(no, 10),
    Rank: mob.rank,
    Name: mob.name,
    Area: mob.area,
    Condition: mob.condition,
    Expansion: EXPANSION_MAP[Math.floor(no / 10000)] || "Unknown",
    
    // リポップ時刻 (cal.js の calculateRepop と互換性あり)
    REPOP_s: mob.repopSeconds,
    MAX_s: mob.maxRepopSeconds,
    
    // 【重要】天候・時間・月齢の条件を追加
    moonPhase: mob.moonPhase,
    timeRange: mob.timeRange,
    timeRanges: mob.timeRanges,
    weatherSeedRange: mob.weatherSeedRange,
    weatherSeedRanges: mob.weatherSeedRanges,

    // その他のプロパティ
    Map: mob.mapImage,
    spawn_points: mob.locations,
    last_kill_time: 0,
    prev_kill_time: 0,
    last_kill_memo: "",
    spawn_cull_status: {},
    related_mob_no: mob.rank.startsWith("B") ? mob.relatedMobNo : null
}));

  setBaseMobData(baseMobData);
  setMobs([...baseMobData]);
  filterAndRender({ isInitialLoad: true });
}

function startRealtime() {
  // Clear previous
  if (progressInterval) clearInterval(progressInterval);
  unsubscribes.forEach(fn => fn && fn());
  unsubscribes = [];

  // Subscribe mob_status docs
  const unsubStatus = subscribeMobStatusDocs(mobStatusDataMap => {
    const current = getState().mobs;
    const map = new Map();
    Object.values(mobStatusDataMap).forEach(docData => {
      Object.entries(docData).forEach(([mobId, mobData]) => {
        const mobNo = parseInt(mobId, 10);
        map.set(mobNo, {
          last_kill_time: mobData.last_kill_time?.seconds || 0,
          prev_kill_time: mobData.prev_kill_time?.seconds || 0,
          last_kill_memo: mobData.last_kill_memo || ""
        });
      });
    });
    const merged = current.map(m => {
      const dyn = map.get(m.No);
      return dyn ? { ...m, ...dyn } : m;
    });
    setMobs(merged);
    filterAndRender();
    displayStatus("LKT/Memoデータ更新完了。", "success");
  });
  unsubscribes.push(unsubStatus);

  // Subscribe mob_locations
  const unsubLoc = subscribeMobLocations(locationsMap => {
    const current = getState().mobs;
    const merged = current.map(m => {
      const dyn = locationsMap[m.No];
      if (m.Rank === "S" && dyn) {
        return { ...m, spawn_cull_status: dyn.points || {} };
      }
      return m;
    });
    setMobs(merged);
    filterAndRender();
    displayStatus("湧き潰しデータ更新完了。", "success");
  });
  unsubscribes.push(unsubLoc);

  progressInterval = setInterval(updateProgressBars, 10000);
}

async function setupApp() {
  displayStatus("アプリを初期化中...", "loading");
  await loadBaseMobData();
  const uid = await initializeAuth();
  setUserId(uid);
  startRealtime();
}

// 🚨 修正1: 全てのエクスポートを整理
export { setupApp, state, EXPANSION_MAP, getState, getMobByNo, setUserId, setBaseMobData, setMobs, setFilter, setOpenMobCardNo, 
         RANK_COLORS, PROGRESS_CLASSES, FILTER_TO_DATA_RANK_MAP, };
