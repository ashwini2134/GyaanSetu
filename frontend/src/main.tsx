import { StrictMode } from "react";

import { createRoot } from "react-dom/client";

import { HashRouter } from "react-router-dom";

import App from "./App";

import { AuthProvider } from "./auth";
import { ErrorBoundary } from "./components";

import "./index.css";

import { BrandingProvider } from "./context/BrandingContext";

createRoot(
  document.getElementById("root")!
).render(
  <StrictMode>
    <ErrorBoundary>
      <HashRouter>
        <AuthProvider>
          <BrandingProvider>
            <App />
          </BrandingProvider>
        </AuthProvider>
      </HashRouter>
    </ErrorBoundary>
  </StrictMode>
);
