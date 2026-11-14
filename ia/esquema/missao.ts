/**
 * Saída do Game Master. O modelo só entra no jogo depois desta validação:
 * três escolhas, pesos inteiros e distintos, feedback científico em cada uma.
 * Texto com cerca de Markdown é aceito na borda e descartado; o miolo tem de ser JSON.
 */

export const IDS_OPCAO = ["preservar", "medir", "aproximar"] as const;
export type IdOpcao = (typeof IDS_OPCAO)[number];

export interface Pesos {
  readonly impacto: number;
  readonly combustivel: number;
  readonly seguranca: number;
}

export interface OpcaoJogador {
  readonly id: IdOpcao;
  readonly rotulo: string;
  readonly pesos: Pesos;
  readonly feedbackCientifico: string;
}

export interface Missao {
  readonly artefatoId: string;
  readonly titulo: string;
  readonly briefing: string;
  readonly opcoes: readonly [OpcaoJogador, OpcaoJogador, OpcaoJogador];
}

export interface AncoraMissao {
  readonly artefatoId: string;
  readonly missao: string;
}

export class MissaoInvalidaError extends Error {
  readonly problemas: readonly string[];

  constructor(problemas: readonly string[]) {
    super(problemas.map((problema) => `- ${problema}`).join("\n"));
    this.name = "MissaoInvalidaError";
    this.problemas = problemas;
  }
}

const CHAVES_MISSAO = ["artefatoId", "titulo", "briefing", "opcoes"] as const;
const CHAVES_OPCAO = ["id", "rotulo", "pesos", "feedbackCientifico"] as const;
const CHAVES_PESOS = ["impacto", "combustivel", "seguranca"] as const;
const PESO_MAXIMO = 3;

export function interpretarRespostaDoModelo(texto: string, ancora: AncoraMissao): Missao {
  return validarMissao(extrairJson(texto), ancora);
}

export function validarMissao(entrada: unknown, ancora: AncoraMissao): Missao {
  const problemas: string[] = [];
  if (!ehRegistro(entrada)) {
    throw new MissaoInvalidaError(["a missão precisa ser um objeto JSON"]);
  }

  exigirChaves(entrada, CHAVES_MISSAO, "missão", problemas);
  const artefatoId = lerTexto(entrada["artefatoId"], "artefatoId", problemas, 1, 40);
  const titulo = lerTexto(entrada["titulo"], "titulo", problemas, 8, 90);
  const briefing = lerTexto(entrada["briefing"], "briefing", problemas, 80, 700);
  const opcoes = lerOpcoes(entrada["opcoes"], problemas);

  if (artefatoId !== null && artefatoId !== ancora.artefatoId) {
    problemas.push(`artefatoId deve ser "${ancora.artefatoId}"`);
  }
  if (titulo !== null && briefing !== null && !citaMissao(titulo, briefing, ancora.missao)) {
    problemas.push(`título ou briefing deve citar "${ancora.missao}"`);
  }
  if (opcoes !== null) {
    conferirPesos(opcoes, problemas);
    conferirFeedbacks(opcoes, problemas);
  }

  if (problemas.length > 0 || artefatoId === null || titulo === null || briefing === null || opcoes === null) {
    throw new MissaoInvalidaError(problemas.length > 0 ? problemas : ["missão incompleta"]);
  }

  return congelar({ artefatoId, titulo, briefing, opcoes });
}

function extrairJson(texto: string): unknown {
  const semCerca = texto.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  const direto = tentarJson(semCerca);
  if (direto !== undefined) {
    return direto;
  }
  const inicio = semCerca.indexOf("{");
  const fim = semCerca.lastIndexOf("}");
  if (inicio >= 0 && fim > inicio) {
    const recorte = tentarJson(semCerca.slice(inicio, fim + 1));
    if (recorte !== undefined) {
      return recorte;
    }
  }
  throw new MissaoInvalidaError(["a resposta não contém um objeto JSON"]);
}

function tentarJson(texto: string): unknown | undefined {
  try {
    return JSON.parse(texto) as unknown;
  } catch {
    return undefined;
  }
}

function lerOpcoes(
  valor: unknown,
  problemas: string[],
): readonly [OpcaoJogador, OpcaoJogador, OpcaoJogador] | null {
  if (!Array.isArray(valor) || valor.length !== 3) {
    problemas.push("opcoes precisa ter exatamente 3 itens");
    return null;
  }

  const lidas: OpcaoJogador[] = [];
  const ids = new Set<string>();
  valor.forEach((item, indice) => {
    const opcao = lerOpcao(item, `opcoes[${indice}]`, problemas);
    if (opcao === null) {
      return;
    }
    if (ids.has(opcao.id)) {
      problemas.push(`opção duplicada "${opcao.id}"`);
      return;
    }
    ids.add(opcao.id);
    lidas.push(opcao);
  });

  if (lidas.length !== 3) {
    return null;
  }
  for (const id of IDS_OPCAO) {
    if (!ids.has(id)) {
      problemas.push(`falta a opção "${id}"`);
    }
  }
  if (ids.size !== 3) {
    return null;
  }

  const preservar = lidas.find((opcao) => opcao.id === "preservar");
  const medir = lidas.find((opcao) => opcao.id === "medir");
  const aproximar = lidas.find((opcao) => opcao.id === "aproximar");
  if (preservar === undefined || medir === undefined || aproximar === undefined) {
    return null;
  }
  return [preservar, medir, aproximar];
}

