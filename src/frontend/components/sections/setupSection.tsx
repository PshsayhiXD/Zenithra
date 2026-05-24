import type { LandingConfig } from "@frontend/config/types.ts";
import { SectionShell } from "@frontend/components/ui/sectionShell.tsx";
import { Card } from "@frontend/components/ui/card.tsx";
import { Button } from "@frontend/components/ui/button.tsx";

type SetupSectionProps = {
  setup: LandingConfig["setup"];
  inviteLink: LandingConfig["links"]["invite"];
};

export function SetupSection({ setup, inviteLink }: SetupSectionProps) {
  return (
    <SectionShell alt id="setup" subtitle={setup.subtitle} title={setup.title}>
      <ol className="grid gap-5 md:grid-cols-3">
        {setup.steps.map(step => (
          <li key={step.id}>
            <Card className="h-full p-6">
              <span className="text-4xl font-semibold text-yin-subtle">{step.step}</span>
              <h3 className="mt-5 text-lg font-semibold text-yin-fg">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-yin-muted">{step.description}</p>
            </Card>
          </li>
        ))}
      </ol>
      <div className="mt-10 flex justify-center">
        <Button link={inviteLink} variant="primary" />
      </div>
    </SectionShell>
  );
}
