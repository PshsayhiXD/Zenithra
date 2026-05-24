import type { LandingConfig } from "@frontend/config/types.ts";
import { SectionShell } from "@frontend/components/ui/sectionShell.tsx";
import { Card } from "@frontend/components/ui/card.tsx";

type FaqSectionProps = {
  faq: LandingConfig["faq"];
};

export function FaqSection({ faq }: FaqSectionProps) {
  return (
    <SectionShell id="faq" title={faq.title}>
      <ul className="grid gap-4">
        {faq.items.map(item => (
          <li key={item.id}>
            <Card className="p-6">
              <h3 className="text-base font-semibold text-yin-fg">{item.question}</h3>
              <p className="mt-3 text-sm leading-relaxed text-yin-muted">{item.answer}</p>
            </Card>
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}
