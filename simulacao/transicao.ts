/**
 * Um ciclo orbital, em função pura.
 *
 * O número esperado de colisões segue o encontro cinético: proporcional a
 * N × (N − 1) e à velocidade relativa. Cada colisão retira 2 objetos e
 * devolve `fragmentosPorColisao` fragmentos rastreáveis. A cascata de Kessler
 * começa quando esse saldo supera a remoção ativa do ciclo.
 *
 * A escala é didática. Os coeficientes fazem os sliders atravessarem o limiar;
 * o resultado não é uma previsão do catálogo real em órbita baixa.
 */
import { LIMITES, type ParametrosCiclo } from "./parametros.ts";

export const RISCOS_ORBITAIS = ["baixo", "moderado", "alto", "cascata"] as const;
export type RiscoOrbital = (typeof RISCOS_ORBITAIS)[number];

export const MODELO = {
  coeficienteColisao: 1e-7,
  fragmentosPorColisao: 6,
  objetosMaximos: 250_000,
  limiarModerado: 4_000,
  limiarAlto: 8_000,
  colisoesAltas: 5,
} as const;

export interface EstadoOrbital {
  readonly ciclo: number;
  readonly objetos: number;
  /** Fragmentos criados pelas colisões deste ciclo. */
  readonly fragmentosGerados: number;
  readonly fragmentosAcumulados: number;
  /** Colisões deste ciclo, já arredondadas a partir do valor esperado. */
  readonly colisoes: number;
  readonly colisoesAcumuladas: number;
  readonly risco: RiscoOrbital;
}

export class EstadoInvalidoError extends Error {
  readonly problemas: readonly string[];

  constructor(problemas: readonly string[]) {
    super(problemas.map((problema) => `- ${problema}`).join("\n"));
    this.name = "EstadoInvalidoError";
    this.problemas = problemas;
  }
}

export function criarEstadoInicial(objetos: number): EstadoOrbital {
  afirmarInteiroNaFaixa(objetos, "objetosIniciais", LIMITES.objetosIniciais);
  return congelar({
    ciclo: 0,
    objetos,
    fragmentosGerados: 0,
    fragmentosAcumulados: 0,
    colisoes: 0,
    colisoesAcumuladas: 0,
    risco: classificarRisco({ objetos, colisoes: 0, remocaoAtivaPorCiclo: 0 }),
  });
}

export function avancarCiclo(estado: EstadoOrbital, parametros: ParametrosCiclo): EstadoOrbital {
  afirmarEstado(estado);
  afirmarParametros(parametros);

  const aposLancamento = estado.objetos + parametros.lancamentosPorCiclo;
  const removidos = Math.min(parametros.remocaoAtivaPorCiclo, aposLancamento);
  const emOrbita = aposLancamento - removidos;
  const colisoes = colisoesEsperadas(emOrbita, parametros.multiplicadorVelocidade);
  const fragmentosGerados = colisoes * MODELO.fragmentosPorColisao;
  const objetosSemTeto = emOrbita + colisoes * (MODELO.fragmentosPorColisao - 2);

  if (!Number.isSafeInteger(objetosSemTeto) || objetosSemTeto < 0) {
    throw new EstadoInvalidoError(["a população do ciclo saiu do domínio inteiro"]);
  }

  const estourouTeto = objetosSemTeto > MODELO.objetosMaximos;
  const objetos = estourouTeto ? MODELO.objetosMaximos : objetosSemTeto;
  const riscoBase = classificarRisco({
    objetos,
    colisoes,
    remocaoAtivaPorCiclo: parametros.remocaoAtivaPorCiclo,
  });

  return congelar({
    ciclo: estado.ciclo + 1,
    objetos,
    fragmentosGerados,
    fragmentosAcumulados: estado.fragmentosAcumulados + fragmentosGerados,
    colisoes,
    colisoesAcumuladas: estado.colisoesAcumuladas + colisoes,
    risco: estourouTeto ? "cascata" : riscoBase,
  });
}

export function classificarRisco(entrada: {
  readonly objetos: number;
  readonly colisoes: number;
  readonly remocaoAtivaPorCiclo: number;
}): RiscoOrbital {
  const saldoDasColisoes = entrada.colisoes * (MODELO.fragmentosPorColisao - 2);
  // Uma colisão isolada ainda é acidente. A cascata exige produção repetida
  // acima da remoção: o saldo do ciclo supera a limpeza e há ao menos dois encontros.
  if (entrada.colisoes >= 2 && saldoDasColisoes > entrada.remocaoAtivaPorCiclo) {
    return "cascata";
  }
  if (entrada.objetos >= MODELO.limiarAlto || entrada.colisoes >= MODELO.colisoesAltas) {
    return "alto";
  }
  if (entrada.objetos >= MODELO.limiarModerado || entrada.colisoes > 0) {
    return "moderado";
  }
  return "baixo";
}

