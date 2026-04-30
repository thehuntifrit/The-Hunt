# モブハント 更新サイクル仕様書

本仕様書はAIが誤った実装をしないよう、更新サイクルの動作を厳密に定義したものである。

---

## 1. 処理対象の範囲

**常に「現在UIで選択されているランクタブ・拡張タブのモブのみ」が対象。**
選択外のモブは計算・描画・通知のいかなる処理からも完全に除外される。
`getFilteredMobs()` の返却値がその範囲である。

---

## 2. 更新サイクル（Tier）

### Tier B — 1分周期（論理監視）

- **間隔**: 60,000ms（リアル1分）
- **対象**: `getFilteredMobs()` の全件
- **処理**: `updateMobState` / `checkAndNotify`（ステータス判定・通知）
- **動作条件**: ブラウザタブの表示・非表示に関わらず**常に実行する**
- **重要**: Tier B が実行された場合、`lastTierCTime` も同時にリセットする。
  これにより Tier B 直後の Tier C 重複実行を防ぐ。

### Tier C — 約3秒周期（境界直前の高精度更新）

- **間隔**: 2,917ms（エオルゼア1分）
- **対象**: `getFilteredMobs()` のうち `nextBoundarySec - nowSec <= 60` のモブのみ
- **処理**: `updateMobState` / `checkAndNotify`（Tier B と同一）
- **動作条件**: ブラウザタブが**表示状態のときのみ** DOM 描画（`updateVisibleCards`）を実行する
- **目的**: 境界（minRepop / maxRepop / conditionWindowEnd 等）まで残り1分を切ったモブは
  1分周期では更新が間に合わないため、3秒精度で補完する

#### 【重要】Tier C の対象判定について

- `nextBoundarySec` は `[minRepop, maxRepop, conditionWindowEnd, ...]` のうち
  現在時刻より未来の最小値である
- **特殊条件中（ConditionActive / なう）のモブに特別扱いはない**
  窓の残り時間が60秒を超えている間は Tier B（1分）のみで処理される
  窓終了60秒前になって初めて Tier C に昇格する
- **「ConditionActive なら常に3秒更新」という実装は仕様違反である**

---

## 3. 可視性ガード（Visibility Guard）

- **非表示時（`document.visibilityState === 'hidden'`）**:
  - `updateVisibleCards()`（DOM描画）を実行しない
  - Tier B の論理監視・通知処理は継続する
- **復帰時（`visibilitychange` → `visible`）**:
  - `updateProgressBarsOptimized(force = true)` を即座に実行し、
    全件の再計算と描画を遅延なく反映させる
  - これにより、バックグラウンド中に蓄積されたズレを即座に解消する

---

## 4. 重い計算（天候・月齢探索）の実行タイミング

- `findNextSpawn` 等の条件探索処理は以下の**トリガー発生時のみ**実行する:
  1. 初回ロード時
  2. 討伐報告の受信時（Firestore より更新が届いたとき）
  3. 算出済みの `nextBoundarySec` を現在時刻が超えた（境界を跨いだ）とき
- **定期ループ（Tier B / Tier C）内で条件探索を再実行してはならない**
  ループ内では保存済みの `nextBoundarySec` との時刻比較（O(1)）のみを行う
- 探索結果は `mob._spawnCache` にキャッシュされ、`cacheKey` が変わるまで再利用される

---

## 5. AI向け禁止事項（過去の違反例）

以下は仕様違反であり、AIが自己判断で実装してはならない:

- Tier C の対象を `ConditionActive` 状態で別途抽出する処理
- Tier C を全件（全 `filtered` モブ）に対して実行する処理
- 定期ループ内で `calculateRepop` / `findNextSpawn` を無条件に呼び出す処理
- Tier B の対象を「一部のモブ」に絞り込む処理
- `updateVisibleCards` の visibility チェックを省略する処理


