/**
 * Único ponto da página que fala com window.AtlasIA.
 * Se o bundle, a rede ou o modelo falharem, o jogo segue com a missão estática.
 * Nenhuma chave de API é lida ou enviada daqui.
 */
(function () {
  const CENARIO_TERRA = {
    objetosIniciais: 2000,
    lancamentosPorCiclo: 6,
    remocaoAtivaPorCiclo: 0,
    multiplicadorVelocidade: 1,
    ciclos: 40,
  };
  const CENARIO_LUA = {
    objetosIniciais: 180,
    lancamentosPorCiclo: 1,
    remocaoAtivaPorCiclo: 2,
    multiplicadorVelocidade: 1,
    ciclos: 24,
  };
  const REMOCAO = { desvio: 0, monitorar: 0, desorbitar: 18, remocao: 30 };

  let atlas = null;
  let cacheMissoes = null;

  function aviso(texto, erro) {
    console.warn(texto, erro || "");
  }

  function garantirAtlas() {
    if (atlas) return atlas;
    try {
      if (!window.AtlasIA || typeof window.AtlasIA.criarAtlas !== "function") return null;
      atlas = window.AtlasIA.criarAtlas();
      return atlas;
    } catch (erro) {
      aviso("O bundle do atlas não iniciou.", erro);
      atlas = null;
      return null;
    }
  }

  function lerArtefatos() {
    const vivo = garantirAtlas();
    if (vivo) {
      try {
        const lista = vivo.listarArtefatos();
        if (lista && lista.length) return lista;
      } catch (erro) {
        aviso("O catálogo do bundle falhou.", erro);
      }
    }
    return window.ARTEFATOS_RESERVA || [];
  }

  function incorporar(OBJECTS, counters) {
    if (OBJECTS.some((item) => item.type === "artefato")) return;
    lerArtefatos().forEach((dados, indice) => {
      counters.artefato = indice + 1;
      OBJECTS.push({
        id: dados.id,
        type: "artefato",
        body: "lua",
        surface: true,
        name: dados.missao,
        nomeOriginal: dados.nomeOriginal,
        codigo: "A-" + String(indice + 1).padStart(2, "0"),
        lat: dados.coordenadas.latitudeGraus,
        lon: dados.coordenadas.longitudeLesteGraus,
        dados: dados,
      });
    });
  }

  function limitar(parcial) {
    const base = {
      objetosIniciais: 0,
      lancamentosPorCiclo: 0,
      remocaoAtivaPorCiclo: 0,
      multiplicadorVelocidade: 1,
      ciclos: 1,
    };
    const pedido = Object.assign(base, parcial || {});
    pedido.objetosIniciais = Math.max(0, Math.min(50000, Math.round(pedido.objetosIniciais)));
    pedido.lancamentosPorCiclo = Math.max(0, Math.min(60, Math.round(pedido.lancamentosPorCiclo)));
    pedido.remocaoAtivaPorCiclo = Math.max(0, Math.min(60, Math.round(pedido.remocaoAtivaPorCiclo)));
    pedido.multiplicadorVelocidade = Math.max(0.5, Math.min(3, Number(pedido.multiplicadorVelocidade) || 1));
    pedido.ciclos = Math.max(1, Math.min(100, Math.round(pedido.ciclos)));
    return pedido;
  }

  function simular(parametros) {
    const vivo = garantirAtlas();
    if (!vivo) return { ok: false, aviso: "O simulador não carregou." };
    try {
      const resultado = vivo.simularOrbita(limitar(parametros));
      if (!resultado || !resultado.ok) {
        return { ok: false, aviso: "A simulação recusou estes parâmetros." };
      }
      return resultado;
    } catch (erro) {
      aviso("A simulação falhou.", erro);
      return { ok: false, aviso: "A simulação falhou." };
    }
  }

  function riscoFinal(serie) {
    if (!serie || !serie.length) return null;
    return serie[serie.length - 1].risco;
  }

  function decidirOrbita(estrategia, antecedencia) {
    const antes = simular(CENARIO_TERRA);
    if (!antes.ok) return { ok: false, aviso: antes.aviso || "Simulação indisponível." };
    const riscoAntes = riscoFinal(antes.dados);
    const lead = Math.max(1, Math.min(10, Math.round(Number(antecedencia) || 1)));
    const ciclos = CENARIO_TERRA.ciclos;
    const atraso = Math.round(((10 - lead) / 9) * (ciclos - 1));
    const remocao = REMOCAO[estrategia] || 0;
    if (!remocao) return { ok: true, antes: riscoAntes, depois: riscoAntes };
    const noInicio = antes.dados[Math.min(atraso, antes.dados.length - 1)];
    const depois = simular({
      objetosIniciais: noInicio.objetos,
      lancamentosPorCiclo: CENARIO_TERRA.lancamentosPorCiclo,
      remocaoAtivaPorCiclo: remocao,
      multiplicadorVelocidade: 1,
      ciclos: Math.max(1, ciclos - atraso),
    });
    if (!depois.ok) {
      return {
        ok: true,
        antes: riscoAntes,
        depois: riscoAntes,
        aviso: "A ação não entrou na simulação. A nota usa o risco sem remoção.",
      };
    }
    return { ok: true, antes: riscoAntes, depois: riscoFinal(depois.dados) };
  }

  function nivelDe(risco) {
    if (risco === "baixo" || risco === "alto") return risco;
    if (risco === "cascata") return "alto";
    return "moderado";
  }

  async function cachePronto() {
    if (cacheMissoes !== null) return cacheMissoes;
    try {
      const resposta = await fetch("dados-missoes.json");
      cacheMissoes = resposta.ok ? await resposta.json() : false;
    } catch (erro) {
      aviso("dados-missoes.json não carregou.", erro);
      cacheMissoes = false;
    }
    return cacheMissoes;
  }

  async function aoVivo(artefato, nivel) {
    const url = window.GAME_MASTER_URL;
    if (!url) return null;
    const controle = new AbortController();
    const timer = setTimeout(() => controle.abort(), 8000);
    try {
      const resposta = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          artefatoId: artefato.id,
          tipoObjeto: "artefato",
          local: artefato.local,
          nivelRisco: nivel,
        }),
        signal: controle.signal,
      });
      if (!resposta.ok) return null;
      const corpo = await resposta.json();
      const dados = corpo.dados || corpo;
      if (!dados.missao || !dados.missao.opcoes) return null;
      return { origem: dados.origem || "modelo", missao: dados.missao, aviso: dados.aviso || null };
    } catch (erro) {
      aviso("O endereço do Game Master não respondeu.", erro);
      return null;
    } finally {
      clearTimeout(timer);
    }
  }

  function pacote(origem, missao, aviso, orb, nivel) {
    return {
      ok: true,
      origem: origem,
      nivel: nivel,
      risco: orb.risco,
      missao: missao,
      aviso: aviso || null,
    };
  }

  async function jogadaLua(artefato, lang) {
    const serie = simular(CENARIO_LUA);
    const orb = serie.ok
      ? { risco: riscoFinal(serie.dados) || "moderado" }
      : { risco: "moderado" };
    const nivel = nivelDe(orb.risco);
    const avisoSim = serie.ok ? null : "O cenário lunar não rodou. O risco exibido é moderado, só para não travar o capítulo.";

    if (lang !== "en") {
      const vivo = await aoVivo(artefato, nivel);
      if (vivo) return pacote(vivo.origem, vivo.missao, vivo.aviso, orb, nivel);
      const cache = await cachePronto();
      const salvo = cache && cache.missoes && cache.missoes[artefato.id] && cache.missoes[artefato.id][nivel];
      if (salvo && salvo.ok && salvo.missao) {
        return pacote(salvo.origem || "reserva", salvo.missao, salvo.aviso || avisoSim, orb, nivel);
      }
      const vivoAtlas = garantirAtlas();
      if (vivoAtlas) {
        try {
          const jogada = await vivoAtlas.abrirJogada({
            artefatoId: artefato.id,
            tipoObjeto: "artefato",
            local: artefato.local,
            orbita: CENARIO_LUA,
          });
          if (jogada && jogada.ok && jogada.dados && jogada.dados.missao) {
            return pacote(
              jogada.dados.origem,
              jogada.dados.missao,
              jogada.dados.aviso || avisoSim,
              { risco: jogada.dados.riscoOrbital || orb.risco },
              jogada.dados.nivelRisco || nivel,
            );
          }
        } catch (erro) {
          aviso("abrirJogada falhou.", erro);
        }
      }
    }

    const missao = window.Jornada.missaoPadrao(artefato, nivel, lang === "en" ? "en" : "pt");
    const avisoPadrao = lang === "en"
      ? "The model prompt is Portuguese only, so this chapter uses the standard mission and the catalog fields."
      : "Missão padrão montada com o catálogo. O modelo não entrou nesta jogada.";
    return pacote("estatica", missao, avisoSim || avisoPadrao, orb, nivel);
  }

  window.AtlasJogo = {
    incorporar: incorporar,
    simular: simular,
    decidirOrbita: decidirOrbita,
    jogadaLua: jogadaLua,
  };
})();
