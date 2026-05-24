import type { FeatureItem } from "@frontend/config/types.ts";
import { SectionShell } from "@frontend/components/ui/sectionShell.tsx";
import { Card } from "@frontend/components/ui/card.tsx";
import { Badge } from "@frontend/components/ui/badge.tsx";

type FeatureGridSectionProps = {
  features: FeatureItem[];
};

export function FeatureGridSection({ features }: FeatureGridSectionProps) {
  return (
    <SectionShell
      alt
      eyebrow="Capabilities"
      id="features"
      subtitle="Modular systems you can trace in the repository - from SQLite economy tables to Drednot tracker services."
      title="Built for servers that want depth without clutter"
    >
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map(feature => (
          <li key={feature.id}>
            <Card className="group h-full p-6 transition-colors hover:border-yin-fg/30">
              <Badge label={feature.tag} tone="muted" />
              <h3 className="mt-5 text-lg font-semibold text-yin-fg">{feature.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-yin-muted">{feature.description}</p>
            </Card>
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}
