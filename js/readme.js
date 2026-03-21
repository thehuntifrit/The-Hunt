
import { getState, setLodestoneId, setCharacterName, setVerified } from "./dataManager.js";
import { verifyLodestoneCharacter, registerUserToFirestore } from "./server.js";

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('manual-modal');
    const backdrop = document.getElementById('manual-modal-backdrop');
    const closeBtn = document.getElementById('close-manual-modal');
    const container = document.getElementById('readme-container');
    let isLoaded = false;
    let currentVCode = "";

    if (!modal || !container) return;

    window.openUserManual = async () => {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

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
                container.innerHTML = marked.parse(text);
                isLoaded = true;
                updateAuthUI();
            } catch (error) {
                console.error(error);
                container.innerHTML = '<p style="color:#f87171;text-align:center">マニュアルの読み込みに失敗しました。</p>';
            }
        }
    };

    const closeModal = () => {
        modal.style.display = 'none';
        document.body.style.overflow = '';
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
        if (state.isVerified) {
            authContainer.innerHTML = `
                <div class="bg-emerald-900/20 border border-emerald-500/50 p-4 rounded-lg my-4 text-center">
                    <p class="text-emerald-400 font-bold">✓ 認証済みです</p>
                </div>
            `;
            return;
        }

        if (!currentVCode) {
            currentVCode = "HUNT-" + Math.random().toString(36).substring(2, 10).toUpperCase();
        }

        authContainer.innerHTML = `
            <div class="bg-slate-800/50 border border-gray-700 p-4 rounded-lg my-4 space-y-4">
                <p class="text-xs text-yellow-500 font-bold uppercase tracking-wider">認証手続き</p>
                
                <div class="space-y-2">
                    <label class="block text-xs text-gray-400">STEP 1: 検証コードをコピー</label>
                    <div class="flex gap-2">
                        <code class="flex-1 p-2 bg-gray-950 rounded border border-gray-800 text-center font-mono text-yellow-500 font-bold select-all tracking-widest">${currentVCode}</code>
                        <button id="readme-auth-copy" class="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs transition">Copy</button>
                    </div>
                </div>

                <div class="space-y-2">
                    <label class="block text-xs text-gray-400">STEP 2: Lodestoneプロフィールに貼り付け</label>
                    <a href="https://jp.finalfantasyxiv.com/lodestone/my/setting/profile/" target="_blank" rel="noopener noreferrer" 
                       class="text-cyan-400 underline text-sm block hover:text-cyan-300">プロフィール編集画面を開く 🔗</a>
                </div>

                <div class="space-y-2">
                    <label class="block text-xs text-gray-400">STEP 3: キャラクターIDを入力して検証</label>
                    <div class="flex flex-col gap-2">
                        <input type="text" id="readme-auth-id" placeholder="IDまたはURL" 
                               class="w-full p-2 rounded bg-gray-900 border border-gray-700 text-sm focus:ring-1 focus:ring-yellow-500 outline-none">
                        <div id="readme-auth-status" class="text-xs min-h-[1em]"></div>
                        <button id="readme-auth-verify" class="w-full py-2 rounded bg-yellow-600 hover:bg-yellow-500 font-bold text-white transition text-sm">検証して登録</button>
                    </div>
                </div>
            </div>
        `;

        const copyBtn = document.getElementById('readme-auth-copy');
        copyBtn?.addEventListener('click', () => {
            navigator.clipboard.writeText(currentVCode);
            const original = copyBtn.textContent;
            copyBtn.textContent = "Done!";
            setTimeout(() => copyBtn.textContent = original, 2000);
        });

        const verifyBtn = document.getElementById('readme-auth-verify');
        const idInput = document.getElementById('readme-auth-id');
        const statusEl = document.getElementById('readme-auth-status');

        verifyBtn?.addEventListener('click', async () => {
            const raw = idInput.value.trim();
            if (!raw) return;

            const idMatch = raw.match(/character\/(\d+)/);
            const lodestoneId = idMatch ? idMatch[1] : raw.match(/^\d+$/) ? raw : null;

            if (!lodestoneId) {
                statusEl.textContent = "正しいIDまたはURLを入力してください";
                statusEl.className = "text-xs text-red-400";
                return;
            }

            statusEl.textContent = "検証中...";
            statusEl.className = "text-xs text-cyan-400";
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
                    statusEl.className = "text-xs text-red-400";
                    verifyBtn.disabled = false;
                }
            } catch (err) {
                statusEl.textContent = "エラーが発生しました";
                statusEl.className = "text-xs text-red-400";
                verifyBtn.disabled = false;
            }
        });
    }
});
