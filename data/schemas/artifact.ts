/**
 * Contrato da Etapa 1: um artefato é um equipamento que permanece
 * num corpo (aqui, a Lua), não a missão inteira.
 *
 * Longitude positiva para leste, no intervalo [-180, 180].
 * A massa é a do objeto citado, nunca a do foguete completo:
 * "impacto" para quem chegou inteiro; "pousada" para o que ficou
 * no solo depois de ejetar estágio e consumir propelente.
 *
 * validarCatalogo é a única porta de entrada. Tipo nenhum sobrevive
 * sozinho em execução: um registro fora deste contrato é rejeitado
 * com a lista completa de problemas, antes de alguém plotar o mapa.
 */

export const CORPOS = ["lua"] as const;
export type Corpo = (typeof CORPOS)[number];

export const REFERENCIA_MASSA = ["impacto", "pousada"] as const;
export type ReferenciaMassa = (typeof REFERENCIA_MASSA)[number];

export const CONFIANCA_COORDENADA = ["estimada", "rastreada", "imageada"] as const;
export type ConfiancaCoordenada = (typeof CONFIANCA_COORDENADA)[number];

export const STATUS_ATUAL = ["fragmentado_no_impacto", "inativo_na_superficie"] as const;
export type StatusAtual = (typeof STATUS_ATUAL)[number];

export interface Coordenadas {
  readonly latitudeGraus: number;
  readonly longitudeLesteGraus: number;
  readonly confianca: ConfiancaCoordenada;
  /** Metros no solo. Só existe quando a posição foi medida em imagem. */
  readonly incertezaMetros: number | null;
}

export interface Artefato {
  readonly id: string;
  readonly cosparId: string;
  readonly nomeOriginal: string;
  readonly missao: string;
  readonly corpo: Corpo;
  /** Instante UTC em que o artefato chegou ao corpo. */
  readonly dataUtc: string;
  readonly operador: string;
  readonly massaKg: number;
  readonly referenciaMassa: ReferenciaMassa;
  readonly coordenadas: Coordenadas;
  readonly local: string;
  readonly historico: string;
  readonly statusAtual: StatusAtual;
}

export class CatalogoInvalidoError extends Error {
  readonly problemas: readonly string[];

  constructor(problemas: readonly string[]) {
    super(problemas.map((problema) => `- ${problema}`).join("\n"));
    this.name = "CatalogoInvalidoError";
    this.problemas = problemas;
  }
}

const IDENTIFICADOR = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const COSPAR = /^\d{4}-\d{3}[A-Z]$/;
const INSTANTE_UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;

const CHAVES_ARTEFATO = [
  "id",
  "cosparId",
  "nomeOriginal",
  "missao",
  "corpo",
  "dataUtc",
  "operador",
  "massaKg",
  "referenciaMassa",
  "coordenadas",
  "local",
  "historico",
  "statusAtual",
] as const;

const CHAVES_COORDENADAS = [
  "latitudeGraus",
  "longitudeLesteGraus",
  "confianca",
  "incertezaMetros",
] as const;

export function validarCatalogo(entrada: readonly unknown[]): readonly Artefato[] {
  if (!Array.isArray(entrada)) {
    throw new CatalogoInvalidoError(["o catálogo precisa ser uma lista"]);
  }

  const problemas: string[] = [];
  const artefatos: Artefato[] = [];
  const ids = new Set<string>();

  entrada.forEach((item, indice) => {
    const prefixo = `registro ${indice}`;
    const artefato = lerArtefato(item, prefixo, problemas);
    if (artefato === null) {
      return;
    }
    if (ids.has(artefato.id)) {
      problemas.push(`${prefixo}: id duplicado "${artefato.id}"`);
      return;
    }
    ids.add(artefato.id);
    artefatos.push(artefato);
  });

  if (problemas.length > 0) {
    throw new CatalogoInvalidoError(problemas);
  }

  return congelar(artefatos);
}

