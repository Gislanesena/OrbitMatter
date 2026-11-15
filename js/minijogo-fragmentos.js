/* Minijogo da casca orbital. A série, o risco e os contadores vêm de simularOrbita. */
(function () {
  const estado = {
    aberto: false,
    estrategia: null,
    fragmentos: null,
    historico: [],
    preview: null,
    quadro: 0,
    timer: 0,
    fase: "preparo",
    final: null,
  };

  function $(id) { return document.getElementById(id); }
  function tt(chave) { return window.I18n ? I18n.t(chave) : chave; }
  function nucleo() { return window.MinijogoFragmentosNucleo; }
  function turnosLigados() { return window.MINIJOGO_FRAGMENTOS_TURNOS === true; }

  function simular(parametros) {
    if (!window.AtlasJogo) throw new Error("simulador");
    return AtlasJogo.simular(parametros);
  }

  function politicaAtual() {
    return {
      lancamentos: Number($("fragLanc").value),
      remocao: Number($("fragRem").value),
    };
  }

  function ajustarTeto() {
    const N = nucleo();
    const usado = estado.historico.reduce((a, pol) => a + pol.remocao * N.ESTRATEGIAS[estado.estrategia].custo * N.CICLOS_TURNO, 0);
    const ciclos = turnosLigados() ? N.CICLOS_TURNO : N.CICLOS;
    const teto = N.tetoRemocao(estado.estrategia, usado, ciclos);
    const rem = $("fragRem");
    rem.max = String(teto);
    if (Number(rem.value) > teto) rem.value = String(teto);
    $("fragLancVal").textContent = $("fragLanc").value;
    $("fragRemVal").textContent = rem.value;
    $("fragCap").textContent = tt("frag.cap")
      .replace("{teto}", String(N.ESTRATEGIAS[estado.estrategia].teto))
      .replace("{custo}", String(N.ESTRATEGIAS[estado.estrategia].custo))
      .replace("{max}", String(teto));
  }

  function pedido(extra) {
    const pol = politicaAtual();
    return Object.assign({
      estrategia: estado.estrategia,
      fragmentos: estado.fragmentos,
      lancamentos: pol.lancamentos,
      remocao: pol.remocao,
      historico: estado.historico,
    }, extra || {});
  }

  function projetar() {
    const N = nucleo();
    ajustarTeto();
    if (turnosLigados()) estado.preview = N.projetar(simular, pedido());
    else estado.preview = N.avaliar(simular, pedido());
    if (estado.fase === "preparo") estado.quadro = estado.preview.serie.length - 1;
    pintar();
  }

  function corRisco(risco) {
    if (risco === "baixo") return "var(--good)";
    if (risco === "moderado") return "var(--warn)";
    if (risco === "alto") return "var(--bad)";
    return "var(--cascade)";
  }

  function grafico(serie, sem, ate, mostrarSem) {
    const w = 640;
    const h = 220;
    const p = 28;
    const visivel = serie.slice(0, Math.max(1, ate + 1));
    let max = 8000;
    visivel.forEach((e) => { if (e.objetos > max) max = e.objetos; });
    if (mostrarSem) sem.forEach((e) => { if (e.objetos > max) max = e.objetos; });
    const n = Math.max(serie.length, mostrarSem ? sem.length : 0, 2);
    const x = (i) => p + (i / (n - 1)) * (w - p * 2);
    const y = (v) => h - p - (v / max) * (h - p * 2);
    const faixa = (valor, cor) => '<line x1="' + p + '" y1="' + y(valor).toFixed(1) + '" x2="' + (w - p) + '" y2="' + y(valor).toFixed(1) + '" stroke="' + cor + '" stroke-width="1" stroke-dasharray="2 4"/>';
    const linha = (dados, cor, traco) => {
      const pts = dados.map((e, i) => x(i).toFixed(1) + "," + y(e.objetos).toFixed(1)).join(" ");
      return '<polyline fill="none" stroke="' + cor + '" stroke-width="2.5" stroke-linejoin="round" ' + (traco ? 'stroke-dasharray="7 5"' : "") + ' points="' + pts + '"/>';
    };
    return '<svg class="frag-chart" viewBox="0 0 ' + w + " " + h + '" role="img" aria-label="' + tt("frag.chart") + '">' +
      faixa(4000, "#ffb347") + faixa(8000, "#ff5d6c") +
      (mostrarSem ? linha(sem, "#8f99ba", true) : "") +
      linha(visivel, "#7fd8ff", false) + "</svg>";
  }

  function mostrarSem() {
    return estado.estrategia === "monitorar" || estado.fase === "revendo";
  }

  function pintar() {
    const prev = estado.preview;
    if (!prev) return;
    const N = nucleo();
    const ate = estado.fase === "executando" ? estado.quadro : prev.serie.length - 1;
    $("fragChart").innerHTML = grafico(prev.serie, prev.semAcao.serie, ate, mostrarSem());
    const ponto = prev.serie[Math.min(ate, prev.serie.length - 1)];
    const risco = $("fragRisco");
    risco.textContent = tt("frag.risk.now") + " " + (window.Jornada ? Jornada.rotuloRisco(ponto.risco) : ponto.risco);
    risco.style.color = corRisco(ponto.risco);
    const somaCols = prev.serie.slice(1, ate + 1).reduce((a, e) => a + (e.colisoes || 0), 0);
    const somaFrag = prev.serie.slice(1, ate + 1).reduce((a, e) => a + (e.fragmentosGerados || 0), 0);
    $("fragCols").textContent = tt("frag.collisions") + " " + somaCols;
    $("fragFrags").textContent = tt("frag.fragments") + " " + somaFrag;
    const turno = estado.historico.length + (estado.fase === "revendo" ? 0 : 1);
    $("fragTurno").textContent = turnosLigados()
      ? tt("frag.turn").replace("{n}", String(Math.min(turno, N.TURNOS))).replace("{total}", String(N.TURNOS))
      : tt("frag.horizon").replace("{n}", String(N.CICLOS));
    $("fragRun").hidden = estado.fase !== "preparo";
    $("fragRedo").hidden = estado.fase === "preparo" && estado.historico.length === 0;
    $("fragConfirm").hidden = estado.fase !== "revendo";
    $("fragLanc").disabled = estado.fase !== "preparo";
    $("fragRem").disabled = estado.fase !== "preparo";
    const caixa = $("fragResult");
    if (estado.fase === "revendo" && estado.final) {
      caixa.hidden = false;
      caixa.innerHTML = barras(estado.final.exec) + comparacao(estado.final);
    } else caixa.hidden = true;
  }

  function barras(exec) {
    const itens = [
      ["seg", "frag.bar.seg"],
      ["comb", "frag.bar.comb"],
      ["orc", "frag.bar.serv"],
      ["ciencia", "frag.bar.frag"],
    ];
    return '<div class="meters">' + itens.map(([k, chave]) =>
      '<div class="meter"><div class="mt"><span>' + tt(chave) + '</span><b>' + exec[k] + '</b></div><div class="bar"><i style="width:' + exec[k] + '%;background:' + (exec[k] >= 70 ? "var(--good)" : exec[k] >= 40 ? "var(--warn)" : "var(--bad)") + '"></i></div></div>'
    ).join("") + "</div>";
  }

  function comparacao(r) {
    return '<p class="muted" style="font-size:13px;margin:0">' + tt("frag.compare")
      .replace("{cj}", String(r.colisoes)).replace("{fj}", String(r.fragmentos))
      .replace("{cs}", String(r.semAcao.colisoes)).replace("{fs}", String(r.semAcao.fragmentos)) + "</p>" +
      '<p class="k-note">' + tt("frag.model") + "</p>";
  }

  function executar() {
    if (estado.fase !== "preparo" || !estado.preview) return;
    estado.fase = "executando";
    const inicio = turnosLigados() ? estado.historico.length * nucleo().CICLOS_TURNO : 0;
    const fim = estado.preview.serie.length - 1;
    estado.quadro = inicio;
    let ultimo = 0;
    const passo = (agora) => {
      if (!estado.aberto) return;
      if (agora - ultimo < 70) {
        estado.timer = requestAnimationFrame(passo);
        return;
      }
      ultimo = agora;
      estado.quadro += 1;
      pintar();
      if (estado.quadro < fim) estado.timer = requestAnimationFrame(passo);
      else concluirPasso();
    };
    estado.timer = requestAnimationFrame(passo);
  }

  function concluirPasso() {
    const N = nucleo();
    if (turnosLigados()) {
      const aplicada = estado.preview.aplicadas[estado.preview.aplicadas.length - 1];
      estado.historico.push(aplicada);
      if (estado.historico.length < N.TURNOS) {
        estado.fase = "preparo";
        projetar();
        return;
      }
      estado.final = N.avaliar(simular, {
        estrategia: estado.estrategia,
        fragmentos: estado.fragmentos,
        turnos: estado.historico,
      });
    } else {
      estado.final = estado.preview;
    }
    estado.preview = estado.final;
    estado.fase = "revendo";
    estado.quadro = estado.final.serie.length - 1;
    pintar();
  }

  function refazer() {
    cancelAnimationFrame(estado.timer);
    estado.historico = [];
    estado.final = null;
    estado.fase = "preparo";
    projetar();
  }

  function abrir(opcoes) {
    const N = nucleo();
    estado.aberto = true;
    estado.estrategia = opcoes.estrategia;
    estado.fragmentos = Number.isFinite(opcoes.fragmentos) ? opcoes.fragmentos : null;
    estado.historico = [];
    estado.final = null;
    estado.fase = "preparo";
    const pol = N.politicaEquilibrada(opcoes.estrategia);
    $("fragLanc").value = String(pol.lancamentos);
    $("fragRem").value = String(pol.remocao);
    $("minijogoFragModal").hidden = false;
    projetar();
  }

  function fechar() {
    estado.aberto = false;
    cancelAnimationFrame(estado.timer);
    const modal = $("minijogoFragModal");
    if (modal) modal.hidden = true;
  }

  function confirmar() {
    if (!estado.final || !estado.aoConfirmar) return;
    const resultado = estado.final;
    const cb = estado.aoConfirmar;
    fechar();
    cb(resultado);
  }

  function ligar() {
    if (estado.ligado) return;
    estado.ligado = true;
    $("fragLanc").addEventListener("input", () => { if (estado.fase === "preparo") projetar(); });
    $("fragRem").addEventListener("input", () => { if (estado.fase === "preparo") projetar(); });
    $("fragRun").addEventListener("click", executar);
    $("fragRedo").addEventListener("click", refazer);
    $("fragConfirm").addEventListener("click", confirmar);
  }

  document.addEventListener("DOMContentLoaded", ligar);
  if (document.readyState !== "loading") ligar();

  window.MinijogoFragmentos = {
    abrir(opcoes, aoConfirmar) {
      estado.aoConfirmar = aoConfirmar;
      abrir(opcoes);
    },
    fechar,
    redesenhar() { if (estado.aberto) pintar(); },
    barras,
    grafico,
  };
})();
