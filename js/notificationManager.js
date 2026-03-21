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
        updateVolumeSliderBackground(volumeSlider);
        
        volumeSlider.addEventListener('input', (e) => {
            const vol = parseFloat(e.target.value);
            import("./dataManager.js").then(m => m.setNotificationVolume(vol));
            updateVolumeSliderBackground(e.target);
        });
    }
}

function updateVolumeSliderBackground(slider) {
    const val = (slider.value - slider.min) / (slider.max - slider.min) * 100;
    slider.style.setProperty('--volume-percent', val + '%');
}

async function requestNotificationPermission() {
    if ("Notification" in window) {
        if (Notification.permission !== "granted" && Notification.permission !== "denied") {
            await Notification.requestPermission();
        }
    }
}

export function playNotificationSound(isSilent = false) {
    return;
}

export async function sendBrowserNotification(title, body) {
    if (!getState().notificationEnabled) return;
    if (!("Notification" in window) || Notification.permission !== "granted") return;

    const options = { body, icon: "./icon/The_Hunt.png" };

    try {
        if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
            const reg = await navigator.serviceWorker.ready;
            await reg.showNotification(title, options);
        } else {
            new Notification(title, options);
        }
    } catch {
        // silently ignore
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

    const shouldNotify = (now >= oneMinBefore && now <= endTime);

    if (shouldNotify && !notifiedCycles.has(cycleKey)) {
        const title = `【POP info】 ${mob.Name}`;
        const body = (now < spawnTime)
            ? `まもなく（2分前）`
            : `時間なう！`;

        sendBrowserNotification(title, body);
        playNotificationSound();
        notifiedCycles.add(cycleKey);
    }

    if (now > endTime && notifiedCycles.has(cycleKey)) {
        notifiedCycles.delete(cycleKey);
    }
}
