// ==UserScript==
// @name         Script Mestre Minimalista
// @namespace    http://seudominio.com/
// @version      1.1
// @description  Carrega scripts individuais com notificação minimalista
// @author       Seu Nome
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Lista de scripts na pasta MyScripts
    const scripts = [
        'meus-scripts-tampermonkey/MyScripts/CG Barra de Índice PRO 🔥 + Ocultar IA.user.js',
        'meus-scripts-tampermonkey/MyScripts/CG Caixa flutuante com Enter e foco.user.js',
        'meus-scripts-tampermonkey/MyScripts/CG Chats + Tags.user.js',
        'meus-scripts-tampermonkey/MyScripts/CG Conversas Flutuantes.user.js',
        'meus-scripts-tampermonkey/MyScripts/CG Ocultar barra lateral com hover (Tiny Bar visível).user.js',
        'meus-scripts-tampermonkey/MyScripts/CG Sidebar Expandível + Tiny Bar Real.user.js',
        'meus-scripts-tampermonkey/MyScripts/CG • Status Bars v2.2.user.js',
        'meus-scripts-tampermonkey/MyScripts/Sidebar Controller - Hover, Fixar, Redimensionar.user.js',
        'meus-scripts-tampermonkey/MyScripts/YT Captura Assistir Mais Tarde (Atualizado 2025).user.js',
        'meus-scripts-tampermonkey/MyScripts/YT Motivação no YouTube + Setas Navegação (Corrigido).user.js',
        'meus-scripts-tampermonkey/MyScripts/YT Playlist na Home (Estilo Bonito).user.js'
    ];

    // Cria a notificação minimalista
    const notif = document.createElement('div');
    notif.style.position = 'fixed';
    notif.style.bottom = '20px';
    notif.style.right = '20px';
    notif.style.background = 'rgba(0,0,0,0.7)';
    notif.style.color = '#fff';
    notif.style.padding = '10px 15px';
    notif.style.borderRadius = '8px';
    notif.style.fontSize = '0.9em';
    notif.style.boxShadow = '0 3px 10px rgba(0,0,0,0.3)';
    notif.style.zIndex = '9999';
    notif.style.display = 'flex';
    notif.style.alignItems = 'center';
    notif.innerHTML = `
        <span id="notif-text">Carregando scripts...</span>
        <div style="flex:1;height:4px;background:#555;border-radius:2px;margin-left:10px;overflow:hidden">
            <div id="notif-progress" style="width:0%;height:100%;background:#00ff7f;"></div>
        </div>
        <button id="notif-close" style="margin-left:10px;background:none;border:none;color:#fff;cursor:pointer;font-weight:bold;">×</button>
    `;
    document.body.appendChild(notif);

    // Fecha ao clicar no X
    document.getElementById('notif-close').addEventListener('click', () => {
        notif.remove();
    });

    const progressBar = document.getElementById('notif-progress');
    let loaded = 0;

    // Carrega cada script
    scripts.forEach(url => {
        const s = document.createElement('script');
        s.src = url;
        s.onload = () => {
            loaded++;
            progressBar.style.width = ((loaded / scripts.length) * 100) + '%';
            if (loaded === scripts.length) {
                document.getElementById('notif-text').textContent = 'Todos os scripts carregados!';
                setTimeout(() => notif.remove(), 2000); // some automaticamente
            }
        };
        document.body.appendChild(s);
    });
})();
