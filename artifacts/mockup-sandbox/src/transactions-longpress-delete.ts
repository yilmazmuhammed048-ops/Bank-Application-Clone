export {};

type StoredTransaction = {
  id?: string | number;
  transactionNumber?: string;
  date?: string;
  time?: string;
  amount?: string | number;
  type?: "income" | "expense";
};

const DELETED_KEYS_STORAGE = "demo_deleted_transaction_keys";
const hostname = window.location.hostname.toLowerCase();
const isAdminHost = hostname.startsWith("banka-yonetim-paneli");
const isAdminPath =
  window.location.pathname === "/admin" ||
  window.location.pathname === "/admin/";
const isAdminRoute = isAdminHost || isAdminPath;

function transactionKey(transaction: StoredTransaction) {
  return String(
    transaction?.transactionNumber ??
      `${transaction?.id ?? ""}|${transaction?.date ?? ""}|${transaction?.time ?? ""}|${transaction?.amount ?? ""}`,
  );
}

function parseAmount(value: string | number | undefined) {
  if (typeof value === "number") return Math.abs(value);

  const cleaned = String(value ?? "0")
    .replace(/TL|TRY/gi, "")
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(/[^\d.-]/g, "");

  const number = Number(cleaned);
  return Number.isFinite(number) ? Math.abs(number) : 0;
}

function formatBalance(value: number) {
  return value.toFixed(2).replace(".", ",");
}

function transactionEffect(transaction: StoredTransaction) {
  const amount = parseAmount(transaction.amount);
  return transaction.type === "income" ? amount : -amount;
}

function readDeletedKeys() {
  try {
    const parsed = JSON.parse(
      localStorage.getItem(DELETED_KEYS_STORAGE) || "[]",
    );

    if (!Array.isArray(parsed)) return [] as string[];
    return parsed.map((value) => String(value)).filter(Boolean);
  } catch {
    return [] as string[];
  }
}

function writeDeletedKeys(keys: string[]) {
  localStorage.setItem(
    DELETED_KEYS_STORAGE,
    JSON.stringify(Array.from(new Set(keys))),
  );
}

