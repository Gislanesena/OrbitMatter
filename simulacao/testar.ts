/**
 * Trava a calibração: a mesma entrada produz a mesma série, e os cenários
 * gravados terminam nos riscos combinados.
 */
import { CAPITULOS, LUA_POR_ARTEFATO, LUA_POR_NIVEL, PREDEFINICOES, REMOCAO_POR_ESTRATEGIA } from "./cenarios.ts";
import { LIMITES } from "./parametros.ts";
import { simular } from "./simular.ts";
import { MODELO, RISCOS_ORBITAIS, type RiscoOrbital } from "./transicao.ts";

const ORDEM: Record<RiscoOrbital, number> = { baixo: 0, moderado: 1, alto: 2, cascata: 3 };

function exigir(condicao: boolean, mensagem: string): void {
  if (!condicao) {
    throw new Error(mensagem);
  }
}

function serieDe(entrada: unknown) {
  const resultado = simular(entrada);
  exigir(resultado.ok, "a simulação devia aceitar " + JSON.stringify(entrada));
  if (!resultado.ok) {
    return [];
  }
  return resultado.estados;
}

function riscoFinal(entrada: unknown): RiscoOrbital {
  const estados = serieDe(entrada);
  const ultimo = estados[estados.length - 1];
  if (!ultimo) {
    throw new Error("série vazia");
  }
  return ultimo.risco;
}

function recusada(entrada: unknown): void {
  const resultado = simular(entrada);
  exigir(resultado.ok === false, "devia recusar " + JSON.stringify(entrada));
  if (resultado.ok) return;
  exigir(resultado.problemas.length > 0, "recusa sem problemas");
  exigir(!("estados" in resultado), "recusa não pode devolver série");
}

export function testarSimulacao(): void {
  exigir(LIMITES.objetosIniciais.min === 0 && LIMITES.objetosIniciais.max === 50_000 && LIMITES.objetosIniciais.step === 1, "limite de população");
  exigir(LIMITES.lancamentosPorCiclo.min === 0 && LIMITES.lancamentosPorCiclo.max === 60 && LIMITES.lancamentosPorCiclo.step === 1, "limite de lançamentos");
  exigir(LIMITES.remocaoAtivaPorCiclo.min === 0 && LIMITES.remocaoAtivaPorCiclo.max === 60 && LIMITES.remocaoAtivaPorCiclo.step === 1, "limite de remoção");
  exigir(LIMITES.multiplicadorVelocidade.min === 0.5 && LIMITES.multiplicadorVelocidade.max === 3 && LIMITES.multiplicadorVelocidade.step === 0.1, "limite de velocidade");
  exigir(LIMITES.ciclos.min === 1 && LIMITES.ciclos.max === 100 && LIMITES.ciclos.step === 1, "limite de ciclos");
  exigir(MODELO.coeficienteColisao === 1e-7, "taxa de colisão");
  exigir(MODELO.fragmentosPorColisao === 6, "fragmentos por colisão");
  exigir(MODELO.objetosMaximos === 250_000, "teto interno");
  exigir(MODELO.limiarModerado === 4_000 && MODELO.limiarAlto === 8_000 && MODELO.colisoesAltas === 5, "limiares de risco");
  exigir(RISCOS_ORBITAIS.join(",") === "baixo,moderado,alto,cascata", "escala de risco");

  exigir(REMOCAO_POR_ESTRATEGIA.monitorar === 0, "monitorar não remove");
  exigir(REMOCAO_POR_ESTRATEGIA.desvio === 0, "desvio não remove");
  exigir(REMOCAO_POR_ESTRATEGIA.desorbitar === 15, "desorbitar");
  exigir(REMOCAO_POR_ESTRATEGIA.remocao === 30, "remoção ativa");

  const controle = serieDe(PREDEFINICOES.controle);
  exigir(controle.length === PREDEFINICOES.controle.ciclos + 1, "a série inclui o ponto de partida");
  exigir(controle[0]?.ciclo === 0 && controle[0]?.objetos === PREDEFINICOES.controle.objetosIniciais, "índice 0 é o ponto de partida");
  exigir(controle.every((estado) => estado.risco === "baixo"), "órbita sob controle permanece em baixo");

  const rumo = serieDe(PREDEFINICOES.cascata);
  const percurso = [...new Set(rumo.map((estado) => estado.risco))];
  exigir(percurso.join(",") === "baixo,moderado,cascata", "rumo à cascata passa por baixo, moderado e cascata");
  exigir(rumo[rumo.length - 1]?.risco === "cascata", "rumo à cascata termina em cascata");

  exigir(riscoFinal(PREDEFINICOES.limpeza) === "alto", "limpeza máxima termina em alto");

  for (const entrada of [PREDEFINICOES.controle, PREDEFINICOES.cascata, PREDEFINICOES.limpeza, { ...CAPITULOS.m1, remocaoAtivaPorCiclo: 0 }, { ...CAPITULOS.m1, remocaoAtivaPorCiclo: 30 }]) {
    exigir(JSON.stringify(serieDe(entrada)) === JSON.stringify(serieDe(entrada)), "mesma configuração, mesma série");
  }

  const semM1 = riscoFinal({ ...CAPITULOS.m1, remocaoAtivaPorCiclo: 0 });
  const comM1 = riscoFinal({ ...CAPITULOS.m1, remocaoAtivaPorCiclo: REMOCAO_POR_ESTRATEGIA.remocao });
  exigir(semM1 === "cascata" && comM1 === "alto" && ORDEM[comM1] < ORDEM[semM1], "capítulo m1");

  const semM3 = riscoFinal({ ...CAPITULOS.m3, remocaoAtivaPorCiclo: 0 });
  const comM3 = riscoFinal({ ...CAPITULOS.m3, remocaoAtivaPorCiclo: REMOCAO_POR_ESTRATEGIA.remocao });
  exigir(semM3 === "cascata" && comM3 === "moderado" && ORDEM[comM3] < ORDEM[semM3], "capítulo m3");

  exigir(riscoFinal(LUA_POR_NIVEL.baixo) === "baixo", "entorno lunar baixo");
  exigir(riscoFinal(LUA_POR_NIVEL.moderado) === "moderado", "entorno lunar moderado");
  exigir(riscoFinal(LUA_POR_NIVEL.alto) === "alto", "entorno lunar alto");
  exigir(LUA_POR_ARTEFATO["luna-2"] === "baixo" && LUA_POR_ARTEFATO["luna-9"] === "moderado" && LUA_POR_ARTEFATO["surveyor-1"] === "alto", "missões lunares cobrem os três níveis");

  recusada({ ...PREDEFINICOES.controle, extra: 1 });
  recusada({ ...PREDEFINICOES.controle, lancamentosPorCiclo: 1.5 });
  recusada({ ...PREDEFINICOES.controle, objetosIniciais: LIMITES.objetosIniciais.max + 1 });
  recusada({ ...PREDEFINICOES.controle, multiplicadorVelocidade: LIMITES.multiplicadorVelocidade.min - 0.1 });
  recusada({ ...PREDEFINICOES.controle, ciclos: 0 });
  const incompleto = { ...PREDEFINICOES.controle } as { ciclos?: number };
  delete incompleto.ciclos;
  recusada(incompleto);
}
