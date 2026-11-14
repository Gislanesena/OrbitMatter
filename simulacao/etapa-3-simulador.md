# Etapa 3 — Simulador orbital (Síndrome de Kessler)

Guia para ligar os controles da tela ao cálculo de população, colisões e risco.

A simulação é síncrona e pura. Os mesmos sliders produzem a mesma série. Cada ciclo devolve um estado novo; o array anterior permanece congelado.

A escala é didática. Os números atravessam o limiar de Kessler dentro do alcance dos controles. O gráfico mostra o efeito das escolhas do jogador, não uma previsão do catálogo real em órbita baixa.

## Onde isso mora

| Arquivo | Papel |
|---|---|
| `app/atlas.ts` | Porta da interface: `simularOrbita` e `LIMITES` |
| `simulacao/simular.ts` | Roda vários ciclos e devolve a série |
| `simulacao/transicao.ts` | Um ciclo, em função pura |
| `simulacao/parametros.ts` | Limites dos sliders |

Na tela:

```ts
import { criarAtlas, LIMITES } from "./app/atlas.ts";

const atlas = criarAtlas();
```

Se o componente estiver dentro de `app/`, o import é `"./atlas.ts"`.

## Como um ciclo funciona

`simularOrbita` valida os cinco números e, se todos cabem nos limites, repete o mesmo passo `ciclos` vezes.

A série começa no ciclo 0, só com a população inicial e risco calculado sem colisões. Cada passo seguinte faz, nesta ordem:

1. Soma os lançamentos do ciclo à população.
2. Remove objetos até o valor do slider. Se há menos objetos do que a remoção pedida, zera a população daquele instante. O total não fica negativo.
3. Estima as colisões entre o que restou. A taxa cresce com N × (N − 1) e com o multiplicador de velocidade. O valor esperado é arredondado para um inteiro.
4. Cada colisão retira 2 objetos e gera 6 fragmentos. O saldo de uma colisão é +4 objetos.

`fragmentosGerados` e `colisoes` são do ciclo atual. `fragmentosAcumulados` e `colisoesAcumuladas` somam desde o ciclo 1. O comprimento da série é `ciclos + 1`, porque o índice 0 é o ponto de partida.

Para redesenhar o gráfico, chame `simularOrbita` de novo com os valores atuais dos sliders. Guarde o array novo no estado da tela.

## Limites dos sliders

Use `LIMITES` no `min`, no `max` e no `step`. Número fora da faixa, fração numa contagem inteira ou campo extra volta com `ok: false` e a lista `falha.problemas`. Nenhum ciclo é calculado nesse caso.

| Controle | Campo | Mínimo | Máximo | Passo |
|---|---|---:|---:|---|
| População inicial | `objetosIniciais` | 0 | 50.000 | 1 |
| Lançamentos por ciclo | `lancamentosPorCiclo` | 0 | 60 | 1 |
| Remoção ativa por ciclo | `remocaoAtivaPorCiclo` | 0 | 60 | 1 |
| Velocidade relativa | `multiplicadorVelocidade` | 0,5 | 3 | 0,1 |
| Horizonte | `ciclos` | 1 | 100 | 1 |

`multiplicadorVelocidade` igual a 1 é a velocidade de referência. 0,5 reduz encontros; 3 os aumenta. O campo aceita decimal. Os outros quatro são inteiros.

O objeto enviado tem exatamente estas chaves: `objetosIniciais`, `lancamentosPorCiclo`, `remocaoAtivaPorCiclo`, `multiplicadorVelocidade`, `ciclos`.

## Como ler o risco

Cada estado traz `risco`: `"baixo"`, `"moderado"`, `"alto"` ou `"cascata"`.

O rótulo olha o fim do ciclo: população resultante, colisões daquele ciclo e a remoção que o jogador escolheu.

| Risco | Leitura para a tela |
|---|---|
| `baixo` | População abaixo de 4.000 e nenhuma colisão neste ciclo |
| `moderado` | População a partir de 4.000, ou ao menos uma colisão, ainda abaixo dos limiares de alto |
| `alto` | População a partir de 8.000, ou 5 ou mais colisões no ciclo. A remoção ainda cobre o saldo dos fragmentos |
| `cascata` | Duas ou mais colisões, e o saldo delas supera a remoção do ciclo |

O saldo é `colisoes × 4`, porque cada encontro troca 2 objetos por 6 fragmentos. Com 6 colisões, entram 24 objetos líquidos. Remoção 20 nesse ciclo marca `cascata`. Remoção 30 mantém `alto` se a população ou as colisões já passaram o limiar.

`cascata` é o regime de Kessler desta simulação: a fragmentação daquele ciclo cresce mais do que a limpeza. Uma colisão isolada continua `moderado` ou `alto`. Ela ainda é um acidente, não a cascata.

Durante a projeção a população pode passar de 50.000. O teto interno da conta é 250.000. Se o cálculo encosta nesse teto, o estado daquele ciclo vem como `cascata`.

