// ==UserScript==
// @name         Script Mestre Atualizado
// @namespace    https://vh16fla-arch.github.io/meus-scripts-tampermonkey/
// @version      1.2
// @description  Mestre para carregar scripts secundários com alerta bloqueante e barra de progresso
// @match        https://vh16fla-arch.github.io/meus-scripts-tampermonkey/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 1️⃣ Modal bloqueante inicial
    function showBlockingAlert(callback) {
        const modal = document.createElement('div');
        modal.id = 'scriptMestreModal';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.background = 'rgba(0,0,0,0.8)';
        modal.style.display = 'flex';
        modal.style.justifyContent = 'center';
        modal.style.alignItems = 'center';
        modal.style.zIndex = '9999';

        modal.innerHTML = `
            <div style="
                background: #fff;
                padding: 20px 30px;
                border-radius: 8px;
                text-align: center;
                max-width: 400px;
                font-family: sans-serif;
            ">
                <h2>⚠️ ATENÇÃO</h2>
                <p>Não feche esta aba! Aguarde todos os scripts serem baixados.<br>
                   Você pode trocar de guia, mas esta página estará bloqueada até clicar em "Entendi".</p>
                <button id="scriptMestreBtn" style="
                    margin-top: 15px;
                    padding: 8px 16px;
                    font-size: 14px;
                    cursor: pointer;
                    border: none;
                    background-color: #007bff;
                    color: white;
                    border-radius: 4px;
                ">Entendi</button>
            </div>
        `;

        document.body.appendChild(modal);

        document.getElementById('scriptMestreBtn').addEventListener('click', () => {
            modal.remove();
            if (callback) callback();
        });
    }

    // 2️⃣ Barra de progresso minimalista
    function createProgressBar() {
        const bar = document.createElement('div');
        bar.id = 'scriptMestreProgress';
        bar.style.position = 'fixed';
        bar.style.bottom = '20px';
        bar.style.right = '20px';
        bar.style.width = '250px';
        bar.style.height = '24px';
        bar.style.background = '#eee';
        bar.style.borderRadius = '12px';
        bar.style.overflow = 'hidden';
        bar.style.boxShadow = '0 0 5px rgba(0,0,0,0.3)';
        bar.style.zIndex = '9999';
        bar.style.fontFamily = 'sans-serif';
        bar.style.fontSize = '12px';
        bar.style.lineHeight = '24px';
        bar.style.color = '#333';
        bar.style.textAlign = 'center';

        const inner = document.createElement('div');
        inner.id = 'scriptMestreProgressInner';
        inner.style.width = '0%';
        inner.style.height = '100%';
        inner.style.background = 'linear-gradient(90deg, #4caf50, #81c784)';
        inner.style.transition = 'width 0.3s';
        bar.appendChild(inner);

        document.body.appendChild(bar);
    }

    function updateProgress(percent) {
        const inner = document.getElementById('scriptMestreProgressInner');
        if(inner) inner.style.width = percent + '%';
    }

    // 3️⃣ Lista de scripts na pasta MyScripts
    const scriptsSecundarios = [
        'MyScripts/CG Barra de Índice PRO 🔥 + Ocultar IA.user.js',
        'MyScripts/CG Caixa flutuante com Enter e foco.user.js',
        'MyScripts/CG Chats + Tags.user.js',
        'MyScripts/CG Conversas Flutuantes.user.js',
        'MyScripts/CG Ocultar barra lateral com hover (Tiny Bar visível).user.js',
        'MyScripts/CG Sidebar Expandível + Tiny Bar Real.user.js',
        'MyScripts/CG • Status Bars v2.2.user.js',
        'MyScripts/Sidebar Controller - Hover, Fixar, Redimensionar.user.js',
        'MyScripts/YT Captura Assistir Mais Tarde (Atualizado 2025).user.js',
        'MyScripts/YT Motivação no YouTube + Setas Navegação (Corrigido).user.js',
        'MyScripts/YT Playlist na Home (Estilo Bonito).user.js'
    ];

    // 4️⃣ Função para carregar scripts
    function loadScripts() {
        createProgressBar();
        let loaded = 0;

        scriptsSecundarios.forEach(src => {
            const s = document.createElement('script');
            s.src = src;
            s.onload = () => {
                loaded++;
                updateProgress(Math.round((loaded / scriptsSecundarios.length) * 100));
            };
            s.onerror = () => {
                console.error('Erro ao carregar script:', src);
                loaded++;
                updateProgress(Math.round((loaded / scriptsSecundarios.length) * 100));
            };
            document.body.appendChild(s);
        });
    }

    // Inicia o fluxo: alerta bloqueante → barra de progresso
    showBlockingAlert(loadScripts);

})();
