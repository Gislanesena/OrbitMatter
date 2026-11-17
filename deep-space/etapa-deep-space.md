# Deep Space Tracker — Voyager 1

A Voyager 1 não é um detrito orbital e não ficou na Lua. O catálogo de `data/artifacts.ts` só aceita equipamento no corpo `"lua"`. Por isso a sonda não entra nesse registro e não é desenhada na cena da Terra, da Lua e de Marte.

O botão **Voyager**, no mesmo dock do Atlas, das Missões, da Simulação e do Diário, abre um modal no visual que o jogo já usa.

## O que a tela mostra

| Bloco | Origem |
|---|---|
| Ficha, linha do tempo, descobertas, Disco de Ouro | Textos publicados pela NASA, copiados em `voyager-1.js` |
| Imagem da sonda | Conceito artístico NASA/JPL-Caltech, [PIA14111](https://photojournal.jpl.nasa.gov/catalog/PIA14111) |
| Disco de Ouro | Fotografia de arquivo NASA/JPL-Caltech, [PIA21741](https://photojournal.jpl.nasa.gov/catalog/PIA21741) |
| Distância à Terra e ao Sol | Efeméride calculada pelo Horizons. Não é telemetria da Deep Space Network |
| Situação dos instrumentos | Boletim da NASA de 17 de abril de 2026. Não é um estado lido agora da sonda |

A ilustração da trajetória é uma régua logarítmica da distância ao Sol. A Terra fica em 1 UA porque essa é a definição da unidade. Os outros planetas não são desenhados. A marca que percorre a régua indica a direção da viagem, não a posição quadro a quadro.

## API

Não há chave. A consulta sai do navegador direto para o JPL.

Endpoint atual, o mesmo documentado em `https://ssd-api.jpl.nasa.gov/doc/horizons.html`:

```
GET https://ssd.jpl.nasa.gov/api/horizons.api
```

Duas chamadas, uma por centro, só quando o modal abre e não existe um pacote do mesmo dia UTC com menos de seis horas:

| Parâmetro | Valor | Por quê |
|---|---|---|
| `COMMAND` | `'-31'` | Voyager 1 no Horizons |
| `EPHEM_TYPE` | `OBSERVER` | Alcance aparente até o centro pedido |
| `QUANTITIES` | `'20'` | `delta` em UA e `deldot` em km/s |
| `CENTER` | `'500@399'` | Centro da Terra |
| `CENTER` | `'500@10'` | Centro do Sol |
| `START_TIME` | dia UTC de hoje | Uma linha na época 00:00 UT |
| `STOP_TIME` | o dia UTC seguinte | O passo de 1 dia precisa de um fim |
| `STEP_SIZE` | `'1 d'` | Um ponto por dia |
| `format` | `json` | O texto da tabela vem no campo `result` |

`delta` é o alcance aparente, com o atraso da luz. `deldot` positivo significa que a distância àquele centro está aumentando. O valor em relação à Terra não é a velocidade em relação ao Sol: a órbita da Terra entra nessa taxa.

Os quilômetros mostrados são `delta × 149597870,7`, a UA impressa pelo próprio Horizons, arredondados ao quilômetro mais próximo.

O núcleo citado na resposta conferida em 14 de novembro de 2026 é `Voyager_1_ST+refit2022_m`.

## Cache

1. Se `localStorage` (`atlas:voyager1:horizons:v1`) tem o dia UTC de hoje e foi gravado há menos de seis horas, a tela não chama o Horizons.
2. Se a chamada falha e existe qualquer pacote anterior nesse navegador, a tela usa esse pacote e diz que o Horizons não respondeu.
3. Se não há pacote no navegador, a tela usa o retrato gravado em `SNAPSHOT` dentro de `voyager-1.js`, com a data em que ele foi conferido (14 nov 2026, 15:36 em Pasadena).

A data da última atualização aparece junto da época da efeméride.

## Fontes da ficha

- [NASA Science — Voyager 1](https://science.nasa.gov/mission/voyager/voyager-1/): lançamento em 5 set 1977, 12:56:01 UT; Júpiter em 5 mar 1979, 12:05 UT, a 280 000 km; Saturno em 12 nov 1980, 23:46 UT, a cerca de 126 000 km; espaço interestelar em 25 ago 2012; massa 721,9 kg.
- [NASA Science — onde estão as Voyager](https://science.nasa.gov/mission/voyager/where-are-voyager-1-and-voyager-2-now/): tabela de instrumentos atualizada em 17 abr 2026. Na Voyager 1, MAG e PWS ligados; LECP desligado nessa data para poupar energia.
- [NASA JPL, 17 abr 2026](https://www.jpl.nasa.gov/news/nasa-shuts-off-instrument-on-voyager-1-to-keep-spacecraft-operating/): o mesmo desligamento, com a frase de que restam dois instrumentos científicos.
- [NSSDCA 1977-084A](https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1977-084A): descrição da nave, Disco de Ouro e histórico. Estimativas de potência datadas de 1998 nessa página não são usadas como estado atual.
- A página da missão ainda tem um parágrafo antigo dizendo que quatro instrumentos enviam dados. A tabela de 17 abr 2026 e o comunicado do JPL substituem esse parágrafo. A ficha segue esses dois.

O marco de um dia-luz (16,094 bilhões de milhas, 25,902 bilhões de quilômetros, 18 nov 2026, 2:16:07 da manhã PST) é citado como data futura publicada pela NASA. Não é a distância calculada pelo Horizons para hoje.

## Arquivos

| Arquivo | Papel |
|---|---|
| `deep-space/voyager-1.js` | Ficha, consulta, cache e desenho do modal |
| `deep-space/checar.mjs` | Confere o leitor e o retrato, sem rede |
| `index.html` | Botão do dock, modal e o ganho de XP na primeira abertura |
| `atlas.css` | O modal usa as cores e os cartões que o atlas já tinha |
| `i18n.js` | O rótulo do botão |

A primeira abertura, com sessão ou com o progresso local, soma 20 XP e uma linha no diário. Isso não altera missões, órbitas nem o catálogo lunar.

## Limitações

- O Horizons calcula uma trajetória. Não informa se a sonda respondeu hoje à Deep Space Network.
- O estado operacional fica congelado no boletim de 17 de abril de 2026 até alguém atualizar o texto em `voyager-1.js` com um comunicado mais novo.
- A página da missão da NASA ainda contradiz a tabela de instrumentos. A ficha não repete o parágrafo antigo.
- A régua não é um mapa. Não há latitude, longitude nem vetor no céu.
- `file://` pode bloquear a imagem e o Horizons. Com `http://localhost` a API do JPL devolveu `Access-Control-Allow-Origin` para essa origem na consulta de 14 nov 2026.
- Não há servidor próprio. Não existe chave para esconder. Se a origem da página for recusada pelo JPL, vale o cache descrito acima.
