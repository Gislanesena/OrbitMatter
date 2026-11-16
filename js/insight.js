/*
 * InSight na superfície de Marte. A identidade vem de dados-objetos.js.
 * A ficha visível vem do i18n.js, para inglês e português.
 * Não entra na caça lunar: o capítulo 2 só usa artefatos com body "lua".
 */
(function () {
  function ficha() {
    return (window.DADOS_OBJETOS && window.DADOS_OBJETOS.insight) || null;
  }

  function incluir(OBJECTS) {
    if (!OBJECTS || OBJECTS.some((o) => o.id === 'insight')) return;
    const dados = ficha();
    if (!dados) return;
    OBJECTS.push({
      id: 'insight',
      type: 'artefato',
      body: 'marte',
      surface: true,
      name: dados.nome || 'InSight',
      lat: dados.latitude,
      lon: dados.longitude,
      data: {},
      _analise: {},
    });
  }

  function textos(OBJECTS) {
    const o = OBJECTS && OBJECTS.find((item) => item.id === 'insight');
    const t = window.I18n && window.I18n.t;
    if (!o || !t) return;
    o.data = {
      origem: t('insight.origem'),
      altitude: t('insight.altitude'),
      velocidade: t('insight.velocidade'),
      permanencia: t('insight.permanencia'),
      riscos: t('insight.riscos'),
      destinos: t('insight.destinos'),
    };
    o._analise = {
      origem: t('insight.analise.origem'),
      permanencia: t('insight.analise.permanencia'),
      riscos: t('insight.analise.riscos'),
    };
  }

  window.Insight = { incluir, textos };
})();
