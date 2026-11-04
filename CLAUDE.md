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
2. [ ] Separar login de jogador do admin
3. [ ] Login do jogador (Google, e-mail/senha, anônimo) + termos
4. [ ] Coleções e regras do Firestore (proposta revisada pelo usuário antes do código)
5. [ ] Ponte JS (.jslib) no Unity para enviar logs ao Firestore

## Log de progresso
- 2026-11-04: branch criada; passo 1 (rota `/treino-cognitivo`, página, item no menu lateral) implementado; build Unity ainda não copiado.
