# The Hunt System Specification (Deep-Dive Edition)

本ドキュメントは、「The Hunt」モブハント管理アプリケーションの動作、UI/UX、および技術仕様を詳細に定義したものである。本仕様書は、AIエージェントおよび開発者がシステムを誤解なく解釈し、一貫性を保った実装を行うための唯一の正解（Single Source of Truth）として機能する。

---

## 1. システム・アーキテクチャ

### 1.1 技術スタック (Standard Tech Stack)

- **Frontend**: ES Modules (ESM) ベースの Vanilla JavaScript, HTML5.
- **Styling**: Vanilla CSS (主要スタイル), Tailwind CSS (ユーティリティ一部).
- **Storage/Sync**: Firebase Firestore (リアルタイムデータベース).
- **Authentication**: Firebase Auth + Cloudflare Worker (Lodestone検証プロキシ).
- **Computation**: Web Workers (重い計算のオフロード).
- **Library**: `marked.min.js` (Markdown), `purify.min.js` (Sanitization).

### 1.2 データ・同期フロー

1. **静的データ**: `json/mob_data.json` (固定モブ情報), `json/mob_locations.json` (湧きポイント).
2. **動的データ**: Firestore からの `mob_status`, `mob_locations`, `shared_data` (memo/maintenance).
3. **状態管理 (`dataManager.js`)**: `state.mobs` 配列にJSONデータと動的ステータス、計算済み `repopInfo` を統合。
4. **UI反映**: `CustomEvent` (`mobUpdated`, `locationsUpdated`, `filterChanged`) を介したリアクティブな更新。 `IntersectionObserver` により、PCリストの可視範囲のみを効率的に再描画。

---

## 2. デザインシステム & 視覚仕様

### 2.1 カラーパレット (CSS Variables)

`style.css` の `:root` で定義される色彩。

| 変数名 | 値 (Hex/RGB) | 用途 |
| :--- | :--- | :--- |
| `--bg-dark` | `#0f172a` | メイン背景 |
| `--bg-card` | `rgba(30, 41, 59, 0.45)` | カード背景 (半透過) |
| `--accent-cyan` | `#22d3ee` | プライマリ・アクセント (UI部品) |
| `--accent-gold` | `#fbbf24` | セカンダリ・アクセント (重要情報) |
| `--accent-crimson` | `#f87171` | 警告・エラー・中止 |
| `--rank-s` | `#fbbf24` / `251, 191, 36` | Sランク強調色 |
| `--rank-a` | `#6ba37a` / `107, 163, 122` | Aランク強調色 |
| `--rank-f` | `#818cf8` / `129, 140, 248` | Fランク(特殊/FATE)強調色 |
| `--progress-fill` | `linear-gradient(90deg, #0ea5e9, #3b82f6)` | プログレスバー（通常） |

### 2.2 タイポグラフィ

- **Primary**: `'Inter', sans-serif` (UI全般)
- **Numeric/Monospace**: `'JetBrains Mono', 'Roboto Mono', monospace` (タイマー、座標、%、時刻)

---

## 3. UIコンポーネント詳細

### 3.1 PC版レイアウト (`lg:block`)

- **左リスト (`#pc-left-list`)**: `pc-list-item` (高さ 28px) の凝縮リスト。
- **右詳細 (`#pc-right-pane`)**: 選択中のモブの詳細カード (`pc-detail-card`) を `sticky` 配置。
- **ヘッダー時計**: ET/LTを表示。

### 3.2 モバイル版レイアウト (`lg:hidden`)

- **ヘッダー (`#mobile-top-bar`)**: 固定表示。タイトルとET/LT時計。
- **フッター (`#mobile-footer-bar`)**: 固定表示。各フィルタパネルへのアクセス。
- **メインリスト**: ステータス別にグループ化された `mob-card`.
- **拡大表示**: `mob-card` をタップすると、画面中央にオーバーレイ表示され、詳細情報が展開される。

### 3.3 モブカードのビジュアル階層

- **プログレスバー**:
  - 通常: 青グラデーション。
  - 進行度 90% 超過 / Window内: 白い脈動発光 (`BLINK_WHITE`).
  - 湧き条件成立中: カード全体に白い太枠 (`blink-border-white`).
- **ステータス表示 (`label`)**:
  - `次回`: リリポップ待機中。
  - `残り`: Pop Window中。
  - `超過`: 最長リリポップ超過。
  - `中止`: メンテナンス等による停止。

---

## 4. 動作アルゴリズム & 計算仕様

### 4.1 リリポップロジック (`cal.js`)

