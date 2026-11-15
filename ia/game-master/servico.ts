/**
 * Caso de uso da Etapa 2. Monta o prompt, pede a missão ao modelo, valida o JSON
 * e, se a resposta vier torta ou o modelo não responder, entrega a reserva do catálogo.
 * gerarMissao não lança: o front sempre recebe um resultado discriminado por `ok`.
 */
import { catalogo } from "../../data/artifacts.ts";
import type { Artefato } from "../../data/schemas/artifact.ts";
import { lerContexto, type ContextoMissao } from "../esquema/contexto.ts";
import { interpretarRespostaDoModelo, MissaoInvalidaError, type Missao } from "../esquema/missao.ts";
import { montarPedido } from "./prompt.ts";
import { criarProvedorCompativel, ErroDeProvedor, lerAmbiente, type AmbienteIa, type ProvedorDeTexto } from "./provedor.ts";
import { missaoDeReserva } from "./reserva.ts";

export interface DependenciasDoGameMaster {
  readonly catalogo: readonly Artefato[];
  readonly provedor: ProvedorDeTexto;
  readonly tentativas: number;
}

export interface MissaoPronta {
  readonly ok: true;
  readonly origem: "modelo" | "reserva";
  readonly aviso: string | null;
  readonly missao: Missao;
}

export interface MissaoRecusada {
  readonly ok: false;
  readonly codigo: "contexto_invalido" | "artefato_desconhecido" | "falha_interna";
  readonly aviso: string;
}

export type ResultadoMissao = MissaoPronta | MissaoRecusada;

const TENTATIVAS_PADRAO = 2;

export async function gerarMissao(entrada: unknown, deps: DependenciasDoGameMaster): Promise<ResultadoMissao> {
  const contexto = lerContexto(entrada);
  if (!contexto.ok) {
    return contexto;
  }

  const artefato = deps.catalogo.find((item) => item.id === contexto.valor.artefatoId);
  if (artefato === undefined) {
    return {
      ok: false,
      codigo: "artefato_desconhecido",
      aviso: `Artefato desconhecido: "${contexto.valor.artefatoId}".`,
    };
  }

  try {
    const missao = await pedirAoModelo(contexto.valor, artefato, deps);
    return { ok: true, origem: "modelo", aviso: null, missao };
  } catch (erro) {
    return entregarReserva(contexto.valor, artefato, avisoDe(erro));
  }
}

export function criarGameMaster(opcoes?: {
  readonly ambiente?: AmbienteIa;
  readonly catalogo?: readonly Artefato[];
  readonly tentativas?: number;
}): { gerar(entrada: unknown): Promise<ResultadoMissao> } {
  const ambiente = opcoes?.ambiente ?? lerAmbiente(ambienteDoProcesso());
  const provedor = criarProvedorCompativel(ambiente);
  const deps: DependenciasDoGameMaster = {
    catalogo: opcoes?.catalogo ?? catalogo,
    provedor,
    tentativas: opcoes?.tentativas ?? TENTATIVAS_PADRAO,
  };
  return {
    gerar(entrada) {
      return gerarMissao(entrada, deps);
    },
  };
}

async function pedirAoModelo(
  contexto: ContextoMissao,
  artefato: Artefato,
  deps: DependenciasDoGameMaster,
): Promise<Missao> {
  const tentativas = Number.isInteger(deps.tentativas) && deps.tentativas > 0 ? deps.tentativas : 0;
  if (tentativas === 0) {
    throw new ErroDeProvedor("indisponivel", "Chamadas ao modelo desligadas.");
  }

  let correcao: readonly string[] | null = null;
  for (let tentativa = 0; tentativa < tentativas; tentativa += 1) {
    const texto = await deps.provedor.completar(montarPedido(artefato, contexto, correcao));
    try {
      return interpretarRespostaDoModelo(texto, { artefatoId: artefato.id, missao: artefato.missao });
    } catch (erro) {
      if (!(erro instanceof MissaoInvalidaError) || tentativa === tentativas - 1) {
        throw erro;
      }
      correcao = erro.problemas;
    }
  }
  throw new MissaoInvalidaError(["o modelo não devolveu uma missão válida"]);
}

function entregarReserva(contexto: ContextoMissao, artefato: Artefato, aviso: string): ResultadoMissao {
  try {
    return { ok: true, origem: "reserva", aviso, missao: missaoDeReserva(artefato, contexto) };
  } catch {
    return {
      ok: false,
      codigo: "falha_interna",
      aviso: "A missão não pôde ser montada nem a partir do catálogo.",
    };
  }
}

function avisoDe(erro: unknown): string {
  if (erro instanceof ErroDeProvedor && erro.codigo === "tempo_esgotado") {
    return "O modelo demorou demais. A missão exibida foi montada a partir do catálogo.";
  }
  if (erro instanceof ErroDeProvedor) {
    return "A resposta automática não chegou. A missão abaixo foi escrita a partir do catálogo, para a atividade continuar.";
  }
  return "O modelo devolveu uma missão fora do formato. A missão exibida foi montada a partir do catálogo.";
}

function ambienteDoProcesso(): Readonly<Record<string, string | undefined>> {
  const processo = (globalThis as { process?: { env?: Readonly<Record<string, string | undefined>> } }).process;
  return processo?.env ?? {};
}
