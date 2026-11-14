// servertime.ts
const TIME_URL = "https://icy-resonance-2526.the-hunt-ifrit.workers.dev/time";
const SAMPLES = 3;               // 計測回数(最小RTTの結果を採用)
const MAX_RTT_MS = 3000;         // これを超えた計測は捨てる
const RESYNC_INTERVAL_MS = 15 * 60 * 1000;

let offset = 0; // サーバー時刻 − クライアント時刻(ms)

/** サイト内の「現在時刻」はすべてこれを使う */
export const now = (): number => Date.now() + offset;

export async function syncTime(): Promise<void> {
  let best: { rtt: number; offset: number } | null = null;

  for (let i = 0; i < SAMPLES; i++) {
    try {
      const t0 = Date.now();
      const res = await fetch(`${TIME_URL}?_=${t0}`, { cache: "no-store" });
      const { t } = (await res.json()) as { t: number };
      const t1 = Date.now();

      const rtt = t1 - t0;
      if (rtt > MAX_RTT_MS) continue;

      const off = t + rtt / 2 - t1;
      if (!best || rtt < best.rtt) best = { rtt, offset: off };
    } catch {
      // 失敗した計測は無視
    }
  }

  // 全部失敗した場合は前回のoffsetを維持(初回なら0=クライアント時刻のまま)
  if (best) offset = best.offset;
}

export function startTimeSync(): void {
  void syncTime();
  setInterval(() => void syncTime(), RESYNC_INTERVAL_MS);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") void syncTime();
  });
}