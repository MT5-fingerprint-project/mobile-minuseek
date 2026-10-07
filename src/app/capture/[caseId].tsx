import { useIsFocused } from '@react-navigation/native'
import { router, useLocalSearchParams } from 'expo-router'
import { Alert, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import {
  CameraPermissionGate,
  CaptureControlsBar,
  CaptureOverlay,
  TraceCameraView,
  useCapturePermission,
  useCaptureSignals,
  useDeviceTilt,
  useTraceCamera,
} from '@/features/capture'
import { Button } from '@/features/shared/ui/button'
import { Text } from '@/features/shared/ui/text'
import { TraceLocationStep, TracePreviewSheet, useTraceCaptureFlow, useUploadTrace } from '@/features/trace'

export default function CaptureScreen() {
  const { caseId } = useLocalSearchParams<{ caseId: string }>()

  // used as a switch to desactivate camera if not on displaying component
  const isFocused = useIsFocused()

  // ask for camera's permission
  const permission = useCapturePermission()
  // prepare all camera's state and function
  const camera = useTraceCamera()
  // uploads a trace to its case
  const upload = useUploadTrace()
  // contain all the capture's logics and flows
  const flow = useTraceCaptureFlow(caseId)

  const isTraceFraming = flow.step === 'trace-framing'
  const isLocationFraming = flow.step === 'location-framing'

  // are we in camera mode
  const isViewfinderActive = isFocused && (isTraceFraming || isLocationFraming)
  // start tilt device
  const tilt = useDeviceTilt(isFocused && isTraceFraming)
  // sharpness check, run by the camera during trace framing only
  const signals = useCaptureSignals()

  const close = () =>
    router.canGoBack() ? router.back() : router.replace({ pathname: '/case/[id]', params: { id: caseId } })

  const handleCapture = async () => {
    try {
      const { check, file } = await camera.takePicture(isLocationFraming ? 'location' : 'trace')
      if (file === null) {
        Alert.alert('Photo trop peu détaillée', check?.message ?? '', [{ text: 'Reprendre la photo' }])
        return
      }
      if (isLocationFraming) {
        flow.keepLocationPhoto(file)
        return
      }
      flow.keepTracePhoto(file, check?.message ?? null)
    } catch (error) {
      Alert.alert('Capture impossible', error instanceof Error ? error.message : 'Une erreur est survenue')
    }
  }

  const send = async (trace: typeof flow.trace) => {
    if (!trace) return
    try {
      await upload.mutateAsync(trace)
      flow.reset()
      close()
    } catch (error) {
      Alert.alert('Envoi impossible', error instanceof Error ? error.message : 'Une erreur est survenue')
    }
  }

  const sendTraceAlone = () => void send(flow.trace && { ...flow.trace, location: undefined, locationPhoto: undefined })

  if (permission.status !== 'granted') {
    return (
      <SafeAreaView className="flex-1 bg-black">
        <CameraPermissionGate status={permission.status} onRequest={() => void permission.request()} onClose={close} />
      </SafeAreaView>
    )
  }

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
        <TraceCameraView
          camera={camera}
          isActive={isViewfinderActive}
          frameProcessor={isTraceFraming ? signals.frameProcessor : undefined}
        >
          {!isLocationFraming && (
            <CaptureOverlay isAligned={tilt.isAligned} tiltDeviationDeg={tilt.deviationDeg} isSharp={signals.isSharp} />
          )}
        </TraceCameraView>

        {isLocationFraming && (
          <View className="mx-5 mt-4 rounded-md border border-border bg-white/10 px-3 py-2">
            <Text className="text-xs text-white">
              Cadrez l&apos;endroit, pas la trace : on doit reconnaître le support et sa position dans la pièce
            </Text>
          </View>
        )}

        {isTraceFraming && camera.isDeviceResolutionInsufficient && (
          <View className="mx-5 mt-4 rounded-md border border-orange-medium bg-orange-light px-3 py-2">
            <Text className="text-xs text-orange-medium">
              La meilleure résolution de cet appareil est en dessous du minimum exploitable. Les photos prises ici ne
              pourront pas être comparées.
            </Text>
          </View>
        )}
      </View>

      <CaptureControlsBar
        onClose={isLocationFraming ? flow.startLocationStep : close}
        onCapture={() => void handleCapture()}
        onToggleTorch={camera.toggleTorch}
        hasTorch={camera.hasTorch}
        isTorchOn={camera.isTorchOn}
        isCaptureDisabled={
          !camera.isReady || camera.isCapturing || (isTraceFraming && camera.isDeviceResolutionInsufficient)
        }
        isCapturing={camera.isCapturing}
      />

      <TracePreviewSheet
        selected={flow.step === 'trace-preview' ? flow.trace : null}
        isUploading={upload.isPending}
        warning={flow.warning}
        onAddLocation={flow.startLocationStep}
        onConfirm={sendTraceAlone}
        onCancel={flow.retakeTracePhoto}
      />

      <TraceLocationStep
        visible={flow.step === 'location-form'}
        trace={flow.trace}
        isUploading={upload.isPending}
        onChangeLocation={flow.stateLocation}
        onTakePhoto={flow.startLocationPhoto}
        onRemovePhoto={flow.discardLocationPhoto}
        onSubmit={() => void send(flow.trace)}
        onSkip={sendTraceAlone}
        onBack={flow.leaveLocationStep}
      />
    </SafeAreaView>
  )
}
