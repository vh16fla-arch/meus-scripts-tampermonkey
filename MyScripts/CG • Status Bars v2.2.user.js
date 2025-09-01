// ==UserScript==
// @name         CG • Status Bars v2.2
// @namespace    http://tampermonkey.net/
// @version      2.2
// @description  Marcar, fixar e anotar conversas no ChatGPT com barra de status colorida.
// @author       openai + você
// @match        https://chatgpt.com/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const COLORS = ['gray', 'green', 'orange', 'red'];
  const LABELS = {
    gray: '—',
    green: 'Concluído',
    orange: 'Importante',
    red: 'Urgente',
  };
  const STORAGE = {
    status: id => `chatStatus:${id}`,
    pinned: 'chatPinnedList',
    notes: id => `chatNote:${id}`,
  };

  const style = document.createElement('style');
  style.textContent = `
    .status-wrapper {
      display: flex;
      align-items: center;
      margin-bottom: 2px;
      gap: 4px;
    }
    .status-bar {
      width: 4px;
      height: 20px;
      border-radius: 2px;
      cursor: pointer;
      transition: background 0.2s;
      flex-shrink: 0;
    }
    .status-bar:hover {
      outline: 1px solid #999;
    }
    .status-picker {
      display: none;
      position: absolute;
      left: 10px;
      z-index: 9999;
      background: #fff;
      border: 1px solid #ccc;
      padding: 4px 6px;
      border-radius: 6px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }
    .status-picker.visible {
      display: block;
    }
    .status-option {
      display: flex;
      align-items: center;
      margin: 2px 0;
      cursor: pointer;
      font-size: 13px;
    }
    .status-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      margin-right: 6px;
    }
    .note-box {
      background: #f3f3f3;
      padding: 3px 5px;
      border-radius: 4px;
      font-size: 11px;
      color: #333;
      margin-left: 4px;
      max-width: 120px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    .pin-btn {
      font-size: 14px;
      margin-left: auto;
      cursor: pointer;
      user-select: none;
      color: #888;
    }
    .pin-btn:hover {
      color: #000;
    }
  `;
  document.head.appendChild(style);

  function getIdFromHref(href) {
    const parts = href.split('/');
    return parts[2] || href;
  }

  function createPicker(statusEl, chatId) {
    const picker = document.createElement('div');
    picker.className = 'status-picker';

    COLORS.forEach(color => {
      const option = document.createElement('div');
      option.className = 'status-option';

      const dot = document.createElement('div');
      dot.className = 'status-dot';
      dot.style.background = color;

      const label = document.createElement('span');
      label.textContent = LABELS[color];

      option.append(dot, label);
      option.addEventListener('click', e => {
        e.stopPropagation();
        statusEl.style.background = color;
        localStorage.setItem(STORAGE.status(chatId), color);
        picker.classList.remove('visible');
      });

      picker.appendChild(option);
    });

    document.body.appendChild(picker);
    return picker;
  }

  function decorateLink(link) {
    const href = link.getAttribute('href');
    if (!href || !href.startsWith('/c/')) return;

    const chatId = getIdFromHref(href);
    if (link.querySelector('.status-wrapper')) return; // evitar duplicar

    const wrapper = document.createElement('div');
    wrapper.className = 'status-wrapper';

    // === Barrinha
    const statusEl = document.createElement('div');
    statusEl.className = 'status-bar';
    const savedColor = localStorage.getItem(STORAGE.status(chatId)) || 'gray';
    statusEl.style.background = savedColor;

    const picker = createPicker(statusEl, chatId);

    statusEl.addEventListener('mouseenter', e => {
      const rect = statusEl.getBoundingClientRect();
      picker.style.top = rect.top + 'px';
      picker.style.left = (rect.left + 10) + 'px';
      picker.classList.add('visible');
    });
    statusEl.addEventListener('mouseleave', () => {
      setTimeout(() => picker.classList.remove('visible'), 250);
    });

    picker.addEventListener('mouseenter', () => picker.classList.add('visible'));
    picker.addEventListener('mouseleave', () => picker.classList.remove('visible'));

    // === Nota
    const noteText = localStorage.getItem(STORAGE.notes(chatId)) || '';
    const noteBox = document.createElement('div');
    noteBox.className = 'note-box';
    noteBox.textContent = noteText;

    // === Pin
    const pin = document.createElement('div');
    pin.className = 'pin-btn';
    pin.textContent = '📌';

    pin.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();

      const list = JSON.parse(localStorage.getItem(STORAGE.pinned) || '[]');
      const index = list.indexOf(chatId);

      if (index === -1) {
        list.unshift(chatId);
      } else {
        list.splice(index, 1);
      }
      localStorage.setItem(STORAGE.pinned, JSON.stringify(list));
      reorderPinned();
    });

    // === Inserir tudo
    wrapper.append(statusEl);
    if (noteText) wrapper.append(noteBox);
    wrapper.append(pin);

    const title = link.querySelector('h3, h4');
    if (title) {
      title.parentElement.insertBefore(wrapper, title);
    }
  }

  function reorderPinned() {
    const pinnedList = JSON.parse(localStorage.getItem(STORAGE.pinned) || '[]');
    const items = [...document.querySelectorAll('a[href^="/c/"]')];

    const nav = document.querySelector('nav');
    if (!nav) return;

    pinnedList.reverse().forEach(chatId => {
      const link = items.find(a => a.href.includes(chatId));
      if (link) {
        nav.insertBefore(link.parentElement, nav.firstChild);
      }
    });
  }

  function init() {
    const observer = new MutationObserver(() => {
      const links = document.querySelectorAll('a[href^="/c/"]');
      links.forEach(decorateLink);
      reorderPinned();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Atalho N para editar nota
    document.addEventListener('keydown', e => {
      if (e.key === 'n' && document.activeElement.tagName !== 'TEXTAREA' && document.activeElement.tagName !== 'INPUT') {
        const currentLink = document.querySelector('a.bg-token-hover');
        if (!currentLink) return;

        const chatId = getIdFromHref(currentLink.getAttribute('href'));
        const note = prompt('Digite uma nota rápida para essa conversa:', localStorage.getItem(STORAGE.notes(chatId)) || '');
        if (note !== null) {
          localStorage.setItem(STORAGE.notes(chatId), note);
          const noteBox = currentLink.querySelector('.note-box');
          if (noteBox) {
            noteBox.textContent = note;
          }
        }
      }
    });
  }

  // Aguarda carregamento da barra lateral
  const waitSidebar = setInterval(() => {
    if (document.querySelector('a[href^="/c/"]')) {
      clearInterval(waitSidebar);
      init();
    }
  }, 500);
})();
