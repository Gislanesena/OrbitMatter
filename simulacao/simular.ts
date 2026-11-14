/**
 * Porta da Etapa 3. Valida os sliders e devolve a série de estados, do ciclo 0
 * ao último pedido. Cada estado é novo; o array anterior não é reescrito.
 */
import { lerParametros, type ParametrosSimulacao } from "./parametros.ts";
import { avancarCiclo, criarEstadoInicial, EstadoInvalidoError, type EstadoOrbital } from "./transicao.ts";

export { LIMITES, type ParametrosSimulacao } from "./parametros.ts";
export { type EstadoOrbital, type RiscoOrbital } from "./transicao.ts";

export interface SimulacaoPronta {
  readonly ok: true;
  readonly estados: readonly EstadoOrbital[];
}

export interface SimulacaoRecusada {
  readonly ok: false;
  readonly codigo: "parametros_invalidos" | "estado_invalido";
  readonly problemas: readonly string[];
}

export type ResultadoSimulacao = SimulacaoPronta | SimulacaoRecusada;

export function simular(entrada: unknown): ResultadoSimulacao {
  const leitura = lerParametros(entrada);
  if (!leitura.ok) {
    return { ok: false, codigo: "parametros_invalidos", problemas: leitura.problemas };
  }
  try {
    return { ok: true, estados: projetar(leitura.valor) };
  } catch (erro) {
    if (erro instanceof EstadoInvalidoError) {
      return { ok: false, codigo: "estado_invalido", problemas: erro.problemas };
    }
    return {
      ok: false,
      codigo: "estado_invalido",
      problemas: ["A simulação não produziu um estado numérico válido."],
    };
  }
}

function projetar(parametros: ParametrosSimulacao): readonly EstadoOrbital[] {
  const estados: EstadoOrbital[] = [criarEstadoInicial(parametros.objetosIniciais)];
  for (let ciclo = 0; ciclo < parametros.ciclos; ciclo += 1) {
    const atual = estados[ciclo];
    if (atual === undefined) {
      throw new EstadoInvalidoError(["a série orbital perdeu um ciclo"]);
    }
    estados.push(avancarCiclo(atual, parametros));
  }
  return Object.freeze(estados);
}
