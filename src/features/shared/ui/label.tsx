import * as React from 'react'

import { cn } from '@/features/shared/lib/utils'
import { Text } from '@/features/shared/ui/text'

type LabelProps = React.ComponentProps<typeof Text> & {
  className?: string
}

function Label({ className, ...props }: LabelProps) {
  return <Text className={cn('text-sm font-medium text-foreground', className)} {...props} />
}

export { Label }
