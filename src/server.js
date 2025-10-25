// server.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getFirestore, collection, onSnapshot, addDoc, doc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signInAnonymously } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-functions.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-analytics.js";

import { getState, setFilter, setOpenMobCardNo, FILTER_TO_DATA_RANK_MAP } from "./dataManager.js"; 
import { closeReportModal } from "./modal.js";
import { displayStatus } from "./uiRender.js";

const CRUSH_STATUS_UPDATER_URL = "https://asia-northeast1-the-hunt-ifrit.cloudfunctions.net/crushStatusUpdater"; 

// 初期化と設定
const FIREBASE_CONFIG = {
    apiKey: "AIzaSyBikwjGsjL_PVFhx3Vj-OeJCocKA_hQOgU",
    authDomain: "the-hunt-ifrit.firebaseapp.com",
    projectId: "the-hunt-ifrit",
    storageBucket: "the-hunt-ifrit.firebasestorage.app",
    messagingSenderId: "285578581189",
    appId: "1:285578581189:web:4d9826ee3f988a7519ccac"
};

const app = initializeApp(FIREBASE_CONFIG);
const db = getFirestore(app);
const auth = getAuth(app);
const functionsInstance = getFunctions(app, "asia-northeast1");
const analytics = getAnalytics(app);

const functions = functionsInstance;
const callUpdateCrushStatus = httpsCallable(functions, 'crushStatusUpdater');
const callRevertStatus = httpsCallable(functions, 'revertStatus');
const callGetServerTime = httpsCallable(functions, 'getServerTime');

// 認証
async function initializeAuth() {
    return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            unsubscribe(); 

            if (user) {
                resolve(user.uid);
            } else {
                signInAnonymously(auth)
                    .then((credential) => {
                        resolve(credential.user.uid);
                    })
                    .catch((error) => {
                        console.error("匿名認証に失敗しました:", error);
                        resolve(null); 
                    });
            }
        });
    });
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("UID:", user.uid);
  } else {
    console.log("まだ認証されていません");
  }
});

// サーバーUTC取得
async function getServerTimeUTC() {
    const getServerTime = httpsCallable(functionsInstance, "getServerTime");
    const response = await getServerTime();
    
    if (response.data && typeof response.data.serverTimeMs === 'number') {
        return new Date(response.data.serverTimeMs);
    } else {
        console.error("サーバー時刻取得エラー: serverTimeMs が不正です。", response.data);
        return new Date(); 
    }
}

// データ購読
function subscribeMobStatusDocs(onUpdate) {
    const docIds = ["s_latest", "a_latest", "f_latest"];
    const mobStatusDataMap = {};
    const unsubs = docIds.map(id =>
        onSnapshot(doc(db, "mob_status", id), snap => {
            const data = snap.data();
            if (data) mobStatusDataMap[id] = data;
            onUpdate(mobStatusDataMap);
        })
    );
    return () => unsubs.forEach(u => u());
}

function subscribeMobLocations(onUpdate) {
    const unsub = onSnapshot(collection(db, "mob_locations"), snapshot => {
        const map = {};
        snapshot.forEach(docSnap => {
            const mobNo = parseInt(docSnap.id, 10);
            const data = docSnap.data();
            map[mobNo] = { points: data.points || {} };
        });
        onUpdate(map);
    });
    return unsub;
}

// 討伐報告
const submitReport = async (mobNo, timeISO, memo) => {
    const state = getState();
    const userId = state.userId;
    const mobs = state.mobs;

    if (!userId) {
        displayStatus("認証が完了していません。ページをリロードしてください。", "error");
        return;
    }

    const mob = mobs.find(m => m.No === mobNo);
    if (!mob) {
        displayStatus("モブデータが見つかりません。", "error");
        return;
    }

    const killTimeDate = await getServerTimeUTC();

    const modalStatusEl = document.querySelector("#modal-status");
    if (modalStatusEl) {
        modalStatusEl.textContent = "送信中...";
    }
    displayStatus(`${mob.Name} 討伐時間報告中...`);

    try {
        await addDoc(collection(db, "reports"), {
            mob_id: mobNo.toString(),
            kill_time: killTimeDate,
            reporter_uid: userId,
            memo: memo,
            repop_seconds: mob.REPOP_s
        });

        closeReportModal();
        displayStatus("報告が完了しました。データ反映を待っています。", "success");
    } catch (error) {
        console.error("レポート送信エラー:", error);
        if (modalStatusEl) {
            modalStatusEl.textContent = "送信エラー: " + (error.message || "通信失敗");
        }
        displayStatus(`LKT報告エラー: ${error.message || "通信失敗"}`, "error");
    }
};

