# Etapa 4 — Fachada do atlas (`criarAtlas`)

Manual da interface. Catálogo, órbita e Game Master entram por um único objeto. A tela não importa `data/`, `ia/` nem `simulacao/`.

Os detalhes de cada pilar estão nos guias anteriores:

- `data/etapa-1-catalogo.md` — campos do artefato
- `ia/etapa-2-game-master.md` — missão, opções e reserva
- `simulacao/etapa-3-simulador.md` — sliders, ciclos e risco orbital

## Instanciar

Crie a fachada uma vez e reuse. Sem argumentos, ela usa o catálogo de Luna 2, Luna 9 e Surveyor 1 e o Game Master configurado no ambiente.

```ts
import { criarAtlas } from "./app/atlas.ts";

const atlas = criarAtlas();
```

Se o componente estiver dentro de `app/`, o import é `"./atlas.ts"`.

| Método | Quando usar | Retorno |
|---|---|---|
| `listarArtefatos()` | Montar a lista e o mapa | Array congelado de artefatos |
| `obterArtefato(id)` | Abrir a ficha de um id | Envelope com um artefato |
| `simularOrbita(parametros)` | Atualizar o gráfico ao mover um slider | Envelope com a série de ciclos |
| `pedirMissao(contexto)` | Gerar missão quando a tela já escolheu o risco | Envelope com a missão |
| `abrirJogada(pedido)` | Fluxo completo: artefato, órbita e missão | Envelope com a jogada |

`listarArtefatos` devolve o array direto. Os outros quatro usam o envelope abaixo. `pedirMissao` e `abrirJogada` são assíncronos.

Constantes para os controles, no mesmo import:

```ts
import { criarAtlas, IDS_OPCAO, LIMITES, NIVEIS_RISCO, RISCOS_ORBITAIS, TIPOS_OBJETO } from "./app/atlas.ts";
```

## Abrir uma jogada

`abrirJogada` é o fluxo único. A tela manda o alvo, o tipo de objeto, o local da observação e os sliders da órbita. O risco da missão sai do último ciclo. A tela não envia `nivelRisco` neste pedido.

Ordem interna:

1. Confere as quatro chaves do pedido.
2. Confere `artefatoId`, `tipoObjeto` e `local`.
3. Busca o artefato no catálogo.
4. Roda a simulação. Slider fora do limite interrompe aqui.
5. Lê o `risco` do último estado. `cascata` vira `alto` para o Game Master.
6. Gera a missão. Se o modelo falha, a reserva entra dentro de `dados`.

O modelo só é chamado depois do catálogo e da órbita válidos.

```ts
{
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
}
```

| Campo | Regra |
|---|---|
| `artefatoId` | `"luna-2"`, `"luna-9"` ou `"surveyor-1"` |
| `tipoObjeto` | `"sonda_de_impacto"`, `"modulo_de_pouso"` ou `"estagio_descartado"` |
| `local` | Texto de 1 a 160 caracteres, sem espaço nas pontas |
| `orbita` | Os cinco campos de `simularOrbita`. Ver `simulacao/etapa-3-simulador.md` |

O objeto da jogada tem só essas quatro chaves. A órbita tem só as cinco chaves dos sliders.

No sucesso, `dados` reúne as três peças:

| Campo | Uso na tela |
|---|---|
| `artefato` | Ficha do alvo |
| `orbita` | Série do ciclo 0 ao último. O gráfico usa este array |
| `riscoOrbital` | `"baixo"`, `"moderado"`, `"alto"` ou `"cascata"` |
| `nivelRisco` | O nível que a missão recebeu. `cascata` aparece aqui como `"alto"` |
| `missao` | Título, briefing e as três opções |
| `origem` | `"modelo"` ou `"reserva"` |
| `aviso` | `null` quando a missão veio do modelo. Texto curto quando veio da reserva |

## Envelope de resposta

Todo método com envelope devolve uma destas formas:

```ts
{ ok: true, dados: T }
{ ok: false, falha: Falha }
```

Leia `ok` antes de `dados`. Nenhuma dessas funções lança exceção para a tela.

`falha.pilar` diz qual parte recusou o pedido.

| `pilar` | `codigo` | O que a tela mostra |
|---|---|---|
| `catalogo` | `artefato_desconhecido` | `falha.aviso`. O id não está no acervo |
| `missao` | `contexto_invalido` | `falha.aviso`. Tipo, local ou id fora do formato |
| `missao` | `artefato_desconhecido` | `falha.aviso`, quando `pedirMissao` recebe um id ausente |
| `missao` | `falha_interna` | `falha.aviso`. A reserva também falhou |
| `simulacao` | `parametros_invalidos` | A lista `falha.problemas`, um item por slider |
| `simulacao` | `estado_invalido` | `falha.problemas`. A conta não produziu um estado válido |
| `orquestracao` | `pedido_invalido` | `falha.aviso`. Falta chave ou há campo desconhecido |
| `orquestracao` | `falha_interna` | `falha.aviso`. Falha inesperada, já convertida em envelope |

