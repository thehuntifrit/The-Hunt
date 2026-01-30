// modal.js

import { DOM as UiDOM } from "./uiRender.js";
import { getState, setLodestoneId, setVerified } from "./dataManager.js";
import { verifyLodestoneCharacter, registerUserToFirestore } from "./server.js";

export async function openReportModal(mobNo) {
    const mob = getState().mobs.find(m => m.No === mobNo);
    if (!mob) return;

    const now = new Date();
    const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);

    UiDOM.reportForm.dataset.mobNo = String(mobNo);
    UiDOM.modalMobName.textContent = `${mob.Name}`;
    UiDOM.modalTimeInput.value = localIso;

    UiDOM.reportModal.classList.remove("hidden");
    UiDOM.reportModal.classList.add("flex");
}

export function closeReportModal() {
    UiDOM.reportModal.classList.add("hidden");
    UiDOM.reportModal.classList.remove("flex");
    UiDOM.modalTimeInput.value = "";
    UiDOM.modalStatus.textContent = "";
    UiDOM.modalForceSubmit.checked = false;
}

let currentVerificationCode = "";

export function openAuthModal() {
    currentVerificationCode = "HUNT-" + Math.random().toString(36).substring(2, 10).toUpperCase();
    UiDOM.authVCode.textContent = currentVerificationCode;
    UiDOM.authStatus.textContent = "";
    UiDOM.authStatus.style.color = "";
    UiDOM.authModal.classList.remove("hidden");
    UiDOM.authModal.classList.add("flex");
}

export function closeAuthModal() {
    UiDOM.authModal.classList.add("hidden");
    UiDOM.authModal.classList.remove("flex");
    UiDOM.authLodestoneId.value = "";
}

export function initModal() {
    const cancelReportBtn = document.getElementById("cancel-report");
    if (cancelReportBtn) {
        cancelReportBtn.addEventListener("click", closeReportModal);
    }
    UiDOM.reportModal.addEventListener("click", (e) => {
        if (e.target === UiDOM.reportModal) {
            closeReportModal();
        }
    });

    const cancelAuthBtn = document.getElementById("auth-cancel");
    if (cancelAuthBtn) {
        cancelAuthBtn.addEventListener("click", closeAuthModal);
    }

    const copyCodeBtn = document.getElementById("auth-copy-code");
    if (copyCodeBtn) {
        copyCodeBtn.addEventListener("click", () => {
            navigator.clipboard.writeText(currentVerificationCode);
            const originalText = copyCodeBtn.textContent;
            copyCodeBtn.textContent = "Done!";
            setTimeout(() => copyCodeBtn.textContent = originalText, 2000);
        });
    }

    const verifyBtn = document.getElementById("auth-verify");
    if (verifyBtn) {
        verifyBtn.addEventListener("click", async () => {
            const rawInput = UiDOM.authLodestoneId.value.trim();
            if (!rawInput) {
                UiDOM.authStatus.textContent = "IDまたはURLを入力してください。";
                UiDOM.authStatus.style.color = "#ef4444";
                return;
            }

            const idMatch = rawInput.match(/character\/(\d+)/);
            const lodestoneId = idMatch ? idMatch[1] : rawInput.match(/^\d+$/) ? rawInput : null;

            if (!lodestoneId) {
                UiDOM.authStatus.textContent = "正しいロードストーンのIDまたはURLを入力してください。";
                UiDOM.authStatus.style.color = "#ef4444";
                return;
            }

            UiDOM.authStatus.textContent = "検証中...";
            UiDOM.authStatus.style.color = "#34d399";
            verifyBtn.disabled = true;

            const result = await verifyLodestoneCharacter(lodestoneId, currentVerificationCode);

            if (result.success) {
                UiDOM.authStatus.textContent = `検証成功！ようこそ、${result.characterName}さん。`;
                UiDOM.authStatus.style.color = "#34d399";

                await registerUserToFirestore(lodestoneId, result.characterName);
                setLodestoneId(lodestoneId);
                setVerified(true);

                setTimeout(() => {
                    closeAuthModal();
                    verifyBtn.disabled = false;
                }, 1500);
            } else {
                UiDOM.authStatus.textContent = result.error;
                UiDOM.authStatus.style.color = "#ef4444";
                verifyBtn.disabled = false;
            }
        });
    }

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            if (!UiDOM.reportModal.classList.contains("hidden")) closeReportModal();
        }
    });
}
