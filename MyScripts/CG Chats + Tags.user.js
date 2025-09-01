// ==UserScript==
// @name         CG Chats + Tags
// @namespace    http://tampermonkey.net/
// @version      1
// @description  1 versão funcional
// @match        https://chat.openai.com/*
// @match        https://chatgpt.com/*
// @author       You
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

(function() {
    const ID_BOX = 'chatgpt-conversation-manager';
    const ID_BTN = 'chatgpt-floating-button';

    document.getElementById(ID_BOX)?.remove();
    document.getElementById(ID_BTN)?.remove();

    const COLORS = ['#f44336', '#e91e63', '#9c27b0', '#3f51b5', '#2196f3', '#009688', '#4caf50', '#ff9800', '#795548', '#607d8b'];
    const savedTags = JSON.parse(localStorage.getItem('chatgpt-tags') || '{}');

    const chats = Array.from(document.querySelectorAll('nav a'))
        .filter(el => el.innerText.trim() !== '' && el.href.includes('/c/'))
        .map(el => ({
            id: el.href.split('/c/')[1],
            title: el.innerText.trim(),
            link: el.href
        }));

    let hoverTimeout = null;
    let panelOpen = false;
    let box = null;

    // -------- Botão flutuante
    const button = document.createElement('div');
    button.id = ID_BTN;
    button.innerHTML = '📑';
    Object.assign(button.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
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

    // Drag
    let isDragging = false;
    let offset = { x: 0, y: 0 };

    button.addEventListener('mousedown', (e) => {
        isDragging = true;
        offset.x = e.clientX - button.getBoundingClientRect().left;
        offset.y = e.clientY - button.getBoundingClientRect().top;
        button.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            button.style.left = `${e.clientX - offset.x}px`;
            button.style.top = `${e.clientY - offset.y}px`;
            button.style.bottom = 'auto';
            button.style.right = 'auto';
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        button.style.cursor = 'grab';
    });

    document.body.appendChild(button);

    // -------- Hover com Delay Inteligente
    function openBox() {
        if (panelOpen) return;
        panelOpen = true;
        box = buildPanel();
        document.body.appendChild(box);
    }

    function closeBox() {
        if (!panelOpen) return;
        panelOpen = false;
        box?.remove();
        box = null;
    }

    function scheduleClose() {
        clearTimeout(hoverTimeout);
        hoverTimeout = setTimeout(() => {
            const overBox = box?.matches(':hover');
            const overBtn = button.matches(':hover');
            if (!overBox && !overBtn) {
                closeBox();
            }
        }, 300);
    }

    button.addEventListener('mouseenter', () => {
        clearTimeout(hoverTimeout);
        openBox();
    });

    button.addEventListener('mouseleave', () => {
        scheduleClose();
    });

    // -------- Painel com Glassmorphism
    function buildPanel() {
        const isDark = document.documentElement.classList.contains('dark');

        const box = document.createElement('div');
        box.id = ID_BOX;
        Object.assign(box.style, {
            position: 'fixed',
            top: `${button.getBoundingClientRect().top - 10}px`,
            left: `${button.getBoundingClientRect().left + 60}px`,
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            backgroundColor: isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.4)',
            color: 'var(--text-primary)',
            padding: '20px',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
            zIndex: 9999,
            maxHeight: '80vh',
            overflowY: 'auto',
            width: '480px',
            border: '1px solid var(--border-color, #444)',
            fontFamily: 'sans-serif'
        });

        box.addEventListener('mouseenter', () => clearTimeout(hoverTimeout));
        box.addEventListener('mouseleave', () => scheduleClose());

        const header = document.createElement('div');
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.alignItems = 'center';
        header.style.marginBottom = '12px';

        const title = document.createElement('h2');
        title.innerText = `Conversas (${chats.length})`;
        title.style.margin = '0';
        title.style.fontSize = '20px';

        const searchInput = document.createElement('input');
        Object.assign(searchInput.style, {
            width: '100%',
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid var(--border-color, #444)',
            marginBottom: '12px',
            background: isDark ? '#222' : '#f0f0f0',
            color: 'var(--text-primary)'
        });
        searchInput.placeholder = '🔍 Filtrar conversas...';

        header.appendChild(title);
        box.appendChild(header);
        box.appendChild(searchInput);

        const tagManager = document.createElement('div');
        tagManager.style.marginBottom = '12px';
        const tagList = document.createElement('div');
        tagList.style.display = 'flex';
        tagList.style.flexWrap = 'wrap';
        tagList.style.gap = '8px';

        const addTagBtn = document.createElement('button');
        addTagBtn.innerText = '+ Nova Categoria';
        Object.assign(addTagBtn.style, {
            background: 'var(--button-secondary-background)',
            border: '1px solid var(--border-color, #444)',
            color: 'var(--text-primary)',
            borderRadius: '8px',
            cursor: 'pointer',
            padding: '4px 8px'
        });

        addTagBtn.addEventListener('click', () => {
            const name = prompt('Nome da categoria:');
            if (!name) return;
            const color = prompt('Cor HEX (#ff0000) ou deixe vazio para aleatória:') || COLORS[Math.floor(Math.random() * COLORS.length)];
            Object.values(savedTags).forEach(tags => tags.push({ name, color }));
            saveTags();
            renderList();
        });

        tagManager.appendChild(tagList);
        tagManager.appendChild(addTagBtn);
        box.appendChild(tagManager);

        const ul = document.createElement('ul');
        Object.assign(ul.style, {
            listStyle: 'none',
            padding: '0',
            margin: '0'
        });
        box.appendChild(ul);

        function saveTags() {
            localStorage.setItem('chatgpt-tags', JSON.stringify(savedTags));
        }

        function renderList() {
            ul.innerHTML = '';
            tagList.innerHTML = '';

            const filter = searchInput.value.toLowerCase();

            chats.forEach(chat => {
                const li = document.createElement('li');
                li.style.marginBottom = '8px';

                if (!savedTags[chat.id]) savedTags[chat.id] = [];

                const isVisible = !filter || chat.title.toLowerCase().includes(filter) || savedTags[chat.id].some(t => t.name.toLowerCase().includes(filter));
                if (!isVisible) return;

                const wrapper = document.createElement('div');
                wrapper.style.display = 'flex';
                wrapper.style.alignItems = 'center';
                wrapper.style.gap = '8px';

                const tags = document.createElement('div');
                tags.style.display = 'flex';
                tags.style.gap = '4px';

                savedTags[chat.id].forEach(tag => {
                    const span = document.createElement('span');
                    span.innerText = tag.name;
                    Object.assign(span.style, {
                        background: tag.color,
                        color: '#fff',
                        padding: '2px 6px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        cursor: 'pointer'
                    });
                    span.title = 'Clique para remover';
                    span.addEventListener('click', () => {
                        savedTags[chat.id] = savedTags[chat.id].filter(t => t.name !== tag.name);
                        saveTags();
                        renderList();
                    });
                    tags.appendChild(span);
                });

                const link = document.createElement('a');
                link.href = chat.link;
                link.innerText = chat.title;
                Object.assign(link.style, {
                    color: 'var(--text-primary)',
                    textDecoration: 'none',
                    background: 'var(--button-secondary-background, #333)',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    flex: '1',
                    transition: 'background 0.2s'
                });

                link.addEventListener('mouseover', () => {
                    link.style.background = 'var(--button-secondary-hover, #444)';
                });
                link.addEventListener('mouseout', () => {
                    link.style.background = 'var(--button-secondary-background, #333)';
                });
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.location.href = chat.link;
                });

                const addTag = document.createElement('button');
                addTag.innerText = '+';
                Object.assign(addTag.style, {
                    background: 'var(--button-secondary-background)',
                    border: '1px solid var(--border-color, #444)',
                    color: 'var(--text-primary)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    padding: '2px 6px',
                    fontSize: '12px'
                });

                addTag.title = 'Adicionar categoria';
                addTag.addEventListener('click', () => {
                    const name = prompt('Nome da categoria:');
                    if (!name) return;
                    const color = prompt('Cor HEX (#ff0000) ou deixe vazio para aleatória:') || COLORS[Math.floor(Math.random() * COLORS.length)];
                    savedTags[chat.id].push({ name, color });
                    saveTags();
                    renderList();
                });

                wrapper.appendChild(tags);
                wrapper.appendChild(link);
                wrapper.appendChild(addTag);
                li.appendChild(wrapper);
                ul.appendChild(li);
            });

            const allTags = {};
            Object.values(savedTags).forEach(list => {
                list.forEach(tag => {
                    allTags[tag.name] = tag.color;
                });
            });

            Object.entries(allTags).forEach(([name, color]) => {
                const span = document.createElement('span');
                span.innerText = name;
                Object.assign(span.style, {
                    background: color,
                    color: '#fff',
                    padding: '2px 6px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    cursor: 'pointer'
                });
                span.title = 'Clique para filtrar';
                span.addEventListener('click', () => {
                    searchInput.value = name;
                    renderList();
                });
                tagList.appendChild(span);
            });
        }

        searchInput.addEventListener('input', renderList);

        renderList();
        return box;
    }
})();