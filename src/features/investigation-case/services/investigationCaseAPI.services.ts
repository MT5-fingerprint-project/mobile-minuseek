import { apiClient } from '@/features/shared/lib/apiClient';
import type {
  InvestigationCaseCreateInput,
  OpenInvestigationCaseResponse,
} from '@/features/investigation-case/types/investigationCase';

export const InvestigationCaseAPI = {
  create: (caseData: InvestigationCaseCreateInput) =>
    apiClient
      .post<OpenInvestigationCaseResponse>('/investigation-cases', caseData)
      .then((res) => res.data),
};
