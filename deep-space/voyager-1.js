/**
 * Deep Space Tracker — Voyager 1.
 *
 * A ficha histórica vem de páginas da NASA citadas em FONTES.
 * A distância vem da efeméride calculada pelo Horizons (JPL), não de
 * telemetria da Deep Space Network. Se a consulta falha, a tela usa
 * o último pacote válido: primeiro o localStorage, depois o retrato
 * gravado em SNAPSHOT na data em que esta cópia foi conferida.
 */
(function () {
  'use strict';

  const AU_KM = 149597870.7;
  const CACHE_KEY = 'atlas:voyager1:horizons:v1';
  const CACHE_MS = 6 * 60 * 60 * 1000;
  const HORIZONS = 'https://ssd.jpl.nasa.gov/api/horizons.api';

  /** Última resposta conferida à mão em 14 nov 2026, 15:36 (Pasadena). */
  const SNAPSHOT = {
    fetchedAt: '2026-11-14T23:36:03Z',
    signature: 'NASA/JPL Horizons API 1.2',
    kernel: 'Voyager_1_ST+refit2022_m',
    auKm: AU_KM,
    earth: { epoch: '2026-Nov-14 00:00 UT', deltaAu: 173.067682711039, deldotKmS: 27.1464777 },
    sun: { epoch: '2026-Nov-14 00:00 UT', deltaAu: 172.336397702297, deldotKmS: 16.8815988 },
  };

  const COPY = {
    en: {
      eyebrow: 'Deep Space Tracker',
      title: 'Voyager 1',
      close: 'Close',
      far: 'Voyager 1 is in interstellar space. It is not drawn on the Earth, Moon, or Mars map, because those bodies would have to shrink to a point for the probe to fit on the same scale.',
      intro: 'NASA launched Voyager 1 on 5 September 1977 to fly by Jupiter and Saturn and then keep measuring the space it travels through. On 25 August 2012 it became the first spacecraft to leave the heliosphere and sample interstellar space. It is still the most distant human-made object.',
      facts: 'General',
      name: 'Name',
      agency: 'Agency',
      launch: 'Launch',
      mission: 'Mission',
      where: 'Location',
      status: 'Operational status',
      nameV: 'Voyager 1',
      agencyV: 'NASA / Jet Propulsion Laboratory',
      launchV: '5 September 1977, 12:56:01 UT · Titan IIIE-Centaur · Cape Canaveral LC-41',
      missionV: 'Fly by Jupiter and Saturn, then measure interstellar space',
      whereV: 'Interstellar space, outside the heliosphere',
      statusV: 'As of 17 April 2026, NASA reports two science instruments still on: the magnetometer (MAG) and the plasma wave subsystem (PWS). The low-energy charged particle instrument was turned off that day to save power. This is a published status, not a live telemetry feed.',
      timeline: 'Timeline',
      timelineHelp: 'These buttons reveal Voyager 1’s historical milestones. Pick one to read what the probe did.',
      jpl: 'JPL is the Jet Propulsion Laboratory, the NASA lab in California that operates Voyager 1 and other planetary missions.',
      pick: 'Choose an event.',
      found: 'Scientific findings',
      track: 'Calculated position',
      loading: 'Asking Horizons… The numbers below stay on the stored ephemeris until the reply arrives.',
      live: 'Calculated ephemeris, just retrieved from Horizons. This is not Deep Space Network telemetry.',
      stored: 'Stored ephemeris from the last successful Horizons query in this browser. A new query runs at most every six hours.',
      cache: 'Horizons did not answer. Showing the last valid ephemeris stored in this browser.',
      snapshot: 'Horizons did not answer. Showing the last valid ephemeris stored with this page.',
      earthAu: 'Distance from Earth',
      earthKm: 'Same distance in kilometers',
      sunAu: 'Distance from the Sun',
      rateEarth: 'Range-rate from Earth',
      rateSun: 'Range-rate from the Sun',
      epoch: 'Reference epoch',
      kernel: 'Ephemeris source',
      kmNote: 'Kilometers are the Horizons range in AU multiplied by the AU printed in that response (149,597,870.7 km), then rounded to the nearest kilometer.',
      scheme: 'Conceptual illustration, logarithmic distance from the Sun. Earth sits at 1 AU by definition of the unit. The other planets are omitted so the drawing is not mistaken for a map. The moving mark shows the direction of the journey, not the probe’s real-time motion.',
      interstellar: 'Interstellar space',
      sun: 'Sun',
      earth: 'Earth · 1 AU',
      sources: 'Official sources',
      imageAlt: 'NASA artist’s concept of a Voyager spacecraft',
      imageCap: 'Artist’s concept of a Voyager spacecraft. NASA/JPL-Caltech, PIA14111. Not a photograph of the probe in flight.',
      recordCap: 'The Voyager 1 Golden Record being prepared in 1977. NASA/JPL-Caltech, PIA21741.',
      imageFail: 'The official image could not be loaded. The catalog link is still listed under sources.',
      milestone: 'NASA states that Voyager 1 will reach one light-day from Earth — 16.094 billion miles (25.902 billion kilometers) — on 18 November 2026 at 2:16:07 a.m. PST. That figure is a published milestone, separate from the Horizons range shown here.',
      au: 'AU',
      kms: 'km/s',
      away: 'receding',
    },
    pt: {
      eyebrow: 'Deep Space Tracker',
      title: 'Voyager 1',
      close: 'Fechar',
      far: 'A Voyager 1 está no espaço interestelar. Ela não entra no mapa da Terra, da Lua e de Marte, porque esses corpos teriam de virar um ponto para a sonda caber na mesma escala.',
      intro: 'A NASA lançou a Voyager 1 em 5 de setembro de 1977 para passar por Júpiter e Saturno e seguir medindo o espaço que atravessa. Em 25 de agosto de 2012 tornou-se a primeira espaçonave a sair da heliosfera e a medir o espaço interestelar. Continua a ser o objeto feito por humanos mais distante.',
      facts: 'Informações gerais',
      name: 'Nome',
      agency: 'Agência',
      launch: 'Lançamento',
      mission: 'Missão',
      where: 'Localização',
      status: 'Situação operacional',
      nameV: 'Voyager 1',
      agencyV: 'NASA / Jet Propulsion Laboratory',
      launchV: '5 de setembro de 1977, 12:56:01 UT · Titan IIIE-Centaur · Cabo Canaveral LC-41',
      missionV: 'Sobrevoar Júpiter e Saturno e depois medir o espaço interestelar',
      whereV: 'Espaço interestelar, fora da heliosfera',
      statusV: 'Em 17 de abril de 2026, a NASA informa dois instrumentos científicos ainda ligados: o magnetômetro (MAG) e o subsistema de ondas de plasma (PWS). O detector de partículas de baixa energia foi desligado nesse dia para poupar energia. Este é um boletim publicado, não uma telemetria ao vivo.',
      timeline: 'Linha do tempo',
      timelineHelp: 'Estes botões revelam os marcos históricos da Voyager 1. Escolha um para ler o que a sonda fez.',
      jpl: 'JPL é o Jet Propulsion Laboratory, o laboratório da NASA, na Califórnia, que opera a Voyager 1 e outras sondas planetárias.',
      pick: 'Escolha um acontecimento.',
      found: 'Descobertas científicas',
      track: 'Posição calculada',
      loading: 'Consultando o Horizons… Os números abaixo ficam na efeméride guardada até a resposta chegar.',
      live: 'Efeméride calculada, recebida agora do Horizons. Não é telemetria da Deep Space Network.',
      stored: 'Efeméride guardada da última consulta bem-sucedida ao Horizons neste navegador. Uma consulta nova ocorre no máximo a cada seis horas.',
      cache: 'O Horizons não respondeu. Mostrando a última efeméride válida guardada neste navegador.',
      snapshot: 'O Horizons não respondeu. Mostrando a última efeméride válida gravada com esta página.',
      earthAu: 'Distância à Terra',
      earthKm: 'A mesma distância em quilômetros',
      sunAu: 'Distância ao Sol',
      rateEarth: 'Taxa de variação da distância à Terra',
      rateSun: 'Taxa de variação da distância ao Sol',
      epoch: 'Época de referência',
      kernel: 'Fonte da efeméride',
      kmNote: 'Os quilômetros são o alcance em UA do Horizons multiplicado pela UA impressa nessa resposta (149 597 870,7 km) e arredondados ao quilômetro mais próximo.',
      scheme: 'Ilustração conceitual, distância ao Sol em escala logarítmica. A Terra fica a 1 UA pela definição da unidade. Os outros planetas ficam de fora para o desenho não ser lido como um mapa. A marca que se move indica a direção da viagem, não o movimento em tempo real da sonda.',
      interstellar: 'Espaço interestelar',
      sun: 'Sol',
      earth: 'Terra · 1 UA',
      sources: 'Fontes oficiais',
      imageAlt: 'Conceito artístico da NASA de uma espaçonave Voyager',
      imageCap: 'Conceito artístico de uma espaçonave Voyager. NASA/JPL-Caltech, PIA14111. Não é uma fotografia da sonda em voo.',
      recordCap: 'O Disco de Ouro da Voyager 1 sendo preparado em 1977. NASA/JPL-Caltech, PIA21741.',
      imageFail: 'A imagem oficial não carregou. O link do catálogo continua na lista de fontes.',
      milestone: 'A NASA informa que a Voyager 1 chegará a um dia-luz da Terra — 16,094 bilhões de milhas (25,902 bilhões de quilômetros) — em 18 de novembro de 2026, às 2:16:07 da manhã (PST). Esse número é um marco publicado, separado do alcance do Horizons mostrado aqui.',
      au: 'UA',
      kms: 'km/s',
      away: 'afastando-se',
    },
  };

  const EVENTS = [
    {
      id: 'launch',
      when: { en: '1977', pt: '1977' },
      title: { en: 'Launch', pt: 'Lançamento' },
      text: {
        en: 'Voyager 1 lifted off on 5 September 1977 at 12:56:01 UT on a Titan IIIE-Centaur from Cape Canaveral Launch Complex 41. NASA records the spacecraft mass as 721.9 kg. It launched after Voyager 2, on a faster path.',
        pt: 'A Voyager 1 partiu em 5 de setembro de 1977, às 12:56:01 UT, num Titan IIIE-Centaur, do Complexo de Lançamento 41 do Cabo Canaveral. A NASA registra a massa da espaçonave como 721,9 kg. Partiu depois da Voyager 2, numa trajetória mais rápida.',
      },
    },
    {
      id: 'jupiter',
      when: { en: '1979', pt: '1979' },
      title: { en: 'Jupiter flyby', pt: 'Sobrevoo de Júpiter' },
      text: {
        en: 'Closest approach was at 12:05 UT on 5 March 1979, at 174,000 miles (280,000 km). Voyager 1 found a thin ring around Jupiter and two moons, Thebe and Metis. NASA reports about 18,000 images of Jupiter and its satellites.',
        pt: 'A maior aproximação foi às 12:05 UT de 5 de março de 1979, a 174 mil milhas (280 mil km). A Voyager 1 encontrou um anel fino em Júpiter e duas luas, Tebe e Métis. A NASA relata cerca de 18 mil imagens de Júpiter e dos satélites.',
      },
    },
    {
      id: 'saturn',
      when: { en: '1980', pt: '1980' },
      title: { en: 'Saturn flyby', pt: 'Sobrevoo de Saturno' },
      text: {
        en: 'Closest approach was at 23:46 UT on 12 November 1980, at about 78,000 miles (126,000 km). Voyager 1 found five moons and the G ring, and measured Titan’s atmosphere as about 90 percent nitrogen. The Titan flyby sent the probe north of the ecliptic, so it did not go on to Uranus or Neptune.',
        pt: 'A maior aproximação foi às 23:46 UT de 12 de novembro de 1980, a cerca de 78 mil milhas (126 mil km). A Voyager 1 encontrou cinco luas e o anel G, e mediu a atmosfera de Titã como cerca de 90 por cento de nitrogênio. O sobrevoo de Titã levou a sonda para o norte da eclíptica, por isso ela não seguiu para Urano nem Netuno.',
      },
    },
    {
      id: 'interstellar',
      when: { en: '2012', pt: '2012' },
      title: { en: 'Interstellar space', pt: 'Espaço interestelar' },
      text: {
        en: 'On 25 August 2012 Voyager 1 crossed the heliopause and became the first spacecraft to measure interstellar space. It had reached the termination shock on 16 December 2004. The cameras had already been turned off on 14 February 1990, after the Solar System family portrait taken at 40 AU from the Sun.',
        pt: 'Em 25 de agosto de 2012 a Voyager 1 cruzou a heliopausa e tornou-se a primeira espaçonave a medir o espaço interestelar. Tinha chegado ao termination shock em 16 de dezembro de 2004. As câmeras já tinham sido desligadas em 14 de fevereiro de 1990, depois do retrato de família do Sistema Solar feito a 40 UA do Sol.',
      },
    },
    {
      id: 'now',
      when: { en: '2026', pt: '2026' },
      title: { en: 'Still traveling', pt: 'Ainda em viagem' },
      text: {
        en: 'On 17 April 2026 JPL turned off the low-energy charged particle instrument to save power. The magnetometer and the plasma wave subsystem remained on, and NASA said the spacecraft was still returning data from interstellar space. A one-light-day distance from Earth is a separate milestone NASA scheduled for 18 November 2026; this page does not treat that date as already reached.',
        pt: 'Em 17 de abril de 2026 o JPL desligou o instrumento de partículas de baixa energia para poupar energia. O magnetômetro e o subsistema de ondas de plasma continuaram ligados, e a NASA informou que a espaçonave ainda enviava dados do espaço interestelar. A distância de um dia-luz da Terra é outro marco, marcado pela NASA para 18 de novembro de 2026; esta página não trata essa data como já alcançada.',
      },
    },
  ];

  const FINDINGS = [
    {
      en: 'A thin ring around Jupiter, and the moons Thebe and Metis.',
      pt: 'Um anel fino em Júpiter e as luas Tebe e Métis.',
    },
    {
      en: 'Five moons at Saturn, the G ring, and a Titan atmosphere of about 90 percent nitrogen.',
      pt: 'Cinco luas em Saturno, o anel G e uma atmosfera de Titã com cerca de 90 por cento de nitrogênio.',
    },
    {
      en: 'The first direct measurements from beyond the heliopause, beginning 25 August 2012.',
      pt: 'As primeiras medidas diretas além da heliopausa, a partir de 25 de agosto de 2012.',
    },
    {
      en: 'Each Voyager carries a 30 cm gold-plated copper disc — the Golden Record — with greetings in 55 languages, Earth sounds, music, and 115 images.',
      pt: 'Cada Voyager leva um disco de cobre banhado a ouro, de 30 cm — o Disco de Ouro — com saudações em 55 línguas, sons da Terra, música e 115 imagens.',
    },
  ];

  const SOURCES = [
    { href: 'https://science.nasa.gov/mission/voyager/voyager-1/', en: 'NASA Science — Voyager 1', pt: 'NASA Science — Voyager 1' },
    { href: 'https://science.nasa.gov/mission/voyager/where-are-voyager-1-and-voyager-2-now/', en: 'NASA Science — instrument status, updated 17 April 2026', pt: 'NASA Science — estado dos instrumentos, atualizado em 17 de abril de 2026' },
    { href: 'https://www.jpl.nasa.gov/news/nasa-shuts-off-instrument-on-voyager-1-to-keep-spacecraft-operating/', en: 'NASA JPL — LECP turned off, 17 April 2026', pt: 'NASA JPL — LECP desligado, 17 de abril de 2026' },
    { href: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1977-084A', en: 'NASA NSSDCA — Voyager 1, 1977-084A', pt: 'NASA NSSDCA — Voyager 1, 1977-084A' },
    { href: 'https://photojournal.jpl.nasa.gov/catalog/PIA14111', en: 'NASA Photojournal — PIA14111, artist’s concept', pt: 'NASA Photojournal — PIA14111, conceito artístico' },
    { href: 'https://photojournal.jpl.nasa.gov/catalog/PIA21741', en: 'NASA Photojournal — PIA21741, Golden Record', pt: 'NASA Photojournal — PIA21741, Disco de Ouro' },
    { href: 'https://ssd.jpl.nasa.gov/api/horizons.api', en: 'NASA JPL Horizons API — calculated ephemeris, target -31', pt: 'API Horizons do NASA JPL — efeméride calculada, alvo -31' },
  ];

  const IMG_CONCEPT = 'https://images-assets.nasa.gov/image/PIA14111/PIA14111~orig.jpg';
  const IMG_RECORD = 'https://images-assets.nasa.gov/image/PIA21741/PIA21741~small.jpg';

  let last = null;
  let selected = 'launch';
  let req = 0;

  function lang() {
    return window.I18n && I18n.lang === 'pt' ? 'pt' : 'en';
  }
  function t(key) { return COPY[lang()][key]; }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function locale() { return lang() === 'pt' ? 'pt-BR' : 'en-GB'; }
  function fmtAu(n) {
    return new Intl.NumberFormat(locale(), { minimumFractionDigits: 6, maximumFractionDigits: 6 }).format(n) + ' ' + t('au');
  }
  function fmtKm(au) {
    const km = Math.round(au * AU_KM);
    return new Intl.NumberFormat(locale(), { maximumFractionDigits: 0 }).format(km) + ' km';
  }
  function fmtRate(n) {
    const sign = n > 0 ? '+' : '';
    return sign + new Intl.NumberFormat(locale(), { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(n) + ' ' + t('kms');
  }

  function utcDay(d) {
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return y + '-' + m + '-' + day;
  }
  function nextUtcDay(day) {
    const d = new Date(day + 'T00:00:00Z');
    d.setUTCDate(d.getUTCDate() + 1);
    return utcDay(d);
  }

  function parseBlock(text) {
    const soe = text.split('$$SOE')[1];
    if (!soe) throw new Error('horizons-sem-dados');
    const line = soe.split('$$EOE')[0].trim().split('\n').map((s) => s.trim()).filter(Boolean)[0];
    const m = line && line.match(/^(\d{4}-\w{3}-\d{2}\s+\d{2}:\d{2})\s+([0-9.]+)\s+([+-]?[0-9.]+)/);
    if (!m) throw new Error('horizons-linha');
    const kernel = (text.match(/\{source:\s*([^}]+)\}/) || [])[1] || '';
    return { epoch: m[1] + ' UT', deltaAu: Number(m[2]), deldotKmS: Number(m[3]), kernel: kernel.trim() };
  }

  async function query(center, start) {
    const stop = nextUtcDay(start);
    const url = HORIZONS
      + "?format=json&COMMAND='-31'&OBJ_DATA='NO'&MAKE_EPHEM='YES'&EPHEM_TYPE='OBSERVER'"
      + "&CENTER='" + center + "'&START_TIME='" + start + "'&STOP_TIME='" + stop + "'"
      + "&STEP_SIZE='1%20d'&QUANTITIES='20'";
    const res = await fetch(url);
    if (!res.ok) throw new Error('horizons-' + res.status);
    const json = await res.json();
    if (!json.result) throw new Error('horizons-vazio');
    const row = parseBlock(json.result);
    row.signature = json.signature && json.signature.source ? json.signature.source + ' ' + (json.signature.version || '') : 'NASA/JPL Horizons API';
    return row;
  }

  function readCache() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (!data || !data.earth || !data.sun || typeof data.earth.deltaAu !== 'number') return null;
      return data;
    } catch (e) { return null; }
  }
  function writeCache(data) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch (e) { /* armazenamento cheio ou bloqueado */ }
  }

  async function loadEphemeris() {
    const today = utcDay(new Date());
    const cached = readCache();
    if (cached && cached.epochDay === today && Date.now() - Date.parse(cached.fetchedAt) < CACHE_MS) {
      return Object.assign({}, cached, { origin: 'stored' });
    }
    try {
      const earth = await query('500@399', today);
      const sun = await query('500@10', today);
      const pack = {
        fetchedAt: new Date().toISOString(),
        epochDay: today,
        signature: earth.signature,
        kernel: earth.kernel || sun.kernel,
        auKm: AU_KM,
        earth: { epoch: earth.epoch, deltaAu: earth.deltaAu, deldotKmS: earth.deldotKmS },
        sun: { epoch: sun.epoch, deltaAu: sun.deltaAu, deldotKmS: sun.deldotKmS },
        origin: 'live',
      };
      writeCache(pack);
      return pack;
    } catch (err) {
      if (cached) return Object.assign({}, cached, { origin: 'cache', failed: true });
      return Object.assign({}, SNAPSHOT, { origin: 'snapshot', epochDay: '2026-11-14', failed: true });
    }
  }

  function markerX(au) {
    const min = Math.log10(0.3);
    const max = Math.log10(300);
    const x = (Math.log10(au) - min) / (max - min);
    return Math.round(36 + Math.min(1, Math.max(0, x)) * 568);
  }

  function trackSvg(data) {
    const earthX = markerX(1);
    const voyX = markerX(data.sun.deltaAu);
    const end = (voyX / 640 * 100).toFixed(2) + '%';
    return '<svg class="ds-svg" viewBox="0 0 640 168" role="img" aria-label="' + esc(t('scheme')) + '">'
      + '<line x1="36" y1="78" x2="604" y2="78" class="ds-axis"/>'
      + '<circle cx="36" cy="78" r="7" class="ds-sun"/>'
      + '<text x="36" y="108" text-anchor="middle" class="ds-label">' + esc(t('sun')) + '</text>'
      + '<circle cx="' + earthX + '" cy="78" r="4" class="ds-earth"/>'
      + '<text x="' + earthX + '" y="124" text-anchor="middle" class="ds-label">' + esc(t('earth')) + '</text>'
      + '<circle cx="' + voyX + '" cy="78" r="5" class="ds-voy"/>'
      + '<text x="' + Math.min(voyX, 560) + '" y="52" text-anchor="middle" class="ds-label">Voyager 1</text>'
      + '<text x="604" y="28" text-anchor="end" class="ds-tag">' + esc(t('interstellar')) + '</text>'
      + '</svg>'
      + '<div class="ds-ride" style="--ds-end:' + end + '" aria-hidden="true"><i></i></div>';
  }

  function render(data) {
    const body = document.getElementById('deepSpaceBody');
    if (!body) return;
    const c = COPY[lang()];
    const eyebrow = document.getElementById('dsEyebrow');
    if (eyebrow) eyebrow.textContent = c.eyebrow;
    const closeBtn = document.querySelector('#deepSpaceModal [data-close]');
    if (closeBtn) closeBtn.setAttribute('aria-label', c.close);
    const origin = data.origin || 'snapshot';
    const when = data.fetchedAt ? new Date(data.fetchedAt).toLocaleString(locale(), { timeZone: 'UTC', hour12: false }) + ' UTC' : data.earth.epoch;
    const facts = [
      [c.name, c.nameV],
      [c.agency, c.agencyV],
      [c.launch, c.launchV],
      [c.mission, c.missionV],
      [c.where, c.whereV],
      [c.status, c.statusV],
    ];
    const event = EVENTS.find((e) => e.id === selected) || EVENTS[0];
    body.innerHTML = ''
      + '<p class="ds-note">' + esc(c.far) + '</p>'
      + '<div class="ds-hero">'
      + '<figure class="ds-figure"><img src="' + IMG_CONCEPT + '" alt="' + esc(c.imageAlt) + '" id="dsImg"><figcaption id="dsCap">' + esc(c.imageCap) + '</figcaption></figure>'
      + '<div class="ds-intro"><p>' + esc(c.intro) + '</p>'
      + '<div class="section-title"><h3>' + esc(c.facts) + '</h3></div>'
      + '<dl class="facts">' + facts.map(([k, v]) => '<div class="fact"><dt>' + esc(k) + '</dt><dd>' + esc(v) + '</dd></div>').join('') + '</dl>'
      + '<p class="muted">' + esc(c.jpl) + '</p>'
      + '</div></div>'
      + '<section><div class="section-title"><h3>' + esc(c.timeline) + '</h3></div>'
      + '<p class="muted">' + esc(c.timelineHelp) + '</p>'
      + '<div class="ds-timeline" role="list">' + EVENTS.map((e) => '<button type="button" class="step ds-event' + (e.id === event.id ? ' on' : '') + '" data-ds-event="' + e.id + '" aria-pressed="' + (e.id === event.id) + '"><span class="s-l"><span class="num">' + esc(e.when[lang()]) + '</span>' + esc(e.title[lang()]) + '</span></button>').join('') + '</div>'
      + '<p class="reveal" id="dsEventText">' + esc(event.text[lang()]) + '</p></section>'
      + '<section><div class="section-title"><h3>' + esc(c.found) + '</h3></div><ul class="ds-found">' + FINDINGS.map((f) => '<li>' + esc(f[lang()]) + '</li>').join('') + '</ul>'
      + '<figure class="ds-record"><img src="' + IMG_RECORD + '" alt="' + esc(c.recordCap) + '"><figcaption>' + esc(c.recordCap) + '</figcaption></figure></section>'
      + '<section class="ds-tracker"><div class="section-title"><h3>' + esc(c.track) + '</h3><span class="eyebrow" id="dsOrigin">' + esc(c[origin] || c.snapshot) + '</span></div>'
      + '<p class="muted" id="dsMilestone">' + esc(c.milestone) + '</p>'
      + '<dl class="facts ds-meters">'
      + meter(c.earthAu, fmtAu(data.earth.deltaAu))
      + meter(c.earthKm, fmtKm(data.earth.deltaAu))
      + meter(c.sunAu, fmtAu(data.sun.deltaAu))
      + meter(c.rateEarth, fmtRate(data.earth.deldotKmS) + ' · ' + c.away)
      + meter(c.rateSun, fmtRate(data.sun.deldotKmS) + ' · ' + c.away)
      + meter(c.epoch, data.earth.epoch + ' · ' + when)
      + meter(c.kernel, (data.kernel || '') + ' · ' + (data.signature || ''))
      + '</dl>'
      + '<p class="k-note">' + esc(c.kmNote) + '</p>'
      + '<div class="ds-stage">' + trackSvg(data) + '</div>'
      + '<p class="k-note">' + esc(c.scheme) + '</p></section>'
      + '<section><div class="section-title"><h3>' + esc(c.sources) + '</h3></div><ul class="ds-sources">'
      + SOURCES.map((s) => '<li><a href="' + esc(s.href) + '" target="_blank" rel="noopener noreferrer">' + esc(s[lang()]) + '</a></li>').join('')
      + '</ul></section>';
    const img = document.getElementById('dsImg');
    if (img) img.addEventListener('error', () => {
      img.remove();
      const cap = document.getElementById('dsCap');
      if (cap) cap.textContent = c.imageFail;
    });
  }
  function meter(k, v) {
    return '<div class="fact"><dt>' + esc(k) + '</dt><dd class="mono">' + esc(v) + '</dd></div>';
  }

  function open() {
    const modal = document.getElementById('deepSpaceModal');
    if (!modal) return;
    modal.hidden = false;
    const mine = ++req;
    const seed = last || Object.assign({}, SNAPSHOT, { origin: 'loading', epochDay: '2026-11-14' });
    if (!last) seed.origin = 'loading';
    render(seed);
    const origin = document.getElementById('dsOrigin');
    if (origin && !last) origin.textContent = t('loading');
    loadEphemeris().then((data) => {
      if (mine !== req) return;
      last = data;
      if (!document.getElementById('deepSpaceModal').hidden) render(data);
    });
  }
  function refresh() {
    if (document.getElementById('deepSpaceModal').hidden) return;
    render(last || Object.assign({}, SNAPSHOT, { origin: 'snapshot', epochDay: '2026-11-14' }));
  }

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-ds-event]');
    if (!btn) return;
    selected = btn.getAttribute('data-ds-event');
    refresh();
  });

  window.DeepSpace = {
    open: open,
    refresh: refresh,
    snapshot: SNAPSHOT,
    parseBlock: parseBlock,
    auKm: AU_KM,
  };
})();
