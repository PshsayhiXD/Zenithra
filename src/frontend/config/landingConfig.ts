// eslint-disable-next-line import-x/extensions
import type { LandingConfig } from "@frontend/config/types.ts";

const GITHUB_REPO = "https://github.com/PshsayhiXD/zenithra";

export const landingConfig: LandingConfig = {
  meta: {
    name: "Zenithra",
    tagline: "",
    description:
      "Zenithra brings a configurable economy, Drednot.io utilities, and a growing command set to your Discord server - built for the Drednot.io community.",
  },
  nav: [
    { id: "get-started", label: "Get Started", href: "/get-started" },
    { id: "features", label: "Features" },
    { id: "commands", label: "Commands" },
    { id: "economy", label: "Economy" },
    { id: "open-source", label: "Open source" },
    { id: "setup", label: "Setup" },
    { id: "faq", label: "FAQ" },
  ],
  links: {
    invite: {
      label: "Get Started",
      href: "/get-started",
    },
    commands: {
      label: "View Commands",
      href: "#commands",
    },
    github: {
      label: "View on GitHub",
      href: GITHUB_REPO,
      external: true,
    },
    repository: {
      label: "Repository",
      href: GITHUB_REPO,
      external: true,
    },
    license: {
      label: "GPL-3.0 License",
      href: `${GITHUB_REPO}/blob/main/LICENSE`,
      external: true,
    },
  },
  hero: {
    eyebrow: "Drednot.io community bot",
    headline: "Your server hub for economy, commands, and Drednot tools",
    subheadline:
      "Zenithra is an open-source Discord bot with a custom wallet-and-bank economy, legacy and slash commands, and Drednot.io ship tracking - designed to stay fast, transparent, and easy to extend.",
    primaryCta: {
      label: "Get Started",
      href: "/get-started",
    },
    secondaryCta: {
      label: "View Commands",
      href: "#commands",
    },
    stats: [
      { id: "runtime", label: "Runtime", value: "Sharded Node.js" },
      { id: "storage", label: "Persistence", value: "SQLite" },
      { id: "license", label: "License", value: "GPL-3.0" },
    ],
    panels: [
      {
        id: "economy",
        title: "Economy snapshot",
        status: "Live",
        rows: [
          { id: "wallet", label: "Wallet", value: "Multi-currency" },
          { id: "bank", label: "Bank", value: "Deposit / withdraw" },
          { id: "daily", label: "Daily", value: "24h cooldown" },
        ],
      },
      {
        id: "drednot",
        title: "Drednot.io",
        status: "Guild",
        rows: [
          { id: "channel", label: "Tracker channel", value: "Per-guild config" },
          { id: "mission", label: "Mission timer", value: "Slash command" },
          { id: "pvp", label: "PvP events", value: "Slash command" },
        ],
      },
      {
        id: "commands",
        title: "Command surface",
        status: "Growing",
        rows: [
          { id: "legacy", label: "Legacy prefix", value: "Economy · fun · utility" },
          { id: "slash", label: "Slash", value: "Drednot.io globals" },
          { id: "api", label: "HTTP API", value: "Catalog & execute" },
        ],
      },
    ],
  },
  trust: [
    {
      id: "oss",
      label: "Open source",
      detail: "GPL-3.0 - inspect, fork, and contribute on GitHub.",
    },
    {
      id: "config",
      label: "Configurable",
      detail: "Guild channels, economy tables, and env-driven invite URLs.",
    },
    {
      id: "fast",
      label: "Lightweight",
      detail: "SQLite persistence and focused handlers - no bloat stack.",
    },
    {
      id: "community",
      label: "Community-driven",
      detail: "Built for the Drednot.io Discord community.",
    },
  ],
  features: [
    {
      id: "economy",
      title: "Custom economy",
      description:
        "Wallet and bank balances, daily rewards, inventory items, transfers, and currency compression backed by SQLite.",
      tag: "Economy",
    },
    {
      id: "commands",
      title: "Rich commands",
      description:
        "Legacy prefix commands plus slash commands for Drednot.io - with a catalog API for discovery and execution.",
      tag: "Commands",
    },
    {
      id: "opensource",
      title: "Open source",
      description:
        "Full source on GitHub under GPL-3.0. Customize behavior, audit changes, and ship improvements with the community.",
      tag: "Transparency",
    },
    {
      id: "admin",
      title: "Admin & permissions",
      description:
        "Command permissions, cooldowns, and admin-only tools such as resource management for trusted operators.",
      tag: "Control",
    },
    {
      id: "utility",
      title: "Utility features",
      description:
        "Ping, bot info, user and server info, avatars, invites, and account linking helpers for everyday moderation.",
      tag: "Utility",
    },
    {
      id: "performance",
      title: "Lightweight and fast",
      description:
        "Sharded Node.js runtime, SQLite persistence, and focused handlers - built to stay responsive on busy community servers.",
      tag: "Performance",
    },
  ],
  commands: [
    {
      id: "economy",
      title: "Economy",
      description: "Wallet, bank, daily rewards, inventory, and currency actions.",
      examples: [
        { input: "balance", description: "Show wallet, bank, and currency items" },
        { input: "daily", description: "Claim your daily reward (24h cooldown)" },
        { input: "deposit 500", description: "Move funds from wallet to bank" },
        { input: "transfer @user 100", description: "Send currency to another member" },
        { input: "inventory", description: "List owned economy items" },
      ],
    },
    {
      id: "drednot",
      title: "Drednot.io",
      description: "Guild configuration and slash utilities for the Drednot community.",
      examples: [
        { input: "setChannel #tracker", description: "Set the guild ship-tracker channel" },
        { input: "setMission", description: "Configure mission tracking (legacy)" },
        { input: "/missionTimer", description: "Slash: mission timer utilities" },
        { input: "/pvpEvent", description: "Slash: PvP event helpers" },
      ],
    },
    {
      id: "fun",
      title: "Fun",
      description: "Lightweight engagement commands for your community.",
      examples: [
        { input: "8ball Will we win?", description: "Magic 8-ball style responses" },
        { input: "coinflip", description: "Flip a coin" },
        { input: "roll 2d6", description: "Roll dice with custom notation" },
        { input: "meme", description: "Fetch a random meme" },
      ],
    },
    {
      id: "utility",
      title: "Utility",
      description: "Server diagnostics and member information.",
      examples: [
        { input: "ping", description: "Check bot latency" },
        { input: "botinfo", description: "Runtime and version details" },
        { input: "userinfo @member", description: "Profile summary for a member" },
        { input: "serverinfo", description: "Guild metadata overview" },
      ],
    },
    {
      id: "info",
      title: "Info & access",
      description: "Onboarding helpers and account linking.",
      examples: [
        { input: "invite", description: "Post the configured bot invite URL" },
        { input: "link", description: "Link Discord and Drednot identities" },
        { input: "avatar @member", description: "Show a member avatar" },
      ],
    },
  ],
  economy: {
    title: "Economy built like a dashboard",
    subtitle:
      "Balances, banks, dailies, and inventories are first-class - stored per user in SQLite and surfaced through focused economy commands.",
    metrics: [
      {
        id: "wallet",
        label: "Wallet",
        value: "Multi-item",
        hint: "Flux crystals, metals, explosives, lootboxes, and more",
        tone: "wallet",
      },
      {
        id: "bank",
        label: "Bank",
        value: "Capacity",
        hint: "Deposit and withdraw between wallet and bank",
        tone: "bank",
      },
      {
        id: "daily",
        label: "Daily reward",
        value: "24h",
        hint: "Claim on cooldown via the daily command",
        tone: "reward",
      },
      {
        id: "inventory",
        label: "Inventory",
        value: "Per user",
        hint: "Track owned economy items in the database",
        tone: "inventory",
      },
      {
        id: "slots",
        label: "Slots & beg",
        value: "Risk / earn",
        hint: "Optional sinks and earn paths for engagement",
        tone: "activity",
      },
      {
        id: "compress",
        label: "Compress",
        value: "Upgrade",
        hint: "Convert currency tiers through compression",
        tone: "activity",
      },
    ],
    flows: [
      {
        id: "earn",
        title: "Earn",
        description: "Claim dailies, use slots, or beg when you need a boost.",
      },
      {
        id: "store",
        title: "Store",
        description: "Deposit surplus into your bank up to capacity limits.",
      },
      {
        id: "trade",
        title: "Transfer",
        description: "Send currency to other members with the transfer command.",
      },
    ],
  },
  openSource: {
    title: "Transparent by design",
    subtitle:
      "Zenithra ships as open source so you can verify behavior, self-host, and adapt the bot to your community without a black box.",
    highlights: [
      {
        id: "audit",
        title: "Audit the code",
        description: "Read command handlers, economy tables, and tracker services directly in the repository.",
      },
      {
        id: "customize",
        title: "Customize safely",
        description: "Extend legacy commands, slash commands, or backend routes using the existing project layout.",
      },
      {
        id: "contribute",
        title: "Contribute back",
        description: "Open issues and pull requests on GitHub to improve commands, docs, and Drednot integrations.",
      },
    ],
    repositoryFacts: [
      { label: "Repository", value: "PshsayhiXD/zenithra" },
      { label: "License", value: "GNU GPL v3" },
      { label: "Stack", value: "TypeScript · discord.js · SQLite" },
    ],
  },
  setup: {
    title: "Get started in three steps",
    subtitle:
      "Host Zenithra yourself or join a server that already runs it. Configure your invite URL in the environment when self-hosting.",
    steps: [
      {
        id: "invite",
        step: "01",
        title: "Invite",
        description:
          "Add Zenithra to your Discord server",
      },
      {
        id: "configure",
        step: "02",
        title: "Configure",
        description:
          "Set guild channels for Drednot tracking, copy .env from .env.example, and run migrations on first boot.",
      },
      {
        id: "use",
        step: "03",
        title: "Use",
        description:
          "Run economy commands, Drednot slash tools, and utilities. Discover commands via the in-bot help flow or the HTTP catalog.",
      },
    ],
  },
  faq: {
    title: "Frequently asked questions",
    items: [
      {
        id: "setup-host",
        question: "How do I host Zenithra myself?",
        answer:
          "Clone the repository, run npm install, copy .env from .env.example, fill in Discord and Drednot variables, then npm run build:clean and npm run start for the sharded runtime.",
      },
      {
        id: "invite-url",
        question: "Where does the invite link come from?",
        answer:
          "Self-hosted deployments set OPT_DISCORD_BOT_INVITE_URL in the environment. The invite command reads that value and posts it in Discord.",
      },
      {
        id: "customize",
        question: "Can I customize commands or economy rules?",
        answer:
          "Yes. Commands live under src/commands/, economy logic under src/databases/tables/economy/, and currency config under src/configs/. Changes require a rebuild and bot restart.",
      },
      {
        id: "economy-persist",
        question: "Is economy data persisted?",
        answer:
          "Yes. Balances, banks, inventories, cooldowns, and streaks are stored in SQLite. Development uses data/bot.local.db; production uses data/bot.db.",
      },
      {
        id: "commands-discover",
        question: "How do I discover available commands?",
        answer:
          "Use legacy prefix commands in Discord, slash commands where registered, or the backend command catalog at /command for programmatic discovery.",
      },
    ],
  },
  finalCta: {
    title: "Ready to bring Zenithra to your server?",
    subtitle:
      "Invite the bot, explore the source, and shape the economy and Drednot tooling your community needs.",
    primaryCta: {
      label: "Get Started",
      href: "/get-started",
    },
    secondaryCta: {
      label: "View on GitHub",
      href: GITHUB_REPO,
      external: true,
    },
  },
};
