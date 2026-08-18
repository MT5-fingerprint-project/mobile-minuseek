import { useIsFocused } from '@react-navigation/native'
import { router, useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import { Alert, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import {
  CameraPermissionGate,
  CaptureControlsBar,
  CaptureOverlay,
  TraceCameraView,
  useCapturePermission,
  useTraceCamera,
} from '@/features/capture'
import { Button } from '@/features/shared/ui/button'
import { Text } from '@/features/shared/ui/text'
import { buildCapturedTrace, type SelectedTrace, TracePreviewSheet, useUploadTrace } from '@/features/trace'

/**
 * Viseur guidé (B1) : gate de permission → viseur + overlay → contrôle de résolution →
 * aperçu → envoi → `router.back()`.
 *
 * Tout se joue **dans cet écran** : il n'existe aucun mécanisme de retour de données entre
 * écrans dans ce repo, et il n'en faut aucun ici. Après l'envoi, `useUploadTrace` invalide
 * `traceKeys.list(caseId)` ; l'écran affaire, en remontant, refetch seul.
 */
export default function CaptureScreen() {
  const { caseId } = useLocalSearchParams<{ caseId: string }>()
  const isFocused = useIsFocused()

  const permission = useCapturePermission()
  const camera = useTraceCamera()
  const upload = useUploadTrace()

  const [selected, setSelected] = useState<SelectedTrace | null>(null)
  const [warning, setWarning] = useState<string | null>(null)

  // `back()` ne mène nulle part si l'écran a été ouvert par un lien direct.
  const close = () =>
    router.canGoBack() ? router.back() : router.replace({ pathname: '/case/[id]', params: { id: caseId } })

  const handleCapture = async () => {
    try {
      const { check, file } = await camera.takePicture()
      if (file === null) {
        // Refus : un seul bouton, la photo n'a pas été écrite, l'aperçu ne s'ouvre pas.
        Alert.alert('Photo trop peu détaillée', check.message ?? '', [{ text: 'Reprendre la photo' }])
        return
      }
      setWarning(check.message)
      setSelected(buildCapturedTrace(file, caseId))
    } catch (error) {
      Alert.alert('Capture impossible', error instanceof Error ? error.message : 'Une erreur est survenue')
    }
  }

  const handleConfirm = async () => {
    if (!selected) return
    try {
      await upload.mutateAsync(selected)
      setSelected(null)
      setWarning(null)
      close()
    } catch (error) {
      Alert.alert('Envoi impossible', error instanceof Error ? error.message : 'Une erreur est survenue')
    }
  }

  const handleCancelPreview = () => {
    setSelected(null)
    setWarning(null)
  }

  if (permission.status !== 'granted') {
    return (
      <SafeAreaView className="flex-1 bg-black">
        <CameraPermissionGate status={permission.status} onRequest={() => void permission.request()} onClose={close} />
      </SafeAreaView>
    )
  }

  // Erreur de montage (caméra occupée, session refusée) : un écran explicite, jamais un
  // écran noir muet. Tant que la liste des appareils n'est pas chargée, `device` est
  // simplement `undefined` — on ne le confond pas avec une absence de caméra.
  if (camera.error != null || camera.device == null) {
    return (
      <SafeAreaView className="flex-1 bg-black">
        <View className="flex-1 items-center justify-center gap-4 px-8">
          <Text className="text-center text-lg font-semibold text-white">
            {camera.error != null ? 'Caméra indisponible' : 'Ouverture de la caméra…'}
          </Text>
          {camera.error != null && <Text className="text-center text-sm text-white/70">{camera.error.message}</Text>}
          <Button className="mt-2 w-full" onPress={close}>
            <Text>Retour</Text>
          </Button>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-black" edges={['top', 'bottom']}>
      <View className="flex-1 justify-center">
        {/* Capteur coupé hors focus et pendant l'aperçu : batterie, et pas de caméra fantôme. */}
        <TraceCameraView camera={camera} isActive={isFocused && selected === null}>
          <CaptureOverlay />
        </TraceCameraView>

        {camera.isDeviceResolutionInsufficient && (
          <View className="mx-5 mt-4 rounded-md border border-orange-medium bg-orange-light px-3 py-2">
            <Text className="text-xs text-orange-medium">
              La meilleure résolution de cet appareil est en dessous du minimum exploitable. Les photos prises ici ne
              pourront pas être comparées.
            </Text>
          </View>
        )}
      </View>

      <CaptureControlsBar
        onClose={close}
        onCapture={() => void handleCapture()}
        onToggleTorch={camera.toggleTorch}
        hasTorch={camera.hasTorch}
        isTorchOn={camera.isTorchOn}
        isCaptureDisabled={!camera.isReady || camera.isCapturing || camera.isDeviceResolutionInsufficient}
        isCapturing={camera.isCapturing}
      />

      <TracePreviewSheet
        selected={selected}
        isUploading={upload.isPending}
        warning={warning}
        onConfirm={handleConfirm}
        onCancel={handleCancelPreview}
      />
    </SafeAreaView>
  )
}
