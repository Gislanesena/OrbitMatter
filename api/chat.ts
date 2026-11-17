import { lerEntradaChat, montarPedidoChat } from "../ia/chat/servico.ts";
import { criarProvedorChat, ErroDeProvedor, lerAmbiente } from "../ia/game-master/provedor.ts";

interface ApiRequest {
  readonly method?: string;
  readonly headers: Readonly<Record<string, string | readonly string[] | undefined>>;
  readonly body?: unknown;
}

interface ApiResponse {
  setHeader(name: string, value: string): void;
  status(code: number): ApiResponse;
  json(body: unknown): void;
}

interface AmbienteNode {
  readonly process?: { readonly env?: Readonly<Record<string, string | undefined>> };
  readonly console?: { error(...dados: unknown[]): void };
}

interface Limite {
  count: number;
  resetAt: number;
}

const URL_GROQ = "https://api.groq.com/openai/v1/chat/completions";
const MODELO_PADRAO = "llama-3.3-70b-versatile";
const TEMPO_LIMITE_MS = "8000";
const MAX_POR_MINUTO = 20;
const JANELA_MS = 60_000;
const limites = new Map<string, Limite>();

export const config = { maxDuration: 10 };

export default async function handler(req: ApiRequest, res: ApiResponse): Promise<void> {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Método não permitido." });
    return;
  }
  if (!contentTypeJson(req.headers)) {
    res.status(415).json({ error: "Envie o pedido como JSON." });
    return;
  }
  if (!origemPermitida(req.headers)) {
    res.status(403).json({ error: "Origem não permitida." });
    return;
  }
  if (limiteAtingido(req.headers)) {
    res.setHeader("Retry-After", "60");
    res.status(429).json({ error: "Muitas mensagens. Aguarde um minuto e tente novamente." });
    return;
  }

  const entrada = lerEntradaChat(parseBody(req.body));
  if (!entrada.ok) {
    res.status(400).json({ error: entrada.aviso });
    return;
  }

  const env = (globalThis as AmbienteNode).process?.env ?? {};
  const chave = env["GROQ_API_KEY"]?.trim();
  if (!chave) {
    res.status(503).json({
      error: entrada.valor.idioma === "en"
        ? "The AI chat is not configured on this deployment."
        : "O chat com IA não está configurado neste deploy.",
    });
    return;
  }

  const ambiente = lerAmbiente({
    ATLAS_IA_CHAVE: chave,
    ATLAS_IA_URL: URL_GROQ,
    ATLAS_IA_MODELO: env["GROQ_MODEL"]?.trim() || MODELO_PADRAO,
    ATLAS_IA_TEMPO_MS: TEMPO_LIMITE_MS,
  });
  const provedor = criarProvedorChat(ambiente);

  try {
    const resposta = await provedor.completar(montarPedidoChat(entrada.valor));
    res.status(200).json({ reply: resposta });
  } catch (erro) {
    const consoleNode = (globalThis as AmbienteNode).console;
    if (erro instanceof ErroDeProvedor) {
      consoleNode?.error("Falha no provedor de chat:", erro.codigo);
      res.status(erro.codigo === "tempo_esgotado" ? 504 : 502).json({
        error: entrada.valor.idioma === "en"
          ? "The AI service did not respond. Please try again."
          : "O serviço de IA não respondeu. Tente novamente.",
      });
      return;
    }

    consoleNode?.error("Falha inesperada na rota de chat.");
    res.status(500).json({
      error: entrada.valor.idioma === "en"
        ? "The chat could not complete your request."
        : "O chat não conseguiu concluir sua solicitação.",
    });
  }
}

function contentTypeJson(headers: ApiRequest["headers"]): boolean {
  return readHeader(headers, "content-type")?.toLowerCase().includes("application/json") ?? false;
}

function origemPermitida(headers: ApiRequest["headers"]): boolean {
  const origin = readHeader(headers, "origin");
  if (origin === null) {
    return true;
  }
  const host = readHeader(headers, "x-forwarded-host") ?? readHeader(headers, "host");
  if (host === null) {
    return false;
  }
  const originHost = /^https?:\/\/([^/?#]+)/i.exec(origin)?.[1];
  const requestHost = host.split(",")[0]?.trim();
  return originHost !== undefined && requestHost !== undefined
    && originHost.toLowerCase() === requestHost.toLowerCase();
}

function limiteAtingido(headers: ApiRequest["headers"]): boolean {
  const ip = readHeader(headers, "x-forwarded-for")?.split(",")[0]?.trim() || "desconhecido";
  const agora = Date.now();
  const atual = limites.get(ip);
  if (atual === undefined || atual.resetAt <= agora) {
    limites.set(ip, { count: 1, resetAt: agora + JANELA_MS });
    return false;
  }
  if (atual.count >= MAX_POR_MINUTO) {
    return true;
  }
  atual.count += 1;
  return false;
}

function readHeader(headers: ApiRequest["headers"], nome: string): string | null {
  const value = headers[nome];
  if (typeof value === "string") {
    return value;
  }
  return Array.isArray(value) ? value[0] ?? null : null;
}

function parseBody(body: unknown): unknown {
  if (typeof body !== "string") {
    return body;
  }
  try {
    return JSON.parse(body) as unknown;
  } catch {
    return null;
  }
}
