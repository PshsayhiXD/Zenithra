import type { LandingConfig } from "@frontend/config/types.ts";
import { SectionShell } from "@frontend/components/ui/sectionShell.tsx";
import { Card } from "@frontend/components/ui/card.tsx";
import { Button } from "@frontend/components/ui/button.tsx";

type OpenSourceSectionProps = {
  openSource: LandingConfig["openSource"];
  githubLink: LandingConfig["links"]["github"];
};

export function OpenSourceSection({ openSource, githubLink }: OpenSourceSectionProps) {
  return (
    <SectionShell
      eyebrow="Open source"
      id="open-source"
      subtitle={openSource.subtitle}
      title={openSource.title}
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
        <ul className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
          {openSource.highlights.map(item => (
            <li key={item.id}>
              <Card className="h-full p-6">
                <h3 className="font-semibold text-yin-fg">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-yin-muted">{item.description}</p>
              </Card>
            </li>
          ))}
        </ul>

        <Card className="p-6 font-mono text-sm" elevated>
          <div className="mb-5 flex items-center gap-2 border-b border-yin-border pb-4">
            <span className="h-2.5 w-2.5 rounded-full border border-yin-border bg-yin-fg" />
            <span className="h-2.5 w-2.5 rounded-full border border-yin-border bg-yin-muted" />
            <span className="h-2.5 w-2.5 rounded-full border border-yin-border bg-yin-surface-raised" />
            <span className="ml-2 text-xs text-yin-muted">repository</span>
          </div>
          <dl className="space-y-4">
            {openSource.repositoryFacts.map(fact => (
              <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between" key={fact.label}>
                <dt className="text-yin-muted">{fact.label}</dt>
                <dd className="font-medium text-yin-fg">{fact.value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-8">
            <Button link={githubLink} variant="secondary" />
          </div>
        </Card>
      </div>
    </SectionShell>
  );
}
