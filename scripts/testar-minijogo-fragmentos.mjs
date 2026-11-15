import { readFileSync } from "node:fs";
import vm from "node:vm";
import { criarAtlas } from "../app/atlas.ts";

await import("../js/minijogo-fragmentos-nucleo.js");
const N = globalThis.MinijogoFragmentosNucleo;
if (!N) throw new Error("nucleo ausente");

const atlas = criarAtlas();
const chamadas = [];
function simular(parametros) {
  for (const [chave, faixa] of Object.entries(N.LIMITES)) {
    const valor = parametros[chave];
    if (typeof valor !== "number" || Number.isNaN(valor) || valor < faixa.min || valor > faixa.max) {
      throw new Error("fora de limites: " + chave + "=" + valor);
    }
  }
  chamadas.push(parametros);
  return atlas.simularOrbita(parametros);
}

function rank(risco) {
  return ["baixo", "moderado", "alto", "cascata"].indexOf(risco);
}

function melhor(estrategia, fragmentos, exigirServico) {
  const teto = N.tetoRemocao(estrategia, 0, N.CICLOS);
  let escolhida = null;
  for (let lancamentos = 0; lancamentos <= N.LIMITES.lancamentosPorCiclo.max; lancamentos += 1) {
    for (let remocao = 0; remocao <= teto; remocao += 1) {
      const r = N.avaliar(simular, { fragmentos, estrategia, lancamentos, remocao });
      if (exigirServico && r.exec.orc < 70) continue;
      if (
        !escolhida ||
        rank(r.riscoFinal) < rank(escolhida.riscoFinal) ||
        (rank(r.riscoFinal) === rank(escolhida.riscoFinal) && r.exec.ciencia > escolhida.exec.ciencia)
      ) {
        escolhida = r;
      }
    }
  }
  return escolhida;
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const sem = N.avaliar(simular, { fragmentos: null, estrategia: "monitorar", lancamentos: N.LANCAMENTOS_ALVO, remocao: 0 });
assert(sem.semAcao.riscoFinal === "cascata", "sem acao terminou em " + sem.semAcao.riscoFinal);

const remocao = melhor("remocao", null, true);
const desorbitar = melhor("desorbitar", null, true);
assert(remocao && rank(remocao.riscoFinal) <= 1, "remocao " + (remocao && remocao.riscoFinal));
assert(desorbitar && rank(desorbitar.riscoFinal) <= 1, "desorbitar " + (desorbitar && desorbitar.riscoFinal));
assert(remocao.exec.orc >= 70 && desorbitar.exec.orc >= 70, "servico abaixo de 70");

const monitorar = melhor("monitorar", null, false);
assert(monitorar && rank(monitorar.riscoFinal) >= 2, "monitorar " + (monitorar && monitorar.riscoFinal));

for (const lancamentos of [0, N.LANCAMENTOS_ALVO, 20]) {
  const desvio = N.avaliar(simular, { fragmentos: null, estrategia: "desvio", lancamentos, remocao: 40 });
  assert(desvio.politica.remocao === 0, "desvio removeu");
  assert(desvio.exec.ciencia === 0, "desvio ciencia " + desvio.exec.ciencia);
}

const a = N.avaliar(simular, { fragmentos: 261, estrategia: "remocao", lancamentos: 5, remocao: 40 });
const b = N.avaliar(simular, { fragmentos: 261, estrategia: "remocao", lancamentos: 5, remocao: 40 });
assert(JSON.stringify(a.exec) === JSON.stringify(b.exec), "nao deterministico");
assert(a.riscoFinal === b.riscoFinal && a.fragmentos === b.fragmentos, "serie diferente");
for (const valor of Object.values(a.exec)) assert(Number.isFinite(valor), "nan");

const auto1 = N.politicaEquilibrada("desorbitar");
const auto2 = N.politicaEquilibrada("desorbitar");
assert(JSON.stringify(auto1) === JSON.stringify(auto2), "automatico instavel");
const jogado = N.avaliar(simular, Object.assign({ fragmentos: null, estrategia: "desorbitar" }, auto1));
assert(jogado.exec.orc >= 70, "automatico sem servico");

const repetida = Array.from({ length: 5 }, () => ({ lancamentos: auto1.lancamentos, remocao: auto1.remocao }));
const porTurnos = N.avaliar(simular, { fragmentos: null, estrategia: "desorbitar", turnos: repetida });
const direto = N.avaliar(simular, { fragmentos: null, estrategia: "desorbitar", lancamentos: auto1.lancamentos, remocao: auto1.remocao });
assert(porTurnos.serie[porTurnos.serie.length - 1].objetos === direto.serie[direto.serie.length - 1].objetos, "populacao dos turnos difere");
assert(porTurnos.fragmentos === direto.fragmentos && porTurnos.colisoes === direto.colisoes, "acumulado dos turnos difere");

const longo = simular(N.parametros(N.objetosDe(null), auto1.lancamentos, auto1.remocao, 40));
const curto = N.encadear(simular, N.parametros(N.objetosDe(null), auto1.lancamentos, auto1.remocao, 40), 5);
const popLonga = longo.dados[longo.dados.length - 1].objetos;
const popCurta = curto.objetos;
const equivalente = popLonga === popCurta;

const fichaVazia = N.lerFicha({});
assert(fichaVazia.fragmentos === null && fichaVazia.ano === null && fichaVazia.fonte === null, "ficha vazia inventou dado");
assert(N.objetosDe(null) === N.NBASE + N.PADRAO_FRAGMENTOS, "padrao didatico");

const codigo = readFileSync(new URL("../frontend/dados-objetos.js", import.meta.url), "utf8");
const sandbox = { window: {}, console };
vm.runInNewContext(codigo, sandbox);
const fichas = sandbox.window.DADOS_OBJETOS;
for (const id of ["F-01", "F-02", "F-03", "F-04", "F-05", "F-06", "F-07", "F-08"]) {
  const lido = N.lerFicha(fichas[id]);
  assert(lido.nome && lido.ano && lido.fragmentos > 0, id + " sem evento");
  assert(N.objetosDe(lido.fragmentos) <= N.LIMITES.objetosIniciais.max, id + " fora do limite");
  const trecho = (fichas[id].origem || "") + (fichas[id].riscos || "") + (fichas[id].permanencia || "");
  assert(trecho.includes(String(lido.fragmentos)) || trecho.includes(lido.fragmentos.toLocaleString("pt-BR")), id + " contagem nao esta na ficha");
}

const grande = N.lerFicha(fichas["F-05"]);
const grandeJogo = melhor("remocao", grande.fragmentos, true);

console.log("minijogo fragmentos ok");
console.log("parametros", N.NBASE, N.LANCAMENTOS_ALVO, N.ORC_REMOCAO, "padrao", N.PADRAO_FRAGMENTOS);
console.log("sem acao", sem.semAcao.riscoFinal, "colisões", sem.semAcao.colisoes, "fragmentos", sem.semAcao.fragmentos);
console.log("remocao", remocao.politica, remocao.riscoFinal, "servico", remocao.exec.orc);
console.log("desorbitar", desorbitar.politica, desorbitar.riscoFinal, "servico", desorbitar.exec.orc);
console.log("monitorar", monitorar.politica, monitorar.riscoFinal);
console.log("turnos", equivalente ? "equivalente" : "diferenca " + (popCurta - popLonga), "pop", popLonga, popCurta);
console.log("fengyun remocao", grande.fragmentos, grandeJogo && grandeJogo.riscoFinal, grandeJogo && grandeJogo.politica);
if (!equivalente) console.log("TURNOS_DIVERGEM");