Campos úteis no último item da série, e também em cada ponto do gráfico:

| Campo | Significado |
|---|---|
| `ciclo` | 0 na origem; 1 é o primeiro passo |
| `objetos` | População ao fim do ciclo |
| `colisoes` | Colisões deste ciclo |
| `colisoesAcumuladas` | Soma das colisões até aqui |
| `fragmentosGerados` | Fragmentos criados neste ciclo (6 por colisão) |
| `fragmentosAcumulados` | Soma dos fragmentos até aqui |
| `risco` | Nível descrito na tabela acima |

Para colorir a tela, use o `risco` do último ciclo. Para o gráfico, percorra a série inteira e desenhe `objetos` e `colisoes` contra `ciclo`.

## Ligar os sliders

```ts
import { useState } from "react";
import { criarAtlas, LIMITES, type EstadoOrbital } from "./app/atlas.ts";

const atlas = criarAtlas();

const INICIAL = {
  objetosIniciais: 2000,
  lancamentosPorCiclo: 8,
  remocaoAtivaPorCiclo: 12,
  multiplicadorVelocidade: 1,
  ciclos: 40,
};

export function PainelOrbital() {
  const [valores, setValores] = useState(INICIAL);
  const [estados, setEstados] = useState<readonly EstadoOrbital[] | null>(null);
  const [problemas, setProblemas] = useState<readonly string[]>([]);

  function atualizar(campo: keyof typeof INICIAL, bruto: string) {
    const numero = Number(bruto);
    setValores((atual) => ({ ...atual, [campo]: numero }));
  }

  function projetar() {
    const resposta = atlas.simularOrbita(valores);

    if (!resposta.ok) {
      setEstados(null);
      setProblemas(resposta.falha.problemas);
      return;
    }

    setProblemas([]);
    setEstados(resposta.dados);
  }

  const agora = estados?.at(-1);

  return (
    <section>
      <Slider
        rotulo="População inicial"
        min={LIMITES.objetosIniciais.min}
        max={LIMITES.objetosIniciais.max}
        step={1}
        value={valores.objetosIniciais}
        onChange={(valor) => atualizar("objetosIniciais", valor)}
      />
      <Slider
        rotulo="Lançamentos por ciclo"
        min={LIMITES.lancamentosPorCiclo.min}
        max={LIMITES.lancamentosPorCiclo.max}
        step={1}
        value={valores.lancamentosPorCiclo}
        onChange={(valor) => atualizar("lancamentosPorCiclo", valor)}
      />
      <Slider
        rotulo="Remoção ativa por ciclo"
        min={LIMITES.remocaoAtivaPorCiclo.min}
        max={LIMITES.remocaoAtivaPorCiclo.max}
        step={1}
        value={valores.remocaoAtivaPorCiclo}
        onChange={(valor) => atualizar("remocaoAtivaPorCiclo", valor)}
      />
      <Slider
        rotulo="Velocidade"
        min={LIMITES.multiplicadorVelocidade.min}
        max={LIMITES.multiplicadorVelocidade.max}
        step={0.1}
        value={valores.multiplicadorVelocidade}
        onChange={(valor) => atualizar("multiplicadorVelocidade", valor)}
      />
      <Slider
        rotulo="Ciclos"
        min={LIMITES.ciclos.min}
        max={LIMITES.ciclos.max}
        step={1}
        value={valores.ciclos}
        onChange={(valor) => atualizar("ciclos", valor)}
      />

      <button type="button" onClick={projetar}>
        Simular
      </button>

      {problemas.map((problema) => (
        <p key={problema}>{problema}</p>
      ))}

      {agora ? (
        <>
          <p>Risco: {agora.risco}</p>
          <p>Objetos: {agora.objetos}</p>
          <p>Colisões neste ciclo: {agora.colisoes}</p>
          <p>Fragmentos neste ciclo: {agora.fragmentosGerados}</p>
        </>
      ) : null}
    </section>
  );
}

function Slider({
  rotulo,
  min,
  max,
  step,
  value,
  onChange,
}: {
  rotulo: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (valor: string) => void;
}) {
  return (
    <label>
      {rotulo}: {value}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(evento) => onChange(evento.target.value)}
      />
    </label>
  );
}
```

`Number` no valor do `<input type="range">` devolve inteiro quando `step` é 1, e decimal quando `step` é 0,1. Os limites do próprio input impedem o jogador de sair da faixa.

Uma leitura rápida dos presets, com os mesmos campos:

- Lançamentos 8, remoção 12, velocidade 1, população 2.000: a população desce e o risco permanece `baixo`.
- Lançamentos altos, remoção 0 e velocidade 2: a série atravessa `baixo`, `moderado` e chega a `cascata`.
- População já em 12.000 com remoção no máximo: o risco fica `alto`. A limpeza cobre o saldo dos fragmentos, e a população continua alta.
