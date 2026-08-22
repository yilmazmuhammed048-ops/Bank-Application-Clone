import { createRoot } from "react-dom/client";
import App from "./App";
import AdminApp from "./admin/AdminApp";
import "./index.css";
import "./home-reference.css";
import "./shortcut-reference.css";
import "./header-background-reference.css";
import "./header-static-final.css";
import "./header-live-reference.css";
import "./three-dot-pdf-share-v2";

const hostname = window.location.hostname.toLowerCase();
const isAdminHost = hostname.startsWith("banka-yonetim-paneli");
const isAdminPath = window.location.pathname === "/admin" || window.location.pathname === "/admin/";
const isAdminRoute = isAdminHost || isAdminPath;
const SHARED_API = "https://banka-yonetim-paneli.vercel.app/api/state";

const LEGACY_TRANSACTIONS = [
  {
    id: 6,
    title: "FAST Gelen",
    description: "FAST PARA TRANSFERİ",
    amount: "8.750,00",
    date: "18 Ağustos 2026",
    time: "09:41",
    recipientName: "Burak Aydın",
    recipientIban: "TR71 5468 2319 7842 6531 2948 37",
    recipientBank: "Türkiye İş Bankası A.Ş.",
    transactionNumber: "20260818498317",
    type: "income",
  },
  {
    id: 5,
    title: "Kart Ödemesi",
    description: "POS HARCAMASI - MARKET",
    amount: "1.286,45",
    date: "18 Ağustos 2026",
    time: "08:12",
    recipientName: "Güneş Market",
    recipientIban: "TR36 8241 5973 2618 4735 9126 58",
    recipientBank: "Akbank T.A.Ş.",
    transactionNumber: "20260818276194",
    type: "expense",
  },
  {
    id: 4,
    title: "FAST Giden",
    description: "FAST PARA TRANSFERİ",
    amount: "2.350,00",
    date: "17 Ağustos 2026",
    time: "21:06",
    recipientName: "Ece Yalçın",
    recipientIban: "TR58 3174 9628 4513 7862 5941 26",
    recipientBank: "Garanti BBVA",
    transactionNumber: "20260817421683",
    type: "expense",
  },
  {
    id: 3,
    title: "Havale Gelen",
    description: "HAVALE",
    amount: "12.500,00",
    date: "17 Ağustos 2026",
    time: "14:32",
    recipientName: "Mert Karaca",
    recipientIban: "TR24 6931 4857 3126 8495 7312 64",
    recipientBank: "Yapı ve Kredi Bankası A.Ş.",
    transactionNumber: "20260817384621",
    type: "income",
  },
  {
    id: 2,
    title: "Akaryakıt",
    description: "KARTLI ÖDEME",
    amount: "1.950,00",
    date: "16 Ağustos 2026",
    time: "18:46",
    recipientName: "Petrol İstasyonu",
    recipientIban: "TR83 1547 9263 4812 7359 2648 17",
    recipientBank: "QNB",
    transactionNumber: "20260816291847",
    type: "expense",
  },
  {
    id: 1,
    title: "Maaş",
    description: "MAAŞ ÖDEMESİ",
    amount: "35.000,00",
    date: "15 Ağustos 2026",
    time: "09:17",
    recipientName: "Atlas Teknoloji A.Ş.",
    recipientIban: "TR47 9286 3157 8421 6935 2748 61",
    recipientBank: "Türkiye Finans Katılım Bankası A.Ş.",
    transactionNumber: "20260815173594",
    type: "income",
  },
];

function transactionKey(transaction: any) {
  return String(
    transaction?.transactionNumber ??
      `${transaction?.id ?? ""}|${transaction?.date ?? ""}|${transaction?.amount ?? ""}|${transaction?.title ?? ""}`,
  );
}

function getLocalTransactions() {
  try {
    const saved = localStorage.getItem("demo_transactions");
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function mergeTransactions(remoteTransactions: any[]) {
  const merged = new Map<string, any>();

  for (const transaction of LEGACY_TRANSACTIONS) {
    merged.set(transactionKey(transaction), transaction);
  }

  for (const transaction of getLocalTransactions()) {
    merged.set(transactionKey(transaction), transaction);
  }

  for (const transaction of remoteTransactions) {
    merged.set(transactionKey(transaction), transaction);
  }

  return Array.from(merged.values());
}

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

    const remoteTransactions = Array.isArray(data.transactions)
      ? data.transactions
      : [];
    localStorage.setItem(
      "demo_transactions",
      JSON.stringify(mergeTransactions(remoteTransactions)),
    );
  } catch {
    // Keep the last known local data if the shared API is temporarily unavailable.
    localStorage.setItem(
      "demo_transactions",
      JSON.stringify(mergeTransactions([])),
    );
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
