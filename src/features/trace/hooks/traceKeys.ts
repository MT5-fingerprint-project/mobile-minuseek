export const traceKeys = {
  all: ['traces'] as const,
  list: (caseId: string) => [...traceKeys.all, 'list', caseId] as const,
}
