import type { LandingConfig } from "@frontend/config/types.ts";
import { Button } from "@frontend/components/ui/button.tsx";
import { Badge } from "@frontend/components/ui/badge.tsx";
import { Card } from "@frontend/components/ui/card.tsx";

type HeroSectionProps = {
  hero: LandingConfig["hero"];
  meta: LandingConfig["meta"];
};

export function HeroSection({ hero, meta }: HeroSectionProps) {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative overflow-hidden pb-20 pt-16 sm:pb-28 sm:pt-20 lg:pb-32 lg:pt-24"
      id="top"
    >
      <div aria-hidden className="yin-grid pointer-events-none absolute inset-0 opacity-80" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-[1fr_0.9fr] lg:gap-12">
          <div>
            <Badge label={hero.eyebrow} tone="accent" />
            <h1
              className="yin-headline mt-8 text-4xl font-semibold tracking-tight text-yin-fg sm:text-5xl lg:text-6xl lg:leading-[1.05]"
              id="hero-title"
            >
              {hero.headline}
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-yin-muted sm:text-lg">
              {hero.subheadline}
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button link={hero.primaryCta} variant="primary" />
              <Button link={hero.secondaryCta} variant="secondary" />
            </div>
            <dl className="mt-14 grid grid-cols-3 gap-6 border-t border-yin-border pt-8">
              {hero.stats.map(stat => (
                <div key={stat.id}>
                  <dt className="text-[0.65rem] font-semibold tracking-[0.15em] text-yin-muted uppercase">
                    {stat.label}
                  </dt>
                  <dd className="mt-2 text-sm font-medium text-yin-fg sm:text-base">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div aria-label={`${meta.name} overview`} className="relative flex flex-col items-center">

            {/*<div
              aria-hidden
              className="mb-8 text-yin-fg opacity-90 lg:absolute lg:-top-8 lg:right-0 lg:mb-0"
            >
              <ZenithraIcon className="drop-shadow-sm" size={120} />
            </div>*/}
            <Card className="w-full p-5 sm:p-6" elevated>
              <div className="mb-5 flex items-center justify-between border-b border-yin-border pb-4">
                <span className="text-xs font-semibold tracking-[0.15em] text-yin-muted uppercase">
                  Overview
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-yin-fg">
                  <span className="h-1.5 w-1.5 rounded-full bg-yin-fg" />
                  Online
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {hero.panels.map(panel => (
                  <div
                    className="rounded-xl border border-yin-border bg-yin-surface-raised p-3 transition-transform duration-200 hover:-translate-y-0.5"
                    key={panel.id}
                  >
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <h3 className="text-xs font-semibold text-yin-fg">{panel.title}</h3>
                      <Badge label={panel.status} tone="muted" />
                    </div>
                    <ul className="space-y-2">
                      {panel.rows.map(row => (
                        <li className="flex justify-between gap-2 text-xs" key={row.id}>
                          <span className="text-yin-muted">{row.label}</span>
                          <span className="font-medium text-yin-fg">{row.value}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
