// notificationManager.js

import { getState } from "./dataManager.js";

const SOUND_FILE = "./sound/01 FFXIV_Linkshell_Transmission.mp3";
let audio = null;

export function initNotification() {
    audio = new Audio(SOUND_FILE);
    audio.load();

    const toggle = document.getElementById('notification-toggle');
    const testBtn = document.getElementById('test-sound-btn');

    if (toggle) {
        toggle.checked = getState().notificationEnabled;
        toggle.addEventListener('change', (e) => {
            const enabled = e.target.checked;
            import("./dataManager.js").then(m => m.setNotificationEnabled(enabled));

            if (enabled) {
                requestNotificationPermission();
                playNotificationSound(true);
            }
        });
    }

    if (testBtn) {
        testBtn.addEventListener('click', () => {
            playNotificationSound();
        });
    }
}

async function requestNotificationPermission() {
    if ("Notification" in window) {
        if (Notification.permission !== "granted" && Notification.permission !== "denied") {
            await Notification.requestPermission();
        }
    }
}

export function playNotificationSound(isSilent = false) {
    if (!audio) return;

    audio.currentTime = 0;
    if (isSilent) {
        const originalVolume = audio.volume;
        audio.volume = 0;
        audio.play().then(() => {
            audio.pause();
            audio.volume = originalVolume;
        }).catch(err => console.warn("Audio unlock failed:", err));
    } else {
        audio.play().catch(err => console.warn("Audio play failed:", err));
    }
}

export function sendBrowserNotification(title, body) {
    if (!getState().notificationEnabled) return;

    if ("Notification" in window && Notification.permission === "granted") {
        new Notification(title, {
            body: body,
            icon: "./icon/The_Hunt.png"
        });
    }
}

const lastNotifiedMap = new Map();

export function checkAndNotify(mob) {
    const state = getState();
    if (!state.notificationEnabled) return;

    const info = mob.repopInfo;
    if (!info) return;

    if (info.status === "ConditionActive" && info.isInConditionWindow) {
        const now = Date.now();
        const lastTime = lastNotifiedMap.get(mob.No) || 0;
        if (now - lastTime > 3600000) {
            const title = `【出現確定】${mob.Name}`;
            const body = `${mob.Area} (${mob.Rank})：特殊条件が満たされました！`;

            sendBrowserNotification(title, body);
            playNotificationSound();
            lastNotifiedMap.set(mob.No, now);
        }
    }
}
