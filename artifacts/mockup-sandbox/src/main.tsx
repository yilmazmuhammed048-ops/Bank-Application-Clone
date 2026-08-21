import { createRoot } from "react-dom/client";
import App from "./App";
import AdminApp from "./admin/AdminApp";
import "./index.css";

const isAdminRoute = window.location.pathname === "/admin" || window.location.pathname === "/admin/";

// The admin UI already saves its data to localStorage. Because the admin and
// bank app are separate Vercel projects, mirror those saves to the shared API.
if (isAdminRoute) {
  const originalSetItem = Storage.prototype.setItem;
  let syncTimer: number | undefined;

  Storage.prototype.setItem = function (key: string, value: string) {
    originalSetItem.call(this, key, value);

    if (key !== "demo_account" && key !== "demo_transactions") return;

    window.clearTimeout(syncTimer);
    syncTimer = window.setTimeout(async () => {
      try {
        const accountRaw = localStorage.getItem("demo_account");
        const transactionsRaw = localStorage.getItem("demo_transactions");
        const account = accountRaw ? JSON.parse(accountRaw) : undefined;
        const transactions = transactionsRaw ? JSON.parse(transactionsRaw) : undefined;

        await fetch("/api/state", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ account, transactions }),
        });
      } catch {
        // Keep the existing localStorage behavior if the API is unavailable.
      }
    }, 100);
  };
}

createRoot(document.getElementById("root")!).render(
  isAdminRoute ? <AdminApp /> : <App />,
);
