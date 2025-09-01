// ==UserScript==
// @name         CG Conversas Flutuantes
// @namespace    http://seuscripts.com
// @version      1.0
// @description  Botão flutuante arrastável que exibe lista de conversas ao passar o mouse
// @author       VH
// @match        https://chat.openai.com/*
// @match        https://chatgpt.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const ID_BTN = "btn-flutuante-chatgpt";
    const ID_LISTA = "lista-conversas-chatgpt";

    // 🔹 Criar botão flutuante
    const button = document.createElement('div');
    button.id = ID_BTN;
    button.innerHTML = '📑';
    Object.assign(button.style, {
        position: 'fixed',
        top: '100px',  // posição inicial
        left: '80px',
        bottom: 'auto',
        right: 'auto',
        width: '48px',
        height: '48px',
        background: 'var(--button-secondary-background, #444)',
        color: 'var(--text-primary)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'grab',
        zIndex: 9999,
        boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
        userSelect: 'none',
        transition: 'background 0.3s'
    });

    // 🔹 Criar lista
    const lista = document.createElement('div');
    lista.id = ID_LISTA;
    Object.assign(lista.style, {
        position: 'fixed',
        top: '160px',
        left: '80px',
        width: '260px',
        maxHeight: '400px',
        overflowY: 'auto',
        background: 'rgba(40, 40, 40, 0.6)', // translúcido
        backdropFilter: 'blur(12px)',        // desfoque
        WebkitBackdropFilter: 'blur(12px)',
        color: '#fff',
        borderRadius: '12px',
        boxShadow: '0 8px 20px rgba(0,0,0,0.5)',
        padding: '12px',
        display: 'none',
        zIndex: 9998
    });

    // 🔹 Preencher lista com exemplos
    lista.innerHTML = `
        <h4 style="margin: 0 0 10px 0; font-size: 14px; font-weight: bold;">Minhas Conversas</h4>
        <ul style="list-style: none; padding: 0; margin: 0; font-size: 13px;">
            <li><a href="#" style="color: #fff; text-decoration: none;">📌 Projeto Sidebar</a></li>
            <li><a href="#" style="color: #fff; text-decoration: none;">🎬 Roteiros de Filmes</a></li>
            <li><a href="#" style="color: #fff; text-decoration: none;">⚽ Esportetudo</a></li>
            <li><a href="#" style="color: #fff; text-decoration: none;">📅 Calendário Flamengo</a></li>
        </ul>
    `;

    // 🔹 Mostrar/Ocultar lista ao passar mouse
    let hoverAtivo = false;

    button.addEventListener('mouseenter', () => {
        lista.style.display = 'block';
    });

    button.addEventListener('mouseleave', () => {
        setTimeout(() => {
            if (!hoverAtivo) lista.style.display = 'none';
        }, 200);
    });

    lista.addEventListener('mouseenter', () => {
        hoverAtivo = true;
        lista.style.display = 'block';
    });

    lista.addEventListener('mouseleave', () => {
        hoverAtivo = false;
        lista.style.display = 'none';
    });

    // 🔹 Função de arrastar botão
    let isDragging = false;
    let offsetX, offsetY;

    button.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - button.getBoundingClientRect().left;
        offsetY = e.clientY - button.getBoundingClientRect().top;
        button.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        button.style.left = `${e.clientX - offsetX}px`;
        button.style.top = `${e.clientY - offsetY}px`;
        button.style.right = 'auto';
        button.style.bottom = 'auto';

        // 🔹 A lista acompanha o botão
        lista.style.left = `${e.clientX - offsetX}px`;
        lista.style.top = `${e.clientY - offsetY + 60}px`;
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        button.style.cursor = 'grab';
    });

    // 🔹 Inserir na página
    document.body.appendChild(button);
    document.body.appendChild(lista);
})();
