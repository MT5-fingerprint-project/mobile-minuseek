import * as Linking from 'expo-linking'

import { AUTH_REDIRECT_URI } from '@/features/shared/auth/oidc'

/**
 * Filtre les URLs entrantes **avant** qu'expo-router ne navigue dessus.
 *
 * ⚠️ Sans ce fichier, le login Keycloak se termine sur « Unmatched Route ».
 *
 * Sur Android — et seulement là — `WebBrowser.openAuthSessionAsync` n'a pas
 * d'implémentation native (`_authSessionIsNativelySupported()` vaut `Platform.OS !== 'android'`) :
 * il ouvre un Chrome Custom Tab et attend le retour avec `Linking.addEventListener('url')`.
 * Le `redirect_uri` du realm, `mobileminuseek://auth?code=…&state=…`, entre donc dans l'app
 * comme un deep link ordinaire. Sur iOS, `ASWebAuthenticationSession` capture ce retour dans
 * la session et ne le diffuse jamais dans `Linking` : le problème n'y existe pas.
 *
 * Or expo-router écoute **le même** évènement et navigue vers le chemin parsé, ici `/auth` —
 * une route qui n'existe pas, d'où son écran de secours. Les deux abonnés sont indépendants :
 * ignorer l'URL ici n'empêche pas `expo-auth-session` de recevoir le code et de faire
 * l'échange PKCE. On rend donc une chaîne vide, qu'expo-router traite comme « ne navigue pas »
 * (`if (href) listener(href)`, `expo-router/build/link/linking.js`).
 *
 * Ne pas remplacer ce filtre par une route `app/auth.tsx` : elle apparaîtrait dans le sitemap
 * et laisserait passer un écran vide le temps de la redirection.
 */
export function redirectSystemPath({ path, initial }: { path: string; initial: boolean }): string {
  // Même prédicat que celui d'expo-web-browser sur ce retour (`event.url.startsWith(returnUrl)`),
  // et une seule source de vérité pour l'URI : tout autre deep link continue sa route.
  if (!path.startsWith(AUTH_REDIRECT_URI)) {
    return path
  }

  // Démarrage à froid sur le callback (l'app a été tuée pendant que le Custom Tab était au
  // premier plan) : plus personne n'attend ce code, et le verifier PKCE est perdu avec le
  // processus. On ouvre l'app normalement, l'auth gate renverra sur l'écran de login.
  return initial ? Linking.createURL('/') : ''
}
