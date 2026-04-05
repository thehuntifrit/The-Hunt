import { getState, setLodestoneId, setCharacterName, setVerified } from "./2dataManager.js";
import { verifyLodestoneCharacter, registerUserToFirestore } from "./2server.js";
import { cloneTemplate } from "./2mobCard.js";

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('manual-modal');
    const backdrop = document.getElementById('manual-modal-backdrop');
    const closeBtn = document.getElementById('close-manual-modal');
    const container = document.getElementById('readme-container');
    let isLoaded = false;
    let currentVCode = "";

    if (!modal || !container) return;

    window.openUserManual = async () => {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        document.body.classList.add('overflow-hidden');

        if (!isLoaded) {
            try {
                container.innerHTML = '<p style="text-align:center;color:#9ca3af">読み込み中...</p>';
                const response = await fetch('./README.md');
                if (!response.ok) throw new Error('Failed to load README');

                const text = await response.text();
                marked.setOptions({
                    breaks: true,
                    gfm: true
                });
                const html = marked.parse(text);
                container.innerHTML = DOMPurify.sanitize(html);
                isLoaded = true;
                updateAuthUI();
            } catch (error) {
                console.error(error);
                container.innerHTML = '<p style="color:#f87171;text-align:center">マニュアルの読み込みに失敗しました。</p>';
            }
        }
    };

    const closeModal = () => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.body.classList.remove('overflow-hidden');
    };

    closeBtn?.addEventListener('click', closeModal);
    backdrop?.addEventListener('click', closeModal);

    window.addEventListener('characterNameSet', () => {
        if (isLoaded) updateAuthUI();
    });

    async function updateAuthUI() {
        const authContainer = document.getElementById('readme-auth-session');
        if (!authContainer) return;

        const state = getState();
        authContainer.innerHTML = "";

        if (state.isVerified) {
            const verifiedEl = cloneTemplate('auth-verified-template');
            if (verifiedEl) authContainer.appendChild(verifiedEl);
            return;
        }

        if (!currentVCode) {
            currentVCode = "HUNT-" + Math.random().toString(36).substring(2, 10).toUpperCase();
        }

        const formEl = cloneTemplate('auth-form-template');
        if (!formEl) return;

        const vcodeDisplay = formEl.querySelector('.auth-vcode-display');
        const copyBtn = formEl.querySelector('.auth-copy-btn');
        const verifyBtn = formEl.querySelector('.auth-verify-btn');
        const idInput = formEl.querySelector('.auth-id-input');
        const statusEl = formEl.querySelector('.auth-status-msg');

        if (vcodeDisplay) vcodeDisplay.textContent = currentVCode;

        copyBtn?.addEventListener('click', () => {
            navigator.clipboard.writeText(currentVCode);
            const original = copyBtn.textContent;
            copyBtn.textContent = "Done!";
            setTimeout(() => copyBtn.textContent = original, 2000);
        });

        verifyBtn?.addEventListener('click', async () => {
            const raw = idInput.value.trim();
            if (!raw) return;

            const idMatch = raw.match(/character\/(\d+)/);
            const lodestoneId = idMatch ? idMatch[1] : raw.match(/^\d+$/) ? raw : null;

            if (!lodestoneId || lodestoneId.length > 20) {
                statusEl.textContent = "正しいIDまたはURLを入力してください";
                statusEl.className = "text-xs text-red-400";
                return;
            }

            statusEl.textContent = "検証中...";
            statusEl.className = "text-xs text-cyan-400 auth-status-msg";
            verifyBtn.disabled = true;

            try {
                const result = await verifyLodestoneCharacter(lodestoneId, currentVCode);
                if (result.success) {
                    statusEl.textContent = "検証成功！登録しています...";
                    await registerUserToFirestore(lodestoneId, result.characterName);
                    setLodestoneId(lodestoneId);
                    setCharacterName(result.characterName);
                    setVerified(true);
                    updateAuthUI();
                } else {
                    statusEl.textContent = result.error;
                    statusEl.className = "text-xs text-red-400 auth-status-msg";
                    verifyBtn.disabled = false;
                }
            } catch (err) {
                statusEl.textContent = "エラーが発生しました";
                statusEl.className = "text-xs text-red-400 auth-status-msg";
                verifyBtn.disabled = false;
            }
        });

        authContainer.appendChild(formEl);
    }
});
