import { Stack, useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import { Alert, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { InvestigationCaseSummary, useInvestigationCase } from '@/features/investigation-case'
import { Button } from '@/features/shared/ui/button'
import { Text } from '@/features/shared/ui/text'
import {
  type SelectedTrace,
  type Trace,
  TracePreviewSheet,
  TracesGrid,
  TraceViewerModal,
  useCaptureTraceForCase,
  usePickImageForCase,
  useTraces,
  useUploadTrace,
} from '@/features/trace'

export default function CaseScreen() {
  const { id: caseId } = useLocalSearchParams<{ id: string }>()
  // Deux objets distincts : `selected` est une image locale pas encore envoyée,
  // `viewing` une trace déjà stockée côté back.
  const [selected, setSelected] = useState<SelectedTrace | null>(null)
  const [viewing, setViewing] = useState<Trace | null>(null)

  const investigationCase = useInvestigationCase(caseId)
  const traces = useTraces(caseId)

  const { takePhoto } = useCaptureTraceForCase(caseId)
  const { pickImage } = usePickImageForCase(caseId)
  const upload = useUploadTrace()

  const handleConfirm = async () => {
    if (!selected) return
    try {
      await upload.mutateAsync(selected)
      setSelected(null)
      Alert.alert('Image envoyée', "L'image a été rattachée à l'affaire.")
    } catch (error) {
      Alert.alert('Envoi impossible', error instanceof Error ? error.message : 'Une erreur est survenue')
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['bottom', 'left', 'right']}>
      {/* Surcharge le `title: 'Affaire'` de repli posé par `_layout.tsx`. */}
      <Stack.Screen
        options={{
          title: investigationCase.data ? `Affaire N°${investigationCase.data.caseNumber}` : 'Affaire',
        }}
      />

      <TracesGrid
        traces={traces.data ?? []}
        isLoading={traces.isLoading}
        isRefreshing={traces.isRefetching}
        error={traces.error}
        onRefresh={() => {
          void traces.refetch()
          void investigationCase.refetch()
        }}
        onSelect={setViewing}
        header={
          investigationCase.data ? (
            <InvestigationCaseSummary investigationCase={investigationCase.data} />
          ) : investigationCase.error ? (
            <View className="rounded-lg border border-border bg-card p-4">
              <Text className="text-sm text-muted-foreground">{investigationCase.error.message}</Text>
            </View>
          ) : null
        }
      />

      <View className="flex-row gap-3 border-t border-border bg-background px-5 py-3">
        <Button className="flex-1" onPress={async () => setSelected(await takePhoto())}>
          <Text>Prendre une photo</Text>
        </Button>
        <Button variant="outline" className="flex-1" onPress={async () => setSelected(await pickImage())}>
          <Text>Importer</Text>
        </Button>
      </View>

      <TracePreviewSheet
        selected={selected}
        isUploading={upload.isPending}
        onConfirm={handleConfirm}
        onCancel={() => setSelected(null)}
      />

      <TraceViewerModal trace={viewing} onClose={() => setViewing(null)} />
    </SafeAreaView>
  )
}
