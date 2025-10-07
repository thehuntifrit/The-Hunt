/* style.css に以下のセクションがあるか確認・追加 */

/* マップ詳細パネルの開閉アニメーション */
.mob-details {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.4s ease-out;
}

.mob-details.open {
    /* 非常に大きな値を設定することで、コンテンツの高さに関わらず展開を保証 */
    max-height: 1000px; 
    transition: max-height 0.6s ease-in;
}

/* スポーンポイントの基本スタイル */
.spawn-point {
    position: absolute;
    width: 8px; 
    height: 8px;
    border-radius: 50%;
    transform: translate(-50%, -50%); 
    pointer-events: auto;
    cursor: pointer;
    z-index: 10;
    transition: transform 0.1s;
}

.map-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
}

.map-image {
    width: 100%;
    height: auto;
    border-radius: 0.5rem; 
}
