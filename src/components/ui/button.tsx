import { Slot } from 'radix-ui';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full font-semibold whitespace-nowrap transition-[background,opacity,transform,box-shadow] duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] select-none active:scale-[0.96] disabled:pointer-events-none disabled:bg-fill disabled:text-label-3 disabled:shadow-none [&_svg]:size-[1.1em] [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        tint: 'bg-tint text-on-tint hover:bg-tint-hover',
        ink: 'bg-ink text-on-ink hover:opacity-85',
        secondary: 'bg-fill text-label hover:bg-fill-strong',
        tinted: 'bg-tint-soft text-tint hover:bg-tint-soft/70',
        plain: 'text-tint hover:bg-tint-soft',
        glass: 'bg-raised text-label shadow-glass',
        photo: 'glass-on-photo',
        white: 'bg-white text-black hover:bg-white/90',
        destructive: 'bg-red-soft text-red hover:bg-red-soft/70',
      },
      size: {
        sm: 'h-8 px-3 text-footnote',
        md: 'h-10 px-4 text-subhead',
        lg: 'h-12 px-6 text-callout font-bold',
        icon: 'size-10 text-[1.15rem]',
        'icon-sm': 'size-8 text-base',
        'icon-lg': 'size-11 text-[1.2rem]',
      },
    },
    defaultVariants: { variant: 'tint', size: 'md' },
  },
);

export type ButtonProps = ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean };

export function Button({ className, variant, size, asChild, ...props }: ButtonProps) {
  const Comp = asChild ? Slot.Root : 'button';
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
