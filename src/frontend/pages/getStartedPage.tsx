import { useState } from "react";

type ActionStatus = { type: "success"; message: string } | { type: "error"; message: string };

export function GetStartedPage() {
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState<ActionStatus>();
  const handleOAuthSubmit = (event: React.SubmitEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      setStatus({
        type: "error",
        message: "Please enter your Drednot username first.",
      });
      return;
    }
    globalThis.location.href = `/chat/link?username=${encodeURIComponent(trimmedUsername)}`;
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-3xl border border-yin-border bg-yin-bg-secondary p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-yin-accent">
          Discord OAuth
        </p>

        <h3 className="mt-4 text-2xl font-semibold text-yin-fg">Continue with Discord</h3>

        <p className="mt-2 text-sm leading-6 text-yin-fg-secondary">
          Authenticate with Discord to securely link your Drednot username to your Discord account.
        </p>

        <form onSubmit={handleOAuthSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-yin-fg">Drednot Username</label>

            <input
              type="text"
              value={username}
              onChange={(event: React.ChangeEvent<HTMLInputElement>): void => {
                setUsername(event.target.value);
              }}
              placeholder="PshsayGayz..."
              className="w-full rounded-xl border border-yin-border bg-yin-bg px-4 py-3 text-yin-fg focus:border-yin-accent focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-full bg-yin-inverse px-4 py-3 text-sm font-semibold text-yin-inverse-fg transition hover:opacity-90"
          >
            Continue with Discord OAuth
          </button>
        </form>
      </div>

      {status ? (
        <div
          className={`mt-6 rounded-3xl border p-4 text-sm ${
            status.type === "success"
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
              : "border-rose-500/20 bg-rose-500/10 text-rose-300"
          }`}
        >
          {status.message}
        </div>
      ) : undefined}

      <div className="mt-6 rounded-3xl border border-yin-border bg-yin-surface p-6 text-sm text-yin-fg-secondary">
        <p className="font-semibold">Notes</p>

        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>Discord OAuth securely verifies ownership of your Discord account.</li>

          <li>You will be redirected to Discord and returned after authorization.</li>

          <li>Manual Discord ID linking has been removed for security reasons.</li>
        </ul>
      </div>
    </div>
  );
}
