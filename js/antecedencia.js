/*
 * Barra de antecedência desenhada. O valor continua na variável lead
 * da página. Há um único #leadRange, escondido, para não duplicar o id.
 */
(function () {
  function passo(v) {
    const n = Number(v);
    if (!isFinite(n)) return 5;
    return Math.round(Math.min(10, Math.max(1, n)) * 10) / 10;
  }
  function preenchimento(v) {
    return ((passo(v) - 1) / 9) * 100;
  }
  function texto(v) {
    const s = passo(v).toFixed(1);
    const lang = window.I18n && I18n.lang === 'pt';
    return (lang ? s.replace('.', ',') : s) + '/10';
  }
  function t(chave) {
    return window.I18n ? I18n.t(chave) : chave;
  }
  function marcar(valor) {
    const v = passo(valor);
    return '<div class="slider-row lead-row"><label id="leadLabel">' + t('missions.lead.label') + ' <b class="mono" id="leadValue">' + texto(v) + '</b></label>' +
      '<div class="lead-slider" id="leadSlider" role="slider" tabindex="0" aria-valuemin="1" aria-valuemax="10" aria-valuenow="' + v + '" aria-valuetext="' + texto(v) + '" aria-labelledby="leadLabel" aria-describedby="leadHelp" style="--fill:' + preenchimento(v) + '%"><div class="lead-track"></div><div class="lead-thumb"></div></div>' +
      '<input type="range" id="leadRange" class="lead-range" min="1" max="10" step="0.1" value="' + v + '" tabindex="-1" aria-hidden="true">' +
      '<div class="lead-scale"><span>' + t('missions.lead.now') + '</span><span>' + t('missions.lead.later') + '</span></div>' +
      '<span class="muted" id="leadHelp">' + t('missions.lead.drag') + '</span></div>';
  }
  function pintar(valor) {
    const slider = document.getElementById('leadSlider');
    if (!slider) return;
    const v = passo(valor);
    slider.style.setProperty('--fill', preenchimento(v) + '%');
    slider.setAttribute('aria-valuenow', String(v));
    slider.setAttribute('aria-valuetext', texto(v));
    const range = document.getElementById('leadRange');
    const label = document.getElementById('leadValue');
    if (range) range.value = String(v);
    if (label) label.textContent = texto(v);
  }
  function peloX(clientX) {
    const rect = document.getElementById('leadSlider').getBoundingClientRect();
    const margem = 14;
    const faixa = Math.max(1, rect.width - margem * 2);
    const x = Math.min(rect.right - margem, Math.max(rect.left + margem, clientX));
    return passo(1 + ((x - rect.left - margem) / faixa) * 9);
  }
  let arraste = false;
  let aoMudar = null;
  function ligar(quandoMudar) {
    aoMudar = quandoMudar;
    const slider = document.getElementById('leadSlider');
    if (!slider || slider.dataset.bound) return;
    slider.dataset.bound = '1';
    const mover = (e) => {
      if (!arraste) return;
      e.preventDefault();
      if (aoMudar) aoMudar(peloX(e.clientX));
    };
    const fim = () => {
      if (!arraste) return;
      arraste = false;
      window.removeEventListener('pointermove', mover);
      window.removeEventListener('pointerup', fim);
      window.removeEventListener('pointercancel', fim);
    };
    slider.addEventListener('pointerdown', (e) => {
      if (e.button != null && e.button !== 0) return;
      e.preventDefault();
      arraste = true;
      slider.focus({ preventScroll: true });
      if (aoMudar) aoMudar(peloX(e.clientX));
      window.addEventListener('pointermove', mover);
      window.addEventListener('pointerup', fim);
      window.addEventListener('pointercancel', fim);
    });
    slider.addEventListener('keydown', (e) => {
      const salto = e.shiftKey ? 1 : 0.1;
      const atual = passo(slider.getAttribute('aria-valuenow'));
      let proximo = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') proximo = atual + salto;
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') proximo = atual - salto;
      else if (e.key === 'Home') proximo = 1;
      else if (e.key === 'End') proximo = 10;
      if (proximo == null) return;
      e.preventDefault();
      if (aoMudar) aoMudar(passo(proximo));
    });
  }
  window.Antecedencia = { passo, marcar, pintar, ligar };
})();
