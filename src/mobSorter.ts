import { AppState } from "./types/state";
import { Mob } from "./types/mob";

// 外部から後ほど dataManager.ts として定義される関数をインポートすることを想定
import { getState, RANKS, DOM } from "./dataManager";
import { cloneTemplate } from "./mobCard";
import { filterMobsByRankAndArea } from "./sidebar";

const mobIdPartsCache = new Map<number, { mobNo: number; instance: number }>();

export function getGroupKey(mob: Mob): "MAINTENANCE" | "MAX_OVER" | "WINDOW" | "NEXT" {
  const info = mob.repopInfo || { isMaintenanceStop: false, isBlockedByMaintenance: false, status: "Unknown" };
  if (info.isMaintenanceStop || info.isBlockedByMaintenance) return "MAINTENANCE";
  if (info.status === "MaxOver") return "MAX_OVER";
  if (info.status === "PopWindow" || info.status === "ConditionActive" || info.status === "NextCondition") return "WINDOW";
  return "NEXT";
}

export const GROUP_LABELS = {
  MAX_OVER: "🔚 Time Over",
  WINDOW: "⏳ Pop Window",
  NEXT: "🔜 Respawning",
  MAINTENANCE: "🛠️ Maintenance"
};

const groupSectionCache = new Map<string, { section: HTMLElement; cols: HTMLElement[] }>();

export function getOrCreateGroupSection(groupKey: "MAINTENANCE" | "MAX_OVER" | "WINDOW" | "NEXT"): { section: HTMLElement; cols: HTMLElement[] } {
  if (groupSectionCache.has(groupKey)) return groupSectionCache.get(groupKey)!;

  const section = cloneTemplate('status-group-template') as HTMLElement;
  if (!section) return { section: document.createElement('section'), cols: [] };

  section.dataset.groupKey = groupKey;
  const separator = section.querySelector(".status-group-separator") as HTMLElement | null;
  const labelEl = section.querySelector(".status-group-label");
  if (labelEl) labelEl.textContent = GROUP_LABELS[groupKey];

  if (separator) {
    separator.setAttribute("role", "button");
    separator.setAttribute("tabindex", "0");
    separator.title = "クリックで折りたたみ / 展開";
    const chevron = document.createElement("span");
    chevron.className = "status-group-toggle-icon";
    chevron.textContent = "▼";
    separator.appendChild(chevron);

    const toggleCollapse = () => {
      section.classList.toggle("is-collapsed");
    };

    separator.addEventListener("click", toggleCollapse);
    separator.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleCollapse();
      }
    });
  }

  const cols = [
    section.querySelector(".col-1") as HTMLElement,
    section.querySelector(".col-2") as HTMLElement,
    section.querySelector(".col-3") as HTMLElement
  ].filter(Boolean);

  const result = { section, cols };
  groupSectionCache.set(groupKey, result);
  if (DOM.colContainer) {
    DOM.colContainer.appendChild(section);
  }
  return result;
}

let filterCacheVersion = -1;
let cachedFilteredMobs: Mob[] | null = null;
let cachedSortedMobs: Mob[] | null = null;
let sortCacheValid = false;

export function getFilteredMobs(): Mob[] {
  const state = getState() as AppState;
  const version = state._filterVersion || 0;

  if (filterCacheVersion === version && cachedFilteredMobs) {
    return cachedFilteredMobs;
  }

  filterCacheVersion = version;
  cachedFilteredMobs = filterMobsByRankAndArea(state.mobs);
  sortCacheValid = false;
  return cachedFilteredMobs;
}

export function getSortedFilteredMobs(): Mob[] {
  if (sortCacheValid && cachedSortedMobs) {
    return cachedSortedMobs;
  }
  cachedSortedMobs = getFilteredMobs().slice().sort(allTabComparator);
  sortCacheValid = true;
  return cachedSortedMobs;
}

export function invalidateFilterCache(): void {
  filterCacheVersion = -1;
  cachedFilteredMobs = null;
  cachedSortedMobs = null;
  sortCacheValid = false;
}

export function invalidateSortCache(): void {
  sortCacheValid = false;
  cachedSortedMobs = null;
}

export function rankPriority(rank: string): number {
  switch (rank) {
    case RANKS.S: return 0;
    case RANKS.A: return 1;
    case RANKS.F: return 2;
    default: return 99;
  }
}

export function parseMobIdParts(no: number): { mobNo: number; instance: number } {
  if (mobIdPartsCache.has(no)) {
    return mobIdPartsCache.get(no)!;
  }
  const str = String(no).padStart(5, "0");
  const result = {
    mobNo: parseInt(str.slice(2, 4), 10),
    instance: parseInt(str[4], 10),
  };
  mobIdPartsCache.set(no, result);
  return result;
}

