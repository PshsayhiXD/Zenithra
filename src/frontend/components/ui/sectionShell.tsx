import type { ReactNode } from "react";

type SectionShellProps = {
  id: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  alt?: boolean;
};

export function SectionShell({
  id,
  eyebrow,
  title,
  subtitle,
  children,
  className = "",
  alt = false,
}: SectionShellProps) {
  return (
    <section
      aria-labelledby={`${id}-title`}
      className={`relative scroll-mt-24 py-20 sm:py-24 lg:py-28 ${alt ? "yin-section-alt" : ""} ${className}`}
      id={id}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <header className="mb-12 max-w-2xl">
          {eyebrow ? (
            <p className="mb-4 text-xs font-semibold tracking-[0.2em] text-yin-muted uppercase">
              {eyebrow}
            </p>
          ) : undefined}
          <h2
            className="yin-headline text-3xl font-semibold tracking-tight text-yin-fg sm:text-4xl lg:text-5xl"
            id={`${id}-title`}
          >
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-5 text-base leading-relaxed text-yin-muted sm:text-lg">{subtitle}</p>
          ) : undefined}
        </header>
        {children}
      </div>
    </section>
  );
}
