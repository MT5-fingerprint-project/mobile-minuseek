import { apiClient } from '@/features/shared/lib/apiClient';
import type { SelectedTrace } from '@/features/trace/types/trace';

export type UploadedTrace = { id: string; path: string; url: string };

export const TraceAPI = {
  upload: ({ caseId, uri, mimeType, fileName }: SelectedTrace) => {
    const form = new FormData();
    form.append('caseId', caseId);
    form.append('file', {
      uri,
      name: fileName,
      type: mimeType,
    } as unknown as Blob);

    return apiClient
      .post<UploadedTrace>('/traces', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res) => res.data);
  },
};
