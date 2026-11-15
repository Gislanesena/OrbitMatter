/**
 * Textos da jornada nos dois idiomas e a conversão dos pesos da missão
 * para os quatro medidores que a tela já conhece.
 *
 * Pesos (0–3): impacto, combustivel, seguranca.
 * Medidores (0–100): seg, comb, orc, ciencia.
 * O esquema da missão não tem orçamento, então orc é a média dos outros três.
 * ciencia = impacto / 3 * 100
 * comb = (3 - combustivel) / 3 * 100   (menos combustível gasto, mais sobra)
 * seg = seguranca / 3 * 100
 */
(function () {
  const CAPITULOS = {
    pt: {
      m1: {
        title: "Estágio à deriva",
        cliente: "Equipe Aurora",
        descoberta: "A Equipe Aurora chama você para um estágio de foguete que continua em órbita da Terra.",
        briefing: "A Equipe Aurora precisa de uma decisão sobre um estágio abandonado. Investigue um estágio, feche a análise e escolha a ação. Os fatos da decisão são os do objeto que você analisar.",
        aposAnalise: "{jogador}, a análise deste estágio está fechada. A Equipe Aurora espera a decisão.",
        explain: "O que mudou nesta missão está na ficha do estágio analisado e no risco do simulador, antes e depois da ação.",
      },
      m2: {
        title: "Herança na Lua",
        cliente: "Equipe Selene",
        descoberta: "A Equipe Selene pede o que fazer com um equipamento que já está na superfície da Lua.",
        briefing: "Este capítulo não é um satélite em órbita. O alvo é um artefato do catálogo lunar, e a decisão usa a missão gerada para ele.",
        aposAnalise: "{jogador}, a ficha deste artefato está fechada. A Equipe Selene espera a decisão.",
        explain: "O retorno científico é o texto da opção escolhida. O risco mostrado é do entorno lunar didático, não uma órbita do artefato.",
      },
      m3: {
        title: "Nuvem de fragmentos",
        cliente: "Operador de constelação",
        descoberta: "Um operador de constelação pede uma decisão sobre fragmentos de um evento real.",
        briefing: "O fragmento que você analisar vem de um evento real de fragmentação. A decisão usa a ficha desse objeto, não uma nuvem genérica.",
        aposAnalise: "{jogador}, a análise deste fragmento está fechada. O operador de constelação espera a decisão.",
        explain: "O que mudou nesta missão está na ficha do fragmento analisado e no risco do simulador, antes e depois da ação.",
      },
    },
    en: {
      m1: {
        title: "Drifting stage",
        cliente: "Aurora team",
        descoberta: "The Aurora team calls you about a rocket stage that is still in Earth orbit.",
        briefing: "The Aurora team needs a decision on an abandoned stage. Investigate a stage, finish the analysis, and choose the action. The decision uses the facts of the object you analyze.",
        aposAnalise: "{jogador}, this stage analysis is closed. The Aurora team is waiting for the decision.",
        explain: "What changed in this mission comes from the analyzed stage sheet and from the simulator risk, before and after the action.",
      },
      m2: {
        title: "Heritage on the Moon",
        cliente: "Selene team",
        descoberta: "The Selene team asks what to do with hardware that is already on the lunar surface.",
        briefing: "This chapter is not an orbiting satellite. The target is an artifact from the lunar catalog, and the decision uses the mission generated for it.",
        aposAnalise: "{jogador}, this artifact sheet is closed. The Selene team is waiting for the decision.",
        explain: "The scientific return is the text of the chosen option. The risk shown is the teaching scenario around the Moon, not an orbit of the artifact.",
      },
      m3: {
        title: "Fragment cloud",
        cliente: "Constellation operator",
        descoberta: "A constellation operator asks for a decision about fragments from a real event.",
        briefing: "The fragment you analyze comes from a real fragmentation event. The decision uses that object's sheet, not a generic cloud.",
        aposAnalise: "{jogador}, this fragment analysis is closed. The constellation operator is waiting for the decision.",
        explain: "What changed in this mission comes from the analyzed fragment sheet and from the simulator risk, before and after the action.",
      },
    },
  };

  const PESOS = {
    alto: [
      { impacto: 1, combustivel: 1, seguranca: 2 },
      { impacto: 2, combustivel: 2, seguranca: 1 },
      { impacto: 3, combustivel: 3, seguranca: 0 },
    ],
    moderado: [
      { impacto: 1, combustivel: 1, seguranca: 3 },
      { impacto: 2, combustivel: 2, seguranca: 2 },
      { impacto: 3, combustivel: 3, seguranca: 1 },
    ],
    baixo: [
      { impacto: 1, combustivel: 0, seguranca: 3 },
      { impacto: 2, combustivel: 1, seguranca: 3 },
      { impacto: 3, combustivel: 2, seguranca: 2 },
    ],
  };

  function idioma() {
    return window.I18n && I18n.lang === "en" ? "en" : "pt";
  }

  function nomeJogador() {
    try {
      const nome = window.AP && AP.sessaoAtiva && AP.sessaoAtiva();
      if (nome) return nome;
    } catch (erro) { /* o nome fica só na frase local */ }
    return idioma() === "en" ? "commander" : "comandante";
  }

  function preencher(texto) {
    return String(texto || "").replaceAll("{jogador}", nomeJogador());
  }

  function texto(id, part) {
    const bloco = CAPITULOS[idioma()][id];
    return bloco && bloco[part] ? bloco[part] : "";
  }

  function rotuloRisco(risco) {
    const tabela = idioma() === "en"
      ? { baixo: "low", moderado: "moderate", alto: "high", cascata: "cascade" }
      : { baixo: "baixo", moderado: "moderado", alto: "alto", cascata: "cascata" };
    return tabela[risco] || risco || "";
  }

  function statusTexto(status) {
    const en = idioma() === "en";
    if (status === "fragmentado_no_impacto") return en ? "Fragmented on impact" : "Fragmentado no impacto";
    if (status === "inativo_na_superficie") return en ? "Inactive on the surface" : "Inativo na superfície";
    return status || "";
  }

  function massaTexto(ref) {
    const en = idioma() === "en";
    if (ref === "impacto") return en ? "at impact" : "no impacto";
    if (ref === "pousada") return en ? "landed" : "pousada";
    return ref || "";
  }

  function confiancaTexto(valor) {
    const en = idioma() === "en";
    if (valor === "estimada") return en ? "Estimated" : "Estimada";
    if (valor === "rastreada") return en ? "Tracked" : "Rastreada";
    if (valor === "imageada") return en ? "Imaged" : "Imageada";
    return valor || "";
  }

  function eixo(valor, pos, neg) {
    const lado = valor >= 0 ? pos : neg;
    return Math.abs(valor) + "° " + lado;
  }

  function coordenadas(dados) {
    const c = dados.coordenadas;
    if (!c) return "";
    const lat = eixo(c.latitudeGraus, "N", "S");
    const lon = eixo(c.longitudeLesteGraus, idioma() === "en" ? "E" : "L", idioma() === "en" ? "W" : "O");
    return lat + ", " + lon;
  }

  function tempoNaSuperficie(iso) {
    const instante = Date.parse(iso);
    if (!Number.isFinite(instante)) return "";
    const dias = Math.max(0, Math.floor((Date.now() - instante) / 86400000));
    const quando = String(iso).replace("T", " ").replace("Z", " UTC");
    if (idioma() === "en") return dias + " days on the surface since " + quando;
    return dias + " dias na superfície desde " + quando;
  }

  function linha(rotulo, valor, classe) {
    if (valor === null || valor === undefined || valor === "") return null;
    return classe ? { rotulo: rotulo, valor: String(valor), classe: classe } : { rotulo: rotulo, valor: String(valor) };
  }

  function ficha(o) {
    const d = o.dados || {};
    const en = idioma() === "en";
    const c = d.coordenadas || {};
    const linhas = [
      linha(en ? "Operator" : "Operador", d.operador),
      linha(en ? "Mission" : "Missão", d.missao),
      linha(en ? "Original name" : "Nome original", d.nomeOriginal, "nome-original"),
      linha("COSPAR", d.cosparId),
      linha(en ? "Arrival" : "Chegada", d.dataUtc ? String(d.dataUtc).replace("T", " ").replace("Z", " UTC") : ""),
      linha(en ? "Mass" : "Massa", d.massaKg != null ? d.massaKg + " kg · " + massaTexto(d.referenciaMassa) : ""),
      linha(en ? "Site" : "Local", d.local),
      linha(en ? "Coordinates" : "Coordenadas", coordenadas(d)),
      linha(en ? "Confidence" : "Confiança", confiancaTexto(c.confianca)),
      c.incertezaMetros != null ? linha(en ? "Uncertainty" : "Incerteza", c.incertezaMetros + " m") : null,
      linha(en ? "Status" : "Estado", statusTexto(d.statusAtual)),
      linha(en ? "Time on the surface" : "Tempo na superfície", tempoNaSuperficie(d.dataUtc)),
      linha(en ? "History" : "Histórico", d.historico),
    ];
    return linhas.filter(Boolean);
  }

  function etapas(o) {
    const d = o.dados || {};
    const en = idioma() === "en";
    const chegada = en
      ? d.missao + ", operated by " + d.operador + ", arrived at " + String(d.dataUtc).replace("T", " ").replace("Z", " UTC") + ". The cited mass (" + massaTexto(d.referenciaMassa) + ") is " + d.massaKg + " kg."
      : d.missao + ", operada por " + d.operador + ", chegou em " + String(d.dataUtc).replace("T", " ").replace("Z", " UTC") + ". A massa da ficha é a massa " + massaTexto(d.referenciaMassa) + ": " + d.massaKg + " kg.";
    let certeza = (d.local || "") + " (" + coordenadas(d) + "). " + confiancaTexto(d.coordenadas && d.coordenadas.confianca) + ".";
    if (d.coordenadas && d.coordenadas.incertezaMetros != null) {
      certeza += en
        ? " Position uncertainty " + d.coordenadas.incertezaMetros + " m."
        : " Incerteza da posição " + d.coordenadas.incertezaMetros + " m.";
    }
    certeza += en
      ? " Pin longitude 0° faces Earth. The Moon texture is procedural and is not a map."
      : " A longitude 0° do pino aponta para a Terra. A textura da Lua é procedural e não é um mapa.";
    const estado = en
      ? "Recorded state: " + statusTexto(d.statusAtual) + ". " + tempoNaSuperficie(d.dataUtc) + "."
      : "Estado registrado: " + statusTexto(d.statusAtual) + ". " + tempoNaSuperficie(d.dataUtc) + ".";
    return [
      { id: "chegada", titulo: en ? "How it arrived" : "Como chegou", texto: chegada },
      { id: "certeza", titulo: en ? "Where it is, and how sure that is" : "Onde está e com que certeza", texto: certeza },
      { id: "estado", titulo: en ? "What state it is in" : "Em que estado está", texto: estado },
    ];
  }

  function fatos(o) {
    if (!o) return [];
    if (o.type === "artefato") {
      const d = o.dados || {};
      const en = idioma() === "en";
      return [
        { rotulo: en ? "Mission" : "Missão", valor: (d.operador ? d.operador + " · " : "") + (d.missao || "") },
        { rotulo: en ? "Site" : "Local", valor: (d.local || "") + (coordenadas(d) ? " (" + coordenadas(d) + ")" : "") },
        { rotulo: en ? "State" : "Estado", valor: statusTexto(d.statusAtual) + (d.massaKg != null ? " · " + d.massaKg + " kg " + massaTexto(d.referenciaMassa) : "") },
      ].filter((item) => item.valor && item.valor !== " · ");
    }
    return [];
  }

  function clamp(n) {
    return Math.max(0, Math.min(100, Math.round(n)));
  }

  function metrosDePesos(pesos) {
    const ciencia = clamp((Number(pesos.impacto) / 3) * 100);
    const comb = clamp(((3 - Number(pesos.combustivel)) / 3) * 100);
    const seg = clamp((Number(pesos.seguranca) / 3) * 100);
    const orc = clamp((ciencia + comb + seg) / 3);
    return { seg: seg, comb: comb, orc: orc, ciencia: ciencia };
  }

  function resumoOpcao(id) {
    const en = idioma() === "en";
    if (id === "preservar") return en ? "Leave the artifact where the catalog already places it." : "Deixar o artefato onde o catálogo já o coloca.";
    if (id === "medir") return en ? "Observe from a distance and record what is already known." : "Observar de longe e registrar o que já se sabe.";
    if (id === "aproximar") return en ? "Come closer to see the hardware the catalog describes." : "Chegar mais perto para ver o hardware que o catálogo descreve.";
    return "";
  }

  function feedbackPadrao(id, nivel, artefato) {
    const nome = artefato.missao;
    const local = artefato.local;
    const estado = statusTexto(artefato.statusAtual);
    const en = idioma() === "en";
    const risco = en
      ? (nivel === "alto" ? "high" : nivel === "baixo" ? "low" : "moderate")
      : nivel;
    if (en) {
      if (id === "preservar") return "Leaving " + nome + " in place keeps it at " + local + ". The recorded state is " + estado + ". In this " + risco + "-risk teaching scenario, the option adds no new hardware.";
      if (id === "medir") return "Measuring " + nome + " from a distance records the catalog entry: " + estado + ", at " + local + ". The " + risco + "-risk label belongs to the lunar environment scenario, not to a new orbit of the artifact.";
      return "Approaching " + nome + " looks again at hardware that is already " + estado + " at " + local + ". The " + risco + "-risk label is the teaching scenario around the Moon.";
    }
    if (id === "preservar") return "Preservar " + nome + " mantém o equipamento em " + local + ". O estado registrado é " + estado + ". No cenário didático de risco " + risco + ", a opção não coloca hardware novo.";
    if (id === "medir") return "Medir " + nome + " à distância registra o que o catálogo já diz: " + estado + ", em " + local + ". O risco " + risco + " é do cenário do entorno lunar, não de uma órbita nova do artefato.";
    return "Aproximar de " + nome + " revê um equipamento que já está " + estado.toLowerCase() + " em " + local + ". O risco " + risco + " é o cenário didático ao redor da Lua.";
  }

  function missaoPadrao(artefato, nivel, lang) {
    const usar = lang === "en" ? "en" : "pt";
    const pesos = PESOS[nivel] || PESOS.moderado;
    const ids = ["preservar", "medir", "aproximar"];
    return {
      artefatoId: artefato.id,
      titulo: CAPITULOS[usar].m2.title,
      briefing: CAPITULOS[usar].m2.briefing + " " + artefato.missao + " — " + artefato.local + ".",
      opcoes: ids.map((id, indice) => ({
        id: id,
        rotulo: usar === "en"
          ? (id === "preservar" ? "Leave it in place" : id === "medir" ? "Measure from afar" : "Move closer")
          : (id === "preservar" ? "Preservar no local" : id === "medir" ? "Medir de longe" : "Aproximar"),
        pesos: pesos[indice],
        feedbackCientifico: feedbackPadrao(id, nivel, artefato),
        template: true,
      })),
    };
  }

  window.JORNADA = CAPITULOS;
  window.Jornada = {
    texto: texto,
    preencher: preencher,
    rotuloRisco: rotuloRisco,
    ficha: ficha,
    etapas: etapas,
    fatos: fatos,
    metrosDePesos: metrosDePesos,
    resumoOpcao: resumoOpcao,
    feedbackPadrao: feedbackPadrao,
    missaoPadrao: missaoPadrao,
    statusTexto: statusTexto,
  };
})();
