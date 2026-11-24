import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputPath = path.resolve(__dirname, "../ifrit-kills.json");
const dryRun = process.argv.includes("--dry-run");

// ----------------------------------------
// Firebase Admin SDK 認証
// ----------------------------------------

const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

if (!serviceAccountJson) {
  throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON が設定されていません");
}

let serviceAccount;

try {
  serviceAccount = JSON.parse(serviceAccountJson);
} catch {
  throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON のJSON形式が正しくありません");
}

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

// ----------------------------------------
// 入力データ読み込み
// ----------------------------------------

if (!fs.existsSync(inputPath)) {
  throw new Error(`入力ファイルが見つかりません: ${inputPath}`);
}

const input = JSON.parse(fs.readFileSync(inputPath, "utf8"));

if (input.world !== "ifrit") {
  throw new Error(`対象ワールドが不正です: ${input.world}`);
}

if (!Array.isArray(input.mobs)) {
  throw new Error("ifrit-kills.json の mobs が配列ではありません");
}

// ----------------------------------------
// データ検証
// ----------------------------------------

const allowedDocuments = {
  S: "s_latest",
  F: "f_latest"
};

const seenMobNos = new Set();

for (const mob of input.mobs) {
  if (!["S", "F"].includes(mob.rank)) {
    throw new Error(
      `対象外のランクが含まれています: ${mob.mobNo} (${mob.rank})`
    );
  }

  const expectedDocument = allowedDocuments[mob.rank];

  if (mob.firestoreDocument !== expectedDocument) {
    throw new Error(
      `Firestoreドキュメントが不正です: ${mob.mobNo}`
    );
  }

  const mobNo = String(mob.mobNo);

  if (!/^\d+$/.test(mobNo)) {
    throw new Error(`mobNoが不正です: ${mob.mobNo}`);
  }

  if (seenMobNos.has(mobNo)) {
    throw new Error(`mobNoが重複しています: ${mobNo}`);
  }

  seenMobNos.add(mobNo);

  for (const field of ["last_kill_time", "prev_kill_time"]) {
    const date = new Date(mob[field]);

    if (!mob[field] || Number.isNaN(date.getTime())) {
      throw new Error(
        `${mobNo} の ${field} が不正です: ${mob[field]}`
      );
    }
  }
}

// ----------------------------------------
// ランクごとに分類
// ----------------------------------------

const mobsByDocument = {
  s_latest: [],
  f_latest: []
};

for (const mob of input.mobs) {
  mobsByDocument[mob.firestoreDocument].push(mob);
}

console.log("================================");
console.log("Ifrit Firestore 同期");
console.log("================================");
console.log(`Sランク: ${mobsByDocument.s_latest.length}体`);
console.log(`Fランク: ${mobsByDocument.f_latest.length}体`);
console.log(`合計: ${input.mobs.length}体`);
console.log("Aランク・SSモブは対象外です。");
console.log("reporter_id は更新しません。");

if (dryRun) {
  console.log("DRY RUN: Firestoreへの書き込みは行いません。");
}

// ----------------------------------------
// Firestoreとの比較・更新
// ----------------------------------------

let updatedCount = 0;
let skippedOlderCount = 0;
let skippedSameCount = 0;
let newCount = 0;

for (const documentId of ["s_latest", "f_latest"]) {
  const mobs = mobsByDocument[documentId];

  if (mobs.length === 0) {
    continue;
  }

  const docRef = db.collection("mob_status").doc(documentId);
  const docSnapshot = await docRef.get();

  if (!docSnapshot.exists) {
    throw new Error(
      `Firestoreドキュメントが存在しません: mob_status/${documentId}`
    );
  }

  const existingData = docSnapshot.data() ?? {};
  const updates = {};

  for (const mob of mobs) {
    const mobNo = String(mob.mobNo);

    const incomingLast = new Date(mob.last_kill_time);
    const incomingPrev = new Date(mob.prev_kill_time);

    const existingMob = existingData[mobNo];
    const existingLast = existingMob?.last_kill_time;

    // Firestoreに既存データがない場合は新規登録
    if (!existingLast) {
      updates[`${mobNo}.last_kill_time`] =
        Timestamp.fromDate(incomingLast);

      updates[`${mobNo}.prev_kill_time`] =
        Timestamp.fromDate(incomingPrev);

      newCount++;

      console.log(`[新規] ${mobNo}: ${incomingLast.toISOString()}`);
      continue;
    }

    const existingMillis =
      typeof existingLast.toMillis === "function"
        ? existingLast.toMillis()
        : new Date(existingLast).getTime();

    const incomingMillis = incomingLast.getTime();

    if (Number.isNaN(existingMillis)) {
      throw new Error(
        `Firestore上の日時が不正です: ${mobNo}`
      );
    }

    // 取得データの方が古い場合
    if (incomingMillis < existingMillis) {
      skippedOlderCount++;
      continue;
    }

    // 同じ日時の場合
    if (incomingMillis === existingMillis) {
      skippedSameCount++;
      continue;
    }

    // 取得データの方が新しい場合だけ更新
    updates[`${mobNo}.last_kill_time`] =
      Timestamp.fromDate(incomingLast);

    updates[`${mobNo}.prev_kill_time`] =
      Timestamp.fromDate(incomingPrev);

    console.log(
      `[更新] ${mobNo}: ${new Date(existingMillis).toISOString()}`
      + ` → ${incomingLast.toISOString()}`
    );
  }

  const updateCount = Object.keys(updates).length / 2;

  if (updateCount > 0) {
    if (!dryRun) {
      await docRef.update(updates);
    }

    updatedCount += updateCount;

    console.log(
      `${documentId}: ${updateCount}体分の更新対象`
    );
  }
}

// ----------------------------------------
// 結果
// ----------------------------------------

console.log("");
console.log("================================");
console.log("同期結果");
console.log("================================");
console.log(`更新対象: ${updatedCount}体`);
console.log(`新規登録: ${newCount}体`);
console.log(`古いためスキップ: ${skippedOlderCount}体`);
console.log(`同時刻のためスキップ: ${skippedSameCount}体`);

if (dryRun) {
  console.log("");
  console.log("DRY RUNのため、実際の書き込みは行っていません。");
} else {
  console.log("");
  console.log("Firestoreへの同期が完了しました。");
}

process.exit(0);
