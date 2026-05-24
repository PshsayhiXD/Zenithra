import type { LandingConfig } from "@frontend/config/types.ts";

type SiteFooterProps = {
  config: Pick<LandingConfig, "meta" | "links">;
};

export function SiteFooter({ config }: SiteFooterProps) {
  return (
    <footer className="border-t border-yin-border py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p className="text-sm text-yin-muted">
          {config.meta.name} - {config.meta.tagline}
        </p>
        <div className="flex flex-wrap gap-6 text-sm">
          <a
            className="text-yin-muted underline-offset-4 transition-colors hover:text-yin-fg hover:underline"
            href={config.links.repository.href}
            rel="noopener noreferrer"
            target="_blank"
          >
            {config.links.repository.label}
          </a>
          <a
            className="text-yin-muted underline-offset-4 transition-colors hover:text-yin-fg hover:underline"
            href={config.links.license.href}
            rel="noopener noreferrer"
            target="_blank"
          >
            {config.links.license.label}
          </a>
        </div>
      </div>
    </footer>
  );
}
