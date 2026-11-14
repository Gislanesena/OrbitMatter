# Etapa 1 — Catálogo de artefatos históricos

Guia para quem vai mostrar Luna 2, Luna 9 e Surveyor 1 na interface.

Um **artefato** é o equipamento que ficou na Lua. A missão inteira, o foguete e os estágios ejetados ficam de fora deste registro.

## Onde os dados estão

| Arquivo | Papel |
|---|---|
| `data/artifacts.ts` | Os três registros, em ordem cronológica |
| `data/schemas/artifact.ts` | O formato de cada objeto e a validação |
| `app/atlas.ts` | A porta que a interface importa |

O arquivo `data/artifacts.ts` é a fonte. Ao carregar, cada registro passa pelo validador. A lista exportada se chama `catalogo` e já chega congelada: a tela lê os campos e não os altera.

Na interface, use a fachada. Ela entrega o mesmo acervo e devolve um aviso estável quando o id não existe.

```ts
import { criarAtlas } from "./app/atlas.ts";

const atlas = criarAtlas();
```

Se o componente estiver dentro de `app/`, o import é `"./atlas.ts"`.

## Formato de um artefato

Todos os objetos têm os mesmos campos.

| Campo | O que mostrar na tela |
|---|---|
| `id` | Chave estável da rota e da busca. Ex.: `"luna-2"` |
| `cosparId` | Identificador internacional. Ex.: `"1959-014A"` |
| `nomeOriginal` | Nome de fábrica ou nome na língua de origem |
| `missao` | Nome curto para título e marcador no mapa |
| `corpo` | Corpo onde o equipamento está. Nesta etapa, sempre `"lua"` |
| `dataUtc` | Instante UTC em que chegou à Lua, no formato `AAAA-MM-DDTHH:MM:SSZ` |
| `operador` | Agência ou escritório responsável |
| `massaKg` | Massa do objeto que ficou na Lua, em quilogramas |
| `referenciaMassa` | `"impacto"` se a nave chegou inteira; `"pousada"` se o número é o que restou no solo |
| `coordenadas` | Latitude, longitude leste, confiança e incerteza |
| `local` | Nome do sítio, pronto para legenda |
| `historico` | Texto corrido para o painel de detalhe |
| `statusAtual` | `"fragmentado_no_impacto"` ou `"inativo_na_superficie"` |

### Coordenadas

- `latitudeGraus`: positivo ao norte, negativo ao sul, de −90 a 90.
- `longitudeLesteGraus`: positivo a leste, negativo a oeste, de −180 a 180.
- `confianca`: `"estimada"`, `"rastreada"` ou `"imageada"`.
- `incertezaMetros`: metros no solo quando a posição foi medida em imagem. Nos outros casos, `null`.

Para um pin no mapa, use `latitudeGraus` e `longitudeLesteGraus` direto. Para a legenda, use `local`.

### Massa

`massaKg` é a massa do artefato citado, não a do foguete.

- Luna 2: `390.2` kg no impacto (`referenciaMassa: "impacto"`).
- Luna 9: `99` kg da cápsula pousada (`"pousada"`).
- Surveyor 1: `294.3` kg no solo, depois de ejetar radar e retrofoguete (`"pousada"`).

## Os três artefatos

A ordem de `listarArtefatos()` é a ordem cronológica.

| `id` | `missao` | Chegada (UTC) | Massa | Sítio | Status |
|---|---|---|---|---|---|
| `luna-2` | Luna 2 | 1959-09-13 21:02:24 | 390,2 kg no impacto | Palus Putredinis, 29,1° N, 0° | Fragmentado no impacto |
| `luna-9` | Luna 9 | 1966-02-03 18:44:52 | 99 kg pousados | Oceanus Procellarum, 7,08° N, 64,37° O | Inativo na superfície |
| `surveyor-1` | Surveyor 1 | 1966-06-02 06:17:36 | 294,3 kg pousados | Anel de Flamsteed, 2,4745° S, 43,3398° O | Inativo na superfície; posição imageada, ±5,6 m |

