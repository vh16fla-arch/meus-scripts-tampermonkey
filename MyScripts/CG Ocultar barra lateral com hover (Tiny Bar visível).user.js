// ==UserScript==
// @name         CG Ocultar barra lateral com hover (Tiny Bar visível)
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Oculta #stage-slideover-sidebar e mantém #stage-sidebar-tiny-bar visível. Mostra ao passar mouse na borda esquerda.
// @author       Você
// @match        https://chat.openai.com/*
// @match        https://chatgpt.com/*
// ==/UserScript==

(function() {
    'use strict';

    const sidebarSelector = '#stage-slideover-sidebar';
    const hoverAreaWidth = 20; // Área sensível na borda esquerda (em pixels)

    function init() {
        const sidebar = document.querySelector(sidebarSelector);

        if (!sidebar) {
            console.warn('Sidebar não encontrada');
            return;
        }

        // Ajusta CSS da sidebar
        sidebar.style.position = 'fixed';
        sidebar.style.top = '0';
        sidebar.style.left = '0';
        sidebar.style.height = '100vh';
        sidebar.style.zIndex = '9999';
        sidebar.style.transition = 'left 0.3s ease';

        const sidebarWidth = sidebar.offsetWidth || 250;

        function hideSidebar() {
            sidebar.style.left = `-${sidebarWidth}px`;
        }

        function showSidebar() {
            sidebar.style.left = '0';
        }

        hideSidebar();

        // Cria área invisível de hover na borda esquerda
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

        // Evento: entrar na zona → mostrar sidebar
        hoverZone.addEventListener('mouseenter', () => {
            showSidebar();
        });

        // Evento: sair da sidebar → esconder
        sidebar.addEventListener('mouseleave', (e) => {
            const to = e.relatedTarget;
            if (to !== hoverZone && !sidebar.contains(to)) {
                hideSidebar();
            }
        });

        // Evento: sair da hoverZone → esconder, se não estiver na sidebar
        hoverZone.addEventListener('mouseleave', (e) => {
            const to = e.relatedTarget;
            if (!sidebar.contains(to)) {
                hideSidebar();
            }
        });
    }

    // Observador para esperar carregar o sidebar, se for SPA
    const observer = new MutationObserver(() => {
        if (document.querySelector('#stage-slideover-sidebar')) {
            observer.disconnect();
            init();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

})();
