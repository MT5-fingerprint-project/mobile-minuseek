import { Alert, Modal, Pressable, ScrollView, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import InvestigationCaseCreateForm from '@/features/investigation-case/components/InvestigationCaseCreateForm'
import { useCreateInvestigationCase } from '@/features/investigation-case/hooks/useInvestigationCases'
import type { InvestigationCaseCreateInput } from '@/features/investigation-case/types/investigationCase'
import { KeyboardAvoidingView } from '@/features/shared/ui/keyboard-avoiding-view'

type InvestigationCaseCreateModalProps = {
  visible: boolean
  onClose: () => void
}

export default function InvestigationCaseCreateModal({ visible, onClose }: InvestigationCaseCreateModalProps) {
  const insets = useSafeAreaInsets()
  const createCase = useCreateInvestigationCase()

  const handleSubmit = async (values: InvestigationCaseCreateInput) => {
    // Errors bubble up to the form (mutationFn rethrows a readable message).
    await createCase.mutateAsync(values)
    Alert.alert('Affaire créée avec succès')
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/40">
        {/* Tap outside to dismiss */}
        <Pressable className="flex-1" onPress={onClose} accessibilityLabel="Fermer" />
        {/* `shrink` sur toute la chaîne jusqu'au ScrollView : sans lui, un enfant de colonne
            garde sa hauteur de contenu (`flexShrink: 0` par défaut en RN) et la feuille
            déborde de l'écran au lieu de défiler, dès que le clavier mange la moitié de la
            hauteur sur un petit téléphone. */}
        <KeyboardAvoidingView className="shrink">
          <View
            className="shrink rounded-t-3xl bg-background px-5 pt-5"
            // Min clearance so the footer never sits under the iOS home indicator,
            // even if insets read 0 across the Modal boundary. S'ajoute à la hauteur
            // du clavier posée par KeyboardAvoidingView, qui en exclut la barre système.
            style={{ paddingBottom: Math.max(insets.bottom, 24) + 16 }}
          >
            <View className="mb-4 h-1 w-10 self-center rounded-full bg-muted-foreground/40" />
            <ScrollView className="shrink" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <InvestigationCaseCreateForm onClose={onClose} onSubmit={handleSubmit} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  )
}