Longitude oeste na tabela é só leitura humana. No objeto, Surveyor 1 está em `longitudeLesteGraus: -43.3398` e Luna 9 em `-64.37`.

### Exemplo completo: Luna 2

```ts
{
  id: "luna-2",
  cosparId: "1959-014A",
  nomeOriginal: "Луна-2 (E-1A No.7)",
  missao: "Luna 2",
  corpo: "lua",
  dataUtc: "1959-09-13T21:02:24Z",
  operador: "União Soviética (OKB-1)",
  massaKg: 390.2,
  referenciaMassa: "impacto",
  coordenadas: {
    latitudeGraus: 29.1,
    longitudeLesteGraus: 0,
    confianca: "estimada",
    incertezaMetros: null,
  },
  local: "Palus Putredinis, entre as crateras Archimedes e Autolycus",
  historico: "Primeiro objeto construído por humanos a atingir outro corpo celeste. ...",
  statusAtual: "fragmentado_no_impacto",
}
```

Luna 9 e Surveyor 1 repetem essa forma. Mudam id, textos, números, `referenciaMassa`, `confianca` e `statusAtual`.

## Listar na interface

`listarArtefatos()` devolve o array congelado. Não há estado de erro: se o módulo carregou, a lista está válida.

```ts
import { criarAtlas, type Artefato } from "./app/atlas.ts";

const atlas = criarAtlas();

export function CartaoDeArtefato({ artefato }: { artefato: Artefato }) {
  return (
    <article>
      <h2>{artefato.missao}</h2>
      <p>{artefato.nomeOriginal}</p>
      <p>{artefato.local}</p>
      <p>{artefato.massaKg} kg</p>
    </article>
  );
}

export function ListaDoCatalogo() {
  const artefatos = atlas.listarArtefatos();

  return (
    <ul>
      {artefatos.map((artefato) => (
        <li key={artefato.id}>
          <CartaoDeArtefato artefato={artefato} />
        </li>
      ))}
    </ul>
  );
}
```

Use `artefato.id` como `key`. Os ids desta etapa são `luna-2`, `luna-9` e `surveyor-1`.

## Buscar um artefato pelo id

`obterArtefato` responde de dois jeitos:

```ts
{ ok: true, dados: Artefato }
{ ok: false, falha: { pilar: "catalogo", codigo: "artefato_desconhecido", aviso: string } }
```

Confira `ok` antes de ler `dados`. Um id desconhecido não lança exceção.

```ts
import { criarAtlas } from "./app/atlas.ts";

const atlas = criarAtlas();

const resposta = atlas.obterArtefato("luna-9");

if (resposta.ok) {
  console.log(resposta.dados.missao); // "Luna 9"
  console.log(resposta.dados.coordenadas.latitudeGraus); // 7.08
} else {
  console.log(resposta.falha.aviso);
}
```

### Página de detalhe

O id pode vir da URL. Trate o caso em que ele não está no catálogo.

```ts
import { criarAtlas, type Artefato } from "./app/atlas.ts";

const atlas = criarAtlas();

export function PaginaDoArtefato({ id }: { id: string }) {
  const resposta = atlas.obterArtefato(id);

  if (!resposta.ok) {
    return <p>{resposta.falha.aviso}</p>;
  }

  return <Ficha artefato={resposta.dados} />;
}

function Ficha({ artefato }: { artefato: Artefato }) {
  const { coordenadas } = artefato;

  return (
    <section>
      <h1>{artefato.missao}</h1>
      <p>{artefato.nomeOriginal}</p>
      <p>{artefato.operador}</p>
      <p>{artefato.local}</p>
      <p>
        {coordenadas.latitudeGraus}°, {coordenadas.longitudeLesteGraus}° L
      </p>
      <p>{artefato.historico}</p>
    </section>
  );
}
```

Chamadas úteis:

```ts
atlas.obterArtefato("luna-2");
atlas.obterArtefato("luna-9");
atlas.obterArtefato("surveyor-1");
```

`"Luna 2"`, `"Luna-2"` e `"surveyor"` não encontram registro. O id é minúsculo, com hífen: `luna-2`, `luna-9`, `surveyor-1`.
