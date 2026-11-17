import type { MensagemDeConversa, PedidoAoModelo } from "../game-master/prompt.ts";
import { promptDoChat, type IdiomaChat } from "./prompt.ts";

export interface EntradaChat {
  readonly idioma: IdiomaChat;
  readonly mensagem: string;
  readonly historico: readonly MensagemDeConversa[];
}

export type EntradaChatLida =
  | { readonly ok: true; readonly valor: EntradaChat }
  | { readonly ok: false; readonly aviso: string };

const MAX_MENSAGEM = 500;
const MAX_HISTORICO = 10;
const MAX_TEXTO_HISTORICO = 1000;
const MAX_TEXTO_TOTAL = 8000;
const CHAVES_ACEITAS = ["language", "message", "history"] as const;

export function lerEntradaChat(entrada: unknown): EntradaChatLida {
  if (!ehRegistro(entrada)) {
    return recusar("O pedido do chat precisa ser um objeto.");
  }
  if (Object.keys(entrada).some((chave) => !CHAVES_ACEITAS.includes(chave as (typeof CHAVES_ACEITAS)[number]))) {
    return recusar("O pedido do chat contém campos desconhecidos.");
  }

  const idioma = entrada["language"];
  const mensagem = textoLimitado(entrada["message"], MAX_MENSAGEM);
  const historico = lerHistorico(entrada["history"]);
  if ((idioma !== "pt" && idioma !== "en") || mensagem === null || historico === null) {
    return recusar("Idioma, mensagem ou histórico inválido.");
  }

  const tamanhoTotal = mensagem.length + historico.reduce((total, item) => total + item.content.length, 0);
  if (tamanhoTotal > MAX_TEXTO_TOTAL) {
    return recusar("A conversa excedeu o tamanho permitido.");
  }

  return {
    ok: true,
    valor: { idioma, mensagem, historico },
  };
}

export function montarPedidoChat(entrada: EntradaChat): PedidoAoModelo {
  return {
    sistema: promptDoChat(entrada.idioma),
    usuario: entrada.mensagem,
    historico: entrada.historico,
  };
}

function lerHistorico(valor: unknown): readonly MensagemDeConversa[] | null {
  if (valor === undefined) {
    return [];
  }
  if (!Array.isArray(valor) || valor.length > MAX_HISTORICO) {
    return null;
  }

  const mensagens: MensagemDeConversa[] = [];
  for (const item of valor) {
    if (!ehRegistro(item)) {
      return null;
    }
    const role = item["role"];
    const content = textoLimitado(item["content"], MAX_TEXTO_HISTORICO);
    if ((role !== "user" && role !== "assistant") || content === null) {
      return null;
    }
    mensagens.push({ role, content });
  }
  return mensagens;
}

function textoLimitado(valor: unknown, maximo: number): string | null {
  if (typeof valor !== "string") {
    return null;
  }
  const texto = valor.trim();
  return texto.length > 0 && texto.length <= maximo ? texto : null;
}

function recusar(aviso: string): EntradaChatLida {
  return { ok: false, aviso };
}

function ehRegistro(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}