function readTransactions(): StoredTransaction[] {
  try {
    const parsed = JSON.parse(
      localStorage.getItem("demo_transactions") || "[]",
    );
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function adjustStoredAccount(delta: number) {
  try {
    const raw = localStorage.getItem("demo_account");
    const account = raw ? JSON.parse(raw) : {};
    const fallbackBalance = localStorage.getItem("demo_balance");
    const currentBalance = raw
      ? parseAmount(account?.balance)
      : parseAmount(fallbackBalance ?? "0");
    const nextBalance = formatBalance(currentBalance + delta);

    account.balance = nextBalance;
    localStorage.setItem("demo_account", JSON.stringify(account));
    localStorage.setItem("demo_balance", nextBalance);
  } catch {
    // Keep the last valid demo account state.
  }
}

function removeTransaction(transaction: StoredTransaction) {
  const key = transactionKey(transaction);
  if (!key) return;

  writeDeletedKeys([...readDeletedKeys(), key]);

  const remaining = readTransactions().filter(
    (item) => transactionKey(item) !== key,
  );

  localStorage.setItem("demo_transactions", JSON.stringify(remaining));

  // Reverse the deleted movement immediately. The shared-state sync in
  // main.tsx deterministically applies the same adjustment on later polls.
  adjustStoredAccount(-transactionEffect(transaction));
  window.dispatchEvent(new Event("storage"));
}

function movementList() {
  const filter = document.querySelector<HTMLButtonElement>(
    'button[aria-label="Filtre"]',
  );
  const list = filter?.parentElement?.nextElementSibling;
  return list instanceof HTMLElement ? list : null;
}

function movementRows() {
  const list = movementList();
  if (!list) return [] as HTMLButtonElement[];

  return Array.from(list.children).filter(
    (element): element is HTMLButtonElement =>
      element instanceof HTMLButtonElement &&
      element.dataset.messageFeeRow !== "true",
  );
}

function sortedTransactions() {
  return readTransactions()
    .slice()
    .sort((a, b) => {
      const aId = Number(a.id);
      const bId = Number(b.id);

      if (Number.isFinite(aId) && Number.isFinite(bId)) {
        return bId - aId;
      }

      return transactionKey(b).localeCompare(transactionKey(a));
    });
}

function syncMovementRows() {
  const rows = movementRows();
  const transactions = sortedTransactions();

  rows.forEach((row, index) => {
    const transaction = transactions[index];
    if (!transaction) {
      delete row.dataset.demoTransactionKey;
      return;
    }

    row.dataset.demoTransactionKey = transactionKey(transaction);
    row.style.webkitTouchCallout = "none";
    row.style.webkitUserSelect = "none";
    row.style.userSelect = "none";
    row.style.touchAction = "pan-y";
  });
}

function transactionForRow(row: HTMLButtonElement) {
  const key = row.dataset.demoTransactionKey;
  if (key) {
    const matched = readTransactions().find(
      (transaction) => transactionKey(transaction) === key,
    );
    if (matched) return matched;
  }

  const rows = movementRows();
  const index = rows.indexOf(row);
  if (index < 0) return null;
  return sortedTransactions()[index] ?? null;
}

function rowFromTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return null;
  const row = target.closest("button");
  if (!(row instanceof HTMLButtonElement)) return null;

  const list = movementList();
  if (!list || row.parentElement !== list) return null;
  if (row.dataset.messageFeeRow === "true") return null;
  return row;
}

let overlay: HTMLDivElement | null = null;
let armedRow: HTMLButtonElement | null = null;
let suppressClickUntil = 0;
let pressTimer: number | null = null;
let pressRow: HTMLButtonElement | null = null;
let startX = 0;
let startY = 0;

function cancelPress() {
  if (pressTimer !== null) {
    window.clearTimeout(pressTimer);
    pressTimer = null;
  }
  pressRow = null;
}

function clearOverlay() {
  overlay?.remove();
  overlay = null;
  armedRow = null;
}

function positionOverlay(row: HTMLButtonElement, action: HTMLDivElement) {
  const rect = row.getBoundingClientRect();
  const width = Math.min(88, Math.max(74, rect.width * 0.22));

  Object.assign(action.style, {
    position: "fixed",
    left: `${Math.max(0, rect.right - width)}px`,
    top: `${Math.max(0, rect.top)}px`,
    width: `${width}px`,
    height: `${rect.height}px`,
  });
}

function deleteIconMarkup() {
  return `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7h16M9 7V4h6v3m-8 0 1 13h8l1-13M10 11v5m4-5v5" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <span style="font-size:11px;font-weight:800;line-height:1">Sil</span>
  `;
}

function showDeleteAction(row: HTMLButtonElement) {
  syncMovementRows();
  const selected = transactionForRow(row);
  if (!selected) return;
  const selectedKey = transactionKey(selected);
  if (!selectedKey) return;

  clearOverlay();
  armedRow = row;
  suppressClickUntil = Date.now() + 1400;

  const action = document.createElement("div");
  action.setAttribute("data-demo-longpress-delete", "true");
  action.setAttribute("role", "button");
  action.setAttribute("tabindex", "0");
  action.setAttribute("aria-label", "Hareketi sil");
  action.innerHTML = deleteIconMarkup();

  Object.assign(action.style, {
    zIndex: "2147483646",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    background: "#d90b17",
    color: "#ffffff",
    cursor: "pointer",
    userSelect: "none",
    WebkitUserSelect: "none",
    WebkitTouchCallout: "none",
    touchAction: "manipulation",
    borderRadius: "0 9px 9px 0",
    boxShadow: "-2px 0 5px rgba(0,0,0,0.08)",
  });

  positionOverlay(row, action);
  let didDelete = false;

  const runDelete = (event: Event) => {
    event.preventDefault();
    event.stopPropagation();
    if (didDelete) return;
    didDelete = true;

    const transaction = readTransactions().find(
      (item) => transactionKey(item) === selectedKey,
    );

    if (!transaction) {
      clearOverlay();
      return;
    }

    removeTransaction(transaction);
    clearOverlay();
    window.setTimeout(syncMovementRows, 0);
  };

  action.addEventListener("click", runDelete);
  action.addEventListener("touchend", (event) => {
    event.preventDefault();
    runDelete(event);
  });
  action.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") runDelete(event);
  });

  document.body.appendChild(action);
  overlay = action;

  try {
    navigator.vibrate?.(18);
  } catch {}
}

