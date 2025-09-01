// ==UserScript==
// @name         YT Captura Assistir Mais Tarde (Atualizado 2025)
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Captura vídeos da playlist 'Assistir mais tarde' e salva no localStorage (Atualizado Junho 2025)
// @author       VH
// @match        https://www.youtube.com/playlist?list=WL
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function capturarPlaylist() {
        const videos = [];
        const itens = document.querySelectorAll('ytd-playlist-video-renderer, ytd-playlist-panel-video-renderer');

        if (itens.length === 0) {
            alert('❌ Nenhum item encontrado. Verifique se a página carregou completamente.');
            console.log('❌ Nenhum item encontrado. Seletor falhou.');
            return;
        }

        itens.forEach(item => {
            const link = item.querySelector('a#thumbnail');
            const thumb = link?.querySelector('img')?.src || '';
            const titulo = item.querySelector('#video-title')?.innerText.trim() || 'Sem título';
            const url = link?.href || '';
            const videoId = url.includes('v=') ? url.split('v=')[1].split('&')[0] : '';

            if (videoId) {
                videos.push({
                    videoId,
                    titulo,
                    thumb
                });
            }
        });

        localStorage.setItem('YT_Playlist_WatchLater', JSON.stringify(videos));
        alert(`✅ Playlist salva com ${videos.length} vídeo(s).`);
        console.log('📦 Dados capturados:', videos);
    }

    window.addEventListener('load', () => {
        setTimeout(capturarPlaylist, 3000); // Espera 3 segundos para garantir carregamento
    });
})();
