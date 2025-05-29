import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transform active:scale-95",
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-lg shadow-primary/60 border-b-4 border-primary/90 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/70 active:border-b-2 active:translate-y-0.5',
        destructive:
          'bg-destructive text-white shadow-lg shadow-destructive/60 border-b-4 border-destructive/90 hover:bg-destructive/90 hover:shadow-xl hover:shadow-destructive/70 active:border-b-2 active:translate-y-0.5',
        outline:
          'border-2 border-input bg-background shadow-md shadow-gray-400/50 hover:bg-accent hover:text-accent-foreground hover:shadow-lg hover:shadow-gray-500/60 active:shadow-sm active:translate-y-0.5',
        secondary:
          'bg-secondary text-secondary-foreground shadow-lg shadow-secondary/60 border-b-4 border-secondary/90 hover:bg-secondary/80 hover:shadow-xl hover:shadow-secondary/70 active:border-b-2 active:translate-y-0.5',
        ghost:
          'hover:bg-accent hover:text-accent-foreground rounded-lg active:bg-accent/80',
        link: 'text-primary underline-offset-4 hover:underline font-semibold',
        // Duolingo-inspired color variants
        green:
          'bg-green-500 text-white shadow-lg shadow-green-500/60 border-b-4 border-green-600 hover:bg-green-600 hover:shadow-xl hover:shadow-green-600/70 active:border-b-2 active:translate-y-0.5',
        blue:
          'bg-blue-500 text-white shadow-lg shadow-blue-500/60 border-b-4 border-blue-600 hover:bg-blue-600 hover:shadow-xl hover:shadow-blue-600/70 active:border-b-2 active:translate-y-0.5',
        yellow:
          'bg-yellow-500 text-white shadow-lg shadow-yellow-500/60 border-b-4 border-yellow-600 hover:bg-yellow-600 hover:shadow-xl hover:shadow-yellow-600/70 active:border-b-2 active:translate-y-0.5',
        orange:
          'bg-orange-500 text-white shadow-lg shadow-orange-500/60 border-b-4 border-orange-600 hover:bg-orange-600 hover:shadow-xl hover:shadow-orange-600/70 active:border-b-2 active:translate-y-0.5',
        purple:
          'bg-purple-500 text-white shadow-lg shadow-purple-500/60 border-b-4 border-purple-600 hover:bg-purple-600 hover:shadow-xl hover:shadow-purple-600/70 active:border-b-2 active:translate-y-0.5',
        pink:
          'bg-pink-500 text-white shadow-lg shadow-pink-500/60 border-b-4 border-pink-600 hover:bg-pink-600 hover:shadow-xl hover:shadow-pink-600/70 active:border-b-2 active:translate-y-0.5',
        indigo:
          'bg-indigo-500 text-white shadow-lg shadow-indigo-500/60 border-b-4 border-indigo-600 hover:bg-indigo-600 hover:shadow-xl hover:shadow-indigo-600/70 active:border-b-2 active:translate-y-0.5',
        teal:
          'bg-teal-500 text-white shadow-lg shadow-teal-500/60 border-b-4 border-teal-600 hover:bg-teal-600 hover:shadow-xl hover:shadow-teal-600/70 active:border-b-2 active:translate-y-0.5',
        emerald:
          'bg-emerald-500 text-white shadow-lg shadow-emerald-500/60 border-b-4 border-emerald-600 hover:bg-emerald-600 hover:shadow-xl hover:shadow-emerald-600/70 active:border-b-2 active:translate-y-0.5',
        sky:
          'bg-sky-500 text-white shadow-lg shadow-sky-500/60 border-b-4 border-sky-600 hover:bg-sky-600 hover:shadow-xl hover:shadow-sky-600/70 active:border-b-2 active:translate-y-0.5',
        rose:
          'bg-rose-500 text-white shadow-lg shadow-rose-500/60 border-b-4 border-rose-600 hover:bg-rose-600 hover:shadow-xl hover:shadow-rose-600/70 active:border-b-2 active:translate-y-0.5',
        lime:
          'bg-lime-500 text-white shadow-lg shadow-lime-500/60 border-b-4 border-lime-600 hover:bg-lime-600 hover:shadow-xl hover:shadow-lime-600/70 active:border-b-2 active:translate-y-0.5',
      },
      size: {
        default: 'h-12 px-8 py-3 text-base has-[>svg]:px-6',
        sm: 'h-10 rounded-lg gap-1.5 px-4 text-sm has-[>svg]:px-3',
        lg: 'h-14 rounded-xl px-10 text-lg has-[>svg]:px-8',
        icon: 'size-12 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
