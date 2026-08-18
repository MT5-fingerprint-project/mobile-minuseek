import { File } from 'expo-file-system'
import { type RefObject, useCallback, useEffect, useRef, useState } from 'react'
import { AppState } from 'react-native'
import {
  Camera,
  type CameraDevice,
  type CameraDeviceFormat,
  type CameraPermissionStatus,
  type Point,
  useCameraDevice,
  useCameraFormat,
} from 'react-native-vision-camera'

import {
  evaluateCaptureResolution,
  MIN_SHORT_SIDE_PX,
  MIN_TOTAL_PIXELS,
  type ResolutionCheck,
} from '@/features/capture/lib/captureResolution'

/**
 * ⚠️ Un des **deux seuls** fichiers de l'app qui dépendent de la bibliothèque caméra
 * (l'autre est `components/TraceCameraView.tsx`). Tout changement de bibliothèque se
 * confine à ces deux fichiers : le reste de la feature ne manipule que les types ci-dessous.
 *
 * VisionCamera est ici en **v4.7.3**, pas en v5. La v5 (Nitro) compile sur RN 0.81 mais
 * plante au montage de la vue : ses props sont passées en valeurs JSI brutes, ce que le
 * renderer de RN 0.81 ne sait pas lire sans le feature flag `useRawPropsJsiValue`
 * (`RawValue.h: castValue: assertion failed`). La v4 n'utilise pas ce mécanisme.
 */

/** Photo capturée, réduite à ce dont le reste de l'app a besoin. */
export type CapturedPhotoFile = {
  /** Chemin filesystem (sans schéma `file://`). */
  path: string
  width: number
  height: number
  mimeType: string
}

/**
 * État de la permission caméra, en 3 situations distinctes :
 * - `undetermined` : jamais demandée, on peut ouvrir la boîte de dialogue système ;
 * - `denied` : refusée mais redemandable (cas Android « Refuser » simple) ;
 * - `blocked` : refus définitif ou restriction — seuls les réglages système débloquent.
 */
export type CapturePermissionStatus = 'granted' | 'undetermined' | 'denied' | 'blocked'

export type CapturePermission = {
  status: CapturePermissionStatus
  request: () => Promise<boolean>
}

function mapPermissionStatus(status: CameraPermissionStatus, wasRequested: boolean): CapturePermissionStatus {
  if (status === 'granted') return 'granted'
  if (status === 'denied' || status === 'restricted') return 'blocked'
  // `not-determined` après une demande = refus simple sur Android : redemandable.
  return wasRequested ? 'denied' : 'undetermined'
}

/**
 * `useCameraPermission` de la bibliothèque ne renvoie qu'un booléen : il ne permet pas de
 * distinguer un refus redemandable d'un refus définitif, donc pas d'écran de repli correct.
 */
export function useCapturePermission(): CapturePermission {
  const [status, setStatus] = useState<CameraPermissionStatus>(() => Camera.getCameraPermissionStatus())
  const [wasRequested, setWasRequested] = useState(false)

  // L'utilisateur peut autoriser depuis les réglages système : on relit au retour dans l'app.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') setStatus(Camera.getCameraPermissionStatus())
    })
    return () => subscription.remove()
  }, [])

  const request = useCallback(async () => {
    setWasRequested(true)
    const result = await Camera.requestCameraPermission()
    setStatus(result)
    return result === 'granted'
  }, [])

  return { status: mapPermissionStatus(status, wasRequested), request }
}

/**
 * Résultat d'une prise de vue. `file` est `null` quand la résolution est refusée : le
 * fichier temporaire écrit par la caméra est alors supprimé, et seul `check.message`
 * est à afficher.
 */
export type CaptureResult = {
  check: ResolutionCheck
  file: CapturedPhotoFile | null
}

