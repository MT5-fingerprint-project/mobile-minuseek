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

/**
 * Viseur guidé : gate de permission → viseur + overlay → contrôle de résolution → aperçu →
 * étape de localisation (facultative) → envoi → `router.back()`.
 *
 * L'aplomb (L3-3) et la netteté (L3-4) sont mesurés en continu pendant la visée. Ils
 * **n'empêchent jamais de déclencher** et ne partent pas en base : ils servent le geste, pas
 * le dossier. On ne revient pas sur les lieux pour une photo refusée par l'application.
 *
 * Tout se joue **dans cet écran** : il n'existe aucun mécanisme de retour de données entre
 * écrans dans ce repo, et il n'en faut aucun ici. L'étape de localisation (L4-3c) n'ouvre donc
 * aucune route : c'est une étape de `useTraceCaptureFlow`, rendue en `Modal` par-dessus le
 * viseur éteint. Après l'envoi, `useUploadTrace` invalide `traceKeys.list(caseId)` ; l'écran
 * affaire, en remontant, refetch seul.
 */
export default function CaptureScreen() {
  const { caseId } = useLocalSearchParams<{ caseId: string }>()
  const isFocused = useIsFocused()

  const permission = useCapturePermission()
  const camera = useTraceCamera()
  const upload = useUploadTrace()
  const flow = useTraceCaptureFlow(caseId)

  const isTraceFraming = flow.step === 'trace-framing'
  const isLocationFraming = flow.step === 'location-framing'

  // Le capteur ne tourne que pendant une visée : ni sous l'aperçu, ni sous le formulaire.
  const isViewfinderActive = isFocused && (isTraceFraming || isLocationFraming)
  // L'aplomb ne sert qu'au gros plan : rien à mesurer sur un plan large de pièce.
  const tilt = useDeviceTilt(isFocused && isTraceFraming)
  const signals = useCaptureSignals()

  // `back()` ne mène nulle part si l'écran a été ouvert par un lien direct.
  const close = () =>
    router.canGoBack() ? router.back() : router.replace({ pathname: '/case/[id]', params: { id: caseId } })

  const handleCapture = async () => {
    try {
      const { check, file } = await camera.takePicture(isLocationFraming ? 'location' : 'trace')
      if (file === null) {
        // Refus : un seul bouton, la photo n'a pas été écrite, l'aperçu ne s'ouvre pas.
        Alert.alert('Photo trop peu détaillée', check?.message ?? '', [{ text: 'Reprendre la photo' }])
        return
      }
      if (isLocationFraming) {
        flow.keepLocationPhoto(file)
        return
      }
      // Pas d'avertissement de netteté ici : le viseur l'a dit avant, c'est là qu'on décide.
      flow.keepTracePhoto(file, check?.message ?? null)
    } catch (error) {
      Alert.alert('Capture impossible', error instanceof Error ? error.message : 'Une erreur est survenue')
    }
  }

  /** `trace` est déjà complet : `location` et `locationPhoto` valent `undefined` s'ils manquent. */
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

  /**
   * « Envoyer sans localisation » et « Ignorer et envoyer la trace seule » disent la même
   * chose : la trace part seule, même si le formulaire a déjà été ouvert et rempli.
   */
  const sendTraceAlone = () => void send(flow.trace && { ...flow.trace, location: undefined, locationPhoto: undefined })

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
        <TraceCameraView camera={camera} isActive={isViewfinderActive} frameProcessor={signals.frameProcessor}>
          {/* Sur un plan large, ni cadre de composition ni règle millimétrée : dessinés
              par-dessus une porte-fenêtre ils n'indiquent rien et laissent croire à une
              contrainte de cadrage qui n'existe pas. */}
          {!isLocationFraming && (
            <CaptureOverlay
              isAligned={tilt.isAligned}
              tiltDeviationDeg={tilt.deviationDeg}
              isSharp={signals.isSharp}
              sharpnessScore={signals.sharpnessScore}
            />
          )}
        </TraceCameraView>

        {isLocationFraming && (
          <View className="mx-5 mt-4 rounded-md border border-border bg-white/10 px-3 py-2">
            <Text className="text-xs text-white">
              Cadrez l&apos;endroit, pas la trace : on doit reconnaître le support et sa position dans la pièce
            </Text>
          </View>
        )}

        {/* Seuil de résolution : il ne vaut que pour le gros plan de la trace. */}
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
        // « Envoyer sans localisation » : ce que « Envoyer » faisait avant ce ticket.
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
