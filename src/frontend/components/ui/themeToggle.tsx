import { themeLabels } from "@frontend/config/theme.ts";
import { useTheme } from "@frontend/context/themeProvider.tsx";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      aria-label={themeLabels.toggle}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-yin-border bg-yin-surface text-yin-fg transition-colors hover:bg-yin-surface-raised focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yin-fg"
      onClick={toggleTheme}
      type="button"
    >
      <span className="sr-only">{isDark ? themeLabels.light : themeLabels.dark}</span>
      {isDark ? (
        <svg aria-hidden className="h-5 w-5" fill="none" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.5"
          />
        </svg>
      ) : (
        <svg
          aria-hidden
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          viewBox="0 0 24 24"
        >
          <path
            d="M20.354 15.354A9 9 0 0 1 8.646 3.646 7 7 0 1 0 20.354 15.354Z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
