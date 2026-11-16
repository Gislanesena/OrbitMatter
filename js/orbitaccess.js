/**
 * OrbitAccess. A preferência fica neste aparelho (localStorage "orbitaccess"),
 * fora do progresso do personagem. A classe no <html> entra antes da pintura.
 */
(function () {
  var KEY = "orbitaccess";
  var ESCALA = { "-1": "0.875", "0": "1", "1": "1.125", "2": "1.25", "3": "1.5" };
  var estado = ler();
  var abertoPor = null;
  var dialogo = null;

  function ler() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return padrao();
      var data = JSON.parse(raw);
      return {
        font: fonteValida(data && data.font),
        contrast: !!(data && data.contrast === true),
        motion: data && (data.motion === "reduce" || data.motion === "allow") ? data.motion : null,
      };
    } catch (e) {
      return padrao();
    }
  }

  function padrao() {
    return { font: 0, contrast: false, motion: null };
  }

  function fonteValida(valor) {
    var n = Number(valor);
    if (n === -1 || n === 0 || n === 1 || n === 2 || n === 3) return n;
    return 0;
  }

  function gravar(prox) {
    try {
      localStorage.setItem(KEY, JSON.stringify(prox));
    } catch (e) { /* armazenamento cheio ou bloqueado */ }
  }

  function sistemaQuieto() {
    return window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function quieto(atual) {
    if (atual.motion === "reduce") return true;
    if (atual.motion === "allow") return false;
    return sistemaQuieto();
  }

  function ativos(atual) {
    var n = 0;
    if (atual.font !== 0) n += 1;
    if (atual.contrast) n += 1;
    if (atual.motion !== null) n += 1;
    else if (sistemaQuieto()) n += 1;
    return n;
  }

  function aplicar(atual) {
    var html = document.documentElement;
    html.classList.remove("oa-scaled", "oa-fs-down", "oa-fs-1", "oa-fs-2", "oa-fs-3", "oa-contrast", "oa-reduce");
    html.style.setProperty("--oa-scale", ESCALA[String(atual.font)] || "1");
    if (atual.font === -1) html.classList.add("oa-scaled", "oa-fs-down");
    else if (atual.font > 0) html.classList.add("oa-scaled", "oa-fs-" + atual.font);
    if (atual.contrast) html.classList.add("oa-contrast");
    if (quieto(atual)) html.classList.add("oa-reduce");
    document.dispatchEvent(new CustomEvent("orbitaccess:change"));
  }

  aplicar(estado);

  function tt(chave) {
    return window.I18n ? I18n.t(chave) : chave;
  }

  function textoStatus(n) {
    if (n <= 0) return tt("oa.status.none");
    if (n === 1) return tt("oa.status.one");
    return tt("oa.status.many").replace("{n}", String(n));
  }

  function nivelFonte(n) {
    if (n === -1) return tt("oa.font.smaller");
    if (n === 1) return tt("oa.font.1");
    if (n === 2) return tt("oa.font.2");
    if (n === 3) return tt("oa.font.3");
    return tt("oa.font.default");
  }

  function medir() {
    var html = document.documentElement;
    if (!html.classList.contains("oa-scaled")) {
      html.style.removeProperty("--oa-top");
      html.style.removeProperty("--dock-h");
    } else {
      var hud = document.querySelector(".hud");
      var dock = document.querySelector(".dock");
      if (hud) html.style.setProperty("--oa-top", Math.ceil(hud.getBoundingClientRect().height) + "px");
      if (dock) html.style.setProperty("--dock-h", Math.ceil(dock.getBoundingClientRect().height) + "px");
    }
    if (window.Consciencia && typeof Consciencia.place === "function") Consciencia.place();
  }

  function pintar() {
    var n = ativos(estado);
    document.querySelectorAll("[data-oa-count]").forEach(function (el) {
      el.textContent = String(n);
      el.hidden = n === 0;
    });
    var status = document.getElementById("oaStatus");
    if (status) status.textContent = textoStatus(n);
    var nivel = document.getElementById("oaFontLevel");
    if (nivel) nivel.textContent = nivelFonte(estado.font);
    var contraste = document.getElementById("oaContrast");
    if (contraste) contraste.setAttribute("aria-pressed", String(estado.contrast));
    var movimento = document.getElementById("oaMotion");
    if (movimento) movimento.setAttribute("aria-pressed", String(quieto(estado)));
    medir();
  }

  function mudar(parcial) {
    if (parcial.font !== undefined) estado.font = fonteValida(parcial.font);
    if (parcial.contrast !== undefined) estado.contrast = !!parcial.contrast;
    if (parcial.motion !== undefined) estado.motion = parcial.motion;
    gravar(estado);
    aplicar(estado);
    pintar();
  }

  function focoDentro() {
    if (!dialogo) return [];
    return Array.prototype.filter.call(dialogo.querySelectorAll("button, [href], input, select, textarea"), function (el) {
      return !el.disabled && el.offsetParent !== null;
    });
  }

  function abrir(origem) {
    if (!dialogo) return;
    abertoPor = origem || document.activeElement;
    dialogo.hidden = false;
    var lista = focoDentro();
    if (lista[0]) lista[0].focus();
  }

  function fechar() {
    if (!dialogo || dialogo.hidden) return;
    dialogo.hidden = true;
    if (abertoPor && typeof abertoPor.focus === "function") abertoPor.focus();
    abertoPor = null;
  }

  function tecla(e) {
    if (!dialogo || dialogo.hidden) return;
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      fechar();
      return;
    }
    if (e.key !== "Tab") return;
    var lista = focoDentro();
    if (!lista.length) return;
    var primeiro = lista[0];
    var ultimo = lista[lista.length - 1];
    if (!dialogo.contains(document.activeElement)) {
      e.preventDefault();
      (e.shiftKey ? ultimo : primeiro).focus();
      return;
    }
    if (e.shiftKey && document.activeElement === primeiro) {
      e.preventDefault();
      ultimo.focus();
    } else if (!e.shiftKey && document.activeElement === ultimo) {
      e.preventDefault();
      primeiro.focus();
    }
  }

  function montar() {
    dialogo = document.createElement("div");
    dialogo.id = "oaDialog";
    dialogo.className = "oa-dialog";
    dialogo.setAttribute("role", "dialog");
    dialogo.setAttribute("aria-modal", "true");
    dialogo.setAttribute("aria-labelledby", "oaTitle");
    dialogo.hidden = true;
    dialogo.innerHTML = [
      '<header class="oa-head">',
      '<h2 id="oaTitle" data-i18n="oa.title">OrbitAccess</h2>',
      '<button type="button" class="oa-x" data-oa-close data-i18n="oa.close" data-i18n-attr="aria-label" aria-label="Close OrbitAccess">×</button>',
      '</header>',
      '<p id="oaStatus" class="oa-status" aria-live="polite"></p>',
      '<section><h3 data-i18n="oa.cat.read">Appearance and reading</h3>',
      '<div class="oa-font" role="group">',
      '<button type="button" id="oaFontDown" data-i18n="oa.font.down" data-i18n-attr="aria-label" aria-label="Decrease text size">A−</button>',
      '<p id="oaFontLevel"></p>',
      '<button type="button" id="oaFontUp" data-i18n="oa.font.up" data-i18n-attr="aria-label" aria-label="Increase text size">A+</button>',
      '</div>',
      '<button type="button" id="oaFontReset" class="oa-text" data-i18n="oa.font.restore">Restore text size</button>',
      '</section>',
      '<section><h3 data-i18n="oa.cat.contrast">Contrast and color</h3>',
      '<button type="button" id="oaContrast" class="oa-switch" aria-pressed="false" data-i18n="oa.contrast">High contrast</button>',
      '<p class="oa-help" data-i18n="oa.contrast.help"></p></section>',
      '<section><h3 data-i18n="oa.cat.motion">Motion and animation</h3>',
      '<button type="button" id="oaMotion" class="oa-switch" aria-pressed="false" data-i18n="oa.motion">Reduce animations</button>',
      '<p class="oa-help" data-i18n="oa.motion.help"></p></section>',
      '<section><h3 data-i18n="oa.cat.sr">Screen readers</h3><p class="oa-help" data-i18n="oa.sr.note"></p></section>',
      '<section><h3 data-i18n="oa.cat.audio">Transcripts and audio</h3><p class="oa-help" data-i18n="oa.audio.note"></p></section>',
      '<button type="button" id="oaRestore" class="oa-restore" data-i18n="oa.restore">Restore defaults</button>',
    ].join("");
    document.body.appendChild(dialogo);

    document.getElementById("oaFontDown").addEventListener("click", function () {
      mudar({ font: Math.max(-1, estado.font - 1) });
    });
    document.getElementById("oaFontUp").addEventListener("click", function () {
      mudar({ font: Math.min(3, estado.font + 1) });
    });
    document.getElementById("oaFontReset").addEventListener("click", function () {
      mudar({ font: 0 });
    });
    document.getElementById("oaContrast").addEventListener("click", function () {
      mudar({ contrast: !estado.contrast });
    });
    document.getElementById("oaMotion").addEventListener("click", function () {
      mudar({ motion: quieto(estado) ? "allow" : "reduce" });
    });
    document.getElementById("oaRestore").addEventListener("click", function () {
      estado = padrao();
      gravar(estado);
      aplicar(estado);
      pintar();
    });
    dialogo.querySelector("[data-oa-close]").addEventListener("click", fechar);
    document.querySelectorAll("[data-oa-open]").forEach(function (botao) {
      botao.addEventListener("click", function () { abrir(botao); });
    });
    document.addEventListener("keydown", tecla, true);
    document.addEventListener("focusin", function (e) {
      if (!dialogo || dialogo.hidden || dialogo.contains(e.target)) return;
      var lista = focoDentro();
      if (lista[0]) lista[0].focus();
    });
    window.addEventListener("resize", medir);
    if (window.matchMedia) {
      matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", function () {
        if (estado.motion === null) {
          aplicar(estado);
          pintar();
        }
      });
    }
    var anterior = window._onLangChange;
    window._onLangChange = function (lang) {
      if (typeof anterior === "function") anterior(lang);
      pintar();
    };
  }

  document.addEventListener("DOMContentLoaded", function () {
    montar();
    requestAnimationFrame(function () {
      pintar();
      requestAnimationFrame(medir);
    });
  });
})();
