import { apiClient } from '@/features/shared/lib/apiClient'
import type { SelectedTrace, Trace } from '@/features/trace/types/trace'

export type UploadedTrace = { id: string; path: string; url: string }

export const TraceAPI = {
  upload: ({
    caseId,
    uri,
    mimeType,
    fileName,
    width,
    height,
    capturedAt,
    deviceModel,
    location,
    locationPhoto,
  }: SelectedTrace) => {
    const form = new FormData()
    form.append('caseId', caseId)
    form.append('file', {
      uri,
      name: fileName,
      type: mimeType,
    } as unknown as Blob)

    if (width !== undefined && height !== undefined) {
      form.append('width', String(width))
      form.append('height', String(height))
    }
    if (capturedAt !== undefined) form.append('capturedAt', capturedAt)
    if (deviceModel !== undefined) form.append('deviceModel', deviceModel)

    const statedLocation = location?.trim()
    if (statedLocation) form.append('location', statedLocation)
    if (locationPhoto !== undefined) {
      form.append('locationPhoto', {
        uri: locationPhoto.uri,
        name: locationPhoto.fileName,
        type: locationPhoto.mimeType,
      } as unknown as Blob)
    }

    return apiClient
      .post<UploadedTrace>('/traces', form, {
        headers: { 'Content-Type': undefined },
      })
      .then((res) => res.data)
  },

  list: (caseId: string) =>
    apiClient.get<{ data: Trace[] }>('/traces', { params: { caseId } }).then((res) => res.data.data),

  remove: (traceId: string) => apiClient.delete<void>(`/traces/${traceId}`).then(() => undefined),
}