function lerArtefato(item: unknown, prefixo: string, problemas: string[]): Artefato | null {
  if (!ehRegistro(item)) {
    problemas.push(`${prefixo}: esperado um objeto`);
    return null;
  }

  const antes = problemas.length;
  exigirChaves(item, CHAVES_ARTEFATO, prefixo, problemas);

  const id = lerIdentificador(item["id"], `${prefixo}.id`, problemas);
  const cosparId = lerCospar(item["cosparId"], `${prefixo}.cosparId`, problemas);
  const nomeOriginal = lerTexto(item["nomeOriginal"], `${prefixo}.nomeOriginal`, problemas, 2);
  const missao = lerTexto(item["missao"], `${prefixo}.missao`, problemas, 2);
  const corpo = lerOpcao(item["corpo"], CORPOS, `${prefixo}.corpo`, problemas);
  const dataUtc = lerInstanteUtc(item["dataUtc"], `${prefixo}.dataUtc`, problemas);
  const operador = lerTexto(item["operador"], `${prefixo}.operador`, problemas, 2);
  const massaKg = lerMassa(item["massaKg"], `${prefixo}.massaKg`, problemas);
  const referenciaMassa = lerOpcao(
    item["referenciaMassa"],
    REFERENCIA_MASSA,
    `${prefixo}.referenciaMassa`,
    problemas,
  );
  const coordenadas = lerCoordenadas(item["coordenadas"], `${prefixo}.coordenadas`, problemas);
  const local = lerTexto(item["local"], `${prefixo}.local`, problemas, 3);
  const historico = lerTexto(item["historico"], `${prefixo}.historico`, problemas, 40);
  const statusAtual = lerOpcao(item["statusAtual"], STATUS_ATUAL, `${prefixo}.statusAtual`, problemas);

  if (
    referenciaMassa !== null &&
    statusAtual !== null &&
    !massaCombinaComStatus(referenciaMassa, statusAtual)
  ) {
    problemas.push(
      `${prefixo}: referenciaMassa "${referenciaMassa}" não combina com status "${statusAtual}"`,
    );
  }

  if (
    problemas.length > antes ||
    id === null ||
    cosparId === null ||
    nomeOriginal === null ||
    missao === null ||
    corpo === null ||
    dataUtc === null ||
    operador === null ||
    massaKg === null ||
    referenciaMassa === null ||
    coordenadas === null ||
    local === null ||
    historico === null ||
    statusAtual === null
  ) {
    return null;
  }

  return {
    id,
    cosparId,
    nomeOriginal,
    missao,
    corpo,
    dataUtc,
    operador,
    massaKg,
    referenciaMassa,
    coordenadas,
    local,
    historico,
    statusAtual,
  };
}

/**
 * Quem se fragmentou no impacto não tem massa "pousada".
 * Quem permanece íntegro na superfície não é descrito pela massa de lançamento.
 */
function massaCombinaComStatus(referencia: ReferenciaMassa, status: StatusAtual): boolean {
  if (status === "fragmentado_no_impacto") {
    return referencia === "impacto";
  }
  return referencia === "pousada";
}

function lerCoordenadas(valor: unknown, prefixo: string, problemas: string[]): Coordenadas | null {
  if (!ehRegistro(valor)) {
    problemas.push(`${prefixo}: esperado um objeto`);
    return null;
  }

  const antes = problemas.length;
  exigirChaves(valor, CHAVES_COORDENADAS, prefixo, problemas);

  const latitudeGraus = lerFaixa(valor["latitudeGraus"], `${prefixo}.latitudeGraus`, problemas, -90, 90);
  const longitudeLesteGraus = lerFaixa(
    valor["longitudeLesteGraus"],
    `${prefixo}.longitudeLesteGraus`,
    problemas,
    -180,
    180,
  );
  const confianca = lerOpcao(
    valor["confianca"],
    CONFIANCA_COORDENADA,
    `${prefixo}.confianca`,
    problemas,
  );
  const incertezaMetros = lerIncerteza(valor["incertezaMetros"], `${prefixo}.incertezaMetros`, problemas);

  if (confianca !== null && incertezaMetros !== undefined) {
    const imageada = confianca === "imageada";
    const temIncerteza = typeof incertezaMetros === "number";
    if (imageada !== temIncerteza) {
      problemas.push(
        `${prefixo}: incertezaMetros é obrigatória só quando confianca é "imageada"`,
      );
    }
  }

  if (
    problemas.length > antes ||
    latitudeGraus === null ||
    longitudeLesteGraus === null ||
    confianca === null ||
    incertezaMetros === undefined
  ) {
    return null;
  }

  return { latitudeGraus, longitudeLesteGraus, confianca, incertezaMetros };
}

