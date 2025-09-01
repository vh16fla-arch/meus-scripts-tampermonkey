// ==UserScript==
// @name         CG Sidebar Expandível + Tiny Bar Real
// @namespace    http://tampermonkey.net/
// @version      2.5
// @description  Usa a Tiny Bar real como hover para abrir a Sidebar maior, com fixar e redimensionar. Perfeito e sem quebrar o sistema nativo.
// @author       VH
// @match        https://chat.openai.com/*
// @match        https://chatgpt.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const STORAGE_KEY = 'sidebarCustomConfigV25';

    const waitForElement = (selector, timeout = 10000) => {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                observer.disconnect();
                reject(new Error(`Timeout: ${selector}`));
            }, timeout);

            const observer = new MutationObserver(() => {
                const el = document.querySelector(selector);
                if (el) {
                    clearTimeout(timer);
                    observer.disconnect();
                    resolve(el);
                }
            });

            observer.observe(document.body, { childList: true, subtree: true });

            const el = document.querySelector(selector);
            if (el) {
                clearTimeout(timer);
                observer.disconnect();
                resolve(el);
            }
        });
    };

    Promise.all([
        waitForElement('#stage-slideover-sidebar'),
        waitForElement('#stage-sidebar-tiny-bar')
    ]).then(([sidebar, tinyBar]) => {

        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        let pinned = saved.pinned ?? false;
        let width = saved.width ?? 260;

        const body = document.querySelector('body');

        // Cria handle de redimensionamento
        const resizeHandle = document.createElement('div');
        Object.assign(resizeHandle.style, {
            width: '6px',
            cursor: 'ew-resize',
            position: 'fixed',
            top: '0',
            left: `${width - 3}px`,
            height: '100%',
            zIndex: '10000',
            background: 'transparent'
        });
        document.body.appendChild(resizeHandle);

        // Cria botão fixar/desfixar
        const pinButton = document.createElement('div');
        pinButton.innerHTML = pinned ? '📌' : '📍';
        Object.assign(pinButton.style, {
            position: 'fixed',
            top: '8px',
            left: `${width - 30}px`,
            cursor: 'pointer',
            fontSize: '18px',
            userSelect: 'none',
            zIndex: '10001',
            background: 'white',
            borderRadius: '4px',
            padding: '2px'
        });
        pinButton.title = 'Fixar / Desfixar Sidebar';
        document.body.appendChild(pinButton);

        const style = document.createElement('style');
        document.head.appendChild(style);

        function updateStyle() {
            style.innerHTML = `
                #history aside a div.flex.min-w-0.grow.items-center.gap-2 > div {
                    white-space: normal !important;
                    overflow: visible !important;
                    text-overflow: unset !important;
                }
            `;

            body.style.setProperty('--sidebar-width', `${width}px`);

            resizeHandle.style.left = `${width - 3}px`;
            pinButton.style.left = `${width - 30}px`;
        }

        function saveState() {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ pinned, width }));
        }

        function showSidebar() {
            if (!pinned) {
                body.setAttribute('data-stage-sidebar-min', 'false');
                body.style.setProperty('--sidebar-width', `${width}px`);
            }
        }

        function hideSidebar() {
            if (!pinned) {
                body.setAttribute('data-stage-sidebar-min', 'true');
                body.style.setProperty('--sidebar-width', `52px`);
            }
        }

        function togglePin() {
            pinned = !pinned;
            pinButton.innerHTML = pinned ? '📌' : '📍';
            saveState();
            if (pinned) {
                body.setAttribute('data-stage-sidebar-min', 'false');
                body.style.setProperty('--sidebar-width', `${width}px`);
            } else {
                body.setAttribute('data-stage-sidebar-min', 'true');
                body.style.setProperty('--sidebar-width', `52px`);
            }
            updateStyle();
        }

        // Hover na TinyBar
        tinyBar.addEventListener('mouseenter', showSidebar);
        sidebar.addEventListener('mouseleave', hideSidebar);

        // Botão fixar
        pinButton.addEventListener('click', togglePin);

        // Resize
        let resizing = false;
        let startX = 0;
        let startWidth = 0;

        resizeHandle.addEventListener('mousedown', (e) => {
            e.preventDefault();
            resizing = true;
            startX = e.clientX;
            startWidth = width;
            document.body.style.userSelect = 'none';
        });

        document.addEventListener('mousemove', (e) => {
            if (!resizing) return;
            const dx = e.clientX - startX;
            width = Math.max(180, Math.min(startWidth + dx, 500));
            if (pinned) {
                body.style.setProperty('--sidebar-width', `${width}px`);
            }
            updateStyle();
        });

        document.addEventListener('mouseup', () => {
            if (resizing) {
                resizing = false;
                document.body.style.userSelect = '';
                saveState();
            }
        });

        // Inicializa
        if (pinned) {
            body.setAttribute('data-stage-sidebar-min', 'false');
            body.style.setProperty('--sidebar-width', `${width}px`);
        } else {
            body.setAttribute('data-stage-sidebar-min', 'true');
            body.style.setProperty('--sidebar-width', `52px`);
        }
        updateStyle();
    }).catch(err => {
        console.error('Erro carregando elementos:', err);
    });

})();
