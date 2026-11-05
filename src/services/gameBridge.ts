import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';

// Ponte entre a página /treino-cognitivo e o jogo Unity no iframe (mesma origem).
// Contrato v1 (o lado do jogo está em Assets/Plugins/WebGL/CloudBridge.jslib no repo AI-Game-Lab):
//   subscribeAuth(cb) -> cancelar. cb({ signedIn, isAnonymous, providers }) — sem uid, e-mail ou nome.
//   write(relativePath, data) -> Promise. relativePath = "colecao/documento"; aqui vira users/{uid}/colecao/documento.
//       O id do documento é único por registro (gerado no jogo): regravar o mesmo id é uma nova tentativa segura.
//       Erros rejeitam só com { code } curto, sem caminho nem uid.
//   requestSignIn() -> pede à página para abrir o login. Opcional: sem tela de login, fica ausente
//       e o jogo sabe que não pode pedir.

export type GameAuthState = {
    signedIn: boolean;
    isAnonymous: boolean;
    providers: string[];
};

export type TreinoCognitivoBridge = {
    version: 1;
    subscribeAuth: (cb: (state: GameAuthState) => void) => () => void;
    write: (relativePath: string, data: unknown) => Promise<void>;
    requestSignIn?: () => void;
};

declare global {
    interface Window {
        treinoCognitivoBridge?: TreinoCognitivoBridge;
    }
}

// Coleções que o jogo pode gravar. Cresce a cada módulo modelado (sessões, mandalas...),
// e só depois do aceite dos termos; por enquanto só o teste de fumaça.
// As regras do Firestore (passo 8) também precisam restringir isso no servidor.
const ALLOWED_COLLECTIONS = new Set(['debug']);
const SEGMENT = /^[A-Za-z0-9_-]{1,128}$/;
const MAX_JSON_BYTES = 900_000; // abaixo do limite de 1 MB por documento do Firestore
const WRITE_TIMEOUT_MS = 15_000; // sem rede o setDoc espera o servidor indefinidamente

class BridgeError extends Error {
    constructor(public code: string) {
        super(code);
    }
}

const toState = (user: User | null): GameAuthState => ({
    signedIn: !!user,
    isAnonymous: !!user?.isAnonymous,
    providers: user ? user.providerData.map((p) => p.providerId) : [],
});

const parsePath = (relativePath: string): [string, string] => {
    const parts = typeof relativePath === 'string' ? relativePath.split('/') : [];
    if (parts.length !== 2 || !SEGMENT.test(parts[0]) || !SEGMENT.test(parts[1])) {
        throw new BridgeError('invalid-path');
    }
    if (!ALLOWED_COLLECTIONS.has(parts[0])) throw new BridgeError('collection-not-allowed');
    return [parts[0], parts[1]];
};

const withTimeout = <T,>(promise: Promise<T>, ms: number): Promise<T> =>
    new Promise<T>((resolve, reject) => {
        const timer = setTimeout(() => reject(new BridgeError('timeout')), ms);
        promise.then(
            (value) => { clearTimeout(timer); resolve(value); },
            (error) => { clearTimeout(timer); reject(error); },
        );
    });

/**
 * Instala a ponte em window e devolve a função que a remove (chamar ao desmontar a página).
 * onSignInRequested: abre o login do jogador; sem ele, a ponte não oferece requestSignIn.
 */
export const installGameBridge = (onSignInRequested?: () => void): (() => void) => {
    // Assinaturas de login feitas pelo jogo: canceladas ao sair da página (o iframe some sem avisar).
    const unsubscribers = new Set<() => void>();

    const bridge: TreinoCognitivoBridge = {
        version: 1,

        subscribeAuth: (cb) => {
            const unsubscribe = onAuthStateChanged(auth, (user) => {
                try {
                    cb(toState(user));
                } catch (e) {
                    console.warn('[gameBridge] callback de login do jogo falhou', e);
                }
            });
            unsubscribers.add(unsubscribe);
            return () => {
                unsubscribe();
                unsubscribers.delete(unsubscribe);
            };
        },

        write: async (relativePath, data) => {
            const [collection, id] = parsePath(relativePath);
            if (data === null || typeof data !== 'object' || Array.isArray(data)) throw new BridgeError('invalid-data');
            if (new TextEncoder().encode(JSON.stringify(data)).length > MAX_JSON_BYTES) throw new BridgeError('too-large');
            // Na abertura da página o Firebase ainda pode estar restaurando a sessão salva.
            await auth.authStateReady();
            const user = auth.currentUser;
            if (!user) throw new BridgeError('not-signed-in');
            try {
                await withTimeout(
                    setDoc(doc(db, 'users', user.uid, collection, id), {
                        ...(data as Record<string, unknown>),
                        uploadedAt: serverTimestamp(),
                    }),
                    WRITE_TIMEOUT_MS,
                );
            } catch (e) {
                if (e instanceof BridgeError) throw e;
                // Repassa só o código do Firebase (ex.: permission-denied); a mensagem pode ter o caminho.
                const code = (e as { code?: unknown })?.code;
                throw new BridgeError(typeof code === 'string' ? code.replace(/^firestore\//, '') : 'write-failed');
            }
        },
    };
    if (onSignInRequested) bridge.requestSignIn = () => onSignInRequested();

    window.treinoCognitivoBridge = bridge;
    return () => {
        unsubscribers.forEach((unsubscribe) => unsubscribe());
        unsubscribers.clear();
        if (window.treinoCognitivoBridge === bridge) delete window.treinoCognitivoBridge;
    };
};
