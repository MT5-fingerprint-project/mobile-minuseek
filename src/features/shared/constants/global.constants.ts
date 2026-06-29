import Constants from 'expo-constants';

/**
 * Port du back-minuseek (NestJS). L'API préfixe toutes ses routes par `/api`.
 */
const API_PORT = 3000;

/**
 * URL de base de l'API back-minuseek.
 *
 * Résolution :
 *   1. `EXPO_PUBLIC_API_URL` si défini → override explicite (back distant, staging,
 *      téléphone hors du même réseau via tunnel, etc.).
 *   2. Sinon, on dérive l'hôte depuis celui qui sert Metro (`Constants.expoConfig.hostUri`,
 *      ex. "192.168.43.223:8081"). Le téléphone joint déjà Metro sur cette IP, donc il
 *      joindra le back au même hôte sur le port 3000 — sans IP à coder en dur ni à
 *      ré-éditer quand le réseau change.
 *   3. Fallback `localhost` (simulateur iOS / web).
 */
function resolveApiUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) return fromEnv;

  // hostUri ressemble à "192.168.43.223:8081" — on ne garde que l'hôte.
  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  if (host) return `http://${host}:${API_PORT}/api`;

  return `http://localhost:${API_PORT}/api`;
}

export const API_URL = resolveApiUrl();
