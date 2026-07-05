import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

import { KEYCLOAK_URL } from '@/features/shared/constants/global.constants';

/**
 * Cœur OIDC du login mobile : Authorization Code + PKCE contre le realm Keycloak
 * du tenant (`minuseek-<slug>`), via le client public `minuseek-mobile` (ADR-0005).
 *
 * Miroir du `keycloak.ts` du front web, mais imperatif (pas de hooks) pour que le
 * slug soit choisi au runtime et que `session.ts` / `apiClient` puissent l'appeler
 * hors d'un composant React.
 */

// Ferme proprement l'onglet d'auth au retour dans l'app (no-op sur natif, requis
// sur web — cf. doc expo-auth-session).
WebBrowser.maybeCompleteAuthSession();

const CLIENT_ID = 'minuseek-mobile';
// `offline_access` → refresh token géré par la politique de session offline du realm
// (plafond dur 7 j, ADR-0006), et non par la session SSO courte du web.
const SCOPES = ['openid', 'profile', 'email', 'offline_access'];

/**
 * Redirect natif. En build standalone/dev → `mobileminuseek://…` (scheme d'app.json) ;
 * dans Expo Go → `exp://…`. Les deux sont autorisés côté realm dev ; en déployé seul
 * `mobileminuseek://*` l'est (fail-closed), donc l'auth déployée exige un build natif.
 */
export const AUTH_REDIRECT_URI = AuthSession.makeRedirectUri({
  scheme: 'mobileminuseek',
});

export function realmForSlug(slug: string): string {
  return `minuseek-${slug}`;
}

function issuerForSlug(slug: string): string {
  return `${KEYCLOAK_URL}/realms/${realmForSlug(slug)}`;
}

export type OidcTokens = {
  accessToken: string;
  refreshToken: string | null;
  idToken: string | null;
  /** Epoch (secondes) d'expiration de l'access token, ou null si non fourni. */
  expiresAt: number | null;
};

/** Levée quand l'utilisateur annule ou que le provider renvoie une erreur. */
export class AuthFailedError extends Error {
  constructor(public readonly reason: string) {
    super(`Authentification échouée (${reason})`);
    this.name = 'AuthFailedError';
  }
}

function toTokens(response: AuthSession.TokenResponse): OidcTokens {
  const issuedAt = response.issuedAt ?? Math.floor(Date.now() / 1000);
  const expiresAt =
    response.expiresIn != null ? issuedAt + response.expiresIn : null;
  return {
    accessToken: response.accessToken,
    refreshToken: response.refreshToken ?? null,
    idToken: response.idToken ?? null,
    expiresAt,
  };
}

/**
 * Ouvre le navigateur système sur le realm du tenant, laisse l'utilisateur se
 * connecter (SSO/MFA possibles), puis échange le code d'autorisation contre des tokens.
 * `fetchDiscoveryAsync` résout les endpoints depuis `/.well-known/openid-configuration`.
 */
export async function signInWithSlug(slug: string): Promise<OidcTokens> {
  const discovery = await AuthSession.fetchDiscoveryAsync(issuerForSlug(slug));
  const request = new AuthSession.AuthRequest({
    clientId: CLIENT_ID,
    redirectUri: AUTH_REDIRECT_URI,
    scopes: SCOPES,
    usePKCE: true,
  });

  const result = await request.promptAsync(discovery);
  if (result.type !== 'success' || !result.params.code) {
    throw new AuthFailedError(
      result.type === 'success' ? 'code_manquant' : result.type,
    );
  }

  const tokenResponse = await AuthSession.exchangeCodeAsync(
    {
      clientId: CLIENT_ID,
      code: result.params.code,
      redirectUri: AUTH_REDIRECT_URI,
      // PKCE : le verifier généré par la request prouve qu'on est bien l'initiateur.
      extraParams: request.codeVerifier
        ? { code_verifier: request.codeVerifier }
        : undefined,
    },
    discovery,
  );

  return toTokens(tokenResponse);
}

/** Rafraîchit les tokens à partir d'un refresh token (offline token). */
export async function refreshTokens(
  slug: string,
  refreshToken: string,
): Promise<OidcTokens> {
  const discovery = await AuthSession.fetchDiscoveryAsync(issuerForSlug(slug));
  const tokenResponse = await AuthSession.refreshAsync(
    { clientId: CLIENT_ID, refreshToken },
    discovery,
  );
  return toTokens(tokenResponse);
}

/** Révoque le refresh token côté Keycloak (best-effort, pour le logout). */
export async function revokeRefreshToken(
  slug: string,
  refreshToken: string,
): Promise<void> {
  const discovery = await AuthSession.fetchDiscoveryAsync(issuerForSlug(slug));
  await AuthSession.revokeAsync(
    { clientId: CLIENT_ID, token: refreshToken },
    discovery,
  );
}
