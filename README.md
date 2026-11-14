# OrbitMatter

Atlas do lixo espacial. O protótipo visual continua na raiz (`Atlas do Lixo Espacial.html`, `atlas.css`, `dados-objetos.js`). A lógica tipada que a interface consome fica nas pastas abaixo.

## Estrutura

| Pasta | Conteúdo |
|---|---|
| `data/` | Catálogo de artefatos. `artifacts.ts` guarda Luna 2, Luna 9 e Surveyor 1. `schemas/artifact.ts` valida cada registro. |
| `ia/` | Game Master. O esquema de entrada e de missão fica em `ia/esquema/`. O prompt, a reserva e a chamada ao modelo ficam em `ia/game-master/`. |
| `simulacao/` | Motor orbital da Síndrome de Kessler. Cada ciclo é uma função pura. |
| `app/atlas.ts` | Fachada única. Exporta `criarAtlas()`, os tipos e as constantes dos controles. |

A tela importa só `app/atlas.ts`. Catálogo, missão e órbita passam por esse módulo.

## Como importar a fachada

Na raiz do repositório:

```ts
import { criarAtlas, LIMITES, TIPOS_OBJETO, NIVEIS_RISCO } from "./app/atlas.ts";

const atlas = criarAtlas();
```

Dentro de `app/`, o caminho é `"./atlas.ts"`.

```ts
const artefatos = atlas.listarArtefatos();

const ficha = atlas.obterArtefato("luna-9");
if (ficha.ok) {
  console.log(ficha.dados.missao);
}

const orbita = atlas.simularOrbita({
  objetosIniciais: 2000,
  lancamentosPorCiclo: 8,
  remocaoAtivaPorCiclo: 12,
  multiplicadorVelocidade: 1,
  ciclos: 40,
});

const jogada = await atlas.abrirJogada({
  artefatoId: "luna-9",
  tipoObjeto: "modulo_de_pouso",
  local: "órbita lunar baixa",
  orbita: {
    objetosIniciais: 2000,
    lancamentosPorCiclo: 8,
    remocaoAtivaPorCiclo: 12,
    multiplicadorVelocidade: 1,
    ciclos: 40,
  },
});
```

`obterArtefato`, `simularOrbita`, `pedirMissao` e `abrirJogada` devolvem `{ ok: true, dados }` ou `{ ok: false, falha }`. Leia `ok` antes de usar `dados`. Essas funções não lançam exceção para a tela.

`abrirJogada` valida o artefato, roda a órbita e só então pede a missão. O risco `cascata` entra na missão como `alto`. Se o modelo estiver indisponível, a missão de reserva chega com `origem: "reserva"`.

Os limites dos sliders estão em `LIMITES`. `TIPOS_OBJETO` e `NIVEIS_RISCO` fecham os selects da jogada.

## Verificação de tipos

```bash
npm install
npm run verificar
```

`tsconfig.json` usa `strict`, `noUncheckedIndexedAccess` e `exactOptionalPropertyTypes`. `npm run verificar` roda `tsc --noEmit` sobre `data/`, `ia/`, `simulacao/` e `app/`.

Para chamar o modelo de verdade, defina `ATLAS_IA_CHAVE`. Sem essa chave, `pedirMissao` e `abrirJogada` entregam a missão montada a partir do catálogo.
