import { Pressable, View } from 'react-native';
import { Text } from '@/features/shared/ui/text';
import { CaseStatusBadge } from '@/features/investigation-case/components/CaseStatusBadge';
import type { InvestigationCase } from '@/features/investigation-case/types/investigationCase';

type InvestigationCaseCardProps = {
  investigationCase: InvestigationCase;
  onPress?: (investigationCase: InvestigationCase) => void;
};

export default function InvestigationCaseCard({ investigationCase, onPress }: InvestigationCaseCardProps) {
  const formattedDate = new Date(investigationCase.createdAt).toLocaleDateString('fr-FR');

  return (
    <Pressable
      onPress={onPress ? () => onPress(investigationCase) : undefined}
      className="min-h-44 rounded-lg border border-border bg-card p-4 active:opacity-90"
    >
      <View className="gap-2">
        <CaseStatusBadge status={investigationCase.status} />
        <Text className="text-lg font-semibold text-card-foreground">
          Affaire N°{investigationCase.caseNumber}
        </Text>
        <Text className="text-sm text-muted-foreground">PV N°{investigationCase.pvNumber}</Text>
      </View>

      <View className="mt-3">
        <Text className="text-xs text-muted-foreground">Créé le {formattedDate}</Text>
      </View>
    </Pressable>
  );
}
