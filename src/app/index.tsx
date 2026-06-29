import { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/features/shared/ui/text';
import {
  InvestigationCaseCreateModal,
  InvestigationCasesList,
  useInvestigationCases,
} from '@/features/investigation-case';

export default function HomeScreen() {
  const [isCreateOpen, setCreateOpen] = useState(false);

  const { data: investigationCases = [], isPending } = useInvestigationCases();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom', 'left', 'right']}>
      <View className="flex-1 px-5 pb-4 pt-6">
        <Text className="text-2xl font-bold">Mes affaires</Text>
        <Text className="mb-4 mt-1 text-sm text-muted-foreground">
          Gérez vos affaires d'investigation.
        </Text>

        <InvestigationCasesList
          investigationCases={investigationCases}
          isLoading={isPending}
          onAddClick={() => setCreateOpen(true)}
        />
      </View>

      <InvestigationCaseCreateModal visible={isCreateOpen} onClose={() => setCreateOpen(false)} />
    </SafeAreaView>
  );
}
