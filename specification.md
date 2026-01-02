# The Hunt System Specification

本ドキュメントは、FFXIVモブハント管理アプリケーション「The Hunt」の完全な技術仕様書である。
本仕様書を参照することで、開発者はシステムを一から再構築することが可能となる。

---

## 1. システム概要とアーキテクチャ

### 1.1 目的

FFXIVのS/A/Fランクモブの湧き時間をリアルタイムで管理・共有し、高度な湧き予測計算を提供する単方向データフローアプリケーション。

### 1.2 技術スタック

- **Frontend**: HTML5, Vanilla JavaScript (ES2022 Modules), Web Workers
- **Styling**: CSS3 (Vanilla + Tailwind CSS utilities), CSS Variables
- **Backend / Realtime**: Firebase (Firestore, Authentication)
- **Asset / Data**: JSON (Static Data), WebP (Images)
- **Third Party**: Marked.js (Markdown Rendering), Google Fonts (Inter, Outfit)

### 1.3 アーキテクチャ概略

メインスレッド（UI/Event）とワーカースレッド（計算）を分離し、Firestoreによるリアルタイム同期を行う。

```mermaid
graph TD
    User[User] -->|Report/Memo| UI[UI Layer (Main Thread)]
    UI -->|Render| DOM[DOM Updates]
    UI -->|Write| FS[Firestore]
    
    FS -->|Subscribe| DM[DataManager]
    DM -->|State Update| State[App State]
    DM -->|Calculation Req| Worker[Web Worker]
    Worker -->|Result| DM
    DM -->|Notify| UI
    
    Static[mob_data.json] -->|Load| DM
```

---

## 2. データ構造詳細

### 2.1 静的データ (`mob_data.json`)

アプリケーションの基盤となるマスターデータ。`mobs` オブジェクトのキーはモブID。

**Schema Definition:**

| Key | Type | Description |
| --- | --- | --- |
| `rank` | String | ランク ("S", "A", "F") |
| `name` | String | モブ名称 |
| `area` | String | 出現エリア名 |
| `condition` | String | 湧き条件のテキスト記述（表示用） |
| `repopSeconds` | Number | 最短リポップ時間（秒） |
| `maxRepopSeconds` | Number | 最長リポップ時間（秒） |
| `mapImage` | String | マップ画像ファイル名 |
| `moonPhase` | String? | "満月" / "新月" (特定月齢条件) |
| `weatherSeedRange` | [Number, Number]? | 天候シード範囲 [min, max] (0-99) |
| `timeRange` | {start: Number, end: Number}? | ET湧き時間条件 |
| `weatherDuration` | {minutes: Number}? | 天候継続時間の要件 |
| `locations` | PointObject[] | 湧き候補地点リスト |

**PointObject Structure:**

```json
{
  "id": "UN_101", // ユニークID (AreaInitial_Number)
  "x": 33.5,     // X座標 (%)
  "y": 8.0,      // Y座標 (%)
  "mob_ranks": ["S", "A", "B1"] // この地点で湧くモブのランク/優先度
}
```

### 2.2 状態管理 (`dataManager.js`)

シングルトンパターンの `state` オブジェクトによりメモリ内で状態を保持。

**State Object Structure:**

```javascript
const state = {
    userId: String | null,          // 匿名認証UID
    baseMobData: Array,             // processMobData済みマスターデータ
    mobs: Array,                    // 現在のRuntimeモブデータ配列
    mobLocations: Object,           // 湧き潰し状態マップ
    maintenance: Object | null,     // メンテナンス情報
    initialLoadComplete: Boolean,   // 初回ロード完了フラグ
    worker: Worker,                 // 計算用Web Workerインスタンス
    filter: {                       // フィルタ設定 (localStorage: 'huntFilterState')
        rank: "ALL" | "S" | "A" | "F",
        areaSets: { S: Set, A: Set, F: Set, ALL: Set }, // 表示エリア
        allRankSet: Set
    },
    pendingCalculationMobs: Set     // 計算待ちモブID
};
```

---

## 3. Firestore データベース設計

### 3.1 コレクション構成

| Collection | Document ID | Description |
| --- | --- | --- |
| `mob_status` | `s_latest` | Sランク全モブの最新討伐情報 |
| `mob_status` | `a_latest` | Aランク全モブの最新討伐情報 |
| `mob_status` | `f_latest` | Fランク全モブの最新討伐情報 |
| `mob_locations` | `{MobID}` | 各モブの湧き潰しポイント情報 |
| `shared_data` | `memo` | 全モブの共有メモ |
| `shared_data` | `maintenance` | メンテナンス情報 |

### 3.2 データモデル詳細

#### `mob_status/{rank_latest}`

