import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Clerk's SDK resolves auth state (isLoaded) over the network before
// SignedIn/SignedOut can render anything, so buttons gated on it sit
// blank until that round trip finishes. Opening the connection to
// Clerk's Frontend API immediately (instead of waiting for clerk-js to
// load and do it) shaves that DNS/TLS handshake off the critical path.
function preconnectClerk() {
  const key = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  if (!key) return;
  try {
    const encodedFrontendApi = key.split("_")[2];
    const frontendApi = atob(encodedFrontendApi).replace(/\$$/, "");
    const link = document.createElement("link");
    link.rel = "preconnect";
    link.href = `https://${frontendApi}`;
    link.crossOrigin = "anonymous";
    document.head.appendChild(link);
  } catch {
    // Malformed key; ClerkProvider will surface the real error.
  }
}

preconnectClerk();

createRoot(document.getElementById("root")!).render(<App />);
