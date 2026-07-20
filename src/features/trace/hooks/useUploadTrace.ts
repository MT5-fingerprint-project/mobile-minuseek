import { useMutation } from '@tanstack/react-query';

import { toReadableError } from '@/features/shared/lib/errors';
import { TraceAPI } from '@/features/trace/services/traceAPI.services';
import type { SelectedTrace } from '@/features/trace/types/trace';

export const traceKeys = {
  all: ['traces'] as const,
  list: (caseId: string) => [...traceKeys.all, 'list', caseId] as const,
};

const TRACE_ERROR_MESSAGES = {
  404: "Cette affaire est introuvable ou n'accepte pas de trace.",
};

export function useUploadTrace() {
  return useMutation({
    mutationFn: async (trace: SelectedTrace) => {
      try {
        return await TraceAPI.upload(trace);
      } catch (error) {
        throw toReadableError(error, TRACE_ERROR_MESSAGES);
      }
    },
  });
}
