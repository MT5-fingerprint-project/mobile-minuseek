import { Image } from 'expo-image'
import { Modal, ScrollView, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Button } from '@/features/shared/ui/button'
import { Field, FieldLabel } from '@/features/shared/ui/field'
import { KeyboardAvoidingView } from '@/features/shared/ui/keyboard-avoiding-view'
import { Text } from '@/features/shared/ui/text'
import { Textarea } from '@/features/shared/ui/textarea'
import { MAX_TRACE_LOCATION_LENGTH, type SelectedTrace } from '@/features/trace/types/trace'

/**
 * L'étape facultative qui suit la prise de vue d'une trace : où elle a été relevée, en une
 * phrase, et le plan large de l'endroit.
 *
 * C'est une `Modal` posée par-dessus l'écran de capture, pas une route : le viseur derrière
 * est monté `isActive={false}` (cf. `src/app/capture/[caseId].tsx`).
 *
 * Les deux exemples sous le champ ne sont pas décoratifs : sans eux on écrit « fenêtre », ce
 * qui ne situe rien deux semaines plus tard, au lieu d'une phrase qui situe.
 */
type TraceLocationStepProps = {
  visible: boolean
  /** La trace qu'on vient de prendre : sa vignette dit de quelle trace on parle. */
  trace: SelectedTrace | null
  isUploading: boolean
  onChangeLocation: (location: string) => void
  onTakePhoto: () => void
  onRemovePhoto: () => void
  onSubmit: () => void
  /** Envoie la trace seule, sans la phrase ni le plan large déjà saisis. */
  onSkip: () => void
  /** Retour à l'aperçu de la trace, sans rien envoyer. */
  onBack: () => void
}

const LOCATION_EXAMPLES = [
  'Sur la face extérieure de la porte-fenêtre du séjour',
  "Sur le rebord du lit de la chambre d'amis",
]

export default function TraceLocationStep({
  visible,
  trace,
  isUploading,
  onChangeLocation,
  onTakePhoto,
  onRemovePhoto,
  onSubmit,
  onSkip,
  onBack,
}: TraceLocationStepProps) {
  const insets = useSafeAreaInsets()
  const location = trace?.location ?? ''
  const locationPhoto = trace?.locationPhoto ?? null

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onBack}>
      <KeyboardAvoidingView className="flex-1 bg-background">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 20, paddingTop: insets.top + 20, gap: 20 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-row items-center gap-3">
            {trace && (
              <Image
                source={{ uri: trace.uri }}
                contentFit="cover"
                style={{ width: 56, height: 56, borderRadius: 8 }}
                accessibilityLabel="Trace photographiée"
              />
            )}
            <Text className="flex-1 text-lg font-semibold text-foreground">
              Où cette trace a-t-elle été relevée&nbsp;?
            </Text>
          </View>

          <Field>
            <FieldLabel>Décrivez l&apos;endroit comme vous l&apos;écririez dans un procès-verbal</FieldLabel>
            <Textarea
              value={location}
              onChangeText={onChangeLocation}
              editable={!isUploading}
              maxLength={MAX_TRACE_LOCATION_LENGTH}
              placeholder="ex : Sur la face extérieure de la porte-fenêtre du séjour"
              accessibilityLabel="Localisation de la trace"
            />
            <Text className="self-end text-xs text-muted-foreground">
              {location.length}/{MAX_TRACE_LOCATION_LENGTH}
            </Text>
            <View className="gap-1">
              {LOCATION_EXAMPLES.map((example) => (
                <Text key={example} className="text-xs text-muted-foreground">
                  · {example}
                </Text>
              ))}
            </View>
          </Field>

          <Field>
            <FieldLabel>Photographie de localisation</FieldLabel>
            {locationPhoto ? (
              <View className="gap-3">
                <Image
                  source={{ uri: locationPhoto.uri }}
                  contentFit="cover"
                  style={{ width: '100%', height: 180, borderRadius: 12 }}
                  accessibilityLabel="Photographie de localisation"
                />
                <View className="flex-row gap-3">
                  <Button variant="outline" className="flex-1" onPress={onTakePhoto} disabled={isUploading}>
                    <Text>Reprendre</Text>
                  </Button>
                  <Button variant="outline" className="flex-1" onPress={onRemovePhoto} disabled={isUploading}>
                    <Text>Retirer</Text>
                  </Button>
                </View>
              </View>
            ) : (
              <Button variant="outline" onPress={onTakePhoto} disabled={isUploading}>
                <Text>Prendre la photographie de localisation</Text>
              </Button>
            )}
          </Field>
        </ScrollView>

        <View
          className="gap-3 border-t border-border bg-background px-5 pt-4"
          style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        >
          <Button onPress={onSubmit} loading={isUploading} disabled={isUploading}>
            <Text>Envoyer</Text>
          </Button>
          <Button variant="ghost" onPress={onSkip} disabled={isUploading}>
            <Text>Ignorer et envoyer la trace seule</Text>
          </Button>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}
