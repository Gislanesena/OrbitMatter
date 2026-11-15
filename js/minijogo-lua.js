/**
 * Tela do planejamento de rota. A nota sai só de js/minijogo-lua-nucleo.js.
 */
(function () {
  let sessao = null;
  let quadro = 0;
  let somLigado = false;
  let audio = null;
  let ligado = false;

  function nucleo() {
    return window.MinijogoLuaNucleo;
  }
  function el(id) {
    return document.getElementById(id);
  }
  function tt(chave) {
    return window.I18n ? I18n.t(chave) : chave;
  }
  function locale() {
    return window.I18n && I18n.lang === "en" ? "en-US" : "pt-BR";
  }
  function metros(n) {
    const v = Math.round(n * 10) / 10;
    return v.toLocaleString(locale());
  }
  function hash(texto) {
    let h = 2166136261;
    const s = String(texto || "lua");
    for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
    return h >>> 0;
  }
  function aleatorio(semente) {
    let a = semente || 1;
    return function () {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function abrir(opcoes) {
    const api = nucleo();
    const modal = el("minijogoModal");
    if (!api || !modal || !opcoes || !opcoes.artefato) throw new Error("minijogo indisponível");
    sessao = {
      opcoes: opcoes,
      cena: api.cenario(opcoes.artefato, opcoes.perfil, opcoes.risco),
      pontos: [],
      arraste: -1,
      resultado: null,
      distancia: 0,
      animando: false,
      ultimo: 0,
      avisoSom: false,
    };
    modal.hidden = false;
    const confirmar = el("mjConfirm");
    if (confirmar) confirmar.hidden = true;
    textos();
    desenhar();
    requestAnimationFrame(desenhar);
    if (!ligado) {
      ligar();
      ligado = true;
    }
  }

  function fechar() {
    sessao = null;
    cancelAnimationFrame(quadro);
    const modal = el("minijogoModal");
    if (modal) modal.hidden = true;
  }

  function textos() {
    if (!sessao) return;
    const cena = sessao.cena;
    const escala = el("mjScale");
    if (escala) {
      escala.textContent = tt("moon.scale") + " 1 u = " + metros(cena.u) + " m. " + tt("moon.exclusion") + ": " + metros(cena.rExclusaoMetros) + " m.";
    }
    const titulo = el("mjTitle");
    if (titulo) titulo.textContent = tt("moon.title");
    ["mjUndo", "mjClear", "mjRun", "mjConfirm"].forEach((id) => {
      const botao = el(id);
      if (!botao) return;
      const chave = botao.getAttribute("data-i18n");
      if (chave) botao.textContent = tt(chave);
    });
    const som = el("mjSound");
    if (som) {
      som.textContent = tt(somLigado ? "moon.sound.on" : "moon.sound.off");
      som.setAttribute("aria-pressed", String(somLigado));
    }
  }

  function mundoDoEvento(evento) {
    const cv = el("mjCanvas");
    const rect = cv.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    const escala = Math.min(w, h) / 2 / sessao.cena.raioVisivel * 0.92;
    return {
      x: (evento.clientX - rect.left - w / 2) / escala,
      y: (h / 2 - (evento.clientY - rect.top)) / escala,
      escala: escala,
    };
  }

  function indicePerto(ponto) {
    const cv = el("mjCanvas");
    const rect = cv.getBoundingClientRect();
    const escala = Math.min(rect.width, rect.height) / 2 / sessao.cena.raioVisivel * 0.92;
    const limite = 18 / escala;
    let melhor = -1;
    let dist = limite;
    sessao.pontos.forEach((p, i) => {
      const d = Math.hypot(p.x - ponto.x, p.y - ponto.y);
      if (d <= dist) { dist = d; melhor = i; }
    });
    return melhor;
  }

  function invalidar() {
    sessao.resultado = null;
    sessao.animando = false;
    sessao.distancia = 0;
    cancelAnimationFrame(quadro);
    const confirmar = el("mjConfirm");
    if (confirmar) confirmar.hidden = true;
  }

  function aoPonteiro(evento) {
    if (!sessao || sessao.animando) return;
    const p = mundoDoEvento(evento);
    if (evento.type === "pointerdown") {
      if (evento.cancelable) evento.preventDefault();
      const i = indicePerto(p);
      if (i >= 0) {
        sessao.arraste = i;
        invalidar();
        el("mjCanvas").setPointerCapture(evento.pointerId);
        return;
      }
      if (sessao.pontos.length >= nucleo().MAX_PONTOS) return;
      if (Math.hypot(p.x, p.y) > sessao.cena.raioVisivel) return;
      sessao.pontos.push({ x: p.x, y: p.y });
      invalidar();
      desenhar();
      return;
    }
    if (sessao.arraste < 0) return;
    if (evento.type === "pointermove") {
      sessao.pontos[sessao.arraste] = { x: p.x, y: p.y };
      desenhar();
      return;
    }
    sessao.arraste = -1;
  }

  function executar() {
    if (!sessao || sessao.animando) return;
    sessao.resultado = nucleo().avaliar(sessao.cena, sessao.pontos);
    sessao.distancia = 0;
    sessao.animando = true;
    sessao.ultimo = 0;
    sessao.avisoSom = false;
    const confirmar = el("mjConfirm");
    if (confirmar) confirmar.hidden = true;
    quadro = requestAnimationFrame(animar);
  }

  function animar(agora) {
    if (!sessao || !sessao.animando || !sessao.resultado) return;
    const dt = Math.min(0.05, (agora - (sessao.ultimo || agora)) / 1000);
    sessao.ultimo = agora;
    const total = sessao.resultado.comprimento;
    const passo = Math.max(sessao.cena.orcamento, 0.4) / 6;
    sessao.distancia = Math.min(total, sessao.distancia + dt * passo);
    const zona = zonaEm(sessao.distancia);
    if ((zona === "exclusao" || zona === "incerteza") && !sessao.avisoSom) {
      sessao.avisoSom = true;
      tremer();
      bip();
    }
    if (zona === "fora" || zona === "banda") sessao.avisoSom = false;
    desenhar();
    if (sessao.distancia + 1e-6 < total) quadro = requestAnimationFrame(animar);
    else {
      sessao.animando = false;
      const confirmar = el("mjConfirm");
      if (confirmar) confirmar.hidden = false;
    }
  }

  function zonaEm(distancia) {
    const amostras = sessao.resultado.amostras;
    let zona = amostras[0] ? amostras[0].zona : "fora";
    for (let i = 1; i < amostras.length; i++) {
      if (amostras[i].s <= distancia + 1e-9) zona = amostras[i].zona;
    }
    return zona;
  }

  function posicaoEm(distancia) {
    const amostras = sessao.resultado.amostras;
    if (!amostras.length) return sessao.cena.partida;
    if (distancia <= 0) return amostras[0];
    for (let i = 1; i < amostras.length; i++) {
      const b = amostras[i];
      const a = amostras[i - 1];
      if (distancia <= b.s) {
        const span = b.s - a.s;
        const t = span > 1e-9 ? (distancia - a.s) / span : 1;
        return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, zona: b.zona };
      }
    }
    return amostras[amostras.length - 1];
  }

  function naBandaAte(distancia) {
    const amostras = sessao.resultado.amostras;
    let total = 0;
    for (let i = 1; i < amostras.length; i++) {
      const b = amostras[i];
      const a = amostras[i - 1];
      if (b.zona !== "banda") {
        if (b.s >= distancia) break;
        continue;
      }
      const fim = Math.min(distancia, b.s);
      const ini = a.s;
      if (fim > ini) total += fim - ini;
      if (b.s >= distancia) break;
    }
    return total;
  }

  function tremer() {
    const palco = el("mjStage");
    if (!palco) return;
    palco.classList.remove("mj-shake");
    void palco.offsetWidth;
    palco.classList.add("mj-shake");
  }

  function bip() {
    if (!somLigado) return;
    try {
      audio = audio || new AudioContext();
      const osc = audio.createOscillator();
      const ganho = audio.createGain();
      osc.frequency.value = 196;
      ganho.gain.value = 0.03;
      osc.connect(ganho);
      ganho.connect(audio.destination);
      osc.start();
      ganho.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.12);
      osc.stop(audio.currentTime + 0.13);
    } catch (erro) { /* som opcional */ }
  }

  function desenhar() {
    const cv = el("mjCanvas");
    if (!cv || !sessao) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = cv.clientWidth;
    const h = cv.clientHeight;
    if (!w || !h) return;
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) {
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
    }
    const g = cv.getContext("2d");
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cena = sessao.cena;
    const escala = Math.min(w, h) / 2 / cena.raioVisivel * 0.92;
    const cx = w / 2;
    const cy = h / 2;
    const X = (x) => cx + x * escala;
    const Y = (y) => cy - y * escala;

    g.fillStyle = "#070b14";
    g.fillRect(0, 0, w, h);
    const relevo = aleatorio(hash(cena.id));
    for (let i = 0; i < 42; i++) {
      const ang = relevo() * Math.PI * 2;
      const raio = Math.sqrt(relevo()) * 2.5;
      const tamanho = 4 + relevo() * 18;
      g.fillStyle = relevo() > 0.5 ? "rgba(18,28,48,0.9)" : "rgba(32,44,68,0.55)";
      g.beginPath();
      g.ellipse(X(Math.cos(ang) * raio), Y(Math.sin(ang) * raio), tamanho, tamanho * 0.72, ang, 0, Math.PI * 2);
      g.fill();
    }

    const externo = (1 + cena.banda) * escala;
    g.strokeStyle = "rgba(127,216,255,0.85)";
    g.lineWidth = Math.max(2, cena.banda * escala);
    g.beginPath();
    g.arc(cx, cy, escala + (externo - escala) / 2, 0, Math.PI * 2);
    g.stroke();

    g.save();
    g.beginPath();
    g.arc(cx, cy, escala, 0, Math.PI * 2);
    g.clip();
    g.strokeStyle = "rgba(255,93,108,0.45)";
    g.lineWidth = 1;
    for (let y = -escala; y <= escala; y += 7) {
      g.beginPath();
      g.moveTo(cx - escala, cy + y);
      g.lineTo(cx + escala, cy + y - 10);
      g.stroke();
    }
    g.restore();
    g.strokeStyle = "#ff5d6c";
    g.lineWidth = 1.5;
    g.setLineDash([]);
    g.beginPath();
    g.arc(cx, cy, escala, 0, Math.PI * 2);
    g.stroke();

    g.setLineDash([5, 4]);
    g.strokeStyle = "#e8ebf5";
    g.lineWidth = 1.25;
    g.beginPath();
    g.arc(cx, cy, cena.rIncerteza * escala, 0, Math.PI * 2);
    g.stroke();
    g.setLineDash([]);

    desenharHardware(g, X, Y, escala, cena, relevo);
    desenharRota(g, X, Y);
    const sonda = sondaAtual();
    g.fillStyle = "#ffb347";
    g.beginPath();
    g.arc(X(sonda.x), Y(sonda.y), 5, 0, Math.PI * 2);
    g.fill();

    atualizarHud(sonda);
  }

  function desenharHardware(g, X, Y, escala, cena, relevo) {
    if (cena.statusAtual === "fragmentado_no_impacto") {
      g.fillStyle = "#e7c27a";
      for (let i = 0; i < 9; i++) {
        const ang = relevo() * Math.PI * 2;
        const raio = relevo() * 0.22;
        g.fillRect(X(Math.cos(ang) * raio) - 2, Y(Math.sin(ang) * raio) - 1, 5, 2);
      }
      return;
    }
    g.strokeStyle = "#e7c27a";
    g.fillStyle = "#e7c27a";
    g.lineWidth = 1.5;
    g.strokeRect(X(0) - 7, Y(0) - 5, 14, 10);
    [[-10, 8], [10, 8], [0, 10]].forEach((perna) => {
      g.beginPath();
      g.moveTo(X(0), Y(0));
      g.lineTo(X(0) + perna[0], Y(0) + perna[1]);
      g.stroke();
    });
  }

  function desenharRota(g, X, Y) {
    const cores = { banda: "#5fd49a", fora: "#8f99ba", exclusao: "#ff5d6c", incerteza: "#ff5d6c" };
    const resultado = sessao.resultado;
    g.lineWidth = 2;
    if (resultado && resultado.amostras.length > 1) {
      const limite = sessao.animando || sessao.distancia > 0 ? sessao.distancia : resultado.comprimento;
      for (let i = 1; i < resultado.amostras.length; i++) {
        const b = resultado.amostras[i];
        const a = resultado.amostras[i - 1];
        if (a.s > limite) break;
        g.strokeStyle = cores[b.zona] || "#8f99ba";
        g.beginPath();
        g.moveTo(X(a.x), Y(a.y));
        g.lineTo(X(b.x), Y(b.y));
        g.stroke();
      }
      return;
    }
    const caminho = [sessao.cena.partida].concat(sessao.pontos);
    g.strokeStyle = "rgba(232,235,245,0.7)";
    g.beginPath();
    caminho.forEach((p, i) => (i ? g.lineTo(X(p.x), Y(p.y)) : g.moveTo(X(p.x), Y(p.y))));
    g.stroke();
    caminho.forEach((p, i) => {
      g.fillStyle = i === 0 ? "#7fd8ff" : "#e8ebf5";
      g.beginPath();
      g.arc(X(p.x), Y(p.y), i === 0 ? 4 : 5, 0, Math.PI * 2);
      g.fill();
    });
  }

  function sondaAtual() {
    if (sessao.resultado && (sessao.animando || sessao.distancia > 0)) return posicaoEm(sessao.distancia);
    const ultimo = sessao.pontos[sessao.pontos.length - 1];
    return ultimo || sessao.cena.partida;
  }

  function atualizarHud(sonda) {
    const cena = sessao.cena;
    const resultado = sessao.resultado;
    const percorrido = resultado ? Math.min(sessao.distancia || (sessao.animando ? 0 : resultado.comprimento), resultado.comprimento) : 0;
    const combustivel = cena.orcamento > 0 ? Math.max(0, 1 - percorrido / cena.orcamento) : 1;
    const leitura = resultado ? Math.min(1, naBandaAte(percorrido) / cena.leituraCompleta) : 0;
    const dist = Math.hypot(sonda.x, sonda.y) * cena.u;
    const barra = (id, valor) => {
      const item = el(id);
      if (item) item.style.width = Math.round(valor * 100) + "%";
    };
    barra("mjFuelBar", combustivel);
    barra("mjReadBar", leitura);
    const distEl = el("mjDist");
    if (distEl) distEl.textContent = metros(dist) + " m";
    const aviso = el("mjWarn");
    const dentro = resultado && (zonaEm(percorrido) === "exclusao" || zonaEm(percorrido) === "incerteza");
    if (aviso) aviso.hidden = !dentro;
    const fuelTxt = el("mjFuelTxt");
    if (fuelTxt) fuelTxt.textContent = Math.round(combustivel * 100) + "%";
  }

  function ligar() {
    const cv = el("mjCanvas");
    cv.addEventListener("pointerdown", aoPonteiro);
    cv.addEventListener("pointermove", aoPonteiro);
    cv.addEventListener("pointerup", aoPonteiro);
    cv.addEventListener("pointercancel", aoPonteiro);
    el("mjUndo").addEventListener("click", () => {
      if (!sessao || !sessao.pontos.length) return;
      sessao.pontos.pop();
      invalidar();
      desenhar();
    });
    el("mjClear").addEventListener("click", () => {
      if (!sessao) return;
      sessao.pontos = [];
      invalidar();
      desenhar();
    });
    el("mjRun").addEventListener("click", executar);
    el("mjConfirm").addEventListener("click", () => {
      if (!sessao || !sessao.resultado || sessao.animando) return;
      const entrega = sessao.resultado;
      const confirmar = sessao.opcoes.confirmar;
      fechar();
      if (confirmar) confirmar(entrega);
    });
    el("mjSound").addEventListener("click", () => {
      somLigado = !somLigado;
      textos();
    });
    window.addEventListener("resize", () => { if (sessao) desenhar(); });
  }

  window.MinijogoLua = {
    abrir: abrir,
    fechar: fechar,
    redesenhar: function () { textos(); if (sessao) desenhar(); },
  };
})();
