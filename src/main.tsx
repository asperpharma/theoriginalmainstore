import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "./components/ErrorBoundary";
import App from "./App.tsx";
import "./index.css";

function showFatalError(container: Element, err: unknown) {
  console.error("[Asper] Fatal render error:", err);
  container.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f8f8ff;font-family:sans-serif;padding:2rem">
      <div style="max-width:480px;text-align:center;background:#fff;border-radius:12px;padding:2.5rem;box-shadow:0 4px 24px rgba(128,0,32,0.12)">
        <div style="width:56px;height:56px;border-radius:50%;background:#fff0f3;display:flex;align-items:center;justify-content:center;margin:0 auto 1.25rem">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#800020" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        </div>
        <h1 style="font-size:1.4rem;font-weight:700;color:#1a0505;margin-bottom:.5rem">Brief technical interruption</h1>
        <p style="color:#666;margin-bottom:1.5rem;line-height:1.6">We're experiencing a temporary issue. Please try again in a moment.</p>
        <button onclick="window.location.reload()" style="background:#800020;color:#fff;border:none;padding:.75rem 2rem;border-radius:8px;font-size:.95rem;cursor:pointer;font-weight:600">Reload Page</button>
      </div>
    </div>
  `;
}

try {
  const rootEl = document.getElementById("root");
  if (!rootEl) throw new Error("Root element #root not found in DOM");

  createRoot(rootEl).render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>,
  );
} catch (err) {
  const fallback = document.getElementById("root") ?? document.body;
  showFatalError(fallback, err);
}
