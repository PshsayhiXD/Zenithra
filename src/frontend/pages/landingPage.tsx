import type { LandingConfig } from "@frontend/config/types.ts";
import { HeroSection } from "@frontend/components/sections/heroSection.tsx";
import { TrustStripSection } from "@frontend/components/sections/trustStripSection.tsx";
import { FeatureGridSection } from "@frontend/components/sections/featureGridSection.tsx";
import { CommandsShowcaseSection } from "@frontend/components/sections/commandsShowcaseSection.tsx";
import { EconomySection } from "@frontend/components/sections/economySection.tsx";
import { OpenSourceSection } from "@frontend/components/sections/openSourceSection.tsx";
import { SetupSection } from "@frontend/components/sections/setupSection.tsx";
import { FaqSection } from "@frontend/components/sections/faqSection.tsx";
import { FinalCtaSection } from "@frontend/components/sections/finalCtaSection.tsx";

type LandingPageProps = {
  config: LandingConfig;
};

export function LandingPage({ config }: LandingPageProps) {
  return (
    <>
      <HeroSection hero={config.hero} meta={config.meta} />
      <TrustStripSection highlights={config.trust} />
      <FeatureGridSection features={config.features} />
      <CommandsShowcaseSection categories={config.commands} />
      <EconomySection economy={config.economy} />
      <OpenSourceSection githubLink={config.links.github} openSource={config.openSource} />
      <SetupSection inviteLink={config.links.invite} setup={config.setup} />
      <FaqSection faq={config.faq} />
      <FinalCtaSection finalCta={config.finalCta} />
    </>
  );
}
