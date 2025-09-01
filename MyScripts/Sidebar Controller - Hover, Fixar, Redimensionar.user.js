// ==UserScript==
// @name         Sidebar Controller - Hover, Fixar, Redimensionar
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Sidebar com hover, fixar via pin, redimensionável e conteúdo interno adaptável. Sem empurrar conteúdo principal da tela.
// @author       Você
// @match        https://chat.openai.com/*
// @match        https://chatgpt.com/*
// ==/UserScript==

(function() {
    'use strict';

    const sidebarSelector = '#stage-slideover-sidebar';
    const tinyBarSelector = '#stage-sidebar-tiny-bar';
    const hoverAreaWidth = 20;
    const minWidth = 150;
    const defaultWidth = 250;

    const savedWidth = parseInt(localStorage.getItem('sidebarResizableWidth'), 10);
    let sidebarWidth = (isNaN(savedWidth) || savedWidth < minWidth) ? defaultWidth : savedWidth;
    let isFixed = localStorage.getItem('sidebarIsFixed') === 'true';

    function init() {
        const sidebar = document.querySelector(sidebarSelector);
        const tinyBar = document.querySelector(tinyBarSelector);

        if (!sidebar) {
            console.warn('Sidebar não encontrada');
            return;
        }

        if (tinyBar) {
            tinyBar.style.display = 'none'; // Esconde o botão original
        }

        // 🔥 Estilo base da sidebar
        sidebar.style.position = 'fixed';
        sidebar.style.top = '0';
        sidebar.style.left = '0';
        sidebar.style.height = '100vh';
        sidebar.style.zIndex = '9999';
        sidebar.style.width = sidebarWidth + 'px';
        sidebar.style.boxSizing = 'border-box';
        sidebar.style.background = sidebar.style.background || 'white';

        // 🔥 Forçar o conteúdo interno a se ajustar
        function adjustInternalContent() {
            sidebar.querySelectorAll('*').forEach(el => {
                el.style.width = '100%';
                el.style.maxWidth = '100%';
                el.style.boxSizing = 'border-box';
            });
        }
        adjustInternalContent();

        // 🔥 Mostrar / Esconder
        function hideSidebar() {
            sidebar.style.left = `-${sidebarWidth}px`;
        }

        function showSidebar() {
            sidebar.style.left = '0';
        }

        if (isFixed) {
            showSidebar();
        } else {
            hideSidebar();
        }

        // 🔥 Área hover
        const hoverZone = document.createElement('div');
        hoverZone.style.position = 'fixed';
        hoverZone.style.top = '0';
        hoverZone.style.left = '0';
        hoverZone.style.width = hoverAreaWidth + 'px';
        hoverZone.style.height = '100vh';
        hoverZone.style.zIndex = '9998';
        hoverZone.style.background = 'transparent';
        hoverZone.style.pointerEvents = 'auto';
        document.body.appendChild(hoverZone);

        hoverZone.addEventListener('mouseenter', () => {
            if (!isFixed) showSidebar();
        });

        hoverZone.addEventListener('mouseleave', (e) => {
            const to = e.relatedTarget;
            if (!sidebar.contains(to) && !isFixed) {
                hideSidebar();
            }
        });

        sidebar.addEventListener('mouseleave', (e) => {
            const to = e.relatedTarget;
            if (to !== hoverZone && !sidebar.contains(to) && !isFixed) {
                hideSidebar();
            }
        });

        // 🔥 Redimensionador (Grip)
        const resizer = document.createElement('div');
        resizer.style.position = 'absolute';
        resizer.style.top = '0';
        resizer.style.right = '0';
        resizer.style.width = '5px';
        resizer.style.height = '100%';
        resizer.style.cursor = 'ew-resize';
        resizer.style.background = 'rgba(0,0,0,0)';
        resizer.style.zIndex = '10000';
        sidebar.appendChild(resizer);

        let isResizing = false;

        resizer.addEventListener('mousedown', (e) => {
            isResizing = true;
            document.body.style.cursor = 'ew-resize';
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;
            const newWidth = e.clientX;
            if (newWidth < minWidth) return;
            sidebarWidth = newWidth;
            sidebar.style.width = sidebarWidth + 'px';
            adjustInternalContent();

            // Atualiza posição do pin
            updatePinPosition();
        });

        document.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                document.body.style.cursor = 'default';
                localStorage.setItem('sidebarResizableWidth', sidebarWidth);
            }
        });

        // 🔥 Botão Pin (Fixar / Hover)
        const pinButton = document.createElement('div');
        pinButton.innerText = '📌';
        pinButton.style.position = 'absolute';
        pinButton.style.top = '8px';
        pinButton.style.right = '8px';
        pinButton.style.cursor = 'pointer';
        pinButton.style.zIndex = '10000';
        pinButton.style.fontSize = '16px';
        pinButton.title = 'Alternar fixar/hover';

        sidebar.appendChild(pinButton);

        function updatePinPosition() {
            pinButton.style.right = '8px';
        }

        pinButton.addEventListener('click', () => {
            isFixed = !isFixed;
            localStorage.setItem('sidebarIsFixed', isFixed);
            if (isFixed) {
                showSidebar();
            } else {
                hideSidebar();
            }
        });
    }

    // 🔥 Observador pra esperar elementos dinâmicos
    const observer = new MutationObserver(() => {
        if (document.querySelector(sidebarSelector)) {
            observer.disconnect();
            init();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

})();
