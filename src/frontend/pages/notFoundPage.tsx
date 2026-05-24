export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="text-6xl font-bold text-yin-fg">404</div>
      <p className="max-w-md text-yin-muted">
        This page might have been removed, or you may have mistyped the address. Try going back to
        the home page or use the navigation menu.
      </p>
      <a
        href="/"
        className="rounded-lg bg-yin-accent px-6 py-2 font-medium text-yin-inverse transition-colors hover:bg-yin-accent/90"
      >
        Back to home
      </a>
    </div>
  );
}
