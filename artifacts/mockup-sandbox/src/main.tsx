import { createRoot } from "react-dom/client";
import App from "./App";
import AdminApp from "./admin/AdminApp";
import "./index.css";
import "./home-reference.css";
import "./shortcut-reference.css";
import "./header-background-reference.css";
import "./header-static-final.css";
import "./header-live-reference.css";
import "./transactions-typography-reference.css";
import "./transactions-message-fee-row";
import "./pdf-approved-logo-patch";
import "./transactions-pdf-reference-final";
import "./receipt-pdf-reference";
import "./receipt-mail-pdf-fix";
import "./receipt-fee-policy";
import "./login-safearea-reference";

const hostname = window.location.hostname.toLowerCase();
const isAdminHost = hostname.startsWith("banka-yonetim-paneli");
const isAdminPath = window.location.pathname === "/admin" || window.location.pathname === "/admin/";
const isAdminRoute = isAdminHost || isAdminPath;
const SHARED_API = "https://banka-yonetim-paneli.vercel.app/api/state";

async function loadSharedState() {
  try {
    const response = await fetch(`${SHARED_API}?t=${Date.now()}`, {
      cache: "no-store",
    });
    if (!response.ok) return;

    const data = await response.json();

    if (data.account) {
      localStorage.setItem("demo_account", JSON.stringify(data.account));
      if (data.account.balance !== undefined && data.account.balance !== null) {
        localStorage.setItem("demo_balance", String(data.account.balance));
      }
    }

    // The management panel/API is the single source of truth.
    // Store the remote list exactly as returned so edits and deletions are not
    // reintroduced from stale localStorage data.
    if (Array.isArray(data.transactions)) {
      localStorage.setItem(
        "demo_transactions",
        JSON.stringify(data.transactions),
      );
    }
  } catch {
    // Keep the last successfully loaded local state while the API is unavailable.
  }
}

function forceAdminApiToCanonicalHost() {
  const nativeFetch = window.fetch.bind(window);

  window.fetch = ((input: any, init?: any) => {
    let target = input;

    if (typeof input === "string" && input.startsWith("/api/state")) {
      target = `${SHARED_API}${input.slice("/api/state".length)}`;
    }

    return nativeFetch(target, init);
  }) as typeof window.fetch;
}

async function start() {
  if (isAdminRoute) {
    await loadSharedState();
    forceAdminApiToCanonicalHost();
  } else {
    await loadSharedState();
    window.setInterval(loadSharedState, 1500);
  }

  createRoot(document.getElementById("root")!).render(
    isAdminRoute ? <AdminApp /> : <App />,
  );
}

start();
