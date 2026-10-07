import { useMutation, useQueryClient } from '@tanstack/react-query'

import { toReadableError } from '@/features/shared/lib/errors'
import { traceKeys } from '@/features/trace/hooks/traceKeys'
import { TraceAPI } from '@/features/trace/services/traceAPI.services'
import type { SelectedTrace } from '@/features/trace/types/trace'

const TRACE_ERROR_MESSAGES = {
  404: "Cette affaire est introuvable ou n'accepte pas de trace.",
}


// Uploads a trace to its case (`POST /traces`).
export function useUploadTrace() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (trace: SelectedTrace) => {
      try {
        // Builds the multipart form and POST it to /traces
        return await TraceAPI.upload(trace)
      } catch (error) {
        throw toReadableError(error, TRACE_ERROR_MESSAGES)
      }
    },
    onSuccess: (_data, trace) => {
      // Mark the cache list for this case as stale
      queryClient.invalidateQueries({
        queryKey: traceKeys.list(trace.caseId),
      })
    },
  })
}
