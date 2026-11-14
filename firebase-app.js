/**
 * firebase-app.js — Fase 2: Firebase Authentication + Firestore + Storage
 * Substitui a camada localStorage de auth-progresso.js.
 * O resto do jogo (HTML, atlas.css, lógica de XP/missões) não precisa mudar.
 *
 * DEPENDÊNCIA: firebase-config.js deve ser carregado antes deste arquivo.
 */

import { initializeApp }         from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged }
                                 from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { getFirestore, doc, setDoc, getDoc }
                                 from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import { getStorage, ref, uploadString, getDownloadURL, deleteObject }
                                 from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js';

// ── Inicializa Firebase ──────────────────────────────────────────────────────
const app      = initializeApp(window.FIREBASE_CONFIG);
const auth     = getAuth(app);
const db       = getFirestore(app);
const storage  = getStorage(app);

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });

// ── Estado interno ──────────────────────────────────────────────────────────
let _currentUser = null;   // objeto Firebase User
let _nomeUsuario = null;   // nome de personagem escolhido pelo jogador

// ── Utilitários ─────────────────────────────────────────────────────────────
function _blank() {
  return { started: false, xp: 0, seen: [], analyzed: [], steps: {},
           done: {}, badges: [], path: [], kesslerMax: 0,
           visited: ['terra'], dest: 'terra' };
}

async function _lerPerfil(uid) {
  const snap = await getDoc(doc(db, 'jogadores', uid, 'perfil', 'dados'));
  return snap.exists() ? snap.data() : null;
}

async function _lerProgresso(uid) {
  const snap = await getDoc(doc(db, 'jogadores', uid, 'progresso', 'estado'));
  return snap.exists() ? snap.data() : _blank();
}

// ── API pública — mesmas assinaturas de auth-progresso.js ───────────────────

/**
 * Login com Google. Se for a primeira vez, pede nome de personagem.
 * Retorna { ok, nome, prog, primeiraVez } ou { ok: false, erro }
 */
async function entrarComGoogle() {
  try {
    const result = await signInWithPopup(auth, provider);
    _currentUser = result.user;

    const perfil = await _lerPerfil(_currentUser.uid);
    const primeiraVez = !perfil || !perfil.nome;

    if (!primeiraVez) {
      _nomeUsuario = perfil.nome;
      const prog = await _lerProgresso(_currentUser.uid);
      return { ok: true, nome: _nomeUsuario, prog, primeiraVez: false };
    }

    // Primeira vez: ainda sem nome de personagem
    return { ok: true, uid: _currentUser.uid, email: _currentUser.email,
             fotoGoogle: _currentUser.photoURL, primeiraVez: true };
  } catch (e) {
    return { ok: false, erro: e.message || 'Erro ao entrar com Google.' };
  }
}

/**
 * Finaliza o cadastro na primeira vez com Google (define nome de personagem).
 */
async function finalizarCadastroGoogle(uid, nome, email, fotoGoogle) {
  const erroNome = AP.validarNome(nome);
  if (erroNome) return { ok: false, campo: 'nome', erro: erroNome };

  const nomeTrim = nome.trim();
  // Salva perfil no Firestore
  await setDoc(doc(db, 'jogadores', uid, 'perfil', 'dados'), {
    nome: nomeTrim, email, criadoEm: Date.now(), fotoGoogle: fotoGoogle || '',
  });

  // Progresso inicial zerado
  await setDoc(doc(db, 'jogadores', uid, 'progresso', 'estado'), _blank());

  _nomeUsuario = nomeTrim;
  return { ok: true, nome: nomeTrim, prog: _blank() };
}

/**
 * Cria personagem com e-mail/nome (sem Google — mantido para compatibilidade).
 * Na Fase 2 apenas armazena no Firestore, sem autenticação real de e-mail.
 */
