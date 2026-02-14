/**
 * Button component with consistent styling across the app
 *
 * @example
 * // Primary button (default)
 * <Button onClick={handleClick}>Click me</Button>
 *
 * @example
 * // Secondary button
 * <Button variant="secondary">Cancel</Button>
 *
 * @example
 * // Button as Link
 * <Button href="/posts" asChild>View Posts</Button>
 *
 * @example
 * // Different sizes
 * <Button size="sm">Small</Button>
 * <Button size="lg">Large</Button>
 */

import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";
import { ButtonHTMLAttributes, AnchorHTMLAttributes, forwardRef } from "react";

const buttonVariants = cva(
  // Base styles shared by all buttons
  "inline-flex items-center justify-center rounded-full font-medium transition-colors focus-ring disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary:
          "bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300",
        secondary:
          "border border-zinc-300 bg-transparent text-zinc-600 hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-500 dark:hover:text-zinc-100",
        ghost:
          "text-zinc-900 hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-800",
      },
      size: {
        sm: "px-4 py-1.5 text-sm",
        md: "px-5 py-2 text-sm",
        lg: "px-6 py-2.5 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: never;
}

export interface ButtonLinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">,
    VariantProps<typeof buttonVariants> {
  href: string;
  asChild?: true;
}

type ButtonOrLinkProps = ButtonProps | ButtonLinkProps;

export const Button = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonOrLinkProps
>(({ className, variant, size, asChild, ...props }, ref) => {
  const classes = buttonVariants({ variant, size, className });

  if (asChild && "href" in props) {
    return (
      <Link
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={props.href}
        className={classes}
        {...(props as Omit<ButtonLinkProps, 'asChild' | 'variant' | 'size' | 'className' | 'href'>)}
      />
    );
  }

  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      className={classes}
      {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
    />
  );
});

Button.displayName = "Button";
