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
const LONG_PRESS_MS = 520;
const MOVE_TOLERANCE_PX = 28;
const hostname = window.location.hostname.toLowerCase();
const isAdminHost = hostname.startsWith("banka-yonetim-paneli");
const isAdminPath = window.location.pathname === "/admin" || window.location.pathname === "/admin/";
const isAdminRoute = isAdminHost || isAdminPath;

function transactionKey(transaction: StoredTransaction) {
  return String(
    transaction.transactionNumber ??
      `${transaction.id ?? ""}|${transaction.date ?? ""}|${transaction.time ?? ""}|${transaction.amount ?? ""}`,
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
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? Math.abs(parsed) : 0;
}

function formatBalance(value: number) {
  return value.toFixed(2).replace(".", ",");
}

function readTransactions(): StoredTransaction[] {
  try {
    const parsed = JSON.parse(localStorage.getItem("demo_transactions") || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readDeletedKeys() {
  try {
    const parsed = JSON.parse(localStorage.getItem(DELETED_KEYS_STORAGE) || "[]");
    return Array.isArray(parsed) ? parsed.map(String).filter(Boolean) : [];
  } catch {
    return [] as string[];
  }
}

function writeDeletedKeys(keys: string[]) {
  localStorage.setItem(DELETED_KEYS_STORAGE, JSON.stringify(Array.from(new Set(keys))));
}

function adjustStoredAccount(transaction: StoredTransaction) {
  const amount = parseAmount(transaction.amount);
  const delta = transaction.type === "income" ? -amount : amount;

  try {
    const raw = localStorage.getItem("demo_account");
    const account = raw ? JSON.parse(raw) : {};
    const current = raw
      ? parseAmount(account?.balance)
      : parseAmount(localStorage.getItem("demo_balance") ?? "0");
    const next = formatBalance(current + delta);
    account.balance = next;
    localStorage.setItem("demo_account", JSON.stringify(account));
    localStorage.setItem("demo_balance", next);
  } catch {}
}

function removeTransaction(transaction: StoredTransaction) {
  const key = transactionKey(transaction);
  if (!key) return;

  writeDeletedKeys([...readDeletedKeys(), key]);
  const remaining = readTransactions().filter((item) => transactionKey(item) !== key);
  localStorage.setItem("demo_transactions", JSON.stringify(remaining));
  adjustStoredAccount(transaction);

  window.dispatchEvent(new Event("storage"));
}

function movementList() {
  const filter = document.querySelector<HTMLButtonElement>('button[aria-label="Filtre"]');
  const list = filter?.parentElement?.nextElementSibling;
  return list instanceof HTMLElement ? list : null;
}

function movementRows() {
  const list = movementList();
  if (!list) return [] as HTMLButtonElement[];
  return Array.from(list.children).filter(
    (element): element is HTMLButtonElement =>
      element instanceof HTMLButtonElement && element.dataset.messageFeeRow !== "true",
  );
}

function sortedTransactions() {
  return readTransactions().slice().sort((a, b) => {
    const aId = Number(a.id);
    const bId = Number(b.id);
    if (Number.isFinite(aId) && Number.isFinite(bId)) return bId - aId;
    return transactionKey(b).localeCompare(transactionKey(a));
  });
}

function syncMovementRows() {
  const transactions = sortedTransactions();
  movementRows().forEach((row, index) => {
    const transaction = transactions[index];
    if (!transaction) {
      delete row.dataset.demoTransactionKey;
      return;
    }
    row.dataset.demoTransactionKey = transactionKey(transaction);
    (row.style as CSSStyleDeclaration & { webkitTouchCallout?: string }).webkitTouchCallout = "none";
    row.style.webkitUserSelect = "none";
    row.style.userSelect = "none";
    row.style.touchAction = "pan-y";
  });
}

function transactionForRow(row: HTMLButtonElement) {
  const key = row.dataset.demoTransactionKey;
  if (key) {
    const matched = readTransactions().find((item) => transactionKey(item) === key);
    if (matched) return matched;
  }
  const index = movementRows().indexOf(row);
  return index >= 0 ? sortedTransactions()[index] ?? null : null;
}

function rowFromTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return null;
  const row = target.closest("button");
  if (!(row instanceof HTMLButtonElement)) return null;
  const list = movementList();
  if (!list || row.parentElement !== list || row.dataset.messageFeeRow === "true") return null;
  return row;
}

function isDeleteTarget(target: EventTarget | null) {
  return target instanceof Element && !!target.closest('[data-demo-longpress-delete="true"]');
}

let overlay: HTMLButtonElement | null = null;
let armedRow: HTMLButtonElement | null = null;
let pressTimer: number | null = null;
let pressRow: HTMLButtonElement | null = null;
let startX = 0;
let startY = 0;
let activePointerId: number | null = null;
let suppressRowClickUntil = 0;

function cancelPress() {
  if (pressTimer !== null) window.clearTimeout(pressTimer);
  pressTimer = null;
  pressRow = null;
  activePointerId = null;
}

function clearOverlay() {
  overlay?.remove();
  overlay = null;
  armedRow = null;
}

function positionOverlay(row: HTMLButtonElement, action: HTMLButtonElement) {
  const rect = row.getBoundingClientRect();
  const width = Math.min(90, Math.max(76, rect.width * 0.23));
  Object.assign(action.style, {
    position: "fixed",
    left: `${Math.max(0, rect.right - width)}px`,
    top: `${Math.max(0, rect.top)}px`,
    width: `${width}px`,
    height: `${rect.height}px`,
  });
}

function showDeleteAction(row: HTMLButtonElement) {
  syncMovementRows();
  const selected = transactionForRow(row);
  if (!selected) return;

  cancelPress();
  clearOverlay();
  armedRow = row;
  suppressRowClickUntil = Date.now() + 1800;

  const action = document.createElement("button");
  action.type = "button";
  action.dataset.demoLongpressDelete = "true";
  action.setAttribute("aria-label", "Hareketi sil");
  action.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7h16M9 7V4h6v3m-8 0 1 13h8l1-13M10 11v5m4-5v5" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <span style="font-size:11px;font-weight:800;line-height:1">Sil</span>
  `;

  Object.assign(action.style, {
    zIndex: "2147483646",
    border: "0",
    padding: "0",
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
    pointerEvents: "auto",
  });

  positionOverlay(row, action);

  let deleted = false;
  const runDelete = (event: Event) => {
    if (deleted) return;
    deleted = true;
    event.preventDefault();
    event.stopPropagation();
    if (event instanceof MouseEvent) event.stopImmediatePropagation();
    removeTransaction(selected);
    clearOverlay();
    requestAnimationFrame(syncMovementRows);
  };

  if ("PointerEvent" in window) {
    action.addEventListener("pointerdown", runDelete, { once: true });
  }
  action.addEventListener("click", runDelete, { once: true });

  document.body.appendChild(action);
  overlay = action;

  try {
    navigator.vibrate?.(20);
  } catch {}
}

function armAfterDelay(row: HTMLButtonElement, x: number, y: number, pointerId: number | null = null) {
  clearOverlay();
  cancelPress();
  syncMovementRows();
  pressRow = row;
  startX = x;
  startY = y;
  activePointerId = pointerId;
  pressTimer = window.setTimeout(() => {
    pressTimer = null;
    showDeleteAction(row);
  }, LONG_PRESS_MS);
}

function movedTooFar(x: number, y: number) {
  return Math.abs(x - startX) > MOVE_TOLERANCE_PX || Math.abs(y - startY) > MOVE_TOLERANCE_PX;
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
  observer.observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener("DOMContentLoaded", scheduleRowSync);
  window.addEventListener("storage", scheduleRowSync);
  scheduleRowSync();

  if ("PointerEvent" in window) {
    document.addEventListener(
      "pointerdown",
      (event) => {
        if (isDeleteTarget(event.target)) return;
        if (event.pointerType === "mouse" && event.button !== 0) return;
        const row = rowFromTarget(event.target);
        if (!row) {
          clearOverlay();
          return;
        }
        armAfterDelay(row, event.clientX, event.clientY, event.pointerId);
      },
      true,
    );

    document.addEventListener(
      "pointermove",
      (event) => {
        if (
          pressTimer === null ||
          !pressRow ||
          (activePointerId !== null && event.pointerId !== activePointerId)
        ) return;
        if (movedTooFar(event.clientX, event.clientY)) cancelPress();
      },
      true,
    );

    document.addEventListener(
      "pointerup",
      (event) => {
        if (activePointerId === null || event.pointerId === activePointerId) cancelPress();
      },
      true,
    );
    document.addEventListener("pointercancel", cancelPress, true);
  } else {
    document.addEventListener(
      "touchstart",
      (event) => {
        if (isDeleteTarget(event.target)) return;
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
        if (movedTooFar(touch.clientX, touch.clientY)) cancelPress();
      },
      { passive: true, capture: true },
    );
    document.addEventListener("touchend", cancelPress, true);
    document.addEventListener("touchcancel", cancelPress, true);
  }

  document.addEventListener(
    "contextmenu",
    (event) => {
      const row = rowFromTarget(event.target);
      if (!row) return;
      event.preventDefault();
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
      if (isDeleteTarget(event.target)) return;
      if (Date.now() >= suppressRowClickUntil || !armedRow) return;
      const row = rowFromTarget(event.target);
      if (row !== armedRow) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    },
    true,
  );

  window.addEventListener(
    "scroll",
    () => {
      if (overlay && armedRow && armedRow.isConnected) positionOverlay(armedRow, overlay);
    },
    true,
  );

  window.addEventListener("resize", () => {
    if (overlay && armedRow && armedRow.isConnected) positionOverlay(armedRow, overlay);
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelPress();
      clearOverlay();
    }
  });
}
