/**
 * firebase-config.js — Configuração do Firebase (Fase 2)
 *
 * INSTRUÇÕES PASSO A PASSO PARA CONFIGURAR O FIREBASE:
 * =====================================================
 *
 * 1. Acesse https://console.firebase.google.com e faça login com sua conta Google.
 *
 * 2. Clique em "Criar um projeto" → dê um nome (ex.: "memorias-do-espaco") →
 *    desative o Google Analytics se quiser simplificar → clique em "Criar projeto".
 *
 * 3. No menu lateral, clique em "Authentication" → aba "Sign-in method" →
 *    habilite o provedor "Google" → salve.
 *
 * 4. No menu lateral, clique em "Firestore Database" → "Criar banco de dados" →
 *    escolha "Iniciar no modo de teste" (válido por 30 dias) → selecione a
 *    região mais próxima (ex.: southamerica-east1) → clique em "Próximo".
 *
 * 5. No menu lateral, clique em "Storage" → "Começar" → modo de teste → confirme.
 *
 * 6. No menu lateral, clique em "Configurações do projeto" (ícone de engrenagem) →
 *    aba "Geral" → role até "Seus aplicativos" → clique em "</>" (Web) →
 *    dê um apelido (ex.: "atlas-web") → NÃO marque Firebase Hosting ainda →
 *    clique em "Registrar app".
 *
 * 7. O Firebase mostrará um objeto de configuração. Copie os valores para as
 *    constantes abaixo substituindo os placeholders.
 *
 * 8. SERVIDOR LOCAL (necessário para o Google Sign-In funcionar):
 *    - Instale: npm install -g serve
 *    - Execute: serve c:\Users\danii\orbitmatter\OrbitMatter
 *    - Acesse: http://localhost:3000
 *    - OU use: python -m http.server 8000 (acessar http://localhost:8000)
 *
 * 9. No console Firebase → Authentication → Domínios autorizados →
 *    adicione "localhost" (já deve estar lá por padrão).
 *
 * 10. Para publicar com Firebase Hosting:
 *     - npm install -g firebase-tools
 *     - firebase login
 *     - firebase init hosting (aponte para a pasta OrbitMatter)
 *     - firebase deploy
 *
 * REGRAS DO FIRESTORE (cole em Firestore → Regras):
 * --------------------------------------------------
 * rules_version = '2';
 * service cloud.firestore {
 *   match /databases/{database}/documents {
 *     match /jogadores/{uid}/{document=**} {
 *       allow read, write: if request.auth != null && request.auth.uid == uid;
 *     }
 *   }
 * }
 *
 * REGRAS DO STORAGE (cole em Storage → Regras):
 * -----------------------------------------------
 * rules_version = '2';
 * service firebase.storage {
 *   match /b/{bucket}/o {
 *     match /perfis/{uid}/{allPaths=**} {
 *       allow read, write: if request.auth != null && request.auth.uid == uid;
 *     }
 *   }
 * }
 */

// Configuração do projeto Firebase conectado à aplicação.
window.FIREBASE_CONFIG = {
  apiKey:            "AIzaSyBYtXbTSrJFZCzfxZOLEjfLMxhWnO1QvoI",
  authDomain:        "atlas-lixo-espacial.firebaseapp.com",
  projectId:         "atlas-lixo-espacial",
  storageBucket:     "atlas-lixo-espacial.firebasestorage.app",
  messagingSenderId: "1003952579714",
  appId:             "1:1003952579714:web:3f6f05b5e747f56b11809b",
};

/*
 * COMO USAR NA FASE 2:
 * --------------------
 * 1. Adicione no HTML (antes de auth-progresso.js):
 *      <script src="firebase-config.js"></script>
 *      <script type="module" src="firebase-app.js"></script>
 *
 * 2. Crie firebase-app.js que importa os SDKs e reimplementa as funções
 *    de AP (criarJogador, entrar, sair, sessaoAtiva, salvarProgresso, etc.)
 *    usando firebase/auth (GoogleAuthProvider) e firebase/firestore.
 *
 * 3. O resto do jogo (HTML + atlas.css + código do modal) NÃO precisa mudar.
 */
