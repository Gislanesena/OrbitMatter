/**
 * Cenários didáticos calibrados por scripts/calibrar-cenarios.ts.
 * Não edite os números à mão: rode o script de novo e confira os testes.
 */
import type { ParametrosSimulacao } from "./simular.ts";

export const REMOCAO_POR_ESTRATEGIA = {
  monitorar: 0,
  desvio: 0,
  desorbitar: 15,
  remocao: 30,
} as const;

export const PREDEFINICOES = {
  controle: { objetosIniciais: 2000, lancamentosPorCiclo: 8, remocaoAtivaPorCiclo: 12, multiplicadorVelocidade: 1, ciclos: 40 } satisfies ParametrosSimulacao,
  cascata: { objetosIniciais: 2000, lancamentosPorCiclo: 40, remocaoAtivaPorCiclo: 0, multiplicadorVelocidade: 2, ciclos: 40 } satisfies ParametrosSimulacao,
  limpeza: { objetosIniciais: 12000, lancamentosPorCiclo: 0, remocaoAtivaPorCiclo: 60, multiplicadorVelocidade: 1, ciclos: 40 } satisfies ParametrosSimulacao,
} as const;

/** Base do capítulo, sem a remoção. A estratégia soma remocaoAtivaPorCiclo em todos os ciclos. */
export const CAPITULOS = {
  m1: { objetosIniciais: 2000, lancamentosPorCiclo: 60, multiplicadorVelocidade: 2, ciclos: 80 },
  m3: { objetosIniciais: 2000, lancamentosPorCiclo: 40, multiplicadorVelocidade: 1, ciclos: 60 },
} as const;

/**
 * Três entornos lunares, um por nível de missão.
 * luna-2 usa o baixo, luna-9 o moderado, surveyor-1 o alto.
 * Cascata, se aparecer, vira alto só na hora de buscar a missão.
 */
export const LUA_POR_NIVEL = {
  baixo: { objetosIniciais: 180, lancamentosPorCiclo: 1, remocaoAtivaPorCiclo: 2, multiplicadorVelocidade: 1, ciclos: 24 } satisfies ParametrosSimulacao,
  moderado: { objetosIniciais: 4500, lancamentosPorCiclo: 2, remocaoAtivaPorCiclo: 8, multiplicadorVelocidade: 1, ciclos: 24 } satisfies ParametrosSimulacao,
  alto: { objetosIniciais: 10000, lancamentosPorCiclo: 0, remocaoAtivaPorCiclo: 60, multiplicadorVelocidade: 1, ciclos: 20 } satisfies ParametrosSimulacao,
} as const;

export const LUA_POR_ARTEFATO = {
  "luna-2": "baixo",
  "luna-9": "moderado",
  "surveyor-1": "alto",
} as const;
