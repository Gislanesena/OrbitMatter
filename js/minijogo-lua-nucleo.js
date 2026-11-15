/**
 * Planejamento de rota na Lua. Sem DOM.
 * Números em múltiplos de u = raio de exclusão, salvo rIncertezaMetros e rExclusaoMetros.
 *
 * Parâmetros finais (os iniciais passaram em scripts/testar-minijogo.mjs):
 * preservar banda 0,70, qualidade 0,60, orçamento 9 u
 * medir banda 0,45, qualidade 0,85, orçamento 7 u
 * aproximar banda 0,25, qualidade 1,00, orçamento 5,5 u
 * risco do entorno: baixo ×1, moderado ×0,9, alto ×0,8 (cascata usa o fator do alto)
 * incerteza didática: imageada = incertezaMetros, rastreada 60 m, estimada 150 m
 * exclusão: incerteza + 120 m se fragmentado no impacto, + 40 m se inativo
 * leitura completa = 1,5 u dentro da banda; partida em (−2,4 u, 0); mapa até 2,8 u
 */
(function (factory) {
  const api = factory();
  const raiz = typeof globalThis !== "undefined" ? globalThis : this;
  raiz.MinijogoLuaNucleo = api;
  if (typeof module === "object" && module && module.exports) module.exports = api;
})(function () {
  const PERFIS = {
    preservar: { banda: 0.7, qualidade: 0.6, orcamento: 9 },
    medir: { banda: 0.45, qualidade: 0.85, orcamento: 7 },
    aproximar: { banda: 0.25, qualidade: 1, orcamento: 5.5 },
  };
  const FATOR_RISCO = { baixo: 1, moderado: 0.9, alto: 0.8, cascata: 0.8 };
  const PARTIDA = { x: -2.4, y: 0 };
  const LEITURA_COMPLETA = 1.5;
  const RAIO_VISIVEL = 2.8;
  const MAX_PONTOS = 6;

  function numero(valor, reserva) {
    const n = Number(valor);
    return Number.isFinite(n) ? n : reserva;
  }

  function cenario(artefato, perfilId, risco) {
    const coords = (artefato && artefato.coordenadas) || {};
    const confianca = coords.confianca || "estimada";
    const rIncertezaMetros = confianca === "imageada"
      ? numero(coords.incertezaMetros, 0)
      : confianca === "rastreada" ? 60 : 150;
    const folga = artefato && artefato.statusAtual === "fragmentado_no_impacto" ? 120 : 40;
    const rExclusaoMetros = rIncertezaMetros + folga;
    const perfil = PERFIS[perfilId] || PERFIS.medir;
    const fator = FATOR_RISCO[risco] != null ? FATOR_RISCO[risco] : FATOR_RISCO.moderado;
    return {
      id: artefato && artefato.id || "",
      confianca: confianca,
      statusAtual: artefato && artefato.statusAtual || "",
      rIncertezaMetros: rIncertezaMetros,
      rExclusaoMetros: rExclusaoMetros,
      u: rExclusaoMetros,
      rIncerteza: rExclusaoMetros > 0 ? rIncertezaMetros / rExclusaoMetros : 0,
      banda: perfil.banda,
      qualidade: perfil.qualidade,
      orcamento: perfil.orcamento * fator,
      fator: fator,
      partida: { x: PARTIDA.x, y: PARTIDA.y },
      leituraCompleta: LEITURA_COMPLETA,
      raioVisivel: RAIO_VISIVEL,
    };
  }

  function pontosValidos(pontos) {
    const saida = [];
    const lista = Array.isArray(pontos) ? pontos : [];
    for (let i = 0; i < lista.length && saida.length < MAX_PONTOS; i++) {
      const p = lista[i];
      if (!p || !Number.isFinite(Number(p.x)) || !Number.isFinite(Number(p.y))) continue;
      saida.push({ x: Number(p.x), y: Number(p.y) });
    }
    return saida;
  }

  function raizes(a, b, c) {
    if (Math.abs(a) < 1e-12) {
      if (Math.abs(b) < 1e-12) return [];
      const t = -c / b;
      return Number.isFinite(t) ? [t] : [];
    }
    const disc = b * b - 4 * a * c;
    if (disc < 0) return [];
    const s = Math.sqrt(disc);
    return [(-b - s) / (2 * a), (-b + s) / (2 * a)].filter((t) => Number.isFinite(t));
  }

  function cortes(ax, ay, dx, dy, raio) {
    if (!(raio > 0)) return [];
    const a2 = ax * ax + ay * ay;
    const ad = ax * dx + ay * dy;
    const d2 = dx * dx + dy * dy;
    return raizes(d2, 2 * ad, a2 - raio * raio).filter((t) => t >= -1e-9 && t <= 1 + 1e-9);
  }

  function zonaDe(raio, rIncerteza, externo) {
    if (raio < rIncerteza) return "incerteza";
    if (raio < 1) return "exclusao";
    if (raio <= externo + 1e-9) return "banda";
    return "fora";
  }

  function fatiar(ax, ay, dx, dy, rIncerteza, externo) {
    const marcas = [0, 1];
    cortes(ax, ay, dx, dy, rIncerteza).forEach((t) => marcas.push(t));
    cortes(ax, ay, dx, dy, 1).forEach((t) => marcas.push(t));
    cortes(ax, ay, dx, dy, externo).forEach((t) => marcas.push(t));
    marcas.sort((p, q) => p - q);
    const unicos = [];
    marcas.forEach((t) => {
      const limitado = Math.max(0, Math.min(1, t));
      if (!unicos.length || limitado - unicos[unicos.length - 1] > 1e-8) unicos.push(limitado);
    });
    const fatias = [];
    for (let i = 0; i < unicos.length - 1; i++) {
      const t0 = unicos[i];
      const t1 = unicos[i + 1];
      const tm = (t0 + t1) / 2;
      const raio = Math.hypot(ax + dx * tm, ay + dy * tm);
      fatias.push({ t0: t0, t1: t1, zona: zonaDe(raio, rIncerteza, externo) });
    }
    return fatias;
  }

  function avaliar(cenarioAtual, pontos) {
    const cena = cenarioAtual;
    const caminho = [cena.partida].concat(pontosValidos(pontos));
    const externo = 1 + cena.banda;
    let comprimento = 0;
    let naBanda = 0;
    let violacao = "nenhuma";
    let truncada = false;
    const amostras = [{
      x: caminho[0].x,
      y: caminho[0].y,
      s: 0,
      zona: zonaDe(Math.hypot(caminho[0].x, caminho[0].y), cena.rIncerteza, externo),
    }];
    let restante = cena.orcamento;
    const rank = { nenhuma: 0, exclusao: 1, incerteza: 2 };

    for (let i = 0; i < caminho.length - 1; i++) {
      const a = caminho[i];
      const b = caminho[i + 1];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.hypot(dx, dy);
      if (!(dist > 1e-12)) continue;
      if (restante <= 1e-9) { truncada = true; break; }
      const frac = Math.min(1, restante / dist);
      if (frac < 1) truncada = true;
      const ddx = dx * frac;
      const ddy = dy * frac;
      const fatias = fatiar(a.x, a.y, ddx, ddy, cena.rIncerteza, externo);
      fatias.forEach((fatia) => {
        const len = dist * frac * (fatia.t1 - fatia.t0);
        comprimento += len;
        if (fatia.zona === "banda") naBanda += len;
        if (fatia.zona === "incerteza" || fatia.zona === "exclusao") {
          if (rank[fatia.zona] > rank[violacao]) violacao = fatia.zona;
        }
        amostras.push({
          x: a.x + ddx * fatia.t1,
          y: a.y + ddy * fatia.t1,
          s: comprimento,
          zona: fatia.zona,
        });
      });
      restante -= dist * frac;
    }

    const ciencia = Math.round(100 * Math.min(1, naBanda / cena.leituraCompleta) * cena.qualidade);
    const seg = violacao === "incerteza" ? 10 : violacao === "exclusao" ? 50 : 100;
    const comb = cena.orcamento > 0
      ? Math.round(100 * Math.max(0, 1 - comprimento / cena.orcamento))
      : (comprimento > 0 ? 0 : 100);
    return {
      ciencia: ciencia,
      seg: seg,
      comb: comb,
      violacao: violacao,
      comprimento: comprimento,
      naBanda: naBanda,
      truncada: truncada,
      amostras: amostras,
      pontos: caminho.slice(1),
    };
  }

  function combinar(base, exec) {
    const ciencia = Math.round(0.5 * numero(base.ciencia, 0) + 0.5 * numero(exec.ciencia, 0));
    const seg = Math.round(0.5 * numero(base.seg, 0) + 0.5 * numero(exec.seg, 0));
    const comb = Math.round(0.5 * numero(base.comb, 0) + 0.5 * numero(exec.comb, 0));
    const orc = Math.round((ciencia + seg + comb) / 3);
    return { seg: seg, comb: comb, orc: orc, ciencia: ciencia };
  }

  function notaDe(metros) {
    const vals = [metros.seg, metros.comb, metros.orc, metros.ciencia];
    const media = vals.reduce((a, b) => a + b, 0) / vals.length;
    return Math.round(media * 0.7 + Math.min.apply(null, vals) * 0.3);
  }

  return {
    PERFIS: PERFIS,
    FATOR_RISCO: FATOR_RISCO,
    PARTIDA: PARTIDA,
    LEITURA_COMPLETA: LEITURA_COMPLETA,
    RAIO_VISIVEL: RAIO_VISIVEL,
    MAX_PONTOS: MAX_PONTOS,
    cenario: cenario,
    avaliar: avaliar,
    combinar: combinar,
    notaDe: notaDe,
  };
});
