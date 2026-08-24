export {};

const SHARED_API = "https://banka-yonetim-paneli.vercel.app/api/state";
const DELETED_KEYS_STORAGE = "demo_deleted_transaction_keys";
const PANEL_REVISION_STORAGE = "demo_panel_revision";
const PANEL_SYNC_MIGRATION_STORAGE = "demo_panel_authority_sync_v1";

const hostname = window.location.hostname.toLowerCase();
const isAdminHost = hostname.startsWith("banka-yonetim-paneli");
const isAdminPath =
  window.location.pathname === "/admin" ||
  window.location.pathname === "/admin/";
const isAdminRoute = isAdminHost || isAdminPath;

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

  const nextRevision = String(revision);
  const previousRevision = localStorage.getItem(PANEL_REVISION_STORAGE);
  const migrationDone =
    localStorage.getItem(PANEL_SYNC_MIGRATION_STORAGE) === "1";

  const firstAuthoritativeSync = !migrationDone;
  const panelPublishedNewRevision =
    previousRevision !== null && previousRevision !== nextRevision;

  if (firstAuthoritativeSync || panelPublishedNewRevision) {
    localStorage.removeItem(DELETED_KEYS_STORAGE);
    localStorage.setItem(PANEL_SYNC_MIGRATION_STORAGE, "1");
  }

  localStorage.setItem(PANEL_REVISION_STORAGE, nextRevision);
}

if (!isAdminRoute) {
  const nativeFetch = window.fetch.bind(window);

  window.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const response = await nativeFetch(input, init);

    if (response.ok && isSharedStateGet(input, init)) {
      try {
        const data = await response.clone().json();
        applyPanelRevision(data);
      } catch {
        // Keep the existing local state if the control response is malformed.
      }
    }

    return response;
  }) as typeof window.fetch;
}