// 経過%の比較用の値。画面表示(整数)に合わせて切り捨てる。
// calculateRepop の結果は整数(切り捨て済み)、tick 更新の結果は小数で、
// そのまま比較すると同率のモブが別の値として扱われ、ランク・拡張順に進まなくなる。
function percentKey(info: { elapsedPercent?: number | null }): number {
  return Math.floor(info.elapsedPercent || 0);
}

export function allTabComparator(a: Mob, b: Mob): number {
  const aInfo = a.repopInfo || { status: "Unknown", isInConditionWindow: false, maxRepop: 0, minRepop: 0, elapsedPercent: 0, isMaintenanceStop: false, isBlockedByMaintenance: false };
  const bInfo = b.repopInfo || { status: "Unknown", isInConditionWindow: false, maxRepop: 0, minRepop: 0, elapsedPercent: 0, isMaintenanceStop: false, isBlockedByMaintenance: false };
  const aStatus = aInfo.status;
  const bStatus = bInfo.status;

  const aIsAfterMaintenance =
    aInfo.isMaintenanceStop || aInfo.isBlockedByMaintenance;
  const bIsAfterMaintenance =
    bInfo.isMaintenanceStop || bInfo.isBlockedByMaintenance;

  if (aIsAfterMaintenance && !bIsAfterMaintenance) return 1;
  if (!aIsAfterMaintenance && bIsAfterMaintenance) return -1;

  const isAMaxOver = aStatus === "MaxOver";
  const isBMaxOver = bStatus === "MaxOver";

  if (isAMaxOver && !isBMaxOver) return -1;
  if (!isAMaxOver && isBMaxOver) return 1;

  if (isAMaxOver && isBMaxOver) {
    const aActive = aInfo.isInConditionWindow;
    const bActive = bInfo.isInConditionWindow;

    if (a.rank !== RANKS.A && b.rank !== RANKS.A) {
      if (aActive && !bActive) return -1;
      if (!aActive && bActive) return 1;

      const at = aInfo.maxRepop || 0;
      const bt = bInfo.maxRepop || 0;
      if (at !== bt) return at - bt;
    }

    const getMaxOverRankPriority = (r: string) => {
      if (r === RANKS.S) return 0;
      if (r === RANKS.F) return 1;
      if (r === RANKS.A) return 2;
      return 99;
    };

    const rankDiff = getMaxOverRankPriority(a.rank) - getMaxOverRankPriority(b.rank);
    if (rankDiff !== 0) return rankDiff;

    if (a.ExpansionId !== b.ExpansionId && a.ExpansionId !== undefined && b.ExpansionId !== undefined) {
      return b.ExpansionId - a.ExpansionId;
    }

    const pa = parseMobIdParts(a.No);
    const pb = parseMobIdParts(b.No);
    if (pa.mobNo !== pb.mobNo) return pa.mobNo - pb.mobNo;

    return pa.instance - pb.instance;
  }

  const isAConditionActive = !!aInfo.isInConditionWindow;
  const isBConditionActive = !!bInfo.isInConditionWindow;

  if (isAConditionActive && !isBConditionActive) return -1;
  if (!isAConditionActive && isBConditionActive) return 1;

  const gKey = getGroupKey(a);
  if ((gKey === "NEXT" || gKey === "MAINTENANCE") && gKey === getGroupKey(b)) {
    const at = aInfo.minRepop || Infinity;
    const bt = bInfo.minRepop || Infinity;
    if (at !== bt) return at - bt;
  }

  if (getGroupKey(a) === "WINDOW" && getGroupKey(b) === "WINDOW") {
    const aPct = percentKey(aInfo);
    const bPct = percentKey(bInfo);
    if (aPct !== bPct) return bPct - aPct;

    const rankDiff = rankPriority(a.rank) - rankPriority(b.rank);
    if (rankDiff !== 0) return rankDiff;
    if (a.ExpansionId !== b.ExpansionId && a.ExpansionId !== undefined && b.ExpansionId !== undefined) {
      return b.ExpansionId - a.ExpansionId;
    }
    const pa = parseMobIdParts(a.No);
    const pb = parseMobIdParts(b.No);
    if (pa.mobNo !== pb.mobNo) return pa.mobNo - pb.mobNo;
    return pa.instance - pb.instance;
  }

  const aPercent = percentKey(aInfo);
  const bPercent = percentKey(bInfo);

  if (aPercent !== bPercent) {
    return bPercent - aPercent;
  }

  const rankDiff = rankPriority(a.rank) - rankPriority(b.rank);
  if (rankDiff !== 0) return rankDiff;

  if (a.ExpansionId !== b.ExpansionId && a.ExpansionId !== undefined && b.ExpansionId !== undefined) {
    return b.ExpansionId - a.ExpansionId;
  }

  const pa = parseMobIdParts(a.No);
  const pb = parseMobIdParts(b.No);
  if (pa.mobNo !== pb.mobNo) return pa.mobNo - pb.mobNo;

  return pa.instance - pb.instance;
}
