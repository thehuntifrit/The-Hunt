// server.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getFirestore, collection, onSnapshot, doc, updateDoc, setDoc, getDoc, Timestamp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signInAnonymously } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

import { getState } from "./dataManager.js";
import { closeReportModal } from "./modal.js";
import { updateCrushUI } from "./location.js";

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

export async function initializeAuth() {
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

export async function getUserData(uid) {
    try {
        const userDocRef = doc(db, "users", uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
            return userSnap.data();
        }
    } catch (error) {
        console.error("ユーザー情報の取得に失敗しました:", error);
    }
    return null;
}

export function subscribeMobStatusDocs(onUpdate) {
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

export function subscribeMobMemos(onUpdate) {
    const memoDocRef = doc(db, "shared_data", "memo");
    const unsub = onSnapshot(memoDocRef, snap => {
        const data = snap.data() || {};
        onUpdate(data);
    });
    return unsub;
}

export function subscribeMaintenance(onUpdate) {
    const maintenanceDocRef = doc(db, "shared_data", "maintenance");
    const unsub = onSnapshot(maintenanceDocRef, snap => {
        const data = snap.data() || null;
        console.log("[Firestore] Maintenance data updated:", data);
        onUpdate(data);
    }, err => {
        console.error("[Firestore] Maintenance subscribe error:", err);
        onUpdate(null);
    });
    return unsub;
}

function normalizePoints(data) {
    const result = {};
    for (const [key, value] of Object.entries(data)) {
        if (key.startsWith("points.")) {
            const [, locId, field] = key.split(".");
            if (!result[locId]) result[locId] = {};
            result[locId][field] = value;
        }
        else if (key === "points" && typeof value === "object" && value !== null) {
            for (const [locId, locData] of Object.entries(value)) {
                if (!result[locId]) result[locId] = {};
                Object.assign(result[locId], locData);
            }
        }
    }
    return result;
}

export function subscribeMobLocations(onUpdate) {
    const unsub = onSnapshot(collection(db, "mob_locations"), snapshot => {
        const map = {};
        snapshot.forEach(docSnap => {
            const mobNo = parseInt(docSnap.id, 10);
            const data = docSnap.data();
            const normalized = normalizePoints(data);
            map[mobNo] = normalized;
        });
        onUpdate(map);
    });
    return unsub;
}

export const submitReport = async (mobNo, timeISO) => {
    const state = getState();
    const userId = state.userId;
    const lodestoneId = state.lodestoneId;
    const mobs = state.mobs;

    // if (!state.isVerified) {
    //     console.error("認証が完了していません。");
    //     return;
    // }

    if (!userId) {
        console.error("認証が完了していません。ページをリロードしてください。");
        return;
    }

    const mob = mobs.find(m => m.No === mobNo);
    if (!mob) {
        console.error("モブデータが見つかりません。");
        return;
    }

    let killTimeDate;
    if (timeISO && typeof timeISO === "string") {
        const m = timeISO.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/);
        if (m) {
            const [, y, mo, d, h, mi, s] = m;
            killTimeDate = new Date(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi), s ? Number(s) : 0, 0);
        } else {
            const modalDate = new Date(timeISO);
            if (!isNaN(modalDate.getTime())) {
                killTimeDate = modalDate;
            }
        }
    }

    if (!killTimeDate) {
        killTimeDate = new Date();
    }

    const modalStatusEl = document.querySelector("#modal-status");
    const forceSubmitEl = document.querySelector("#report-force-submit");
    const isForceSubmit = forceSubmitEl ? forceSubmitEl.checked : false;
    const nowMs = Date.now();
    if (killTimeDate.getTime() > nowMs + 600000) {
        const msg = "現在時刻より10分以上未来の時刻は報告できません。";
        console.warn(msg);
        if (modalStatusEl) {
            modalStatusEl.textContent = msg;
            modalStatusEl.style.color = "#ef4444";
        }
        return;
    }

    if (!isForceSubmit && mob.last_kill_time) {
        let maintenance = state.maintenance;
        if (maintenance && maintenance.maintenance) {
            maintenance = maintenance.maintenance;
        }

        let repopSeconds = mob.REPOP_s;
        let baseTimeMs = mob.last_kill_time * 1000;

        if (maintenance && maintenance.serverUp) {
            const serverUpMs = new Date(maintenance.serverUp).getTime();
            const serverUpSec = serverUpMs / 1000;

            if (mob.last_kill_time <= serverUpSec) {
                repopSeconds = repopSeconds * 0.6;
                baseTimeMs = serverUpMs;
            }
        }

        const minRepopTimeMs = baseTimeMs + (repopSeconds * 1000);
        const allowedTimeMs = minRepopTimeMs - (300 * 1000);

        if (killTimeDate.getTime() < allowedTimeMs) {
            const allowedDate = new Date(allowedTimeMs);
            const timeStr = allowedDate.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });

            const msg = `まだ湧き時間になっていません。\n最短でも ${timeStr} 以降である必要があります。\n(強制送信する場合はチェックを入れてください)`;
            console.warn(msg);
            if (modalStatusEl) {
                modalStatusEl.textContent = msg;
                modalStatusEl.style.color = "#ef4444";
                modalStatusEl.style.whiteSpace = "pre-wrap";
            }
            return;
        }
    }

    closeReportModal();

    try {
        let collectionSuffix = "s_latest";
        if (mob.Rank === "A") collectionSuffix = "a_latest";
        else if (mob.Rank === "F") collectionSuffix = "f_latest";

        const docRef = doc(db, "mob_status", collectionSuffix);

        const prevTimeSeconds = mob.last_kill_time || 0;
        const prevTimestamp = prevTimeSeconds > 0
            ? Timestamp.fromMillis(prevTimeSeconds * 1000)
            : null;

        const newData = {
            [mobNo]: {
                last_kill_time: Timestamp.fromDate(killTimeDate),
                prev_kill_time: prevTimestamp,
                reporter_id: lodestoneId
            }
        };

        await updateDoc(docRef, newData);

        console.log(`[Report] Success: Mob ${mobNo}`);

    } catch (error) {
        console.error("レポート送信エラー:", error);
        alert("レポート送信エラー: " + (error.message || "通信失敗"));
    }
};

