/**
 * Contenção da cascata orbital. Sem DOM. Didático: não prevê órbitas reais.
 *
 * Parâmetros finais (scripts/testar-minijogo-fragmentos.mjs):
 * NBASE 6400, LANCAMENTOS_ALVO 6, ORC_REMOCAO 2400, PADRAO_FRAGMENTOS 0
 * horizonte 40 ciclos, velocidade 1,0
 * remocao teto 60 custo 1,0 · desorbitar teto 30 custo 0,6
 * monitorar teto 15 custo 0,5 · desvio teto 0 (não reduz fragmentos)
 */
(function (factory) {
  const api = factory();
  const raiz = typeof globalThis !== "undefined" ? globalThis : this;
  raiz.MinijogoFragmentosNucleo = api;
  if (typeof module === "object" && module && module.exports) module.exports = api;
})(function () {
  const NBASE = 6400;
  const LANCAMENTOS_ALVO = 6;
  const ORC_REMOCAO = 2400;
  const PADRAO_FRAGMENTOS = 0;
  const CICLOS = 40;
  const TURNOS = 5;
  const CICLOS_TURNO = 8;
  const VELOCIDADE = 1;
  const TETO_POPULACAO = 50000;
  const LIMIARES = { moderado: 4000, alto: 8000 };
  const LIMITES = {
    objetosIniciais: { min: 0, max: 50000, step: 1 },
    lancamentosPorCiclo: { min: 0, max: 60, step: 1 },
    remocaoAtivaPorCiclo: { min: 0, max: 60, step: 1 },
    multiplicadorVelocidade: { min: 0.5, max: 3, step: 0.1 },
    ciclos: { min: 1, max: 100, step: 1 },
  };
  const ESTRATEGIAS = {
    remocao: { teto: 60, custo: 1 },
    desorbitar: { teto: 30, custo: 0.6 },
    monitorar: { teto: 15, custo: 0.5 },
    desvio: { teto: 0, custo: 0 },
  };
  const PONTOS = { baixo: 100, moderado: 70, alto: 35, cascata: 0 };
  const ORDEM = ["baixo", "moderado", "alto", "cascata"];
  const CLIENTE = "Rede Nimbus";

  function inteiro(n, faixa) {
    const v = Math.round(Number(n));
    if (!Number.isFinite(v)) return faixa.min;
    return Math.min(faixa.max, Math.max(faixa.min, v));
  }

  function lerFicha(ficha) {
    const nome = ficha && typeof ficha.nome === "string" ? ficha.nome : "";
    const origem = ficha && typeof ficha.origem === "string" ? ficha.origem : "";
    const riscos = ficha && typeof ficha.riscos === "string" ? ficha.riscos : "";
    const permanencia = ficha && typeof ficha.permanencia === "string" ? ficha.permanencia : "";
    const texto = [origem, riscos, permanencia].filter(Boolean).join(" ");
    const evento = nome.match(/\(([^)]+)\)/);
    const data = texto.match(/\d{1,2} de [a-zà-ú]+ de (\d{4})/i);
    const anoSolto = texto.match(/\b(?:19|20)\d{2}\b/);
    const ano = data ? data[1] : anoSolto ? anoSolto[0] : null;
    const contagem = texto.match(/(\d{1,3}(?:\.\d{3})+|\d+)\s+(?:fragmentos\s+)?catalogados/i);
    const fragmentos = contagem ? Number(contagem[1].replace(/\./g, "")) : null;
    return {
      nome: evento ? evento[1] : null,
      data: data ? data[0] : null,
      ano,
      fragmentos: Number.isFinite(fragmentos) ? fragmentos : null,
      origem: origem || null,
      fonte: null,
    };
  }

  function objetosDe(fragmentos) {
    const extra = Number.isFinite(fragmentos) ? fragmentos : PADRAO_FRAGMENTOS;
    return inteiro(NBASE + extra, LIMITES.objetosIniciais);
  }

  function tetoRemocao(estrategia, usado, ciclos) {
    const est = ESTRATEGIAS[estrategia];
    if (!est) return 0;
    const horizonte = ciclos || CICLOS;
    const restante = Math.max(0, ORC_REMOCAO - (Number(usado) || 0));
    const peloOrcamento = est.custo > 0 ? Math.floor(restante / (est.custo * horizonte)) : 0;
    return Math.min(est.teto, LIMITES.remocaoAtivaPorCiclo.max, Math.max(0, peloOrcamento));
  }

  function limitarPolitica(estrategia, lancamentos, remocao, usado, ciclos) {
    return {
      lancamentos: inteiro(lancamentos, LIMITES.lancamentosPorCiclo),
      remocao: inteiro(remocao, { min: 0, max: tetoRemocao(estrategia, usado, ciclos), step: 1 }),
    };
  }

  function politicaEquilibrada(estrategia) {
    const teto = tetoRemocao(estrategia, 0, CICLOS);
    return limitarPolitica(
      estrategia,
      Math.round(LANCAMENTOS_ALVO * 0.85),
      Math.round(teto * 0.5),
      0,
      CICLOS
    );
  }

  function abaixo(risco) {
    const i = ORDEM.indexOf(risco);
    if (i <= 0) return "baixo";
    return ORDEM[i - 1];
  }

  function pontosDe(risco, estrategia) {
    const nivel = estrategia === "desvio" ? abaixo(risco) : risco;
    return PONTOS[nivel] || 0;
  }

  function pior(serie) {
    let indice = 0;
    for (const estado of serie) {
      const i = ORDEM.indexOf(estado.risco);
      if (i > indice) indice = i;
    }
    return ORDEM[indice];
  }

  function parametros(objetos, lancamentos, remocao, ciclos) {
    return {
      objetosIniciais: inteiro(objetos, LIMITES.objetosIniciais),
      lancamentosPorCiclo: inteiro(lancamentos, LIMITES.lancamentosPorCiclo),
      remocaoAtivaPorCiclo: inteiro(remocao, LIMITES.remocaoAtivaPorCiclo),
      multiplicadorVelocidade: VELOCIDADE,
      ciclos: inteiro(ciclos, LIMITES.ciclos),
    };
  }

  function serieDe(resposta) {
    if (!resposta || resposta.ok !== true || !Array.isArray(resposta.dados) || resposta.dados.length === 0) {
      const detalhe = resposta && resposta.problemas ? resposta.problemas.join("; ") : "simulacao recusada";
      throw new Error(detalhe);
    }
    return resposta.dados;
  }

  function somar(serie, pularInicial) {
    let colisoes = 0;
    let fragmentos = 0;
    for (let i = pularInicial ? 1 : 0; i < serie.length; i++) {
      colisoes += serie[i].colisoes || 0;
      fragmentos += serie[i].fragmentosGerados || 0;
    }
    return { colisoes, fragmentos };
  }

  function encadear(simular, base, turnos) {
    const n = turnos || TURNOS;
    let objetos = base.objetosIniciais;
    let serie = [];
    let colisoes = 0;
    let fragmentos = 0;
    const fins = [];
    let estourou = false;
    for (let t = 0; t < n; t++) {
      if (objetos > TETO_POPULACAO) {
        estourou = true;
        objetos = TETO_POPULACAO;
      }
      const pedaco = serieDe(simular(parametros(objetos, base.lancamentosPorCiclo, base.remocaoAtivaPorCiclo, CICLOS_TURNO)));
      const novos = t === 0 ? pedaco : pedaco.slice(1);
      if (t > 0 && pedaco.length > 1) {
        const soma = somar(pedaco, true);
        colisoes += soma.colisoes;
        fragmentos += soma.fragmentos;
      } else {
        const soma = somar(pedaco, true);
        colisoes += soma.colisoes;
        fragmentos += soma.fragmentos;
      }
      serie = serie.concat(novos);
      const fim = pedaco[pedaco.length - 1];
      fins.push(fim.risco);
      objetos = fim.objetos;
    }
    return { serie, colisoes, fragmentos, fins, estourou, objetos };
  }

  function custoUsado(estrategia, remocao, ciclos) {
    const est = ESTRATEGIAS[estrategia];
    const bruto = remocao * est.custo * ciclos;
    return Math.round(bruto * 10) / 10;
  }

  function projetar(simular, pedido) {
    const estrategia = pedido.estrategia;
    if (!ESTRATEGIAS[estrategia]) throw new Error("estrategia");
    const padrao = !Number.isFinite(pedido.fragmentos);
    const objetos = objetosDe(padrao ? null : pedido.fragmentos);
    const historico = Array.isArray(pedido.historico) ? pedido.historico : [];
    const atual = limitarPolitica(estrategia, pedido.lancamentos, pedido.remocao, 0, CICLOS_TURNO);
    const politicas = historico.concat([atual]).slice(0, TURNOS);
    let objetosTurno = objetos;
    let serie = [];
    let colisoes = 0;
    let fragmentos = 0;
    let usado = 0;
    const aplicadas = [];
    const fins = [];
    for (let t = 0; t < politicas.length; t++) {
      if (objetosTurno > TETO_POPULACAO) objetosTurno = TETO_POPULACAO;
      const pol = limitarPolitica(estrategia, politicas[t].lancamentos, politicas[t].remocao, usado, CICLOS_TURNO);
      aplicadas.push(pol);
      const pedaco = serieDe(simular(parametros(objetosTurno, pol.lancamentos, pol.remocao, CICLOS_TURNO)));
      const soma = somar(pedaco, true);
      colisoes += soma.colisoes;
      fragmentos += soma.fragmentos;
      serie = serie.concat(t === 0 ? pedaco : pedaco.slice(1));
      const fim = pedaco[pedaco.length - 1];
      fins.push(fim.risco);
      objetosTurno = fim.objetos;
      usado += custoUsado(estrategia, pol.remocao, CICLOS_TURNO);
    }
    const sem = serieDe(simular(parametros(objetos, LANCAMENTOS_ALVO, 0, CICLOS)));
    const semSoma = somar(sem, true);
    return {
      objetosIniciais: objetos,
      padrao,
      aplicadas,
      serie,
      colisoes,
      fragmentos,
      usado,
      fins,
      riscoInicial: serie[0].risco,
      riscoFinal: serie[serie.length - 1].risco,
      semAcao: { riscoFinal: sem[sem.length - 1].risco, colisoes: semSoma.colisoes, fragmentos: semSoma.fragmentos, serie: sem },
    };
  }

  function avaliar(simular, pedido) {
    const estrategia = pedido.estrategia;
    if (!ESTRATEGIAS[estrategia]) throw new Error("estrategia");
    const padrao = !Number.isFinite(pedido.fragmentos);
    const objetos = objetosDe(padrao ? null : pedido.fragmentos);
    const politicas = Array.isArray(pedido.turnos) && pedido.turnos.length === TURNOS ? pedido.turnos : null;
    const continua = politicas
      ? null
      : limitarPolitica(estrategia, pedido.lancamentos, pedido.remocao, 0, CICLOS);

    let serie;
    let colisoes;
    let fragmentos;
    let politica;
    let fins = null;
    let usado = 0;

    if (politicas) {
      let objetosTurno = objetos;
      serie = [];
      colisoes = 0;
      fragmentos = 0;
      fins = [];
      const aplicadas = [];
      for (let t = 0; t < TURNOS; t++) {
        if (objetosTurno > TETO_POPULACAO) objetosTurno = TETO_POPULACAO;
        const pol = limitarPolitica(estrategia, politicas[t].lancamentos, politicas[t].remocao, usado, CICLOS_TURNO);
        aplicadas.push(pol);
        const pedaco = serieDe(simular(parametros(objetosTurno, pol.lancamentos, pol.remocao, CICLOS_TURNO)));
        const soma = somar(pedaco, true);
        colisoes += soma.colisoes;
        fragmentos += soma.fragmentos;
        serie = serie.concat(t === 0 ? pedaco : pedaco.slice(1));
        const fim = pedaco[pedaco.length - 1];
        fins.push(fim.risco);
        objetosTurno = fim.objetos;
        usado += custoUsado(estrategia, pol.remocao, CICLOS_TURNO);
      }
      politica = aplicadas[aplicadas.length - 1];
      pedido = Object.assign({}, pedido, { aplicadas });
    } else {
      politica = continua;
      serie = serieDe(simular(parametros(objetos, politica.lancamentos, politica.remocao, CICLOS)));
      const soma = somar(serie, true);
      colisoes = soma.colisoes;
      fragmentos = soma.fragmentos;
      usado = custoUsado(estrategia, politica.remocao, CICLOS);
    }

    const sem = serieDe(simular(parametros(objetos, LANCAMENTOS_ALVO, 0, CICLOS)));
    const semSoma = somar(sem, true);
    const ultimo = serie[serie.length - 1];
    const riscoFinal = ultimo.risco;
    const riscoInicial = serie[0].risco;
    let seg;
    if (fins) {
      const media = fins.reduce((a, risco) => a + pontosDe(risco, estrategia), 0) / fins.length;
      seg = Math.round(media);
    } else {
      seg = Math.round(0.5 * pontosDe(riscoFinal, estrategia) + 0.5 * pontosDe(pior(serie), estrategia));
    }
    const comb = Math.round(100 * (1 - Math.min(1, usado / ORC_REMOCAO)));
    const lancamentosSoma = politicas
      ? pedido.aplicadas.reduce((a, pol) => a + pol.lancamentos * CICLOS_TURNO, 0)
      : politica.lancamentos * CICLOS;
    const orc = Math.round(100 * Math.min(1, lancamentosSoma / (LANCAMENTOS_ALVO * CICLOS)));
    let ciencia = 0;
    if (estrategia !== "desvio" && semSoma.fragmentos > 0) {
      const razao = (semSoma.fragmentos - fragmentos) / semSoma.fragmentos;
      ciencia = Math.round(100 * Math.min(1, Math.max(0, razao)));
    }
    const exec = { seg, comb, orc, ciencia };
    for (const chave of Object.keys(exec)) {
      if (!Number.isFinite(exec[chave])) throw new Error("nan");
    }
    return {
      objetosIniciais: objetos,
      padrao,
      politica,
      aplicadas: politicas ? pedido.aplicadas : null,
      riscoInicial,
      riscoFinal,
      piorRisco: pior(serie),
      colisoes,
      fragmentos,
      usado,
      serie,
      semAcao: {
        riscoFinal: sem[sem.length - 1].risco,
        colisoes: semSoma.colisoes,
        fragmentos: semSoma.fragmentos,
        serie: sem,
      },
      exec,
      limiares: LIMIARES,
    };
  }

  return {
    CLIENTE,
    NBASE,
    LANCAMENTOS_ALVO,
    ORC_REMOCAO,
    PADRAO_FRAGMENTOS,
    CICLOS,
    TURNOS,
    CICLOS_TURNO,
    LIMIARES,
    LIMITES,
    ESTRATEGIAS,
    PONTOS,
    lerFicha,
    objetosDe,
    tetoRemocao,
    limitarPolitica,
    politicaEquilibrada,
    avaliar,
    projetar,
    encadear,
    parametros,
    abaixo,
  };
});