function armAfterDelay(row: HTMLButtonElement, x: number, y: number) {
  clearOverlay();
  cancelPress();
  syncMovementRows();
  pressRow = row;
  startX = x;
  startY = y;
  pressTimer = window.setTimeout(() => {
    pressTimer = null;
    pressRow = null;
    showDeleteAction(row);
  }, 480);
}

let syncScheduled = false;
function scheduleRowSync() {
  if (syncScheduled || isAdminRoute) return;
  syncScheduled = true;
  requestAnimationFrame(() => {
    syncScheduled = false;
    syncMovementRows();
  });
}

if (!isAdminRoute) {
  const observer = new MutationObserver(scheduleRowSync);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  document.addEventListener("DOMContentLoaded", scheduleRowSync);
  window.addEventListener("storage", scheduleRowSync);
  scheduleRowSync();

  document.addEventListener(
    "touchstart",
    (event) => {
      if (event.touches.length !== 1) return;
      const row = rowFromTarget(event.target);
      if (!row) {
        clearOverlay();
        return;
      }
      const touch = event.touches[0];
      armAfterDelay(row, touch.clientX, touch.clientY);
    },
    { passive: true, capture: true },
  );

  document.addEventListener(
    "touchmove",
    (event) => {
      if (pressTimer === null || !pressRow || event.touches.length !== 1) return;
      const touch = event.touches[0];
      if (
        Math.abs(touch.clientX - startX) > 24 ||
        Math.abs(touch.clientY - startY) > 24
      ) {
        cancelPress();
      }
    },
    { passive: true, capture: true },
  );

  document.addEventListener("touchend", () => cancelPress(), true);
  document.addEventListener("touchcancel", () => cancelPress(), true);

  document.addEventListener(
    "pointerdown",
    (event) => {
      if (event.pointerType === "touch" || event.button !== 0) return;
      const row = rowFromTarget(event.target);
      if (!row) {
        clearOverlay();
        return;
      }
      armAfterDelay(row, event.clientX, event.clientY);
    },
    true,
  );

  document.addEventListener(
    "pointermove",
    (event) => {
      if (event.pointerType === "touch" || pressTimer === null || !pressRow) return;
      if (
        Math.abs(event.clientX - startX) > 24 ||
        Math.abs(event.clientY - startY) > 24
      ) {
        cancelPress();
      }
    },
    true,
  );

  document.addEventListener("pointerup", (event) => {
    if (event.pointerType !== "touch") cancelPress();
  }, true);
  document.addEventListener("pointercancel", cancelPress, true);

  // Mobile Safari/Android may turn a long press into contextmenu before the
  // timer callback is visible. Use that event as a second long-press path.
  document.addEventListener(
    "contextmenu",
    (event) => {
      const row = rowFromTarget(event.target);
      if (!row) return;
      event.preventDefault();
      cancelPress();
      showDeleteAction(row);
    },
    true,
  );

  document.addEventListener(
    "selectstart",
    (event) => {
      if (rowFromTarget(event.target)) event.preventDefault();
    },
    true,
  );

  document.addEventListener(
    "click",
    (event) => {
      if (Date.now() >= suppressClickUntil || !armedRow) return;
      const row = rowFromTarget(event.target);
      if (row !== armedRow) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    },
    true,
  );

  window.addEventListener("scroll", () => {
    if (overlay && armedRow && armedRow.isConnected) {
      positionOverlay(armedRow, overlay);
    }
  }, true);

  window.addEventListener("resize", () => {
    if (overlay && armedRow && armedRow.isConnected) {
      positionOverlay(armedRow, overlay);
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelPress();
      clearOverlay();
    }
  });
}
