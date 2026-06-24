import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { InvestigationCaseAPI } from '@/features/investigation-case/services/investigationCaseAPI.services';
import type { InvestigationCaseCreateInput } from '@/features/investigation-case/types/investigationCase';

export const investigationCaseKeys = {
  all: ['investigation-cases'] as const,
  lists: () => [...investigationCaseKeys.all, 'list'] as const,
  detail: (id: string) => [...investigationCaseKeys.all, 'detail', id] as const,
};

/** Turn an axios/network error into a user-facing French message. */
function toReadableError(error: unknown): Error {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 409) {
      return new Error("Une affaire avec ce numéro existe déjà.");
    }
    const apiMessage = (error.response?.data as { message?: string | string[] } | undefined)?.message;
    if (apiMessage) {
      return new Error(Array.isArray(apiMessage) ? apiMessage.join('\n') : apiMessage);
    }
    if (!error.response) {
      return new Error('Impossible de joindre le serveur. Vérifiez votre connexion.');
    }
  }
  return new Error('Une erreur est survenue');
}

export function useCreateInvestigationCase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: InvestigationCaseCreateInput) => {
      try {
        return await InvestigationCaseAPI.create(input);
      } catch (error) {
        throw toReadableError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: investigationCaseKeys.lists() });
    },
  });
}
