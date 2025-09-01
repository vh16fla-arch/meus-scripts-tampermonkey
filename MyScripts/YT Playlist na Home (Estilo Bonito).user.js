// ==UserScript==
// @name         YT Playlist na Home (Estilo Bonito)
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  Mostra a playlist "Assistir Mais Tarde" na home do YouTube, com estilo bonito e responsivo.
// @author       Você
// @match        https://www.youtube.com/
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function inserirPlaylist() {
        const dados = JSON.parse(localStorage.getItem('YT_Playlist_WatchLater'));
        if (!dados || dados.length === 0) {
            console.log('❌ Nenhum dado encontrado. Execute o script na página da playlist primeiro.');
            return;
        }

        // Remove se já existir para evitar duplicações
        const existente = document.querySelector('#playlist-watchlater');
        if (existente) existente.remove();

        const container = document.createElement('div');
        container.id = 'playlist-watchlater';
        container.style.padding = '16px';
        container.style.margin = '16px';
        container.style.background = 'var(--yt-spec-brand-background)';
        container.style.border = '1px solid var(--yt-spec-10-percent-layer)';
        container.style.borderRadius = '16px';
        container.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';

        const titulo = document.createElement('h2');
        titulo.textContent = '▶️ Playlist - Assistir Mais Tarde';
        titulo.style.color = 'var(--yt-spec-text-primary)';
        titulo.style.marginBottom = '16px';
        titulo.style.fontSize = '20px';
        container.appendChild(titulo);

        const grid = document.createElement('div');
        grid.style.display = 'grid';
        grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(220px, 1fr))';
        grid.style.gap = '16px';

        dados.forEach(video => {
            const card = document.createElement('div');
            card.style.border = '1px solid var(--yt-spec-10-percent-layer)';
            card.style.borderRadius = '12px';
            card.style.overflow = 'hidden';
            card.style.background = 'var(--yt-spec-general-background-a)';
            card.style.cursor = 'pointer';
            card.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease';

            // Hover effect
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'scale(1.03)';
                card.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)';
                card.style.borderColor = 'var(--yt-spec-call-to-action)';
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'scale(1)';
                card.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
                card.style.borderColor = 'var(--yt-spec-10-percent-layer)';
            });

            const link = document.createElement('a');
            link.href = `https://www.youtube.com/watch?v=${video.videoId}`;
            link.target = '_blank';
            link.style.textDecoration = 'none';
            link.style.color = 'inherit';

            const thumb = document.createElement('img');
            thumb.src = video.thumb || 'https://via.placeholder.com/320x180?text=Sem+Thumbnail';
            thumb.style.width = '100%';
            thumb.style.display = 'block';

            const texto = document.createElement('div');
            texto.style.padding = '10px';

            const tituloVideo = document.createElement('div');
            tituloVideo.textContent = video.titulo;
            tituloVideo.style.fontSize = '14px';
            tituloVideo.style.fontWeight = '500';
            tituloVideo.style.lineHeight = '1.4';
            tituloVideo.style.color = 'var(--yt-spec-text-primary)';
            tituloVideo.style.wordBreak = 'break-word';

            texto.appendChild(tituloVideo);
            link.appendChild(thumb);
            link.appendChild(texto);
            card.appendChild(link);
            grid.appendChild(card);
        });

        container.appendChild(grid);

        const interval = setInterval(() => {
            const alvo = document.querySelector('ytd-rich-grid-renderer #contents')
                        || document.querySelector('ytd-two-column-browse-results-renderer #primary');

            if (alvo) {
                alvo.prepend(container);
                console.log('🚀 Playlist adicionada na Home.');
                clearInterval(interval);
            }
        }, 500);
    }

    window.addEventListener('yt-navigate-finish', inserirPlaylist);
    inserirPlaylist();

})();
