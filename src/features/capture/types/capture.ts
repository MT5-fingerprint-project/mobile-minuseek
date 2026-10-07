import type { ResolutionCheck } from '@/features/capture/lib/captureResolution'
import type { CapturedPhoto } from '@/features/shared/types/photo'

export type CapturePurpose = 'trace' | 'location'

export type CaptureResult = {
  check: ResolutionCheck | null
  file: CapturedPhoto | null
}
