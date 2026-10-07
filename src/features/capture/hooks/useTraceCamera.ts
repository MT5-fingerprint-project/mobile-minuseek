import { File } from 'expo-file-system'
import { type RefObject, useEffect, useRef, useState } from 'react'
import {
  Camera,
  type CameraDevice,
  type CameraDeviceFormat,
  type Point,
  useCameraDevice,
  useCameraFormat,
} from 'react-native-vision-camera'

import {
  evaluateCaptureResolution,
  MIN_SHORT_SIDE_PX,
  MIN_TOTAL_PIXELS,
} from '@/features/capture/lib/captureResolution'
import type { CapturePurpose, CaptureResult } from '@/features/capture/types/capture'

export type TraceCamera = {
  cameraRef: RefObject<Camera | null>
  device: CameraDevice | undefined
  format: CameraDeviceFormat | undefined
  isReady: boolean
  isCapturing: boolean
  error: Error | null
  hasTorch: boolean
  isTorchOn: boolean
  toggleTorch: () => void
  isDeviceResolutionInsufficient: boolean
  focusPoint: Point | null
  focusTo: (point: Point) => Promise<void>
  takePicture: (purpose?: CapturePurpose) => Promise<CaptureResult>
  handleInitialized: () => void
  handleError: (error: Error) => void
}

const FOCUS_INDICATOR_MS = 1200
const ANALYSIS_VIDEO_RESOLUTION = { width: 1280, height: 960 }

export function useTraceCamera(): TraceCamera {
  const cameraRef = useRef<Camera | null>(null)
  const device = useCameraDevice('back')

  // priore format to use if available
  const format = useCameraFormat(device, [
    { photoAspectRatio: 4 / 3 },
    { videoAspectRatio: 4 / 3 },
    { photoResolution: 'max' },
    { videoResolution: ANALYSIS_VIDEO_RESOLUTION },
  ])

  // describe camera's state every call
  const [isReady, setIsReady] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [isTorchOn, setIsTorchOn] = useState(false)
  const [focusPoint, setFocusPoint] = useState<Point | null>(null)

  // check phone's max 4:3 resolution > minimum resolution required
  const isDeviceResolutionInsufficient =
    format != null &&
    (Math.min(format.photoWidth, format.photoHeight) < MIN_SHORT_SIDE_PX ||
      format.photoWidth * format.photoHeight < MIN_TOTAL_PIXELS)

  const handleInitialized = () => {
    setIsReady(true)
    setError(null)
  }

  const handleError = (cameraError: Error) => {
    setIsReady(false)
    setError(cameraError)
  }

  const toggleTorch = () => setIsTorchOn((on) => !on)

  // use camera focus if supported
  const focusTo = async (point: Point) => {
    const camera = cameraRef.current
    if (camera == null || device?.supportsFocus !== true) {
      return
    }
    setFocusPoint(point)
    try {
      await camera.focus(point)
    } catch {}
  }

  // stop focus after delay
  useEffect(() => {
    if (focusPoint == null) {
      return
    }
    const timeout = setTimeout(() => setFocusPoint(null), FOCUS_INDICATOR_MS)
    return () => clearTimeout(timeout)
  }, [focusPoint])


  const takePicture = async (purpose: CapturePurpose = 'trace'): Promise<CaptureResult> => {
    const camera = cameraRef.current
    if (camera == null) {
      throw new Error("La caméra n'est pas prête.")
    }

    setIsCapturing(true)
    try {
      const photo = await camera.takePhoto({ flash: 'off' })
      const file = { path: photo.path, width: photo.width, height: photo.height, mimeType: 'image/jpeg' }

      if (purpose === 'location') {
        return { check: null, file }
      }

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
  }

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
