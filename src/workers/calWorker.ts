import { calculateRepop } from '../cal';
import { setServerTimeOffset } from '../servertime';
import type { Mob } from '../types/mob';

self.onmessage = (e: MessageEvent) => {
    const { type, mob, maintenance, options, timeOffset } = e.data;
    if (type === 'CALCULATE') {
        try {
            setServerTimeOffset(timeOffset ?? 0);
            const repopInfo = calculateRepop(mob as Mob, maintenance, options ?? {});
            const serialized = {
                ...repopInfo,
                nextMinRepopDate: repopInfo.nextMinRepopDate?.toISOString?.() ?? repopInfo.nextMinRepopDate,
                nextConditionSpawnDate: repopInfo.nextConditionSpawnDate?.toISOString?.() ?? repopInfo.nextConditionSpawnDate,
                conditionWindowEnd: repopInfo.conditionWindowEnd?.toISOString?.() ?? repopInfo.conditionWindowEnd,
            };
            self.postMessage({
                type: 'RESULT',
                mobNo: (mob as Mob).No,
                repopInfo: serialized,
                spawnCache: (mob as any)._spawnCache ?? null,
            });
        } catch (err: any) {
            self.postMessage({
                type: 'ERROR',
                mobNo: (mob as Mob).No,
                error: err?.message ?? String(err),
            });
        }
    }
};
