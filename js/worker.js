// worker.js

import { calculateRepop } from "./cal.js";

self.onmessage = function (e) {
    const { type, mob, maintenance, options } = e.data;

    if (type === "CALCULATE") {
        try {
            const result = calculateRepop(mob, maintenance, options);
            self.postMessage({
                type: "RESULT",
                mobNo: mob.No,
                repopInfo: result,
                spawnCache: mob._spawnCache
            });
        } catch (error) {
            self.postMessage({
                type: "ERROR",
                mobNo: mob.No,
                error: error.message
            });
        }
    }
};
