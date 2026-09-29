import { File } from 'expo-file-system'
import { Image } from 'expo-image'
import { useMemo } from 'react'
import { Modal, Pressable, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Button } from '@/features/shared/ui/button'
import { Text } from '@/features/shared/ui/text'
import type { SelectedTrace } from '@/features/trace/types/trace'

type TracePreviewSheetProps = {
  selected: SelectedTrace | null
  isUploading: boolean
  onConfirm: () => void
  onCancel: () => void
  /** Avertissement non bloquant (résolution sous la valeur recommandée) : bandeau ambre. */
  warning?: string | null
  onAddLocation?: () => void
}

function describeFile(selected: SelectedTrace | null): string | null {
  if (selected == null) return null
  const parts: string[] = []
  if (selected.width != null && selected.height != null) {
    parts.push(`${selected.width} × ${selected.height} px`)
  }
  try {
    const bytes = new File(selected.uri).size
    if (bytes > 0) parts.push(`${(bytes / 1_000_000).toFixed(1).replace('.', ',')} Mo`)
  } catch {}
  return parts.length > 0 ? parts.join(' · ') : null
}

export default function TracePreviewSheet({
  selected,
  isUploading,
  onConfirm,
  onCancel,
  warning = null,
  onAddLocation,
}: TracePreviewSheetProps) {
  const insets = useSafeAreaInsets()
  const fileDescription = useMemo(() => describeFile(selected), [selected])

  return (
    <Modal visible={selected !== null} animationType="slide" transparent onRequestClose={onCancel}>
      <View className="flex-1 justify-end bg-black/40">
        <Pressable className="flex-1" onPress={isUploading ? undefined : onCancel} accessibilityLabel="Fermer" />
        <View
          className="rounded-t-3xl bg-background px-5 pt-5"
          style={{ paddingBottom: Math.max(insets.bottom, 24) + 16 }}
        >
          <View className="mb-4 h-1 w-10 self-center rounded-full bg-muted-foreground/40" />
          <Text className="mb-4 text-center text-base font-medium text-foreground">
            Envoyer cette image à l&apos;affaire ?
          </Text>
          {selected && (
            <Image
              source={{ uri: selected.uri }}
              contentFit="contain"
              style={{ width: '100%', height: 260, borderRadius: 12 }}
            />
          )}
          {fileDescription && <Text className="mt-3 text-center text-xs text-muted-foreground">{fileDescription}</Text>}
          {warning && (
            <View className="mt-3 rounded-md border border-orange-medium bg-orange-light px-3 py-2">
              <Text className="text-xs text-orange-medium">{warning}</Text>
            </View>
          )}
          <View className="mt-5 gap-3">
            {onAddLocation && (
              <Button onPress={onAddLocation} disabled={isUploading}>
                <Text>Ajouter la localisation</Text>
              </Button>
            )}
            <Button
              variant={onAddLocation ? 'secondary' : 'default'}
              onPress={onConfirm}
              loading={isUploading}
              disabled={isUploading}
            >
              <Text>{onAddLocation ? 'Envoyer sans localisation' : 'Envoyer'}</Text>
            </Button>
            <Button variant="outline" onPress={onCancel} disabled={isUploading}>
              <Text>Annuler</Text>
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  )
}
