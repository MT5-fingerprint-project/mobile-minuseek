export { default as CameraPermissionGate } from './components/CameraPermissionGate'
export { default as CaptureControlsBar } from './components/CaptureControlsBar'
export { default as CaptureOverlay } from './components/CaptureOverlay'
export { default as CaptureSignalsBanner } from './components/CaptureSignalsBanner'
export { default as TraceCameraView } from './components/TraceCameraView'
export { type CaptureSignals, useCaptureSignals } from './hooks/useCaptureSignals'
export {
  ALIGNED_BELOW_DEG,
  deviationFromPlumb,
  type DeviceTilt,
  MISALIGNED_ABOVE_DEG,
  useDeviceTilt,
} from './hooks/useDeviceTilt'
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
export {
  ANALYSIS_SIDE_PX,
  cropRectFor,
  isSharp,
  laplacianVariance,
  SHARP_ABOVE,
  toGrayMat,
} from './lib/sharpnessDetection'
