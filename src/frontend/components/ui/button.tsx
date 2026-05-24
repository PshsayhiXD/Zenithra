import type { LinkTarget } from "@frontend/config/types.ts";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = {
  link: LinkTarget;
  variant: ButtonVariant;
  className?: string;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-yin-inverse text-yin-inverse-fg hover:opacity-90 shadow-[0_8px_24px_var(--yin-ring)]",
  secondary:
    "border border-yin-border bg-yin-surface text-yin-fg hover:bg-yin-surface-raised",
  ghost: "text-yin-muted hover:text-yin-fg hover:bg-yin-surface-raised",
};

export function Button({ link, variant, className = "" }: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yin-fg";
  const classes = `${base} ${variantClasses[variant]} ${className}`;

  if (link.external) {
    return (
      <a className={classes} href={link.href} rel="noopener noreferrer" target="_blank">
        {link.label}
      </a>
    );
  }

  return (
    <a className={classes} href={link.href}>
      {link.label}
    </a>
  );
}
