/**
 * Limites dos controles da simulação. O que fica fora daqui não entra no cálculo:
 * negativo, NaN e fração em contagem inteira são recusados antes do primeiro ciclo.
 */

export const LIMITES = {
  lancamentosPorCiclo: { min: 0, max: 60 },
  remocaoAtivaPorCiclo: { min: 0, max: 60 },
  multiplicadorVelocidade: { min: 0.5, max: 3 },
  ciclos: { min: 1, max: 100 },
  objetosIniciais: { min: 0, max: 50_000 },
} as const;

export interface ParametrosCiclo {
  readonly lancamentosPorCiclo: number;
  readonly remocaoAtivaPorCiclo: number;
  readonly multiplicadorVelocidade: number;
}

export interface ParametrosSimulacao extends ParametrosCiclo {
  readonly objetosIniciais: number;
  readonly ciclos: number;
}

const CHAVES = [
  "objetosIniciais",
  "lancamentosPorCiclo",
  "remocaoAtivaPorCiclo",
  "multiplicadorVelocidade",
  "ciclos",
] as const;

export type LeituraParametros =
  | { readonly ok: true; readonly valor: ParametrosSimulacao }
  | { readonly ok: false; readonly problemas: readonly string[] };

export function lerParametros(entrada: unknown): LeituraParametros {
  if (!ehRegistro(entrada)) {
    return { ok: false, problemas: ["Os parâmetros precisam ser um objeto."] };
  }

  const problemas: string[] = [];
  for (const chave of CHAVES) {
    if (!(chave in entrada)) {
      problemas.push(`falta "${chave}"`);
    }
  }
  for (const chave of Object.keys(entrada)) {
    if (!(CHAVES as readonly string[]).includes(chave)) {
      problemas.push(`campo desconhecido "${chave}"`);
    }
  }

  const objetosIniciais = lerInteiro(entrada["objetosIniciais"], "objetosIniciais", LIMITES.objetosIniciais, problemas);
  const lancamentosPorCiclo = lerInteiro(
    entrada["lancamentosPorCiclo"],
    "lancamentosPorCiclo",
    LIMITES.lancamentosPorCiclo,
    problemas,
  );
  const remocaoAtivaPorCiclo = lerInteiro(
    entrada["remocaoAtivaPorCiclo"],
    "remocaoAtivaPorCiclo",
    LIMITES.remocaoAtivaPorCiclo,
    problemas,
  );
  const ciclos = lerInteiro(entrada["ciclos"], "ciclos", LIMITES.ciclos, problemas);
  const multiplicadorVelocidade = lerVelocidade(entrada["multiplicadorVelocidade"], problemas);

  if (
    problemas.length > 0 ||
    objetosIniciais === null ||
    lancamentosPorCiclo === null ||
    remocaoAtivaPorCiclo === null ||
    ciclos === null ||
    multiplicadorVelocidade === null
  ) {
    return { ok: false, problemas };
  }

  return {
    ok: true,
    valor: { objetosIniciais, lancamentosPorCiclo, remocaoAtivaPorCiclo, multiplicadorVelocidade, ciclos },
  };
}

function lerInteiro(
  valor: unknown,
  nome: string,
  faixa: { readonly min: number; readonly max: number },
  problemas: string[],
): number | null {
  if (typeof valor !== "number" || !Number.isInteger(valor) || valor < faixa.min || valor > faixa.max) {
    problemas.push(`${nome}: inteiro entre ${faixa.min} e ${faixa.max}`);
    return null;
  }
  return valor;
}

function lerVelocidade(valor: unknown, problemas: string[]): number | null {
  const faixa = LIMITES.multiplicadorVelocidade;
  if (typeof valor !== "number" || !Number.isFinite(valor) || valor < faixa.min || valor > faixa.max) {
    problemas.push(`multiplicadorVelocidade: número entre ${faixa.min} e ${faixa.max}`);
    return null;
  }
  return valor;
}

function ehRegistro(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}
