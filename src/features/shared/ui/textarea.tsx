import * as React from 'react';
import { TextInput } from 'react-native';
import { cn } from '@/features/shared/lib/utils';

type TextareaProps = React.ComponentProps<typeof TextInput> & {
  className?: string;
};

function Textarea({ className, ...props }: TextareaProps) {
  return (
    <TextInput
      multiline
      textAlignVertical="top"
      className={cn(
        'min-h-24 rounded-md border border-input bg-card px-3 py-2 text-base text-foreground',
        props.editable === false && 'opacity-50',
        className,
      )}
      placeholderTextColor="#8c897c"
      {...props}
    />
  );
}

export { Textarea };
