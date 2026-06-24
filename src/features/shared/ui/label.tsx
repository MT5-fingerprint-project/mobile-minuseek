import * as React from 'react';
import { Text } from '@/features/shared/ui/text';
import { cn } from '@/features/shared/lib/utils';

type LabelProps = React.ComponentProps<typeof Text> & {
  className?: string;
};

function Label({ className, ...props }: LabelProps) {
  return <Text className={cn('text-sm font-medium text-foreground', className)} {...props} />;
}

export { Label };