async function criarJogador(nome, email) {
  // Delega validação ao AP (Fase 1) para reaproveitar regras
  const erroNome  = AP.validarNome(nome);
  if (erroNome)  return { ok: false, campo: 'nome',  erro: erroNome };
  const erroEmail = AP.validarEmail(email);
  if (erroEmail) return { ok: false, campo: 'email', erro: erroEmail };

  // Na Fase 2 sem Firebase Auth de e-mail, usamos localStorage como fallback
  return AP.criarJogador(nome, email);
}

/** Faz login por nome (fallback localStorage — Fase 1). */
function entrar(nome) { return AP.entrar(nome); }

/** Encerra sessão Firebase + limpa sessão local. */
async function sair() {
  try { await signOut(auth); } catch { /* ignora */ }
  _currentUser = null;
  _nomeUsuario = null;
  AP.sair();
}

/** Retorna nome do personagem ativo (Firebase ou localStorage). */
function sessaoAtiva() {
  return _nomeUsuario || AP.sessaoAtiva();
}

/** Salva progresso no Firestore (se autenticado) ou localStorage. */
async function salvarProgresso(nome, prog) {
  if (_currentUser) {
    try {
      await setDoc(doc(db, 'jogadores', _currentUser.uid, 'progresso', 'estado'),
                   { ...prog, _nome: nome });
    } catch { /* fallback */ AP.salvarProgresso(nome, prog); }
  } else {
    AP.salvarProgresso(nome, prog);
  }
}

/** Carrega progresso do Firestore (se autenticado) ou localStorage. */
async function carregarProgresso(nome) {
  if (_currentUser) {
    try { return await _lerProgresso(_currentUser.uid); } catch { /* fallback */ }
  }
  return AP.carregarProgresso(nome);
}

/** Salva imagem de perfil no Firebase Storage ou localStorage. */
async function salvarImagemPerfil(nome, dataURL) {
  if (_currentUser) {
    try {
      const r = ref(storage, `perfis/${_currentUser.uid}/avatar.jpg`);
      await uploadString(r, dataURL, 'data_url');
      return;
    } catch { /* fallback */ }
  }
  AP.salvarImagemPerfil(nome, dataURL);
}

/** Carrega URL da imagem de perfil. */
async function carregarImagemPerfil(nome) {
  if (_currentUser) {
    try {
      const r = ref(storage, `perfis/${_currentUser.uid}/avatar.jpg`);
      return await getDownloadURL(r);
    } catch { /* sem foto no Storage */ }
  }
  // Tenta foto do Google
  if (_currentUser && _currentUser.photoURL) return _currentUser.photoURL;
  return AP.carregarImagemPerfil(nome);
}

/** Remove imagem de perfil do Storage. */
async function removerImagemPerfil(nome) {
  if (_currentUser) {
    try {
      await deleteObject(ref(storage, `perfis/${_currentUser.uid}/avatar.jpg`));
    } catch { /* não existia */ }
  }
  AP.removerImagemPerfil(nome);
}

/** Dados do jogador (nome, email). */
async function dadosJogador(nome) {
  if (_currentUser) {
    try {
      const perfil = await _lerPerfil(_currentUser.uid);
      return perfil || AP.dadosJogador(nome);
    } catch { /* fallback */ }
  }
  return AP.dadosJogador(nome);
}

// ── Monitora mudança de estado de autenticação ──────────────────────────────
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    _currentUser = null;
    _nomeUsuario = null;
    return;
  }
  _currentUser = user;
  const perfil = await _lerPerfil(user.uid);
  if (perfil && perfil.nome) {
    _nomeUsuario = perfil.nome;
    // Avisa o initAuth que a sessão Google foi restaurada
    if (window._onFirebaseReady) window._onFirebaseReady(_nomeUsuario);
  }
});

// ── Expõe como FBAuth global ─────────────────────────────────────────────────
window.FBAuth = {
  entrarComGoogle,
  finalizarCadastroGoogle,
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
  processarImagem: AP.processarImagem,  // reutiliza o canvas da Fase 1
  validarNome:     AP.validarNome,
  validarEmail:    AP.validarEmail,
};
