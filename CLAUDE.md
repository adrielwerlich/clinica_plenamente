# CLAUDE.md — Clínica Plenamente (site)

Contexto compartilhado entre chats/sessões (Claude desktop, extensão do VS Code). Atualize o **Log de progresso** a cada passo concluído.

## Projeto
- App React (CRA, React 19, MUI 7, Firebase 12 Auth+Firestore, HashRouter). Site: https://clinicaplenamenteonline.com.br
- Deploy: GitHub Pages a cada push em `master` (.github/workflows/deploy-pages.yml). **Trabalhar em branch; não dar push em master sem decisão do usuário.**
- `npm start` roda em localhost:8877 (o usuário executa npm start/build).
- Nunca abrir/commitar `.env`.

## Integração do jogo de treino cognitivo
- Origem: projeto Unity 6 em D:/UnityProjects/AI-Game-Lab (build WebGL, UI em português). Histórico: DEVELOPMENT_HISTORY.md naquele repo.
- Branch: `feature/jogo-treino-cognitivo`. Rota: `/treino-cognitivo` (iframe em tela cheia).
- Build em `public/games/treino-cognitivo/` (Gzip + decompression fallback; Brotli exigiria Content-Encoding no host). Binários (~62 MB) **não** são commitados sem decisão do usuário (limite de 100 MB por arquivo no GitHub; alternativa: Firebase Hosting).

## Decisões
- Coleta de dados ampla (estilo pesquisa empírica) no Firestore; login do jogador: Google + e-mail/senha + anônimo (sem Facebook por ora).
- Termos de uso no cadastro: dados para o próprio usuário ver e para a clínica acompanhar; consentimento opcional separado para uso agregado/pesquisa (dado de saúde = sensível na LGPD; validar com jurídico).
- Login de jogador deve ser separado do admin (ProtectedRoute exigir claim `admin`; AuthContext sem `admin_user` no localStorage).
- Firebase Unity SDK não suporta WebGL → ponte .jslib para o SDK web.

## Plano (1 commit por passo)
1. [x] Página/rota/menu do jogo (iframe)
2. [x] Separar login de jogador do admin
3. [ ] Login do jogador (Google, e-mail/senha, anônimo) + termos
4. [ ] Coleções e regras do Firestore (proposta revisada pelo usuário antes do código)
5. [ ] Ponte JS (.jslib) no Unity para enviar logs ao Firestore

## Log de progresso
- 2026-11-04: branch criada; passo 1 (rota `/treino-cognitivo`, página, item no menu lateral) implementado; build Unity ainda não copiado.
- 2026-11-04: botão "Treino Cognitivo" adicionado também na navbar fixa (ícone no mobile); build Gzip do Unity copiado para public/games/treino-cognitivo/ (não versionado, aguardando decisão de hospedagem).
- 2026-11-05: navbar na rota `/treino-cognitivo` mostra Início, Feed e Blog e esconde o botão Treino Cognitivo (que segue nas outras rotas). Decidido no AI-Game-Lab: hospedagem do build por GitHub Release baixado no deploy (opção B); ponte pela página React (opção A); login do jogador no site; provedores Google, e-mail/senha e anônimo habilitados no Console. Plano completo: docs/sprints/sprint-1-publicacao-site-firestore-login.md no repo do Unity.
- 2026-11-05: passo 4 do plano do Unity: `src/services/gameBridge.ts` expõe `window.treinoCognitivoBridge` (v1) à página do jogo: estado de login sem uid/e-mail/nome, gravação em `users/{uid}/<colecao>/<doc>` só em coleções permitidas (hoje só `debug`), tempo limite de 15 s, erros só com código curto; `requestSignIn` só aparece quando houver tela de login. Regras do Firestore para `users/` ainda não existem (passo 8: exigir `request.auth.uid == uid` e restringir coleções no servidor).
- 2026-11-05: login anônimo automático na página do jogo (decisão P8) e regra TEMPORÁRIA em firestore.rules para users/{uid}/debug (teste de fumaça). **Deploy bloqueado até o passo 2b** (ProtectedRoute aceita qualquer usuário logado, inclusive anônimo).
- 2026-11-05: passo 2b: admin numa instância própria do Firebase (`adminAuth`/`adminDb`, app 'admin'), sessão separada do jogador; `ProtectedRoute` exige a claim `admin` (com carregamento e aviso de erro); fim do `admin_user` no localStorage; Login recusa conta sem claim e traduz erros; Logout só aparece para admin. Depois do deploy o admin precisa entrar de novo uma vez (sessão antiga ficava na instância padrão). Bloqueio de deploy por causa do anônimo: resolvido; falta o admin testar o login real.
- 2026-11-05: a conta admin não tinha a claim `admin` (o login novo recusou). Script `scripts/admin-claim/set-admin-claim.mjs` (firebase-admin, dependências próprias) concede a claim uma vez com uma chave de serviço guardada fora do repo; `.gitignore` bloqueia chaves de serviço.
