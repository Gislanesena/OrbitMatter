import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import chatHandler from "../api/chat.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const serveHandler = require("serve-handler");
const maxBodyBytes = 64 * 1024;
const port = Number(process.env.PORT || 3000);

const server = createServer((request, response) => {
  void handleRequest(request, response).catch((error) => {
    console.error("Falha ao atender requisição local:", error);
    if (!response.headersSent) {
      sendJson(response, 500, { error: "Erro interno do servidor." });
    } else {
      response.destroy();
    }
  });
});

async function handleRequest(request, response) {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url || "/", "http://localhost").pathname);
  } catch {
    sendJson(response, 400, { error: "Endereço inválido." });
    return;
  }

  if (pathname === "/api/chat") {
    await handleChat(request, response);
    return;
  }

  const segments = pathname.split("/").filter(Boolean);
  if (pathname.includes("%") || segments.some((segment) => (
    segment.startsWith(".")
    || segment.toLowerCase() === "api"
    || segment.toLowerCase() === "node_modules"
  ))) {
    response.statusCode = 404;
    response.end("Not Found");
    return;
  }

  await serveHandler(request, response, {
    public: root,
    directoryListing: false,
  });
}

async function handleChat(request, response) {
  let body = null;
  if (request.method === "POST") {
    const recebido = await readBody(request);
    if (recebido.tooLarge) {
      sendJson(response, 413, { error: "Pedido grande demais." });
      return;
    }
    body = recebido.text;
  }

  await chatHandler(
    { method: request.method, headers: request.headers, body },
    {
      setHeader(name, value) {
        response.setHeader(name, value);
      },
      status(code) {
        response.statusCode = code;
        return this;
      },
      json(value) {
        sendJson(response, response.statusCode, value);
      },
    },
  );
}

async function readBody(request) {
  const chunks = [];
  let totalBytes = 0;
  let tooLarge = false;

  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    totalBytes += buffer.length;
    if (totalBytes > maxBodyBytes) {
      tooLarge = true;
    } else if (!tooLarge) {
      chunks.push(buffer);
    }
  }

  return {
    text: tooLarge ? "" : Buffer.concat(chunks).toString("utf8"),
    tooLarge,
  };
}

function sendJson(response, status, value) {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(value));
}

server.on("error", (error) => {
  console.error("Não foi possível iniciar o servidor local:", error.message);
  process.exitCode = 1;
});

server.listen(port, "127.0.0.1", () => {
  const url = `http://localhost:${port}/`;
  console.info(`INFO  Servindo site e API em ${url}`);
  spawn("cmd", ["/c", "start", "", url], {
    cwd: root,
    detached: true,
    stdio: "ignore",
    windowsHide: true,
  }).unref();
});
