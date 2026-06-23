import { z } from 'zod';

export const investigationCaseStatusSchema = z.enum(['OPEN', 'IN_PROGRESS', 'UNDER_REVIEW', 'CLOSED']);
export type InvestigationCaseStatus = z.infer<typeof investigationCaseStatusSchema>;

export interface InvestigationCase {
  id: string;
  description?: string | undefined;
  caseNumber: string;
  pvNumber: string;
  status: InvestigationCaseStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * Matches the back's `OpenInvestigationCaseDto`:
 *   POST /investigation-cases { caseNumber, pvNumber, description? }
 */
export const investigationCaseCreateSchema = z.object({
  caseNumber: z.string().trim().min(1, "Le numéro d'affaire est requis"),
  pvNumber: z.string().trim().min(1, 'Le numéro de PV est requis'),
  description: z.string().trim().max(2000, 'La description est trop longue').optional(),
});

export type InvestigationCaseCreateInput = z.infer<typeof investigationCaseCreateSchema>;

/** The back returns the new id on creation (201). */
export interface OpenInvestigationCaseResponse {
  id: string;
}