function lerIncerteza(valor: unknown, prefixo: string, problemas: string[]): number | null | undefined {
  if (valor === null) {
    return null;
  }
  if (typeof valor !== "number" || !Number.isFinite(valor) || valor <= 0) {
    problemas.push(`${prefixo}: use null ou um número de metros maior que zero`);
    return undefined;
  }
  return valor;
}

function lerIdentificador(valor: unknown, prefixo: string, problemas: string[]): string | null {
  if (typeof valor !== "string" || !IDENTIFICADOR.test(valor)) {
    problemas.push(`${prefixo}: use um id estável em minúsculas, como "luna-2"`);
    return null;
  }
  return valor;
}

function lerCospar(valor: unknown, prefixo: string, problemas: string[]): string | null {
  if (typeof valor !== "string" || !COSPAR.test(valor)) {
    problemas.push(`${prefixo}: COSPAR no formato AAAA-NNNX, como "1959-014A"`);
    return null;
  }
  return valor;
}

function lerInstanteUtc(valor: unknown, prefixo: string, problemas: string[]): string | null {
  if (typeof valor !== "string" || !INSTANTE_UTC.test(valor)) {
    problemas.push(`${prefixo}: use AAAA-MM-DDTHH:MM:SSZ`);
    return null;
  }

  const milissegundos = Date.parse(valor);
  const canonico = `${valor.slice(0, 19)}.000Z`;
  if (Number.isNaN(milissegundos) || new Date(milissegundos).toISOString() !== canonico) {
    problemas.push(`${prefixo}: instante civil inexistente`);
    return null;
  }
  if (milissegundos > Date.now()) {
    problemas.push(`${prefixo}: um artefato histórico não chega no futuro`);
    return null;
  }
  return valor;
}

function lerMassa(valor: unknown, prefixo: string, problemas: string[]): number | null {
  if (typeof valor !== "number" || !Number.isFinite(valor) || valor <= 0) {
    problemas.push(`${prefixo}: massa em kg, número finito maior que zero`);
    return null;
  }
  return valor;
}

function lerTexto(
  valor: unknown,
  prefixo: string,
  problemas: string[],
  minimo: number,
): string | null {
  if (typeof valor !== "string" || valor.trim() !== valor || valor.trim().length < minimo) {
    problemas.push(`${prefixo}: texto obrigatório, sem espaço nas pontas (mínimo ${minimo})`);
    return null;
  }
  return valor;
}

function lerFaixa(
  valor: unknown,
  prefixo: string,
  problemas: string[],
  minimo: number,
  maximo: number,
): number | null {
  if (typeof valor !== "number" || !Number.isFinite(valor) || valor < minimo || valor > maximo) {
    problemas.push(`${prefixo}: número entre ${minimo} e ${maximo}`);
    return null;
  }
  return valor;
}

function lerOpcao<T extends string>(
  valor: unknown,
  opcoes: readonly T[],
  prefixo: string,
  problemas: string[],
): T | null {
  if (typeof valor === "string" && opcoes.includes(valor as T)) {
    return valor as T;
  }
  problemas.push(`${prefixo}: use um destes valores: ${opcoes.join(", ")}`);
  return null;
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
