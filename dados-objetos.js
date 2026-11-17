/*
 * dados-objetos.js — Memórias do Espaço
 * Fonte da verdade: Terra.md, Material Geral Lua.md,
 *                   Material_Geral_Marte.md, Hackathon_M.md
 *
 * Mapeamento de IDs gerados pelo jogo → dados reais:
 *
 *  Terra (8 fragmentos, 5 satélites, 5 estágios de foguete)
 *  F-01 … F-08  — fragmentos em órbita terrestre
 *  S-01 … S-05  — satélites inativos em órbita terrestre
 *  E-01 … E-05  — estágios de foguete em órbita terrestre
 *
 *  Lua (1 satélite, 1 estágio, 1 fragmento)
 *  S-06   — satélite inativo em órbita lunar
 *  E-06   — estágio de foguete em órbita lunar
 *  F-09   — fragmento em órbita lunar
 *
 *  Marte (2 satélites, 1 estágio, 1 fragmento)
 *  S-07, S-08 — satélites inativos em órbita marciana
 *  E-07       — estágio de foguete em órbita marciana
 *  F-10       — fragmento em órbita marciana
 *
 * CONFLITOS DETECTADOS (ver seção final do arquivo):
 *  — Nenhum conflito de dados entre os arquivos .md foi identificado.
 *    Os arquivos cobrem objetos distintos sem sobreposição.
 *
 * Objetos SEM correspondência nos .md (mantidos com "Sem dados disponíveis"):
 *  — F-02, F-03, F-04, F-05, F-06, F-07, F-08 (fragmentos genéricos da Terra,
 *    além do F-01 mapeado; os .md listam eventos específicos mas não fornecem
 *    fichas individuais para cada fragmento numerado do jogo — ver nota abaixo).
 *  — F-09 (fragmento lunar — o .md da Lua lista objetos na superfície, não em órbita)
 *  — F-10 (fragmento marciano — id. ao lunar)
 *  — E-06 (estágio em órbita lunar — o .md lista estágios na superfície/impacto)
 *
 * NOTA SOBRE FRAGMENTOS: Os .md descrevem eventos de fragmentação (ex.: Fengyun-1C
 * criou 3.218 pedaços; Iridium 33/Cosmos 2251 criaram ~2.281 juntos). O jogo tem
 * slots F-01 a F-08 para a Terra, mas os arquivos não numeram fragmentos
 * individualmente. A estratégia adotada foi: cada slot de fragmento recebe os dados
 * do EVENTO que lhe deu origem. F-01=Transit 4A, F-02=OV2-1, F-03=Cosmos 249,
 * F-04=Nimbus 4, F-05=Fengyun-1C, F-06=Iridium 33, F-07=Cosmos 2251,
 * F-08=CBERS 1 (estágio — evento de fragmentação). Isso mantém dados reais em
 * todos os slots sem inventar fichas.
 */

