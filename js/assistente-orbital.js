/**
 * SojournBot. O prompt fica no servidor e as respostas passam por /api/chat.
 * Nunca coloque uma chave de provedor no navegador.
 * Os textos visíveis passam pelo i18n.js.
 */
document.addEventListener("DOMContentLoaded", () => {
  const MAX_HISTORY = 10;
  const MAX_VISIBLE = 30;
  const REQUEST_TIMEOUT_MS = 10000;
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
  function pensarParado() {
    return reduceRobotMotion || document.documentElement.classList.contains("oa-reduce");
  }
  function startThinking() {
    stopThinking(false);
    if (pensarParado()) return;
    thinkFrame = 0;
    setRobotPose(ROBOT_THINK[0]);
    thinkTimer = setInterval(() => {
      thinkFrame = (thinkFrame + 1) % ROBOT_THINK.length;
      setRobotPose(ROBOT_THINK[thinkFrame]);
    }, 500);
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
  document.addEventListener("orbitaccess:change", () => {
    if (pensarParado()) stopThinking(true);
  });
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

  async function askAI(message) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: ingles() ? "en" : "pt",
          message: message,
          history: history.slice(-MAX_HISTORY),
        }),
        signal: ctrl.signal,
      });
      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error(tt("robot.unstable"));
      }
      if (!response.ok) {
        throw new Error(data && typeof data.error === "string" ? data.error : tt("robot.unstable"));
      }
      if (!data || typeof data.reply !== "string" || data.reply.trim() === "") {
        throw new Error(tt("robot.unstable"));
      }
      return data.reply.trim();
    } catch (err) {
      if (ctrl.signal.aborted) {
        throw new Error(ingles()
          ? "The AI chat took too long to respond. Please try again."
          : "O chat com IA demorou demais para responder. Tente novamente.");
      }
      if (err instanceof Error) throw err;
      throw new Error(tt("robot.unstable"));
    } finally {
      clearTimeout(timer);
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