- **基準**: 前回討伐からの経過秒数 vs `repopSeconds` (最短) & `maxRepopSeconds` (最長).
- **メンテナンス補正**:
  - 条件: `ServerStartTime` > `LastKillTime` の場合。
  - 補正: リリポップ時間を **通常比 60%** に短縮（Fランク除く）。
- **ステータス遷移**:
  1. `Maintenance`: メンテ中 / メンテにより停止。
  2. `Next`: 討伐直後、最短POP時間（Repop）未満。
  3. `PopWindow`: 最短POP時間経過後、最長（MaxRepop）未満。
  4. `ConditionActive`: Window内でかつ「天候/時間」等の条件が成立中。
  5. `MaxOver`: 最長POP時間を経過。

### 4.2 湧き条件検索 (Web Worker)

- 月齢 (Moon Phase)、天候 (Weather Seed)、エオルゼア時間 (ET) を総当たり探索。
- 次回湧き予測時間を `nextConditionSpawnDate` として算出し、UIに反映。

### 4.3 ソート順 (`mobSorter.js`)

1. **Status Group**: `MaxOver` > `Window/ConditionActive` > `Next` > `Maintenance`.
2. **Expansion**: 最新の拡張パック ID 順 (Dawntrail=5, Endwalker=4 ...).
3. **Internal Priority**:

- `Next`: 最短POPまでの時間が短い順。
- `PopWindow`: 経過パーセント (%) が大きい順。
- `MaxOver`: 優先度は Rank (S > F > A) > 経過時間の順。

---

## 5. 特殊機能仕様

### 5.1 マップ & 湧き潰し

- **マップ画像**: `icon/maps/` 内の画像を使用。
- **インスタンス表示**: `mob.No % 10` によるインスタンス番号。
- **湧き潰し (Culling)**:
  - Sランクの湧きポイントを管理。
  - **ルール**: 対応するBランクモブ（B1/B2）が配置され、そのポイントが「済（Culled）」になると、色がグレーアウトする。
  - **Last One**: 残り1箇所になったポイントを緑色 (`color-lastone`) で強調。

### 5.2 認証 & 報告システム

- **認証**: ユーザーは Lodestone の自己紹介欄に検証コード (`HUNT-XXXXXXXX`) を記載し、Cloudflare Worker 経由で検証。
- **報告権限**: 認証済みユーザーのみが討伐時刻を Firestore に書き込み可能。
- **メモ機能**: 全角30文字までの共有メモ。PC版ではフォントサイズを **14px** に拡張。

---

## 6. セキュリティ & 脆弱性対策

### 6.1 データアクセス制御 (Firestore Security Rules)

- **検証済み書き込み**: `isVerified()` 関数により、Firebase Auth 認証に加え、Firestore 上の `users/{uid}/lodestone_id` が存在することを必須とする。
- **最小権限**:
  - `allow delete: if false`: 悪意のある一括削除をサーバーサイドで遮断。
  - **所有者制限**: `users/{userId}` は本人のUID以外の読み書きを禁止。
- **静的データの保護**: `shared_data/maintenance` 等の重要設定は、一般ユーザーからの書き込みを一切遮断。

### 6.2 多層防御 (Cloudflare Worker)

- **トークン自己検証**: Googleの公開鍵を用いて Firebase ID トークン（JWT）の署名（RS256）を検証。
- **接続元制御**:
  - **ジオフェンス**: 日本国外 (Non-JP) IP アドレスからのリクエストを 403 Forbidden で遮断。
  - **ボットフィルタ**: `curl`, `wget`, `python-requests` 等の特定の User-Agent を自動拒否。
- **CORS制限**: `ALLOWED_ORIGINS` 定数により、許可されたドメイン（Firebase Hosting 等）以外からのクロスサイトリクエストを排除。

### 6.3 フロントエンドの堅牢化

- **XSS (Cross-Site Scripting) 対策**:
  - **サニタイズ**: `DOMPurify` (`purify.min.js`) を使用し、Markdown レンダリング後などの動的 HTML 出力を無害化。
  - **属性制御**: `target="_blank"` リンクに対する `rel="noopener noreferrer"` の付与。
- **Content Security Policy (CSP)**:
  - `<meta>` タグにより、許可されたドメイン（gstatic, googleapis, cloudfunctions 等）以外のスクリプトやリソースの実行・接続をブラウザレベルで制限。

---

## 8. 通知 & 討伐報告プロセス

### 8.1 デスクトップ通知 (Browser Notification)

- **トリガー条件**:
  - **まもなく**: 条件成立（湧き開始）の 2分前 (120秒)。
  - **時間なう！**: 条件成立時、または既に成立している状態での更新時。