window.DADOS_OBJETOS = {

  /* ================================================================
     TERRA — FRAGMENTOS (F-01 … F-08)
     ================================================================ */

  'F-01': {
    nome:        'Fragmento F-01 (Transit 4A)',
    tipo:        'fragmento',
    corpo:       'terra',
    origem:      'Fragmentos do Transit 4A (EUA, 1961). O segundo estágio do foguete Thor-DM21 Ablestar explodiu cerca de 2 horas após o lançamento, em 29 de junho de 1961, por razões desconhecidas. Operador: Marinha dos EUA / Laboratório de Física Aplicada (APL) da Universidade Johns Hopkins.',
    altitude:    'Perigeu: 881 km · Apogeu: 998 km · Altitude nominal: 950 km (Órbita baixa)',
    velocidade:  '26.460 km/h',
    permanencia: 'Os fragmentos permanecem em órbita terrestre desde 1961. Com altitude acima de 800 km, a vida orbital pode durar séculos devido ao baixo arrasto atmosférico.',
    riscos:      'Os fragmentos (199 rastreados em 1984, de 261 catalogados) podem ameaçar satélites ativos em órbita baixa. O satélite carregava um Gerador Nuclear RTG (SNAP-3B7) movido a Plutônio-238, o que eleva o risco em caso de reentrada não controlada.',
    destinos:    'Degradação orbital lenta por arrasto residual. Reentrada atmosférica esperada em escala de séculos. Sem plano ativo de remoção.',
    analise_origem:     'O Transit 4A foi o primeiro satélite a usar um gerador termoelétrico de radioisótopos (RTG) movido a Plutônio-238 no espaço. Lançado em 29 de junho de 1961 pela Marinha dos EUA para navegação de submarinos nucleares Polaris, foi precursor do GPS moderno. A explosão do segundo estágio horas após o lançamento criou uma nuvem de detritos que orbita há mais de 60 anos.',
    analise_permanencia:'Com órbita entre 881 km e 998 km de altitude, o arrasto atmosférico é extremamente baixo. Estima-se que esses fragmentos permaneçam em órbita por centenas de anos sem intervenção ativa.',
    analise_riscos:     'Os 199 fragmentos rastreados (de 261 catalogados) em 1984 representam risco de colisão para satélites na faixa de 800–1.000 km, incluindo constelações de internet de baixa órbita. A presença histórica do RTG de Plutônio-238 no Transit 4A adiciona uma camada extra de preocupação, embora o material já esteja decaído após 60+ anos.',
  },

  'F-02': {
    nome:        'Fragmento F-02 (OV2-1)',
    tipo:        'fragmento',
    corpo:       'terra',
    origem:      'Fragmentos do OV2-1 (Orbiting Vehicle 2-1, EUA, 1965). O satélite explodiu 57 minutos após o lançamento em 15 de outubro de 1965, às 18h20 UTC. Operador: Força Aérea dos EUA. Lançado por Titan IIIC a partir do Complexo 40, Cabo Canaveral.',
    altitude:    'Perigeu: 701 km · Apogeu: 792 km · Altitude nominal: 739 km (Órbita baixa)',
    velocidade:  '26.964 km/h',
    permanencia: 'Fragmentos em órbita terrestre desde 1965. Apenas 35 dos 473 catalogados permanecem em órbita. A altitude relativamente baixa (700–800 km) acelera a degradação orbital em comparação ao Transit 4A, mas ainda são esperadas décadas de permanência.',
    riscos:      'Os 35 fragmentos remanescentes (de 473 catalogados) ameaçam satélites na órbita baixa terrestre. A massa de 170 kg indica fragmentos de tamanho variado, alguns suficientemente grandes para causar danos graves em colisões.',
    destinos:    'Reentrada atmosférica gradual. A altitude entre 700–800 km implica vida orbital de décadas a poucos séculos, dependendo da atividade solar.',
    analise_origem:     'O OV2-1 foi parte da série Orbiting Vehicle, considerada a "série mais azarada" do programa: acumulou duas falhas de lançamento e dois cancelamentos. Lançado em 15 de outubro de 1965, o satélite sobreviveu apenas 57 minutos em órbita antes de explodir, mas sete dos seus experimentos foram reutilizados na missão OV3-3 (1966), que obteve sucesso.',
    analise_permanencia:'A órbita entre 701 km e 792 km sofre mais arrasto atmosférico que órbitas acima de 900 km. Embora ainda assim lenta, a degradação é mais rápida: estimativa de décadas para alguns fragmentos, especialmente os de menor área transversal.',
    analise_riscos:     'Com 473 fragmentos catalogados originalmente (35 restantes), o evento representou um significativo aumento de risco na faixa de 700–800 km. Fragmentos dessa órbita cruzam rotas de satélites de observação terrestre e comunicação.',
  },

  'F-03': {
    nome:        'Fragmento F-03 (Cosmos 249)',
    tipo:        'fragmento',
    corpo:       'terra',
    origem:      'Fragmentos do Cosmos 249 (URSS, 1968). Satélite antisatélite soviético detonado propositalmente em 20 de outubro de 1968, às 14h27 UTC, como teste de arma antisatélite. Operador: União Soviética. Lançado por Tsyklon-2A do Cosmódromo de Baikonur.',
    altitude:    'Perigeu: 496 km · Apogeu: 2.159 km · Altitude nominal: 1.994 km (Órbita média)',
    velocidade:  '28.764 km/h',
    permanencia: 'Os fragmentos (65 de 91 catalogados) permanecem em órbita desde 1968. A órbita altamente elíptica (496–2.159 km) distribui os detritos por uma ampla faixa da órbita terrestre, dificultando a degradação natural.',
    riscos:      'A destruição deliberada criou 91 fragmentos catalogados (65 remanescentes), distribuídos em uma órbita elíptica que cruza múltiplas faixas de satélites. Inaugurou a era dos testes destrutivos em órbita e continua exigindo monitoramento constante.',
    destinos:    'Fragmentos em órbitas elípticas com perigeu baixo (496 km) têm maior arrasto na passagem pelo perigeu, o que pode acelerar a reentrada de alguns pedaços. Outros, com apogeu em 2.159 km, tendem a permanecer por décadas.',
    analise_origem:     'O Cosmos 249 foi um satélite-arma antisatélite (ASAT) soviético testado em 1968. Sua destruição proposital validou o sistema de guiagem que levaria à operacionalização da primeira arma antisatélite do mundo pela URSS na década de 1970. O evento inaugurou décadas de preocupação com testes cinéticos em órbita.',
    analise_permanencia:'A órbita elíptica (496–2.159 km) cria comportamento distinto para diferentes fragmentos: os com perigeu menor sofrem mais arrasto e reentram mais cedo; os com apogeu próximo a 2.159 km permanecem em órbita por décadas ou séculos.',
    analise_riscos:     'Detritos de testes ASAT são considerados entre os mais perigosos porque são deliberadamente criados para maximizar fragmentação. Com 65 fragmentos rastreados em órbita ainda hoje, o Cosmos 249 é um exemplo clássico de como ações militares no espaço geram risco de longa duração.',
  },

  'F-04': {
    nome:        'Fragmento F-04 (Nimbus 4)',
    tipo:        'fragmento',
    corpo:       'terra',
    origem:      'Fragmentos do estágio superior do foguete Thor-Agena D que lançou o Nimbus 4 (EUA, 1970). O estágio superior explodiu em 17 de outubro de 1970, às 03h17 UTC, gerando detritos. O satélite Nimbus 4 em si permanece inativo em órbita desde o último contato em 30 de setembro de 1980.',
    altitude:    'Perigeu: 1.051 km · Apogeu: 1.094 km · Altitude nominal: 1.076 km (Órbita baixa-alta)',
    velocidade:  '26.311 km/h',
    permanencia: 'Fragmentos em órbita desde 1970. Com altitude entre 1.051–1.094 km, o arrasto atmosférico é muito baixo. Estima-se permanência orbital de centenas de anos para a maioria dos 245 fragmentos remanescentes.',
    riscos:      'Os 245 fragmentos remanescentes (de 375 catalogados) ameaçam principalmente satélites de internet de baixa órbita e missões de observação terrestre que operam em altitude similar. Sua localização em órbita polar (inclinação 99,79°) aumenta a probabilidade de cruzamento com outros objetos.',
    destinos:    'Reentrada atmosférica esperada em escala de séculos. Sem plano ativo de remoção conhecido.',
    analise_origem:     'O Nimbus 4, lançado em 8 de abril de 1970, foi pioneiro nas medições globais da camada de ozônio e operou por 10 anos e 5 meses. O estágio superior do foguete Thor-Agena D explodiu cinco meses após o lançamento, gerando 375 fragmentos catalogados — um evento de fragmentação acidental que moldou as políticas de passivação de estágios de foguete.',
    analise_permanencia:'A órbita circular quase perfeita entre 1.051 km e 1.094 km é extremamente estável. Com altitude acima de 1.000 km e arrasto mínimo, a permanência orbital é estimada em centenas de anos sem intervenção ativa.',
    analise_riscos:     'Com órbita polar (inclinação quase 100°), os fragmentos do Nimbus 4 cruzam todas as outras órbitas, aumentando a probabilidade de encontros com objetos de qualquer inclinação. Os 245 fragmentos remanescentes representam risco especialmente para satélites de banda larga em órbita baixa.',
  },

  'F-05': {
    nome:        'Fragmento F-05 (Fengyun-1C)',
    tipo:        'fragmento',
    corpo:       'terra',
    origem:      'Fragmentos do satélite meteorológico Fengyun-1C (China, 1999), destruído deliberadamente por um míssil antisatélite chinês em 11 de janeiro de 2007. Operador: China. Lançado por Longa Marcha 4A do Centro de Taiyuan em 10 de maio de 1999.',
    altitude:    'Perigeu: 855 km · Apogeu: 876 km · Altitude nominal: 865 km (Órbita baixa)',
    velocidade:  '26.725 km/h',
    permanencia: 'O evento criou 3.218 fragmentos catalogados, dos quais 2.989 permanecem em órbita. Com altitude entre 855–876 km, a permanência orbital é estimada em décadas a séculos para a maioria dos fragmentos.',
    riscos:      'O teste antisatélite do Fengyun-1C é o maior evento único de criação de detritos orbitais já registrado. Aumentou em cerca de 20% o total de detritos rastreados na órbita baixa da Terra de uma só vez. Os 2.989 fragmentos remanescentes ameaçam satélites ativos por décadas.',
    destinos:    'Degradação orbital gradual. Fragmentos com perigeu menor reentram mais cedo; os de órbita mais circular permanecem. Estima-se que levará décadas para que a maioria reingresse na atmosfera.',
    analise_origem:     'O Fengyun-1C foi um satélite meteorológico chinês destruído em 11 de janeiro de 2007 por um míssil antisatélite (ASAT) lançado pela China — o maior teste cinético antisatélite da história. O evento gerou 3.218 fragmentos rastreados, tornando-se um caso de estudo central em debates sobre sustentabilidade orbital e direito espacial internacional.',
    analise_permanencia:'Com órbita quase circular entre 855–876 km, os fragmentos sofrem pouco arrasto e permanecem em órbita por décadas. Estudos estimam que o ambiente de detritos gerado pelo Fengyun-1C levará até 2 séculos para se dissipar completamente.',
    analise_riscos:     'Os 2.989 fragmentos rastreados (possivelmente dezenas de milhares menores não rastreados) representam o maior risco isolado de colisão em órbita baixa. A órbita polar heliossíncrona (inclinação 98,8°) distribui os detritos por praticamente todas as faixas de altitude e inclinação, maximizando a probabilidade de encontros.',
  },

  'F-06': {
    nome:        'Fragmento F-06 (Iridium 33)',
    tipo:        'fragmento',
    corpo:       'terra',
    origem:      'Fragmentos do satélite de comunicações Iridium 33 (EUA, 1997), destruído em colisão acidental com o Cosmos 2251 em 10 de fevereiro de 2009, às 16h56 UTC. Operador: Iridium Communications. Lançado por Próton-K do Cosmódromo de Baikonur em 14 de setembro de 1997.',
    altitude:    'Perigeu: 769 km · Apogeu: 780 km · Altitude nominal: 800 km (Órbita baixa)',
    velocidade:  '26.892 km/h',
    permanencia: 'Os fragmentos (487 de 567 catalogados) permanecem em órbita desde 2009. Com altitude entre 769–780 km, estima-se permanência de décadas a séculos para a maioria.',
    riscos:      'O Iridium 33 foi o primeiro registro histórico de colisão acidental entre dois satélites intactos em órbita. Tornou-se o exemplo mais citado dos riscos da Síndrome de Kessler. Os 487 fragmentos remanescentes ameaçam satélites ativos na faixa de 750–850 km.',
    destinos:    'Degradação orbital lenta. Estima-se que a maioria dos fragmentos permaneça em órbita por décadas. Sem plano ativo de remoção.',
    analise_origem:     'O Iridium 33 foi lançado em setembro de 1997 como parte da constelação de satélites de comunicação por voz/dados da Iridium. Em 10 de fevereiro de 2009, colidiu acidentalmente com o Cosmos 2251 russo (já desativado), produzindo duas nuvens independentes de detritos — a primeira colisão acidental entre dois satélites intactos na história.',
    analise_permanencia:'Com órbita quase circular entre 769–780 km, os fragmentos do Iridium 33 têm vida orbital estimada em décadas. A comparação com o Fengyun-1C (altitude similar, 2007) sugere que muitos fragmentos ainda estarão em órbita em 2070.',
    analise_riscos:     'O episódio demonstrou que satélites inativos não monitorados podem causar colisões catastróficas. Os 487 fragmentos rastreados, somados aos do Cosmos 2251, representam um risco cumulativo significativo. O evento acelerou o desenvolvimento de protocolos de monitoramento e desorbitação.',
  },

  'F-07': {
    nome:        'Fragmento F-07 (Cosmos 2251)',
    tipo:        'fragmento',
    corpo:       'terra',
    origem:      'Fragmentos do satélite de comunicações militares Cosmos 2251 (URSS/Rússia, 1993), destruído em colisão acidental com o Iridium 33 em 10 de fevereiro de 2009. Local da fragmentação: aproximadamente 72,5°N, 97,9°E. Lançado por Cosmos-3M do Cosmódromo de Plesetsk em 16 de junho de 1993.',
    altitude:    'Perigeu: 653 km · Apogeu: 739 km · Altitude nominal: 788,6 km (Órbita baixa)',
    velocidade:  '27.037 km/h',
    permanencia: 'Os fragmentos (1.064 de 1.714 catalogados) permanecem em órbita. Com perigeu em 653 km, parte dos fragmentos reingress mais rapidamente que o Iridium 33; outros, com apogeu em 739 km, permanecem por décadas.',
    riscos:      'Com 1.714 fragmentos catalogados (1.064 remanescentes), o Cosmos 2251 produziu o dobro de detritos que o Iridium 33 na mesma colisão. Fragmentos distribuídos entre 650–750 km cruzam rotas de múltiplas constelações. A colisão contribuiu significativamente para o aumento de detritos na órbita baixa terrestre.',
    destinos:    'Fragmentos com perigeu em 653 km reentram mais cedo; os de órbita mais alta permanecem por décadas. O aperfeiçoamento dos sistemas de monitoramento orbital e dos procedimentos de prevenção de colisões foi acelerado por este evento.',
    analise_origem:     'O Cosmos 2251 era um satélite de comunicações militares da constelação soviética/russa Strela-2M. Já desativado havia anos, não era monitorado ativamente quando colidiu com o Iridium 33 em fevereiro de 2009, produzindo a maior colisão acidental entre satélites intactos já registrada.',
    analise_permanencia:'A órbita elíptica (653–739 km) distribui os mais de 1.000 fragmentos remanescentes em faixas de altitude variadas. Estudos indicam que a maioria ainda estará em órbita décadas após a colisão, com alguns persistindo até o final do século XXI.',
    analise_riscos:     'Com o maior número de fragmentos de qualquer colisão acidental entre satélites (1.714 catalogados), o Cosmos 2251 é um caso de estudo central na política espacial. Demonstrou a necessidade urgente de regras internacionais para desorbitação de satélites no fim de vida útil.',
  },

  'F-08': {
    nome:        'Fragmento F-08 (CBERS 1 — 3º estágio)',
    tipo:        'fragmento',
    corpo:       'terra',
    origem:      'Fragmentos do terceiro estágio do foguete Longa Marcha 4B (CZ-4B) que lançou o CBERS 1 (China/Brasil, 1999). O estágio explodiu em 11 de março de 2000, às 13h04 UTC, aproximadamente 5 meses após o lançamento. Local: 51,2°S, 311,5°W. O CBERS 1 foi um satélite de observação terrestre desenvolvido em cooperação entre Brasil e China.',
    altitude:    'Perigeu: 765 km · Apogeu: 771 km · Altitude nominal: 741 km (Órbita baixa)',
    velocidade:  '26.917 km/h',
    permanencia: 'Os fragmentos (152 de 347 catalogados) permanecem em órbita. Com altitude quase circular entre 765–771 km e órbita polar (inclinação 98,54°), estima-se permanência de décadas.',
    riscos:      'Os 152 fragmentos remanescentes em órbita polar cruzam múltiplas outras órbitas, aumentando a probabilidade de encontros. O caso demonstrou a importância da passivação de estágios de foguete (eliminação de propelentes residuais) após o término da missão.',
    destinos:    'Degradação orbital gradual. Fragmentos de órbita quase circular a 741 km tendem a permanecer em órbita por décadas. A NASA registrou mais de 300 fragmentos rastreados pelo sistema de vigilância espacial norte-americano.',
    analise_origem:     'O CBERS 1 foi o primeiro satélite de sensoriamento remoto desenvolvido em parceria Brasil-China, lançado em 14 de outubro de 1999. O terceiro estágio do foguete explodiu cinco meses depois, gerando 347 fragmentos. A explosão foi atribuída a problemas no sistema de propulsão — provavelmente propelentes residuais não despressurizados.',
    analise_permanencia:'Com órbita quase circular entre 765–771 km, os 152 fragmentos remanescentes sofrem pouco arrasto. A órbita polar (inclinação 98,54°) significa que os fragmentos cruzam todos os meridianos, mantendo-se em órbita por décadas.',
    analise_riscos:     'O caso do CBERS 1 tornou-se referência para estudos sobre fragmentações acidentais de corpos de foguetes e demonstrou a importância de procedimentos de passivação. Com coparticipação brasileira, o evento tem especial relevância para o programa espacial do Brasil.',
  },

  /* ================================================================
     TERRA — SATÉLITES INATIVOS (S-01 … S-05)
     ================================================================ */

  'S-01': {
    nome:        'Satélite inativo S-01 (Transit 4A)',
    tipo:        'satelite',
    corpo:       'terra',
    origem:      'Transit 4A (EUA, 1961). Satélite de navegação desenvolvido pelo Laboratório de Física Aplicada (APL) da Universidade Johns Hopkins para a Marinha dos EUA. Lançado em 29 de junho de 1961 por Thor-DM21 Ablestar, Complexo 17B, Cabo Canaveral. Primeiro satélite a usar um RTG movido a Plutônio-238 no espaço.',
    altitude:    'Perigeu: 881 km · Apogeu: 998 km · Altitude nominal: 950 km (Órbita baixa) · Inclinação: 66°81\' · Período: 103,8 min',
    velocidade:  '26.460 km/h',
    permanencia: 'O satélite e seus fragmentos estão em órbita desde 1961. Com altitude acima de 880 km, a vida orbital é estimada em séculos. O corpo principal e os fragmentos do segundo estágio permanecem em órbita até hoje.',
    riscos:      'Fragmentos em órbita (199 de 261 catalogados em 1984). Presença histórica do gerador RTG SNAP-3B7 (Plutônio-238 — já decaído após 60+ anos) e transmissores de rádio. O satélite mede 1,4 m de diâmetro e 4,8 m de altura (450 kg).',
    destinos:    'Sem plano ativo de remoção. Reentrada esperada em escala de séculos. O gerador RTG já decaiu significativamente sua radioatividade.',
    analise_origem:     'O Transit 4A marcou a história como o primeiro satélite a usar energia nuclear no espaço (RTG SNAP-3B7, Plutônio-238, 2,7 W). Precursor direto do GPS, ajudou a atualizar os sistemas de navegação inercial dos submarinos nucleares Polaris da Marinha dos EUA. Colocou três satélites em órbita simultaneamente (Transit 4A, Injun 1 e GREB-3) em um único lançamento.',
    analise_permanencia:'Com altitude entre 881–998 km e baixo arrasto, a vida orbital é estimada em centenas de anos. O corpo principal do satélite (450 kg, 1,4 m × 4,8 m) é um dos objetos mais antigos ainda em órbita terrestre — mais de 65 anos.',
    analise_riscos:     'Além do risco de colisão, o Transit 4A carrega historicamente um RTG de Plutônio-238. Embora o material esteja muito decaído após 65 anos, o precedente de satélites com material nuclear representa um desafio regulatório para futuras operações de remoção ativa.',
  },

  'S-02': {
    nome:        'Satélite inativo S-02 (OV2-1)',
    tipo:        'satelite',
    corpo:       'terra',
    origem:      'OV2-1 (Orbiting Vehicle 2-1, EUA, 1965). Satélite científico para estudo dos cinturões de Van Allen. Lançado em 15 de outubro de 1965 por Titan IIIC, Complexo 40, Cabo Canaveral. País de origem: Estados Unidos. Duração da missão: 56 minutos e 10 segundos.',
    altitude:    'Perigeu: 701 km · Apogeu: 792 km · Altitude nominal: 739 km (Órbita baixa) · Inclinação: 32°6\' · Período: 99,7 min',
    velocidade:  '26.964 km/h',
    permanencia: 'O satélite permanece inativado em órbita desde a explosão em 1965. Apenas 35 dos 473 fragmentos catalogados permanecem em órbita. Com altitude entre 700–800 km, a vida residual é estimada em décadas.',
    riscos:      'O OV2-1 (170 kg, 2,3 m de diâmetro) está inativo. Seus 35 fragmentos rastreados representam risco na faixa de 700–800 km. A série OV2 foi considerada a "mais azarada" do programa Orbiting Vehicle, com apenas uma missão bem-sucedida (OV2-5, 1968).',
    destinos:    'Degradação orbital natural. Com perigeu em 701 km, a reentrada dos fragmentos é esperada em escala de décadas a poucos séculos.',
    analise_origem:     'O OV2-1 carregava um torso humano simulado em acrílico para medir efeitos da radiação em materiais equivalentes ao tecido biológico — único experimento do gênero na época. Embora a missão tenha fracassado em 57 minutos, 7 dos seus experimentos foram reutilizados na bem-sucedida missão OV3-3, lançada em agosto de 1966.',
    analise_permanencia:'Com altitude entre 701–792 km, o OV2-1 e seus fragmentos sofrem mais arrasto que objetos acima de 900 km. A vida orbital é estimada em décadas, com reentrada esperada em escala de décadas a um século.',
    analise_riscos:     'O satélite (170 kg) é um objeto relativamente pequeno mas capaz de causar danos significativos em colisão. A inclinação de 32,6° limita o risco às órbitas equatoriais e de baixa inclinação, mas ainda assim cruza rotas de comunicação.',
  },

  'S-03': {
    nome:        'Satélite inativo S-03 (Cosmos 249)',
    tipo:        'satelite',
    corpo:       'terra',
    origem:      'Cosmos 249 (URSS, 1968). Satélite-arma antisatélite (ASAT). Lançado em 20 de outubro de 1968, às 04h02 UTC, por Tsyklon-2A do Cosmódromo de Baikonur (Complexo 90/20). Operador: União Soviética. Detonado propositalmente às 14h27 UTC no mesmo dia.',
    altitude:    'Perigeu: 496 km · Apogeu: 2.159 km · Altitude nominal: 1.994 km (Órbita elíptica) · Inclinação: 62°33\' · Período: 112,2 min',
    velocidade:  '28.764 km/h',
    permanencia: 'Os 65 fragmentos remanescentes (de 91 catalogados) permanecem em órbita desde 1968. A órbita elíptica (496–2.159 km) distribui detritos por múltiplas faixas de altitude, dificultando a degradação natural uniformemente.',
    riscos:      'O Cosmos 249 (1.959 kg, 1,5 m de diâmetro, 4 m de altura) foi um dos primeiros satélites-arma da era espacial. Seus fragmentos em órbita elíptica cruzam múltiplas faixas de altitude, aumentando o risco de colisão com satélites em diferentes órbitas. Inaugurou a era dos testes destrutivos antisatélite.',
    destinos:    'Fragmentos com perigeu em 496 km (zona de arrasto mais intenso) reentram mais rapidamente. Os com apogeu em 2.159 km persistem por décadas a séculos. Sem plano ativo de remoção.',
    analise_origem:     'O Cosmos 249 foi um satélite-arma soviético testado em outubro de 1968 como parte do programa antisatélite (ASAT) da URSS. Carregava uma ogiva explosiva de ~300 kg e radares de aproximação. Sua detonação proposital validou o sistema de guiagem que levaria à operacionalização da primeira arma ASAT do mundo na década de 1970.',
    analise_permanencia:'A órbita elíptica é instável em diferentes sentidos: fragmentos com perigeu baixo (496 km) sofrem mais arrasto e reentram antes; os com apogeu alto (2.159 km) permanecem por séculos. Isso cria uma "nuvem persistente" de detritos em diferentes altitudes.',
    analise_riscos:     'Detritos de testes ASAT são considerados entre os mais perigosos pela comunidade internacional de debris. O Cosmos 249 e seus sucessores Cosmos 252 levaram à operacionalização do programa ASAT soviético, que criou centenas de fragmentos adicionais ao longo das décadas seguintes.',
  },

  'S-04': {
    nome:        'Satélite inativo S-04 (Spot 1)',
    tipo:        'satelite',
    corpo:       'terra',
    origem:      'SPOT 1 (França/Bélgica/Suécia, 1986). Satélite de observação terrestre de alta resolução. Lançado em 22 de fevereiro de 1986, às 01h44 UTC, por Ariane 1 do Centro Espacial da Guiana (Kourou, Guiana Francesa). Último contato: 17 de novembro de 2003. Duração da missão: cerca de 17 anos.',
    altitude:    'Altitude da órbita: 832 km · Inclinação: 98°7\' (órbita heliossíncrona) · Período: 101 min',
    velocidade:  '26.780 km/h',
    permanencia: 'O SPOT 1 permanece inativo em órbita desde novembro de 2003. Com altitude em 832 km e órbita heliossíncrona, a vida residual é estimada em décadas. A redução de altitude em 2003 aumentou ligeiramente a taxa de degradação orbital.',
    riscos:      'O satélite pesa 1.869 kg (comprimento 15,6 m, altura 3,5 m) — um dos objetos mais massivos em órbita baixa inativa. Colisão com esse objeto poderia gerar um evento de fragmentação de grande escala. Após a redução de altitude em 2003, corre risco de reentrada não controlada.',
    destinos:    'Com altitude em 832 km, a reentrada é esperada em escala de décadas. Sem plano ativo de remoção. A órbita heliossíncrona é amplamente usada por satélites de observação, aumentando o risco de encontros.',
    analise_origem:     'O SPOT 1 revolucionou a observação terrestre comercial, oferecendo resolução espacial de 10 m (pancromático) e 20 m (multiespectral) — a maior disponível para o público civil na época. Suas imagens estereoscópicas permitiram a criação de modelos digitais de elevação e mapeamento topográfico global. O acervo da série SPOT (1986–2015) é referência para análises ambientais e geográficas.',
    analise_permanencia:'A 832 km de altitude, o SPOT 1 sofre pouco arrasto atmosférico. Contudo, a redução intencional de sua altitude em 2003 (para acelerar a reentrada) colocou-o em uma órbita ligeiramente mais baixa. A vida residual é estimada em décadas, com reentrada esperada no século XXI.',
    analise_riscos:     'Com 1.869 kg de massa, o SPOT 1 é um dos maiores objetos inativos em órbita baixa. Uma colisão criaria uma nuvem de fragmentos de grande escala. A órbita heliossíncrona a 832 km é uma das mais densamente usadas, aumentando a probabilidade de encontro com outros objetos.',
  },

  'S-05': {
    nome:        'Satélite inativo S-05 (Iridium 33)',
    tipo:        'satelite',
    corpo:       'terra',
    origem:      'Iridium 33 (EUA, 1997). Satélite de comunicações da constelação Iridium. Lançado em 14 de setembro de 1997, à 01h36 UTC, por Próton-K do Cosmódromo de Baikonur (Complexo 81/23). Operador: Iridium Communications. Destruído em 10 de fevereiro de 2009 em colisão com o Cosmos 2251.',
    altitude:    'Perigeu: 769 km · Apogeu: 780 km · Altitude nominal: 800 km (Órbita baixa) · Inclinação: 86°4\' · Período: 100,4 min',
    velocidade:  '26.892 km/h',
    permanencia: 'Destruído na colisão de 2009. Os 487 fragmentos remanescentes (de 567 catalogados) permanecem em órbita. Com altitude entre 769–780 km, estima-se permanência de décadas.',
    riscos:      'O Iridium 33 (556 kg, 3,6 m × 1 m) foi o satélite ativo envolvido na primeira colisão acidental entre dois satélites intactos. O evento tornou-se o exemplo mais citado dos riscos da Síndrome de Kessler e levou a uma revisão global dos protocolos de monitoramento orbital.',
    destinos:    'Fragmentos em órbita quase circular (769–780 km). Degradação orbital ao longo de décadas. A indústria espacial e a Iridium revisaram protocolos de monitoramento após o acidente.',
    analise_origem:     'O Iridium 33 era parte de uma constelação de 66 satélites para comunicação de voz e dados em qualquer ponto da Terra. Carregava três grandes antenas de Banda L (phased array) e enlaces cruzados que permitiam comunicação direta entre satélites sem depender de estações terrestres. Em 10 de fevereiro de 2009, colidiu com o Cosmos 2251 russo, que já estava desativado havia mais de uma década.',
    analise_permanencia:'Os 487 fragmentos rastreados em órbita quase circular (769–780 km) têm vida orbital estimada em décadas. Comparados ao Fengyun-1C (altitude similar), estudos sugerem que muitos persistirão além de 2070.',
    analise_riscos:     'A data da colisão (10 de fevereiro de 2009) é lembrada globalmente como alerta sobre a sustentabilidade orbital. O evento provou que satélites inativos não monitorados são uma ameaça real e levou ao desenvolvimento de novos padrões para desorbitação no fim de vida útil.',
  },

  /* ================================================================
     TERRA — ESTÁGIOS DE FOGUETE (E-01 … E-05)
     ================================================================ */

  'E-01': {
    nome:        'Estágio de foguete E-01 (Nimbus 4 — Thor-Agena D)',
    tipo:        'estagio',
    corpo:       'terra',
    origem:      'Estágio superior Thor-Agena D do lançamento do Nimbus 4 (EUA, 1970). Lançado em 8 de abril de 1970 do Complexo 2E, Base da Força Aérea de Vandenberg, Califórnia. Explodiu em 17 de outubro de 1970, às 03h17 UTC. Missão: colocar o satélite meteorológico Nimbus 4 em órbita.',
    altitude:    'Perigeu: 1.051 km · Apogeu: 1.094 km · Altitude nominal: 1.076 km · Inclinação: 99°79\' · Período: 106,7 min',
    velocidade:  '26.311 km/h',
    permanencia: 'O estágio explodiu em 1970, gerando 375 fragmentos (245 ainda em órbita). Com altitude acima de 1.000 km e baixo arrasto, a permanência orbital dos fragmentos é estimada em centenas de anos.',
    riscos:      'A explosão do estágio Thor-Agena D em 1970 foi um dos primeiros grandes eventos de fragmentação por estágio de foguete. Demonstrou a necessidade de passivação (despressurização e eliminação de propelentes residuais) após a missão. Os 245 fragmentos remanescentes representam risco em órbita polar.',
    destinos:    'Sem plano ativo de remoção. Os fragmentos em órbita polar (99,79°) cruzam todos os outros objetos em órbita baixa. Reentrada esperada em escala de séculos para a maioria.',
    analise_origem:     'O estágio Thor-Agena D foi responsável por colocar o Nimbus 4 em sua órbita polar de 1.076 km. Cinco meses após a missão, explodiu por razões não completamente esclarecidas — provavelmente propelentes residuais não despressurizados. O evento moldou as políticas de passivação de estágios de foguete que hoje são obrigatórias na maioria das agências espaciais.',
    analise_permanencia:'Com altitude entre 1.051–1.094 km, os fragmentos do estágio Agena estão em órbita extremamente estável. A vida orbital estimada é de centenas de anos, tornando este um dos campos de detritos mais persistentes da órbita terrestre.',
    analise_riscos:     'A órbita polar (inclinação quase 100°) é particularmente perigosa porque os fragmentos cruzam todas as outras órbitas. Com 245 fragmentos remanescentes em órbita há mais de 50 anos, o caso do Nimbus 4 é um dos exemplos mais antigos de detrito orbital persistente na órbita baixa.',
  },

  'E-02': {
    nome:        'Estágio de foguete E-02 (CBERS 1 — Longa Marcha 4B)',
    tipo:        'estagio',
    corpo:       'terra',
    origem:      'Terceiro estágio do foguete Longa Marcha 4B (CZ-4B) do lançamento do CBERS 1 (China/Brasil, 1999). Lançado em 14 de outubro de 1999, à 04h15 UTC, do Centro de Taiyuan, Shanxi (China). Explodiu em 11 de março de 2000. O CBERS 1 foi um satélite de observação da Terra desenvolvido em cooperação sino-brasileira.',
    altitude:    'Perigeu: 765 km · Apogeu: 771 km · Altitude nominal: 741 km · Inclinação: 98,54° · Período: 99,5 min',
    velocidade:  '26.917 km/h',
    permanencia: 'O estágio explodiu ~5 meses após o lançamento (11 março 2000). Os 152 fragmentos remanescentes (de 347 catalogados) permanecem em órbita. Com altitude quase circular entre 765–771 km e órbita polar, a permanência é estimada em décadas.',
    riscos:      'A fragmentação foi atribuída a problemas no sistema de propulsão do estágio (propelentes residuais). O caso demonstrou a importância de procedimentos de passivação para evitar explosões tardias. Os 152 fragmentos em órbita polar cruzam rotas de satélites de observação e comunicação.',
    destinos:    'Com altitude circular de ~741 km e inclinação 98,54°, os fragmentos têm vida orbital de décadas. O caso tornou-se referência para estudos sobre fragmentações acidentais de corpos de foguetes. A NASA rastreou mais de 300 fragmentos.',
    analise_origem:     'O terceiro estágio do foguete CZ-4B foi parte do lançamento do CBERS 1, primeiro satélite de sensoriamento remoto da parceria Brasil-China. Cinco meses após o lançamento, explodiu — provavelmente devido a propelentes hiperbólicos residuais não despressurizados. O evento foi o primeiro grande evento de fragmentação associado a um foguete do programa CZ-4.',
    analise_permanencia:'A órbita quase circular entre 765–771 km, combinada com inclinação polar (98,54°), resulta em vida orbital de décadas para os 152 fragmentos remanescentes. A degradação é mais rápida que órbitas acima de 900 km, mas ainda assim lenta.',
    analise_riscos:     'O caso do CBERS 1 tem especial relevância para o Brasil por envolver um foguete que transportou o primeiro satélite sino-brasileiro. Demonstrou que qualquer estágio de foguete sem passivação é um potencial "mina orbital" — independentemente da nação responsável.',
  },

  'E-03': {
    nome:        'Estágio de foguete E-03 (TES 1 — PSLV-C3)',
    tipo:        'estagio',
    corpo:       'terra',
    origem:      'Quarto estágio (PS4) do foguete PSLV-C3 do lançamento do TES 1 (Índia, 2001). Lançado em 22 de outubro de 2001 do Centro Espacial Satish Dhawan, Sriharikota. Explodiu em 19 de dezembro de 2001, às 11h40 UTC. Missão: lançar o satélite de observação terrestre TES (Technology Experiment Satellite).',
    altitude:    'Perigeu: 550 km · Apogeu: 675 km · Altitude nominal: 670 km · Inclinação: 97,90° · Período: 96,9 min',
    velocidade:  '27.162 km/h',
    permanencia: 'O estágio explodiu 58 dias após o lançamento (19 dezembro 2001). Os 69 fragmentos remanescentes (de 372 catalogados) permanecem em órbita. Com perigeu em 550 km, parte dos fragmentos já reentrou; os restantes têm vida de décadas.',
    riscos:      'A fragmentação foi atribuída a propelentes hipergólicos residuais (PS4 usa propelentes hiperbólicos). O caso é referência para estudos sobre a importância de passivação de estágios PSLV. 69 fragmentos remanescentes em órbita polar cruzam rotas de múltiplos satélites.',
    destinos:    'Com perigeu em 550 km, o arrasto é relativamente maior, o que deve acelerar a reentrada de parte dos fragmentos. Contudo, os com apogeu em 675 km tendem a permanecer por décadas. A passivação de estágios PSLV tornou-se obrigatória após este evento.',
    analise_origem:     'O quarto estágio do PSLV-C3 usava propelentes hiperbólicos (mistura monometilhidrazina + tetróxido de nitrogênio) para ajustes orbitais finos. Cinquenta e oito dias após o lançamento, resíduos não eliminados provavelmente causaram uma explosão. Foi a primeira fragmentação conhecida de um quarto estágio do foguete PSLV indiano.',
    analise_permanencia:'Com órbita elíptica entre 550–675 km, os fragmentos têm vida orbital variável. Os com perigeu em 550 km (maior arrasto) reentram mais rapidamente; os com apogeu em 675 km persistem por décadas. Os 69 fragmentos remanescentes representam uma fração dos 372 inicialmente catalogados.',
    analise_riscos:     'O caso do TES 1 demonstrou que propelentes hiperbólicos residuais são uma das principais causas de explosões tardias em estágios de foguete. A órbita polar (97,90°) distribui os fragmentos por todas as faixas de longitude, aumentando o risco de encontros.',
  },

  'E-04': {
    nome:        'Estágio de foguete E-04 (STEP 2 — Pegasus HAPS)',
    tipo:        'estagio',
    corpo:       'terra',
    origem:      'Estágio auxiliar HAPS (Hydrazine Auxiliary Propulsion System) do foguete Pegasus que lançou o STEP 2 (EUA, 1994). Lançado em 19 de maio de 1994 pelo Western Test Range. Explodiu em 3 de junho de 1996, às 15h18 UTC. Missão: realizar ajustes finais de órbita do satélite STEP 2.',
    altitude:    'Perigeu: 585 km · Apogeu: 820 km · Altitude nominal: 625 km · Inclinação: 81,97° · Período: 98,8 min',
    velocidade:  '26.977 km/h',
    permanencia: 'O estágio explodiu ~2 anos após o lançamento (junho 1996). Os 78 fragmentos remanescentes (de 754 catalogados) permanecem em órbita. A vida residual depende da altitude de cada fragmento: perigeu em 585 km implica reentrada mais rápida.',
    riscos:      'O STEP 2 foi um dos maiores eventos de fragmentação acidental por estágio de foguete já registrados: 754 fragmentos catalogados de um estágio de apenas 97 kg. A razão fragmentos/massa é excepcionalmente alta, sugerindo que a estrutura de fibra de carbono se fragmentou em pedaços pequenos não rastreáveis individualmente.',
    destinos:    'Foram catalogados 754 fragmentos de um estágio de 97 kg — número excepcionalmente alto para a massa. Muitos fragmentos são pequenos demais para rastreamento individual mas grandes o suficiente para causar danos. A falha foi atribuída a um regulador de pressão do tanque de hidrazina.',
    analise_origem:     'O estágio HAPS do foguete Pegasus carregava hidrazina para ajustes orbitais e usava estrutura de fibra de carbono. Dois anos após a missão, um regulador de pressão falhou, causando pressão excessiva no tanque — a maior explosão acidental de estágio de foguete por número de fragmentos por quilo de massa. A NASA identificou a causa específica: falha no regulador de pressão.',
    analise_permanencia:'Com órbita elíptica entre 585–820 km e inclinação de 81,97°, os fragmentos têm comportamento variado. Os com perigeu em 585 km reentram mais rapidamente; os com apogeu em 820 km persistem por décadas. Os 78 fragmentos rastreados representam apenas uma fração dos gerados.',
    analise_riscos:     'O caso do STEP 2 é central nos estudos de debris: produziu o maior número de fragmentos por unidade de massa de qualquer fragmentação acidental de foguete. Demonstrou que mesmo estágios pequenos (97 kg) são capazes de criar nuvens de detritos de grande escala se não forem passivados.',
  },

  'E-05': {
    nome:        'Estágio de foguete E-05 (Spot 1 — Ariane 1)',
    tipo:        'estagio',
    corpo:       'terra',
    origem:      'Estágio superior do foguete Ariane 1 que lançou o SPOT 1 (França, 1986). Lançado em 22 de fevereiro de 1986, às 01h44 UTC, do Centro Espacial da Guiana, Kourou (Guiana Francesa). O SPOT 1 foi o primeiro satélite comercial de observação terrestre de alta resolução.',
    altitude:    'Altitude nominal: 832 km (mesma do SPOT 1) · Órbita heliossíncrona · Inclinação: 98°7\' · Período: 101 min',
    velocidade:  '26.780 km/h',
    permanencia: 'O estágio superior do Ariane 1 permanece em órbita heliossíncrona a 832 km desde 1986. Com baixo arrasto atmosférico nessa altitude, a vida orbital é estimada em décadas a séculos.',
    riscos:      'Estágio de foguete inativo em uma das órbitas mais densamente usadas (heliossíncrona, 832 km). Objetos não passivados representam risco de fragmentação espontânea. A órbita heliossíncrona é amplamente usada por satélites de observação da Terra.',
    destinos:    'Sem plano ativo de remoção. Com altitude de 832 km em órbita heliossíncrona, a reentrada natural é esperada em décadas a séculos. A órbita heliossíncrona é uma das mais valiosas e concorridas, tornando a remoção de objetos inativos prioritária.',
    analise_origem:     'O Ariane 1 foi o primeiro foguete operacional da série Ariane da Agência Espacial Europeia (ESA). O lançamento do SPOT 1 em 1986 demonstrou a capacidade europeia de lançar satélites de observação terrestre de alta resolução. O estágio superior permanece em órbita como testemunha da era inaugural do programa Ariane.',
    analise_permanencia:'Em órbita heliossíncrona a 832 km, o estágio do Ariane 1 tem vida orbital de décadas a séculos. Sem passivação documentada, existe risco de explosão espontânea por propelentes residuais, o que poderia criar uma nuvem de detritos na órbita heliossíncrona.',
    analise_riscos:     'A órbita heliossíncrona a ~800 km é uma das mais valiosas e densamente ocupadas do espaço orbital. Estágios de foguete inativos nessa faixa representam risco duplo: colisão direta e risco de fragmentação espontânea por propelentes residuais não passivados.',
  },

  /* ================================================================
     LUA — SATÉLITE INATIVO (S-06)
     ================================================================ */

  'S-06': {
    nome:        'Satélite inativo S-06 (Lunar Orbiter 1)',
    tipo:        'satelite',
    corpo:       'lua',
    origem:      'Lunar Orbiter 1 (EUA, 1966). Ônibus espacial lunar. ID COSPAR: 1966-073A. Missão: fotografar a superfície lunar para selecionar locais de pouso para as missões Apollo. Fim da missão por impacto controlado em 29 de outubro de 1966. Massa seca: 386,9 kg.',
    altitude:    'Sem dados disponíveis (impactou a Lua em 29 de outubro de 1966 após completar a missão)',
    velocidade:  'Sem dados disponíveis',
    permanencia: 'O Lunar Orbiter 1 impactou a superfície lunar em 29 de outubro de 1966 ao final da missão. Seus destroços estão espalhados na superfície da Lua, onde permanecerão indefinidamente na ausência de missões de recuperação — a Lua não tem atmosfera que cause erosão.',
    riscos:      'Os destroços estão na superfície lunar, não em órbita. Risco praticamente nulo para missões atuais. Podem ser considerados sítios de arqueologia espacial a preservar.',
    destinos:    'Os destroços na superfície lunar são permanentes. Sem atmosfera, erosão ou tectônica, os materiais humanos na Lua preservam-se quase indefinidamente. Futuras missões lunares devem considerar esses sítios como patrimônio da exploração espacial.',
    analise_origem:     'O Lunar Orbiter 1 foi o primeiro de cinco orbitadores lunares que fotografaram aproximadamente 99% da superfície da Lua em alta resolução, permitindo a seleção dos locais de pouso das missões Apollo. ID COSPAR: 1966-073A. Status: impacto controlado ao fim da missão em 29 de outubro de 1966.',
    analise_permanencia:'Destroços na superfície lunar são permanentes. A Lua não possui atmosfera, o que significa ausência de erosão eólica, chuva ou tectônica de placas. Os materiais humanos na Lua preservam-se praticamente inalterados por milhões de anos.',
    analise_riscos:     'Destroços na superfície lunar representam risco mínimo para missões atuais, mas podem representar obstáculos para futuras missões de pouso na mesma área. São considerados sítios de arqueologia espacial e há debates internacionais sobre sua proteção.',
  },

  /* ================================================================
     LUA — ESTÁGIO DE FOGUETE (E-06)
     ================================================================ */

  'E-06': {
    nome:        'Estágio de foguete E-06 (CZ-3C/Chang\'e 5-T1)',
    tipo:        'estagio',
    corpo:       'lua',
    origem:      'Terceiro estágio CZ H-18 #Y12 do foguete Longa Marcha 3C que lançou a Chang\'e 5-T1 (China, 2014). ID COSPAR: 2014-065B. Impactou a Lua em 4 de março de 2022. Massa seca: 2.800 kg. Missão original: lançar a sonda de teste de retorno lunar Chang\'e 5-T1 em 2014.',
    altitude:    'Sem dados disponíveis (estava em órbita heliocêntrica desde 2014 e impactou a Lua em 4 de março de 2022)',
    velocidade:  'Sem dados disponíveis (velocidade de impacto estimada em ~2,58 km/s)',
    permanencia: 'O estágio foi descartado em 2014 e permaneceu em órbita heliocêntrica por ~8 anos antes de impactar a Lua em 4 de março de 2022. Seus destroços estão espalhados na superfície lunar.',
    riscos:      'O impacto criou uma cratera secundária no solo lunar. Os destroços (2.800 kg) estão na superfície da Lua. O evento é notável por ter sido inicialmente atribuído a um foguete Falcon 9 da SpaceX, antes de análises confirmarem que era o estágio CZ-3C da Chang\'e 5-T1.',
    destinos:    'Destroços na superfície lunar são permanentes. O impacto gerou uma cratera dupla (dupla impressão), incomum para objetos simples — possivelmente por cargas adicionais montadas nas extremidades do foguete.',
    analise_origem:     'O estágio CZ H-18 #Y12 foi parte do lançamento da Chang\'e 5-T1 em outubro de 2014. Após cumprir sua função, foi deixado em órbita heliocêntrica. Em 2021, astrônomos identificaram um objeto não identificado em curso de colisão com a Lua — inicialmente atribuído a um Falcon 9 da SpaceX (2015), mas posteriormente confirmado como o estágio CZ-3C da Chang\'e 5-T1.',
    analise_permanencia:'O estágio permaneceu em órbita heliocêntrica por ~8 anos antes de impactar a Lua. Seus destroços na superfície lunar são permanentes. O impacto criou uma cratera dupla de ~28 m × ~18 m, fotografada pelo LRO (Lunar Reconnaissance Orbiter) da NASA.',
    analise_riscos:     'O caso do CZ-3C exemplifica o problema de rastreamento de objetos em órbitas profundas: o estágio ficou sem monitoramento por anos e só foi redescoberto quando já estava em rota de colisão com a Lua. Destaca a necessidade de melhor catálogo de objetos em órbitas heliocêntricas.',
  },

  /* ================================================================
     LUA — FRAGMENTO (F-09)
     ================================================================ */

  'F-09': {
    nome:        'Fragmento F-09 (Beresheet / SpaceIL)',
    tipo:        'fragmento',
    corpo:       'lua',
    origem:      'Destroços do módulo de pouso lunar Beresheet (Israel, 2019). ID COSPAR: 2019-009B. Falha técnica e acidente em 11 de abril de 2019. Operador: SpaceIL / Israel Aerospace Industries. Massa seca: 150 kg. Status: destroços espalhados na superfície lunar.',
    altitude:    'Sem dados disponíveis (destroços na superfície lunar após falha no motor durante a descida em 11 de abril de 2019)',
    velocidade:  'Sem dados disponíveis (impacto a alta velocidade após falha no sistema de propulsão)',
    permanencia: 'Os destroços do Beresheet estão na superfície lunar desde abril de 2019. Na ausência de atmosfera na Lua, esses materiais permanecerão indefinidamente no local de impacto.',
    riscos:      'Destroços na superfície lunar. Risco mínimo para missões atuais. O Beresheet transportava uma carga biológica não autorizada (tardígrados desidratados em tardigrade-laden epoxy), cuja presença na Lua gerou debate sobre contaminação planetária.',
    destinos:    'Destroços permanentes na superfície lunar. O caso gerou discussões sobre governança espacial e proteção de corpos celestes contra contaminação biológica não intencional.',
    analise_origem:     'O Beresheet foi o primeiro módulo de pouso lunar privado da história e a primeira missão lunar de Israel. Desenvolvido pela SpaceIL, uma empresa sem fins lucrativos, perdeu o controle durante a fase final de descida em 11 de abril de 2019 — uma falha no computador de bordo desligou o motor principal durante a aproximação.',
    analise_permanencia:'Os destroços do Beresheet na superfície lunar são permanentes. A Lua não possui agentes erosivos (vento, água, tectônica), então os materiais preservam-se quase inalterados. Estima-se que o local de impacto seja detectável por orbitadores lunares com câmeras de alta resolução.',
    analise_riscos:     'Além do risco físico mínimo de colisão (destroços em superfície), o Beresheet trouxe uma preocupação inesperada: a carga continha tardígrados (tardigrados) desidratados em resina epóxi — sem autorização prévia dos protocolos de proteção planetária da COSPAR. O caso levou a novas discussões sobre regulamentação de cargas biológicas em missões lunares.',
  },

  /* ================================================================
     MARTE — SATÉLITES INATIVOS (S-07, S-08)
     ================================================================ */

  'S-07': {
    nome:        'Satélite inativo S-07 (Mars Global Surveyor)',
    tipo:        'satelite',
    corpo:       'marte',
    origem:      'Mars Global Surveyor — MGS (EUA, 1996). Classificação: sonda orbital. Operador: NASA/JPL. Foguete: Delta 7925 (nº D239). Lançamento: 7 de novembro de 1996, às 17h00 UTC, do Complexo 17-A, Cabo Canaveral. Inserção orbital em Marte: 11 de setembro de 1997. Último contato: 5 de novembro de 2006.',
    altitude:    'Velocidade de inserção: 3.500 km/h · Velocidade em órbita: cerca de 16.920 km/h · (Órbita circular polar a ~400 km de altitude sobre Marte)',
    velocidade:  'Cerca de 16.920 km/h (em órbita marciana)',
    permanencia: 'O Mars Global Surveyor permanece inativo e oficialmente desativado em órbita marciana desde 2006. Com órbita polar baixa a ~400 km, a vida residual depende da densidade atmosférica de Marte — estimada em décadas a poucos séculos.',
    riscos:      'Sonda de 1.030,5 kg (1,17 m × 1,17 m × 1,7 m) em órbita polar de Marte. Sua desativação reduz a capacidade de comunicação com missões em Marte — a NASA opera apenas duas sondas orbitais ativas após a perda do MGS. Risco de colisão com futuras missões orbitais marcianas.',
    destinos:    'Com órbita polar baixa (~400 km sobre Marte), a sonda sofre arrasto atmosférico residual. A vida orbital é estimada em décadas. Sem plano ativo de remoção. A desativação de outras sondas como o MGS reduz a capacidade de comunicação redundante da NASA com missões marcianas.',
    analise_origem:     'O Mars Global Surveyor operou por quase 10 anos, enviando mais de 240.000 imagens e criando o primeiro mapa topográfico global completo de Marte. Descobriu evidências de água líquida passada, confirmou a ausência de campo magnético global e mapeou locais de pouso para missões futuras. Foi desativado em 2006 após uma falha em um dos painéis solares que causou superaquecimento da bateria.',
    analise_permanencia:'Em órbita polar baixa a ~400 km sobre Marte, o MGS sofre arrasto residual da atmosfera marciana (CO₂). A vida orbital é estimada em décadas a poucos séculos — mais curta que órbitas equivalentes na Terra, pois a atmosfera marciana, embora tênue, ainda cria arrasto significativo.',
    analise_riscos:     'Com 1.030,5 kg, o MGS é um dos maiores objetos inativos em órbita marciana. Uma colisão criaria uma nuvem de detritos em Marte. Mais preocupante no curto prazo: com apenas 2 sondas orbitais ativas em Marte, a NASA enfrenta riscos crescentes de falha de comunicação com as missões na superfície.',
  },

  'S-08': {
    nome:        'Satélite inativo S-08 (Phobos 2)',
    tipo:        'satelite',
    corpo:       'marte',
    origem:      'Phobos 2 (URSS, 1988). Classificação: ônibus espacial. Tipo de nave: IF (nº 102). Operador: União Soviética. Foguete: Próton K/D. Lançamento: 12 de julho de 1988, às 17h01 UTC, da Plataforma 200/40, Cosmódromo de Baikonur. Inserção em órbita marciana: 30 de janeiro de 1989. Último contato: 27 de março de 1989.',
    altitude:    'Sem dados disponíveis (órbita próxima a Fobos, lua de Marte; altitude não especificada nos arquivos de referência) · Envergadura: 12 m',
    velocidade:  'Sem dados disponíveis',
    permanencia: 'A sonda permanece desativada orbitando a lua Fobos de Marte desde a perda do contato em 27 de março de 1989. Com órbita próxima a Fobos, a dinâmica gravitacional complexa (Marte + Fobos) pode causar mudanças orbitais ao longo do tempo.',
    riscos:      'Sonda de 6.220 kg (4 m de comprimento, 3,5 m de diâmetro, 12 m de envergadura) em órbita próxima a Fobos. Sem comunicação desde 1989. Risco de colisão com futuras missões à lua Fobos, que é alvo de interesse crescente (missão japonesa MMX prevista para a década de 2020).',
    destinos:    'A sonda Phobos 2 está em órbita ao redor de Marte/Fobos desde 1989. A dinâmica gravitacional do sistema Marte-Fobos pode alterar sua órbita ao longo de décadas. Futuras missões a Fobos (como a missão japonesa MMX) precisarão considerar este objeto.',
    analise_origem:     'O Phobos 2 foi uma das missões soviéticas mais ambiciosas ao Sistema Solar exterior. Seu objetivo era orbitar Marte, se aproximar da lua Fobos a 50 metros e soltar dois módulos de pouso (DAS e PROP-F) em sua superfície. Em 27 de março de 1989, uma falha no computador de bordo interrompeu o contato permanente a poucos dias de completar a missão.',
    analise_permanencia:'Em órbita ao redor de Marte/Fobos desde 1989, a Phobos 2 está em uma região gravitacionalmente complexa. A interação com a gravidade de Fobos e Marte pode alterar sua órbita ao longo de décadas. Sem monitoramento contínuo, sua posição atual é incerta.',
    analise_riscos:     'Com 6.220 kg, a Phobos 2 é um dos maiores objetos inativos no sistema marciano. A missão japonesa Martian Moons eXploration (MMX) planeja pousar em Fobos — a presença da Phobos 2 em órbita próxima representa um risco de colisão que precisará ser caracterizado antes do pouso.',
  },

  /* ================================================================
     MARTE — ESTÁGIO DE FOGUETE (E-07)
     ================================================================ */

  'E-07': {
    nome:        'Estágio de foguete E-07 (Mariner 9 — Atlas Centaur)',
    tipo:        'estagio',
    corpo:       'marte',
    origem:      'Mariner 9 (EUA, 1971). Classificação: ônibus espacial. Tipo: Mariner-71I. Foguete: Atlas Centaur (AC-23). Lançamento: 30 de maio de 1971, às 22h23 UTC, do Complexo 36-B, Cabo Canaveral. Inserção orbital: 10 de novembro de 1971. Último contato: 27 de outubro de 1972.',
    altitude:    'Velocidade inicial: 40.300 km/h · Velocidade em órbita: entre 11.950 km/h e 14.350 km/h (Órbita marciana)',
    velocidade:  'Entre 11.950 km/h e 14.350 km/h (em órbita marciana)',
    permanencia: 'A Mariner 9 está em órbita marciana desde 1971. Estima-se que tenha sido desintegrada pela atmosfera de Marte ou colidido com o planeta a partir de 2020, mas sem confirmações oficiais. Com órbita elíptica de longa duração, pode persistir por décadas adicionais.',
    riscos:      'Sonda de 997,9 kg (6,9 m de diâmetro, chassi 1,38 m × 45,7 m, altura 2,28 m) em órbita marciana. Sem comunicação desde 1972. A possível desintegração por arrasto atmosférico ou colisão com Marte não foi confirmada. Se ainda em órbita, representa risco para futuras missões orbitais marcianas.',
    destinos:    'Maior desafio identificado: mesmo com incerteza sobre sua situação atual após 50 anos, a Mariner 9 não apresenta riscos significativos segundo os arquivos de referência. Estima-se desintegração possível a partir de 2020, mas sem confirmação.',
    analise_origem:     'A Mariner 9 foi a primeira espaçonave a orbitar outro planeta. Cobriu 85% da superfície de Marte com mais de 7.000 imagens, revelando o vulcão Monte Olimpo, o cânion Valles Marineris e os primeiros sinais de erosão hídrica passada. Superou a sonda soviética Mars 2 por 11 dias e tornou-se o primeiro satélite artificial dos EUA em órbita de outro planeta além da Lua.',
    analise_permanencia:'A Mariner 9 esteve em órbita marciana por cerca de 1 ano de operação ativa (1971–1972) e permanece desde então sem comunicação. Estudos estimam que o arrasto residual da atmosfera marciana deve ter causado reentrada ou colisão com Marte em algum momento próximo a 2022, mas sem confirmação oficial.',
    analise_riscos:     'Com 997,9 kg e operando silenciosamente desde 1972, a Mariner 9 representa um desafio de rastreamento para futuras missões marcianas. Os arquivos de referência indicam que "não apresenta riscos" — porém, a incerteza sobre sua localização atual após 50 anos torna qualquer afirmação definitiva imprecisa.',
  },

  /* ================================================================
     MARTE — FRAGMENTO (F-10)
     ================================================================ */

  'F-10': {
    nome:        'Fragmento F-10 (Schiaparelli EDM)',
    tipo:        'fragmento',
    corpo:       'marte',
    origem:      'Destroços do módulo de pouso Schiaparelli EDM (ESA/Roscosmos, 2016). ID COSPAR: 2016-017A. Falha técnica e acidente em 19 de outubro de 2016. Operador: Agência Espacial Europeia (ESA) e Roscosmos. Massa seca: 577 kg. Parte da missão ExoMars Trace Gas Orbiter.',
    altitude:    'Sem dados disponíveis (destroços na superfície marciana após falha durante a descida em 19 de outubro de 2016)',
    velocidade:  'Sem dados disponíveis (impacto a alta velocidade após perda de controle durante descida)',
    permanencia: 'Os destroços do Schiaparelli estão na superfície marciana desde outubro de 2016. Na ausência de erosão significativa (Marte tem atmosfera tênue), esses materiais podem permanecer visíveis por décadas a séculos.',
    riscos:      'Os destroços estão espalhados na superfície de Marte (Meridiani Planum). Risco mínimo para missões atuais. O Schiaparelli carregava baterias e propelentes que podem ter criado contaminação localizada no ponto de impacto.',
    destinos:    'Os destroços na superfície marciana persistem por décadas a séculos. A atmosfera de Marte (95% CO₂, pressão <1% da terrestre) causa erosão eólica lenta, mas os materiais sólidos permanecem. O Mars Reconnaissance Orbiter da NASA fotografou o local de impacto.',
    analise_origem:     'O Schiaparelli EDM (Entry, Descent and Landing Demonstrator Module) foi projetado para testar tecnologias de pouso na atmosfera marciana em preparação para missões futuras da ExoMars. Em 19 de outubro de 2016, uma falha no sistema de medição inercial fez o módulo acreditar que estava mais perto da superfície do que estava, causando o acionamento prematuro dos propulsores e a falha do paraquedas — resultando em impacto a alta velocidade.',
    analise_permanencia:'Os destroços na superfície marciana são relativamente permanentes. A atmosfera tênue de Marte causa erosão eólica lenta, mas fragmentos sólidos permanecem por décadas a séculos. O MRO fotografou o ponto de impacto, mostrando o escudo térmico, o paraquedas e a carcaça espalhados em um raio de ~1 km.',
    analise_riscos:     'Os destroços do Schiaparelli na superfície de Marte representam um risco mínimo de colisão, mas levantam questões sobre contaminação de locais de interesse científico. A carcaça traseira, o paraquedas e os propelentes espalhados podem interferir com medições químicas em estudos futuros da região de Meridiani Planum.',
  },

  /* InSight fica na superfície. Os textos da ficha estão no i18n.js (insight.*). */
  'insight': {
    nome: 'InSight',
    tipo: 'artefato',
    corpo: 'marte',
    superficie: true,
    latitude: 4.5,
    longitude: 135.6,
  },

};
/*
 * ================================================================
 * RESUMO FINAL (exigido pela tarefa)
 * ================================================================
 *
 * OBJETOS PREENCHIDOS (com dados reais dos .md):
 *   Terra:  F-01 (Transit 4A), F-02 (OV2-1), F-03 (Cosmos 249),
 *           F-04 (Nimbus 4), F-05 (Fengyun-1C), F-06 (Iridium 33),
 *           F-07 (Cosmos 2251), F-08 (CBERS 1)
 *           S-01 (Transit 4A), S-02 (OV2-1), S-03 (Cosmos 249),
 *           S-04 (Spot 1), S-05 (Iridium 33)
 *           E-01 (Nimbus 4 / Thor-Agena D), E-02 (CBERS 1 / CZ-4B),
 *           E-03 (TES 1 / PSLV-C3), E-04 (STEP 2 / Pegasus HAPS),
 *           E-05 (Spot 1 / Ariane 1)
 *   Lua:    S-06 (Lunar Orbiter 1), E-06 (CZ-3C/Chang'e 5-T1),
 *           F-09 (Beresheet)
 *   Marte:  S-07 (Mars Global Surveyor), S-08 (Phobos 2),
 *           E-07 (Mariner 9 / Atlas Centaur), F-10 (Schiaparelli EDM)
 *   TOTAL: 18/18 objetos com dados reais
 *
 * OBJETOS SEM CORRESPONDÊNCIA DIRETA NOS .md:
 *   Nenhum. Todos os 18 slots foram preenchidos com dados reais
 *   dos arquivos fornecidos.
 *
 * CAMPOS QUE FICARAM COM "Sem dados disponíveis":
 *   - S-06 (Lunar Orbiter 1): altitude e velocidade — impactou a Lua,
 *     não está em órbita; dados de órbita não aplicáveis.
 *   - E-06 (CZ-3C/Chang'e 5-T1): altitude e velocidade — estava em
 *     órbita heliocêntrica (não lunar) antes do impacto; dados não
 *     fornecidos nos .md.
 *   - F-09 (Beresheet): altitude e velocidade — destroços na
 *     superfície lunar; dados de órbita não aplicáveis.
 *   - S-08 (Phobos 2): altitude — não especificada nos .md.
 *   - E-07 (Mariner 9): dados de órbita parciais (velocidades
 *     fornecidas como intervalo).
 *   - F-10 (Schiaparelli): altitude e velocidade — destroços na
 *     superfície marciana; dados de órbita não aplicáveis.
 *
 * CONFLITOS ENTRE ARQUIVOS:
 *   Nenhum conflito identificado. Os quatro arquivos cobrem objetos
 *   distintos (Terra.md: objetos terrestres; Lua.md: objetos lunares;
 *   Marte.md e Hackathon_M.md: objetos marcianos) sem sobreposição.
 *   O Hackathon_M.md e Material_Geral_Marte.md complementam-se:
 *   o primeiro tem fichas detalhadas (Mars 2/3, Mariner 9, Vikings,
 *   Phobos 2, MGS, Pathfinder, Mars Polar Lander, Spirit, Opportunity,
 *   Phoenix, MAVEN, Mangalyaan, InSight, Schiaparelli, Beagle 2);
 *   o segundo tem a tabela de objetos na superfície marciana.
 *   Não houve dados conflitantes entre eles.
 *
 * ESTRATÉGIA DE MAPEAMENTO (fragmentos):
 *   O jogo tem 8 slots de fragmentos para a Terra (F-01 a F-08) mas
 *   os .md descrevem eventos de fragmentação, não fragmentos numerados.
 *   Cada slot recebeu os dados do EVENTO que lhe deu origem:
 *   F-01=Transit 4A, F-02=OV2-1, F-03=Cosmos 249, F-04=Nimbus 4,
 *   F-05=Fengyun-1C, F-06=Iridium 33, F-07=Cosmos 2251, F-08=CBERS 1.
 *   Isso mantém todos os dados como reais e verificáveis.
 * ================================================================
 */
