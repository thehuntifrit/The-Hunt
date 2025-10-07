// script.js 修正箇所 2: renderAreaTabs 関数の更新

/**
 * エリアタブをレンダリングする (NEW: 複数選択対応)
 * @param {string[]} selectedAreas - 現在選択されている拡張キーの配列
 */
function renderAreaTabs(selectedAreas) {
    if (!areaTabs) return;

    areaTabs.innerHTML = ''; 
    
    // 'ALL' ボタンは、他のボタンが選択されていない場合にのみアクティブになる
    const isAllActive = selectedAreas.includes('ALL') || selectedAreas.length === 0;

    const areaButtonHtml = EXPANSION_AREAS.map(area => {
        
        // 'ALL' 以外のボタンのアクティブ状態判定
        let isActive = selectedAreas.includes(area.key);
        
        // 'ALL' ボタンのアクティブ状態を特殊処理
        if (area.key === 'ALL') {
             isActive = isAllActive;
        }

        const baseClass = 'area-btn flex-1 px-1 py-1 rounded-lg text-xs font-semibold shadow-md mx-0.5 transition';
        const activeClass = isActive 
            // 選択されている場合は色を適用
            ? `${area.color} text-white`
            // 選択されていない場合は背景色を暗く
            : `bg-gray-700 hover:bg-gray-600 text-gray-300`;

        return `
            <button data-area="${area.key}" class="${baseClass} ${activeClass}">
                ${area.name}
            </button>
        `;
    }).join('');

    // ... (タブのHTML構造は省略) ...
    areaTabs.innerHTML = `
        <div class="flex w-full max-w-lg mx-auto mb-2">
            ${areaButtonHtml}
        </div>
    `;

    // イベントリスナーをアタッチ
    areaTabs.querySelectorAll('.area-btn').forEach(button => {
        button.onclick = (e) => {
            const newAreaKey = e.currentTarget.dataset.area;
            let newAreas = [...currentFilter.area];
            
            if (newAreaKey === 'ALL') {
                // 'ALL' がクリックされたら、フィルタを ['ALL'] のみにリセット
                newAreas = ['ALL'];
                
            } else {
                // 'ALL' 以外のボタンの処理
                
                // 1. まず 'ALL' を削除 (他の拡張が選択された時点で 'ALL' は無効化される)
                newAreas = newAreas.filter(key => key !== 'ALL');
                
                // 2. 選択状態をトグル
                if (newAreas.includes(newAreaKey)) {
                    // 既に含まれていたら削除 (非選択状態に)
                    newAreas = newAreas.filter(key => key !== newAreaKey);
                } else {
                    // 含まれていなかったら追加 (選択状態に)
                    newAreas.push(newAreaKey);
                }
                
                // 3. 選択が空になったら 'ALL' に戻す
                if (newAreas.length === 0) {
                    newAreas = ['ALL'];
                }
            }
            
            // フィルタを更新
            currentFilter.area = newAreas;
            
            // タブとリストを再レンダリング
            renderAreaTabs(currentFilter.area);
            renderMobList(currentFilter.rank, currentFilter.area);
        }
    });
}
