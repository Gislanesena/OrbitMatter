import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const serveBin = require.resolve("serve/build/main.js");

const child = spawn(process.execPath, [serveBin, ".", "--no-clipboard"], {
  cwd: root,
  stdio: ["inherit", "pipe", "pipe"],
});

let opened = false;

function forward(stream, chunk) {
  stream.write(chunk);
  if (opened) return;
  const match = chunk.toString().match(/https?:\/\/localhost:\d+/);
  if (!match) return;
  opened = true;
  const url = `${match[0]}/frontend/atlas-lixo-espacial.html`;
  spawn("cmd", ["/c", "start", "", url], {
    cwd: root,
    detached: true,
    stdio: "ignore",
    windowsHide: true,
  }).unref();
}

child.stdout.on("data", (chunk) => forward(process.stdout, chunk));
child.stderr.on("data", (chunk) => forward(process.stderr, chunk));

function stop() {
  if (!child.killed) child.kill();
}

process.on("SIGINT", stop);
process.on("SIGTERM", stop);

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
