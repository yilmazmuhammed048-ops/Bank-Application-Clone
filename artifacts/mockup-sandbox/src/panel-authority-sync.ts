export {};

const SHARED_API = "https://banka-yonetim-paneli.vercel.app/api/state";
const PANEL_REVISION_STORAGE = "demo_panel_revision";
const PANEL_SYNC_MIGRATION_STORAGE = "demo_panel_authority_sync_v1";
const PERMANENTLY_REMOVED_TRANSACTION_KEYS = new Set(["1787510111534"]);

const hostname = window.location.hostname.toLowerCase();
const isAdminHost = hostname.startsWith("banka-yonetim-paneli");
const isAdminPath =
  window.location.pathname === "/admin" ||
  window.location.pathname === "/admin/";
const isAdminRoute = isAdminHost || isAdminPath;

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
    cleaned.description = cleaned.description
      .replace(/\bdeneme\b/gi, "")
      .replace(/\s{2,}/g, " ")
      .trim();
  }

  return cleaned;
}

function sanitizeSharedState(data: any) {
  if (!data || typeof data !== "object") return data;

  return {
    ...data,
    transactions: Array.isArray(data.transactions)
      ? data.transactions
          .filter(
            (transaction: any) =>
              !PERMANENTLY_REMOVED_TRANSACTION_KEYS.has(transactionKey(transaction)),
          )
          .map(sanitizeTransaction)
      : data.transactions,
  };
}

function isSharedStateGet(input: RequestInfo | URL, init?: RequestInit) {
  const method = String(init?.method || (input instanceof Request ? input.method : "GET"))
    .toUpperCase();
  if (method !== "GET") return false;

  const url =
    typeof input === "string"
      ? input
      : input instanceof URL
        ? input.toString()
        : input.url;

  return url.startsWith(SHARED_API);
}

function applyPanelRevision(data: any) {
  const revision = Number(data?.revision);
  if (!Number.isFinite(revision)) return;

  // Silinen dekont anahtarları artık panel revizyonu değiştiğinde temizlenmiyor.
  // Böylece uygulamada silinen bir hareket sayfa yenilense de geri gelmiyor.
  localStorage.setItem(PANEL_SYNC_MIGRATION_STORAGE, "1");
  localStorage.setItem(PANEL_REVISION_STORAGE, String(revision));
}

if (!isAdminRoute) {
  const nativeFetch = window.fetch.bind(window);

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
      } catch {
        // Keep the original response if the control response is malformed.
      }
    }

    return response;
  }) as typeof window.fetch;
}
