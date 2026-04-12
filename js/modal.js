import { getState, setLodestoneId, setCharacterName, setVerified } from "./dataManager.js";
import { verifyLodestoneCharacter, registerUserToFirestore } from "./server.js";

let DOM = {};

export async function openReportModal(mobNo) {
    const mob = getState().mobs.find(m => m.No === mobNo);
    if (!mob) return;

    const now = new Date();
    const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);

    DOM.reportForm.dataset.mobNo = String(mobNo);
    DOM.modalMobName.textContent = `${mob.name}`;
    DOM.modalTimeInput.value = localIso;

    DOM.reportModal.classList.remove("hidden");
}

export function closeReportModal() {
    DOM.reportModal.classList.add("hidden");
    DOM.modalTimeInput.value = "";
    DOM.modalStatus.textContent = "";
    DOM.modalForceSubmit.checked = false;
}

let currentVerificationCode = "";

export function openAuthModal() {
    const arr = new Uint8Array(6);
    crypto.getRandomValues(arr);
    const code = Array.from(arr).map(b => b.toString(36).toUpperCase()).join('').substring(0, 8);
    currentVerificationCode = "HUNT-" + code;
    DOM.authVCode.textContent = currentVerificationCode;
    DOM.authStatus.textContent = "";
    DOM.authStatus.classList.remove('text-error', 'text-success');
    DOM.authModal.classList.remove("hidden");
}

export function closeAuthModal() {
    DOM.authModal.classList.add("hidden");
}

// ─── モーダル初期化 ───

export function initModal(domRef) {
    DOM = domRef;
    const cancelReportBtn = document.getElementById("cancel-report");
    if (cancelReportBtn) {
        cancelReportBtn.addEventListener("click", closeReportModal);
    }
    DOM.reportModal.addEventListener("click", (e) => {
        if (e.target === DOM.reportModal) {
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
            const rawInput = DOM.authLodestoneId.value.trim();
            if (!rawInput) {
                DOM.authStatus.textContent = "IDまたはURLを入力してください。";
                DOM.authStatus.classList.add('text-error');
                return;
            }

            const idMatch = rawInput.match(/character\/(\d+)/);
            const lodestoneId = idMatch ? idMatch[1] : rawInput.match(/^\d+$/) ? rawInput : null;

            if (!lodestoneId || lodestoneId.length > 20) {
                DOM.authStatus.textContent = "正しいロードストーンのIDまたはURLを入力してください。";
                DOM.authStatus.classList.add('text-error');
                return;
            }

            DOM.authStatus.textContent = "検証中...";
            DOM.authStatus.classList.add('text-success');
            verifyBtn.disabled = true;

            try {
                const result = await verifyLodestoneCharacter(lodestoneId, currentVerificationCode);

                if (result.success) {
                    DOM.authStatus.textContent = `検証成功！ようこそ、${result.characterName}さん。`;
                    DOM.authStatus.classList.add('text-success');

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
                    DOM.authStatus.textContent = errorMsg;
                    DOM.authStatus.classList.add('text-error');
                    console.error("認証失敗:", errorMsg);
                    verifyBtn.disabled = false;
                }
            } catch (error) {
                const errorMsg = `エラー: ${error.message || "予期せぬエラーが発生しました"}`;
                DOM.authStatus.textContent = errorMsg;
                DOM.authStatus.classList.add('text-error');
                console.error("認証プロセス異常:", error);
                verifyBtn.disabled = false;
            }
        });
    }

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            if (!DOM.reportModal.classList.contains("hidden")) closeReportModal();
            if (!DOM.authModal.classList.contains("hidden")) closeAuthModal();
        }
    });
}
