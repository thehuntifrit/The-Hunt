import { DOM } from "./dataManager";
import { cloneTemplate } from "./mobCard";
import { setActiveNavItem } from "./sidebar";
import readmeContent from "../README.md?raw";

// グローバルロードされる marked, DOMPurify の定義
declare const marked: any;
declare const DOMPurify: any;

let isLoaded = false;

export const openUserManual = async (): Promise<void> => {
    const modal = DOM.manualModal;
    const container = DOM.readmeContainer;
    if (!modal || !container) return;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.classList.add('overflow-hidden');

    if (!isLoaded) {
        try {
            const text = readmeContent;

            if (typeof marked !== 'undefined' && typeof DOMPurify !== 'undefined') {
                marked.setOptions({
                    breaks: true,
                    gfm: true
                });
                const html = marked.parse(text);
                container.innerHTML = DOMPurify.sanitize(html);
            } else {
                container.textContent = text;
            }
            isLoaded = true;
        } catch (error) {
            console.error(error);
            const errorMsg = cloneTemplate('ui-message-template');
            if (errorMsg) {
                errorMsg.className = "u-text-red-400 u-text-center";
                errorMsg.textContent = "マニュアルの読み込みに失敗しました。";
                container.innerHTML = "";
                container.appendChild(errorMsg);
            }
        }
    }
};

export const closeUserManual = (): void => {
    const modal = document.getElementById('manual-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.classList.remove('overflow-hidden');
};

document.addEventListener('DOMContentLoaded', () => {
    const modal = DOM.manualModal;
    const closeBtn = DOM.closeManualModalBtn;

    const handleClose = () => {
        closeUserManual();
        const activeNav = document.querySelector(".appnav-btn[data-nav-id='manual'].appnav-active");
        if (activeNav) {
            setActiveNavItem("home");
        }
    };

    closeBtn?.addEventListener('click', handleClose);

    modal?.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (target === modal || target.classList.contains('app-backdrop')) handleClose();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
            handleClose();
        }
    });
});
