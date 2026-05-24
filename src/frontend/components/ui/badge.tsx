type BadgeProps = {
  label: string;
  tone?: "default" | "accent" | "success" | "muted";
};

const toneClasses = {
  default: "border-yin-border bg-yin-surface text-yin-muted",
  accent: "border-yin-fg bg-yin-fg text-yin-bg",
  success: "border-yin-border bg-yin-surface-raised text-yin-fg",
  muted: "border-transparent bg-yin-surface-raised text-yin-muted",
};

export function Badge({ label, tone = "default" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-[0.65rem] font-semibold tracking-[0.12em] uppercase ${toneClasses[tone]}`}
    >
      {label}
    </span>
  );
}
