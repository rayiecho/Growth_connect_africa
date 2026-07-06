import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variantClasses: Record<Variant, string> = {
  // Solid green pill — matches "Claim Offer" / "Logout" style buttons on the live site
  primary:
    "bg-brand-green text-white hover:bg-brand-green-dark focus-visible:ring-brand-green",
  // Outlined pill — matches "See Pricing" style
  secondary:
    "bg-white text-brand-charcoal border border-brand-line hover:border-brand-green focus-visible:ring-brand-green",
  ghost:
    "bg-transparent text-brand-slate hover:text-brand-green focus-visible:ring-brand-green",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", className = "", children, ...props }, ref) => (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center rounded-pill px-6 py-3 font-medium text-sm transition-colors
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
);
Button.displayName = "Button";

// The circular green icon button used for play/scroll actions on the live site.
export function CircleIconButton({
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`inline-flex items-center justify-center h-12 w-12 rounded-full bg-brand-green text-white
        hover:bg-brand-green-dark transition-colors focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-brand-green focus-visible:ring-offset-2 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
