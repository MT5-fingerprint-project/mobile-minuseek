import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/features/shared/auth/auth-context';
import { Button } from '@/features/shared/ui/button';
import { Text } from '@/features/shared/ui/text';
import {
  InvestigationCaseCreateModal,
  InvestigationCasesList,
  useInvestigationCases,
} from '@/features/investigation-case';

export default function HomeScreen() {
  const router = useRouter();
  const { slug, signOut } = useAuth();
  const [isCreateOpen, setCreateOpen] = useState(false);

  const { data: investigationCases = [], isPending } = useInvestigationCases();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom', 'left', 'right']}>
      <View className="flex-1 px-5 pb-4 pt-6">
        <View className="mb-4 flex-row items-start justify-between">
          <View className="flex-1">
            <Text className="text-2xl font-bold">Mes affaires</Text>
            <Text className="mt-1 text-sm text-muted-foreground">
              {slug ? `Organisation : ${slug}` : "Gérez vos affaires d'investigation."}
            </Text>
          </View>
          <Button variant="ghost" size="sm" onPress={() => void signOut()}>
            <Text>Déconnexion</Text>
          </Button>
        </View>

        <InvestigationCasesList
          investigationCases={investigationCases}
          isLoading={isPending}
          onAddClick={() => setCreateOpen(true)}
          onCasePress={(investigationCase) =>
            router.push({ pathname: '/case/[id]', params: { id: investigationCase.id } })
          }
        />
      </View>

      <InvestigationCaseCreateModal visible={isCreateOpen} onClose={() => setCreateOpen(false)} />
    </SafeAreaView>
  );
}
