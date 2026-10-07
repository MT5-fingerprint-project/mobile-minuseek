import * as Device from 'expo-device'

import type { CapturedPhoto } from '@/features/shared/types/photo'
import type { SelectedTrace, TraceLocationPhoto } from '@/features/trace/types/trace'

function toFileUri(path: string): string {
  return path.startsWith('file://') ? path : `file://${path}`
}

function extensionOf(mimeType: string): string {
  return mimeType === 'image/jpeg' ? 'jpg' : mimeType.split('/')[1]
}

export function buildCapturedTrace(photo: CapturedPhoto, caseId: string): SelectedTrace {
  const mimeType = photo.mimeType ?? 'image/jpeg'
  const capturedAt = new Date()
  return {
    uri: toFileUri(photo.path),
    caseId,
    mimeType,
    fileName: `trace-${capturedAt.getTime()}.${extensionOf(mimeType)}`,
    source: 'camera',
    width: photo.width,
    height: photo.height,
    capturedAt: capturedAt.toISOString(),
    deviceModel: Device.modelName ?? undefined,
  }
}

export function buildLocationPhoto(photo: CapturedPhoto): TraceLocationPhoto {
  const mimeType = photo.mimeType ?? 'image/jpeg'
  return {
    uri: toFileUri(photo.path),
    mimeType,
    fileName: `trace-location-${Date.now()}.${extensionOf(mimeType)}`,
  }
}
