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
    // Fall back to the app's existing local data when the shared API is unavailable.
  }
}

async function syncAdminState() {
  try {
    const accountRaw = localStorage.getItem("demo_account");
    const transactionsRaw = localStorage.getItem("demo_transactions");
    const response = await fetch(SHARED_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        account: accountRaw ? JSON.parse(accountRaw) : undefined,
        transactions: transactionsRaw ? JSON.parse(transactionsRaw) : undefined,
      }),
    });

    if (!response.ok) {
      throw new Error(`Shared state sync failed: ${response.status}`);
    }
  } catch {
    // Keep the existing localStorage behavior if the API is unavailable.
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
    forceAdminApiToCanonicalHost();

    const originalSetItem = Storage.prototype.setItem;
    let syncTimer: number | undefined;

    Storage.prototype.setItem = function (key: string, value: string) {
      originalSetItem.call(this, key, value);
      if (key !== "demo_account" && key !== "demo_transactions") return;
      window.clearTimeout(syncTimer);
      syncTimer = window.setTimeout(syncAdminState, 100);
    };
  } else {
    await loadSharedState();
    window.setInterval(loadSharedState, 1500);
  }

  createRoot(document.getElementById("root")!).render(
    isAdminRoute ? <AdminApp /> : <App />,
  );
}

start();
