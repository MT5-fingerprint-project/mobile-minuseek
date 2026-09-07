module.exports = function (api) {
  api.cache(true)
  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],
    // Frame processors de la caméra (L3-4). VisionCamera v4 attend le runtime
    // `react-native-worklets-core`, dont c'est ici le greffon.
    //
    // ⚠️ En pratique ce greffon ne transforme rien : `babel-preset-expo` injecte d'office
    // celui de Reanimated 4 dès que `react-native-worklets` est installé, et celui-ci
    // consomme la directive `'worklet'` en premier — sortie compilée strictement identique
    // avec ou sans la ligne ci-dessous (vérifié). On le déclare quand même pour rendre la
    // dépendance explicite et ne pas dépendre d'un ordre d'injection qu'on ne maîtrise pas.
    // Ça fonctionne parce que worklets-core relit le format de Reanimated — `__closure` +
    // `__initData.code` — via son mode de compatibilité `_isRea30Compat`.
    plugins: ['react-native-worklets-core/plugin'],
  }
}
