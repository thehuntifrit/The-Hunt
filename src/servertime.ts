export const WORKER_BASE_URL = "https://icy-resonance-2526.the-hunt-ifrit.workers.dev/";

const TIME_SYNC_FIRST_SAMPLES = 3;     // 起動時(接続確立の影響を避けるため多めに測る)
const TIME_SYNC_REGULAR_SAMPLES = 2;   // 2回目以降
const TIME_SYNC_MAX_RTT_MS = 3000;
const TIME_SYNC_INTERVAL_MS = 60 * 60 * 1000;   // 定期同期: 60分
const TIME_SYNC_RESUME_AWAY_MS = 10 * 60 * 1000; // 裏に10分以上いたら復帰時に再同期

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

const syncListeners: Array<() => void> = [];

/** 同期でオフセットが更新されるたびに呼ばれるコールバックを登録する(メインスレッド用) */
export function onTimeSynced(cb: () => void): void {
    syncListeners.push(cb);
}

let syncing = false;
let hasSynced = false;

/** Worker の /time に問い合わせて、ずれを更新する。全部失敗した場合は前回の値を維持する */
export async function syncTime(): Promise<void> {
    if (syncing) return;
    syncing = true;
    try {
        let best: { rtt: number; offset: number } | null = null;
        const samples = hasSynced ? TIME_SYNC_REGULAR_SAMPLES : TIME_SYNC_FIRST_SAMPLES;

        for (let i = 0; i < samples; i++) {
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

        if (best) {
            offset = best.offset;
            hasSynced = true;
            syncListeners.forEach(cb => { try { cb(); } catch { /* 通知側の失敗は無視 */ } });
        }
    } finally {
        syncing = false;
    }
}

let started = false;

/** 起動時に1回だけ呼ぶ(メインスレッド専用)。定期的な再同期と、長く裏にいた後の復帰時の再同期も設定する */
export function startTimeSync(): void {
    if (started) return;
    started = true;

    void syncTime();
    setInterval(() => void syncTime(), TIME_SYNC_INTERVAL_MS);

    let hiddenAt = 0;
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") {
            hiddenAt = Date.now();
            return;
        }
        if (!hiddenAt) return;
        const awayMs = Date.now() - hiddenAt;
        hiddenAt = 0;
        if (awayMs >= TIME_SYNC_RESUME_AWAY_MS) void syncTime();
    });
}