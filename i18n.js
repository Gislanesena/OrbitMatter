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
    'hint':                        { pt: 'Arraste para girar · role para aproximar · clique em um objeto para investigar',
                                     en: 'Drag to rotate · scroll to zoom · click an object to investigate' },

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

    /* ---- atlas drawer ---- */
    'atlas.title':                 { pt: 'Atlas orbital',                          en: 'Orbital atlas' },
    'atlas.investigated':          { pt: 'investigados',                           en: 'investigated' },
    'atlas.none':                  { pt: 'Nenhum objeto deste tipo aqui.',         en: 'No objects of this type here.' },
    'atlas.filter.all':            { pt: 'Todos',                                  en: 'All' },
    'atlas.type.fragment':         { pt: 'Fragmentos',                             en: 'Fragments' },
    'atlas.type.satellite':        { pt: 'Satélites',                              en: 'Satellites' },
    'atlas.type.stage':            { pt: 'Estágios',                               en: 'Stages' },
    'atlas.status.analyzed':       { pt: 'Analisado',                              en: 'Analyzed' },
    'atlas.status.investigated':   { pt: 'Investigado',                            en: 'Investigated' },
    'atlas.status.target':         { pt: 'Alvo',                                   en: 'Target' },
    'atlas.status.new':            { pt: 'Novo',                                   en: 'New' },

    /* ---- object panel ---- */
    'obj.band.low':                { pt: 'Órbita baixa',                           en: 'Low orbit' },
    'obj.band.mid':                { pt: 'Órbita média',                           en: 'Medium orbit' },
    'obj.band.high':               { pt: 'Órbita alta',                            en: 'High orbit' },
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
    'mission.m1.briefing':         { pt: 'Briefing da missão (a definir): um estágio de foguete abandonado cruza a rota de uma missão planejada.',
                                     en: 'Mission briefing (to be defined): an abandoned rocket stage crosses the path of a planned mission.' },
    'mission.m1.explain':          { pt: 'Explicação científica (a definir): por que estágios de foguete são grandes fontes de risco e quais estratégias funcionam melhor para eles.',
                                     en: 'Scientific explanation (to be defined): why rocket stages are major risk sources and which strategies work best for them.' },
    'mission.m2.title':            { pt: 'Satélite silencioso',                    en: 'Silent satellite' },
    'mission.m2.briefing':         { pt: 'Briefing da missão (a definir): um satélite inativo perdeu o controle e se aproxima de uma constelação ativa.',
                                     en: 'Mission briefing (to be defined): an inactive satellite lost control and is approaching an active constellation.' },
    'mission.m2.explain':          { pt: 'Explicação científica (a definir): o que acontece com satélites no fim da vida útil e como planejar a desorbitação.',
                                     en: 'Scientific explanation (to be defined): what happens to satellites at end of life and how to plan deorbiting.' },
    'mission.m3.title':            { pt: 'Nuvem de fragmentos',                    en: 'Fragment cloud' },
    'mission.m3.briefing':         { pt: 'Briefing da missão (a definir): uma nuvem de fragmentos se espalha por uma faixa de órbita muito usada.',
                                     en: 'Mission briefing (to be defined): a fragment cloud spreads across a heavily used orbital band.' },
    'mission.m3.explain':          { pt: 'Explicação científica (a definir): por que fragmentos pequenos são difíceis de rastrear e como eles alimentam a síndrome de Kessler.',
                                     en: 'Scientific explanation (to be defined): why small fragments are hard to track and how they feed Kessler syndrome.' },

    /* ---- intro modal ---- */
    'intro.eyebrow':               { pt: 'Etapa 1 · Descoberta',                   en: 'Stage 1 · Discovery' },
    'intro.title':                 { pt: 'A órbita da Terra está ficando lotada.', en: 'Earth\'s orbit is getting crowded.' },
    'intro.body':                  { pt: 'Você é um agente de tráfego orbital. Explore a Terra, a Lua e Marte na ordem que quiser, investigue objetos abandonados e decida como reduzir os riscos para as próximas missões. O caminho é seu: cada objeto que você visita entra no seu diário de bordo.',
                                     en: 'You are an orbital traffic agent. Explore Earth, the Moon, and Mars in any order, investigate abandoned objects, and decide how to reduce risks for upcoming missions. The path is yours: every object you visit goes into your mission log.' },
    'intro.journey.aria':          { pt: 'Como funciona a jornada',                en: 'How the journey works' },
    'intro.j1':                    { pt: 'Descoberta',                             en: 'Discovery' },
    'intro.j1.sub':                { pt: 'Você recebe uma missão.',                en: 'You receive a mission.' },
    'intro.j2':                    { pt: 'Investigação',                           en: 'Investigation' },
    'intro.j2.sub':                { pt: 'Clique em fragmentos, satélites e estágios.', en: 'Click fragments, satellites and stages.' },
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
    'missions.lead.hint':          { pt: 'Agir cedo gasta menos combustível, mas deixa menos tempo para estudar o objeto.',
                                     en: 'Acting early uses less fuel, but leaves less time to study the object.' },
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
    'kessler.desc':                { pt: 'Cada colisão gera dezenas de fragmentos. Mais fragmentos aumentam a chance de novas colisões, e o ciclo pode se alimentar sozinho. Ajuste os lançamentos e a remoção ativa e veja se a órbita se estabiliza ou entra em cascata.',
                                     en: 'Each collision generates dozens of fragments. More fragments increase the chance of new collisions, and the cycle can feed itself. Adjust launches and active removal to see if the orbit stabilizes or cascades.' },
    'kessler.total':               { pt: 'Objetos em órbita',                      en: 'Objects in orbit' },
    'kessler.fragments':           { pt: 'Fragmentos',                             en: 'Fragments' },
    'kessler.collisions':          { pt: 'Colisões',                               en: 'Collisions' },
    'kessler.cycles':              { pt: 'Ciclos simulados',                       en: 'Simulated cycles' },
    'kessler.total.legend':        { pt: 'Total',                                  en: 'Total' },
    'kessler.launch.label':        { pt: 'Lançamentos por ciclo',                  en: 'Launches per cycle' },
    'kessler.remove.label':        { pt: 'Remoção ativa por ciclo',                en: 'Active removal per cycle' },
    'kessler.speed.label':         { pt: 'Velocidade',                             en: 'Speed' },
    'kessler.start':               { pt: 'Iniciar',                                en: 'Start' },
    'kessler.pause':               { pt: 'Pausar',                                 en: 'Pause' },
    'kessler.continue':            { pt: 'Continuar',                              en: 'Continue' },
    'kessler.trigger':             { pt: 'Provocar colisão',                       en: 'Trigger collision' },
    'kessler.reset':               { pt: 'Reiniciar',                              en: 'Reset' },
    'kessler.note':                { pt: 'Modelo simplificado e fictício, feito para mostrar a relação de causa e consequência. Os números ainda serão calibrados com dados reais.',
                                     en: 'Simplified fictional model, designed to show the cause-and-effect relationship. Numbers will be calibrated with real data.' },
    'kessler.risk.low':            { pt: 'Risco baixo',                            en: 'Low risk' },
    'kessler.risk.mid':            { pt: 'Risco moderado',                         en: 'Moderate risk' },
    'kessler.risk.high':           { pt: 'Risco alto',                             en: 'High risk' },
    'kessler.risk.critical':       { pt: 'Cascata iminente',                       en: 'Cascade imminent' },

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
  let _lang = (() => {
    try {
      const saved = localStorage.getItem('atlas:lang');
      const chosen = localStorage.getItem('atlas:lang-chosen') === '1';
      if (chosen && (saved === 'en' || saved === 'pt')) return saved;
      return 'en';
    } catch { return 'en'; }
  })();

  /* ── API ────────────────────────────────────────────────────────── */
  function t(key) {
    const entry = dict[key];
    if (!entry) { console.warn('[i18n] missing key:', key); return key; }
    return entry[_lang] || entry['pt'] || key;
  }

  function setLang(lang) {
    if (lang !== 'pt' && lang !== 'en') return;
    _lang = lang;
    try {
      localStorage.setItem('atlas:lang', lang);
      localStorage.setItem('atlas:lang-chosen', '1');
    } catch { /* ignora */ }
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
    const label = _lang === 'pt' ? 'EN' : 'PT';
    const aria = _lang === 'pt' ? 'Switch to English' : 'Mudar para português';
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
