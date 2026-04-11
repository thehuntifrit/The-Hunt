import { DOM as UiDOM } from "./app.js";
import { getState, setLodestoneId, setCharacterName, setVerified } from "./dataManager.js";
import { verifyLodestoneCharacter, registerUserToFirestore } from "./server.js";

export async function openReportModal(mobNo) {
    const mob = getState().mobs.find(m => m.No === mobNo);
    if (!mob) return;

    const now = new Date();
    const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);

    UiDOM.reportForm.dataset.mobNo = String(mobNo);
    UiDOM.modalMobName.textContent = `${mob.name}`;
    UiDOM.modalTimeInput.value = localIso;

    UiDOM.reportModal.classList.remove("hidden");
}

export function closeReportModal() {
    UiDOM.reportModal.classList.add("hidden");
    UiDOM.modalTimeInput.value = "";
    UiDOM.modalStatus.textContent = "";
    UiDOM.modalForceSubmit.checked = false;
}

let currentVerificationCode = "";

export function openAuthModal() {
    const arr = new Uint8Array(6);
    crypto.getRandomValues(arr);
    const code = Array.from(arr).map(b => b.toString(36).toUpperCase()).join('').substring(0, 8);
    currentVerificationCode = "HUNT-" + code;
    UiDOM.authVCode.textContent = currentVerificationCode;
    UiDOM.authStatus.textContent = "";
    UiDOM.authStatus.classList.remove('text-error', 'text-success');
    UiDOM.authModal.classList.remove("hidden");
}

export function closeAuthModal() {
    UiDOM.authModal.classList.add("hidden");
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
                UiDOM.authStatus.classList.add('text-error');
                return;
            }

            const idMatch = rawInput.match(/character\/(\d+)/);
            const lodestoneId = idMatch ? idMatch[1] : rawInput.match(/^\d+$/) ? rawInput : null;

            if (!lodestoneId || lodestoneId.length > 20) {
                UiDOM.authStatus.textContent = "正しいロードストーンのIDまたはURLを入力してください。";
                UiDOM.authStatus.classList.add('text-error');
                return;
            }

            UiDOM.authStatus.textContent = "検証中...";
            UiDOM.authStatus.classList.add('text-success');
            verifyBtn.disabled = true;

            try {
                const result = await verifyLodestoneCharacter(lodestoneId, currentVerificationCode);

                if (result.success) {
                    UiDOM.authStatus.textContent = `検証成功！ようこそ、${result.characterName}さん。`;
                    UiDOM.authStatus.classList.add('text-success');

                    await registerUserToFirestore(lodestoneId, result.characterName);
                    setLodestoneId(lodestoneId);
                    setCharacterName(result.characterName);
                    setVerified(true);

                    setTimeout(() => {
                        closeAuthModal();
                        verifyBtn.disabled = false;
                    }, 1500);
                } else {
                    const errorMsg = result.error || "検証に失敗しました";
                    UiDOM.authStatus.textContent = errorMsg;
                    UiDOM.authStatus.classList.add('text-error');
                    console.error("認証失敗:", errorMsg);
                    verifyBtn.disabled = false;
                }
            } catch (error) {
                const errorMsg = `エラー: ${error.message || "予期せぬエラーが発生しました"}`;
                UiDOM.authStatus.textContent = errorMsg;
                UiDOM.authStatus.classList.add('text-error');
                console.error("認証プロセス異常:", error);
                verifyBtn.disabled = false;
            }
        });
    }

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            if (!UiDOM.reportModal.classList.contains("hidden")) closeReportModal();
            if (!UiDOM.authModal.classList.contains("hidden")) closeAuthModal();
        }
    });
}
