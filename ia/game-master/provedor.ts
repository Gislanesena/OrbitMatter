/**
 * Transporte até um endpoint de chat no formato da API da OpenAI.
 * Sem chave, URL inválida ou rede, a chamada falha com ErroDeProvedor
 * e o serviço troca para a missão de reserva.
 */
import type { PedidoAoModelo } from "./prompt.ts";

export interface ProvedorDeTexto {
  completar(pedido: PedidoAoModelo): Promise<string>;
}

export interface AmbienteIa {
  readonly url: string | null;
  readonly chave: string | null;
  readonly modelo: string;
  readonly tempoLimiteMs: number;
}

export class ErroDeProvedor extends Error {
  readonly codigo: "indisponivel" | "tempo_esgotado" | "resposta_http" | "resposta_vazia";

  constructor(
    codigo: "indisponivel" | "tempo_esgotado" | "resposta_http" | "resposta_vazia",
    mensagem: string,
  ) {
    super(mensagem);
    this.name = "ErroDeProvedor";
    this.codigo = codigo;
  }
}

const URL_PADRAO = "https://api.openai.com/v1/chat/completions";
const MODELO_PADRAO = "gpt-4o-mini";
const TEMPO_PADRAO_MS = 15_000;

export function lerAmbiente(env: Readonly<Record<string, string | undefined>>): AmbienteIa {
  const urlInformada = env["ATLAS_IA_URL"]?.trim();
  const chave = env["ATLAS_IA_CHAVE"]?.trim() ?? "";
  const modelo = env["ATLAS_IA_MODELO"]?.trim() || MODELO_PADRAO;
  const tempo = Number(env["ATLAS_IA_TEMPO_MS"]);

  return {
    url: urlHttp(urlInformada && urlInformada.length > 0 ? urlInformada : URL_PADRAO),
    chave: chave.length > 0 ? chave : null,
    modelo,
    tempoLimiteMs: Number.isFinite(tempo) && tempo >= 1000 ? tempo : TEMPO_PADRAO_MS,
  };
}

export function criarProvedorCompativel(ambiente: AmbienteIa): ProvedorDeTexto {
  return {
    completar(pedido) {
      return completar(ambiente, pedido, true);
    },
  };
}

export function criarProvedorChat(ambiente: AmbienteIa): ProvedorDeTexto {
  return {
    completar(pedido) {
      return completar(ambiente, pedido, false);
    },
  };
}

async function completar(ambiente: AmbienteIa, pedido: PedidoAoModelo, jsonForcado: boolean): Promise<string> {
  if (ambiente.chave === null || ambiente.url === null) {
    throw new ErroDeProvedor("indisponivel", "Modelo sem chave ou sem URL http(s).");
  }

  const buscar = buscarGlobal();
  const sinal = sinalDeTempo(ambiente.tempoLimiteMs);
  let resposta: RespostaMinima;
  try {
    resposta = await buscar(ambiente.url, {
      method: "POST",
      headers: {
        authorization: `Bearer ${ambiente.chave}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(corpoDaRequisicao(ambiente.modelo, pedido, jsonForcado)),
      signal: sinal,
    });
  } catch (erro) {
    if (ehAborto(erro)) {
      throw new ErroDeProvedor("tempo_esgotado", "O modelo excedeu o tempo limite.");
    }
    throw new ErroDeProvedor("indisponivel", "Não foi possível contactar o modelo.");
  }

  if (resposta.status === 400 && jsonForcado) {
    return completar(ambiente, pedido, false);
  }
  if (!resposta.ok) {
    throw new ErroDeProvedor("resposta_http", `O modelo respondeu HTTP ${resposta.status}.`);
  }

  let corpo: unknown;
  try {
    corpo = await resposta.json();
  } catch {
    throw new ErroDeProvedor("resposta_vazia", "O corpo da resposta não é JSON.");
  }
  return lerTextoDaResposta(corpo);
}

function corpoDaRequisicao(modelo: string, pedido: PedidoAoModelo, jsonForcado: boolean): unknown {
  const base = {
    model: modelo,
    temperature: 0.4,
    messages: [
      { role: "system", content: pedido.sistema },
      ...(pedido.historico ?? []),
      { role: "user", content: pedido.usuario },
    ],
  };
  if (!jsonForcado) {
    return base;
  }
  return { ...base, response_format: { type: "json_object" } };
}

function lerTextoDaResposta(corpo: unknown): string {
  if (!ehRegistro(corpo) || !Array.isArray(corpo["choices"]) || corpo["choices"].length === 0) {
    throw new ErroDeProvedor("resposta_vazia", "A resposta não trouxe escolhas.");
  }
  const primeira = corpo["choices"][0];
  if (!ehRegistro(primeira) || !ehRegistro(primeira["message"])) {
    throw new ErroDeProvedor("resposta_vazia", "A resposta não trouxe mensagem.");
  }
  const conteudo = primeira["message"]["content"];
  if (typeof conteudo !== "string" || conteudo.trim() === "") {
    throw new ErroDeProvedor("resposta_vazia", "A mensagem do modelo veio vazia.");
  }
  return conteudo;
}

interface UrlAnalisada {
  readonly protocol: string;
  toString(): string;
}

declare const URL: new (valor: string) => UrlAnalisada;

function urlHttp(valor: string): string | null {
  try {
    const url = new URL(valor);
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}

interface SinalDeAborto {
  readonly aborted: boolean;
}

interface RespostaMinima {
  readonly ok: boolean;
  readonly status: number;
  json(): Promise<unknown>;
}

type Buscar = (
  url: string,
  init: {
    method: "POST";
    headers: Record<string, string>;
    body: string;
    signal: SinalDeAborto;
  },
) => Promise<RespostaMinima>;

function buscarGlobal(): Buscar {
  const candidato = (globalThis as { fetch?: Buscar }).fetch;
  if (typeof candidato !== "function") {
    throw new ErroDeProvedor("indisponivel", "Este runtime não tem fetch.");
  }
  return candidato;
}

function sinalDeTempo(ms: number): SinalDeAborto {
  const fabrica = (globalThis as { AbortSignal?: { timeout?: (tempo: number) => SinalDeAborto } }).AbortSignal;
  if (fabrica?.timeout === undefined) {
    throw new ErroDeProvedor("indisponivel", "Este runtime não limita o tempo da chamada.");
  }
  return fabrica.timeout(ms);
}

function ehAborto(erro: unknown): boolean {
  return ehRegistro(erro) && erro["name"] === "AbortError";
}

function ehRegistro(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null;
}
