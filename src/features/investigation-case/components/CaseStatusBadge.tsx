import { View } from 'react-native';
import { Text } from '@/features/shared/ui/text';
import { cn } from '@/features/shared/lib/utils';
import type { InvestigationCaseStatus } from '@/features/investigation-case/types/investigationCase';

// Mirrors front-minuseek `CaseStatusBadge`: same palette, same label mapping.
const containerStyles: Record<InvestigationCaseStatus, string> = {
  OPEN: 'bg-grey-light-1 border-grey-dark',
  IN_PROGRESS: 'bg-orange-light border-orange-medium',
  UNDER_REVIEW: 'bg-blue-light-1 border-blue-dark-1',
  CLOSED: 'bg-green-light border-green-medium',
};

const textStyles: Record<InvestigationCaseStatus, string> = {
  OPEN: 'text-grey-dark',
  IN_PROGRESS: 'text-orange-medium',
  UNDER_REVIEW: 'text-blue-dark-1',
  CLOSED: 'text-green-medium',
};

const labels: Record<InvestigationCaseStatus, string> = {
  OPEN: 'Ouverte',
  IN_PROGRESS: 'En cours',
  UNDER_REVIEW: 'En vérification',
  CLOSED: 'Fermée',
};

export function CaseStatusBadge({ status }: { status: InvestigationCaseStatus }) {
  return (
    <View className={cn('self-start rounded-full border px-2 py-1', containerStyles[status])}>
      <Text className={cn('text-sm font-medium', textStyles[status])}>{labels[status]}</Text>
    </View>
  );
}
