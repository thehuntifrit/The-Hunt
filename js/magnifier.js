// magnifier.js

export function initGlobalMagnifier() {
    if (window.magnifierInitialized) return;
    window.magnifierInitialized = true;

    const magnifier = document.getElementById('global-magnifier');
    const wrapper = magnifier?.querySelector('.magnifier-content-wrapper');
    if (!magnifier || !wrapper) return;

    let activeMapImg = null;
    let activeMapContainer = null;
    const ZOOM_SCALE = 2.0;

    const updateMagnifier = (e) => {
        if (!activeMapImg || !activeMapContainer) return;

        const rect = activeMapImg.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
            magnifier.classList.add('hidden');
            document.body.classList.remove('magnifier-active');
            activeMapImg = null;
            activeMapContainer = null;
            wrapper.innerHTML = '';
            return;
        }

        magnifier.style.left = `${e.clientX}px`;
        magnifier.style.top = `${e.clientY}px`;

        const magRect = magnifier.getBoundingClientRect();
        const centerX = magRect.width / 2;
        const centerY = magRect.height / 2;

        const translateX = centerX - (x * ZOOM_SCALE);
        const translateY = centerY - (y * ZOOM_SCALE);

        wrapper.style.transform = `translate(${translateX}px, ${translateY}px) scale(${ZOOM_SCALE})`;
    };

    document.addEventListener('mousedown', (e) => {
        if (e.button !== 2) return;

        const mapContainer = e.target.closest('.map-container');
        if (!mapContainer) return;

        const mapImg = mapContainer.querySelector('.mob-map-img');
        if (!mapImg) return;

        e.preventDefault();
        activeMapContainer = mapContainer;
        activeMapImg = mapImg;

        wrapper.innerHTML = '';
        const clone = mapContainer.cloneNode(true);

        clone.style.margin = '0';
        clone.style.border = 'none';
        clone.style.boxShadow = 'none';
        clone.classList.remove('cursor-crosshair', '!cursor-crosshair');

        clone.style.width = `${mapContainer.offsetWidth}px`;
        clone.style.height = `${mapContainer.offsetHeight}px`;

        wrapper.appendChild(clone);
        magnifier.classList.remove('hidden');
        document.body.classList.add('magnifier-active');
        updateMagnifier(e);
    }, { capture: true });

    window.addEventListener('mousemove', (e) => {
        if (activeMapImg) {
            updateMagnifier(e);
        }
    });

    window.addEventListener('mouseup', (e) => {
        if (e.button === 2) {
            magnifier.classList.add('hidden');
            document.body.classList.remove('magnifier-active');
            activeMapImg = null;
            activeMapContainer = null;
            wrapper.innerHTML = '';
        }
    });

    document.addEventListener('contextmenu', (e) => {
        if (e.target.closest('.map-container')) {
            e.preventDefault();
        }
    });
}
