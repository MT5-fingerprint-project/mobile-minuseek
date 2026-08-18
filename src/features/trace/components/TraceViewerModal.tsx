import { Alert, Modal, Pressable, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Button } from '@/features/shared/ui/button'
import { Text } from '@/features/shared/ui/text'
import { TraceStatusBadge } from '@/features/trace/components/TraceStatusBadge'
import TraceThumbnail from '@/features/trace/components/TraceThumbnail'
import { useDeleteTrace } from '@/features/trace/hooks/useDeleteTrace'
import type { Trace } from '@/features/trace/types/trace'

type TraceViewerModalProps = {
  trace: Trace | null
  onClose: () => void
}

export default function TraceViewerModal({ trace, onClose }: TraceViewerModalProps) {
  const insets = useSafeAreaInsets()
  const deleteTrace = useDeleteTrace()

  const remove = async () => {
    if (!trace) return
    try {
      await deleteTrace.mutateAsync({ traceId: trace.id, caseId: trace.caseId })
      onClose()
    } catch (error) {
      Alert.alert('Suppression impossible', error instanceof Error ? error.message : 'Une erreur est survenue')
    }
  }

  const confirmRemove = () => {
    Alert.alert('Supprimer cette trace ?', 'Cette action est définitive.', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => void remove() },
    ])
  }

  const close = deleteTrace.isPending ? undefined : onClose

  return (
    <Modal visible={trace !== null} animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black" style={{ paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 16) }}>
        <View className="flex-row justify-end px-4 py-2">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Fermer"
            onPress={close}
            disabled={deleteTrace.isPending}
            className="size-10 items-center justify-center rounded-full active:opacity-70"
          >
            <Text className="text-2xl text-white">×</Text>
          </Pressable>
        </View>

        {trace && (
          <>
            <TraceThumbnail trace={trace} contentFit="contain" className="flex-1" />

            <View className="gap-3 px-5 pt-4">
              <View className="flex-row items-center justify-between">
                <TraceStatusBadge status={trace.status} />
                <Text className="text-sm text-white/70">{new Date(trace.createdAt).toLocaleString('fr-FR')}</Text>
              </View>
              <Button
                variant="destructive"
                onPress={confirmRemove}
                loading={deleteTrace.isPending}
                disabled={deleteTrace.isPending}
              >
                <Text>Supprimer</Text>
              </Button>
            </View>
          </>
        )}
      </View>
    </Modal>
  )
}
