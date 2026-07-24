import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toReadableError } from '@/features/shared/lib/errors';
import { InvestigationCaseAPI } from '@/features/investigation-case/services/investigationCaseAPI.services';
import type { InvestigationCaseCreateInput } from '@/features/investigation-case/types/investigationCase';

export const investigationCaseKeys = {
  all: ['investigation-cases'] as const,
  lists: () => [...investigationCaseKeys.all, 'list'] as const,
  detail: (id: string) => [...investigationCaseKeys.all, 'detail', id] as const,
};

const CASE_ERROR_MESSAGES = {
  409: 'Une affaire avec ce numéro existe déjà.',
};

export function useInvestigationCases() {
  return useQuery({
    queryKey: investigationCaseKeys.lists(),
    queryFn: () => InvestigationCaseAPI.getAll(),
    select: ({ data }) => data,
  });
}

export function useCreateInvestigationCase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: InvestigationCaseCreateInput) => {
      try {
        return await InvestigationCaseAPI.create(input);
      } catch (error) {
        throw toReadableError(error, CASE_ERROR_MESSAGES);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: investigationCaseKeys.lists() });
    },
  });
}
