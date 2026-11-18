# Memórias do Espaço

**Memórias do Espaço** é um projeto educativo e interativo desenvolvido para o **NASA Space Apps Challenge**. A proposta é aproximar o público da exploração espacial e da sustentabilidade orbital por meio de uma jornada visual: investigar objetos e artefatos, conhecer histórias de missões e experimentar como escolhas diferentes podem afetar o ambiente orbital.

O projeto é independente e não é um produto oficial nem representa um endosso da NASA.

## A ideia

O espaço próximo da Terra é usado por satélites e missões, mas também contém objetos sem função que podem colidir e gerar mais fragmentos. A experiência apresenta esse problema junto à história da exploração espacial, ajudando a distinguir detritos em órbita, espaçonaves em atividade e artefatos históricos deixados em outros corpos celestes.

Em vez de ser uma ferramenta de previsão ou de operação espacial, o site transforma esses temas em exploração, pequenas missões e simulações educativas. O jogador observa, investiga e toma decisões enquanto aprende sobre o legado das missões e os desafios de manter o espaço utilizável.

## O que você encontra

- **Mapa interativo em 3D:** explore a cena espacial e alterne entre Terra, Lua e Marte. Selecione objetos para abrir suas fichas.
- **Atlas de Memórias:** consulte e filtre objetos e registros históricos ligados à exploração espacial e ao ambiente orbital.
- **Jornada por missões:** avance por capítulos que abordam um estágio em órbita, um artefato lunar e uma nuvem de fragmentos. Investigue objetos, leia análises e escolha estratégias.
- **Simulação da síndrome de Kessler:** ajuste lançamentos, remoção ativa, velocidade e ciclos; acompanhe objetos, colisões, fragmentos e níveis de risco em gráficos.
- **Consciência Espacial:** leia informações sobre o destino selecionado. O painel pode ser fechado e reaberto, inclusive em telas pequenas.
- **Voyager 1 no espaço profundo:** consulte marcos históricos, descobertas, o Disco de Ouro e uma posição calculada com dados do JPL Horizons.
- **SojournBot:** converse sobre exploração espacial, missões, artefatos e sustentabilidade orbital. O chat oferece interface em português e inglês e pode receber perguntas por voz em navegadores compatíveis.
- **Progresso e diário de bordo:** acompanhe a jornada, experiência e distintivos; o projeto mantém suporte ao progresso local e à integração já existente com Firebase.
- **Interface em português e inglês:** alterne o idioma pela própria tela.

## Ciência e limites da experiência

- O simulador de Kessler é um **modelo didático**. Seus ciclos e resultados ajudam a visualizar relações de causa e efeito; não são anos, previsões orbitais nem recomendações operacionais.
- A posição da Voyager é calculada a partir do serviço JPL Horizons quando a ficha é consultada. Isso não é telemetria ao vivo. Informações sobre o estado dos instrumentos são identificadas como dados publicados.
- O catálogo tipado de artefatos lunares inclui Luna 2, Luna 9 e Surveyor 1. O projeto também apresenta registros orbitais e históricos na experiência principal; essas fontes de dados têm papéis diferentes.
- O SojournBot usa um modelo de IA quando a chave da Groq está configurada no servidor. Sem configuração ou se o provedor estiver indisponível, a rota informa que o chat não pode responder.

## Como executar

Use Node.js e npm. Na pasta do projeto:

```bash
npm ci
npm run dev
```

`npm run dev` inicia o site e a rota `/api/chat` no mesmo servidor local. A chave `GROQ_API_KEY` é carregada de `.env`; sem ela, a API retorna uma mensagem de configuração ausente. Não coloque a chave em HTML, JavaScript do navegador ou no repositório.

## Configuração da IA e deploy

### Chat do SojournBot

Na Vercel, adicione em **Project Settings → Environment Variables**:

| Variável | Obrigatória? | Uso |
|---|---|---|
| `GROQ_API_KEY` | Sim, para respostas reais | Chave secreta usada pela função server-side `api/chat.ts`. |
| `GROQ_MODEL` | Não | Modelo Groq; padrão `llama-3.3-70b-versatile`. |

Depois de salvar a variável, faça um novo deploy. A página chama `/api/chat`; a chave não é enviada ao navegador.

### Game Master e outros recursos

`ATLAS_IA_CHAVE` é uma configuração separada, usada pelo Game Master em tarefas Node e na geração prévia de missões (`npm run pregerar`). Para esse fluxo, `ATLAS_IA_URL`, `ATLAS_IA_MODELO` e `ATLAS_IA_TEMPO_MS` são opcionais. Elas não substituem `GROQ_API_KEY` do chat principal.

A configuração web do Firebase está em `firebase-config.js`; não é uma chave secreta de servidor. As regras e os domínios permitidos devem ser mantidos nas configurações do próprio Firebase. O projeto não requer cron nem variável de fuso horário.

## Desenvolvimento e verificações

```bash
npm run verificar
npm run testar
npm run testar:chat
```

- `npm run verificar`: verifica os tipos TypeScript com as opções estritas do projeto.
- `npm run testar`: executa os testes do simulador orbital.
- `npm run testar:chat`: verifica a rota do chat com um provedor simulado, sem usar uma chave real.

Outros comandos disponíveis:

| Comando | Finalidade |
|---|---|
| `npm run montar` | Gera o bundle do Game Master em `dist/atlas-ia.js`. |
| `npm run pregerar` | Gera missões usando o modelo configurado ou os dados de reserva. |
| `npm run testar:minijogo` | Executa os testes do minijogo. |
| `npm run testar:minijogo-fragmentos` | Executa os testes do núcleo de fragmentos. |
| `npm run calibrar` | Executa a calibração dos cenários do simulador. |

## Estrutura do projeto

| Caminho | Responsabilidade |
|---|---|
| `index.html`, `atlas.css`, `i18n.js` | Interface principal, estilos e textos da experiência em português e inglês. |
| `frontend/` | Dados e recursos usados pela visualização 3D. |
| `js/` | Interações da jornada, atlas, chat, Voyager, progresso e módulos de minijogos. |
| `data/` | Catálogo tipado de artefatos lunares e validação dos registros. |
| `ia/chat/` | Prompt e validação das mensagens do SojournBot. |
| `ia/game-master/` e `ia/esquema/` | Geração e validação de missões estruturadas. |
| `api/chat.ts` | Função Vercel que conversa com a Groq sem expor a chave no navegador. |
| `simulacao/` | Modelo orbital didático, parâmetros, cenários e testes. |
| `app/` | Fachada TypeScript para o catálogo, missões e simulador. |
| `deep-space/` | Ficha e rastreador da Voyager 1. |
| `scripts/` | Desenvolvimento local, pré-geração, testes e calibração. |

## Fachada TypeScript

Os módulos de domínio também podem ser usados separadamente:

```ts
import { criarAtlas } from "./app/atlas.ts";

const atlas = criarAtlas();
const artefatos = atlas.listarArtefatos();
const orbita = atlas.simularOrbita({
  objetosIniciais: 2000,
  lancamentosPorCiclo: 8,
  remocaoAtivaPorCiclo: 12,
  multiplicadorVelocidade: 1,
  ciclos: 40,
});
```

As operações retornam resultados com `ok: true` e `dados`, ou `ok: false` e `falha`, para que a interface trate erros sem interromper a jornada.
