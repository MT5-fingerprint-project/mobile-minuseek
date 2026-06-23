import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { ActivityIndicator, Pressable } from 'react-native';
import { TextClassContext } from '@/features/shared/ui/text';
import { cn } from '@/features/shared/lib/utils';

const buttonVariants = cva(
  'flex-row items-center justify-center gap-2 rounded-md',
  {
    variants: {
      variant: {
        default: 'bg-primary active:opacity-90',
        destructive: 'bg-destructive active:opacity-90',
        outline: 'border border-input bg-background active:bg-accent',
        secondary: 'bg-secondary active:opacity-80',
        ghost: 'active:bg-accent',
      },
      size: {
        default: 'h-11 px-5',
        sm: 'h-9 px-3',
        lg: 'h-12 px-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

const buttonTextVariants = cva('text-sm font-medium', {
  variants: {
    variant: {
      default: 'text-primary-foreground',
      destructive: 'text-destructive-foreground',
      outline: 'text-foreground',
      secondary: 'text-secondary-foreground',
      ghost: 'text-foreground',
    },
    size: {
      default: '',
      sm: '',
      lg: 'text-base',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

type ButtonProps = React.ComponentProps<typeof Pressable> &
  VariantProps<typeof buttonVariants> & {
    className?: string;
    loading?: boolean;
  };

function Button({
  className,
  variant,
  size,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <TextClassContext.Provider value={buttonTextVariants({ variant, size })}>
      <Pressable
        role="button"
        accessibilityState={{ disabled: isDisabled ?? false }}
        disabled={isDisabled}
        className={cn(buttonVariants({ variant, size }), isDisabled && 'opacity-50', className)}
        {...props}
      >
        {(state) => (
          <>
            {loading && (
              <ActivityIndicator size="small" color={variant === 'outline' || variant === 'ghost' ? '#1c1b18' : '#f2f2fb'} />
            )}
            {typeof children === 'function' ? children(state) : children}
          </>
        )}
      </Pressable>
    </TextClassContext.Provider>
  );
}

export { Button, buttonTextVariants, buttonVariants };
