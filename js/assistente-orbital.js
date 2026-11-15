/**
 * Assistente orbital no canto da tela.
 * A chave, se existir, fica em window.GROQ_API_KEY (frontend/groq-local.js, fora do Git).
 * Sem chave, o chat responde com as frases locais.
 */
document.addEventListener("DOMContentLoaded", () => {
  const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
  const GROQ_MODELS = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"];
  const GROQ_SYSTEM = [
    "Você é o Assistente Orbital oficial do Atlas do Lixo Espacial, um guia amigável, inteligente e especialista em exploração espacial, ciência e sustentabilidade orbital. Seu objetivo é ajudar entusiastas em idade escolar e curiosos a descobrirem as máquinas históricas que a humanidade e a NASA deixaram na Lua, em Marte e no espaço profundo, além de explicar os riscos dos detritos orbitais e da Síndrome de Kessler.",
    "Diretrizes:",
    "1. Tom: Empolgante, acolhedor, curioso e educativo. Trate os artefatos históricos (como a Surveyor 1 ou a Voyager 1) como monumentos silenciosos e marcos da ciência.",
    "2. Clareza: Use analogias simples para explicar conceitos complexos, evitando jargões técnicos excessivos sem explicá-los.",
    "3. Precisão: Baseie suas respostas em dados científicos reais (como NSSDCA, LROC e missões JPL) sempre que aplicável.",
    "4. Curteza e Dinâmica: Mantenha as respostas focadas em conversas de chat, preferindo parágrafos curtos e organizados.",
    "Restrições de escopo e assuntos proibidos:",
    "Responda somente sobre exploração espacial, satélites, engenharia orbital, a história de artefatos e sondas (como Surveyor 1, Voyager, Luna e equivalentes), detritos espaciais e a Síndrome de Kessler.",
    "Não responda quando uma palavra do tema aparecer isolada em outro assunto. Exemplos fora de escopo: bolo ou receita \"espacial\", festa, horóscopo, astrologia, filmes de ficção científica genéricos, culinária e piadas sem relação com ciência espacial.",
    "Ao recusar, não responda à pergunta fora de contexto. Redirecione com educação para o Atlas.",
    "Se o idioma da interface estiver em inglês, responda em inglês. Caso contrário, responda em português.",
  ].join("\n");
  const MAX_HISTORY = 10;
  const MAX_VISIBLE = 30;
  const REQUEST_TIMEOUT_MS = 30000;

  const $r = (id) => document.getElementById(id);
  const root = $r("robotAssistant");
  const bubble = $r("robotBubble");
  const robotBtn = $r("robotCharacter");
  const arrowBtn = $r("robotArrow");
  const closeBtn = $r("robotCloseBtn");
  const list = $r("robotMessages");
  const form = $r("robotForm");
  const input = $r("robotUserInput");
  const micBtn = $r("robotMicBtn");
  const sendBtn = $r("robotSendBtn");
  const suggest = $r("robotSuggest");
  const statusEl = $r("robotStatus");
  if (!root || !bubble || !form) return;

  const history = [];
  let busy = false;
  let recognition = null;
  let micError = "";

  function tt(chave) {
    return window.I18n ? I18n.t(chave) : chave;
  }
  function ingles() {
    return window.I18n && I18n.lang === "en";
  }

  root.querySelectorAll(".robot-img").forEach((img) => {
    const fallback = () => {
      const s = document.createElement("span");
      s.className = img.className + " robot-fallback";
      s.textContent = "🤖";
      img.replaceWith(s);
    };
    if (img.complete && img.naturalWidth === 0) fallback();
    else img.addEventListener("error", fallback, { once: true });
  });

  function setOpen(open) {
    bubble.classList.toggle("hidden", !open);
    root.classList.toggle("robot-open", open);
    robotBtn.setAttribute("aria-expanded", String(open));
    arrowBtn.setAttribute("aria-expanded", String(open));
    arrowBtn.setAttribute("aria-label", tt(open ? "robot.close" : "robot.arrow"));
    robotBtn.setAttribute("aria-label", tt(open ? "robot.close" : "robot.open"));
    if (open) {
      list.scrollTop = list.scrollHeight;
      if (window.matchMedia("(pointer: fine)").matches) input.focus();
    } else if (recognition) {
      micError = "aborted";
      try { recognition.abort(); } catch (e) { /* já encerrou */ }
    }
    placeRobot();
  }
  const toggle = () => setOpen(bubble.classList.contains("hidden"));
  robotBtn.addEventListener("click", toggle);
  arrowBtn.addEventListener("click", toggle);
  closeBtn.addEventListener("click", () => { setOpen(false); robotBtn.focus(); });
  bubble.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { e.stopPropagation(); setOpen(false); robotBtn.focus(); }
  });

  function addMessage(role, text, extra) {
    const div = document.createElement("div");
    div.className = "robot-msg " + role + (extra ? " " + extra : "");
    div.textContent = text;
    list.appendChild(div);
    const msgs = list.querySelectorAll(".robot-msg:not(.robot-typing)");
    const sobra = msgs.length - MAX_VISIBLE;
    for (let i = 0; i < sobra; i++) msgs[i].remove();
    list.scrollTop = list.scrollHeight;
    return div;
  }

  function addTyping() {
    const div = document.createElement("div");
    div.className = "robot-msg bot robot-typing";
    div.innerHTML = "<i></i><i></i><i></i>";
    list.appendChild(div);
    list.scrollTop = list.scrollHeight;
    return div;
  }

  function setState(state) {
    bubble.dataset.state = state;
    const chave = state === "listening" ? "robot.listening" : state === "thinking" ? "robot.thinking" : "robot.status";
    statusEl.textContent = tt(chave);
  }
  function updateSend() { sendBtn.disabled = busy || input.value.trim() === ""; }
  function setBusy(b) {
    busy = b;
    micBtn.disabled = b;
    input.disabled = b;
    setState(b ? "thinking" : "idle");
    updateSend();
    if (!b && !bubble.classList.contains("hidden") && window.matchMedia("(pointer: fine)").matches) input.focus();
  }
  input.addEventListener("input", updateSend);

  function demoReply(q) {
    const t = q.toLowerCase();
    const en = ingles();
    if (/(^|\s)(ol[áa]|oi|bom dia|boa tarde|boa noite|hello|hi|hey)(\s|!|,|$)/.test(t)) return tt("robot.hello");
    if (t.includes("kessler")) {
      return en
        ? "Kessler syndrome is a chain reaction: collisions make fragments, the fragments cause more collisions, and some orbits can become unusable. The Atlas can simulate that."
        : "A síndrome de Kessler é uma reação em cadeia: colisões geram fragmentos, que causam novas colisões e podem deixar certas órbitas inutilizáveis. Dá para simular isso no Atlas.";
    }
    if (t.includes("reduz") || t.includes("limpar") || t.includes("remov") || t.includes("reduc") || t.includes("clean")) {
      return en
        ? "Two main paths: avoid making new debris (deorbit satellites at end of life) and remove the most dangerous objects already up there."
        : "Duas frentes principais: evitar criar lixo novo (desorbitar satélites no fim da vida) e remover os objetos mais perigosos que já estão lá em cima.";
    }
    if (t.includes("lixo") || t.includes("detrito") || t.includes("espacial") || t.includes("debris") || t.includes("junk") || t.includes("orbit")) {
      return en
        ? "Space debris is unused material in orbit: inactive satellites, rocket stages, and fragments. It travels at thousands of kilometers per hour and threatens active satellites."
        : "Lixo espacial são objetos sem uso em órbita, como satélites inativos, estágios de foguete e fragmentos. Eles viajam a milhares de km/h e ameaçam satélites ativos.";
    }
    return en
      ? "I am in demonstration mode, with no AI connected. Once the server is configured, I can answer questions about the Atlas."
      : "Ainda estou em modo de demonstração, sem IA conectada. Quando o servidor for configurado, vou responder qualquer dúvida sobre o Atlas.";
  }

  function groqKey() {
    return String(window.GROQ_API_KEY || "").trim();
  }

  async function pedirModelo(messages, model, signal) {
    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + groqKey(),
      },
      body: JSON.stringify({ model: model, temperature: 0.4, messages: messages }),
      signal: signal,
    });
    if (!res.ok) {
      const err = new Error("HTTP " + res.status);
      err.status = res.status;
      throw err;
    }
    const data = await res.json();
    const text = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    if (!text) throw new Error("Resposta vazia");
    return String(text).trim();
  }

  async function askAI(message) {
    if (!groqKey()) {
      await new Promise((r) => setTimeout(r, 700));
      return demoReply(message);
    }
    const messages = [
      { role: "system", content: GROQ_SYSTEM + (ingles() ? "\nResponda em inglês." : "\nResponda em português.") },
      ...history.slice(-MAX_HISTORY),
      { role: "user", content: message },
    ];
    let ultimo = null;
    for (const model of GROQ_MODELS) {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), REQUEST_TIMEOUT_MS);
      try {
        return await pedirModelo(messages, model, ctrl.signal);
      } catch (err) {
        ultimo = err;
        if (err && (err.status === 401 || err.status === 403)) break;
      } finally {
        clearTimeout(timer);
      }
    }
    throw ultimo || new Error("modelos indisponiveis");
  }

  async function send(raw) {
    const text = (raw === undefined ? input.value : raw).trim();
    if (!text || busy) return;
    input.value = "";
    suggest.hidden = true;
    addMessage("user", text);
    setBusy(true);
    const typing = addTyping();
    try {
      const reply = await askAI(text);
      typing.remove();
      addMessage("bot", reply);
      history.push({ role: "user", content: text }, { role: "assistant", content: reply });
      if (history.length > MAX_HISTORY) history.splice(0, history.length - MAX_HISTORY);
    } catch (err) {
      console.error(err);
      typing.remove();
      addMessage("bot", ingles()
        ? "I could not reach the AI just now. Try again in a moment."
        : "Não consegui falar com a IA agora. Tente de novo em instantes.", "error");
    } finally {
      setBusy(false);
    }
  }

  form.addEventListener("submit", (e) => { e.preventDefault(); send(); });
  suggest.querySelectorAll("button").forEach((b) => {
    b.addEventListener("click", () => send(b.textContent));
  });

  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;

  function setListening(on) {
    micBtn.classList.toggle("recording", on);
    micBtn.setAttribute("aria-pressed", String(on));
    micBtn.setAttribute("aria-label", tt(on ? "robot.close" : "robot.mic"));
    input.placeholder = on ? tt("robot.listening") : tt("robot.placeholder");
    setState(on ? "listening" : busy ? "thinking" : "idle");
  }

  function startListening() {
    if (!SpeechRec) {
      addMessage("bot", ingles()
        ? "This browser cannot record voice. Use Chrome, Edge, or Safari, or type your question."
        : "Seu navegador não suporta gravação de voz. Use o Chrome, Edge ou Safari, ou digite sua dúvida.", "error");
      return;
    }
    if (busy) return;
    recognition = new SpeechRec();
    recognition.lang = ingles() ? "en-US" : "pt-BR";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;
    micError = "";
    input.value = "";
    updateSend();
    recognition.onstart = () => setListening(true);
    recognition.onresult = (e) => {
      let text = "";
      for (let i = 0; i < e.results.length; i++) text += e.results[i][0].transcript;
      input.value = text.trim();
      updateSend();
    };
    recognition.onerror = (e) => {
      micError = e.error || "erro";
      if (micError !== "aborted") {
        addMessage("bot", ingles()
          ? "I could not record that. Try again or type your question."
          : "Não consegui gravar. Tente de novo ou digite sua dúvida.", "error");
      }
    };
    recognition.onend = () => {
      setListening(false);
      recognition = null;
      const text = input.value.trim();
      if (text && !micError) send(text);
    };
    try { recognition.start(); } catch (err) { setListening(false); recognition = null; }
  }

  function stopListening() { if (recognition) { try { recognition.stop(); } catch (e) { /* já parou */ } } }
  micBtn.addEventListener("click", () => (recognition ? stopListening() : startListening()));

  function placeRobot() {
    root.style.bottom = "";
    const launcher = root.querySelector(".robot-launcher");
    if (!launcher) return;
    const launcherH = launcher.offsetHeight || 95;
    const zoneLeft = window.innerWidth - 16 - launcher.offsetWidth;
    let bottom = 16;
    [".navbar", ".dock-inner"].forEach((sel) => {
      const el = document.querySelector(sel);
      if (!el || !el.getClientRects().length) return;
      const r = el.getBoundingClientRect();
      if (r.width && r.bottom > 0 && r.right > zoneLeft && r.left < window.innerWidth) {
        bottom = Math.max(bottom, window.innerHeight - r.top + 10);
      }
    });
    const maxBottom = Math.max(16, window.innerHeight - launcherH - 16);
    bottom = Math.min(bottom, maxBottom);
    if (bottom > 16) root.style.bottom = "calc(" + Math.round(bottom) + "px + env(safe-area-inset-bottom, 0px))";
  }
  placeRobot();
  setOpen(false);
  window.addEventListener("resize", placeRobot);
  if (window.ResizeObserver) {
    const ro = new ResizeObserver(placeRobot);
    [".navbar", ".dock-inner"].forEach((sel) => {
      const el = document.querySelector(sel);
      if (el) ro.observe(el);
    });
  }

  const anterior = window._onLangChange;
  window._onLangChange = (lang) => {
    if (anterior) anterior(lang);
    setState(bubble.dataset.state || "idle");
    if (!micBtn.classList.contains("recording")) input.placeholder = tt("robot.placeholder");
  };
});
