export const WORKER_BASE_URL = "https://icy-resonance-2526.the-hunt-ifrit.workers.dev/";

const TIME_SYNC_SAMPLES = 3;
const TIME_SYNC_MAX_RTT_MS = 3000;
const TIME_SYNC_INTERVAL_MS = 15 * 60 * 1000;

let offset = 0;

/** サーバー時刻に補正した現在時刻(ms)。同期前・同期失敗時はクライアント時刻と同じ */
export function now(): number {
    return Date.now() + offset;
}

/** 現在のずれ(ms)。calWorker へ渡すために使う */
export function getServerTimeOffset(): number {
    return offset;
}

/** ずれを直接セットする。calWorker が、メインスレッドから受け取った値を反映するために使う */
export function setServerTimeOffset(ms: number): void {
    if (Number.isFinite(ms)) offset = ms;
}

let syncing = false;

/** Worker の /time に問い合わせて、ずれを更新する。全部失敗した場合は前回の値を維持する */
export async function syncTime(): Promise<void> {
    if (syncing) return;
    syncing = true;
    try {
        let best: { rtt: number; offset: number } | null = null;

        for (let i = 0; i < TIME_SYNC_SAMPLES; i++) {
            try {
                const t0 = Date.now();
                const res = await fetch(`${WORKER_BASE_URL}time?_=${t0}`, { cache: "no-store" });
                if (!res.ok) continue;
                const data = (await res.json()) as { t?: number };
                const t1 = Date.now();

                const rtt = t1 - t0;
                if (typeof data.t !== "number" || rtt > TIME_SYNC_MAX_RTT_MS) continue;

                const off = data.t + rtt / 2 - t1;
                if (!best || rtt < best.rtt) best = { rtt, offset: off };
            } catch {
                // 失敗した計測は無視
            }
        }

        if (best) offset = best.offset;
    } finally {
        syncing = false;
    }
}

let started = false;

/** 起動時に1回だけ呼ぶ(メインスレッド専用)。定期的な再同期と、タブ復帰時の再同期も設定する */
export function startTimeSync(): void {
    if (started) return;
    started = true;

    void syncTime();
    setInterval(() => void syncTime(), TIME_SYNC_INTERVAL_MS);
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") void syncTime();
    });
}