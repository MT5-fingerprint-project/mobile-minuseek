import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import {
  restoreSession,
  signIn as sessionSignIn,
  signOut as sessionSignOut,
} from './session';

/**
 * Pont entre le cœur impératif (`session.ts`) et React : expose l'état d'auth et les
 * actions à l'UI (écran login, auth gate). Miroir de l'`auth-context` du front web.
 */

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type AuthContextValue = {
  status: AuthStatus;
  slug: string | null;
  signIn: (slug: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [slug, setSlug] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    void restoreSession().then((session) => {
      if (!isMounted) {
        return;
      }
      setSlug(session?.slug ?? null);
      setStatus(session ? 'authenticated' : 'unauthenticated');
    });
    return () => {
      isMounted = false;
    };
  }, []);

  async function signIn(targetSlug: string): Promise<void> {
    const session = await sessionSignIn(targetSlug);
    setSlug(session.slug);
    setStatus('authenticated');
  }

  async function signOut(): Promise<void> {
    await sessionSignOut();
    setSlug(null);
    setStatus('unauthenticated');
  }

  return (
    <AuthContext.Provider value={{ status, slug, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
