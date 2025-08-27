// ==UserScript==
// @name         Script Mestre
// @namespace    http://seudominio.com/
// @version      1.0
// @description  Script Mestre para instalar outros scripts
// @author       Seu Nome
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    // Lista de scripts individuais (placeholder)
    const scripts = [
        'LINK_SCRIPT1.user.js',
        'LINK_SCRIPT2.user.js',
        'LINK_SCRIPT3.user.js'
    ];

    scripts.forEach(url => {
        const s = document.createElement('script');
        s.src = url;
        document.body.appendChild(s);
    });

    alert("Script mestre instalado e rodando!");
})();
