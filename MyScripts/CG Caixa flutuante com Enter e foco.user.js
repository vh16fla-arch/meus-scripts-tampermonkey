// ==UserScript==
// @name         CG Caixa flutuante com Enter e foco
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Abre barra de resposta com Enter e foca automaticamente no campo
// @author       Você
// @match        https://chatgpt.com/c/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
  const style = document.createElement('style');
  style.textContent = `
    #chat-hover-trigger {
      position: fixed;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 40px;
      z-index: 9998;
      background: transparent;
      transition: transform 0.2s ease-in-out, pointer-events 0.2s ease-in-out;
      pointer-events: auto;
    }
    form.chat-slim {
      position: fixed !important;
      bottom: 0;
      left: 260px;
      width: calc(100% - 260px);
      max-width: 100%;
      max-height: 300px;
      background: rgba(255, 255, 255, 0.95);
      transition: all 0.2s ease-in-out;
      z-index: 9999;
      display: flex !important;
      align-items: center;
      gap: 8px;
      padding: 4px 8px;
      opacity: 0;
      pointer-events: none;
      transform: translateY(0);
    }
    form.chat-slim.active {
      opacity: 1;
      pointer-events: auto;
      transform: translateY(-10px);
    }
    form.chat-slim:not(.active) {
      max-height: 38px;
    }
    form.chat-slim textarea {
      flex: 1;
      min-height: 28px !important;
      max-height: 200px !important;
      resize: none !important;
      overflow-y: auto !important;
      border: none;
      background: transparent;
      padding: 6px;
      font-size: 14px;
    }
    form.chat-slim > div {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    form.chat-slim button {
      opacity: 1 !important;
      pointer-events: auto !important;
    }
  `;
  document.head.appendChild(style);

  const hoverZone = document.createElement('div');
  hoverZone.id = 'chat-hover-trigger';
  document.body.appendChild(hoverZone);

  const waitForm = setInterval(() => {
    const form = document.querySelector('form');
    const textarea = form?.querySelector('textarea');
    if (!form || !textarea) return;

    clearInterval(waitForm);
    form.classList.add('chat-slim');

    const showForm = () => {
      form.classList.add('active');
      hoverZone.style.pointerEvents = 'none';
    };
    const hideForm = () => {
      form.classList.remove('active');
      hoverZone.style.pointerEvents = 'auto';
    };

    hoverZone.addEventListener('mouseenter', showForm);

    form.addEventListener('mouseleave', () => {
      if (textarea.value.trim() === '') hideForm();
    });

    textarea.addEventListener('focus', showForm);

    textarea.addEventListener('blur', () => {
      if (textarea.value.trim() === '') {
        setTimeout(hideForm, 1500);
      }
    });

    document.addEventListener('keydown', (e) => {
      const isTypingKey = e.key.length === 1 || e.key === 'Backspace';

      if (e.key === 'Enter' && e.shiftKey) return;

      if (e.key === 'Escape' && form.classList.contains('active')) {
        e.preventDefault();
        hideForm();
        textarea.blur();
        if (document.activeElement && document.activeElement !== document.body) {
          document.activeElement.blur();
        }
        return;
      }

      if (e.key === 'Enter') {
        if (!form.classList.contains('active')) {
          e.preventDefault();
          showForm();
          setTimeout(() => {
            textarea.focus();
            // força o caret no fim do conteúdo
            const val = textarea.value;
            textarea.value = '';
            textarea.value = val;
          }, 20); // pequeno delay evita bug de foco
          return;
        }

        if (textarea.value.trim() === '') {
          e.preventDefault();
          hideForm();
          textarea.blur();
          return;
        }

        // Se já está ativo e tem texto, deixa o enter seguir (envio)
        return;
      }


      if (isTypingKey && !form.classList.contains('active')) {
        showForm();
        textarea.focus();
      }
    });

    document.addEventListener('click', (e) => {
      if (!form.contains(e.target) && textarea.value.trim() === '') {
        hideForm();
        textarea.blur();
      }
    });
  }, 400);
})();