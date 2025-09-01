// ==UserScript==
// @name         CG Barra de Índice PRO 🔥 + Ocultar IA
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  Índice + UP/DOWN + Favoritos + Fonte + Tema automático + WhatsApp Suporte + Drag + Ocultar respostas da IA
// @match        https://chat.openai.com/*
// @match        https://chatgpt.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const STORAGE_POS = 'barraMultiPos';
    const STORAGE_FAVS = 'barraMultiFavs';
    const STORAGE_FONTE = 'barraMultiFonte';

    let mensagens = [];
    let atualIndex = 0;
    let favoritos = carregar(STORAGE_FAVS) || [];
    let tamanhoFonte = Number(localStorage.getItem(STORAGE_FONTE)) || 14;
    let respostasOcultas = false;

    // ========================
    // 🔥 Barra lateral
    // ========================
    const barra = document.createElement('div');
    barra.id = 'barra-multi';
    barra.style = `
        position:fixed;
        top:100px;
        right:20px;
        display:flex;
        flex-direction:column;
        gap:8px;
        z-index:9999;
        cursor:move;
    `;

    const estiloBotao = `
        width:40px;height:40px;
        background:var(--neutral-fill-rest, #eee);
        color:var(--foreground, #444);
        border-radius:10px;
        display:flex;
        justify-content:center;
        align-items:center;
        cursor:pointer;
        box-shadow:0 2px 6px rgba(0,0,0,0.3);
        transition:all 0.2s;
    `;

    function criarBotao(icone, titulo, onClick) {
        const btn = document.createElement('div');
        btn.innerHTML = icone;
        btn.title = titulo;
        btn.style = estiloBotao;
        btn.onmouseenter = ()=>btn.style.background='var(--button-secondary-hover, #ddd)';
        btn.onmouseleave = ()=>btn.style.background='var(--neutral-fill-rest, #eee)';
        if (onClick) btn.onclick = onClick;
        return btn;
    }

    const btnIndice = criarBotao('📑','Índice de Perguntas');
    const btnUp = criarBotao('⬆️','Pergunta Anterior',()=>navegar(-1));
    const btnDown = criarBotao('⬇️','Próxima Pergunta',()=>navegar(1));
    const btnOcultar = criarBotao('🙈','Ocultar/Mostrar Respostas',()=>toggleRespostas());
    const btnConfig = criarBotao('⚙️','Configurações',()=>toggleConfig());

    barra.append(btnIndice, btnUp, btnDown, btnOcultar, btnConfig);
    document.body.appendChild(barra);

    const pos = carregar(STORAGE_POS);
    if(pos){
        barra.style.top = pos.top;
        barra.style.left = pos.left;
        barra.style.right = 'auto';
    }

    // ========================
    // 📑 Caixa do índice
    // ========================
    const caixa = document.createElement('div');
    caixa.style = `
        position:fixed;
        top:100px;
        right:80px;
        min-width:280px;
        max-height:80vh;
        background:var(--background, #fff);
        color:var(--foreground, #000);
        border-radius:10px;
        box-shadow:0 4px 10px rgba(0,0,0,0.4);
        overflow:auto;
        display:none;
        flex-direction:column;
        z-index:9999;
        resize:both;
        cursor:move;
    `;

    const header = document.createElement('div');
    header.style = `
        position:sticky;
        top:0;
        background:inherit;
        display:flex;
        align-items:center;
        justify-content:space-between;
        padding:8px 12px;
        font-weight:bold;
    `;
    header.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;">
        <span>📑 Índice</span>
        <button id="btnAumentar" style="border:none;background:#ccc;padding:2px 6px;border-radius:6px;cursor:pointer;">A+</button>
        <button id="btnDiminuir" style="border:none;background:#ccc;padding:2px 6px;border-radius:6px;cursor:pointer;">A-</button>
      </div>
      <span style="cursor:pointer;">❌</span>
    `;
    header.querySelector('span:last-child').onclick = ()=>caixa.style.display='none';
    caixa.appendChild(header);
    document.body.appendChild(caixa);

    // ========================
    // ⚙️ Caixa de Configurações
    // ========================
    const caixaConfig = document.createElement('div');
    caixaConfig.style = `
        position:fixed;
        top:100px;
        right:80px;
        min-width:260px;
        background:var(--background, #fff);
        color:var(--foreground, #000);
        border-radius:10px;
        box-shadow:0 4px 10px rgba(0,0,0,0.4);
        padding:10px;
        display:none;
        flex-direction:column;
        z-index:9999;
        cursor:move;
    `;
    caixaConfig.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <strong>⚙️ Configurações</strong>
        <span style="cursor:pointer;">❌</span>
      </div>
      <div style="margin:8px 0;">
        <strong>WhatsApp:</strong><br>
        <a href="https://wa.me/5575988122689?text=%23Suporte%20VH%3A" target="_blank" style="color:var(--link-color,#2e89ff);text-decoration:underline;">+55 75 9881-22689</a><br>
        <small>#Suporte VH</small>
      </div>
    `;
    caixaConfig.querySelector('span:last-child').onclick = ()=>caixaConfig.style.display='none';
    document.body.appendChild(caixaConfig);

    // ========================
    // 🔤 Aumentar/diminuir fonte
    // ========================
    document.getElementById('btnAumentar').onclick = ()=>{
        tamanhoFonte = Math.min(tamanhoFonte+1,24);
        localStorage.setItem(STORAGE_FONTE,tamanhoFonte);
        gerarLista();
    };
    document.getElementById('btnDiminuir').onclick = ()=>{
        tamanhoFonte = Math.max(tamanhoFonte-1,10);
        localStorage.setItem(STORAGE_FONTE,tamanhoFonte);
        gerarLista();
    };

    // ========================
    // 📜 Geração da Lista
    // ========================
    function gerarLista(){
        caixa.querySelectorAll('a').forEach(a=>a.remove());
        mensagens = [...document.querySelectorAll('div[data-message-author-role="user"]')];

        mensagens.forEach((msg,i)=>{
            const link = document.createElement('a');
            const texto = msg.innerText.replace(/\n/g,' ').slice(0,70);
            link.href='#';
            link.style = `
              display:flex;
              align-items:center;
              justify-content:space-between;
              gap:6px;
              padding:6px 10px;
              color:inherit;
              text-decoration:none;
              font-size:${tamanhoFonte}px;
              border-bottom:1px solid #ccc;
              ${favoritos.includes(i)?'font-weight:bold;':''}
            `;
            link.innerHTML = `
              <div style="display:flex;align-items:center;gap:6px;">
                <span>${i+1}.</span>
                <span>${texto}${texto.length>60?'...':''}</span>
              </div>
              <div style="cursor:pointer;">${favoritos.includes(i)?'⭐':'☆'}</div>
            `;

            link.querySelector('div:last-child').onclick=e=>{
                e.stopPropagation();e.preventDefault();
                favoritos.includes(i)?favoritos=favoritos.filter(f=>f!==i):favoritos.push(i);
                salvar(STORAGE_FAVS,favoritos);
                gerarLista();
            };
            link.onclick=e=>{
                e.preventDefault();
                atualIndex=i;
                msg.scrollIntoView({behavior:'smooth',block:'center'});
                caixa.style.display='none';
            };
            caixa.appendChild(link);
        });
    }

    // ========================
    // 🔥 Navegação
    // ========================
    function navegar(d){
        mensagens = [...document.querySelectorAll('div[data-message-author-role="user"]')];
        if(!mensagens.length) return;
        atualIndex = (atualIndex + d + mensagens.length) % mensagens.length;
        mensagens[atualIndex].scrollIntoView({behavior:'smooth',block:'center'});
    }

    // ========================
    // 🙈 Ocultar respostas da IA
    // ========================
    function toggleRespostas(){
        respostasOcultas = !respostasOcultas;
        document.querySelectorAll('div[data-message-author-role="assistant"]').forEach(el=>{
            el.style.display = respostasOcultas ? 'none' : '';
        });
    }

    // ========================
    // 🔧 Funções principais
    // ========================
    function toggleIndice(){
        if(caixa.style.display==='none'){
            gerarLista();
            caixa.style.display='flex';
        } else {
            caixa.style.display='none';
        }
    }
    function toggleConfig(){
        caixaConfig.style.display = caixaConfig.style.display==='none' ? 'flex' : 'none';
    }

    // ========================
    // 💾 LocalStorage
    // ========================
    function carregar(key){try{return JSON.parse(localStorage.getItem(key));}catch{return null;}}
    function salvar(key,val){localStorage.setItem(key,JSON.stringify(val));}

    // ========================
    // 🌓 Tema segue o ChatGPT
    // ========================
    const observer = new MutationObserver(aplicarTema);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    aplicarTema();
    function aplicarTema(){
        const dark = document.documentElement.classList.contains('dark');
        if(dark){
            caixa.style.background='#111';
            caixa.style.color='#fff';
            caixaConfig.style.background='#111';
            caixaConfig.style.color='#fff';
            barra.querySelectorAll('div').forEach(b=>b.style.background='#333');
        }else{
            caixa.style.background='#fff';
            caixa.style.color='#000';
            caixaConfig.style.background='#fff';
            caixaConfig.style.color='#000';
            barra.querySelectorAll('div').forEach(b=>b.style.background='#eee');
        }
    }

    // ========================
    // 🧲 Drag (Arrastar)
    // ========================
    tornarArrastavel(barra, pos=>salvar(STORAGE_POS,pos));
    tornarArrastavel(caixa, ()=>{});
    tornarArrastavel(caixaConfig, ()=>{});

    function tornarArrastavel(el,cb){
        let sx,sy,dx,dy;
        el.onmousedown=e=>{
            if(e.target.tagName==='BUTTON'||e.target.tagName==='A'||e.target.style.cursor==='pointer') return;
            e.preventDefault();
            sx = e.clientX;
            sy = e.clientY;
            document.onmousemove=e=>{
                dx = e.clientX - sx;
                dy = e.clientY - sy;
                sx = e.clientX;
                sy = e.clientY;
                el.style.top = (el.offsetTop + dy)+'px';
                el.style.left = (el.offsetLeft + dx)+'px';
                el.style.right = 'auto';
            };
            document.onmouseup=()=>{
                document.onmousemove = null;
                document.onmouseup = null;
                cb({top:el.style.top,left:el.style.left});
            };
        };
    }

    // ========================
    // 🚀 Inicializar
    // ========================
    btnIndice.onclick = toggleIndice;
    btnConfig.onclick = toggleConfig;

})();
