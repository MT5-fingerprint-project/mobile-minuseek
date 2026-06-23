import * as React from 'react';
import { TextInput } from 'react-native';
import { cn } from '@/features/shared/lib/utils';

type InputProps = React.ComponentProps<typeof TextInput> & {
  className?: string;
};

function Input({ className, placeholderClassName, ...props }: InputProps & { placeholderClassName?: string }) {
  return (
    <TextInput
      className={cn(
        'h-11 rounded-md border border-input bg-card px-3 text-base text-foreground',
        props.editable === false && 'opacity-50',
        className,
      )}
      placeholderTextColor="#8c897c"
      {...props}
    />
  );
}

export { Input };
