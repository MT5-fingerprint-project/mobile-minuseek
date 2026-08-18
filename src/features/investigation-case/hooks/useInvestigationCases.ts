import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { InvestigationCaseAPI } from '@/features/investigation-case/services/investigationCaseAPI.services'
import type { InvestigationCaseCreateInput } from '@/features/investigation-case/types/investigationCase'
import { toReadableError } from '@/features/shared/lib/errors'

export const investigationCaseKeys = {
  all: ['investigation-cases'] as const,
  lists: () => [...investigationCaseKeys.all, 'list'] as const,
  detail: (id: string) => [...investigationCaseKeys.all, 'detail', id] as const,
}

const CASE_ERROR_MESSAGES = {
  409: 'Une affaire avec ce numéro existe déjà.',
}

const CASE_DETAIL_ERROR_MESSAGES = {
  404: 'Cette affaire est introuvable.',
}

export function useInvestigationCases() {
  return useQuery({
    queryKey: investigationCaseKeys.lists(),
    queryFn: () => InvestigationCaseAPI.getAll(),
    select: ({ data }) => data,
  })
}

export function useInvestigationCase(id: string | undefined) {
  return useQuery({
    queryKey: investigationCaseKeys.detail(id ?? ''),
    queryFn: async () => {
      if (!id) throw new Error('Cette affaire est introuvable.')
      try {
        return await InvestigationCaseAPI.getById(id)
      } catch (error) {
        throw toReadableError(error, CASE_DETAIL_ERROR_MESSAGES)
      }
    },
    enabled: Boolean(id),
  })
}

export function useCreateInvestigationCase() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: InvestigationCaseCreateInput) => {
      try {
        return await InvestigationCaseAPI.create(input)
      } catch (error) {
        throw toReadableError(error, CASE_ERROR_MESSAGES)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: investigationCaseKeys.lists() })
    },
  })
}
