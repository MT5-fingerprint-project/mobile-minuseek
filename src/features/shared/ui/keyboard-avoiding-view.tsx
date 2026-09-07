import * as React from 'react'
import { Keyboard, KeyboardAvoidingView as RNKeyboardAvoidingView, Platform, View } from 'react-native'

/**
 * Réserve sous son contenu la hauteur du clavier, pour qu'un formulaire ne passe jamais
 * dessous. Remplace `KeyboardAvoidingView` de React Native **à cause d'Android**.
 *
 * ## Pourquoi le composant de RN ne suffit pas ici
 *
 * L'app est en edge-to-edge (`edgeToEdgeEnabled=true` dans `android/gradle.properties`,
 * défaut d'Expo SDK 54, et de toute façon imposé par Android 15). En edge-to-edge, la fenêtre
 * n'est plus redimensionnée : `android:windowSoftInputMode="adjustResize"` du manifeste
 * n'a plus d'effet, l'app dessine derrière le clavier.
 *
 * Or `KeyboardAvoidingView` de RN calcule sa marge avec `frame.y + frame.height - screenY`,
 * où `screenY` vient de l'évènement clavier. Côté natif (`ReactRootView.checkForKeyboardEvents`),
 * `screenY` vaut `getWindowVisibleDisplayFrame().bottom` — le bas de la fenêtre *visible*, qui
 * ne rétrécit plus quand la fenêtre n'est pas redimensionnée. La marge calculée tombe à zéro,
 * et le composant ne fait rien. C'est pour ça que les formulaires passaient sous le clavier.
 *
 * En revanche `endCoordinates.height` du même évènement est juste : le natif la calcule à
 * partir des insets (`imeInsets.bottom - barInsets.bottom`), la même source que les
 * bibliothèques dédiées. On n'utilise donc que cette hauteur, et on pose la marge nous-mêmes.
 *
 * ## Ce que le composant attend de ses appelants
 *
 * La hauteur rendue **exclut la barre de navigation** (le natif la soustrait déjà). Le contenu
 * doit donc continuer à réserver son inset bas habituel (`useSafeAreaInsets().bottom`) : les
 * deux s'additionnent pour retomber sur la hauteur réelle occupée par le clavier. Corollaire :
 * ne pas poser de `paddingBottom` sur ce conteneur-ci, il est écrasé.
 *
 * Sur iOS, l'implémentation de RN est correcte (ses frames et `screenY` sont cohérents) et
 * s'anime avec le clavier : on la garde telle quelle.
 */
type KeyboardAvoidingViewProps = React.ComponentProps<typeof View> & {
  className?: string
}

/** Hauteur du clavier en cours d'affichage, 0 quand il est fermé. */
function useKeyboardHeight(): number {
  const [height, setHeight] = React.useState(0)

  React.useEffect(() => {
    // Android n'émet que les évènements `Did*` : la marge se pose donc à la fin de
    // l'animation du clavier, sans transition. C'est déjà ce que fait le composant de RN.
    const shown = Keyboard.addListener('keyboardDidShow', (event) => setHeight(event.endCoordinates.height))
    const hidden = Keyboard.addListener('keyboardDidHide', () => setHeight(0))
    return () => {
      shown.remove()
      hidden.remove()
    }
  }, [])

  return height
}

function AndroidKeyboardAvoidingView({ style, children, ...props }: KeyboardAvoidingViewProps) {
  const keyboardHeight = useKeyboardHeight()

  return (
    <View style={[style, { paddingBottom: keyboardHeight }]} {...props}>
      {children}
    </View>
  )
}

function KeyboardAvoidingView({ children, ...props }: KeyboardAvoidingViewProps) {
  if (Platform.OS === 'android') {
    return <AndroidKeyboardAvoidingView {...props}>{children}</AndroidKeyboardAvoidingView>
  }

  return (
    <RNKeyboardAvoidingView behavior="padding" {...props}>
      {children}
    </RNKeyboardAvoidingView>
  )
}

export { KeyboardAvoidingView }
