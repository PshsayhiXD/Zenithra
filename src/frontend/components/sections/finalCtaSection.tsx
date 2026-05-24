import type { LandingConfig } from "@frontend/config/types.ts";
import { Button } from "@frontend/components/ui/button.tsx";
import { Card } from "@frontend/components/ui/card.tsx";

type FinalCtaSectionProps = {
  finalCta: LandingConfig["finalCta"];
};

export function FinalCtaSection({ finalCta }: FinalCtaSectionProps) {
  return (
    <section aria-labelledby="final-cta-title" className="pb-24 pt-6">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Card className="relative overflow-hidden px-6 py-14 text-center sm:px-12" elevated>
          {/*
            <div
              aria-hidden
              className="pointer-events-none absolute -right-8 -top-8 text-yin-fg opacity-[0.07]"
            >
              <ZenithraIcon size={200} />
            </div>
          */}
          <div className="relative">
            <h2
              className="yin-headline text-2xl font-semibold tracking-tight text-yin-fg sm:text-4xl"
              id="final-cta-title"
            >
              {finalCta.title}
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base text-yin-muted">{finalCta.subtitle}</p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Button link={finalCta.primaryCta} variant="primary" />
              <Button link={finalCta.secondaryCta} variant="secondary" />
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
