import Constants from 'expo-constants';

/**
 * Port du back-minuseek (NestJS). L'API préfixe toutes ses routes par `/api`.
 */
const API_PORT = 3000;

const KEYCLOAK_PORT = 8080;

function metroHost(): string | undefined {
  return Constants.expoConfig?.hostUri?.split(':')[0];
}

/**
 * URL de base de l'API back-minuseek.
 *
 * Résolution : 1. `EXPO_PUBLIC_API_URL` si défini (override explicite : back distant,
 * staging, téléphone hors réseau via tunnel) ; 2. hôte Metro + port 3000 ;
 * 3. fallback `localhost` (simulateur iOS / web).
 */
function resolveApiUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) return fromEnv;

  const host = metroHost();
  if (host) return `http://${host}:${API_PORT}/api`;

  return `http://localhost:${API_PORT}/api`;
}

function resolveKeycloakUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_KEYCLOAK_URL;
  if (fromEnv) return fromEnv;

  const host = metroHost();
  if (host) return `http://${host}:${KEYCLOAK_PORT}`;

  return `http://localhost:${KEYCLOAK_PORT}`;
}

export const API_URL = resolveApiUrl();
export const KEYCLOAK_URL = resolveKeycloakUrl();