- **通知チャネル**: Browser Notification API によるシステム通知 + SE (`FFXIV_Linkshell_Transmission`) の再生。
- **設定**: サイドバーまたはフッターの「通知」トグルの有効化、およびブラウザの権限許可が必要。

### 8.2 討伐報告フロー

- **PC版（Aランク）**: リスト上の「REPORT」ボタンによる **即時送信 (Instant Report)**。
- **PC版（S/Fランク） & モバイル全般**: 報告モーダル (`report-modal`) を経由。
  - **日時選択**: ローカル時刻に基づく日時ピッカー。
  - **強制送信**: すでに報告がある場合でも上書き可能なチェックボックス。
- **認証必須**: 討伐情報の送信には、Lodestone プロフィール連携（認証済み）が必須。

---

## 7. 時間計算 & アルゴリズム詳述

本システムの根幹を成す `js/cal.js` の計算ロジックを定義する。

### 7.1 時間定数 (Eorzea Time Constants)

- `ET_HOUR_SEC = 175`: エオルゼア1時間 = リアル175秒。
- `WEATHER_CYCLE_SEC = 1400`: 天候変化周期 = エオルゼア8時間 = リアル1400秒（23分20秒）。
- `ET_DAY_SEC = 4200`: エオルゼア1日 = リアル4200秒（70分）。
- `MOON_CYCLE_SEC = 134400`: エオルゼア1か月（32日） = リアル134,400秒（約37.3時間）。

### 7.2 リリポップ計算ロジック (`calculateRepop`)

討伐報告およびサーバー稼働状況に基づき、モブの出現窓（Pop Window）を算出する。

1. **変数定義**:
    - `lastKillTime`: 前回討伐日時。
    - `serverStartTime`: 直近のメンテナンス終了（サーバー稼働開始）日時。
    - `repopSeconds` (Shortest): 最短POPまでの秒数。
    - `maxRepopSeconds` (Longest): 最長（100%）POPまでの秒数。
2. **メンテナンス補正 (Maintenance Adjustment)**:
    - **条件**: `lastKillTime` < `serverStartTime`（前回の討伐がサーバー稼働前である場合）。
    - **数式**:
      - `minRepop = serverStartTime + (repopSeconds * 0.6)`
      - `maxRepop = serverStartTime + (maxRepopSeconds * 0.6)`
    - **例外**: Rank F（特殊モブ）は補正を受けず、常に `serverStartTime + repopSeconds` となる。
3. **通常時**:
    - `minRepop = lastKillTime + repopSeconds`
    - `maxRepop = lastKillTime + maxRepopSeconds`

### 7.3 天候シード生成アルゴリズム (Weather Seed)

サーバーサイドの天候生成ロジックをシミュレートする。

```javascript
// アルゴリズム概要
const eorzeanHours = Math.floor(unixSeconds / 175);
const eorzeanDays = Math.floor(eorzeanHours / 24);
let timeChunk = (eorzeanHours % 24) - (eorzeanHours % 8);
timeChunk = (timeChunk + 8) % 24; // 次の周期
const seed = (eorzeanDays * 100) + timeChunk;
const step1 = (seed << 11) ^ seed;
const step2 = ((step1 >>> 8) ^ step1) >>> 0;
const weatherSeed = step2 % 100; // 0-99 の値が生成される
```

### 7.4 条件探索アルゴリズム (`findNextSpawn`)

複雑な出現条件（月齢・天候・ET）の重なりを求める。

1. **探索ステップ**:
    - 月齢条件 (Moon Phase) に合致する期間を特定。
    - その期間内で、天候条件 (Weather) が成立する区間を抽出 (`getValidWeatherIntervals`)。
    - さらにその区間内で、時間条件 (ET) が成立する区間を抽出 (`getValidEtIntervals`)。
2. **継続条件 (Weather Duration)**:
    - 天候の継続時間が指定されている場合（例：1h以上特定の天候）、成立区間の開始時点から必要時間をオフセットして実際の POP 可能時間を算出。
3. **探索制限**:
    - パフォーマンス維持のため、`MAX_SEARCH_ITERATIONS = 5000` または `LIMIT_DAYS = 20`（リアル時間）を上限とする。

### 7.5 表示フォーマット仕様

- **タイマー表示**: `formatDurationColon` により出力。
- **アライメント**: 3桁時間のパディングに `\u00A0` (Non-breaking space) を使用し、JetBrains Mono フォントと組み合わせて、時間の増減による数字の「揺れ」を完全に抑制する。

---

**Last Updated**: 2026-04-02
**Version**: 2.1 (Implementation Sync)
