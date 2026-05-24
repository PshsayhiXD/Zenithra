import { useState } from "react";
import { SectionShell } from "@frontend/components/ui/sectionShell.tsx";

interface ChatLinkFormPageProps {
  prefillUsername?: string;
  directLinkError?: string;
}

type DirectLinkStatus = { type: "success"; message: string } | { type: "error"; message: string };

interface ApiResponse {
  message?: string;
  error?: string;
}

export function ChatLinkFormPage({ prefillUsername = "", directLinkError }: ChatLinkFormPageProps) {
  const [username, setUsername] = useState(prefillUsername);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [directLinkStatus, setDirectLinkStatus] = useState<DirectLinkStatus | undefined>(
    directLinkError ? { type: "error", message: directLinkError } : undefined,
  );

  const [userId, setUserId] = useState("");
  const [showDirectLink] = useState(Boolean(directLinkError));

  const handleOAuthSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!username.trim()) return;
    globalThis.location.href = `/chat/link?username=${encodeURIComponent(username.trim())}`;
  };

  const handleDirectLinkSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setDirectLinkStatus(undefined);

    try {
      const res = await fetch("/chat/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          userId: userId.trim(),
        }),
      });
      const data = (await res.json()) as ApiResponse;
      if (res.ok) {
        setDirectLinkStatus({
          type: "success",
          message: data.message ?? "Account linked successfully!",
        });
        setTimeout(() => {
          globalThis.location.href = "/chat/link/success?success=true&message=Account%20Linked!";
        }, 1500);
      } else {
        setDirectLinkStatus({
          type: "error",
          message: data.error ?? "Failed to link account.",
        });
      }
    } catch (error: unknown) {
      setDirectLinkStatus({
        type: "error",
        message: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SectionShell id="link-form" title="">
      <div className="mx-auto max-w-md text-center">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-yin-accent">
          Account Linking
        </p>

        <h1 className="mb-2 text-3xl font-bold leading-tight text-yin-fg">Link Your Account</h1>

        <p className="mb-8 text-yin-fg-secondary">
          Connect your Drednot account with Discord to access additional features.
        </p>

        {!showDirectLink && (
          <form
            onSubmit={e => {
              handleOAuthSubmit(e);
            }}
            className="space-y-4"
          >
            <div className="text-left">
              <label className="block text-sm font-medium text-yin-fg mb-2">Drednot Username</label>

              <input
                type="text"
                value={username}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setUsername(e.target.value);
                }}
                placeholder="Enter your game username"
                required
                className="w-full px-4 py-2 rounded-lg bg-yin-bg-secondary border border-yin-bg-tertiary text-yin-fg placeholder-yin-fg-secondary focus:outline-none focus:border-yin-accent"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-yin-accent text-yin-accent-fg font-medium py-2 px-4 rounded-lg hover:bg-yin-accent-hover transition-colors"
            >
              Link with Discord OAuth2
            </button>
          </form>
        )}

        <div className="mt-8 border-t border-yin-bg-tertiary pt-8">
          <p className="text-sm text-yin-fg-secondary mb-4">
            {showDirectLink
              ? "Link manually using a Discord ID:"
              : "If OAuth2 is not configured, you can link directly:"}
          </p>

          <form
            onSubmit={e => {
              void handleDirectLinkSubmit(e);
            }}
            className="space-y-4"
          >
            {!showDirectLink && (
              <div className="text-left">
                <label className="block text-sm font-medium text-yin-fg mb-2">
                  Drednot Username
                </label>

                <input
                  type="text"
                  value={username}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setUsername(e.target.value);
                  }}
                  placeholder="Enter your game username"
                  required
                  className="w-full px-4 py-2 rounded-lg bg-yin-bg-secondary border border-yin-bg-tertiary text-yin-fg placeholder-yin-fg-secondary focus:outline-none focus:border-yin-accent"
                />
              </div>
            )}

            <div className="text-left">
              <label className="block text-sm font-medium text-yin-fg mb-2">Discord User ID</label>

              <input
                type="text"
                value={userId}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setUserId(e.target.value);
                }}
                placeholder="e.g. 184561234567890123"
                required
                className="w-full px-4 py-2 rounded-lg bg-yin-bg-secondary border border-yin-bg-tertiary text-yin-fg placeholder-yin-fg-secondary focus:outline-none focus:border-yin-accent"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-yin-accent text-yin-accent-fg font-medium py-2 px-4 rounded-lg hover:bg-yin-accent-hover transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Linking..." : "Link Directly"}
            </button>
          </form>

          {directLinkStatus && (
            <div
              className={`mt-4 p-3 rounded-lg text-sm ${
                directLinkStatus.type === "success"
                  ? "bg-green-500/10 text-green-400 border border-green-500/20"
                  : "bg-red-500/10 text-red-400 border border-red-500/20"
              }`}
            >
              {directLinkStatus.message}
            </div>
          )}
        </div>
      </div>
    </SectionShell>
  );
}
