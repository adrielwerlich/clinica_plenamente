# CLAUDE.md — Clínica Plenamente (site)

Contexto compartilhado entre chats/sessões (Claude desktop, extensão do VS Code). Atualize o **Log de progresso** a cada passo concluído, no formato descrito nele.

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

**Como registrar (obrigatório a cada passo concluído):** uma entrada por passo, em ordem cronológica (mais nova no fim), com:
data · branch e hash do commit · o que mudou (arquivos e comportamento) · decisões e o motivo · o que foi verificado e o que
ficou sem verificar · pendências. Tópicos curtos bastam, mas todos os itens precisam aparecer.
Quando passar de ~30 entradas, mover as mais antigas para `docs/HISTORY.md` e deixar aqui um link no lugar delas.

- **2026-11-04 · `feature/jogo-treino-cognitivo` `fbee4ab`** — rota `/treino-cognitivo`, página com iframe e item no menu lateral; build Unity ainda não copiado. (Entrada anterior ao formato atual.)
- **2026-11-04 · `feature/jogo-treino-cognitivo` `88dd1d4`** — botão "Treino Cognitivo" na navbar fixa (ícone no mobile); build Gzip copiado para `public/games/treino-cognitivo/`, não versionado. (Entrada anterior ao formato atual.)

### 2026-11-05 · `feature/jogo-treino-cognitivo` `c878eb3` — navbar na rota do jogo
- **Mudou:** `src/components/Layout/Layout.tsx`: em `/treino-cognitivo` a navbar mostra Início, Feed e Blog e esconde o botão Treino Cognitivo; nas outras rotas o botão continua.
- **Decisões:** pedido do usuário (a rota do jogo tinha ficado só com o botão do jogo). No AI-Game-Lab ficou decidido: build hospedado via GitHub Release baixado no deploy (opção B), ponte pela página React (opção A), login do jogador no site.
- **Verificado:** `tsc` sem erros; navegador em 1280 e 375 px, nas rotas `/treino-cognitivo` e `/blogs`.
- **Sem verificar:** —
- **Pendências:** —

### 2026-11-05 · `feature/jogo-treino-cognitivo` `c729266` — ponte do jogo (`gameBridge`)
- **Mudou:** `src/services/gameBridge.ts` (novo) e `src/pages/Game/TreinoCognitivo.tsx`: a página expõe `window.treinoCognitivoBridge` v1 ao iframe — estado de login sem uid, e-mail ou nome; gravação em `users/{uid}/<colecao>/<doc>` só em coleções permitidas (hoje só `debug`), com limite de 900 KB e tempo limite de 15 s; erros só com código curto; ponte removida ao sair da página.
- **Decisões:** o uid fica só no site, para o jogo não escolher onde grava e não levar dado pessoal para logs. Coleções de treino só depois do aceite dos termos.
- **Verificado:** `tsc`; no navegador, ponte visível de dentro do iframe e gravações inválidas recusadas (`not-signed-in`, `collection-not-allowed`, `invalid-path`, `invalid-data`). Revisão com ressalvas corrigidas.
- **Sem verificar:** comportamento sem rede.
- **Pendências:** regras definitivas de `users/` (exigir `request.auth.uid == uid` e restringir coleções no servidor).

### 2026-11-05 · `feature/jogo-treino-cognitivo` `3dc61c7` — login anônimo automático e regra temporária
- **Mudou:** `gameBridge.ts` faz login anônimo ao abrir a página do jogo (com nova tentativa na próxima gravação se falhar); `firestore.rules` ganhou regra TEMPORÁRIA para `users/{uid}/debug/{doc}` (só o próprio uid, só os campos do ping).
- **Decisões:** decisão do usuário (P8): dados vão ao Firestore no uid anônimo e a conta é vinculada ao mesmo uid no cadastro.
- **Verificado:** `tsc`; teste ponta a ponta com o build do jogo — "logado (anônimo)" e ping gravado no Firestore depois que o usuário publicou a regra; build Gzip testado pelo usuário no celular.
- **Sem verificar:** se recarregar a página mantém o mesmo uid anônimo.
- **Pendências:** remover a regra `debug` e o gatilho de teste quando as regras definitivas entrarem.

