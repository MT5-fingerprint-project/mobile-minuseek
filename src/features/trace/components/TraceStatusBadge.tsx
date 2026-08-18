import { View } from 'react-native'

import { cn } from '@/features/shared/lib/utils'
import { Text } from '@/features/shared/ui/text'
import type { TraceStatus } from '@/features/trace/types/trace'

// Même palette que `CaseStatusBadge` (tokens de `tailwind.config.js`).
const containerStyles: Record<TraceStatus, string> = {
  RECEIVED: 'bg-blue-light-1 border-blue-dark-1',
  EXPLOITABLE: 'bg-green-light border-green-medium',
  NOT_EXPLOITABLE: 'bg-orange-light border-orange-medium',
}

const textStyles: Record<TraceStatus, string> = {
  RECEIVED: 'text-blue-dark-1',
  EXPLOITABLE: 'text-green-medium',
  NOT_EXPLOITABLE: 'text-orange-medium',
}

const labels: Record<TraceStatus, string> = {
  RECEIVED: 'Reçue',
  EXPLOITABLE: 'Exploitable',
  NOT_EXPLOITABLE: 'Non exploitable',
}

// Un statut inconnu (nouveau statut côté back) doit rester lisible, pas planter.
const UNKNOWN_CONTAINER = 'bg-grey-light-1 border-grey-dark'
const UNKNOWN_TEXT = 'text-grey-dark'

export function TraceStatusBadge({ status }: { status: TraceStatus }) {
  const container = containerStyles[status] ?? UNKNOWN_CONTAINER
  const text = textStyles[status] ?? UNKNOWN_TEXT
  const label = labels[status] ?? status

  return (
    <View className={cn('self-start rounded-full border px-2 py-1', container)}>
      <Text className={cn('text-sm font-medium', text)}>{label}</Text>
    </View>
  )
}
