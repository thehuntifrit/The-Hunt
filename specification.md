# The Hunt - システム仕様書

## 1. プロジェクト概要

FFXIVのモブハント（S/A/Fランク）情報をリアルタイムで管理・共有するWebアプリケーション。
高度な時間計算エンジンと並列処理により、精度の高い湧き予測と快適なUIレスポンスの両立を実現している。

### 技術スタック

- **Frontend**: HTML5, Vanilla JavaScript (ES Modules)
- **Styling**: CSS3 (Vanilla CSS + Tailwind CSS utilities)
- **Backend**: Firebase (Firestore, Authentication)
- **Optimization**: Web Worker (並列計算), IntersectionObserver (動的レンダリング)
- **Libraries**:
  - Marked.js (Markdown)
  - Google Fonts (Inter, Outfit)

## 2. ディレクトリ構成

```text
/
├── index.html          # エントリーポイント
├── style.css           # グローバルスタイル・アニメーション・デザインシステム
├── mob_data.json       # 静的データ（ランク、基本間隔、湧き位置、特殊条件）
├── maintenance.json    # メンテ情報（Subscribe失敗時のフォールバック）
├── src/
│   ├── app.js          # アプリ初期化、グローバルイベント、ライフサイクル管理
│   ├── dataManager.js  # 状態管理 (State)、Firestore購読、Worker連携
│   ├── worker.js       # 並列処理：重い計算（特殊条件・時間算出）を実行
│   ├── uiRender.js     # 特化型レンダリング、差分更新、ソート、Observer
│   ├── cal.js          # エオルゼア計算、共通計算ロジック、Debounce
│   ├── server.js       # Firebase SDK連携（Auth, Direct Firestore CRUD）
│   ├── filterUI.js     # フィルタリングパネル、タブ切り替え、状態永続化
│   ├── location.js     # マップ描画、湧き位置（Cull）変換ロジック
│   ├── modal.js        # 報告モーダル、バリデーション
│   ├── tooltip.js      # 階層型ツールチップ
│   └── readme.js       # Markdownビューワー
└── maps/               # マップ画像アセット
```

## 3. データアーキテクチャ

### 3.1 静的データ構造 (`mob_data.json`)

モブごとの定義。

- `repopSeconds` / `maxRepopSeconds`: 基礎間隔。
- `conditions`: 複雑な湧き条件（`moonPhase`, `weatherSeedRange`, `timeRange`, `weatherDuration` 等）。
- `locations`: 湧きポイント座標。`mob_ranks` で "S" や "B1/B2"（湧き潰し優先度）を定義。

### 3.2 状態管理 (`state`)

`dataManager.js` で一元管理され、`localStorage` で永続化される。

- mobs: 静的データと Firestore の動的データが結合された配列。
- filter: ランク・エリアごとの Set。
- spawnConditionCache: Workerによる計算結果（重い計算の再利用）。

## 4. コアロジックと最適化

### 4.1 並列計算エンジン

計算負荷の高い特殊条件（月齢・天候・ETの複合検索）は **Web Worker (`worker.js`)** で実行される。

- メインスレッドを止めず、バックグラウンドで将来の湧き窓を探索。
- プロジェクト独自の `scheduleConditionCalculation` により、必要最小限の再計算を行う。

### 4.2 レンダリング最適化

- **IntersectionObserver**: 画面内に見えている（Intersection）モブカードのみ、プログレスバーやテキストのリアルタイム更新（1秒毎）を実行する。
- **差分レンダリング**: リスト更新時に全てのDOMを破壊せず、IDをキーに既存カードを再配置・再利用することでレイアウトシフトと負荷を抑制。
- **2-step Animation**: `requestAnimationFrame` を重ねることで、初期ロード時のカクつきを防止。

### 4.3 メンテナンス影響計算

- メンテ後、A/Sランクは `基礎間隔 * 0.6`、Fランクは `基礎間隔 * 1.0` で再開される（サーバーアップ時刻基準）。
- メンテ中に湧き時間が到来するモブは `isMaintenanceStop` (停止中) または `isBlockedByMaintenance` (被り) として可視化される。

## 5. 順序・ソート仕様 (`allTabComparator`)

以下の優先順位で厳密にソートされる：

1. **メンテナンス非停止優先**: 稼働中のモブを上位へ。
2. **MaxOver優先**: 最長時間を過ぎているものを最上位。
3. **ConditionActive優先**: 特殊条件を満たしているものを優先。
4. **進行度順**: 最短時間以降の経過率 (`elapsedPercent`) が高い順。
5. **時間順**: 最短湧き時間が早い順。
6. **ランク順**: S > A > F。
7. **拡張順**: 最新パッチ（黄金）から順に。
8. **安定ソート**: モブID・インスタンスによる最終決定。

## 6. UI/UX 仕様

- **ネオンエフェクト**: 湧き時間内のモブはカード外枠がランク色のネオンで発光。
- **インスタント報告**: Aランクはサイドバーの1タップで即時報告。S/Fは誤操作防止のためスワイプまたはボタンからモーダル経由。
- **湧き潰しハイライト**: 湧きポイントが残り1箇所になると、ポイントが黄色く強調され、カード上に「●番」と表示される。
- **リアルタイムメモ**: 入力と同時にFirestoreへ同期。他のユーザーにはツールチップとして即座に反映される。
- **エオルゼア時計**: 上部に常駐。

---
Last Updated: 2025-12-30