### 2026-11-05 · `feature/jogo-treino-cognitivo` `b88e3ca` — login do admin separado do jogador
- **Mudou:** `src/firebase/firebase.ts` (instância `'admin'`: `adminAuth`/`adminDb`), `AuthContext.tsx`, `ProtectedRoute.tsx`, `pages/Admin/Login.tsx`, `Layout.tsx`, `blogService.ts`, `feedService.ts`. Rotas `/admin` exigem a claim `admin`; fim do `admin_user` no localStorage; Login recusa conta sem a claim e mostra erros em português; Logout só para admin.
- **Decisões:** com o anônimo automático, qualquer visitante via as telas de admin; instâncias separadas fazem o login do admin não derrubar a sessão do jogador e o jogador nunca herdar acesso de admin.
- **Verificado:** `tsc`; anônimo redirecionado de `/admin` para `/admin/login`; blog e feed públicos carregam; ping do jogador continua gravando. Revisão com ressalvas corrigidas.
- **Sem verificar:** sem rede com token vencido.
- **Pendências:** depois do deploy o admin entra de novo uma vez (a sessão antiga ficava na instância padrão).

### 2026-11-05 · `feature/jogo-treino-cognitivo` `c142a3f` — script da permissão admin
- **Mudou:** `scripts/admin-claim/` (novo, com dependências próprias): `set-admin-claim.mjs` dá ou tira a claim `admin` de uma conta usando uma chave de serviço; `.gitignore` da raiz e da pasta bloqueiam chaves de serviço.
- **Decisões:** o login do usuário admin foi recusado porque a conta não tinha a claim; o usuário escolheu o script (em vez de uma lista de e-mails no código) por ser o caminho que já bate com `isAdmin()` das regras.
- **Verificado:** `node --check` do script; um arquivo de chave de teste ficou fora do `git status`.
- **Sem verificar:** execução real do script e login do admin (dependem do usuário).
- **Pendências:** usuário rodar o script, apagar a chave e testar `/admin/login`; conferir se as regras publicadas no Console batem com `firestore.rules`.

### 2026-11-05 · `feature/jogo-treino-cognitivo` `503258f` — formato do log
- **Mudou:** `CLAUDE.md`: regra de registro do log (itens obrigatórios e arquivamento em `docs/HISTORY.md` depois de ~30 entradas); entradas de 05/11 reescritas no formato novo.
- **Decisões:** pedido do usuário, para o log servir de continuidade entre sessões.
- **Verificado:** —
- **Sem verificar:** —
- **Pendências:** —

### 2026-11-05 · `feature/jogo-treino-cognitivo` (sem código; registro) — permissão admin concedida
- **Mudou:** nada no código. O usuário rodou `scripts/admin-claim/set-admin-claim.mjs` no projeto `general-backend-ac34e`; a conta admin ficou com a claim `{"admin":true}`.
- **Decisões:** —
- **Verificado:** login em `/admin/login` com a conta admin abriu o Painel administrativo (confirmado pelo usuário com captura); a chave de serviço não está mais na pasta e nunca entrou no git.
- **Sem verificar:** criar/editar post com a sessão nova do admin; se as regras publicadas no Console batem com `firestore.rules`.
- **Pendências:** testar uma edição no blog ou no feed antes do deploy.

### 2026-11-16 · `feature/jogo-treino-cognitivo` (este commit) — passo 2: jogo vem de um GitHub Release no deploy
- **Mudou:** `.github/workflows/deploy-pages.yml`: lê `.github/treino-cognitivo-release` (TAG, ASSET, SHA256), passa a tag ao build como `REACT_APP_TREINO_COGNITIVO_VERSION` e, depois do `npm run build`, baixa o ZIP do Release deste repositório (`gh release download` com `GITHUB_TOKEN`), confere o SHA-256 e extrai em `build/games/treino-cognitivo/`. `.gitignore`: `/public/games/`. `TreinoCognitivo.tsx`: URL do iframe com `?v=<tag>`.
- **Decisões:** opção B (decisão do usuário): o build de ~64 MB não entra no histórico do git; Release no repositório do site para o workflow baixar sem token extra; SHA-256 fixado para o deploy ser reproduzível; `?v=` para o navegador não usar o `index.html` do jogo em cache (o Pages manda cache de 10 min).
- **Verificado:** YAML válido; leitura do arquivo de versão testada (inclusive com CRLF); conferência do SHA-256 e extração simuladas localmente com o ZIP real; build novo (2026-11-16, com a correção das Mandalas) carrega no site local, com e sem `?v=`, e a ponte grava no Firestore. Teste de edição no blog com o admin novo: ok (usuário). Revisão do workflow: aprovada com ressalvas, aplicadas.
- **Sem verificar:** execução real no GitHub Actions (depende do Release existir); site em produção.
- **Pendências:** usuário criar e **publicar** (não rascunho) o Release `treino-cognitivo-2026-11-16` com o asset `TreinoCognitivo_WebGL_2026-11-16_site.zip`; depois merge em `master` e push (com OK do usuário) e conferir o log do Actions e a página em produção no celular e tablet. Teste das contas anônimas em produção fica para depois (usuário).