export type TraceCamera = {
  cameraRef: RefObject<Camera | null>
  device: CameraDevice | undefined
  /** Format retenu : le plus grand 4:3 de l'appareil (photo **et** preview). */
  format: CameraDeviceFormat | undefined
  /** `false` tant que la caméra n'est pas initialisée : le déclencheur reste inactif. */
  isReady: boolean
  isCapturing: boolean
  /** Erreur de montage / de session (caméra occupée, appareil sans capteur…). */
  error: Error | null
  hasTorch: boolean
  isTorchOn: boolean
  toggleTorch: () => void
  /** `true` si le meilleur format de l'appareil est déjà sous le seuil dur. */
  isDeviceResolutionInsufficient: boolean
  /** Dernier point touché, pour l'indicateur de mise au point ; effacé après coup. */
  focusPoint: Point | null
  focusTo: (point: Point) => Promise<void>
  takePicture: () => Promise<CaptureResult>
  handleInitialized: () => void
  handleError: (error: Error) => void
}

/** Durée d'affichage de l'indicateur de mise au point, en ms. */
const FOCUS_INDICATOR_MS = 1200

export function useTraceCamera(): TraceCamera {
  const cameraRef = useRef<Camera | null>(null)
  const device = useCameraDevice('back')

  /**
   * Le 4:3 n'est pas négociable et passe **avant** la résolution : l'overlay est calé sur
   * ce ratio (cf. `captureFrame.ts`), un format 16:9 rendrait les coordonnées du cadre
   * fausses pour D1/D2. Les filtres sont classés par priorité décroissante. Les ratios sont
   * exprimés largeur / hauteur en paysage (repère du capteur), d'où 4/3 et non 3/4.
   */
  const format = useCameraFormat(device, [
    { photoAspectRatio: 4 / 3 },
    { videoAspectRatio: 4 / 3 },
    { photoResolution: 'max' },
  ])

  const [isReady, setIsReady] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [isTorchOn, setIsTorchOn] = useState(false)
  const [focusPoint, setFocusPoint] = useState<Point | null>(null)

  const isDeviceResolutionInsufficient =
    format != null &&
    (Math.min(format.photoWidth, format.photoHeight) < MIN_SHORT_SIDE_PX ||
      format.photoWidth * format.photoHeight < MIN_TOTAL_PIXELS)

  const handleInitialized = useCallback(() => {
    setIsReady(true)
    setError(null)
  }, [])

  const handleError = useCallback((cameraError: Error) => {
    setIsReady(false)
    setError(cameraError)
  }, [])

  const toggleTorch = useCallback(() => setIsTorchOn((on) => !on), [])

  const focusTo = useCallback(
    async (point: Point) => {
      const camera = cameraRef.current
      if (camera == null || device?.supportsFocus !== true) return
      setFocusPoint(point)
      try {
        // Mesure AF (et AE/AWB côté natif) sur le point touché. La v4 n'expose pas de
        // verrouillage d'exposition explicite : à rouvrir avec les contrôles qualité (B2).
        await camera.focus(point)
      } catch {
        // Mise au point impossible (caméra occupée, point hors cadre) : sans effet.
      }
    },
    [device]
  )

  // L'indicateur de mise au point s'efface seul.
  useEffect(() => {
    if (focusPoint == null) return
    const timeout = setTimeout(() => setFocusPoint(null), FOCUS_INDICATOR_MS)
    return () => clearTimeout(timeout)
  }, [focusPoint])

  const takePicture = useCallback(async (): Promise<CaptureResult> => {
    const camera = cameraRef.current
    if (camera == null) throw new Error("La caméra n'est pas prête.")

    setIsCapturing(true)
    try {
      const photo = await camera.takePhoto({ flash: 'off' })
      const check = evaluateCaptureResolution(photo.width, photo.height)
      if (check.verdict === 'rejected') {
        // La v4 écrit toujours le fichier : une photo refusée doit être nettoyée,
        // sinon elle s'accumule dans le dossier temporaire.
        try {
          new File(`file://${photo.path}`).delete()
        } catch {
          // Fichier déjà absent ou verrouillé : le système videra le dossier temporaire.
        }
        return { check, file: null }
      }
      return { check, file: { path: photo.path, width: photo.width, height: photo.height, mimeType: 'image/jpeg' } }
    } finally {
      setIsCapturing(false)
    }
  }, [])

  return {
    cameraRef,
    device,
    format,
    isReady,
    isCapturing,
    error,
    hasTorch: device?.hasTorch ?? false,
    isTorchOn,
    toggleTorch,
    isDeviceResolutionInsufficient,
    focusPoint,
    focusTo,
    takePicture,
    handleInitialized,
    handleError,
  }
}