`pedirMissao` com o modelo indisponível continua `ok: true`. A reserva fica em `dados.origem` e `dados.aviso`. O mesmo vale para a missão dentro de `abrirJogada`.

`listarArtefatos()` fica fora do envelope. Se o módulo carregou, a lista está pronta.

## Exemplo de ponta a ponta

A lista escolhe o alvo. Os sliders atualizam o gráfico sozinhos. O botão abre a jogada com o alvo e a órbita juntos.

```ts
import { useState } from "react";
import { criarAtlas, LIMITES, type Artefato, type EstadoOrbital, type Jogada } from "./app/atlas.ts";

const atlas = criarAtlas();

const ORBITA_INICIAL = {
  objetosIniciais: 2000,
  lancamentosPorCiclo: 8,
  remocaoAtivaPorCiclo: 12,
  multiplicadorVelocidade: 1,
  ciclos: 40,
};

export function TelaDoAtlas() {
  const artefatos = atlas.listarArtefatos();
  const [artefatoId, setArtefatoId] = useState(artefatos[0]?.id ?? "luna-2");
  const [orbita, setOrbita] = useState(ORBITA_INICIAL);
  const [serie, setSerie] = useState<readonly EstadoOrbital[] | null>(null);
  const [jogada, setJogada] = useState<Jogada | null>(null);
  const [mensagens, setMensagens] = useState<readonly string[]>([]);

  function projetar() {
    const resposta = atlas.simularOrbita(orbita);
    if (!resposta.ok) {
      setSerie(null);
      setMensagens(resposta.falha.problemas);
      return;
    }
    setMensagens([]);
    setSerie(resposta.dados);
  }

  async function jogar() {
    const resposta = await atlas.abrirJogada({
      artefatoId,
      tipoObjeto: "modulo_de_pouso",
      local: "órbita lunar baixa",
      orbita,
    });

    if (!resposta.ok) {
      setJogada(null);
      setMensagens(textosDaFalha(resposta.falha));
      return;
    }

    setMensagens([]);
    setJogada(resposta.dados);
    setSerie(resposta.dados.orbita);
  }

  const ficha = atlas.obterArtefato(artefatoId);

  return (
    <main>
      <select value={artefatoId} onChange={(evento) => setArtefatoId(evento.target.value)}>
        {artefatos.map((artefato) => (
          <option key={artefato.id} value={artefato.id}>
            {artefato.missao}
          </option>
        ))}
      </select>

      {ficha.ok ? <p>{ficha.dados.local}</p> : <p>{ficha.falha.aviso}</p>}

      <label>
        Lançamentos: {orbita.lancamentosPorCiclo}
        <input
          type="range"
          min={LIMITES.lancamentosPorCiclo.min}
          max={LIMITES.lancamentosPorCiclo.max}
          step={1}
          value={orbita.lancamentosPorCiclo}
          onChange={(evento) =>
            setOrbita((atual) => ({ ...atual, lancamentosPorCiclo: Number(evento.target.value) }))
          }
        />
      </label>

      <button type="button" onClick={projetar}>
        Atualizar órbita
      </button>
      <button type="button" onClick={() => void jogar()}>
        Abrir jogada
      </button>

      {mensagens.map((mensagem) => (
        <p key={mensagem}>{mensagem}</p>
      ))}

      {serie ? <p>Risco orbital: {serie.at(-1)?.risco}</p> : null}

      {jogada ? (
        <section>
          <h2>{jogada.missao.titulo}</h2>
          <p>{jogada.missao.briefing}</p>
          {jogada.aviso ? <p>{jogada.aviso}</p> : null}
          <p>Risco da missão: {jogada.nivelRisco}</p>
        </section>
      ) : null}
    </main>
  );
}

function textosDaFalha(falha: { aviso?: string; problemas?: readonly string[] }): readonly string[] {
  if (falha.problemas) {
    return falha.problemas;
  }
  return falha.aviso ? [falha.aviso] : [];
}
```

`void jogar()` entrega a Promise ao clique. Dentro da função, `abrirJogada` já devolve `ok: false` em vez de lançar.

Uma ficha isolada, fora da jogada:

```ts
const resposta = atlas.obterArtefato("surveyor-1");

if (resposta.ok) {
  const artefato: Artefato = resposta.dados;
  console.log(artefato.missao);
}
```

Uma missão com risco escolhido na tela, sem passar pela órbita:

```ts
const resposta = await atlas.pedirMissao({
  artefatoId: "luna-2",
  tipoObjeto: "sonda_de_impacto",
  local: "sobre Palus Putredinis",
  nivelRisco: "alto",
});

if (resposta.ok && resposta.dados.origem === "reserva") {
  console.log(resposta.dados.aviso);
}
```
