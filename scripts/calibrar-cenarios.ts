/**
 * Procura cenários dentro de LIMITES e grava simulacao/cenarios.ts.
 * A busca é determinística: a mesma grade produz o mesmo arquivo.
 */
import { writeFileSync } from "node:fs";
import { LIMITES } from "../simulacao/parametros.ts";
import { simular, type ParametrosSimulacao } from "../simulacao/simular.ts";
import type { RiscoOrbital } from "../simulacao/transicao.ts";

const ORDEM: Record<RiscoOrbital, number> = { baixo: 0, moderado: 1, alto: 2, cascata: 3 };

interface Parametros {
  objetosIniciais: number;
  lancamentosPorCiclo: number;
  remocaoAtivaPorCiclo: number;
  multiplicadorVelocidade: number;
  ciclos: number;
}

function rodar(p: Parametros) {
  const resultado = simular(p);
  if (!resultado.ok) {
    throw new Error(resultado.problemas.join(" "));
  }
  const ultimo = resultado.estados[resultado.estados.length - 1];
  if (!ultimo) throw new Error("série vazia");
  return { estados: resultado.estados, risco: ultimo.risco, objetos: ultimo.objetos };
}

function ajustar(partida: Parametros, alvo: RiscoOrbital): Parametros {
  const direto = rodar(partida);
  if (direto.risco === alvo) return partida;
  const vizinhos: Parametros[] = [];
  for (const lancamentos of [0, 4, 8, 12, 20, 30, 40, 60]) {
    for (const velocidade of [0.5, 1, 1.5, 2, 2.5, 3]) {
      for (const ciclos of [20, 30, 40, 60, 80]) {
        vizinhos.push({
          objetosIniciais: partida.objetosIniciais,
          lancamentosPorCiclo: lancamentos,
          remocaoAtivaPorCiclo: partida.remocaoAtivaPorCiclo,
          multiplicadorVelocidade: velocidade,
          ciclos,
        });
      }
    }
  }
  const achado = vizinhos.find((candidato) => rodar(candidato).risco === alvo);
  if (!achado) {
    throw new Error("nenhum ajuste chegou em " + alvo + " a partir de " + JSON.stringify(partida));
  }
  return achado;
}

function cenarioCapitulo(preferir: RiscoOrbital): Omit<Parametros, "remocaoAtivaPorCiclo"> {
  const sementes = [
    { objetosIniciais: 8000, lancamentosPorCiclo: 20, multiplicadorVelocidade: 1, ciclos: 40 },
    { objetosIniciais: 2000, lancamentosPorCiclo: 40, multiplicadorVelocidade: 1, ciclos: 60 },
    { objetosIniciais: 3000, lancamentosPorCiclo: 30, multiplicadorVelocidade: 1.5, ciclos: 40 },
  ];
  for (const base of sementes) {
    const sem = rodar({ ...base, remocaoAtivaPorCiclo: 0 });
    const com = rodar({ ...base, remocaoAtivaPorCiclo: 30 });
    const semServe = sem.risco === "alto" || sem.risco === "cascata";
    if (semServe && ORDEM[com.risco] < ORDEM[sem.risco] && com.risco === preferir) return base;
  }
  const objetos = [2000, 3000, 4000, 5000, 8000, 12000];
  const lancamentos = [8, 12, 20, 30, 40, 60];
  const velocidades = [1, 1.5, 2, 2.5, 3, 0.5];
  const horizontes = [40, 30, 60, 20, 80];
  for (const objetosIniciais of objetos) {
    for (const lancamentosPorCiclo of lancamentos) {
      for (const multiplicadorVelocidade of velocidades) {
        for (const ciclos of horizontes) {
          const base = { objetosIniciais, lancamentosPorCiclo, multiplicadorVelocidade, ciclos };
          const sem = rodar({ ...base, remocaoAtivaPorCiclo: 0 });
          const com = rodar({ ...base, remocaoAtivaPorCiclo: 30 });
          const semServe = sem.risco === "alto" || sem.risco === "cascata";
          const desceu = ORDEM[com.risco] < ORDEM[sem.risco];
          if (semServe && desceu && com.risco === preferir) {
            return base;
          }
        }
      }
    }
  }
  throw new Error("nenhum cenário de capítulo termina em " + preferir + " com remoção 30");
}

function cenarioLua(alvo: RiscoOrbital): Parametros {
  const sementes: Parametros[] = [
    { objetosIniciais: 180, lancamentosPorCiclo: 1, remocaoAtivaPorCiclo: 2, multiplicadorVelocidade: 1, ciclos: 24 },
    { objetosIniciais: 4500, lancamentosPorCiclo: 2, remocaoAtivaPorCiclo: 8, multiplicadorVelocidade: 1, ciclos: 24 },
    { objetosIniciais: 10000, lancamentosPorCiclo: 0, remocaoAtivaPorCiclo: 60, multiplicadorVelocidade: 1, ciclos: 20 },
  ];
  for (const semente of sementes) {
    if (rodar(semente).risco === alvo) return semente;
  }
  const objetos = [80, 180, 400, 800, 1500, 2500, 4000, 6000, 8000, 10000, 12000];
  const lancamentos = [0, 1, 2, 4, 8];
  const remocoes = [0, 2, 8, 15, 20, 30, 45, 60];
  const velocidades = [0.5, 1, 1.5, 2];
  const horizontes = [24, 40, 20];
  for (const objetosIniciais of objetos) {
    for (const lancamentosPorCiclo of lancamentos) {
      for (const remocaoAtivaPorCiclo of remocoes) {
        for (const multiplicadorVelocidade of velocidades) {
          for (const ciclos of horizontes) {
            const candidato = {
              objetosIniciais,
              lancamentosPorCiclo,
              remocaoAtivaPorCiclo,
              multiplicadorVelocidade,
              ciclos,
            };
            if (rodar(candidato).risco === alvo) return candidato;
          }
        }
      }
    }
  }
  throw new Error("nenhum cenário lunar termina em " + alvo);
}

