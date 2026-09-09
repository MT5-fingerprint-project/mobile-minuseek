import Constants from 'expo-constants'

/**
 * Port du back-minuseek (NestJS). L'API préfixe toutes ses routes par `/api`.
 */
const API_PORT = 3000

const KEYCLOAK_PORT = 8080

/**
 * Les deux variables de build dont dépend l'application. Exportées pour que les
 * messages d'erreur citent le nom exact à renseigner.
 */
export const API_URL_VAR = 'EXPO_PUBLIC_API_URL'
export const KEYCLOAK_URL_VAR = 'EXPO_PUBLIC_KEYCLOAK_URL'

export type EnvironmentInput = {
  apiUrl: string | undefined
  keycloakUrl: string | undefined
  /** Hôte qui sert Metro : absent dans un build autonome, où il n'y a pas de Metro. */
  metroHost: string | undefined
  /** `__DEV__` : faux dans un build release, où aucun repli n'est toléré. */
  isDev: boolean
}

export type EnvironmentResolution = { ok: true; apiUrl: string; keycloakUrl: string } | { ok: false; error: string }

type ValueResolution = { ok: true; value: string } | { ok: false; error: string }

const ABSOLUTE_URL = /^https?:\/\/[^\s/]+/
const HTTPS_URL = /^https:\/\/[^\s/]+/

function malformed(name: string, value: string, why: string): string {
  return `${name} est invalide (« ${value} ») : ${why}.`
}

function checkScheme(name: string, value: string, isDev: boolean): string | null {
  if (!ABSOLUTE_URL.test(value)) {
    return malformed(name, value, 'une URL absolue est attendue, par exemple https://exemple.fr')
  }
  // Hors développement, le HTTP en clair est de toute façon bloqué par Android et iOS :
  // autant le dire ici plutôt que de laisser l'app échouer sur un timeout réseau muet.
  if (!isDev && !HTTPS_URL.test(value)) {
    return malformed(name, value, 'un build de production exige HTTPS')
  }
  return null
}

function checkApiUrl(value: string, isDev: boolean): string | null {
  const scheme = checkScheme(API_URL_VAR, value, isDev)
  if (scheme) {
    return scheme
  }
  return value.endsWith('/api')
    ? null
    : malformed(API_URL_VAR, value, 'l’URL doit se terminer par « /api », le back préfixant toutes ses routes')
}

function checkKeycloakUrl(value: string, isDev: boolean): string | null {
  const scheme = checkScheme(KEYCLOAK_URL_VAR, value, isDev)
  if (scheme) {
    return scheme
  }
  // L'émetteur OIDC est construit par concaténation (`${KEYCLOAK_URL}/realms/...`) :
  // une barre oblique finale produit un `//realms` que Keycloak ne reconnaît pas.
  return value.endsWith('/') ? malformed(KEYCLOAK_URL_VAR, value, 'l’URL ne doit pas se terminer par « / »') : null
}

function missing(name: string): string {
  return (
    `${name} n’est pas définie. Ce build autonome ne connaît aucun environnement : ` +
    `renseigner ${name} dans le fichier .env de la machine qui compile, puis reconstruire l’application.`
  )
}

function resolveValue(
  name: string,
  fromEnv: string | undefined,
  isDev: boolean,
  devFallback: () => string,
  check: (value: string, isDev: boolean) => string | null
): ValueResolution {
  const value = fromEnv?.trim()
  if (value) {
    const error = check(value, isDev)
    return error ? { ok: false, error } : { ok: true, value }
  }
  return isDev ? { ok: true, value: devFallback() } : { ok: false, error: missing(name) }
}

/**
 * Résolution des deux URL, en fonction pure pour être testable.
 *
 * En développement, rien n'est requis : l'hôte est déduit de celui qui sert Metro
 * (le téléphone joint déjà Metro sur cette adresse, donc il joint le back au même
 * endroit), avec `localhost` pour le simulateur. Les variables restent un override.
 *
 * Dans un build autonome, il n'y a pas de Metro : les deux variables sont
 * **obligatoires** et il n'existe aucun repli. Retomber sur `localhost` produirait une
 * application installée qui interroge le téléphone lui-même — la panne d'aujourd'hui.
 */
export function resolveEnvironment(input: EnvironmentInput): EnvironmentResolution {
  const host = input.metroHost ?? 'localhost'

  const api = resolveValue(API_URL_VAR, input.apiUrl, input.isDev, () => `http://${host}:${API_PORT}/api`, checkApiUrl)
  const keycloak = resolveValue(
    KEYCLOAK_URL_VAR,
    input.keycloakUrl,
    input.isDev,
    () => `http://${host}:${KEYCLOAK_PORT}`,
    checkKeycloakUrl
  )

  if (!api.ok || !keycloak.ok) {
    const errors = [api.ok ? null : api.error, keycloak.ok ? null : keycloak.error]
    return { ok: false, error: errors.filter((error): error is string => error !== null).join('\n\n') }
  }

  return { ok: true, apiUrl: api.value, keycloakUrl: keycloak.value }
}

// `process.env.EXPO_PUBLIC_*` est remplacé par sa valeur littérale à la compilation du
// bundle : les deux accès ci-dessous doivent rester écrits en toutes lettres.
const resolution = resolveEnvironment({
  apiUrl: process.env.EXPO_PUBLIC_API_URL,
  keycloakUrl: process.env.EXPO_PUBLIC_KEYCLOAK_URL,
  metroHost: Constants.expoConfig?.hostUri?.split(':')[0],
  isDev: __DEV__,
})

/**
 * Message d'échec de configuration, ou `null` si l'environnement est exploitable.
 * `src/app/_layout.tsx` s'en sert pour bloquer le démarrage sur un écran lisible.
 */
export const ENVIRONMENT_ERROR = resolution.ok ? null : resolution.error

export const API_URL = resolution.ok ? resolution.apiUrl : ''
export const KEYCLOAK_URL = resolution.ok ? resolution.keycloakUrl : ''

if (ENVIRONMENT_ERROR) {
  // Visible dans Metro en développement, dans `adb logcat` sur un build installé.
  console.error(`[config] ${ENVIRONMENT_ERROR}`)
}
