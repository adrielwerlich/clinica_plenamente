// Dá (ou tira) a permissão `admin` de uma conta do Firebase Auth. Rodar uma vez, localmente.
// As regras do Firestore (isAdmin()) e a rota /admin do site exigem essa permissão (claim).
//
// Uso (dentro de scripts/admin-claim):
//   npm install
//   node set-admin-claim.mjs --key CAMINHO/DA/CHAVE.json --email voce@exemplo.com
//   node set-admin-claim.mjs --key CAMINHO/DA/CHAVE.json --email voce@exemplo.com --remove
//
// A chave de serviço dá acesso total ao projeto: guarde FORA do repositório e apague depois de usar.

import { readFileSync } from 'node:fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const args = process.argv.slice(2);
const option = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};

const keyPath = option('--key');
const email = option('--email');
const remove = args.includes('--remove');

if (!keyPath || !email) {
  console.error('Uso: node set-admin-claim.mjs --key CHAVE.json --email voce@exemplo.com [--remove]');
  process.exit(1);
}

let serviceAccount;
try {
  serviceAccount = JSON.parse(readFileSync(keyPath, 'utf8'));
} catch (e) {
  console.error('Não consegui ler a chave em', keyPath, '-', e.message);
  process.exit(1);
}

initializeApp({ credential: cert(serviceAccount) });
const auth = getAuth();

try {
  const user = await auth.getUserByEmail(email);
  // Mantém as outras claims que a conta já tenha.
  const claims = { ...(user.customClaims || {}) };
  if (remove) delete claims.admin;
  else claims.admin = true;
  await auth.setCustomUserClaims(user.uid, claims);

  const updated = await auth.getUser(user.uid);
  console.log(`Projeto: ${serviceAccount.project_id}`);
  console.log(`Conta:   ${email}`);
  console.log(`Claims:  ${JSON.stringify(updated.customClaims || {})}`);
  console.log(remove
    ? 'Permissão admin removida.'
    : 'Permissão admin concedida. Entre de novo em /admin/login para o token novo valer.');
  console.log('Agora apague a chave de serviço do seu computador.');
} catch (e) {
  console.error('Falhou:', e.code || e.message);
  process.exit(1);
}