単一ドキュメント内に複数モブの情報をMapとして保持（Read回数削減のため）。

```json
{
  "11011": {
    "last_kill_time": Timestamp, // 最終討伐時刻
    "prev_kill_time": Timestamp  // 前々回討伐時刻 (履歴用)
  },
  "12011": { ... }
}
```

#### `mob_locations/{MobID}`

特定モブの湧き地点ごとのステータス。

```json
{
  "points": {
    "UN_101": {
      "culled_at": Timestamp,   // 湧き潰し時刻
      "uncull_at": Timestamp    // 湧き潰し解除時刻
    }
  }
}
```

**注意**: `server.js` の `normalizePoints` 関数により、ドット記法 (`points.UN_101.culled_at`) の更新差分も適切にオブジェクトへ展開される。

#### `shared_data/memo`

直近のメモのみを配列で保持（現在は実質最新1件運用）。

```json
{
  "11011": [
    {
      "memo_text": "String",
      "created_at": Timestamp
    }
  ]
}
```

---

## 4. アルゴリズム仕様

### 4.1 時間・リポップ計算 (`cal.js`)

**基本計算式**:

```javascript
minRepop = lastKill + repopSeconds; // 最短湧き時刻
maxRepop = lastKill + maxRepopSeconds; // 最長湧き時刻
```

**メンテナンス補正ロジック**:
メンテナンス明け時刻 (`serverUp`) が `lastKill` より後の場合、タイマーがリセットされる。

- **S/Aランク**: `minRepop = serverUp + (repopSeconds * 0.6)`
- **Fランク**: `minRepop = serverUp + repopSeconds` （短縮なし）

### 4.2 特殊条件判定と予測探索 (`findNextSpawn`)

以下のエオルゼア時間(ET)・環境条件を組み合わせ、**最短湧き時刻以降**に条件を満たす最初のウィンドウを計算する。

1. **Moon Phase (月齢)**: ET 32日周期。
    - `calculateNextMoonStart` で次回の対象月齢開始時間を算出。
2. **Weather (天候)**: ET 8時間 (地球時間23分20秒) 周期。
    - `getEorzeaWeatherSeed` で算出される `0-99` のシード値が `weatherSeedRange` に含まれるか判定。
    - `checkWeatherInRange` 関数を使用。
3. **Time Range (ET時間)**: ET 1日 (地球時間70分) 周期。
    - 現在のETが指定範囲内か `checkTimeRange` で判定。

これらの条件は非常に重いため、`worker.js` でメインスレッドをブロックせずに総当たり探索 (`getValidWeatherIntervals` Generatorなど) を行う。

### 4.3 ステータス判定フロー

各モブは計算結果に基づき以下のステータスを持つ。

1. `MaxOver`: `now >= maxRepop` （確定湧き）
2. `ConditionActive`: 特殊条件を満たすウィンドウ収集中
3. `NextCondition`: 次の条件合致まで待機中
4. `PopWindow`: `now >= minRepop` （抽選湧き期間中）
5. `Next`: `now < minRepop` （湧き待ち）

これらは `calculateRepop` 関数内で一括判定され、UIのプログレスバー色やソート順に反映される。

---

## 5. UI/UX 動作仕様

### 5.1 ソート順序（優先度高→低）

1. **Maintenance Block**: メンテナンス停止していないもの
2. **Status**: `MaxOver`
3. **Status**: `ConditionActive`
4. **Status**: `PopWindow` 内での経過率 (`elapsedPercent` 降順)
5. **Status**: `NextCondition` (残り時間 昇順)
6. **Status**: `Next` (残り時間 昇順)
7. **Rank**: S > A > F
8. **ID**: モブID昇順（安定ソート用）

### 5.2 湧き潰し (Cull)

- マップ上の地点をクリックすると `toggleCrushStatus` が発火。
- `culled_at > uncull_at` の場合「済み」状態（半透明）。
- 全候補地点数 - 済み地点数 = 1 の場合、残りの1点を黄色くハイライト（確定演出）。

### 5.3 報告モーダル

- **"修正する"**: 過去の報告時間を修正する場合に使用。`closeReportModal` 時に必ずチェックが外れること。
- **バリデーション**: 未来時間（10分以上先）、湧き時間より前の報告（警告表示）を行う。

---

## 6. 定数・設定値

- `ET_HOUR_SEC`: **175秒** (地球時間)
- `WEATHER_CYCLE_SEC`: **1400秒** (ET 8時間)
- `MOON_CYCLE_SEC`: **ET 32日**
- `LIMIT_DAYS`: 湧き計算の探索上限 **20日** (地球時間)

---
Last Updated: 2026-01-01
