import { createRoot } from "react-dom/client";
import App from "./App";
import AdminApp from "./admin/AdminApp";
import "./index.css";

const hostname = window.location.hostname.toLowerCase();
const isAdminHost = hostname.startsWith("banka-yonetim-paneli");
const isAdminPath = window.location.pathname === "/admin" || window.location.pathname === "/admin/";
const isAdminRoute = isAdminHost || isAdminPath;
const SHARED_API = "https://banka-yonetim-paneli.vercel.app/api/state";

async function loadSharedState() {
  try {
    const response = await fetch(`${SHARED_API}?t=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) return;

    const data = await response.json();

    if (data.account) {
      localStorage.setItem("demo_account", JSON.stringify(data.account));
      if (data.account.balance !== undefined && data.account.balance !== null) {
        localStorage.setItem("demo_balance", String(data.account.balance));
      }
    }

    if (Array.isArray(data.transactions)) {
      localStorage.setItem("demo_transactions", JSON.stringify(data.transactions));
    }
  } catch {
    // Keep the last known local data if the shared API is temporarily unavailable.
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
    // Always open the panel from the canonical shared state first.
    // This prevents stale preview tabs/localStorage from overwriting account movements.
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
