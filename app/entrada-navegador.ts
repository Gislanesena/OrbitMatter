/**
 * Entrada do bundle dist/atlas-ia.js.
 * A chave ATLAS_IA_CHAVE não é definida aqui. O código só a procura em
 * globalThis.process na hora de chamar o modelo, e a página não cria esse objeto.
 */
export { criarAtlas, LIMITES, RISCOS_ORBITAIS, MODELO } from "./atlas.ts";
export {
  CAPITULOS,
  LUA_POR_ARTEFATO,
  LUA_POR_NIVEL,
  PREDEFINICOES,
  REMOCAO_POR_ESTRATEGIA,
} from "../simulacao/cenarios.ts";
