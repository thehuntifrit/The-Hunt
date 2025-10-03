// ★★★ GAS APIのURLは討伐報告（POST/GET）で使用します ★★★
const GAS_API_URL = 'https://script.google.com/macros/s/AKfycbzD3P1D3J9yo0AOxtCqSX3EQKZnlm4V5qccQ4i47oeU23LaOzJBnRnZVrb1SuiSXhAX-Q/exec';

// DOM要素の取得 (変更なし)
const mobListElement = document.getElementById('mob-list');
const modal = document.getElementById('report-modal');
const closeButton = document.getElementsByClassName('close-button')[0];
const reportForm = document.getElementById('report-form');
const reportTimeInput = document.getElementById('report_time');
const messageElement = document.getElementById('message');
const submitButton = document.getElementById('submit-report-button');

/**
 * ユーティリティ: UTC時間をJSTの文字列に変換
 */
function formatTimeToJST(utcIsoString) {
    if (!utcIsoString) return 'データなし';
    const utcTime = new Date(utcIsoString);
    return utcTime.toLocaleString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Asia/Tokyo'
    });
}

/**
 * ユーティリティ: 現在時刻を <input type="datetime-local"> 形式にフォーマット
 */
function getCurrentDateTimeLocal() {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezonezoneOffset());
    return now.toISOString().slice(0, 16);
}

// モーダル関連関数 (変更なし)
function openReportModal(mob) {
    document.getElementById('modal_mob_display').textContent = mob['モブ名'];
    document.getElementById('modal_area_display').textContent = mob['エリア'];

    document.getElementById('report_mobName').value = mob['モブ名'];
    document.getElementById('report_mobRank').value = mob['ランク'];
    document.getElementById('report_area').value = mob['エリア'];

    reportTimeInput.value = getCurrentDateTimeLocal();
    
    messageElement.classList.add('hidden');
    modal.style.display = 'block';
}

closeButton.onclick = closeReportModal;
window.onclick = function(event) {
    if (event.target == modal) {
        closeReportModal();
    }
}

function closeReportModal() {
    modal.style.display = 'none';
}

/**
 * メイン関数: ローカルのモブデータとGASのPOP予想データを統合し、表示する
 */
async function displayMobList() {
    mobListElement.innerHTML = `<p>モブデータと最新の討伐履歴を読み込み中...</p>`;

    // 1. ローカルのモブ一覧を取得
    const mobList = ALL_MOBS_DATA; 
    let popTimes = {}; // POP予想時間データ

    try {
        // 2. GASからPOP予想時間データを取得
        const response = await fetch(GAS_API_URL);
        const result = await response.json();

        if (result.status === 'success') {
            popTimes = result.popTimes; // 予想時間マップを取得
        } else {
             // 致命的なエラーではないため、エラーメッセージを出しつつ表示を続行
             console.error("GASデータ取得エラー:", result.message);
        }
    } catch (e) {
        console.error("ネットワーク接続エラー:", e);
    }
        
    if (!mobList || mobList.length === 0) {
        mobListElement.innerHTML = `<p>登録されているモンスター情報がありません。</p>`;
        return;
    }

    // モブ一覧と予想時間データを統合してHTMLを生成
    const htmlContent = mobList.map(mob => {
        const mobName = mob['モブ名'];
        const popData = popTimes[mobName];
        
        // POP時間と前回討伐時間の計算と表示
        let lastKillDisplay = '未報告';
        let popTimeDisplay = '情報不足';
        let popTimeClass = 'status-unknown';

        if (popData) {
            lastKillDisplay = formatTimeToJST(popData.lastKillTimeUTC);
            popTimeDisplay = formatTimeToJST(popData.expectedPopTimeUTC);
            
            // 現在時刻と比較してクラスを設定（例: リポップまであと少し、など）
            const expectedTime = new Date(popData.expectedPopTimeUTC);
            const now = new Date();
            
            if (expectedTime < now) {
                popTimeClass = 'status-overdue'; // 予想時間を過ぎている
            } else if ((expectedTime.getTime() - now.getTime()) < (popData.respawnMinutes * 60000) * 0.1) {
                popTimeClass = 'status-near'; // 予想時間の10%前 (間もなく)
            } else {
                popTimeClass = 'status-safe'; // まだ時間がある
            }
        }
        
        return `
            <div class="mob-card">
                <div class="mob-info-group">
                    <div class="mob-rank-badge">${mob['ランク']}</div>
                    <div class="mob-name-and-area">
                        <div class="mob-name">${mob['モブ名']}</div>
                        <div class="mob-area">エリア: ${mob['エリア']}</div>
                    </div>
                </div>
                
                <div class="report-button-wrapper">
                    <button class="report-button" 
                            data-mob='${JSON.stringify(mob)}'>
                        報告
                    </button>
                </div>
                
                <div class="mob-extra-info">
                    <p>
                        <span style="font-weight: bold;">前回討伐 (JST): </span>
                        <span>${lastKillDisplay}</span>
                    </p>
                    <p>
                        <span style="font-weight: bold;">POP予想 (JST): </span>
                        <span class="${popTimeClass}" style="font-weight: bold; color: ${popTimeClass === 'status-overdue' ? 'red' : popTimeClass === 'status-near' ? 'orange' : '#00796b'};">
                           ${popTimeDisplay}
                        </span>
                        <span style="margin-left: 10px; font-size: 0.8em; color: #777;">(POP間隔: ${popData ? popData.respawnMinutes + '分' : '不明'})</span>
                    </p>
                    <p style="margin-top: 5px;">${mob['備考（将来のマップツール用）'] || '（備考情報なし）'}</p>
                </div>
            </div>
        `;
    }).join('');

    mobListElement.innerHTML = htmlContent;

    // ボタンにイベントリスナーを追加 (変更なし)
    document.querySelectorAll('.report-button').forEach(button => {
        button.addEventListener('click', () => {
            const mob = JSON.parse(button.getAttribute('data-mob'));
            openReportModal(mob);
        });
    });
}

// フォーム送信時の処理 (doPost) - 成功時にリストを再読み込みする処理を追加
reportForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // ... 中略（フォームデータの取得とペイロード作成は変更なし） ...
    // GASへのPOST処理
    try {
        // ... 中略 ...
        
        if (result.status === 'success') {
            messageElement.textContent = result.message;
            messageElement.className = 'success';
            reportForm.reset(); 
            // ★報告成功後、リストを再読み込みして最新の予想時間を表示
            displayMobList(); 
            setTimeout(closeReportModal, 1500); 
        } else {
            messageElement.textContent = result.message;
            messageElement.className = 'error';
        }
        
    } catch (error) {
        messageElement.textContent = '通信エラーが発生しました。';
        messageElement.className = 'error';
    } finally {
        // ... 後略 ...
    }
});


// ページロード時にデータ表示を開始
displayMobList();
