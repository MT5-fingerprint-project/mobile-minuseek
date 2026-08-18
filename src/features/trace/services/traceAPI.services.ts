import { apiClient } from '@/features/shared/lib/apiClient'
import type { SelectedTrace, Trace } from '@/features/trace/types/trace'

export type UploadedTrace = { id: string; path: string; url: string }

export const TraceAPI = {
  upload: ({ caseId, uri, mimeType, fileName }: SelectedTrace) => {
    const form = new FormData()
    form.append('caseId', caseId)
    form.append('file', {
      uri,
      name: fileName,
      type: mimeType,
    } as unknown as Blob)

    return apiClient
      .post<UploadedTrace>('/traces', form, {
        headers: { 'Content-Type': undefined },
      })
      .then((res) => res.data)
  },

  // `caseId` est obligatoire côté back (validé UUID) : 400 sinon.
  list: (caseId: string) =>
    apiClient.get<{ data: Trace[] }>('/traces', { params: { caseId } }).then((res) => res.data.data),

  // 204 No Content : pas de corps à lire.
  remove: (traceId: string) => apiClient.delete<void>(`/traces/${traceId}`).then(() => undefined),
}
