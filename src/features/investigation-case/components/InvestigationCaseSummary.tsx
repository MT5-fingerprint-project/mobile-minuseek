import { View } from 'react-native'

import { CaseStatusBadge } from '@/features/investigation-case/components/CaseStatusBadge'
import type { InvestigationCase } from '@/features/investigation-case/types/investigationCase'
import { Text } from '@/features/shared/ui/text'

type InvestigationCaseSummaryProps = {
  investigationCase: InvestigationCase
}

export default function InvestigationCaseSummary({ investigationCase }: InvestigationCaseSummaryProps) {
  const formattedDate = new Date(investigationCase.createdAt).toLocaleDateString('fr-FR')

  return (
    <View className="gap-2 rounded-lg border border-border bg-card p-4">
      <CaseStatusBadge status={investigationCase.status} />
      <Text className="text-lg font-semibold text-card-foreground">Affaire N°{investigationCase.caseNumber}</Text>
      <Text className="text-sm text-muted-foreground">PV N°{investigationCase.pvNumber}</Text>
      {investigationCase.description ? (
        <Text className="text-sm text-card-foreground">{investigationCase.description}</Text>
      ) : null}
      <Text className="text-xs text-muted-foreground">Créée le {formattedDate}</Text>
    </View>
  )
}
