# mobile-minuseek

Application mobile (iOS / Android / web) de Minuseek, construite avec
[Expo](https://docs.expo.dev/) (SDK 54) et [Expo Router](https://docs.expo.dev/router/introduction).
Elle consomme l'API de `back-minuseek` et reprend les conventions UI de `front-minuseek`
(mêmes tokens de design, mêmes features).

> ⚠️ Reste en **SDK 54** : l'Expo Go publié sur les stores plafonne à SDK 54. Avant
> d'écrire du code, se référer à la doc versionnée :
> https://docs.expo.dev/versions/v54.0.0/

## Prérequis

- **Node.js** 22 (la CI tourne sur 22)
- **pnpm** 11 (le repo utilise `pnpm-lock.yaml` + `.npmrc` en `node-linker=hoisted`)
- **back-minuseek** lancé et accessible (voir [Variables d'environnement](#variables-denvironnement))
- Selon le mode de lancement (voir ci-dessous) : l'app **Expo Go** sur un téléphone,
  ou **Android Studio** / **Xcode** pour compiler un development build
- Pour les builds EAS : un compte [expo.dev](https://expo.dev) (gratuit) et `eas-cli`
  (utilisable via `npx eas-cli@latest`, aucune installation globale requise)

## Démarrage

1. Installer les dépendances

   ```bash
   pnpm install
   ```

2. Configurer l'environnement : créer un fichier `.env` à la racine (voir section ci-dessous).

3. Choisir un mode de lancement — **c'est le point important** :

   | Mode                  | Quand l'utiliser                                         | Coût                 |
   | --------------------- | -------------------------------------------------------- | -------------------- |
   | **Expo Go**           | dev UI pur : écrans, styles, navigation, appels API      | 0 €, rien à compiler |
   | **Development build** | **dès que du natif est en jeu** (caméra, crypto native…) | 0 € en build local   |

   Expo Go ne peut charger que les modules natifs qu'Expo embarque déjà. Si tu ajoutes
   une dépendance avec du code natif, elle **n'existera pas** dans Expo Go — il faut un
   development build. Voir [Development build](#development-build).

   ```bash
   pnpm start          # = expo start, puis choisir la plateforme dans le terminal
   ```

   Ou directement sur une plateforme :

   ```bash
   pnpm ios            # simulateur iOS
   pnpm android        # émulateur Android
   pnpm web            # navigateur
   ```

4. Lint

   ```bash
   pnpm lint
   ```

## Development build

Le development build est **notre propre client de dev** : un Expo Go maison qui embarque
nos modules natifs. Une fois installé sur l'appareil, il se connecte à `pnpm start`
exactement comme le faisait Expo Go.

### 1. Lier le projet à un compte Expo (une seule fois, par un humain)

`eas init` ouvre un navigateur pour s'authentifier — cette étape ne peut pas être
automatisée.

```bash
npx eas-cli@latest login
npx eas-cli@latest init     # renseigne extra.eas.projectId + owner dans app.json
```

> Tant que ce n'est pas fait, `app.json` contient les placeholders `TODO_EAS_INIT` et
> les commandes `eas build` échoueront.

### 2. Build local — le chemin recommandé (gratuit, illimité)

```bash
npx expo run:android        # nécessite Android Studio
npx expo run:ios            # nécessite Xcode (macOS) — simulateur
```

Aucun quota, aucune file d'attente, aucun compte Apple. C'est le chemin par défaut.

### 3. Build cloud EAS

Utile pour distribuer un binaire à quelqu'un qui n'a pas la toolchain native.
Consomme le quota mensuel du free tier et passe par une file d'attente.

```bash
npx eas-cli@latest build --profile development --platform android   # APK
npx eas-cli@latest build --profile development --platform ios       # simulateur
```

Profils définis dans `eas.json` :

| Profil               | Usage                                                           |
| -------------------- | --------------------------------------------------------------- |
| `development`        | dev client — APK Android, simulateur iOS, **sans compte Apple** |
| `development-device` | dev client sur **iPhone physique** — exige un compte Apple      |
| `preview`            | build interne de recette (APK)                                  |
| `production`         | build de publication (AAB Android), `autoIncrement` activé      |

### 4. iPhone physique — le seul point payant

Tester sur un iPhone réel via EAS exige un compte **Apple Developer (99 $/an)** :

```bash
npx eas-cli@latest device:create
npx eas-cli@latest build --profile development-device --platform ios
```

Sans ce compte, contournement gratuit : ouvrir le projet dans Xcode et signer avec un
Apple ID personnel — la signature est valable **7 jours**, à renouveler.
Android et le simulateur iOS ne sont pas concernés.

### Versioning

`eas.json` utilise `appVersionSource: "remote"` : les numéros de build sont gérés par
EAS côté serveur et `autoIncrement` est activé sur le profil `production`.
**Ne pas incrémenter à la main.** Pour fixer un point de départ :

```bash
npx eas-cli@latest build:version:set --platform android
```

Le champ `version` d'`app.json` reste la version _marketing_, gérée manuellement.

## Variables d'environnement

La config se fait via un fichier **`.env`** à la racine de `mobile-minuseek`.
Seules les variables préfixées par `EXPO_PUBLIC_` sont exposées au code de l'app
(convention Expo) et sont lues via `process.env.EXPO_PUBLIC_*`.

**En général, aucune config n'est nécessaire.** L'URL de l'API est résolue dans
`src/features/shared/constants/global.constants.ts` ainsi :

1. `EXPO_PUBLIC_API_URL` si défini → override explicite ;
2. sinon, l'hôte est **auto-détecté** depuis celui qui sert Metro
   (`Constants.expoConfig.hostUri`, l'IP de ton ordi) → `http://<host>:3000/api`.
   Le téléphone joint déjà Metro sur cette IP, donc il joint le back au même endroit ;
3. sinon, fallback `http://localhost:3000/api` (simulateur iOS / web).

Conséquence : sur le **même WiFi** qu'une session `expo start`, un téléphone physique
charge les données **sans rien renseigner**.

| Variable              | Requis | Description                                                                                                                                                                           |
| --------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `EXPO_PUBLIC_API_URL` | non    | Force l'URL de base de l'API. **Doit se terminer par `/api`**. À utiliser uniquement pour un back distant / staging, ou un téléphone hors du même réseau (via `expo start --tunnel`). |

Exemple d'override dans `.env` :

```bash
EXPO_PUBLIC_API_URL=http://192.168.1.10:3000/api
```

> Le back-minuseek écoute sur le port `3000` (et sur toutes les interfaces : aucune
> config réseau côté back n'est requise pour qu'un téléphone du même WiFi l'atteigne).

> Note : les variables `EXPO_PUBLIC_*` sont **inlinées dans le bundle** au build —
> n'y mettre aucun secret. Après modification du `.env`, relancer avec `expo start -c`.

## Architecture

### Stack technique

- **Expo SDK 54** + **React Native 0.81** (React 19)
- **Expo Router** — routing par fichiers (`src/app/`)
- **NativeWind 4** (Tailwind CSS pour React Native) — styling par `className`
- **TanStack Query** — récupération / cache des données serveur
- **TanStack Form** + **Zod** — formulaires et validation
- **Axios** — client HTTP

### Organisation des dossiers

```
src/
├── app/                      # Routes Expo Router (file-based routing)
│   ├── _layout.tsx           #   Layout racine : providers (QueryClient, SafeArea,
│   │                         #   GestureHandler, ThemeProvider) + tabs natives
│   ├── index.tsx             #   Onglet "Home" → liste des affaires
│   └── explore.tsx           #   Onglet "Explore"
│
├── components/               # Composants transverses (tabs, splash, themed-*, …)
│   └── ui/                   #   Primitives UI génériques
│
├── constants/
│   └── theme.ts              # Palette de couleurs par color-scheme (light/dark)
│
├── hooks/                    # Hooks transverses (use-color-scheme, use-theme, …)
│
├── features/                 # Code métier, découpé par domaine (mirroir du front)
│   ├── investigation-case/   #   Domaine "affaires d'investigation"
│   │   ├── components/        #     UI : Card, List, StatusBadge, CreateForm, CreateModal
│   │   ├── hooks/             #     useInvestigationCases (query) + useCreateInvestigationCase
│   │   ├── services/          #     InvestigationCaseAPI (appels axios)
│   │   ├── types/             #     Types + schémas Zod
│   │   └── index.ts           #     Point d'entrée public du feature (barrel export)
│   │
│   └── shared/               #   Briques partagées entre features
│       ├── constants/         #     global.constants (API_URL)
│       ├── lib/               #     apiClient (axios), utils (cn)
│       └── ui/                #     Primitives stylées : Button, Input, Text, Field, …
│
└── global.css                # Directives Tailwind importées dans le layout racine
```

### Conventions

- **Alias d'import** : `@/*` → `src/*` (configuré dans `tsconfig.json`), ex.
  `import { Button } from '@/features/shared/ui/button'`.
- **Découpage par feature** : chaque domaine de `features/` est autonome
  (components / hooks / services / types) et expose son API publique via son `index.ts`.
  Cette structure reflète volontairement celle de `front-minuseek` pour garder les
  deux codebases cohérentes.
- **Styling** : NativeWind (`className`). Les tokens de couleur (`tailwind.config.js`)
  sont alignés sur ceux du front (`front-minuseek/src/assets/css/index.css`), valeurs
  oklch converties en hex pour React Native.
- **Données serveur** : toujours via TanStack Query + le service du feature ; ne pas
  appeler `apiClient` directement depuis un composant.

### Couche réseau

`features/shared/lib/apiClient.ts` expose une instance axios partagée dont la `baseURL`
vient de `EXPO_PUBLIC_API_URL` (via `features/shared/constants/global.constants.ts`).

> Auth : le front web lit l'`accessToken` depuis `localStorage`, indisponible en React
> Native. L'injection de token est laissée en point d'extension (à brancher sur
> `expo-secure-store` quand un flux d'auth existera). Les requêtes sont pour l'instant
> non authentifiées.

## En savoir plus

- [Documentation Expo (SDK 54)](https://docs.expo.dev/versions/v54.0.0/)
- [Expo Router](https://docs.expo.dev/router/introduction)
- [NativeWind](https://www.nativewind.dev/)
- [TanStack Query](https://tanstack.com/query/latest)
