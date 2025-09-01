// ==UserScript==
// @name         YT Motivação no YouTube + Setas Navegação (Corrigido)
// @namespace    http://tampermonkey.net/
// @version      4.1
// @description  Mensagens motivacionais no YouTube com setas de navegação, funcionando com Trusted Types 🧠🔥
// @author       Você
// @match        https://www.youtube.com/
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const mensagens = [
        '🧠 Foque no que importa hoje.',
        '🚀 Pequenos passos te levam longe.',
        '💡 Pare de rolar, comece a construir.',
        '🔥 Disciplina é mais forte que motivação.',
        '✅ Você é capaz, só precisa começar.',
        '🎯 Se não for agora, quando?',
        '⏳ Seu tempo é precioso, use com sabedoria.',
        '💪 Faça por você. Seu futuro agradece.',
        '⚡ O feito é melhor que o perfeito.',
        '🛠️ Quem faz, aprende. Quem espera, perde.',
        '“A felicidade não é algo pronto. Ela vem de suas próprias ações.” — Dalai Lama',
        '“Se você quer mudar o mundo, comece por você.” — Mahatma Gandhi',
        '“O sucesso é ir de fracasso em fracasso sem perder o entusiasmo.” — Winston Churchill',
        '“Não espere por oportunidades. Crie-as.” — George Bernard Shaw',
        '“A persistência realiza o impossível.” — Provérbio Chinês',
        '“O futuro pertence àqueles que acreditam na beleza dos seus sonhos.” — Eleanor Roosevelt',
        '“Tudo parece impossível até que seja feito.” — Nelson Mandela',
        '“Foco é dizer não.” — Steve Jobs',
        '“Você perde 100% dos tiros que não dá.” — Wayne Gretzky',
        '“Seja tão bom que eles não possam te ignorar.” — Steve Martin',
        '“Não conte os dias. Faça os dias contarem.” — Muhammad Ali',
        '“A disciplina te leva onde a motivação não consegue.”',
        '“O melhor momento para plantar uma árvore foi há 20 anos. O segundo melhor é agora.” — Provérbio Chinês',
        '“Ninguém é pequeno demais para fazer a diferença.” — Greta Thunberg',
        '“A única maneira de fazer um excelente trabalho é amar o que você faz.” — Steve Jobs',
        '“A sorte favorece os persistentes.”',
        '“Quem quer, arruma um jeito. Quem não quer, arruma uma desculpa.”',
        '“Age como se fosse impossível fracassar.” — Dorothea Brande',
        '“Se você cansar, aprenda a descansar, não a desistir.” — Banksy',
        '“O sucesso não é um acidente. É trabalho duro, perseverança, aprendizado e amor pelo que você faz.” — Pelé',
    ];

    let index = 0;
    let intervalo;

    function criarCaixa() {
        const container = document.createElement('div');
        container.id = 'motivacao-youtube';
        container.style.padding = '8px 16px';
        container.style.margin = '12px';
        container.style.background = 'var(--yt-spec-brand-background)';
        container.style.border = '1px solid var(--yt-spec-10-percent-layer)';
        container.style.borderRadius = '8px';
        container.style.color = 'var(--yt-spec-text-primary)';
        container.style.fontSize = '13px';
        container.style.fontWeight = '500';
        container.style.maxWidth = '600px';
        container.style.width = '100%';
        container.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
        container.style.transition = 'opacity 0.5s ease';
        container.style.opacity = '0';
        container.style.userSelect = 'none';
        container.style.display = 'flex';
        container.style.alignItems = 'center';
        container.style.gap = '12px';
        container.style.lineHeight = '1.4';
        container.style.wordBreak = 'break-word';

        const btnVoltar = criarBotaoSVG('M15 18l-6-6 6-6', () => atualizarFrase(-1));

        const texto = document.createElement('div');
        texto.id = 'texto-motivacao';
        texto.textContent = mensagens[index];
        texto.style.flex = '1';

        const btnAvancar = criarBotaoSVG('M9 6l6 6-6 6', () => atualizarFrase(1));

        container.appendChild(btnVoltar);
        container.appendChild(texto);
        container.appendChild(btnAvancar);

        return container;
    }

    function criarBotaoSVG(pathD, onClick) {
        const btn = document.createElement('button');
        btn.style.background = 'transparent';
        btn.style.border = 'none';
        btn.style.cursor = 'pointer';
        btn.style.color = 'var(--yt-spec-text-primary)';
        btn.style.padding = '4px';
        btn.style.transition = 'transform 0.2s ease';

        btn.addEventListener('mouseenter', () => btn.style.transform = 'scale(1.2)');
        btn.addEventListener('mouseleave', () => btn.style.transform = 'scale(1)');
        btn.addEventListener('click', () => {
            onClick();
            reiniciarRotacao();
        });

        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("width", "20");
        svg.setAttribute("height", "20");
        svg.setAttribute("viewBox", "0 0 24 24");
        svg.setAttribute("fill", "none");
        svg.setAttribute("stroke", "currentColor");
        svg.setAttribute("stroke-width", "2");
        svg.setAttribute("stroke-linecap", "round");
        svg.setAttribute("stroke-linejoin", "round");

        const path = document.createElementNS(svgNS, "path");
        path.setAttribute("d", pathD);

        svg.appendChild(path);
        btn.appendChild(svg);

        return btn;
    }

    function atualizarFrase(direcao = 1) {
        index = (index + direcao + mensagens.length) % mensagens.length;
        const texto = document.getElementById('texto-motivacao');
        if (texto) {
            texto.style.opacity = '0';
            setTimeout(() => {
                texto.textContent = mensagens[index];
                texto.style.opacity = '1';
            }, 200);
        }
    }

    function iniciarRotacao() {
        intervalo = setInterval(() => {
            atualizarFrase(1);
        }, 9000);
    }

    function reiniciarRotacao() {
        clearInterval(intervalo);
        iniciarRotacao();
    }

    function posicionarCaixa(caixa) {
        const alvo = document.querySelector('ytd-rich-grid-renderer #contents')
                  || document.querySelector('ytd-two-column-browse-results-renderer #primary');

        if (alvo) {
            alvo.prepend(caixa);
            setTimeout(() => caixa.style.opacity = '1', 100);
        } else {
            console.log('❌ Não encontrou onde inserir a caixa.');
        }
    }

    function start() {
        const existente = document.querySelector('#motivacao-youtube');
        if (existente) return;

        const caixa = criarCaixa();

        const interval = setInterval(() => {
            const alvo = document.querySelector('ytd-rich-grid-renderer #contents')
                      || document.querySelector('ytd-two-column-browse-results-renderer #primary');
            if (alvo) {
                clearInterval(interval);
                posicionarCaixa(caixa);
                iniciarRotacao();
            }
        }, 500);
    }

    window.addEventListener('yt-navigate-finish', start);
    start();

})();
