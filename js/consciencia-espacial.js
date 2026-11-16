/*
 * Consciência Espacial — cinco eixos (arqueologia, sustentabilidade,
 * Kessler, legado, responsabilidade). Os textos ficam no i18n.js.
 * O tema escolhido e o texto aberto entram no objeto de progresso (S)
 * e seguem o save() da página: conta logada via auth-progresso.js,
 * visitante no mesmo fallback legado.
 */
(function () {
  const TEMAS = ['arqueologia', 'sustentabilidade', 'kessler', 'legado', 'responsabilidade'];
  const PACOTES = ['detrito', 'estagio', 'inativo', 'insight', 'voyager', 'lunar', 'beresheet', 'schiaparelli', 'lua', 'marte', 'terra'];
  const DOBRAR_EM = 280;
  let api = null;
  let chaveAnterior = '';

  function temaValido(id) {
    return TEMAS.indexOf(id) >= 0 ? id : 'arqueologia';
  }

  function pacoteDe(chave) {
    return PACOTES.indexOf(chave) >= 0 ? chave : 'terra';
  }

  function render() {
    const nota = document.getElementById('expertNote');
    if (!nota || !api) return;
    const foco = api.foco();
    const est = api.estado();
    const chave = pacoteDe(foco.key);
    if (chave !== chaveAnterior) {
      chaveAnterior = chave;
      if (est.aberto) est.aberto = false;
    }
    const tema = temaValido(est.tema);
    est.tema = tema;
    const t = api.tt;
    const a = t('aware.' + chave + '.' + tema + '.0');
    const b = t('aware.' + chave + '.' + tema + '.1');
    const cheio = a + ' ' + b;
    const dobra = cheio.length >= DOBRAR_EM;
    if (!dobra) est.aberto = false;
    const icone = t('aware.theme.' + tema + '.icon');
    const rotulo = t('aware.theme.' + tema);
    nota.innerHTML =
      '<div class="expert-head"><span class="expert-badge" aria-hidden="true">' + icone + '</span><div><span class="eyebrow">' + api.esc(t('aware.eyebrow')) + '</span><h3>' + api.esc(foco.title) + '</h3></div></div>' +
      '<span class="aware-taxon">' + api.esc(t('aware.taxon.' + chave)) + '</span>' +
      '<div class="aware-themes" role="group" aria-label="' + api.esc(t('aware.themes')) + '">' +
        TEMAS.map((id) => '<button type="button" data-aware="' + id + '" aria-pressed="' + (id === tema) + '">' + t('aware.theme.' + id + '.icon') + ' ' + api.esc(t('aware.theme.' + id)) + '</button>').join('') +
      '</div>' +
      '<p>' + api.esc(a) + '</p>' +
      ((!dobra || est.aberto) && b ? '<p id="awareMore">' + api.esc(b) + '</p>' : '') +
      (dobra ? '<button type="button" id="awareMoreBtn" aria-expanded="' + est.aberto + '">' + api.esc(est.aberto ? t('aware.less') : t('aware.more')) + '</button>' : '');
    nota.setAttribute('aria-label', t('aware.eyebrow') + ' · ' + rotulo);
  }

  function place() {
    const nota = document.getElementById('expertNote');
    const card = document.getElementById('missionCard');
    if (!nota || !card) return;
    if (card.hidden) { nota.hidden = true; return; }
    const r = card.getBoundingClientRect();
    let limite = window.innerHeight - 12;
    ['.navbar', '.dock'].forEach((sel) => {
      const el = document.querySelector(sel);
      if (el && el.getClientRects().length) limite = Math.min(limite, el.getBoundingClientRect().top - 12);
    });
    const topo = r.bottom + 12;
    const espaco = limite - topo;
    if (espaco < 72) { nota.hidden = true; return; }
    nota.hidden = false;
    nota.style.top = Math.round(topo) + 'px';
    nota.style.maxHeight = Math.round(espaco) + 'px';
  }

  function atualizar() {
    render();
    place();
  }

  function clique(btn) {
    if (!api || !btn) return false;
    if (btn.dataset && btn.dataset.aware) {
      const est = api.estado();
      est.tema = temaValido(btn.dataset.aware);
      est.aberto = false;
      api.gravar();
      atualizar();
      return true;
    }
    if (btn.id === 'awareMoreBtn') {
      const est = api.estado();
      est.aberto = !est.aberto;
      api.gravar();
      atualizar();
      return true;
    }
    return false;
  }

  function registrar(entrada) {
    api = entrada;
    window.addEventListener('resize', place);
  }

  window.Consciencia = { registrar, render: atualizar, place, clique };
})();
