import type { CommandCategory } from "@frontend/config/types.ts";
import { SectionShell } from "@frontend/components/ui/sectionShell.tsx";
import { Card } from "@frontend/components/ui/card.tsx";
import { Badge } from "@frontend/components/ui/badge.tsx";

type CommandsShowcaseSectionProps = {
  categories: CommandCategory[];
};

export function CommandsShowcaseSection({ categories }: CommandsShowcaseSectionProps) {
  return (
    <SectionShell
      eyebrow="Command catalog"
      id="commands"
      subtitle="Representative inputs from the legacy and slash command sets - discover the full list via the bot or the HTTP command API."
      title="Commands that feel like a control panel"
    >
      <div className="grid gap-5 lg:grid-cols-2">
        {categories.map(category => (
          <Card className="overflow-hidden" elevated key={category.id}>
            <div className="border-b border-yin-border bg-yin-surface-raised px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold text-yin-fg">{category.title}</h3>
                <Badge label={`${String(category.examples.length)} examples`} tone="muted" />
              </div>
              <p className="mt-2 text-sm text-yin-muted">{category.description}</p>
            </div>
            <div className="divide-y divide-yin-border font-mono text-sm">
              {category.examples.map(example => (
                <div
                  className="flex flex-col gap-1 px-5 py-3.5 transition-colors hover:bg-yin-surface-raised sm:flex-row sm:items-center sm:justify-between"
                  key={`${category.id}-${example.input}`}
                >
                  <code className="text-yin-fg">
                    <span className="text-yin-muted select-none">$ </span>
                    {example.input}
                  </code>
                  <span className="font-sans text-xs text-yin-muted sm:max-w-[45%] sm:text-right">
                    {example.description}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </SectionShell>
  );
}
