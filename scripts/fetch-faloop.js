
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const OUTPUT_DIR = "faloop-output";
const PROFILE_DIR = "./faloop-browser-data";

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const context = await chromium.launchPersistentContext(
  PROFILE_DIR,
  {
    headless: process.env.CI === "true",
  }
);

const responseTasks = [];

let apiCount = 0;
let gaiaDataFound = false;

function safeUrl(rawUrl) {
  const url = new URL(rawUrl);

  // 認証情報になり得るクエリ値は伏せる
  const safeParams = [...url.searchParams.keys()].map(key => {
    const lower = key.toLowerCase();

    if (
      lower.includes("session") ||
      lower.includes("token") ||
      lower === "sid"
    ) {
      return `${key}=[REDACTED]`;
    }

    return `${key}=${url.searchParams.get(key)}`;
  });

  return url.origin + url.pathname +
    (safeParams.length ? `?${safeParams.join("&")}` : "");
}

try {
  const page = context.pages()[0] || await context.newPage();

  // HTTPリクエスト
  page.on("request", request => {
    const url = new URL(request.url());

    if (url.pathname.startsWith("/api/")) {
      console.log(
        "[REQUEST]",
        request.method(),
        safeUrl(request.url())
      );
    }
  });

  // HTTPレスポンス
  page.on("response", response => {
    const task = (async () => {
      const url = new URL(response.url());

      console.log(
        "[RESPONSE]",
        response.status(),
        safeUrl(response.url())
      );

      if (!url.pathname.startsWith("/api/")) {
        return;
      }

      const contentType =
        response.headers()["content-type"] || "";

      if (!contentType.includes("json")) {
        return;
      }

      try {
        const body = await response.json();

        apiCount++;

        const filename =
          `api-${String(apiCount).padStart(3, "0")}.json`;

        fs.writeFileSync(
          path.join(OUTPUT_DIR, filename),
          JSON.stringify(body, null, 2),
          "utf8"
        );

        console.log("[API SAVED]", filename);

        // 元の条件を維持
        // data-center/gaia は討伐データとは別扱い
        const isGaiaCandidate =
          url.pathname.toLowerCase().endsWith("/data-center/gaia");

        if (isGaiaCandidate) {
          gaiaDataFound = true;

          fs.writeFileSync(
            path.resolve("gaia-response.json"),
            JSON.stringify(body, null, 2),
            "utf8"
          );

          console.log("[GAIA DATA SAVED]");
        }

      } catch (error) {
        console.log("[API SAVE ERROR]", error.message);
      }
    })();

    responseTasks.push(task);
  });

  // 通信失敗
  page.on("requestfailed", request => {
    console.log(
      "[REQUEST FAILED]",
      safeUrl(request.url()),
      request.failure()?.errorText
    );
  });

  page.on("pageerror", error => {
    console.log("[PAGE ERROR]", error.message);
  });

  // Faloopを開く
  console.log("Faloopを開いています...");

  await page.goto("https://faloop.app/", {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });

  // 初期設定
  console.log("[1] 日本語を選択");

  await page.getByText("JP", {
    exact: true,
  }).click();

  await page.waitForTimeout(1000);

  console.log("[2] ワールド選択");

  const worldSelect = page.locator("select").first();

  await worldSelect.waitFor({
    state: "visible",
  });

  await worldSelect.selectOption("ifrit");

  console.log("[3] Ifrit選択完了");

  console.log("[4] 準備完了をクリック");

  await page.getByRole("button", {
    name: "準備完了！",
    exact: true,
  }).click();

  console.log("[5] メインページへの遷移完了");

  await page.waitForTimeout(5000);

  console.log("ページタイトル:", await page.title());

  // 初期データのレスポンス処理が終わるまで待つ
  console.log("APIレスポンスを処理しています...");

  await Promise.all(responseTasks);

  console.log("===== 取得結果 =====");
  console.log("APIレスポンス数:", apiCount);
  console.log("gaiaデータ:", gaiaDataFound ? "検出" : "未検出");
  console.log("保存先:", OUTPUT_DIR);

  if (!gaiaDataFound) {
    throw new Error("Gaiaデータを取得できませんでした");
  }

} catch (error) {
  console.error("[ERROR]", error);

  process.exitCode = 1;

} finally {
  await context.close();
}
