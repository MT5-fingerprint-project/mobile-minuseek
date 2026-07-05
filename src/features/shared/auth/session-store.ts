import * as SecureStore from 'expo-secure-store';

/**
 * Persistance de la session dans le stockage sécurisé natif (Keychain iOS /
 * Keystore Android). Web non supporté par `expo-secure-store` — l'app cible le natif.
 */

const SESSION_KEY = 'minuseek.session';

export type StoredSession = {
  slug: string;
  accessToken: string;
  refreshToken: string | null;
  idToken: string | null;
  /** Epoch (secondes) d'expiration de l'access token, ou null si inconnu. */
  expiresAt: number | null;
};

export async function saveSession(session: StoredSession): Promise<void> {
  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
}

export async function loadSession(): Promise<StoredSession | null> {
  const raw = await SecureStore.getItemAsync(SESSION_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as StoredSession;
  } catch {
    // Valeur corrompue : on repart propre plutôt que de planter au démarrage.
    await SecureStore.deleteItemAsync(SESSION_KEY);
    return null;
  }
}

export async function clearSession(): Promise<void> {
  await SecureStore.deleteItemAsync(SESSION_KEY);
}
