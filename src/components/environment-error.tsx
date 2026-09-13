import { ScrollView, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Text } from '@/features/shared/ui/text'

/**
 * Écran d'arrêt affiché quand les variables de build manquent ou sont invalides.
 *
 * Un build autonome mal configuré ne peut joindre ni l'API ni Keycloak : plutôt que de
 * laisser l'utilisateur découvrir des écrans vides et des erreurs réseau, on bloque le
 * démarrage sur le nom exact de la variable à renseigner.
 */
export function EnvironmentError({ message }: { message: string }) {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
        <View className="gap-4 px-6">
          <Text className="text-2xl font-bold">Configuration manquante</Text>
          <Text className="text-muted-foreground">
            Ce build n&apos;a pas d&apos;environnement : il ne peut joindre ni l&apos;API ni Keycloak.
          </Text>
          <Text className="text-sm text-destructive">{message}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
