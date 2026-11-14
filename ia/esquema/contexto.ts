/**
 * Entrada do Game Master. O front manda o alvo e o que mudou nesta jogada
 * (tipo de objeto, local ou órbita, risco). Fora deste contrato, a jogada
 * é recusada com um aviso estável — o serviço não lança exceção.
 */

export const TIPOS_OBJETO = ["sonda_de_impacto", "modulo_de_pouso", "estagio_descartado"] as const;
export type TipoObjeto = (typeof TIPOS_OBJETO)[number];

export const NIVEIS_RISCO = ["baixo", "moderado", "alto"] as const;
export type NivelRisco = (typeof NIVEIS_RISCO)[number];

export const ROTULO_TIPO: Record<TipoObjeto, string> = {
  sonda_de_impacto: "sonda de impacto",
  modulo_de_pouso: "módulo de pouso",
  estagio_descartado: "estágio descartado",
};

export interface ContextoMissao {
  readonly artefatoId: string;
  readonly tipoObjeto: TipoObjeto;
  readonly local: string;
  readonly nivelRisco: NivelRisco;
}

export type ContextoLido =
  | { readonly ok: true; readonly valor: ContextoMissao }
  | { readonly ok: false; readonly codigo: "contexto_invalido"; readonly aviso: string };

const IDENTIFICADOR = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const CHAVES = ["artefatoId", "tipoObjeto", "local", "nivelRisco"] as const;
const LOCAL_MAXIMO = 160;

export function lerContexto(entrada: unknown): ContextoLido {
  if (!ehRegistro(entrada)) {
    return recusar("O contexto da missão precisa ser um objeto.");
  }

  const problemas: string[] = [];
  for (const chave of CHAVES) {
    if (!(chave in entrada)) {
      problemas.push(`falta "${chave}"`);
    }
  }
  for (const chave of Object.keys(entrada)) {
    if (!CHAVES.includes(chave as (typeof CHAVES)[number])) {
      problemas.push(`campo desconhecido "${chave}"`);
    }
  }

  const artefatoId = texto(entrada["artefatoId"]);
  const local = texto(entrada["local"]);
  if (artefatoId === null || !IDENTIFICADOR.test(artefatoId)) {
    problemas.push('artefatoId no formato "luna-2"');
  }
  if (local === null || local.length > LOCAL_MAXIMO) {
    problemas.push(`local com 1 a ${LOCAL_MAXIMO} caracteres, sem espaço nas pontas`);
  }
  if (!pertence(entrada["tipoObjeto"], TIPOS_OBJETO)) {
    problemas.push(`tipoObjeto: ${TIPOS_OBJETO.join(", ")}`);
  }
  if (!pertence(entrada["nivelRisco"], NIVEIS_RISCO)) {
    problemas.push(`nivelRisco: ${NIVEIS_RISCO.join(", ")}`);
  }

  if (problemas.length > 0 || artefatoId === null || local === null) {
    return recusar(problemas.join("; "));
  }
  if (!pertence(entrada["tipoObjeto"], TIPOS_OBJETO) || !pertence(entrada["nivelRisco"], NIVEIS_RISCO)) {
    return recusar(problemas.join("; "));
  }

  return {
    ok: true,
    valor: {
      artefatoId,
      tipoObjeto: entrada["tipoObjeto"],
      local,
      nivelRisco: entrada["nivelRisco"],
    },
  };
}

function recusar(aviso: string): ContextoLido {
  return { ok: false, codigo: "contexto_invalido", aviso };
}

function texto(valor: unknown): string | null {
  if (typeof valor !== "string" || valor.trim() === "" || valor.trim() !== valor) {
    return null;
  }
  return valor;
}

function pertence<T extends string>(valor: unknown, opcoes: readonly T[]): valor is T {
  return typeof valor === "string" && (opcoes as readonly string[]).includes(valor);
}

function ehRegistro(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}
