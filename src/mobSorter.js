// mobSorter.js

const mobIdPartsCache = new Map();

export function rankPriority(rank) {
    switch (rank) {
        case "S": return 0;
        case "A": return 1;
        case "F": return 2;
        default: return 99;
    }
}

export function parseMobIdParts(no) {
    if (mobIdPartsCache.has(no)) {
        return mobIdPartsCache.get(no);
    }
    const str = String(no).padStart(5, "0");
    const result = {
        mobNo: parseInt(str.slice(2, 4), 10),
        instance: parseInt(str[4], 10),
    };
    mobIdPartsCache.set(no, result);
    return result;
}

export function allTabComparator(a, b) {
    const aInfo = a.repopInfo || {};
    const bInfo = b.repopInfo || {};
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

        if (aActive && !bActive) return -1;
        if (!aActive && bActive) return 1;

        const getMaxOverRankPriority = (r) => {
            if (r === 'S') return 0;
            if (r === 'F') return 1;
            if (r === 'A') return 2;
            return 99;
        };

        const rankDiff = getMaxOverRankPriority(a.Rank) - getMaxOverRankPriority(b.Rank);
        if (rankDiff !== 0) return rankDiff;

        if (a.ExpansionId !== b.ExpansionId) return b.ExpansionId - a.ExpansionId;

        const pa = parseMobIdParts(a.No);
        const pb = parseMobIdParts(b.No);
        if (pa.mobNo !== pb.mobNo) return pa.mobNo - pb.mobNo;

        return pa.instance - pb.instance;
    }

    const isAConditionActive = aStatus === "ConditionActive";
    const isBConditionActive = bStatus === "ConditionActive";

    if (isAConditionActive && !isBConditionActive) return -1;
    if (!isAConditionActive && isBConditionActive) return 1;

    const aPercent = aInfo.elapsedPercent || 0;
    const bPercent = bInfo.elapsedPercent || 0;

    if (Math.abs(aPercent - bPercent) > 0.001) {
        return bPercent - aPercent;
    }

    if (!aIsAfterMaintenance && !bIsAfterMaintenance) {
        const aTime = aInfo.minRepop || 0;
        const bTime = bInfo.minRepop || 0;
        if (aTime !== bTime) return aTime - bTime;
    }

    const rankDiff = rankPriority(a.Rank) - rankPriority(b.Rank);
    if (rankDiff !== 0) return rankDiff;

    if (a.ExpansionId !== b.ExpansionId) return b.ExpansionId - a.ExpansionId;

    const pa = parseMobIdParts(a.No);
    const pb = parseMobIdParts(b.No);
    if (pa.mobNo !== pb.mobNo) return pa.mobNo - pb.mobNo;

    return pa.instance - pb.instance;
}
