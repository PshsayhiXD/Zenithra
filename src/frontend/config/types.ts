export interface LinkTarget {
  label: string;
  href: string;
  external?: boolean;
};

export interface NavItem {
  id: string;
  label: string;
  href?: string;
};

export interface TrustHighlight {
  id: string;
  label: string;
  detail: string;
};

export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  tag: string;
};

export interface CommandExample {
  input: string;
  description: string;
};

export interface CommandCategory {
  id: string;
  title: string;
  description: string;
  examples: CommandExample[];
};

export interface EconomyMetric {
  id: string;
  label: string;
  value: string;
  hint: string;
  tone: "wallet" | "bank" | "reward" | "inventory" | "activity";
};

export interface EconomyFlowStep {
  id: string;
  title: string;
  description: string;
};

export interface OpenSourceHighlight {
  id: string;
  title: string;
  description: string;
};

export interface SetupStep {
  id: string;
  step: string;
  title: string;
  description: string;
};

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
};

export interface HeroStat {
  id: string;
  label: string;
  value: string;
};

export interface DashboardPanelRow {
  id: string;
  label: string;
  value: string;
  delta?: string;
};

export interface DashboardPanel {
  id: string;
  title: string;
  status: string;
  rows: DashboardPanelRow[];
};

export interface SiteMeta {
  name: string;
  tagline: string;
  description: string;
};

export interface LandingConfig {
  meta: SiteMeta;
  nav: NavItem[];
  links: {
    invite: LinkTarget;
    commands: LinkTarget;
    github: LinkTarget;
    repository: LinkTarget;
    license: LinkTarget;
  };
  hero: {
    eyebrow: string;
    headline: string;
    subheadline: string;
    primaryCta: LinkTarget;
    secondaryCta: LinkTarget;
    stats: HeroStat[];
    panels: DashboardPanel[];
  };
  trust: TrustHighlight[];
  features: FeatureItem[];
  commands: CommandCategory[];
  economy: {
    title: string;
    subtitle: string;
    metrics: EconomyMetric[];
    flows: EconomyFlowStep[];
  };
  openSource: {
    title: string;
    subtitle: string;
    highlights: OpenSourceHighlight[];
    repositoryFacts: { label: string; value: string }[];
  };
  setup: {
    title: string;
    subtitle: string;
    steps: SetupStep[];
  };
  faq: {
    title: string;
    items: FaqItem[];
  };
  finalCta: {
    title: string;
    subtitle: string;
    primaryCta: LinkTarget;
    secondaryCta: LinkTarget;
  };
};
