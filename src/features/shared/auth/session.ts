import {
  OidcTokens,
  refreshTokens,
  revokeRefreshToken,
  signInWithSlug,
} from './oidc';
import {
  clearSession,
  loadSession,
  saveSession,
  StoredSession,
} from './session-store';

/**
 * Orchestration de la session : point d'entrée impératif consommé par l'écran de
 * login, l'auth gate et l'interceptor `apiClient`. Garde une copie en mémoire pour
 * éviter un accès secure-store à chaque requête.
 */

// Marge avant expiration : on rafraîchit un peu avant l'échéance (comme le web).
const EXPIRY_MARGIN_SECONDS = 30;

let activeSession: StoredSession | null = null;

export function getActiveSession(): StoredSession | null {
  return activeSession;
}

function nowSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

function isAccessTokenExpired(session: StoredSession): boolean {
  if (session.expiresAt == null) {
    return true;
  }
  return nowSeconds() >= session.expiresAt - EXPIRY_MARGIN_SECONDS;
}

function toStoredSession(
  slug: string,
  tokens: OidcTokens,
  previousRefreshToken: string | null,
): StoredSession {
  return {
    slug,
    accessToken: tokens.accessToken,
    // Keycloak peut renvoyer un nouveau refresh token (rotation) ou aucun : on
    // conserve l'ancien dans ce dernier cas.
    refreshToken: tokens.refreshToken ?? previousRefreshToken,
    idToken: tokens.idToken,
    expiresAt: tokens.expiresAt,
  };
}

/** Restaure la session depuis le stockage sécurisé (au démarrage de l'app). */
export async function restoreSession(): Promise<StoredSession | null> {
  activeSession = await loadSession();
  return activeSession;
}

/** Login interactif sur le realm du tenant. */
export async function signIn(slug: string): Promise<StoredSession> {
  const tokens = await signInWithSlug(slug);
  activeSession = toStoredSession(slug, tokens, null);
  await saveSession(activeSession);
  return activeSession;
}

/** Déconnexion : purge locale immédiate, révocation best-effort côté Keycloak. */
export async function signOut(): Promise<void> {
  const endingSession = activeSession;
  activeSession = null;
  await clearSession();
  if (endingSession?.refreshToken) {
    try {
      await revokeRefreshToken(
        endingSession.slug,
        endingSession.refreshToken,
      );
    } catch {
      // Best-effort : la session locale est déjà purgée.
    }
  }
}

/**
 * Renvoie un access token valide, en rafraîchissant si nécessaire. Renvoie null si
 * aucune session ou si le refresh échoue (session alors purgée → retour au login).
 */
export async function getValidAccessToken(): Promise<string | null> {
  if (!activeSession) {
    return null;
  }
  if (!isAccessTokenExpired(activeSession)) {
    return activeSession.accessToken;
  }
  if (!activeSession.refreshToken) {
    await signOut();
    return null;
  }
  try {
    const tokens = await refreshTokens(
      activeSession.slug,
      activeSession.refreshToken,
    );
    activeSession = toStoredSession(
      activeSession.slug,
      tokens,
      activeSession.refreshToken,
    );
    await saveSession(activeSession);
    return activeSession.accessToken;
  } catch {
    await signOut();
    return null;
  }
}
