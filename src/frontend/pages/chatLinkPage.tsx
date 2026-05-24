import { SectionShell } from "@frontend/components/ui/sectionShell.tsx";

interface ChatLinkPageProps {
  isSuccess?: boolean;
  message?: string;
  details?: string;
}

export function ChatLinkPage({ isSuccess, message, details }: ChatLinkPageProps) {
  return (
    <SectionShell id={"success"} title={""}>
      <div className="mx-auto max-w-2xl text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-yin-accent">
          {isSuccess ? "Success" : "Error"}
        </p>
        <h1 className="mb-6 text-4xl font-bold leading-tight text-yin-fg">
          {message ?? (isSuccess ? "Account Linked!" : "Linking Failed")}
        </h1>
        {details && (
          <p className="mb-6 text-lg text-yin-fg-secondary">{details}</p>
        )}
        {isSuccess && (
          <p className="text-yin-fg-secondary">You can now close this tab or return to the main page.</p>
        )}
        <a
          href="/"
          className="mt-8 inline-block rounded-lg bg-yin-accent px-6 py-3 font-medium text-yin-accent-fg hover:bg-yin-accent-hover transition-colors"
        >
          Back to Home
        </a>
      </div>
    </SectionShell>
  );
}