function lerOpcao(valor: unknown, prefixo: string, problemas: string[]): OpcaoJogador | null {
  if (!ehRegistro(valor)) {
    problemas.push(`${prefixo}: esperado um objeto`);
    return null;
  }
  const antes = problemas.length;
  exigirChaves(valor, CHAVES_OPCAO, prefixo, problemas);
  const id = lerId(valor["id"], `${prefixo}.id`, problemas);
  const rotulo = lerTexto(valor["rotulo"], `${prefixo}.rotulo`, problemas, 4, 90);
  const pesos = lerPesos(valor["pesos"], `${prefixo}.pesos`, problemas);
  const feedbackCientifico = lerTexto(
    valor["feedbackCientifico"],
    `${prefixo}.feedbackCientifico`,
    problemas,
    40,
    500,
  );
  if (antes < problemas.length || id === null || rotulo === null || pesos === null || feedbackCientifico === null) {
    return null;
  }
  return { id, rotulo, pesos, feedbackCientifico };
}

function lerPesos(valor: unknown, prefixo: string, problemas: string[]): Pesos | null {
  if (!ehRegistro(valor)) {
    problemas.push(`${prefixo}: esperado um objeto`);
    return null;
  }
  const antes = problemas.length;
  exigirChaves(valor, CHAVES_PESOS, prefixo, problemas);
  const impacto = lerPeso(valor["impacto"], `${prefixo}.impacto`, problemas);
  const combustivel = lerPeso(valor["combustivel"], `${prefixo}.combustivel`, problemas);
  const seguranca = lerPeso(valor["seguranca"], `${prefixo}.seguranca`, problemas);
  if (antes < problemas.length || impacto === null || combustivel === null || seguranca === null) {
    return null;
  }
  return { impacto, combustivel, seguranca };
}

function lerPeso(valor: unknown, prefixo: string, problemas: string[]): number | null {
  if (typeof valor !== "number" || !Number.isInteger(valor) || valor < 0 || valor > PESO_MAXIMO) {
    problemas.push(`${prefixo}: inteiro de 0 a ${PESO_MAXIMO}`);
    return null;
  }
  return valor;
}

function conferirPesos(opcoes: readonly [OpcaoJogador, OpcaoJogador, OpcaoJogador], problemas: string[]): void {
  const assinaturas = new Set(opcoes.map((opcao) => assinatura(opcao.pesos)));
  if (assinaturas.size !== 3) {
    problemas.push("as três opções precisam de combinações diferentes de impacto, combustível e segurança");
  }
  for (const eixo of CHAVES_PESOS) {
    const valores = new Set(opcoes.map((opcao) => opcao.pesos[eixo]));
    if (valores.size < 2) {
      problemas.push(`o eixo "${eixo}" precisa variar entre as opções`);
    }
  }
}

function conferirFeedbacks(
  opcoes: readonly [OpcaoJogador, OpcaoJogador, OpcaoJogador],
  problemas: string[],
): void {
  const textos = opcoes.map((opcao) => opcao.feedbackCientifico.toLocaleLowerCase("pt-BR"));
  if (new Set(textos).size !== 3) {
    problemas.push("cada opção precisa de um feedback científico próprio");
  }
}

function assinatura(pesos: Pesos): string {
  return `${pesos.impacto}-${pesos.combustivel}-${pesos.seguranca}`;
}

function citaMissao(titulo: string, briefing: string, missao: string): boolean {
  const texto = `${titulo}\n${briefing}`.toLocaleLowerCase("pt-BR");
  return texto.includes(missao.toLocaleLowerCase("pt-BR"));
}

function lerId(valor: unknown, prefixo: string, problemas: string[]): IdOpcao | null {
  if (typeof valor === "string" && (IDS_OPCAO as readonly string[]).includes(valor)) {
    return valor as IdOpcao;
  }
  problemas.push(`${prefixo}: use ${IDS_OPCAO.join(", ")}`);
  return null;
}

function lerTexto(
  valor: unknown,
  prefixo: string,
  problemas: string[],
  minimo: number,
  maximo: number,
): string | null {
  if (typeof valor !== "string" || valor.trim() !== valor || valor.length < minimo || valor.length > maximo) {
    problemas.push(`${prefixo}: texto de ${minimo} a ${maximo} caracteres, sem espaço nas pontas`);
    return null;
  }
  return valor;
}

function exigirChaves(
  registro: Record<string, unknown>,
  esperadas: readonly string[],
  prefixo: string,
  problemas: string[],
): void {
  for (const chave of esperadas) {
    if (!(chave in registro)) {
      problemas.push(`${prefixo}: falta "${chave}"`);
    }
  }
  for (const chave of Object.keys(registro)) {
    if (!esperadas.includes(chave)) {
      problemas.push(`${prefixo}: campo desconhecido "${chave}"`);
    }
  }
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
