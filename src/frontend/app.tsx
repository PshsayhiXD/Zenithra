/* eslint-disable unicorn/prefer-global-this */
import { useMemo } from "react";
import { landingConfig } from "@frontend/config/landingConfig.ts";
import { SiteHeader } from "@frontend/components/layout/siteHeader.tsx";
import { SiteFooter } from "@frontend/components/layout/siteFooter.tsx";
import { LandingPage } from "@frontend/pages/landingPage.tsx";
import { NotFoundPage } from "@frontend/pages/notFoundPage.tsx";
import { ChatLinkPage } from "@frontend/pages/chatLinkPage.tsx";
import { ChatLinkFormPage } from "@frontend/pages/chatLinkFormPage.tsx";
import { GetStartedPage } from "@frontend/pages/getStartedPage.tsx";
import { ThemeProvider } from "@frontend/context/themeProvider.tsx";

export function App() {
  const currentPath = useMemo(() => window.location.pathname, []);
  const searchParams = useMemo(() => new URLSearchParams(window.location.search), []);

  const isLandingPage = currentPath === "/" || currentPath === "";
  const isChatLinkPage = currentPath === "/chat/link" || currentPath.startsWith("/chat/link/");
  const isFormPage = currentPath === "/chat/link" && !searchParams.has("success");

  const isGetStartedPage = currentPath === "/get-started" || currentPath === "/get-started/";

  const renderPage = () => {
    if (isLandingPage) return <LandingPage config={landingConfig} />;
    if (isGetStartedPage) return <GetStartedPage />;
    if (isChatLinkPage) {
      if (isFormPage) {
        const username = searchParams.get("username") ?? "";
        const directLinkError = searchParams.get("error") ?? undefined;
        return <ChatLinkFormPage prefillUsername={username} directLinkError={directLinkError} />;
      }
      const isSuccess = searchParams.get("success") === "true";
      const message = searchParams.get("message") ?? undefined;
      const details = searchParams.get("details") ?? undefined;
      return <ChatLinkPage isSuccess={isSuccess} message={message} details={details} />;
    }
    return <NotFoundPage />;
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-yin-bg">
        <a
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:rounded-full focus:bg-yin-inverse focus:px-4 focus:py-2 focus:text-yin-inverse-fg"
          href="#top"
        >
          Skip to content
        </a>
        <SiteHeader config={landingConfig} />
        <main>
          {renderPage()}
        </main>
        <SiteFooter config={landingConfig} />
      </div>
    </ThemeProvider>
  );
}
