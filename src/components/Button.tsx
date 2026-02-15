import { cva, type VariantProps } from "class-variance-authority";
import { Link } from "next-view-transitions";
import { ButtonHTMLAttributes, AnchorHTMLAttributes, forwardRef } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-sm font-medium transition-colors focus-ring disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary:
          "bg-accent text-background hover:bg-accent-muted",
        secondary:
          "border border-border bg-transparent text-text-secondary hover:border-border-hover hover:text-text-primary",
        ghost:
          "text-text-primary hover:bg-hover-bg",
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
