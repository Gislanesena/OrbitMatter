/**
 * i18n.js — Sistema de internacionalização PT/EN
 * Atlas do Lixo Espacial
 *
 * Uso:
 *   I18n.setLang('en')  — muda para inglês
 *   I18n.setLang('pt')  — volta para português
 *   I18n.t('chave')     — retorna string no idioma ativo
 *   I18n.lang           — idioma ativo ('pt' | 'en')
 */

window.I18n = (() => {
  /* ── dicionário ─────────────────────────────────────────────────── */
  const dict = {
    /* ---- HUD ---- */
    'hud.brand.subtitle':          { pt: 'Protótipo · dados de exemplo',           en: 'Prototype · sample data' },
    'hud.level':                   { pt: 'Nível',                                  en: 'Level' },
    'hud.badges.aria':             { pt: 'Ver distintivos',                        en: 'View badges' },
    'hud.profile.aria':            { pt: 'Perfil do jogador',                      en: 'Player profile' },
    'hud.profile.chooseImg':       { pt: 'Escolher imagem',                        en: 'Choose image' },
    'hud.profile.removeImg':       { pt: 'Remover imagem',                         en: 'Remove image' },
    'hud.profile.logout':          { pt: 'Sair',                                   en: 'Sign out' },

    /* ---- loading ---- */
    'loading':                     { pt: 'Carregando órbita…',                     en: 'Loading orbit…' },

    /* ---- hint ---- */
    'hint':                        { pt: 'Arraste para olhar · role para passar pelos planetas até a Voyager · clique em um objeto para investigar',
                                     en: 'Drag to look · scroll past the planets to Voyager · click an object to investigate' },

    /* ---- navbar ---- */
    'navbar.destination':          { pt: 'Destino',                                en: 'Destination' },
    'navbar.earth':                { pt: 'Terra',                                  en: 'Earth' },
    'navbar.moon':                 { pt: 'Lua',                                    en: 'Moon' },
    'navbar.mars':                 { pt: 'Marte',                                  en: 'Mars' },
    'navbar.speed.now':            { pt: 'Agora',                                  en: 'Now' },
    'navbar.speed.1min':           { pt: '1 min/s',                               en: '1 min/s' },
    'navbar.speed.1h':             { pt: '1 h/s',                                 en: '1 h/s' },
    'navbar.time.day':             { pt: 'Dia em Brasília',                        en: 'Daytime in Brasília' },
    'navbar.time.night':           { pt: 'Noite em Brasília',                      en: 'Nighttime in Brasília' },

    /* ---- dock ---- */
    'dock.atlas':                  { pt: 'Atlas',                                  en: 'Atlas' },
    'dock.missions':               { pt: 'Missões',                                en: 'Missions' },
    'dock.simulation':             { pt: 'Simulação',                              en: 'Simulation' },
    'dock.diary':                  { pt: 'Diário',                                 en: 'Log' },
    'dock.voyager':                { pt: 'Voyager',                                en: 'Voyager' },
    'voyager.pin':                 { pt: 'Voyager 1',                              en: 'Voyager 1' },
    'voyager.pin.sub':             { pt: 'Muito além dos planetas',                en: 'Far beyond the planets' },

    /* ---- atlas drawer ---- */
    'atlas.title':                 { pt: 'Atlas orbital',                          en: 'Orbital atlas' },
    'atlas.investigated':          { pt: 'investigados',                           en: 'investigated' },
    'atlas.none':                  { pt: 'Nenhum objeto deste tipo aqui.',         en: 'No objects of this type here.' },
    'atlas.filter.all':            { pt: 'Todos',                                  en: 'All' },
    'atlas.type.fragment':         { pt: 'Fragmentos',                             en: 'Fragments' },
    'atlas.type.satellite':        { pt: 'Satélites',                              en: 'Satellites' },
    'atlas.type.stage':            { pt: 'Estágios',                               en: 'Stages' },
    'atlas.type.artifact':         { pt: 'Artefatos',                              en: 'Artifacts' },
    'atlas.status.analyzed':       { pt: 'Analisado',                              en: 'Analyzed' },
    'atlas.status.investigated':   { pt: 'Investigado',                            en: 'Investigated' },
    'atlas.status.target':         { pt: 'Alvo',                                   en: 'Target' },
    'atlas.status.new':            { pt: 'Novo',                                   en: 'New' },

    /* ---- object panel ---- */
    'obj.band.low':                { pt: 'Órbita baixa',                           en: 'Low orbit' },
    'obj.band.mid':                { pt: 'Órbita média',                           en: 'Medium orbit' },
    'obj.band.high':               { pt: 'Órbita alta',                            en: 'High orbit' },
    'obj.band.surface':            { pt: 'Superfície lunar',                       en: 'Lunar surface' },
    'obj.moon.legend':             { pt: 'Longitude 0° do pino aponta para a Terra. A textura da Lua é procedural e não é um mapa.',
                                     en: 'Pin longitude 0° faces Earth. The Moon texture is procedural and is not a map.' },
    'obj.band.lunar':              { pt: 'Órbita lunar',                           en: 'Lunar orbit' },
    'obj.band.martian':            { pt: 'Órbita marciana',                        en: 'Martian orbit' },
    'obj.position':                { pt: 'posição ilustrativa',                    en: 'illustrative position' },
    'obj.sheet':                   { pt: 'Ficha do objeto',                        en: 'Object sheet' },
    'obj.soon':                    { pt: 'Dados reais em breve',                   en: 'Real data coming soon' },
    'obj.nodata':                  { pt: 'Sem dados disponíveis',                  en: 'No data available' },
    'obj.field.origin':            { pt: 'Origem',                                 en: 'Origin' },
    'obj.field.altitude':          { pt: 'Altitude',                               en: 'Altitude' },
    'obj.field.speed':             { pt: 'Velocidade',                             en: 'Speed' },
    'obj.field.time':              { pt: 'Tempo em órbita',                        en: 'Time in orbit' },
    'obj.field.risks':             { pt: 'Riscos',                                 en: 'Risks' },
    'obj.field.destinations':      { pt: 'Possíveis destinos',                     en: 'Possible destinations' },
    'obj.mission.target':          { pt: 'Alvo da missão',                         en: 'Mission target' },
    'obj.analysis':                { pt: 'Análise',                                en: 'Analysis' },
    'obj.analysis.step1':          { pt: 'Como surgiu',                            en: 'How it came to be' },
    'obj.analysis.step2':          { pt: 'Quanto tempo fica em órbita',            en: 'How long it stays in orbit' },
    'obj.analysis.step3':          { pt: 'Quais riscos apresenta',                 en: 'What risks it poses' },
    'obj.analysis.done':           { pt: 'Feito',                                  en: 'Done' },
    'obj.analysis.xp':             { pt: '+10 XP',                                 en: '+10 XP' },
    'obj.analysis.noref':          { pt: 'Informação não disponível nos arquivos de referência para este objeto.',
                                     en: 'Information not available in reference files for this object.' },
    'obj.conclude':                { pt: 'Concluir análise · +20 XP',              en: 'Complete analysis · +20 XP' },
    'obj.conclude.hint':           { pt: 'Abra as três etapas da análise para concluir.',
                                     en: 'Open all three analysis steps to complete.' },
    'obj.analyzed':                { pt: 'Análise concluída',                      en: 'Analysis complete' },
    'obj.go.decision':             { pt: 'Ir para a decisão',                      en: 'Go to decision' },
    'obj.close.aria':              { pt: 'Fechar ficha',                           en: 'Close sheet' },

    /* ---- types ---- */
    'type.fragment':               { pt: 'Fragmento',                              en: 'Fragment' },
    'type.satellite':              { pt: 'Satélite inativo',                       en: 'Inactive satellite' },
    'type.stage':                  { pt: 'Estágio de foguete',                     en: 'Rocket stage' },
    'type.artifact':               { pt: 'Artefato histórico',                     en: 'Historic artifact' },

    /* ---- mission card ---- */
    'mc.done':                     { pt: 'Campanha concluída',                     en: 'Campaign complete' },
    'mc.done.title':               { pt: 'Todos os capítulos concluídos',          en: 'All chapters completed' },
    'mc.done.sub':                 { pt: 'Continue explorando o atlas ou teste cenários na simulação.',
                                     en: 'Keep exploring the atlas or try scenarios in the simulation.' },
    'mc.done.diary':               { pt: 'Ver diário',                             en: 'View log' },
    'mc.chapter':                  { pt: 'Capítulo',                               en: 'Chapter' },
    'mc.of':                       { pt: 'de',                                     en: 'of' },
    'mc.target':                   { pt: 'Alvo',                                   en: 'Target' },
    'mc.investigate':              { pt: 'Investigue',                             en: 'Investigate' },
    'mc.conclude':                 { pt: 'Conclua a análise',                      en: 'Complete the analysis' },
    'mc.decide':                   { pt: 'Tome a decisão',                         en: 'Make the decision' },
    'mc.check1pre':                { pt: 'Investigar',                             en: 'Investigate' },
    'mc.check2':                   { pt: 'Concluir a análise do objeto',           en: 'Complete the object analysis' },
    'mc.check3':                   { pt: 'Escolher uma estratégia',                en: 'Choose a strategy' },
    'mc.need.see':                 { pt: 'Esse passo abre depois que você investigar um alvo.', en: 'This step opens after you investigate a target.' },
    'mc.need.analysis':            { pt: 'Conclua a análise antes de escolher a estratégia.', en: 'Finish the analysis before choosing a strategy.' },
    'mc.decide.btn':               { pt: 'Tomar decisão',                          en: 'Make decision' },
    'mc.atlas.btn':                { pt: 'Ver alvos no atlas',                     en: 'View targets in atlas' },

    /* ---- phases ---- */
    'phase.1':                     { pt: 'Descoberta',                             en: 'Discovery' },
    'phase.2':                     { pt: 'Investigação',                           en: 'Investigation' },
    'phase.3':                     { pt: 'Análise',                                en: 'Analysis' },
    'phase.4':                     { pt: 'Decisão',                                en: 'Decision' },
    'phase.5':                     { pt: 'Aprendizado',                            en: 'Learning' },

    /* ---- mission copy ---- */
    'mission.m1.title':            { pt: 'Estágio à deriva',                       en: 'Drifting stage' },
    'mission.m1.briefing':         { pt: 'A Equipe Aurora precisa de uma decisão sobre um estágio abandonado. Os fatos são os do objeto que você analisar.',
                                     en: 'The Aurora team needs a decision on an abandoned stage. The facts are those of the object you analyze.' },
    'mission.m1.explain':          { pt: 'A explicação sai da ficha do estágio e do risco do simulador antes e depois da ação.',
                                     en: 'The explanation comes from the stage sheet and from the simulator risk before and after the action.' },
    'mission.m2.title':            { pt: 'Herança na Lua',                         en: 'Heritage on the Moon' },
    'mission.m2.briefing':         { pt: 'A Equipe Selene pede o que fazer com um artefato que já está na superfície da Lua.',
                                     en: 'The Selene team asks what to do with an artifact that is already on the lunar surface.' },
    'mission.m2.explain':          { pt: 'O retorno é o texto da opção escolhida. O risco é do entorno lunar didático, não do artefato.',
                                     en: 'The return is the text of the chosen option. The risk is the teaching scenario around the Moon, not the artifact.' },
    'mission.m3.title':            { pt: 'Nuvem de fragmentos',                    en: 'Fragment cloud' },
    'mission.m3.briefing':         { pt: 'Um operador de constelação pede uma decisão sobre o fragmento de um evento real de fragmentação.',
                                     en: 'A constellation operator asks for a decision about a fragment from a real fragmentation event.' },
    'mission.m3.explain':          { pt: 'A explicação sai da ficha do fragmento e do risco do simulador antes e depois da ação.',
                                     en: 'The explanation comes from the fragment sheet and from the simulator risk before and after the action.' },
    'missions.origin.ai':          { pt: 'Gerada por IA',                          en: 'Generated by AI' },
    'missions.origin.standard':    { pt: 'Missão padrão',                          en: 'Standard mission' },
    'missions.facts':              { pt: 'Fatos do objeto analisado',              en: 'Facts from the analyzed object' },
    'missions.risk.env':           { pt: 'Risco do entorno lunar (cenário didático)', en: 'Lunar environment risk (teaching scenario)' },
    'moon.client':                 { pt: 'Mensagem do cliente',                    en: 'Client message' },
    'moon.briefing':               { pt: 'Briefing do catálogo',                   en: 'Catalog briefing' },
    'moon.position':               { pt: 'Posição: {conf}',                        en: 'Position: {conf}' },
    'moon.position.m':             { pt: 'Posição: {conf} (±{m} m)',               en: 'Position: {conf} (±{m} m)' },
    'moon.plan':                   { pt: 'Planejar a aproximação',                 en: 'Plan the approach' },
    'moon.auto':                   { pt: 'Usar rota automática',                   en: 'Use the automatic route' },
    'moon.hint':                   { pt: 'Escolha o que a Equipe Selene deve fazer.', en: 'Choose what the Selene team should do.' },
    'moon.eyebrow':                { pt: 'Etapa 4 · Decisão',                      en: 'Stage 4 · Decision' },
    'moon.title':                  { pt: 'Planejar a aproximação',                 en: 'Plan the approach' },
    'moon.scale':                  { pt: 'Escala didática, não é norma real.',     en: 'Teaching scale, not a real standard.' },
    'moon.undo':                   { pt: 'Desfazer',                               en: 'Undo' },
    'moon.clear':                  { pt: 'Limpar',                                 en: 'Clear' },
    'moon.run':                    { pt: 'Executar',                               en: 'Run' },
    'moon.confirm':                { pt: 'Confirmar rota',                         en: 'Confirm route' },
    'moon.fuel':                   { pt: 'Combustível',                            en: 'Fuel' },
    'moon.reading':                { pt: 'Leitura',                                en: 'Reading' },
    'moon.distance':               { pt: 'Distância ao sítio (didática)',          en: 'Distance to the site (teaching scale)' },
    'moon.inside':                 { pt: 'Dentro da zona de exclusão',             en: 'Inside the exclusion zone' },
    'moon.exclusion':              { pt: 'Zona de exclusão',                       en: 'Exclusion zone' },
    'moon.legend.uncertainty':     { pt: 'Incerteza (tracejado)',                  en: 'Uncertainty (dashed)' },
    'moon.legend.exclusion':       { pt: 'Zona de exclusão (hachura)',             en: 'Exclusion zone (hatched)' },
    'moon.legend.band':            { pt: 'Banda de observação',                    en: 'Observation band' },
    'moon.sound.off':              { pt: 'Som desligado',                          en: 'Sound off' },
    'moon.sound.on':               { pt: 'Som ligado',                             en: 'Sound on' },
    'moon.why.line':               { pt: 'Posição {conf}, {inc} m didáticos, então a zona de exclusão é {exc} m.',
                                     en: 'Position {conf}, {inc} m on the teaching scale, so the exclusion zone is {exc} m.' },
    'moon.lesson':                 { pt: 'Quanto melhor se conhece a posição, mais perto se pode chegar.',
                                     en: 'The better the position is known, the closer a route can come.' },
    'moon.auto.note':              { pt: 'Rota automática: medidores de execução neutros (50).',
                                     en: 'Automatic route: neutral execution meters (50).' },
    'moon.auto.short':             { pt: 'rota automática',                        en: 'automatic route' },
    'moon.report.route':           { pt: 'rota planejada',                         en: 'planned route' },
    'moon.trail':                  { pt: 'Trilha da rota',                         en: 'Route trail' },
    'moon.bar.ciencia':            { pt: 'Ciência',                                en: 'Science' },
    'moon.bar.comb':               { pt: 'Combustível',                            en: 'Fuel' },
    'moon.bar.seg':                { pt: 'Segurança',                              en: 'Safety' },
    'robot.title':                 { pt: 'SojournBot',                             en: 'SojournBot' },
    'robot.status':                { pt: 'Pronto para ajudar',                     en: 'Ready to help' },
    'robot.listening':             { pt: 'Ouvindo…',                               en: 'Listening…' },
    'robot.thinking':              { pt: 'Pensando…',                              en: 'Thinking…' },
    'robot.close':                 { pt: 'Fechar chat',                            en: 'Close chat' },
    'robot.open':                  { pt: 'Abrir SojournBot',                       en: 'Open SojournBot' },
    'robot.arrow':                 { pt: 'Abrir chat',                             en: 'Open chat' },
    'robot.chat':                  { pt: 'Chat com o SojournBot',                  en: 'Chat with SojournBot' },
    'robot.hello':                 { pt: 'Olá! Sou o SojournBot. Pergunte sobre lixo espacial, órbitas e as missões do Atlas. Você pode digitar ou usar o microfone.',
                                     en: 'Hello! I am SojournBot. Ask about space debris, orbits, and the Atlas missions. You can type or use the microphone.' },
    'robot.q1':                    { pt: 'O que é lixo espacial?',                 en: 'What is space debris?' },
    'robot.q2':                    { pt: 'O que é a síndrome de Kessler?',         en: 'What is Kessler syndrome?' },
    'robot.q3':                    { pt: 'Como reduzir o lixo orbital?',           en: 'How can orbital debris be reduced?' },
    'robot.placeholder':           { pt: 'Digite ou fale sua dúvida…',             en: 'Type or speak your question…' },
    'robot.input':                 { pt: 'Sua dúvida',                             en: 'Your question' },
    'robot.mic':                   { pt: 'Gravar pergunta por voz',                en: 'Record a spoken question' },
    'robot.mic.title':             { pt: 'Falar sua dúvida',                       en: 'Speak your question' },
    'robot.send':                  { pt: 'Enviar',                                 en: 'Send' },
    'missions.risk.before':        { pt: 'Antes',                                  en: 'Before' },
    'missions.risk.after':         { pt: 'Depois',                                 en: 'After' },
    'missions.preparing':          { pt: 'Preparando a missão da Lua…',            en: 'Preparing the Moon mission…' },
    'result.why':                  { pt: 'Por que essa nota',                      en: 'Why this score' },
    'result.what':                 { pt: 'O que aconteceu com a missão de',        en: 'What happened to the mission of' },
    'result.report':               { pt: 'Relatório do comandante',                en: 'Commander\'s report' },
    'result.report.lead':          { pt: '{jogador}, estes são os três capítulos, com as notas que a jornada já calculou.',
                                     en: '{jogador}, these are the three chapters, with the scores the journey already calculated.' },
    'result.report.avg':           { pt: 'Média das três notas',                   en: 'Average of the three scores' },
    'result.report.ai':            { pt: 'A IA só escreve a missão da Lua, e só quando a origem marcada é o modelo. Os capítulos da Terra usam o simulador e as fichas. Sem o modelo, a Lua segue a missão padrão do catálogo.',
                                     en: 'AI writes only the Moon mission, and only when the marked origin is the model. The Earth chapters use the simulator and the sheets. Without the model, the Moon uses the standard catalog mission.' },

    /* ---- intro modal ---- */
    'intro.eyebrow':               { pt: 'Etapa 1 · Descoberta',                   en: 'Stage 1 · Discovery' },
    'intro.title':                 { pt: 'A órbita da Terra está ficando lotada.', en: 'Earth\'s orbit is getting crowded.' },
    'intro.body':                  { pt: 'Você é um agente de tráfego orbital. Explore a Terra, a Lua e Marte na ordem que quiser, investigue objetos abandonados e decida como reduzir os riscos para as próximas missões. O caminho é seu: cada objeto que você visita entra no seu diário de bordo.',
                                     en: 'You are an orbital traffic agent. Explore Earth, the Moon, and Mars in any order, investigate abandoned objects, and decide how to reduce risks for upcoming missions. The path is yours: every object you visit goes into your mission log.' },
    'intro.journey.aria':          { pt: 'Como funciona a jornada',                en: 'How the journey works' },
    'intro.j1':                    { pt: 'Descoberta',                             en: 'Discovery' },
    'intro.j1.sub':                { pt: 'Você recebe uma missão.',                en: 'You receive a mission.' },
    'intro.j2':                    { pt: 'Investigação',                           en: 'Investigation' },
    'intro.j2.sub':                { pt: 'Clique em fragmentos, satélites, estágios e nos artefatos da Lua.', en: 'Click fragments, satellites, stages, and the artifacts on the Moon.' },
    'intro.j3':                    { pt: 'Análise',                                en: 'Analysis' },
    'intro.j3.sub':                { pt: 'Descubra origem, permanência e riscos.', en: 'Uncover origin, persistence and risks.' },
    'intro.j4':                    { pt: 'Decisão',                                en: 'Decision' },
    'intro.j4.sub':                { pt: 'Escolha uma estratégia no cenário.',     en: 'Choose a strategy for the scenario.' },
    'intro.j5':                    { pt: 'Aprendizado',                            en: 'Learning' },
    'intro.j5.sub':                { pt: 'Ganhe XP, distintivos e capítulos.',     en: 'Earn XP, badges and chapters.' },
    'intro.mission.eyebrow':       { pt: 'Sua primeira missão · Capítulo 1',       en: 'Your first mission · Chapter 1' },
    'intro.start':                 { pt: 'Entrar na órbita',                       en: 'Enter orbit' },

    /* ---- missions modal ---- */
    'missions.eyebrow':            { pt: 'Simulador de decisões',                  en: 'Decision simulator' },
    'missions.title':              { pt: 'Missões',                                en: 'Missions' },
    'missions.close':              { pt: 'Fechar',                                 en: 'Close' },
    'missions.chapter':            { pt: 'Capítulo',                               en: 'Chapter' },
    'missions.status.done':        { pt: 'Concluído',                              en: 'Completed' },
    'missions.status.pts':         { pt: 'pts',                                    en: 'pts' },
    'missions.status.ongoing':     { pt: 'Em andamento',                           en: 'In progress' },
    'missions.status.locked':      { pt: 'Bloqueado',                              en: 'Locked' },
    'missions.eyebrow2':           { pt: 'Etapa 4 · Decisão',                      en: 'Stage 4 · Decision' },
    'missions.strategy.title':     { pt: 'Escolha uma estratégia',                 en: 'Choose a strategy' },
    'missions.lead.label':         { pt: 'Antecedência da ação',                   en: 'Action lead time' },
    'missions.lead.hint':          { pt: '1 = perto da aproximação. 10 = muita antecedência.',
                                     en: '1 = close to the approach. 10 = lots of lead time.' },
    'missions.preview':            { pt: 'Previsão',                               en: 'Forecast' },
    'missions.confirm':            { pt: 'Confirmar decisão',                      en: 'Confirm decision' },
    'missions.hint.choose':        { pt: 'Selecione uma estratégia para ver o equilíbrio entre segurança, combustível, custo e ciência.',
                                     en: 'Select a strategy to see the balance between safety, fuel, budget and science.' },
    'missions.locked.msg':         { pt: 'Para liberar a decisão, investigue e conclua a análise de um',
                                     en: 'To unlock the decision, investigate and complete the analysis of a' },
    'missions.locked.btn':         { pt: 'Ver alvos no atlas',                     en: 'View targets in atlas' },
    'missions.youChose':           { pt: 'Você escolheu',                          en: 'You chose' },
    'missions.andScored':          { pt: 'e tirou',                                en: 'and scored' },
    'missions.points':             { pt: 'pontos',                                 en: 'points' },

    /* ---- meters ---- */
    'meter.seg':                   { pt: 'Segurança',                              en: 'Safety' },
    'meter.comb':                  { pt: 'Combustível restante',                   en: 'Remaining fuel' },
    'meter.orc':                   { pt: 'Orçamento restante',                     en: 'Remaining budget' },
    'meter.ciencia':               { pt: 'Impacto científico',                     en: 'Scientific impact' },

    /* ---- strategies ---- */
    'strat.desvio':                { pt: 'Manobra de desvio',                      en: 'Evasive maneuver' },
    'strat.desvio.desc':           { pt: 'Mover a nave ou o satélite ativo para fora da rota do objeto.',
                                     en: 'Move the spacecraft or active satellite away from the object\'s path.' },
    'strat.remocao':               { pt: 'Remoção ativa',                          en: 'Active removal' },
    'strat.remocao.desc':          { pt: 'Enviar um veículo para capturar o objeto com rede ou braço robótico.',
                                     en: 'Send a vehicle to capture the object with a net or robotic arm.' },
    'strat.desorbitar':            { pt: 'Desorbitar',                             en: 'Deorbit' },
    'strat.desorbitar.desc':       { pt: 'Acoplar um propulsor e levar o objeto para queimar na atmosfera.',
                                     en: 'Attach a thruster and guide the object to burn up in the atmosphere.' },
    'strat.monitorar':             { pt: 'Monitorar e aguardar',                   en: 'Monitor and wait' },
    'strat.monitorar.desc':        { pt: 'Acompanhar o objeto com radares e agir só se o risco subir.',
                                     en: 'Track the object with radars and act only if risk increases.' },

    /* ---- grades ---- */
    'grade.excellent':             { pt: 'Excelente',                              en: 'Excellent' },
    'grade.good':                  { pt: 'Boa',                                    en: 'Good' },
    'grade.risky':                 { pt: 'Arriscada',                              en: 'Risky' },
    'grade.critical':              { pt: 'Crítica',                                en: 'Critical' },

    /* ---- result modal ---- */
    'result.eyebrow':              { pt: 'Etapa 5 · Aprendizado',                  en: 'Stage 5 · Learning' },
    'result.title':                { pt: 'Resultado da decisão',                   en: 'Decision result' },
    'result.science.eyebrow':      { pt: 'Explicação científica',                  en: 'Scientific explanation' },
    'result.chapter':              { pt: 'Capítulo',                               en: 'Chapter' },
    'result.unlocked':             { pt: 'liberado',                               en: 'unlocked' },
    'result.campaignDone':         { pt: 'Campanha concluída',                     en: 'Campaign complete' },
    'result.next':                 { pt: 'Seguir para o capítulo',                 en: 'Continue to chapter' },
    'result.keepExploring':        { pt: 'Continuar explorando',                   en: 'Keep exploring' },

    /* ---- kessler modal ---- */
    'kessler.eyebrow':             { pt: 'Causa e consequência',                   en: 'Cause and effect' },
    'kessler.title':               { pt: 'Simulação da síndrome de Kessler',       en: 'Kessler syndrome simulation' },
    'kessler.desc':                { pt: 'Cada colisão do modelo retira 2 objetos e devolve 6 fragmentos. O ciclo é uma unidade do modelo, não um ano. Ajuste os lançamentos e a remoção e compare o efeito.',
                                     en: 'Each collision in the model removes 2 objects and returns 6 fragments. A cycle is a unit of the model, not a year. Adjust launches and removal and compare the effect.' },
    'kessler.total':               { pt: 'Objetos em órbita',                      en: 'Objects in orbit' },
    'kessler.fragments':           { pt: 'Fragmentos',                             en: 'Fragments' },
    'kessler.collisions':          { pt: 'Colisões',                               en: 'Collisions' },
    'kessler.cycles':              { pt: 'Ciclos simulados',                       en: 'Simulated cycles' },
    'kessler.total.legend':        { pt: 'Objetos',                                en: 'Objects' },
    'kessler.mark':                { pt: 'Mudança de risco',                       en: 'Risk change' },
    'kessler.launch.label':        { pt: 'Lançamentos por ciclo',                  en: 'Launches per cycle' },
    'kessler.remove.label':        { pt: 'Remoção ativa por ciclo',                en: 'Active removal per cycle' },
    'kessler.anim.label':          { pt: 'Velocidade da animação',                 en: 'Animation speed' },
    'kessler.advanced':            { pt: 'Avançado',                               en: 'Advanced' },
    'kessler.initial.label':       { pt: 'População inicial',                      en: 'Starting population' },
    'kessler.velocity.label':      { pt: 'Velocidade relativa dos objetos',        en: 'Relative speed of the objects' },
    'kessler.horizon.label':       { pt: 'Horizonte em ciclos',                    en: 'Horizon in cycles' },
    'kessler.preset.control':      { pt: 'Órbita sob controle',                    en: 'Orbit under control' },
    'kessler.preset.cascade':      { pt: 'Rumo à cascata',                         en: 'Heading for cascade' },
    'kessler.preset.cleanup':      { pt: 'Limpeza máxima',                         en: 'Maximum cleanup' },
    'kessler.start':               { pt: 'Iniciar',                                en: 'Start' },
    'kessler.pause':               { pt: 'Pausar',                                 en: 'Pause' },
    'kessler.continue':            { pt: 'Continuar',                              en: 'Continue' },
    'kessler.reset':               { pt: 'Reiniciar',                              en: 'Reset' },
    'kessler.note':                { pt: 'Modelo didático: mostra o efeito das escolhas do jogador, não uma previsão de órbitas reais. Os limiares são do modelo.',
                                     en: 'Teaching model: it shows the effect of the player\'s choices, not a forecast of real orbits. The thresholds belong to the model.' },
    'kessler.rule.low':            { pt: 'Baixo: menos de 4.000 objetos e nenhuma colisão no ciclo.',
                                     en: 'Low: fewer than 4,000 objects and no collision in the cycle.' },
    'kessler.rule.mid':            { pt: 'Moderado: 4.000 objetos ou mais, ou ao menos uma colisão.',
                                     en: 'Moderate: 4,000 objects or more, or at least one collision.' },
    'kessler.rule.high':           { pt: 'Alto: 8.000 objetos ou mais, ou 5 colisões ou mais, enquanto a remoção cobre o saldo do ciclo.',
                                     en: 'High: 8,000 objects or more, or 5 collisions or more, while removal still covers the cycle balance.' },
    'kessler.rule.critical':       { pt: 'Cascata: 2 colisões ou mais e o saldo (colisões × 4) maior que a remoção do ciclo, ou a população no teto de 250.000.',
                                     en: 'Cascade: 2 collisions or more and the balance (collisions × 4) greater than the cycle\'s removal, or the population at the internal ceiling of 250,000.' },
    'kessler.risk.low':            { pt: 'Risco baixo',                            en: 'Low risk' },
    'kessler.risk.mid':            { pt: 'Risco moderado',                         en: 'Moderate risk' },
    'kessler.risk.high':           { pt: 'Risco alto',                             en: 'High risk' },
    'kessler.risk.critical':       { pt: 'Cascata',                                en: 'Cascade' },
    'result.practice':             { pt: 'Se essa prática fosse adotada em larga escala (modelo didático), o risco do cenário seguiria as duas curvas abaixo. A decisão desta missão, sozinha, não muda a população em órbita.',
                                     en: 'If this practice were adopted at large scale (teaching model), the scenario risk would follow the two curves below. This mission\'s decision, by itself, does not change the orbiting population.' },
    'result.seeSim':               { pt: 'Ver na simulação de Kessler',            en: 'See it in the Kessler simulation' },
    'result.series.none':          { pt: 'Sem a prática',                          en: 'Without the practice' },
    'result.series.with':          { pt: 'Com a estratégia',                       en: 'With the strategy' },
    'result.chart':                { pt: 'Objetos por ciclo, sem a prática e com a estratégia',
                                     en: 'Objects per cycle, without the practice and with the strategy' },

    /* ---- diary modal ---- */
    'diary.eyebrow':               { pt: 'Diário de bordo',                        en: 'Mission log' },
    'diary.title':                 { pt: 'Sua jornada',                            en: 'Your journey' },
    'diary.path':                  { pt: 'Seu trajeto',                            en: 'Your path' },
    'diary.path.sub':              { pt: 'Na ordem que você escolheu',             en: 'In the order you chose' },
    'diary.path.empty':            { pt: 'Seu trajeto aparece aqui. Escolha qualquer objeto no mapa para começar.',
                                     en: 'Your path appears here. Choose any object on the map to begin.' },
    'diary.badges':                { pt: 'Distintivos',                            en: 'Badges' },
    'diary.stat.level':            { pt: 'XP no total',                            en: 'XP total' },
    'diary.stat.objects':          { pt: 'Objetos investigados',                   en: 'Objects investigated' },
    'diary.stat.analyses':         { pt: 'Análises concluídas',                    en: 'Analyses completed' },
    'diary.stat.chapters':         { pt: 'Capítulos concluídos',                   en: 'Chapters completed' },
    'diary.reset.confirm':         { pt: 'Apagar todo o progresso deste navegador?', en: 'Delete all progress from this browser?' },
    'diary.reset.btn':             { pt: 'Apagar progresso',                       en: 'Delete progress' },
    'diary.reset.cancel':          { pt: 'Cancelar',                               en: 'Cancel' },
    'diary.reset.ask':             { pt: 'Recomeçar jornada',                      en: 'Restart journey' },

    /* ---- badges ---- */
    'badge.contato':               { pt: 'Primeiro contato',                       en: 'First contact' },
    'badge.contato.desc':          { pt: 'Investigue o primeiro objeto.',          en: 'Investigate the first object.' },
    'badge.analista':              { pt: 'Analista orbital',                       en: 'Orbital analyst' },
    'badge.analista.desc':         { pt: 'Conclua 3 análises.',                    en: 'Complete 3 analyses.' },
    'badge.catalogo':              { pt: 'Catalogador',                            en: 'Cataloguer' },
    'badge.catalogo.desc':         { pt: 'Investigue os três tipos de objeto.',    en: 'Investigate all three object types.' },
    'badge.rota':                  { pt: 'Rota própria',                           en: 'Own route' },
    'badge.rota.desc':             { pt: 'Monte um trajeto com 8 paradas.',        en: 'Build a route with 8 stops.' },
    'badge.estrategista':          { pt: 'Estrategista',                           en: 'Strategist' },
    'badge.estrategista.desc':     { pt: 'Conclua a primeira missão.',             en: 'Complete the first mission.' },
    'badge.equilibrio':            { pt: 'Equilíbrio fino',                        en: 'Fine balance' },
    'badge.equilibrio.desc':       { pt: 'Tire 80 ou mais em uma decisão.',        en: 'Score 80 or more in a decision.' },
    'badge.cascata':               { pt: 'Testemunha da cascata',                  en: 'Cascade witness' },
    'badge.cascata.desc':          { pt: 'Veja 25 colisões na simulação.',         en: 'See 25 collisions in the simulation.' },
    'badge.comandante':            { pt: 'Comandante orbital',                     en: 'Orbital commander' },
    'badge.comandante.desc':       { pt: 'Conclua os três capítulos.',             en: 'Complete all three chapters.' },
    'badge.viajante':              { pt: 'Viajante interplanetário',               en: 'Interplanetary traveller' },
    'badge.viajante.desc':         { pt: 'Visite a Lua e Marte.',                  en: 'Visit the Moon and Mars.' },

    /* ---- toasts ---- */
    'toast.xp':                    { pt: 'Objeto investigado',                     en: 'Object investigated' },
    'toast.step':                  { pt: 'Etapa da análise',                       en: 'Analysis step' },
    'toast.conclude':              { pt: 'Análise concluída',                      en: 'Analysis complete' },
    'toast.level':                 { pt: 'Novo nível alcançado',                   en: 'New level reached' },
    'toast.badge':                 { pt: 'Distintivo',                             en: 'Badge' },
    'toast.mission':               { pt: 'Missão recebida',                        en: 'Mission received' },
    'toast.chapter':               { pt: 'Capítulo 1',                             en: 'Chapter 1' },
    'toast.decision':              { pt: 'Decisão tomada',                         en: 'Decision made' },
    'toast.google':                { pt: 'Requer servidor local. Ver instruções abaixo.', en: 'Requires local server. See instructions below.' },

    /* ---- login modal ---- */
    'login.eyebrow':               { pt: 'Atlas do Lixo Espacial',                 en: 'Space Debris Atlas' },
    'login.title':                 { pt: 'Bem-vindo, comandante.',                  en: 'Welcome, commander.' },
    'login.subtitle':              { pt: 'Identifique-se para salvar seu progresso e retomar de onde parou.',
                                     en: 'Sign in to save your progress and pick up where you left off.' },
    'login.tab.new':               { pt: 'Novo personagem',                        en: 'New character' },
    'login.tab.enter':             { pt: 'Já tenho personagem',                    en: 'I have a character' },
    'login.label.name':            { pt: 'Nome do personagem',                     en: 'Character name' },
    'login.placeholder.name':      { pt: 'ex.: Comandante Nova',                   en: 'e.g. Commander Nova' },
    'login.label.email':           { pt: 'E-mail',                                 en: 'Email' },
    'login.btn.create':            { pt: 'Criar personagem',                       en: 'Create character' },
    'login.btn.create.google':     { pt: 'Confirmar e entrar',                     en: 'Confirm and sign in' },
    'login.divider':               { pt: 'ou',                                     en: 'or' },
    'login.btn.google':            { pt: 'Entrar com Google',                      en: 'Sign in with Google' },
    'login.google.note':           { pt: 'O login com Google requer servidor local ou hospedagem.',
                                     en: 'Google sign-in requires a local server or hosting.' },
    'login.google.more':           { pt: 'Saiba mais.',                            en: 'Learn more.' },
    'login.placeholder.login':     { pt: 'Seu nome de usuário',                    en: 'Your username' },
    'login.btn.enter':             { pt: 'Entrar',                                 en: 'Sign in' },
    'login.google.info':           { pt: 'O login com Google usa Firebase Authentication, que <strong style="color:var(--fg)">não funciona em file://</strong>.<br>Para testar localmente: <code style="color:var(--data)">npx serve .</code> ou <code style="color:var(--data)">python -m http.server</code> e acesse <code style="color:var(--data)">http://localhost:5000</code>.<br>Para publicar: use <strong style="color:var(--fg)">Firebase Hosting</strong> ou <strong style="color:var(--fg)">GitHub Pages</strong>.<br>Configure no console: <a href="https://console.firebase.google.com" target="_blank" rel="noopener" style="color:var(--data)">console.firebase.google.com</a>',
                                     en: 'Google sign-in uses Firebase Authentication, which <strong style="color:var(--fg)">does not work on file://</strong>.<br>To test locally: <code style="color:var(--data)">npx serve .</code> or <code style="color:var(--data)">python -m http.server</code> then open <code style="color:var(--data)">http://localhost:5000</code>.<br>To publish: use <strong style="color:var(--fg)">Firebase Hosting</strong> or <strong style="color:var(--fg)">GitHub Pages</strong>.<br>Configure at: <a href="https://console.firebase.google.com" target="_blank" rel="noopener" style="color:var(--data)">console.firebase.google.com</a>' },

    /* ---- login validation messages ---- */
    'valid.name.empty':            { pt: 'O nome não pode ser vazio.',             en: 'Name cannot be empty.' },
    'valid.name.min':              { pt: 'Mínimo de 3 caracteres.',                en: 'Minimum 3 characters.' },
    'valid.name.max':              { pt: 'Máximo de 20 caracteres.',               en: 'Maximum 20 characters.' },
    'valid.name.trim':             { pt: 'O nome não pode ter espaços no início ou no fim.',
                                     en: 'Name cannot start or end with spaces.' },
    'valid.name.exists':           { pt: 'já existe. Que tal',                     en: 'already exists. How about' },
    'valid.email.empty':           { pt: 'O e-mail não pode ser vazio.',           en: 'Email cannot be empty.' },
    'valid.email.invalid':         { pt: 'Formato de e-mail inválido.',            en: 'Invalid email format.' },
    'valid.name.notfound':         { pt: 'não encontrado. Quer criar um personagem?',
                                     en: 'not found. Want to create a character?' },

    /* ---- profile menu toasts ---- */
    'toast.welcome':               { pt: 'Personagem criado.',                     en: 'Character created.' },
    'toast.welcome.back':          { pt: 'Bem-vindo de volta',                     en: 'Welcome back' },
    'toast.logout':                { pt: 'Sessão encerrada. Até logo, comandante!', en: 'Session ended. See you, commander!' },
    'toast.photo.ok':              { pt: 'Foto atualizada!',                       en: 'Photo updated!' },
    'toast.photo.removed':         { pt: 'Foto removida.',                         en: 'Photo removed.' },
    'toast.photo.error':           { pt: 'Não foi possível carregar a imagem.',    en: 'Could not load the image.' },
    'toast.photo.format':          { pt: 'Formato não aceito. Use JPG, PNG ou WebP.', en: 'Unsupported format. Use JPG, PNG or WebP.' },
    'toast.photo.size':            { pt: 'Arquivo muito grande. Máximo: 2 MB.',    en: 'File too large. Max: 2 MB.' },
    'toast.google.halfway':        { pt: 'Quase lá! Escolha um nome de personagem.', en: 'Almost there! Choose a character name.' },
    'toast.google.back':           { pt: 'Bem-vindo de volta.',                    en: 'Welcome back.' },
    'toast.google.error':          { pt: 'Erro ao entrar com Google.',             en: 'Error signing in with Google.' },

    /* ---- dest labels ---- */
    'dest.terra':                  { pt: 'Terra',                                  en: 'Earth' },
    'dest.lua':                    { pt: 'Lua',                                    en: 'Moon' },
    'dest.marte':                  { pt: 'Marte',                                  en: 'Mars' },
    'dest.terra.article':          { pt: 'a Terra',                               en: 'Earth' },
    'dest.lua.article':            { pt: 'a Lua',                                 en: 'the Moon' },
    'dest.marte.article':          { pt: 'Marte',                                 en: 'Mars' },
  };

  /* ── estado ─────────────────────────────────────────────────────── */
  // A página abre sempre em inglês. PT só entra se a pessoa clicar no botão.
  let _lang = 'en';

  /* ── API ────────────────────────────────────────────────────────── */
  function t(key) {
    const entry = dict[key];
    if (!entry) { console.warn('[i18n] missing key:', key); return key; }
    return entry[_lang] || entry['pt'] || key;
  }

  function setLang(lang) {
    if (lang !== 'pt' && lang !== 'en') return;
    _lang = lang;
    try { localStorage.removeItem('atlas:lang'); localStorage.removeItem('atlas:lang-chosen'); } catch { /* ignora */ }
    _apply();
    // Notifica o jogo para re-renderizar
    if (window._onLangChange) window._onLangChange(lang);
  }

  /* ── aplica data-i18n no HTML estático ─────────────────────────── */
  function _apply() {
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.dataset.i18n;
      const entry = dict[key];
      if (!entry) return;
      const val = entry[_lang] || entry['pt'];
      if (el.dataset.i18nAttr) {
        el.setAttribute(el.dataset.i18nAttr, val);
      } else if (el.dataset.i18nHtml) {
        el.innerHTML = val;
      } else {
        el.textContent = val;
      }
    });
    // Atualiza lang no <html>
    document.documentElement.lang = _lang === 'pt' ? 'pt-BR' : 'en';
    // Atualiza botão e garante o clique
    const label = _lang === 'pt' ? 'PT' : 'EN';
    const aria = _lang === 'pt' ? 'Idioma português. Clique para inglês.' : 'English. Click to switch to Portuguese.';
    document.querySelectorAll('[data-lang-toggle]').forEach((btn) => {
      btn.type = 'button';
      btn.textContent = label;
      btn.setAttribute('aria-label', aria);
      if (!btn.dataset.boundLang) {
        btn.dataset.boundLang = '1';
        btn.addEventListener('click', () => setLang(_lang === 'pt' ? 'en' : 'pt'));
      }
    });
  }

  /* ── executa ao carregar ────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', _apply);
  // fallback: se DOM já carregado
  if (document.readyState !== 'loading') _apply();

  return { t, setLang, get lang() { return _lang; } };
})();