function colisoesEsperadas(objetos: number, multiplicadorVelocidade: number): number {
  const pares = Math.floor(objetos / 2);
  if (pares === 0) {
    return 0;
  }
  const esperadas =
    MODELO.coeficienteColisao * objetos * (objetos - 1) * multiplicadorVelocidade;
  const arredondadas = Math.round(esperadas);
  if (!Number.isSafeInteger(arredondadas) || arredondadas < 0) {
    throw new EstadoInvalidoError(["a taxa de colisão saiu do domínio numérico"]);
  }
  return Math.min(pares, arredondadas);
}

function afirmarEstado(estado: EstadoOrbital): void {
  const problemas: string[] = [];
  if (!ehRegistro(estado)) {
    throw new EstadoInvalidoError(["o estado orbital precisa ser um objeto"]);
  }
  afirmarInteiroNaoNegativo(estado.ciclo, "ciclo", problemas);
  afirmarInteiroNaoNegativo(estado.objetos, "objetos", problemas);
  afirmarInteiroNaoNegativo(estado.fragmentosGerados, "fragmentosGerados", problemas);
  afirmarInteiroNaoNegativo(estado.fragmentosAcumulados, "fragmentosAcumulados", problemas);
  afirmarInteiroNaoNegativo(estado.colisoes, "colisoes", problemas);
  afirmarInteiroNaoNegativo(estado.colisoesAcumuladas, "colisoesAcumuladas", problemas);
  if (estado.objetos > MODELO.objetosMaximos) {
    problemas.push(`objetos acima de ${MODELO.objetosMaximos}`);
  }
  if (!(RISCOS_ORBITAIS as readonly string[]).includes(estado.risco)) {
    problemas.push("risco fora da escala baixo, moderado, alto, cascata");
  }
  if (problemas.length > 0) {
    throw new EstadoInvalidoError(problemas);
  }
}

function afirmarParametros(parametros: ParametrosCiclo): void {
  if (!ehRegistro(parametros)) {
    throw new EstadoInvalidoError(["os parâmetros do ciclo precisam ser um objeto"]);
  }
  const problemas: string[] = [];
  afirmarInteiroNaFaixa(parametros.lancamentosPorCiclo, "lancamentosPorCiclo", LIMITES.lancamentosPorCiclo, problemas);
  afirmarInteiroNaFaixa(parametros.remocaoAtivaPorCiclo, "remocaoAtivaPorCiclo", LIMITES.remocaoAtivaPorCiclo, problemas);
  const velocidade = parametros.multiplicadorVelocidade;
  const faixa = LIMITES.multiplicadorVelocidade;
  if (typeof velocidade !== "number" || !Number.isFinite(velocidade) || velocidade < faixa.min || velocidade > faixa.max) {
    problemas.push(`multiplicadorVelocidade: número entre ${faixa.min} e ${faixa.max}`);
  }
  if (problemas.length > 0) {
    throw new EstadoInvalidoError(problemas);
  }
}

function afirmarInteiroNaoNegativo(valor: unknown, nome: string, problemas: string[]): void {
  if (typeof valor === "number" && Number.isSafeInteger(valor) && valor >= 0) {
    return;
  }
  problemas.push(`${nome} precisa ser um inteiro seguro maior ou igual a zero`);
}

function afirmarInteiroNaFaixa(
  valor: unknown,
  nome: string,
  faixa: { readonly min: number; readonly max: number },
  problemas?: string[],
): void {
  const valido = typeof valor === "number" && Number.isInteger(valor) && valor >= faixa.min && valor <= faixa.max;
  if (valido) {
    return;
  }
  const mensagem = `${nome}: inteiro entre ${faixa.min} e ${faixa.max}`;
  if (problemas === undefined) {
    throw new EstadoInvalidoError([mensagem]);
  }
  problemas.push(mensagem);
}

function ehRegistro(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

function congelar<T>(valor: T): T {
  if (typeof valor === "object" && valor !== null) {
    for (const chave of Object.keys(valor)) {
      congelar((valor as Record<string, unknown>)[chave]);
    }
    Object.freeze(valor);
  }
  return valor;
}
