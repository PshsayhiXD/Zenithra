import type { TrustHighlight } from "@frontend/config/types.ts";

type TrustStripSectionProps = {
  highlights: TrustHighlight[];
};

export function TrustStripSection({ highlights }: TrustStripSectionProps) {
  return (
    <section
      aria-label="Trust highlights"
      className="border-y border-yin-border bg-yin-surface py-10"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map(item => (
            <li className="flex flex-col gap-2 border-l border-yin-border pl-4" key={item.id}>
              <span className="text-sm font-semibold text-yin-fg">{item.label}</span>
              <span className="text-sm leading-relaxed text-yin-muted">{item.detail}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