export const submitMemo = async (mobNo, memoText) => {
    const state = getState();
    const userId = state.userId;
    const lodestoneId = state.lodestoneId;
    const mobs = state.mobs;

    if (!state.isVerified) {
        console.error("認証が完了していません。");
        return { success: false, error: "認証エラー" };
    }

    if (!userId) {
        console.error("認証が完了していません。");
        return { success: false, error: "認証エラー" };
    }

    const mob = mobs.find(m => m.No === mobNo);
    if (!mob) {
        console.error("モブデータが見つかりません。");
        return { success: false, error: "Mobデータエラー" };
    }

    try {
        const docRef = doc(db, "shared_data", "memo");

        if (!memoText || memoText.trim() === "") {
            await setDoc(docRef, {
                [mobNo]: []
            }, { merge: true });
            return { success: true };
        }

        const memoData = {
            memo_text: memoText,
            created_at: Timestamp.now(),
            reporter_id: lodestoneId
        };

        await setDoc(docRef, {
            [mobNo]: [memoData]
        }, { merge: true });

        return { success: true };

    } catch (error) {
        console.error("メモ投稿エラー:", error);
        const userFriendlyError = error.message || "通信または認証に失敗しました。";
        return { success: false, error: userFriendlyError };
    }
};

export const toggleCrushStatus = async (mobNo, locationId, nextCulled) => {
    const state = getState();
    const userId = state.userId;
    const lodestoneId = state.lodestoneId;
    const mobs = state.mobs;

    // if (!state.isVerified) {
    //     console.error("認証が完了していません。");
    //     return;
    // }

    if (!userId) {
        console.error("認証が完了していません。");
        return;
    }

    const mob = mobs.find(m => m.No === mobNo);
    if (!mob) return;

    try {
        const docRef = doc(db, "mob_locations", mobNo.toString());

        const action = nextCulled ? "CULL" : "UNCULL";
        const fieldName = action === "CULL" ? "culled_at" : "uncull_at";

        const updateKey = `points.${locationId}.${fieldName}`;

        const updatePayload = {
            [updateKey]: Timestamp.now(),
            [`points.${locationId}.reporter_id`]: lodestoneId
        };

        await setDoc(docRef, updatePayload, { merge: true });

        updateCrushUI(mobNo, locationId, nextCulled);

    } catch (error) {
        console.error("湧き潰し報告エラー:", error);
    }
};

export async function registerUserToFirestore(lodestoneId, characterName) {
    try {
        const user = auth.currentUser;
        if (!user) return;

        const userDocRef = doc(db, "users", user.uid);
        await setDoc(userDocRef, {
            lodestone_id: lodestoneId,
            character_name: characterName,
            updated_at: Timestamp.now()
        }, { merge: true });
    } catch (error) {
        console.error("ユーザー登録エラー:", error);
    }
}

const VERIFICATION_PROXY_URL = "https://icy-resonance-2526.the-hunt-ifrit.workers.dev/";

export async function verifyLodestoneCharacter(lodestoneId, verificationCode) {
    if (!VERIFICATION_PROXY_URL) {
        return {
            success: false,
            error: "認証プロキシのURLが設定されていません。管理者に連絡してください。"
        };
    }

    try {
        const lodestoneUrl = `https://jp.finalfantasyxiv.com/lodestone/character/${lodestoneId}/`;
        const fetchUrl = `${VERIFICATION_PROXY_URL}?url=${encodeURIComponent(lodestoneUrl)}`;

        const response = await fetch(fetchUrl);
        if (!response.ok) {
            if (response.status === 404) {
                return { success: false, error: "キャラクターが見つかりませんでした。" };
            }
            throw new Error(`Proxy error: ${response.status}`);
        }

        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        const bioEl = doc.querySelector(".character__selfintroduction");
        const nameEl = doc.querySelector(".frame__chara__box .frame__chara__name");

        const bio = bioEl?.textContent?.trim() || "";
        const name = nameEl?.textContent?.trim() || "Unknown";

        if (bio.includes(verificationCode)) {
            return { success: true, characterName: name };
        } else {
            return { success: false, error: "検証コードが自己紹介文に見つかりませんでした。保存されているか確認してください。" };
        }
    } catch (error) {
        console.error("Verification error:", error);
        return {
            success: false,
            error: `認証に失敗しました。時間をおいて再試行してください。(Error: ${error.message})`
        };
    }
}
