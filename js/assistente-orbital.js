/**
 * SojournBot. O prompt, a troca de modelos, a formatação da resposta
 * e as poses de interrogação vêm da página Memórias do Espaço.
 * A chave, se existir, fica em window.GROQ_API_KEY (frontend/groq-local.js, fora do Git).
 * Os textos visíveis passam pelo i18n.js.
 */
document.addEventListener("DOMContentLoaded", () => {
  const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
  const GROQ_MODELS = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "qwen/qwen3.8-27b"];
  const GROQ_SYSTEM = [
    "Você é o SojournBot, um rover inteligente do Atlas do Lixo Espacial. Seu nome é SojournBot: apresente-se e reconheça-se sempre com esse nome. Você é especializado em orientação espacial e em dados de detritos orbitais. Ajude entusiastas em idade escolar e curiosos a descobrirem as máquinas históricas que a humanidade e a NASA deixaram na Lua, em Marte e no espaço profundo, e explique os riscos dos detritos orbitais e da Síndrome de Kessler.",
    "Diretrizes:",
    "1. Tom: Empolgante, acolhedor, curioso e educativo. Trate os artefatos históricos (como a Surveyor 1 ou a Voyager 1) como monumentos silenciosos e marcos da ciência.",
    "2. Clareza: Use analogias simples para explicar conceitos complexos, evitando jargões técnicos excessivos sem explicá-los.",
    "3. Precisão: Baseie suas respostas em dados científicos reais (como NSSDCA, LROC e missões JPL) sempre que aplicável.",
    "4. Concisão: cada resposta tem no máximo 2 ou 3 frases curtas. Não escreva parágrafos longos, listas grandes nem blocos de texto.",
    "Só passe desse limite se a pessoa pedir explicitamente mais detalhe, uma explicação aprofundada ou um passo a passo.",
    "Tom de chat: fale como um rover amigo, direto e curioso. Entregue a ideia principal e deixe uma pergunta curta para a pessoa continuar, sem despejar o assunto inteiro de uma vez.",
    "Diálogo:",
    "Leia o histórico desta conversa antes de responder. Pronomes e continuações (\"eles\", \"isso\", \"e como\", \"e aí\") referem-se à mensagem anterior.",
    "Responda à frase que acabou de chegar. Uma saudação recebe uma saudação curta. Uma pergunta curta, como \"lixo espacial?\", recebe duas ou três frases sobre esse tema. Um pedido de continuação retoma só o ponto anterior.",
    "Não comece com \"Exatamente!\", \"Isso mesmo!\", \"Com certeza!\", \"Ótima pergunta!\" ou outra concordância vazia quando a pessoa não afirmou nada para você confirmar.",
    "Não invente que a pessoa concordou com você. Não responda como se houvesse uma fala anterior que não está no histórico.",
    "Restrições de escopo e assuntos proibidos:",
    "Responda somente sobre exploração espacial, satélites, engenharia orbital, a história de artefatos e sondas (como Surveyor 1, Voyager, Luna e equivalentes), detritos espaciais e a Síndrome de Kessler.",
    "Não responda quando uma palavra do tema aparecer isolada em outro assunto. Exemplos fora de escopo: bolo ou receita \"espacial\", festa, horóscopo, astrologia, filmes de ficção científica genéricos, culinária e piadas sem relação com ciência espacial.",
    "Ao recusar, não responda à pergunta fora de contexto. Redirecione com educação para o Atlas.",
  ].join("\n");
  const MAX_HISTORY = 10;
  const MAX_VISIBLE = 30;
  const REQUEST_TIMEOUT_MS = 30000;
  const ROBOT_IDLE = "assets/images/mascote/mascote-frente.png";
  const ROBOT_THINK = [
    "assets/images/mascote/mascote-apontando-direita-interrogacao.png",
    "assets/images/mascote/mascote-apontando-esquerda-interrogacao.png",
  ];

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

  const greeting = (list.querySelector(".robot-msg.bot") || {}).textContent || "";
  const history = greeting ? [{ role: "assistant", content: greeting.trim() }] : [];
  let busy = false;
  let recognition = null;
  let micError = "";
  const reduceRobotMotion = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  let thinkTimer = null;
  let thinkFrame = 0;

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

  function setRobotPose(src) {
    root.querySelectorAll(".robot-img").forEach((img) => {
      if (img.getAttribute("src") !== src) img.src = src;
    });
  }
  function startThinking() {
    stopThinking(false);
    if (reduceRobotMotion) return;
    thinkFrame = 0;
    setRobotPose(ROBOT_THINK[0]);
    thinkTimer = setInterval(() => {
      thinkFrame = (thinkFrame + 1) % ROBOT_THINK.length;
      setRobotPose(ROBOT_THINK[thinkFrame]);
    }, 300);
  }
  function stopThinking(reset) {
    if (thinkTimer) { clearInterval(thinkTimer); thinkTimer = null; }
    if (reset !== false) setRobotPose(ROBOT_IDLE);
  }

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
    } else {
      cancelListening();
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

  function chatHtml(raw) {
    const escHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    const inline = (s) => escHtml(s)
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/__([^_]+)__/g, "<strong>$1</strong>")
      .replace(/(^|[\s(])\*([^*\n]+)\*/g, "$1<em>$2</em>")
      .replace(/(^|[\s(])_([^_\n]+)_/g, "$1<em>$2</em>");
    const lines = String(raw || "").replace(/\r\n/g, "\n").split("\n");
    const blocks = [];
    let lista = null;
    const flush = () => {
      if (!lista) return;
      const tag = lista.ordered ? "ol" : "ul";
      blocks.push("<" + tag + ">" + lista.items.map((item) => "<li>" + inline(item) + "</li>").join("") + "</" + tag + ">");
      lista = null;
    };
    lines.forEach((line) => {
      const ul = line.match(/^\s*[-*]\s+(.+)$/);
      const ol = line.match(/^\s*\d+[.)]\s+(.+)$/);
      if (ul || ol) {
        const ordered = !!ol;
        if (!lista || lista.ordered !== ordered) { flush(); lista = { ordered, items: [] }; }
        lista.items.push((ul || ol)[1]);
        return;
      }
      flush();
      if (line.trim()) blocks.push("<p>" + inline(line) + "</p>");
    });
    flush();
    return blocks.join("") || "<p></p>";
  }

  function addMessage(role, text, extra) {
    const div = document.createElement("div");
    div.className = "robot-msg " + role + (extra ? " " + extra : "");
    if (role === "bot" && extra !== "error") div.innerHTML = chatHtml(text);
    else div.textContent = text;
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
    div.setAttribute("aria-label", tt("robot.typing"));
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
    if (b) startThinking();
    else stopThinking(true);
    updateSend();
    if (!b && !bubble.classList.contains("hidden") && window.matchMedia("(pointer: fine)").matches) input.focus();
  }
  input.addEventListener("input", updateSend);

  function groqKey() {
    return String(window.GROQ_API_KEY || "").trim();
  }
  function trocaDeModelo(err) {
    if (err && (err.status === 401 || err.status === 403)) return false;
    return true;
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
  async function pedirCadeia(messages) {
    let ultimo = null;
    for (const model of GROQ_MODELS) {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), REQUEST_TIMEOUT_MS);
      try {
        return await pedirModelo(messages, model, ctrl.signal);
      } catch (err) {
        ultimo = err;
        if (!trocaDeModelo(err)) throw err;
      } finally {
        clearTimeout(timer);
      }
    }
    throw ultimo || new Error("modelos indisponiveis");
  }
  async function askAI(message) {
    if (!groqKey()) throw new Error("sem chave");
    const idioma = ingles()
      ? "\nResponda em inglês. Ao recusar um assunto fora do Atlas, redirecione em inglês."
      : "\nResponda em português.";
    const messages = [
      { role: "system", content: GROQ_SYSTEM + idioma },
      ...history.slice(-MAX_HISTORY),
      { role: "user", content: message },
    ];
    try {
      return await pedirCadeia(messages);
    } catch (err) {
      if (!trocaDeModelo(err)) throw err;
      return await pedirCadeia(messages);
    }
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
      addMessage("bot", tt("robot.unstable"), "error");
    } finally {
      setBusy(false);
    }
  }

  form.addEventListener("submit", (e) => { e.preventDefault(); send(); });
  suggest.querySelectorAll("button").forEach((b) => {
    b.addEventListener("click", () => send(b.textContent));
  });

  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  const MIC_MESSAGES = {
    "not-allowed": "robot.mic.denied",
    "service-not-allowed": "robot.mic.denied",
    "audio-capture": "robot.mic.none",
    "no-speech": "robot.mic.silent",
    network: "robot.mic.network",
  };

  function setListening(on) {
    micBtn.classList.toggle("recording", on);
    micBtn.setAttribute("aria-pressed", String(on));
    micBtn.setAttribute("aria-label", tt(on ? "robot.mic.stop" : "robot.mic"));
    micBtn.title = tt(on ? "robot.mic.stop.title" : "robot.mic.title");
    input.placeholder = on ? tt("robot.listen.placeholder") : tt("robot.placeholder");
    setState(on ? "listening" : busy ? "thinking" : "idle");
  }

  function startListening() {
    if (!SpeechRec) {
      addMessage("bot", tt("robot.mic.unsupported"), "error");
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
      if (micError !== "aborted") addMessage("bot", tt(MIC_MESSAGES[micError] || "robot.mic.fail"), "error");
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
  function cancelListening() {
    if (recognition) { micError = "aborted"; try { recognition.abort(); } catch (e) { /* já encerrou */ } }
  }
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
  window.addEventListener("load", placeRobot);
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
