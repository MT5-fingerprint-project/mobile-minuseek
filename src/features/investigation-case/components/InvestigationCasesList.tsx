import { ActivityIndicator, FlatList, Pressable, View } from 'react-native'

import InvestigationCaseCard from '@/features/investigation-case/components/InvestigationCaseCard'
import type { InvestigationCase } from '@/features/investigation-case/types/investigationCase'
import { Text } from '@/features/shared/ui/text'

type InvestigationCasesListProps = {
  investigationCases: InvestigationCase[]
  isLoading: boolean
  onAddClick: () => void
  onCasePress?: (investigationCase: InvestigationCase) => void
  /** Tirer vers le bas pour recharger. Sans ce rappel, le geste est inactif. */
  onRefresh?: () => void
  /** Vrai pendant le rechargement déclenché par le geste : pilote l'indicateur. */
  isRefreshing?: boolean
}

function AddNewCard({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="min-h-44 items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border active:bg-muted"
    >
      <View className="size-10 items-center justify-center rounded-full border border-border">
        <Text className="text-xl text-muted-foreground">+</Text>
      </View>
      <Text className="text-sm font-medium text-muted-foreground">Ajouter une nouvelle affaire</Text>
    </Pressable>
  )
}

export default function InvestigationCasesList({
  investigationCases,
  isLoading,
  onAddClick,
  onCasePress,
  onRefresh,
  isRefreshing = false,
}: InvestigationCasesListProps) {
  return (
    <FlatList
      data={investigationCases}
      keyExtractor={(item) => item.id}
      // The dashed "add new" card leads the grid, exactly like the web front.
      ListHeaderComponent={<AddNewCard onPress={onAddClick} />}
      ListFooterComponent={isLoading ? <ActivityIndicator size="small" color="#091029" className="mt-4" /> : null}
      renderItem={({ item }) => <InvestigationCaseCard investigationCase={item} onPress={onCasePress} />}
      contentContainerClassName="gap-4 pb-4"
      showsVerticalScrollIndicator={false}
      // `onRefresh` absent → FlatList n'affiche aucun indicateur et ignore le geste.
      onRefresh={onRefresh}
      refreshing={isRefreshing}
    />
  )
}
