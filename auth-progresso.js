/**
 * auth-progresso.js — Camada de autenticação e persistência (Fase 1: localStorage)
 *
 * AVISO DE SEGURANÇA: O login é feito apenas pelo nome de usuário, sem senha.
 * Qualquer pessoa que conheça o nome pode acessar aquele perfil neste navegador.
 * Para proteger melhor, opções futuras incluem:
 *   - PIN de 4 dígitos (adicionar campo "pin" ao criar e validar ao entrar)
 *   - Senha com hash (bcrypt via WebCrypto API)
 *   - Firebase Authentication (Fase 2: Google / e-mail)
 *
 * FASE 2 — Para trocar esta camada pelo Firebase, basta reimplementar as funções
 * exportadas abaixo usando firebase/auth e firebase/firestore.
 * O resto do jogo não precisa mudar.
 *
 * ESTRUTURA NO localStorage:
 *   atlas:users          → { [nome]: { nome, email, criadoEm } }
 *   atlas:session        → nome do jogador ativo (string)
 *   atlas:prog:[nome]    → objeto de progresso do jogador
 *   atlas:img:[nome]     → dataURL da imagem de perfil (base64 ~20–30 KB)
 */

const AP = (() => {
  const PREFIX_USERS   = 'atlas:users';
  const PREFIX_SESSION = 'atlas:session';
  const PREFIX_PROG    = 'atlas:prog:';
  const PREFIX_IMG     = 'atlas:img:';

  // ---- utilidades -------------------------------------------------------
  function _getUsers() {
    try { return JSON.parse(localStorage.getItem(PREFIX_USERS) || '{}'); } catch { return {}; }
  }
  function _setUsers(u) {
    try { localStorage.setItem(PREFIX_USERS, JSON.stringify(u)); } catch { /* storage cheio */ }
  }

  // ---- validação --------------------------------------------------------
  /**
   * Valida nome de usuário.
   * @returns {string|null} mensagem de erro ou null se válido
   */
  function validarNome(nome) {
    const n = (nome || '').trim();
    if (!n) return 'O nome não pode ser vazio.';
    if (n.length < 3) return 'Mínimo de 3 caracteres.';
    if (n.length > 20) return 'Máximo de 20 caracteres.';
    if (/^\s|\s$/.test(nome)) return 'O nome não pode ter espaços no início ou no fim.';
    return null;
  }

  /**
   * Valida e-mail.
   * @returns {string|null} mensagem de erro ou null se válido
   */
  function validarEmail(email) {
    const e = (email || '').trim();
    if (!e) return 'O e-mail não pode ser vazio.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return 'Formato de e-mail inválido.';
    return null;
  }

  // ---- API pública -------------------------------------------------------

  /**
   * Cria um novo jogador.
   * @returns {{ ok: true, nome } | { ok: false, campo: 'nome'|'email', erro: string }}
   */
  function criarJogador(nome, email) {
    const erroNome = validarNome(nome);
    if (erroNome) return { ok: false, campo: 'nome', erro: erroNome };

    const erroEmail = validarEmail(email);
    if (erroEmail) return { ok: false, campo: 'email', erro: erroEmail };

    const nomeTrim = nome.trim();
    const users = _getUsers();
    if (users[nomeTrim]) {
      return {
        ok: false,
        campo: 'nome',
        erro: `O nome "${nomeTrim}" já existe. Que tal "${nomeTrim}${Math.floor(Math.random() * 90 + 10)}"?`,
      };
    }

    users[nomeTrim] = { nome: nomeTrim, email: email.trim(), criadoEm: Date.now() };
    _setUsers(users);

    // inicia progresso zerado para este jogador
    try {
      localStorage.setItem(PREFIX_PROG + nomeTrim, JSON.stringify(_blankProgress(nomeTrim)));
    } catch { /* ignora */ }

    _setSession(nomeTrim);
    return { ok: true, nome: nomeTrim };
  }

  /**
   * Faz login com nome de usuário existente.
   * @returns {{ ok: true, nome, prog } | { ok: false, erro: string }}
   */
  function entrar(nome) {
    const nomeTrim = (nome || '').trim();
    const erroNome = validarNome(nomeTrim);
    if (erroNome) return { ok: false, erro: erroNome };

    const users = _getUsers();
    if (!users[nomeTrim]) return { ok: false, erro: `Jogador "${nomeTrim}" não encontrado. Quer criar um personagem?` };

    _setSession(nomeTrim);
    const prog = carregarProgresso(nomeTrim);
    return { ok: true, nome: nomeTrim, prog };
  }

  /**
   * Encerra a sessão atual (mantém o progresso salvo).
   */
  function sair() {
    try { localStorage.removeItem(PREFIX_SESSION); } catch { /* ignora */ }
  }

  /**
   * Retorna o nome do jogador com sessão ativa, ou null.
   */
  function sessaoAtiva() {
    try { return localStorage.getItem(PREFIX_SESSION) || null; } catch { return null; }
  }

  /**
   * Salva o progresso completo do jogador.
   * @param {string} nome
   * @param {object} prog — estado S do jogo
   */
  function salvarProgresso(nome, prog) {
    if (!nome) return;
    try {
      localStorage.setItem(PREFIX_PROG + nome, JSON.stringify({ ...prog, _nome: nome }));
    } catch { /* storage cheio */ }
  }

  /**
   * Carrega o progresso do jogador. Retorna blank se não existir.
   */
  function carregarProgresso(nome) {
    try {
      const raw = localStorage.getItem(PREFIX_PROG + nome);
      return raw ? JSON.parse(raw) : _blankProgress(nome);
    } catch { return _blankProgress(nome); }
  }

  /**
   * Salva a imagem de perfil (dataURL já redimensionada para ~128x128).
   */
  function salvarImagemPerfil(nome, dataURL) {
    if (!nome || !dataURL) return;
    try { localStorage.setItem(PREFIX_IMG + nome, dataURL); } catch { /* storage cheio */ }
  }

  /**
   * Remove a imagem de perfil.
   */
  function removerImagemPerfil(nome) {
    try { localStorage.removeItem(PREFIX_IMG + nome); } catch { /* ignora */ }
  }

  /**
   * Carrega a imagem de perfil. Retorna null se não houver.
   */
  function carregarImagemPerfil(nome) {
    try { return localStorage.getItem(PREFIX_IMG + nome) || null; } catch { return null; }
  }

  /**
   * Retorna dados do jogador (nome, email, criadoEm) ou null.
   */
  function dadosJogador(nome) {
    const users = _getUsers();
    return users[nome] || null;
  }

  // ---- privado -----------------------------------------------------------
  function _setSession(nome) {
    try { localStorage.setItem(PREFIX_SESSION, nome); } catch { /* ignora */ }
  }

  function _blankProgress(nome) {
    return {
      _nome: nome,
      started: false,
      xp: 0,
      seen: [],
      analyzed: [],
      steps: {},
      done: {},
      badges: [],
      path: [],
      kesslerMax: 0,
      visited: ['terra'],
      dest: 'terra',
    };
  }

  // --- redimensionamento de imagem via canvas ----------------------------
  /**
   * Recorta e redimensiona uma imagem para 128×128, retornando dataURL.
   * @param {File} file
   * @returns {Promise<string>} dataURL
   */
  function processarImagem(file) {
    return new Promise((resolve, reject) => {
      if (!file) { reject('Nenhum arquivo.'); return; }
      const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp'];
      if (!tiposPermitidos.includes(file.type)) {
        reject('Formato não aceito. Use JPG, PNG ou WebP.');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        reject('Arquivo muito grande. Máximo: 2 MB.');
        return;
      }
      const reader = new FileReader();
      reader.onerror = () => reject('Erro ao ler o arquivo.');
      reader.onload = (e) => {
        const img = new Image();
        img.onerror = () => reject('Imagem inválida.');
        img.onload = () => {
          const size = Math.min(img.width, img.height);
          const sx = (img.width - size) / 2;
          const sy = (img.height - size) / 2;
          const canvas = document.createElement('canvas');
          canvas.width = 128;
          canvas.height = 128;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, sx, sy, size, size, 0, 0, 128, 128);
          resolve(canvas.toDataURL('image/jpeg', 0.82));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  return {
    criarJogador,
    entrar,
    sair,
    sessaoAtiva,
    salvarProgresso,
    carregarProgresso,
    salvarImagemPerfil,
    removerImagemPerfil,
    carregarImagemPerfil,
    dadosJogador,
    processarImagem,
    validarNome,
    validarEmail,
  };
})();

// Expõe globalmente
window.AP = AP;
