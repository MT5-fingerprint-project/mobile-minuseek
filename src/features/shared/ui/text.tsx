import * as React from 'react';
import { Text as RNText } from 'react-native';
import { cn } from '@/features/shared/lib/utils';

/**
 * Lets a parent (e.g. Button) push text styling down to any nested <Text>,
 * matching the react-native-reusables pattern.
 */
export const TextClassContext = React.createContext<string | undefined>(undefined);

type TextProps = React.ComponentProps<typeof RNText> & {
  className?: string;
};

function Text({ className, ...props }: TextProps) {
  const textClass = React.useContext(TextClassContext);
  return (
    <RNText className={cn('text-base text-foreground', textClass, className)} {...props} />
  );
}

export { Text };
