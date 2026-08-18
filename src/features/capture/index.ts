export { default as CameraPermissionGate } from './components/CameraPermissionGate'
export { default as CaptureControlsBar } from './components/CaptureControlsBar'
export { default as CaptureOverlay } from './components/CaptureOverlay'
export { default as TraceCameraView } from './components/TraceCameraView'
export {
  type CapturedPhotoFile,
  type CapturePermission,
  type CapturePermissionStatus,
  type CaptureResult,
  type TraceCamera,
  useCapturePermission,
  useTraceCamera,
} from './hooks/useTraceCamera'
export {
  CAPTURE_ASPECT_RATIO,
  COMPOSITION_FRAME,
  type NormalizedRect,
  type PixelRect,
  SAFE_AREA_INSET_RATIO,
  safeAreaOf,
  SCALE_GUIDE,
  SCALE_GUIDE_TICKS,
  toPixels,
} from './lib/captureFrame'
export {
  evaluateCaptureResolution,
  MIN_SHORT_SIDE_PX,
  MIN_TOTAL_PIXELS,
  RECOMMENDED_SHORT_SIDE_PX,
  type ResolutionCheck,
  type ResolutionVerdict,
} from './lib/captureResolution'
