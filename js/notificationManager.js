// notificationManager.js

import { getState } from "./dataManager.js";

const SOUND_FILE = "./sound/01 FFXIV_Linkshell_Transmission.mp3";
let audio = null;
const notifiedCycles = new Set();

export function initNotification() {
    audio = new Audio(SOUND_FILE);
    audio.load();

    const toggle = document.getElementById('notification-toggle');
    const volumeSlider = document.getElementById('notification-volume');
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

    if (volumeSlider) {
        const state = getState();
        volumeSlider.value = state.notificationVolume;
        volumeSlider.addEventListener('input', (e) => {
            const vol = parseFloat(e.target.value);
            import("./dataManager.js").then(m => m.setNotificationVolume(vol));
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
    const currentVolume = getState().notificationVolume;

    if (isSilent) {
        audio.volume = 0;
        audio.play().then(() => {
            audio.pause();
            audio.volume = currentVolume;
        }).catch(err => console.warn("Audio unlock failed:", err));
    } else {
        audio.volume = currentVolume;
        audio.play().catch(err => {
            if (err.name !== 'NotAllowedError') {
                console.warn("Audio play failed:", err);
            }
        });
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


export function checkAndNotify(mob) {
    const state = getState();
    if (!state.notificationEnabled) return;

    const info = mob.repopInfo;
    if (!info || !info.nextConditionSpawnDate || !info.conditionWindowEnd) return;

    const now = Date.now();
    const spawnTime = info.nextConditionSpawnDate.getTime();
    const endTime = info.conditionWindowEnd.getTime();
    const oneMinBefore = spawnTime - 120000;

    const cycleKey = `${mob.No}-${spawnTime}`;

    const isConditionMet = (info.status === "ConditionActive" && info.isInConditionWindow);

    const shouldNotify = (now >= oneMinBefore && now <= endTime) && (isConditionMet || now >= oneMinBefore);

    if (shouldNotify && !notifiedCycles.has(cycleKey)) {
        const title = `【POP info】 ${mob.Name}`;
        const body = (now < spawnTime)
            ? `まもなく時間（2分前）`
            : `時間INなう！`;

        sendBrowserNotification(title, body);
        playNotificationSound();
        notifiedCycles.add(cycleKey);
    }

    if (now > endTime && notifiedCycles.has(cycleKey)) {
        notifiedCycles.delete(cycleKey);
    }
}
