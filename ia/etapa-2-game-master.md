# Etapa 2 — Gerador de missões (Game Master)

Guia para a interface pedir uma missão a partir de um artefato do catálogo.

A chamada é assíncrona. O resultado sempre chega num objeto com `ok`. A função não lança exceção: rede, tempo esgotado e JSON inválido viram uma missão jogável, montada com os fatos do catálogo.

## Onde isso mora

| Arquivo | Papel |
|---|---|
| `app/atlas.ts` | Porta da interface: `pedirMissao` |
| `ia/game-master/servico.ts` | Pede a missão, valida o JSON e aciona a reserva |
| `ia/esquema/contexto.ts` | Campos de entrada aceitos |
| `ia/esquema/missao.ts` | Formato da missão devolvida |
| `ia/game-master/reserva.ts` | Texto usado quando o modelo não responde |

Na tela, importe a fachada:

```ts
import { criarAtlas } from "./app/atlas.ts";

const atlas = criarAtlas();
```

Se o componente estiver dentro de `app/`, o import é `"./atlas.ts"`.

## Como a chamada funciona

`pedirMissao` recebe o artefato e o que mudou nesta jogada. O serviço busca o registro no catálogo (Luna 2, Luna 9, Surveyor 1), monta o prompt do Game Master só com esses fatos e espera um JSON com título, briefing e três escolhas.

O JSON só entra na tela depois da validação: três opções, pesos inteiros de 0 a 3 e um feedback científico em cada uma. A ordem das opções na lista é sempre `preservar`, `medir`, `aproximar`.

Cada opção é um botão. O `feedbackCientifico` aparece depois que o jogador escolhe aquele botão.

## Parâmetros obrigatórios

O objeto tem exatamente estes quatro campos. Campo a mais, campo faltando ou valor fora da lista recusa a jogada.

| Campo | Valores | Uso na tela |
|---|---|---|
| `artefatoId` | `"luna-2"`, `"luna-9"`, `"surveyor-1"` | O alvo da missão. O mesmo `id` do catálogo |
| `tipoObjeto` | `"sonda_de_impacto"`, `"modulo_de_pouso"`, `"estagio_descartado"` | Como o jogador trata o alvo nesta jogada |
| `local` | Texto de 1 a 160 caracteres, sem espaço nas pontas | Órbita ou ponto de onde a nave observa |
| `nivelRisco` | `"baixo"`, `"moderado"`, `"alto"` | Tensão da jogada |

`tipoObjeto` descreve a jogada, não substitui o registro histórico. Dá para observar a Luna 2 como `"estagio_descartado"` sem apagar o fato de que a sonda impactou.

As listas fechadas também saem da fachada, para montar os controles:

```ts
import { TIPOS_OBJETO, NIVEIS_RISCO } from "./app/atlas.ts";
```

## O que a tela recebe

Sucesso:

```ts
{
  ok: true,
  dados: {
    origem: "modelo", // ou "reserva"
    aviso: null, // texto curto quando origem é "reserva"
    missao: {
      artefatoId: "surveyor-1",
      titulo: "Aproximação a Surveyor 1",
      briefing: "...",
      opcoes: [
        {
          id: "preservar",
          rotulo: "Manter distância e só registrar o sítio",
          pesos: { impacto: 1, combustivel: 1, seguranca: 3 },
          feedbackCientifico: "...",
        },
        { id: "medir", rotulo: "...", pesos: { impacto: 2, combustivel: 2, seguranca: 2 }, feedbackCientifico: "..." },
        { id: "aproximar", rotulo: "...", pesos: { impacto: 3, combustivel: 3, seguranca: 1 }, feedbackCientifico: "..." },
      ],
    },
  },
}
```

Os pesos são inteiros de 0 a 3 e mudam de uma opção para a outra.

- `impacto`: o quanto a ação revela e o quanto mexe no sítio.
- `combustivel`: propelente gasto.
- `seguranca`: proteção da nave do jogador. 3 é a opção mais segura.

Recusa, só quando o pedido em si é inválido:

