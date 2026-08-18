import { useQuery } from '@tanstack/react-query'

import { toReadableError } from '@/features/shared/lib/errors'
import { traceKeys } from '@/features/trace/hooks/traceKeys'
import { TraceAPI } from '@/features/trace/services/traceAPI.services'

const TRACES_ERROR_MESSAGES = {
  400: 'Cette affaire est introuvable.',
}

/**
 * Les `url` renvoyées sont des URLs GCS signées à durée de vie courte (900 s côté back) :
 * on garde un `staleTime` bas pour qu'un refetch les resigne avant expiration.
 */
const SIGNED_URL_STALE_TIME_MS = 60_000

export function useTraces(caseId: string | undefined) {
  return useQuery({
    queryKey: traceKeys.list(caseId ?? ''),
    queryFn: async () => {
      if (!caseId) throw new Error('Cette affaire est introuvable.')
      try {
        return await TraceAPI.list(caseId)
      } catch (error) {
        throw toReadableError(error, TRACES_ERROR_MESSAGES)
      }
    },
    enabled: Boolean(caseId),
    staleTime: SIGNED_URL_STALE_TIME_MS,
  })
}
