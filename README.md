# mobile-minuseek

Application mobile (iOS / Android / web) de Minuseek, construite avec
[Expo](https://docs.expo.dev/) (SDK 54) et [Expo Router](https://docs.expo.dev/router/introduction).
Elle consomme l'API de `back-minuseek` et reprend les conventions UI de `front-minuseek`
(mêmes tokens de design, mêmes features).

> ⚠️ Reste en **SDK 54** : l'app cible Expo Go, dont la version publiée sur les stores
> plafonne à SDK 54. Avant d'écrire du code, se référer à la doc versionnée :
> https://docs.expo.dev/versions/v54.0.0/

## Prérequis

- **Node.js** ≥ 20
- **pnpm** (le repo utilise `pnpm-lock.yaml` + `.npmrc` en `node-linker=hoisted`)
- **back-minuseek** lancé et accessible (voir [Variables d'environnement](#variables-denvironnement))
- Pour le natif : un simulateur iOS (Xcode) et/ou un émulateur Android (Android Studio),
  ou l'app **Expo Go** sur un téléphone physique

## Démarrage

1. Installer les dépendances

   ```bash
   pnpm install
   ```

2. Configurer l'environnement : créer un fichier `.env` à la racine (voir section ci-dessous).

3. Lancer le serveur de développement

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

| Variable               | Requis | Description                                                                 |
| ---------------------- | ------ | --------------------------------------------------------------------------- |
| `EXPO_PUBLIC_API_URL`  | non    | Force l'URL de base de l'API. **Doit se terminer par `/api`**. À utiliser uniquement pour un back distant / staging, ou un téléphone hors du même réseau (via `expo start --tunnel`). |

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
