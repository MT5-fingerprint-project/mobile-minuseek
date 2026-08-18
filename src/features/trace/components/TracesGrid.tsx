import type { ReactElement } from 'react'
import { ActivityIndicator, FlatList, Pressable, RefreshControl, View } from 'react-native'

import { Button } from '@/features/shared/ui/button'
import { Text } from '@/features/shared/ui/text'
import TraceThumbnail from '@/features/trace/components/TraceThumbnail'
import type { Trace } from '@/features/trace/types/trace'

type TracesGridProps = {
  traces: Trace[]
  isLoading: boolean
  isRefreshing: boolean
  error: Error | null
  onRefresh: () => void
  onSelect: (trace: Trace) => void
  header?: ReactElement | null
}

function EmptyState({ isLoading, error, onRetry }: { isLoading: boolean; error: Error | null; onRetry: () => void }) {
  if (isLoading) {
    return (
      <View className="items-center gap-3 py-10">
        <ActivityIndicator size="small" color="#091029" />
        <Text className="text-sm text-muted-foreground">Chargement des traces…</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View className="items-center gap-3 py-10">
        <Text className="text-center text-sm text-muted-foreground">{error.message}</Text>
        <Button variant="outline" size="sm" onPress={onRetry}>
          <Text>Réessayer</Text>
        </Button>
      </View>
    )
  }

  return (
    <View className="items-center gap-1 py-10">
      <Text className="text-sm font-medium text-foreground">Aucune trace pour cette affaire</Text>
      <Text className="text-center text-sm text-muted-foreground">
        Prenez une photo ou importez une image pour commencer.
      </Text>
    </View>
  )
}

/** Un nombre impair de traces laisserait la dernière s'étirer sur toute la largeur. */
function padToEvenColumns(traces: Trace[]): (Trace | null)[] {
  return traces.length % 2 === 1 ? [...traces, null] : traces
}

export default function TracesGrid({
  traces,
  isLoading,
  isRefreshing,
  error,
  onRefresh,
  onSelect,
  header,
}: TracesGridProps) {
  return (
    <FlatList
      data={padToEvenColumns(traces)}
      keyExtractor={(item, index) => item?.id ?? `filler-${index}`}
      numColumns={2}
      // Les traces arrivent déjà triées `createdAt` desc par le back : ne pas retrier.
      ListHeaderComponent={
        <View className="gap-4">
          {header}
          {traces.length > 0 && (
            <Text className="text-sm font-medium text-muted-foreground">
              {traces.length} trace{traces.length > 1 ? 's' : ''}
            </Text>
          )}
        </View>
      }
      ListEmptyComponent={<EmptyState isLoading={isLoading} error={error} onRetry={onRefresh} />}
      renderItem={({ item }) =>
        item === null ? (
          <View className="flex-1" />
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ouvrir la trace"
            onPress={() => onSelect(item)}
            className="aspect-square flex-1 overflow-hidden rounded-lg border border-border bg-card active:opacity-90"
          >
            <TraceThumbnail trace={item} className="size-full" />
          </Pressable>
        )
      }
      columnWrapperStyle={{ gap: 12 }}
      contentContainerClassName="gap-3 px-5 pb-4 pt-4"
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#091029" />}
      showsVerticalScrollIndicator={false}
    />
  )
}
