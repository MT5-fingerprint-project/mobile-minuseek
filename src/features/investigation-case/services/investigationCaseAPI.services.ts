import type {
  InvestigationCase,
  InvestigationCaseCreateInput,
  OpenInvestigationCaseResponse,
} from '@/features/investigation-case/types/investigationCase'
import { apiClient } from '@/features/shared/lib/apiClient'

export const InvestigationCaseAPI = {
  create: (caseData: InvestigationCaseCreateInput) =>
    apiClient.post<OpenInvestigationCaseResponse>('/investigation-cases', caseData).then((res) => res.data),

  getAll: () => apiClient.get<{ data: InvestigationCase[] }>('/investigation-cases').then((res) => res.data),

  // Contrairement à `getAll`, le détail est renvoyé sans enveloppe `{ data }`.
  getById: (id: string) => apiClient.get<InvestigationCase>(`/investigation-cases/${id}`).then((res) => res.data),
}