// 湧き潰し報告 (toggleCrushStatus)
const toggleCrushStatus = async (mobNo, locationId, isCurrentlyCulled) => {
    const state = getState();
    const userId = state.userId;
    const mobs = state.mobs;

    if (!userId) {
        displayStatus("認証が完了していません。", "error");
        return;
    }

    const action = isCurrentlyCulled ? "uncrush" : "crush";
    const type = action === "crush" ? "add" : "remove";
    const mob = mobs.find(m => m.No === mobNo);
    if (!mob) return;

    displayStatus(
        `${mob.Name} (${locationId}) ${action === "crush" ? "湧き潰し" : "解除"}報告中...`
    );

    try {
        const payload = {
            mob_id: mobNo.toString(),
            point_id: locationId,
            type: type,
            userId: userId
        };

        let result;
        
        if (mob.Rank === 'S') {
            const response = await fetchSecureData(CRUSH_STATUS_UPDATER_URL, {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            result = { data: data }; // 応答形式をFunctionsに合わせる
            
            if (data.success === false) {
                throw new Error(data.message || "内部処理エラー");
            }

        } else {
            result = await callUpdateCrushStatus(payload);
        }

        if (result.data?.success) {
            displayStatus(`${mob.Name} の状態を更新しました。`, "success");
        } else {
            displayStatus(
                `更新失敗: ${result.data?.message || "不明なエラー"}`,
                "error"
            );
        }
    } catch (error) {
        displayStatus(`湧き潰し報告エラー: ${error.message}`, "error");
    }
};

// 巻き戻し (revertMobStatus)
const revertMobStatus = async (mobNo) => {
    const state = getState();
    const userId = state.userId;
    const mobs = state.mobs;

    if (!userId) {
        displayStatus("認証が完了していません。ページをリロードしてください。", "error");
        return;
    }

    const mob = mobs.find(m => m.No === mobNo);
    if (!mob) return;

    displayStatus(`${mob.Name} の状態を巻き戻し中...`, "warning");

    try {
        const result = await callRevertStatus({
            mob_id: mobNo.toString(),
        });

        if (result.data?.success) {
            displayStatus(`${mob.Name} の状態を直前のログへ巻き戻しました。`, "success");
        } else {
            displayStatus(
                `巻き戻し失敗: ${result.data?.message || "ログデータが見つからないか、巻き戻しに失敗しました。"}`,
                "error"
            );
        }
    } catch (error) {
        console.error("巻き戻しエラー:", error);
        displayStatus(`巻き戻しエラー: ${error.message}`, "error");
    }
};

async function fetchSecureData(serviceUrl, options = {}) {
    const user = auth.currentUser;

    if (!user) {
        displayStatus("認証ユーザーがいません。", "error");
        throw new Error("User not authenticated.");
    }

    displayStatus(`外部サービス (${serviceUrl}) への認証リクエストを準備中...`);
    
    try {
        const idToken = await user.getIdToken();
        const headers = {
            ...options.headers,
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json'
        };

        const response = await fetch(serviceUrl, {
            ...options,
            headers: headers,
        });

        if (!response.ok) {
            const errorBody = await response.text();
            displayStatus(`外部サービスリクエスト失敗: ${response.status} ${response.statusText}. 詳細: ${errorBody.substring(0, 100)}`, "error");
            throw new Error(`External service request failed with status ${response.status}`);
        }

        displayStatus("外部サービスからの応答を受け取りました。", "success");
        return response;

    } catch (error) {
        console.error("外部サービス認証リクエストエラー:", error);
        displayStatus(`リクエストエラー: ${error.message}`, "error");
        throw error;
    }
}

export { initializeAuth, subscribeMobStatusDocs, subscribeMobLocations, submitReport, toggleCrushStatus, revertMobStatus, getServerTimeUTC, fetchSecureData };
