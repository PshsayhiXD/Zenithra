import type { LandingConfig } from "@frontend/config/types.ts";
import { Button } from "@frontend/components/ui/button.tsx";
import { ThemeToggle } from "@frontend/components/ui/themeToggle.tsx";
import { ZenithraIcon } from "@frontend/components/ui/zenithraIcon.tsx";

type SiteHeaderProps = {
  config: Pick<LandingConfig, "meta" | "nav" | "links">;
};

export function SiteHeader({ config }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-yin-border bg-yin-bg/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <a className="group flex items-center gap-3" href="#top">
          <span className="">
            <ZenithraIcon size={50} />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-tight text-yin-fg">
              {config.meta.name}
            </span>
            <span className="hidden text-xs text-yin-muted sm:block">{config.meta.tagline}</span>
          </span>
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
          {config.nav.map(item => (
            <a
              className="text-sm text-yin-muted transition-colors hover:text-yin-fg"
              href={item.href ?? `#${item.id}`}
              key={item.id}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <Button className="hidden sm:inline-flex" link={config.links.github} variant="ghost" />
          <Button link={config.links.invite} variant="primary" />
        </div>
      </div>
    </header>
  );
}
