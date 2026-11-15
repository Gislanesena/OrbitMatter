/**
 * Único ponto da página que fala com window.AtlasIA.
 * Se o bundle, a rede ou o modelo falharem, o jogo segue com a missão estática.
 * Nenhuma chave de API é lida ou enviada daqui.
 */
(function () {
  function doBundle(nome) {
    return window.AtlasIA && window.AtlasIA[nome];
  }

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

  function simular(parametros) {
    const vivo = garantirAtlas();
    if (!vivo) return { ok: false, problemas: ["O simulador não carregou."] };
    try {
      const resultado = vivo.simularOrbita(parametros);
      if (!resultado || resultado.ok !== true) {
        const problemas = resultado && resultado.falha && resultado.falha.problemas;
        return {
          ok: false,
          problemas: problemas && problemas.length ? problemas.slice() : ["A simulação recusou estes parâmetros."],
        };
      }
      return resultado;
    } catch (erro) {
      aviso("A simulação falhou.", erro);
      return { ok: false, problemas: ["A simulação falhou."] };
    }
  }

  function riscoFinal(serie) {
    if (!serie || !serie.length) return null;
    return serie[serie.length - 1].risco;
  }

  function completar(base, remocao) {
    return {
      objetosIniciais: base.objetosIniciais,
      lancamentosPorCiclo: base.lancamentosPorCiclo,
      remocaoAtivaPorCiclo: remocao,
      multiplicadorVelocidade: base.multiplicadorVelocidade,
      ciclos: base.ciclos,
    };
  }

  function decidirOrbita(capitulo, estrategia) {
    const tabela = doBundle("CAPITULOS");
    const remocoes = doBundle("REMOCAO_POR_ESTRATEGIA");
    const base = tabela && tabela[capitulo];
    if (!base || !remocoes || !(estrategia in remocoes)) {
      return { ok: false, problemas: ["Este capítulo não tem um cenário orbital calibrado."] };
    }
    const sem = simular(completar(base, 0));
    if (!sem.ok) return { ok: false, problemas: sem.problemas };
    const remocao = remocoes[estrategia];
    const com = simular(completar(base, remocao));
    if (!com.ok) return { ok: false, problemas: com.problemas, serieSem: sem.dados };
    return {
      ok: true,
      antes: riscoFinal(sem.dados),
      depois: riscoFinal(com.dados),
      serieSem: sem.dados,
      serieCom: com.dados,
      remocao: remocao,
      cenario: completar(base, remocao),
    };
  }

  function cenarioDoArtefato(artefato) {
    const mapa = doBundle("LUA_POR_ARTEFATO");
    const niveis = doBundle("LUA_POR_NIVEL");
    const chave = (mapa && artefato && mapa[artefato.id]) || "moderado";
    return niveis && niveis[chave];
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
    const cenario = cenarioDoArtefato(artefato);
    const serie = cenario ? simular(cenario) : { ok: false, problemas: ["O cenário lunar não carregou."] };
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
      const vivoAtlas = cenario && garantirAtlas();
      if (vivoAtlas) {
        try {
          const jogada = await vivoAtlas.abrirJogada({
            artefatoId: artefato.id,
            tipoObjeto: "artefato",
            local: artefato.local,
            orbita: cenario,
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
    limites: function () { return doBundle("LIMITES"); },
    modelo: function () { return doBundle("MODELO"); },
    predefinicoes: function () { return doBundle("PREDEFINICOES"); },
    riscos: function () { return doBundle("RISCOS_ORBITAIS"); },
  };
})();
