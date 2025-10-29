// server.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getFirestore, collection, onSnapshot, addDoc, doc, setDoc, updateDoc, increment, FieldValue } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signInAnonymously } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-functions.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-analytics.js";

import { getState } from "./dataManager.js";
import { closeReportModal } from "./modal.js";
import { displayStatus } from "./uiRender.js";
import { isCulled, updateCrushUI } from "./location.js";

const FIREBASE_CONFIG = {
    apiKey: "AIzaSyBikwjGsjL_PVFhx3Vj-OeJCocKA_hQOgU",
    authDomain: "the-hunt-ifrit.firebaseapp.com",
    projectId: "the-hunt-ifrit",
    storageBucket: "the-hunt-ifrit.firebasestorage.app",
    messagingSenderId: "285578581189",
    appId: "1:285578581189:web:4d9826ee3f988a7519ccac"
};
import { serverTimestamp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const app = initializeApp(FIREBASE_CONFIG);
const db = getFirestore(app);
const auth = getAuth(app);
const functionsInstance = getFunctions(app, "asia-northeast1");
const analytics = getAnalytics(app);

const functions = functionsInstance;

const callGetServerTime = httpsCallable(functions, 'getServerTime');
const callRevertStatus = httpsCallable(functions, 'revertStatus'); // 巻き戻し機能用

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
    try {
        const response = await getServerTime();

        if (response.data && typeof response.data.serverTimeMs === 'number') {
            return new Date(response.data.serverTimeMs);
        } else {
            console.error("サーバー時刻取得エラー: serverTimeMs が不正です。", response.data);
            return new Date();
        }
    } catch (error) {
        console.error("サーバー時刻取得のためのFunctions呼び出しに失敗しました:", error);
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
            // 各地点の UI 更新
            Object.entries(data.points || {}).forEach(([locationId, status]) => {
                const isCulledFlag = isCulled(status);
                updateCrushUI(mobNo, locationId, isCulledFlag);
            });
        });
        onUpdate(map);
    });
    return unsub;
}

// 討伐報告 (reportsコレクションへの直接書き込み)
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
    // モーダル入力を優先、未入力や不正ならサーバー時刻を fallback
    let killTimeDate;
    if (timeISO) {
        const modalDate = new Date(timeISO);
        // Dateオブジェクトとして有効な場合にのみ採用
        if (!isNaN(modalDate.getTime())) { 
            killTimeDate = modalDate; 
        }
    }
        // 💡 サーバー時刻をフォールバックとして取得・設定
    if (!killTimeDate) {
        // timeISOが無効または空の場合、サーバー時刻を取得
        const serverTimeUTC = await getServerTimeUTC(); 
        killTimeDate = serverTimeUTC;
    }

    const modalStatusEl = document.querySelector("#modal-status");
    if (modalStatusEl) modalStatusEl.textContent = "送信中...";
    displayStatus(`${mob.Name} 討伐時間報告中...`);

    try {
        await addDoc(collection(db, "reports"), {
            mob_id: mobNo.toString(),
            kill_time: killTimeDate, // Dateオブジェクトを直接Firestoreに保存 (UTC)
            reporter_uid: userId,
            memo: memo,
            repop_seconds: mob.REPOP_s
        });

        closeReportModal();
        displayStatus("報告が完了しました。データ反映を待っています。", "success");
    } catch (error) {
        console.error("レポート送信エラー:", error);
        if (modalStatusEl) modalStatusEl.textContent = "送信エラー: " + (error.message || "通信失敗");
        displayStatus(`討伐報告エラー: ${error.message || "通信失敗"}`, "error");
    }
};

// 湧き潰し報告
const toggleCrushStatus = async (mobNo, locationId, isCurrentlyCulled) => {
    const state = getState();
    const userId = state.userId;
    const mobs = state.mobs;

    if (!userId) {
        displayStatus("認証が完了していません。", "error");
        return;
    }

    const action = isCurrentlyCulled ? "uncrush" : "crush";
    const mob = mobs.find(m => m.No === mobNo);
    if (!mob) return;

    displayStatus(
        `${mob.Name} (${locationId}) ${action === "crush" ? "湧き潰し" : "解除"}報告中...`
    );

    const mobLocationsRef = doc(db, "mob_locations", mobNo.toString());

    const updateData = {};
    const pointPath = `points.${locationId.toString()}`;
    // 💡 湧き潰し報告の時刻もサーバー時刻に依存するため、getServerTimeUTC()で取得
    const serverTimeUTC = await getServerTimeUTC();
    const serverTimestampValue = serverTimeUTC; 

    if (action === "crush") {
        // serverTimestamp() はクライアント側で時刻決定権がないため、サーバー関数またはDateオブジェクトを使用
        updateData[`${pointPath}.culled_at`] = serverTimestampValue; 
    } else {
        updateData[`${pointPath}.uncull_at`] = serverTimestampValue; 
    }

    try {
        await updateDoc(mobLocationsRef, updateData);

        displayStatus(`${mob.Name} の状態を更新しました。`, "success");
    } catch (error) {
        console.error("湧き潰し報告エラー:", error);
        displayStatus(`湧き潰し報告エラー: ${error.message}`, "error");
    }
};

// 巻き戻し (revertMobStatus) - httpsCallable方式へ修正
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

    const data = {
        mob_id: mobNo.toString(),
    };

    try {
        const response = await callRevertStatus(data);
        const result = response.data;

        if (result?.success) {
            displayStatus(`${mob.Name} の状態を直前のログへ巻き戻しました。`, "success");
        } else {
            displayStatus(
                `巻き戻し失敗: ${result?.message || "ログデータが見つからないか、巻き戻しに失敗しました。"}`,
                "error"
            );
        }
    } catch (error) {
        console.error("巻き戻しエラー:", error);
        displayStatus(`巻き戻しエラー: ${error.message}`, "error");
    }
};

export { initializeAuth, subscribeMobStatusDocs, subscribeMobLocations, submitReport, toggleCrushStatus, revertMobStatus, getServerTimeUTC };
