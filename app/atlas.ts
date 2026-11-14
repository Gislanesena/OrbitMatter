/**
 * Porta única do atlas. O front fala com o catálogo, com o Game Master e com
 * a órbita por aqui. Uma falha volta no mesmo envelope, sem exceção.
 */
import { catalogo as catalogoPadrao } from "../data/artifacts.ts";
import type { Artefato } from "../data/schemas/artifact.ts";
import { lerContexto, type ContextoMissao, type NivelRisco } from "../ia/esquema/contexto.ts";
import type { Missao } from "../ia/esquema/missao.ts";
import { criarGameMaster, type ResultadoMissao } from "../ia/game-master/servico.ts";
import type { AmbienteIa } from "../ia/game-master/provedor.ts";
import { simular } from "../simulacao/simular.ts";
import type { EstadoOrbital, RiscoOrbital } from "../simulacao/transicao.ts";

export { TIPOS_OBJETO, NIVEIS_RISCO } from "../ia/esquema/contexto.ts";
export { IDS_OPCAO } from "../ia/esquema/missao.ts";
export { LIMITES } from "../simulacao/simular.ts";
export { RISCOS_ORBITAIS } from "../simulacao/transicao.ts";
export type { Artefato } from "../data/schemas/artifact.ts";
export type { TipoObjeto, NivelRisco, ContextoMissao } from "../ia/esquema/contexto.ts";
export type { Missao, OpcaoJogador, IdOpcao, Pesos } from "../ia/esquema/missao.ts";
export type { EstadoOrbital, RiscoOrbital, ParametrosSimulacao } from "../simulacao/simular.ts";

export interface FalhaCatalogo {
  readonly pilar: "catalogo";
  readonly codigo: "artefato_desconhecido";
  readonly aviso: string;
}

export interface FalhaMissao {
  readonly pilar: "missao";
  readonly codigo: "contexto_invalido" | "artefato_desconhecido" | "falha_interna";
  readonly aviso: string;
}

export interface FalhaSimulacao {
  readonly pilar: "simulacao";
  readonly codigo: "parametros_invalidos" | "estado_invalido";
  readonly problemas: readonly string[];
}

export interface FalhaOrquestracao {
  readonly pilar: "orquestracao";
  readonly codigo: "pedido_invalido" | "falha_interna";
  readonly aviso: string;
}

export type Falha = FalhaCatalogo | FalhaMissao | FalhaSimulacao | FalhaOrquestracao;

export type Resposta<T> = { readonly ok: true; readonly dados: T } | { readonly ok: false; readonly falha: Falha };

export interface MissaoGerada {
  readonly origem: "modelo" | "reserva";
  readonly aviso: string | null;
  readonly missao: Missao;
}

export interface Jogada {
  readonly artefato: Artefato;
  readonly orbita: readonly EstadoOrbital[];
  readonly riscoOrbital: RiscoOrbital;
  readonly nivelRisco: NivelRisco;
  readonly origem: "modelo" | "reserva";
  readonly aviso: string | null;
  readonly missao: Missao;
}

export interface GameMaster {
  gerar(entrada: unknown): Promise<ResultadoMissao>;
}

export interface OpcoesAtlas {
  readonly catalogo?: readonly Artefato[];
  readonly gameMaster?: GameMaster;
  readonly ambiente?: AmbienteIa;
}

export interface Atlas {
  /** Acervo congelado, na ordem do catálogo. */
  listarArtefatos(): readonly Artefato[];
  /** Um artefato pelo id estável (`luna-2`). Id ausente vira falha de catálogo. */
  obterArtefato(id: unknown): Resposta<Artefato>;
  /** Missão para o contexto da jogada. O modelo fora do ar devolve a reserva dentro de `dados`. */
  pedirMissao(contexto: unknown): Promise<Resposta<MissaoGerada>>;
  /** Série orbital do ciclo 0 ao último. Sliders fora do limite não alteram estado nenhum. */
  simularOrbita(parametros: unknown): Resposta<readonly EstadoOrbital[]>;
  /**
   * Roda a órbita do pedido, lê o risco do último ciclo e só então pede a missão.
   * Cascata segue como risco alto. Catálogo ou sliders inválidos não chamam o modelo.
   */
  abrirJogada(pedido: unknown): Promise<Resposta<Jogada>>;
}

const CHAVES_JOGADA = ["artefatoId", "tipoObjeto", "local", "orbita"] as const;

/**
 * Cria a fachada. `catalogo` e `gameMaster` substituem as peças reais em teste.
 * Sem `gameMaster`, o mestre usa o catálogo informado e o ambiente da OpenAI compatível.
 */
export function criarAtlas(opcoes?: OpcoesAtlas): Atlas {
  const acervo = opcoes?.catalogo ?? catalogoPadrao;
  const mestre = opcoes?.gameMaster ?? criarMestre(acervo, opcoes?.ambiente);

  return {
    listarArtefatos() {
      return acervo;
    },
    obterArtefato(id) {
      return responder(() => buscarArtefato(acervo, id));
    },
    pedirMissao(contexto) {
      return capturar(() => pedir(mestre, contexto));
    },
    simularOrbita(parametros) {
      return responder(() => orbita(parametros));
    },
    abrirJogada(pedido) {
      return capturar(() => jogada(acervo, mestre, pedido));
    },
  };
}

/** Traduz o quarto nível da órbita para a escala de três níveis da missão. */
export function riscoParaMissao(risco: RiscoOrbital): NivelRisco {
  switch (risco) {
    case "baixo":
    case "moderado":
    case "alto":
      return risco;
    case "cascata":
      return "alto";
  }
}

