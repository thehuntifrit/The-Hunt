// convert-mob-ids.mjs  使い方: node convert-mob-ids.mjs mob_data.json
import fs from "node:fs";

const src = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));

const entries = Object.entries(src.mobs).map(([no, v]) => {
  const s = String(no).padStart(5, "0");
  return { old: s, exp: +s[0], rank: v.r, mm: +s.slice(2, 4), inst: +s[4], v };
}).sort((a, b) => a.old.localeCompare(b.old));

// 拡張ごとのエリア順: Sの出現順 → Sに無いエリアは末尾に追加
const areaOrder = {};
for (const e of entries.filter(e => e.rank === "S")) {
  const list = (areaOrder[e.exp] ??= []);
  if (!list.includes(e.v.a)) list.push(e.v.a);
}
for (const e of entries) {
  const list = (areaOrder[e.exp] ??= []);
  if (!list.includes(e.v.a)) list.push(e.v.a);
}

// Aの枠: 同じ拡張・エリア内で、旧MMの小さい順に 3, 4
const aMms = {};
for (const e of entries.filter(e => e.rank === "A")) {
  const k = `${e.exp}|${e.v.a}`;
  const set = (aMms[k] ??= new Set());
  set.add(e.mm);
}

const newMobs = {};
const mapping = {};
for (const e of entries) {
  const area = areaOrder[e.exp].indexOf(e.v.a) + 1;
  let slot;
  if (e.rank === "S") slot = 1;
  else if (e.rank === "F") slot = 6;
  else slot = 3 + [...aMms[`${e.exp}|${e.v.a}`]].sort((a, b) => a - b).indexOf(e.mm);

  const newNo = `${e.exp}${String(area).padStart(2, "0")}${slot}${e.inst}`;
  if (newMobs[newNo]) throw new Error(`番号重複: ${newNo} (旧 ${e.old})`);
  newMobs[newNo] = e.v;
  mapping[e.old] = newNo;
}

fs.writeFileSync("mob_data.new.json", JSON.stringify({ mobs: newMobs }, null, 2));
fs.writeFileSync("mob_id_mapping.json", JSON.stringify(mapping, null, 2));
console.log(`変換完了: ${Object.keys(mapping).length}件`);
