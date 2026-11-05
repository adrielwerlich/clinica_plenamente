import React, { createContext, useContext, useEffect, useState } from 'react';

import { adminAuth } from '../firebase/firebase';
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';

// Login do ADMIN, numa instância própria do Firebase (adminAuth): não compartilha sessão com o
// jogador do Treino Cognitivo, que usa a instância padrão. Admin = claim `admin` no token, a mesma
// que as regras do Firestore exigem (isAdmin()).

type AuthContextType = {
  /** Conta logada na instância do admin (pode ser uma conta sem a claim, antes de ser recusada). */
  adminUser: FirebaseUser | null;
  isAdmin: boolean;
  loading: boolean;
  /** Mensagem quando não foi possível verificar o acesso (ex.: sem conexão). */
  authError: string | null;
  /** Entra com e-mail/senha e devolve se a conta é admin. */
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const hasAdminClaim = async (user: FirebaseUser | null, forceRefresh = false): Promise<boolean> => {
  if (!user || user.isAnonymous) return false;
  const token = await user.getIdTokenResult(forceRefresh);
  return token.claims.admin === true;
};

const CHECK_FAILED = 'Não foi possível verificar o acesso. Confira a conexão e tente de novo.';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminUser, setAdminUser] = useState<FirebaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Versões anteriores guardavam o admin no localStorage; o estado agora vem só do Firebase.
    localStorage.removeItem('admin_user');

    let current = 0;
    const unsub = onAuthStateChanged(adminAuth, async (fbUser) => {
      const call = ++current;
      setLoading(true);
      let admin = false;
      let error: string | null = null;
      try {
        admin = await hasAdminClaim(fbUser);
      } catch (e) {
        console.warn('[auth] não foi possível ler as permissões da conta', (e as { code?: string })?.code);
        error = CHECK_FAILED;
      }
      if (call !== current) return; // chegou outra mudança de login enquanto esperava
      setAdminUser(fbUser);
      setIsAdmin(admin);
      setAuthError(error);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const signIn = async (email: string, password: string) => {
    const credential = await signInWithEmailAndPassword(adminAuth, email, password);
    // Token novo: pega uma claim concedida há pouco. Grava o estado já aqui para a navegação
    // não depender da ordem do onAuthStateChanged.
    const admin = await hasAdminClaim(credential.user, true);
    setAdminUser(credential.user);
    setIsAdmin(admin);
    setAuthError(null);
    setLoading(false);
    return admin;
  };

  const signOut = async () => {
    await firebaseSignOut(adminAuth);
  };

  return (
    <AuthContext.Provider value={{ adminUser, isAdmin, loading, authError, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