function criarMestre(acervo: readonly Artefato[], ambiente: AmbienteIa | undefined): GameMaster {
  if (ambiente === undefined) {
    return criarGameMaster({ catalogo: acervo });
  }
  return criarGameMaster({ catalogo: acervo, ambiente });
}

async function jogada(acervo: readonly Artefato[], mestre: GameMaster, pedido: unknown): Promise<Resposta<Jogada>> {
  const leitura = lerPedido(pedido);
  if (!leitura.ok) {
    return leitura;
  }

  const previa = lerContexto({ ...leitura.campos, nivelRisco: "baixo" });
  if (!previa.ok) {
    return recusaMissao(previa.codigo, previa.aviso);
  }

  const artefato = acervo.find((item) => item.id === previa.valor.artefatoId);
  if (artefato === undefined) {
    return {
      ok: false,
      falha: {
        pilar: "catalogo",
        codigo: "artefato_desconhecido",
        aviso: `Artefato desconhecido: "${previa.valor.artefatoId}".`,
      },
    };
  }

  const serie = orbita(leitura.orbita);
  if (!serie.ok) {
    return serie;
  }

  const ultimo = serie.dados[serie.dados.length - 1];
  if (ultimo === undefined) {
    return {
      ok: false,
      falha: { pilar: "simulacao", codigo: "estado_invalido", problemas: ["A série orbital veio vazia."] },
    };
  }

  const nivelRisco = riscoParaMissao(ultimo.risco);
  const contexto: ContextoMissao = { ...previa.valor, nivelRisco };
  const missao = await pedir(mestre, contexto);
  if (!missao.ok) {
    return missao;
  }

  return {
    ok: true,
    dados: {
      artefato,
      orbita: serie.dados,
      riscoOrbital: ultimo.risco,
      nivelRisco,
      origem: missao.dados.origem,
      aviso: missao.dados.aviso,
      missao: missao.dados.missao,
    },
  };
}

type LeituraPedido =
  | { readonly ok: true; readonly campos: Record<string, unknown>; readonly orbita: unknown }
  | { readonly ok: false; readonly falha: FalhaOrquestracao };

function lerPedido(entrada: unknown): LeituraPedido {
  if (!ehRegistro(entrada)) {
    return pedidoInvalido("A jogada precisa ser um objeto.");
  }

  const problemas: string[] = [];
  for (const chave of CHAVES_JOGADA) {
    if (!(chave in entrada)) {
      problemas.push(`falta "${chave}"`);
    }
  }
  for (const chave of Object.keys(entrada)) {
    if (!(CHAVES_JOGADA as readonly string[]).includes(chave)) {
      problemas.push(`campo desconhecido "${chave}"`);
    }
  }
  if (problemas.length > 0) {
    return pedidoInvalido(problemas.join("; "));
  }

  return {
    ok: true,
    campos: {
      artefatoId: entrada["artefatoId"],
      tipoObjeto: entrada["tipoObjeto"],
      local: entrada["local"],
    },
    orbita: entrada["orbita"],
  };
}

function buscarArtefato(acervo: readonly Artefato[], id: unknown): Resposta<Artefato> {
  if (typeof id !== "string") {
    return {
      ok: false,
      falha: { pilar: "catalogo", codigo: "artefato_desconhecido", aviso: 'Informe o id do artefato, como "luna-2".' },
    };
  }
  const artefato = acervo.find((item) => item.id === id);
  if (artefato === undefined) {
    return {
      ok: false,
      falha: { pilar: "catalogo", codigo: "artefato_desconhecido", aviso: `Artefato desconhecido: "${id}".` },
    };
  }
  return { ok: true, dados: artefato };
}

async function pedir(mestre: GameMaster, contexto: unknown): Promise<Resposta<MissaoGerada>> {
  const lido = lerContexto(contexto);
  if (!lido.ok) {
    return recusaMissao(lido.codigo, lido.aviso);
  }
  const resultado = await mestre.gerar(lido.valor);
  if (!resultado.ok) {
    return recusaMissao(resultado.codigo, resultado.aviso);
  }
  return {
    ok: true,
    dados: { origem: resultado.origem, aviso: resultado.aviso, missao: resultado.missao },
  };
}

function orbita(parametros: unknown): Resposta<readonly EstadoOrbital[]> {
  const resultado = simular(parametros);
  if (!resultado.ok) {
    return { ok: false, falha: { pilar: "simulacao", codigo: resultado.codigo, problemas: resultado.problemas } };
  }
  return { ok: true, dados: resultado.estados };
}

function recusaMissao(codigo: FalhaMissao["codigo"], aviso: string): Resposta<never> {
  return { ok: false, falha: { pilar: "missao", codigo, aviso } };
}

function pedidoInvalido(aviso: string): { readonly ok: false; readonly falha: FalhaOrquestracao } {
  return { ok: false, falha: { pilar: "orquestracao", codigo: "pedido_invalido", aviso } };
}

function responder<T>(acao: () => Resposta<T>): Resposta<T> {
  try {
    return acao();
  } catch {
    return falhaInterna();
  }
}

async function capturar<T>(acao: () => Promise<Resposta<T>>): Promise<Resposta<T>> {
  try {
    return await acao();
  } catch {
    return falhaInterna();
  }
}

function falhaInterna(): Resposta<never> {
  return {
    ok: false,
    falha: {
      pilar: "orquestracao",
      codigo: "falha_interna",
      aviso: "A operação falhou antes de produzir um resultado.",
    },
  };
}

function ehRegistro(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}
