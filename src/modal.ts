import { getState, setLodestoneId, setCharacterName, setVerified, extractLodestoneId, DOM, handleAppError } from "./dataManager";
import { verifyLodestoneCharacter, fetchVerificationCode } from "./server";
import { renderNameWithInstance } from "./mobCard";

export async function openReportModal(mobNo: number): Promise<void> {
    const mob = getState().mobs.find(m => m.No === mobNo);
    if (!mob) return;

    const now = new Date();
    const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);

    if (DOM.reportForm) {
        DOM.reportForm.dataset.mobNo = String(mobNo);
    }
    if (DOM.modalMobName) {
        renderNameWithInstance(DOM.modalMobName, mob.name);
    }
    if (DOM.modalTimeInput) {
        DOM.modalTimeInput.value = localIso;
    }

    if (DOM.reportModal) {
        DOM.reportModal.classList.remove("hidden");
    }
}

export function closeReportModal(): void {
    if (DOM.reportModal) {
        DOM.reportModal.classList.add("hidden");
    }
    if (DOM.modalTimeInput) {
        DOM.modalTimeInput.value = "";
    }
    if (DOM.modalStatus) {
        DOM.modalStatus.textContent = "";
    }
    if (DOM.modalForceSubmit) {
        DOM.modalForceSubmit.checked = false;
    }
}

let currentVerificationCode = "";

export function openAuthModal(): void {
    currentVerificationCode = "";
    if (DOM.authVCode) {
        DOM.authVCode.textContent = "取得中...";
    }
    if (DOM.authStatus) {
        DOM.authStatus.textContent = "";
        DOM.authStatus.classList.remove('text-error', 'text-success');
    }
    if (DOM.authModal) {
        DOM.authModal.classList.remove("hidden");
    }
    void loadVerificationCode();
}

async function loadVerificationCode(): Promise<void> {
    const code = await fetchVerificationCode();
    if (code) {
        currentVerificationCode = code;
        if (DOM.authVCode) DOM.authVCode.textContent = code;
    } else if (DOM.authStatus) {
        DOM.authStatus.textContent = "認証コードを取得できませんでした。ページを再読み込みしてください。";
        DOM.authStatus.classList.add('text-error');
    }
}

export function closeAuthModal(): void {
    if (DOM.authModal) {
        DOM.authModal.classList.add("hidden");
    }
}

// ─── モーダル初期化 ───

export function initModal(): void {
    if (DOM.cancelReportBtn) {
        DOM.cancelReportBtn.addEventListener("click", closeReportModal);
    }
    if (DOM.reportModal) {
        DOM.reportModal.addEventListener("click", (e) => {
            if (e.target === DOM.reportModal) {
                closeReportModal();
            }
        });
    }

    if (DOM.authCancelBtn) {
        DOM.authCancelBtn.addEventListener("click", closeAuthModal);
    }

    if (DOM.authCopyCodeBtn) {
        DOM.authCopyCodeBtn.addEventListener("click", () => {
            navigator.clipboard.writeText(currentVerificationCode);
            const originalText = DOM.authCopyCodeBtn!.textContent;
            DOM.authCopyCodeBtn!.textContent = "Done!";
            setTimeout(() => {
                if (DOM.authCopyCodeBtn) {
                    DOM.authCopyCodeBtn.textContent = originalText;
                }
            }, 2000);
        });
    }

    if (DOM.authVerifyBtn) {
        DOM.authVerifyBtn.addEventListener("click", async () => {
            if (!DOM.authLodestoneId || !DOM.authStatus || !DOM.authVerifyBtn) return;
            const rawInput = DOM.authLodestoneId.value.trim();
            const lodestoneId = extractLodestoneId(rawInput);

            if (!lodestoneId) {
                DOM.authStatus.textContent = "正しいロードストーンのIDまたはURLを入力してください。";
                DOM.authStatus.classList.add('text-error');
                return;
            }

            DOM.authStatus.textContent = "検証中...";
            DOM.authStatus.classList.add('text-success');
            DOM.authVerifyBtn.disabled = true;

            try {
                const result = await verifyLodestoneCharacter(lodestoneId);

                if (result.success && result.characterName) {
                    DOM.authStatus.textContent = `検証成功！ようこそ、${result.characterName}さん。`;
                    DOM.authStatus.classList.add('text-success');

                    setLodestoneId(lodestoneId);
                    setCharacterName(result.characterName);
                    setVerified(true);

                    setTimeout(() => {
                        closeAuthModal();
                        if (DOM.authVerifyBtn) {
                            DOM.authVerifyBtn.disabled = false;
                        }
                    }, 1500);
                } else {
                    const errorMsg = result.error || "検証に失敗しました";
                    DOM.authStatus.textContent = errorMsg;
                    DOM.authStatus.classList.add('text-error');
                    console.error("認証失敗:", errorMsg);
                    DOM.authVerifyBtn.disabled = false;
                }
            } catch (error) {
                handleAppError(error, "認証プロセス異常");
                DOM.authVerifyBtn.disabled = false;
            }
        });
    }

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            if (DOM.reportModal && !DOM.reportModal.classList.contains("hidden")) closeReportModal();
            if (DOM.authModal && !DOM.authModal.classList.contains("hidden")) closeAuthModal();
        }
    });
}