function literal(p: Parametros | Omit<Parametros, "remocaoAtivaPorCiclo">): string {
  return (
    "{ objetosIniciais: " +
    p.objetosIniciais +
    ", lancamentosPorCiclo: " +
    p.lancamentosPorCiclo +
    ", " +
    ("remocaoAtivaPorCiclo" in p ? "remocaoAtivaPorCiclo: " + p.remocaoAtivaPorCiclo + ", " : "") +
    "multiplicadorVelocidade: " +
    p.multiplicadorVelocidade +
    ", ciclos: " +
    p.ciclos +
    " }"
  );
}

function gravar(corpo: string): void {
  writeFileSync("simulacao/cenarios.ts", corpo, "utf8");
}

const controle = ajustar(
  { objetosIniciais: 2000, lancamentosPorCiclo: 8, remocaoAtivaPorCiclo: 12, multiplicadorVelocidade: 1, ciclos: 40 },
  "baixo",
);
const cascata = ajustar(
  { objetosIniciais: 2000, lancamentosPorCiclo: 40, remocaoAtivaPorCiclo: 0, multiplicadorVelocidade: 2, ciclos: 40 },
  "cascata",
);
const limpeza = ajustar(
  { objetosIniciais: 12000, lancamentosPorCiclo: 0, remocaoAtivaPorCiclo: 60, multiplicadorVelocidade: 1, ciclos: 40 },
  "alto",
);
const m1 = cenarioCapitulo("alto");
const m3 = cenarioCapitulo("moderado");
const luaBaixo = cenarioLua("baixo");
const luaModerado = cenarioLua("moderado");
const luaAlto = cenarioLua("alto");

const relatorio = {
  limites: LIMITES,
  controle: { ...controle, risco: rodar(controle).risco },
  cascata: { ...cascata, risco: rodar(cascata).risco, percurso: [...new Set(rodar(cascata).estados.map((e) => e.risco))] },
  limpeza: { ...limpeza, risco: rodar(limpeza).risco },
  m1: {
    ...m1,
    sem: rodar({ ...m1, remocaoAtivaPorCiclo: 0 }).risco,
    com30: rodar({ ...m1, remocaoAtivaPorCiclo: 30 }).risco,
    com15: rodar({ ...m1, remocaoAtivaPorCiclo: 15 }).risco,
  },
  m3: {
    ...m3,
    sem: rodar({ ...m3, remocaoAtivaPorCiclo: 0 }).risco,
    com30: rodar({ ...m3, remocaoAtivaPorCiclo: 30 }).risco,
    com15: rodar({ ...m3, remocaoAtivaPorCiclo: 15 }).risco,
  },
  lua: {
    baixo: { ...luaBaixo, risco: rodar(luaBaixo).risco },
    moderado: { ...luaModerado, risco: rodar(luaModerado).risco },
    alto: { ...luaAlto, risco: rodar(luaAlto).risco },
  },
};

console.log(JSON.stringify(relatorio, null, 2));

if (process.argv.includes("--gravar")) {
  const arquivo = `/**
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
  controle: ${literal(controle)} satisfies ParametrosSimulacao,
  cascata: ${literal(cascata)} satisfies ParametrosSimulacao,
  limpeza: ${literal(limpeza)} satisfies ParametrosSimulacao,
} as const;

/** Base do capítulo, sem a remoção. A estratégia soma remocaoAtivaPorCiclo em todos os ciclos. */
export const CAPITULOS = {
  m1: ${literal(m1)},
  m3: ${literal(m3)},
} as const;

/**
 * Três entornos lunares, um por nível de missão.
 * luna-2 usa o baixo, luna-9 o moderado, surveyor-1 o alto.
 * Cascata, se aparecer, vira alto só na hora de buscar a missão.
 */
export const LUA_POR_NIVEL = {
  baixo: ${literal(luaBaixo)} satisfies ParametrosSimulacao,
  moderado: ${literal(luaModerado)} satisfies ParametrosSimulacao,
  alto: ${literal(luaAlto)} satisfies ParametrosSimulacao,
} as const;

export const LUA_POR_ARTEFATO = {
  "luna-2": "baixo",
  "luna-9": "moderado",
  "surveyor-1": "alto",
} as const;
`;
  gravar(arquivo);
  console.log("simulacao/cenarios.ts gravado.");
}
