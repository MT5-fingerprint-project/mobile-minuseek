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

export type CapturedPhotoFile = {
  /** Chemin filesystem (sans schéma `file://`). */
  path: string
  width: number
  height: number
  mimeType: string
}

export type CapturePermissionStatus = 'granted' | 'undetermined' | 'denied' | 'blocked'

export type CapturePermission = {
  status: CapturePermissionStatus
  request: () => Promise<boolean>
}

function mapPermissionStatus(status: CameraPermissionStatus, wasRequested: boolean): CapturePermissionStatus {
  if (status === 'granted') return 'granted'
  if (status === 'denied' || status === 'restricted') return 'blocked'
  return wasRequested ? 'denied' : 'undetermined'
}

export function useCapturePermission(): CapturePermission {
  const [status, setStatus] = useState<CameraPermissionStatus>(() => Camera.getCameraPermissionStatus())
  const [wasRequested, setWasRequested] = useState(false)

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

export type CapturePurpose = 'trace' | 'location'

export type CaptureResult = {
  check: ResolutionCheck | null
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
  takePicture: (purpose?: CapturePurpose) => Promise<CaptureResult>
  handleInitialized: () => void
  handleError: (error: Error) => void
}

/** Durée d'affichage de l'indicateur de mise au point, en ms. */
const FOCUS_INDICATOR_MS = 1200

const ANALYSIS_VIDEO_RESOLUTION = { width: 1280, height: 960 }

export function useTraceCamera(): TraceCamera {
  const cameraRef = useRef<Camera | null>(null)
  const device = useCameraDevice('back')

  const format = useCameraFormat(device, [
    { photoAspectRatio: 4 / 3 },
    { videoAspectRatio: 4 / 3 },
    { photoResolution: 'max' },
    { videoResolution: ANALYSIS_VIDEO_RESOLUTION },
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
        await camera.focus(point)
      } catch {}
    },
    [device]
  )

  useEffect(() => {
    if (focusPoint == null) return
    const timeout = setTimeout(() => setFocusPoint(null), FOCUS_INDICATOR_MS)
    return () => clearTimeout(timeout)
  }, [focusPoint])

  const takePicture = useCallback(async (purpose: CapturePurpose = 'trace'): Promise<CaptureResult> => {
    const camera = cameraRef.current
    if (camera == null) throw new Error("La caméra n'est pas prête.")

    setIsCapturing(true)
    try {
      const photo = await camera.takePhoto({ flash: 'off' })
      const file = { path: photo.path, width: photo.width, height: photo.height, mimeType: 'image/jpeg' }

      if (purpose === 'location') return { check: null, file }

      const check = evaluateCaptureResolution(photo.width, photo.height)
      if (check.verdict === 'rejected') {
        try {
          new File(`file://${photo.path}`).delete()
        } catch {}
        return { check, file: null }
      }
      return { check, file }
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
