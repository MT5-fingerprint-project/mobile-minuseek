# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v54.0.0/ before writing any code.

> ⚠️ Reste en **SDK 54**. Monter de SDK est hors périmètre : c'est un autre ticket.
>
> L'app se lance de **deux façons**, et les deux restent supportées :
>
> - **Expo Go** — pratique pour du dev UI pur, mais plafonné : l'Expo Go des stores
>   ne charge que les modules natifs qu'Expo embarque déjà.
> - **Development build** (`expo-dev-client`) — notre propre client de dev, qui embarque
>   nos modules natifs. **Obligatoire dès qu'un module natif est ajouté** : caméra custom
>   (B1), contrôles qualité on-device (B2), crypto native (A3).
>
> Concrètement : si ton changement touche au natif, il ne sera **pas** testable dans
> Expo Go. Voir la section « Development build » du README.
>
> ⚠️ **La caméra custom et l'analyse du viseur sont en place.** Cinq dépendances natives :
> `react-native-vision-camera`, `react-native-worklets-core`, `react-native-fast-opencv`,
> `vision-camera-resize-plugin` et `expo-sensors` — frame processors activés. Un development
> build **déjà installé ne les contient pas** : il faut le **recompiler**
> (`pnpm install && rm -rf android && npx expo run:android`), sinon l'écran
> `/capture/[caseId]` plante au montage. Dans Expo Go, le bouton « Prendre une photo »
> retombe sur l'UI caméra système.
>
> ⚠️ **Versions épinglées, pas au choix** : `react-native-fast-opencv` en **0.4.8** — la V1
> n'est testée qu'à partir de RN 0.85 (l'app est en 0.81.5) et a retiré `frameBufferToMat`.
>
> Après toute touche au natif ou à Babel, vérifier **les deux** worklets : le voyant de
> netteté dans le viseur, et la disparition de l'écran de démarrage au lancement. Voir le
> README pour le détail des deux greffons Babel.
