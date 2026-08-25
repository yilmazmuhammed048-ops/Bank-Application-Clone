export {};

const SHARED_API = "https://banka-yonetim-paneli.vercel.app/api/state";
const PANEL_REVISION_STORAGE = "demo_panel_revision";
const PANEL_SYNC_MIGRATION_STORAGE = "demo_panel_authority_sync_v1";
const PERMANENTLY_REMOVED_TRANSACTION_KEYS = new Set([
  "1787510111534",
  "ARCHIVE-20260820-1904-48000",
  "ARCHIVE-20260820-1929-990",
  "ARCHIVE-20260820-2118-10000",
]);

const hostname = window.location.hostname.toLowerCase();
const isAdminHost = hostname.startsWith("banka-yonetim-paneli");
const isAdminPath = window.location.pathname === "/admin" || window.location.pathname === "/admin/";
const isAdminRoute = isAdminHost || isAdminPath;
const nativeFetch = window.fetch.bind(window);

function transactionKey(transaction: any) {
  return String(
    transaction?.transactionNumber ??
      transaction?.id ??
      `${transaction?.date ?? ""}|${transaction?.time ?? ""}|${transaction?.amount ?? ""}|${transaction?.title ?? ""}`,
  );
}

function sanitizeTransaction(transaction: any) {
  if (!transaction || typeof transaction !== "object") return transaction;
  const cleaned = { ...transaction };
  const recipientName = String(cleaned.recipientName ?? "").toLocaleUpperCase("tr-TR");
  if (recipientName.includes("MUAMMER TATAR") && typeof cleaned.description === "string") {
    cleaned.description = cleaned.description.replace(/\bdeneme\b/gi, "").replace(/\s{2,}/g, " ").trim();
  }
  return cleaned;
}

function sanitizeSharedState(data: any) {
  if (!data || typeof data !== "object") return data;
  return {
    ...data,
    transactions: Array.isArray(data.transactions)
      ? data.transactions
          .filter((transaction: any) => !PERMANENTLY_REMOVED_TRANSACTION_KEYS.has(transactionKey(transaction)))
          .map(sanitizeTransaction)
      : data.transactions,
  };
}

function isSharedStateGet(input: RequestInfo | URL, init?: RequestInit) {
  const method = String(init?.method || (input instanceof Request ? input.method : "GET")).toUpperCase();
  if (method !== "GET") return false;
  const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
  return url.startsWith(SHARED_API);
}

function applyPanelRevision(data: any) {
  const revision = Number(data?.revision);
  if (!Number.isFinite(revision)) return;
  localStorage.setItem(PANEL_SYNC_MIGRATION_STORAGE, "1");
  localStorage.setItem(PANEL_REVISION_STORAGE, String(revision));
}

function writePanelStateToApp(data: any) {
  const clean = sanitizeSharedState(data);
  applyPanelRevision(clean);

  // Bakiye / hesap bilgisi panelden her zaman canlı gelsin.
  if (clean?.account && typeof clean.account === "object") {
    localStorage.setItem("demo_account", JSON.stringify(clean.account));
    if (clean.account.balance !== undefined && clean.account.balance !== null) {
      localStorage.setItem("demo_balance", String(clean.account.balance));
    }
  }

  // ÖNEMLİ: Panel yalnızca bakiye değiştirirken boş transaction dizisi dönebilir.
  // Bu durumda uygulamadaki mevcut hareketleri SİLME. Dolu bir liste gelirse panel
  // hareket komutlarını uygula. Ana state yükleyicisi arşiv/restore hareketlerini
  // ayrıca birleştirip localStorage'a yazmaya devam eder.
  if (Array.isArray(clean?.transactions) && clean.transactions.length > 0) {
    localStorage.setItem("demo_transactions", JSON.stringify(clean.transactions));
  }

  window.dispatchEvent(new Event("storage"));
  return clean;
}

if (!isAdminRoute) {
  const syncFromPanel = async () => {
    try {
      const response = await nativeFetch(`${SHARED_API}?t=${Date.now()}`, { cache: "no-store" });
      if (!response.ok) return;
      writePanelStateToApp(await response.json());
    } catch {}
  };

  syncFromPanel();
  window.setInterval(syncFromPanel, 1000);

  window.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const response = await nativeFetch(input, init);
    if (response.ok && isSharedStateGet(input, init)) {
      try {
        const data = sanitizeSharedState(await response.clone().json());
        applyPanelRevision(data);
        const headers = new Headers(response.headers);
        headers.delete("content-length");
        return new Response(JSON.stringify(data), {
          status: response.status,
          statusText: response.statusText,
          headers,
        });
      } catch {}
    }
    return response;
  }) as typeof window.fetch;
}
