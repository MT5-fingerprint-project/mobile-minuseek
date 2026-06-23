import * as React from 'react';
import { View } from 'react-native';
import { Label } from '@/features/shared/ui/label';
import { Text } from '@/features/shared/ui/text';
import { cn } from '@/features/shared/lib/utils';

/**
 * Field / FieldLabel / FieldError mirror the web front's `ui/field` primitives so
 * the form layout stays consistent across web and mobile.
 */

function Field({ className, ...props }: React.ComponentProps<typeof View>) {
  return <View className={cn('gap-1.5', className)} {...props} />;
}

function FieldLabel({ className, ...props }: React.ComponentProps<typeof Label>) {
  return <Label className={className} {...props} />;
}

/** tanstack-form surfaces zod issues as objects ({ message }) or plain strings. */
type FieldErrorItem = string | { message?: string } | undefined | null;

function FieldError({ errors }: { errors?: FieldErrorItem[] }) {
  const messages = (errors ?? [])
    .map((error) => (typeof error === 'string' ? error : error?.message))
    .filter((message): message is string => Boolean(message));

  if (messages.length === 0) return null;

  return <Text className="text-sm text-destructive">{messages[0]}</Text>;
}

export { Field, FieldLabel, FieldError };
