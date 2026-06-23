import { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/features/shared/ui/button';
import { Text } from '@/features/shared/ui/text';
import { InvestigationCaseCreateModal } from '@/features/investigation-case';

export default function HomeScreen() {
  const [isCreateOpen, setCreateOpen] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom', 'left', 'right']}>
      <View className="flex-1 px-5 pb-4 pt-6">
        <Text className="text-2xl font-bold">Mes affaires</Text>
        <Text className="mt-1 text-sm text-muted-foreground">
          Gérez vos affaires d'investigation.
        </Text>

        <View className="flex-1 items-center justify-center">
          <Text className="text-center text-base text-muted-foreground">
            Aucune affaire pour le moment.
          </Text>
        </View>

        <Button size="lg" onPress={() => setCreateOpen(true)}>
          <Text>Nouvelle affaire</Text>
        </Button>
      </View>

      <InvestigationCaseCreateModal visible={isCreateOpen} onClose={() => setCreateOpen(false)} />
    </SafeAreaView>
  );
}
