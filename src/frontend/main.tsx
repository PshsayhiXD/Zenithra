import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "@frontend/app.tsx";
import "@frontend/styles/globals.css";

const rootElement = document.querySelector("#root");

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