```ts
{
  ok: false,
  falha: {
    pilar: "missao",
    codigo: "contexto_invalido", // ou "artefato_desconhecido" ou "falha_interna"
    aviso: "texto para a tela",
  },
}
```

| `codigo` | Quando aparece | O que a tela faz |
|---|---|---|
| `contexto_invalido` | Campo ausente, valor fora da lista ou `local` longo demais | Mostra `falha.aviso` e mantém o formulário |
| `artefato_desconhecido` | `artefatoId` no formato certo, mas fora do catálogo | Mostra o aviso. O id válido é o do catálogo |
| `falha_interna` | A reserva também não pôde ser montada | Mostra o aviso. Caso excepcional |

## Quando a IA cai

A tela trata missão de reserva como sucesso. `ok` continua `true`.

1. O modelo responde com JSON válido: `origem` é `"modelo"` e `aviso` é `null`.
2. A resposta vem torta: o serviço pede uma correção, uma vez.
3. A segunda resposta também falha, a rede cai, o tempo estoura ou a chave `ATLAS_IA_CHAVE` não está definida: `origem` é `"reserva"`.

A reserva usa o nome, a massa, o sítio e o status daquele artefato. O aviso explica a origem, por exemplo: "O modelo está indisponível. A missão exibida foi montada a partir do catálogo."

Mostre o aviso quando `origem === "reserva"`. O briefing e os três botões funcionam do mesmo jeito.

Sem chave configurada, nenhuma chamada sai para a rede. A reserva entra na hora.

## Exemplo assíncrono

```ts
import { criarAtlas, type Missao } from "./app/atlas.ts";

const atlas = criarAtlas();

export async function carregarMissao(): Promise<
  { missao: Missao; aviso: string | null } | { erro: string }
> {
  const resposta = await atlas.pedirMissao({
    artefatoId: "surveyor-1",
    tipoObjeto: "modulo_de_pouso",
    local: "órbita lunar baixa",
    nivelRisco: "alto",
  });

  if (!resposta.ok) {
    return { erro: resposta.falha.aviso };
  }

  return {
    missao: resposta.dados.missao,
    aviso: resposta.dados.aviso,
  };
}
```

Um botão que dispara a jogada e guarda a escolha:

```ts
import { useState } from "react";
import { criarAtlas, type IdOpcao, type Missao } from "./app/atlas.ts";

const atlas = criarAtlas();

export function PainelDaMissao() {
  const [missao, setMissao] = useState<Missao | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [escolha, setEscolha] = useState<IdOpcao | null>(null);

  async function gerar() {
    setErro(null);
    setEscolha(null);

    const resposta = await atlas.pedirMissao({
      artefatoId: "luna-9",
      tipoObjeto: "modulo_de_pouso",
      local: "sobre o Oceanus Procellarum",
      nivelRisco: "moderado",
    });

    if (!resposta.ok) {
      setMissao(null);
      setAviso(null);
      setErro(resposta.falha.aviso);
      return;
    }

    setMissao(resposta.dados.missao);
    setAviso(resposta.dados.aviso);
  }

  const opcaoEscolhida = missao?.opcoes.find((opcao) => opcao.id === escolha);

  return (
    <section>
      <button type="button" onClick={() => void gerar()}>
        Gerar missão
      </button>
      {erro ? <p>{erro}</p> : null}
      {aviso ? <p>{aviso}</p> : null}
      {missao ? (
        <>
          <h2>{missao.titulo}</h2>
          <p>{missao.briefing}</p>
          {missao.opcoes.map((opcao) => (
            <button key={opcao.id} type="button" onClick={() => setEscolha(opcao.id)}>
              {opcao.rotulo}
            </button>
          ))}
        </>
      ) : null}
      {opcaoEscolhida ? <p>{opcaoEscolhida.feedbackCientifico}</p> : null}
    </section>
  );
}
```

`void gerar()` entrega a Promise ao React sem deixar a rejeição escapar do clique. Dentro de `gerar`, `pedirMissao` já devolve `ok: false` em vez de lançar.
