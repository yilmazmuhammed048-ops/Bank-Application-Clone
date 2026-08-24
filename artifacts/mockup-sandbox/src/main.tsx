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
import "./transactions-archive-display";
import "./transactions-longpress-delete";
import "./transactions-reference-receipt-icon";
import "./receipt-pdf-reference";
import "./receipt-transaction-reference";
import "./pdf-approved-logo-patch";
import "./transactions-pdf-reference-final";
import "./receipt-mail-pdf-fix";
import "./receipt-fee-policy";
import "./login-safearea-reference";

const hostname = window.location.hostname.toLowerCase();
const isAdminHost = hostname.startsWith("banka-yonetim-paneli");
const isAdminPath = window.location.pathname === "/admin" || window.location.pathname === "/admin/";
const isAdminRoute = isAdminHost || isAdminPath;
const SHARED_API = "https://banka-yonetim-paneli.vercel.app/api/state";

const ARCHIVE_TRANSACTIONS = [
  {
    id: 1787326200000,
    title: "Kart Ödemesi",
    description:
      "SANAL POS ALIŞVERİŞ KART NO: 5124 **** **** 0162 İŞYERİ: YEMEKPAY/YEMEK SEPET MUTABAKAT: 5508756",
    amount: "350,00",
    date: "21 Ağustos 2026",
    time: "18:30",
    recipientName: "YEMEKPAY / YEMEK SEPET",
    recipientIban: "",
    recipientBank: "Sanal POS Alışveriş",
    transactionNumber: "ARCHIVE-20260821-1830-350",
    type: "expense",
  },
  {
    id: 1787308440000,
    title: "Kart Ödemesi",
    description:
      "POS ALIŞVERİŞ KART NO: 5124 **** **** 0162 İŞYERİ: M JET YUREGIR ADANA P MUTABAKAT: 3910060",
    amount: "2.600,00",
    date: "21 Ağustos 2026",
    time: "13:34",
    recipientName: "M JET YUREGIR ADANA P",
    recipientIban: "",
    recipientBank: "POS Alışveriş",
    transactionNumber: "ARCHIVE-20260821-1334-2600",
    type: "expense",
  },
  {
    id: 1787274480000,
    title: "Kart Ödemesi",
    description:
      "POS ALIŞVERİŞ KART NO: 5124 **** **** 0162 İŞYERİ: KONAK STONE HOUSE MUTABAKAT: 8630012",
    amount: "2.900,00",
    date: "21 Ağustos 2026",
    time: "04:08",
    recipientName: "KONAK STONE HOUSE",
    recipientIban: "",
    recipientBank: "POS Alışveriş",
    transactionNumber: "ARCHIVE-20260821-0408-2900",
    type: "expense",
  },
  {
    id: 1787271780000,
    title: "Kart Ödemesi",
    description:
      "POS ALIŞVERİŞ KART NO: 5124 **** **** 0162 İŞYERİ: ALTINOLUK SUPERMARKET MUTABAKAT: 85385...",
    amount: "3.672,00",
    date: "21 Ağustos 2026",
    time: "03:23",
    recipientName: "ALTINOLUK SUPERMARKET",
    recipientIban: "",
    recipientBank: "POS Alışveriş",
    transactionNumber: "ARCHIVE-20260821-0323-3672",
    type: "expense",
  },
  {
    id: 1787249880000,
    title: "Havale Giden",
    description: "FERDİ ERKAN Ziraat Mobil Havale",
    amount: "10.000,00",
    date: "20 Ağustos 2026",
    time: "21:18",
    recipientName: "FERDİ ERKAN",
    recipientIban: "",
    recipientBank: "Ziraat Mobil Havale",
    transactionNumber: "ARCHIVE-20260820-2118-10000",
    type: "expense",
  },
  {
    id: 1787243340000,
    title: "Kart Ödemesi",
    description:
      "POS ALIŞVERİŞ KART NO: 5124 **** **** 0162 İŞYERİ: EMRECAN BUFE MUTABAKAT: 9414914",
    amount: "990,00",
    date: "20 Ağustos 2026",
    time: "19:29",
    recipientName: "EMRECAN BUFE",
    recipientIban: "",
    recipientBank: "POS Alışveriş",
    transactionNumber: "ARCHIVE-20260820-1929-990",
    type: "expense",
  },
  {
    id: 1787241840000,
    title: "Havale Giden",
    description: "FEVZİ MUTLU Ziraat Mobil Havale",
    amount: "48.000,00",
    date: "20 Ağustos 2026",
    time: "19:04",
    recipientName: "FEVZİ MUTLU",
    recipientIban: "",
    recipientBank: "Ziraat Mobil Havale",
    transactionNumber: "ARCHIVE-20260820-1904-48000",
    type: "expense",
  },
];

function transactionKey(transaction: any) {
  return String(
    transaction?.transactionNumber ??
      `${transaction?.id ?? ""}|${transaction?.date ?? ""}|${transaction?.time ?? ""}|${transaction?.amount ?? ""}`,
  );
}

function withArchiveTransactions(remoteTransactions: any[]) {
  const merged = new Map<string, any>();

  for (const transaction of remoteTransactions) {
    merged.set(transactionKey(transaction), transaction);
  }

  for (const transaction of ARCHIVE_TRANSACTIONS) {
    const key = transactionKey(transaction);
    if (!merged.has(key)) merged.set(key, transaction);
  }

  return Array.from(merged.values());
}

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

    if (Array.isArray(data.transactions)) {
      const transactions = isAdminRoute
        ? data.transactions
        : withArchiveTransactions(data.transactions);

      localStorage.setItem(
        "demo_transactions",
        JSON.stringify(transactions),
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