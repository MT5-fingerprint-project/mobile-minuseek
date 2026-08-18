import { useMutation, useQueryClient } from '@tanstack/react-query'

import { toReadableError } from '@/features/shared/lib/errors'
import { traceKeys } from '@/features/trace/hooks/traceKeys'
import { TraceAPI } from '@/features/trace/services/traceAPI.services'

const DELETE_TRACE_ERROR_MESSAGES = {
  404: "Cette trace n'existe plus.",
}

type DeleteTraceInput = { traceId: string; caseId: string }

export function useDeleteTrace() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ traceId }: DeleteTraceInput) => {
      try {
        return await TraceAPI.remove(traceId)
      } catch (error) {
        throw toReadableError(error, DELETE_TRACE_ERROR_MESSAGES)
      }
    },
    onSuccess: (_data, { caseId }) => {
      queryClient.invalidateQueries({ queryKey: traceKeys.list(caseId) })
    },
  })
}
