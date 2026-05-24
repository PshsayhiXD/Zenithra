import type { LandingConfig } from "@frontend/config/types.ts";
import { SectionShell } from "@frontend/components/ui/sectionShell.tsx";
import { Card } from "@frontend/components/ui/card.tsx";

type EconomySectionProps = {
  economy: LandingConfig["economy"];
};

export function EconomySection({ economy }: EconomySectionProps) {
  return (
    <SectionShell alt id="economy" subtitle={economy.subtitle} title={economy.title}>
      <div className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="grid gap-4 sm:grid-cols-2">
          {economy.metrics.map(metric => (
            <Card className="p-5" key={metric.id}>
              <p className="text-[0.65rem] font-semibold tracking-[0.15em] text-yin-muted uppercase">
                {metric.label}
              </p>
              <p className="yin-headline mt-3 text-3xl font-semibold text-yin-fg">{metric.value}</p>
              <p className="mt-3 text-sm leading-relaxed text-yin-muted">{metric.hint}</p>
            </Card>
          ))}
        </div>

        <Card className="flex flex-col justify-between p-6" elevated>
          <div>
            <p className="text-xs font-semibold tracking-[0.15em] text-yin-muted uppercase">Flow</p>
            <h3 className="mt-2 text-lg font-semibold text-yin-fg">Typical session</h3>
          </div>
          <ol className="mt-8 space-y-5">
            {economy.flows.map((flow, index) => (
              <li className="flex gap-4" key={flow.id}>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-yin-border bg-yin-inverse text-xs font-bold text-yin-inverse-fg">
                  {index + 1}
                </span>
                <div>
                  <p className="font-semibold text-yin-fg">{flow.title}</p>
                  <p className="mt-1 text-sm text-yin-muted">{flow.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </Card>
      </div>
    </SectionShell>
  );
}
