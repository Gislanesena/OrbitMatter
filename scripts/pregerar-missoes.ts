/**
 * Grava dados-missoes.json (português) e o catálogo de reserva do navegador.
 * Sem ATLAS_IA_CHAVE o Game Master devolve a missão de reserva, com o texto do catálogo.
 * O prompt do modelo só existe em português, então este arquivo não tem versão em inglês.
 */
import { writeFileSync } from "node:fs";
import { catalogo } from "../data/artifacts.ts";
import { criarGameMaster } from "../ia/game-master/servico.ts";

const NIVEIS = ["baixo", "moderado", "alto"] as const;

async function main(): Promise<void> {
  const gm = criarGameMaster();
  const missoes: Record<string, Record<string, unknown>> = {};

  for (const artefato of catalogo) {
    const porNivel: Record<string, unknown> = {};
    for (const nivel of NIVEIS) {
      porNivel[nivel] = await gm.gerar({
        artefatoId: artefato.id,
        tipoObjeto: "artefato",
        local: artefato.local,
        nivelRisco: nivel,
      });
    }
    missoes[artefato.id] = porNivel;
  }

  writeFileSync(
    "dados-missoes.json",
    JSON.stringify(
      {
        idioma: "pt",
        aviso:
          "Sem ATLAS_IA_CHAVE este arquivo guarda a missão de reserva, escrita com o texto do catálogo. Com a chave no ambiente, o mesmo script grava a resposta do modelo. Não há versão em inglês: o prompt do Game Master é só em português.",
        missoes,
      },
      null,
      2,
    ),
    "utf8",
  );

  const reserva =
    "/* Gerado por scripts/pregerar-missoes.ts a partir de data/artifacts.ts.\n" +
    "   Só entra no jogo se dist/atlas-ia.js não carregar. Não edite à mão. */\n" +
    "window.ARTEFATOS_RESERVA = " +
    JSON.stringify(catalogo, null, 2) +
    ";\n";
  writeFileSync("js/artefatos-reserva.js", reserva, "utf8");
  console.log("dados-missoes.json e js/artefatos-reserva.js gravados.");
}

main().catch((erro: unknown) => {
  console.error(erro);
  process.exitCode = 1;
});
