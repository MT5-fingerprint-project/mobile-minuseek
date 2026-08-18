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
> ⚠️ **La caméra custom (B1) est en place** : `react-native-vision-camera` est désormais
> une dépendance native de l'app. Un development build **déjà installé ne la contient pas**
> — il faut le **recompiler** (`pnpm install && rm -rf android && npx expo run:android`),
> sinon l'écran `/capture/[caseId]` plante au montage. Dans Expo Go, le bouton
> « Prendre une photo » retombe sur l'UI caméra système.
