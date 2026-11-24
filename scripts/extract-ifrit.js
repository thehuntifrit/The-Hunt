
import fs from "node:fs";
import path from "node:path";

// 通常の抽出対象から除外するMob
// 漆黒エリア以降のSモブ討伐時に低確率で追加出現するSSモブ
const ignoredMobIds = new Set([
  "ker",
  "forgiven_rebellion",
  "arch_aethereater"
]);

const root = process.cwd();

const inputPath = path.join(root, "gaia-response.json");
const mobMapPath = path.join(
  root,
  "public/json/faloop-mob-map.json"
);
const reverseMapPath = path.join(
  root,
  "public/json/faloop-reverse-map.json"
);
const outputPath = path.join(root, "ifrit-kills.json");

// JSON読み込み
function readJson(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`ファイルが見つかりません: ${filePath}`);
  }

  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

const response = readJson(inputPath);
const mobMap = readJson(mobMapPath);
const reverseMap = readJson(reverseMapPath);

// Faloopの全ワールドデータ
const windows = response?.data?.status?.windows;

if (!Array.isArray(windows)) {
  throw new Error("data.status.windows が見つかりません");
}

// Ifritのデータだけ抽出
const ifritWindows = windows.filter(
  mob => String(mob.worldId2).toLowerCase() === "ifrit"
);

const mobs = [];
const unmappedMobIds = [];
const inconsistentMappings = [];
const duplicateMobIds = [];

// Mob IDごとの重複確認
const seenMobIds = new Set();

for (const mob of ifritWindows) {
  const faloopMobId = mob.mobId2;
  const mapped = mobMap[faloopMobId];

  if (!mapped) {
    if (ignoredMobIds.has(faloopMobId)) {
      continue;
    }

    unmappedMobIds.push(faloopMobId);
    continue;
  }

  const mobNo = String(mapped.mobNo);

  // 逆引きマップとの整合性確認
  if (reverseMap[mobNo] !== faloopMobId) {
    inconsistentMappings.push({
      mobNo,
      expected: faloopMobId,
      actual: reverseMap[mobNo] ?? null
    });
  }

  // 同じMobが複数回含まれていないか確認
  if (seenMobIds.has(faloopMobId)) {
    duplicateMobIds.push(faloopMobId);
    continue;
  }

  seenMobIds.add(faloopMobId);

  mobs.push({
    mobNo,
    faloopMobId,
    name: mapped.name,
    rank: mapped.rank,
    area: mapped.area,

    // 通常の討伐報告時刻
    last_kill_time: mob.startedAt ?? null,
    prev_kill_time: mob.prevStartedAt ?? null,

    // Firestoreの保存先
    firestoreDocument: `${mapped.rank.toLowerCase()}_latest`
  });
}

// ランク・Mob ID順に整理
const rankOrder = { S: 0, A: 1, F: 2 };

mobs.sort((a, b) => {
  const rankDiff = rankOrder[a.rank] - rankOrder[b.rank];
  if (rankDiff !== 0) return rankDiff;

  return a.mobNo.localeCompare(b.mobNo);
});

// 抽出結果
const result = {
  world: "ifrit",
  fetchedAt: new Date().toISOString(),
  count: mobs.length,
  mobs,
  warnings: {
    unmappedMobIds,
    inconsistentMappings,
    duplicateMobIds
  }
};

fs.writeFileSync(
  outputPath,
  JSON.stringify(result, null, 2),
  "utf8"
);

console.log("Ifritデータの抽出が完了しました");
console.log(`対象データ: ${ifritWindows.length}件`);
console.log(`変換成功: ${mobs.length}件`);
console.log(`マッピングなし: ${unmappedMobIds.length}件`);
console.log(`逆引き不一致: ${inconsistentMappings.length}件`);
console.log(`重複: ${duplicateMobIds.length}件`);
console.log(`出力先: ${outputPath}`);

if (unmappedMobIds.length > 0) {
  console.warn("マッピングできなかったMob ID:", unmappedMobIds);
}

if (inconsistentMappings.length > 0) {
  console.warn("マッピングの不整合:", inconsistentMappings);
}

if (duplicateMobIds.length > 0) {
  console.warn("重複したMob ID:", duplicateMobIds);
}
