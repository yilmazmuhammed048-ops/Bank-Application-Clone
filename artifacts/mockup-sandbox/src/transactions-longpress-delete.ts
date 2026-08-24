export {};

type StoredTransaction = {
  id?: string | number;
  transactionNumber?: string;
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
      transaction?.id ??
      "",
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

const nativeSetItem = Storage.prototype.setItem;

function writeDeletedKeys(keys: string[]) {
  nativeSetItem.call(
    localStorage,
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
    nativeSetItem.call(
      localStorage,
      "demo_account",
      JSON.stringify(account),
    );
    nativeSetItem.call(localStorage, "demo_balance", nextBalance);
  } catch {
    // Keep the last valid demo account state.
  }
}

function applyDeletedTransactionFilter(value: string) {
  try {
    const incoming = JSON.parse(value);
    if (!Array.isArray(incoming)) return false;

    const byKey = new Map<string, StoredTransaction>();
    for (const transaction of incoming) {
      const key = transactionKey(transaction);
      if (key) byKey.set(key, transaction);
    }

    const deletedKeys = readDeletedKeys();
    const activeDeletedKeys = deletedKeys.filter((key) => byKey.has(key));

    if (activeDeletedKeys.length !== deletedKeys.length) {
      writeDeletedKeys(activeDeletedKeys);
    }

    const deletedSet = new Set(activeDeletedKeys);
    const filtered = incoming.filter(
      (transaction) => !deletedSet.has(transactionKey(transaction)),
    );

    nativeSetItem.call(
      localStorage,
      "demo_transactions",
      JSON.stringify(filtered),
    );

    // The remote sync writes the original demo account first. Re-apply the
    // effect of locally deleted movements so the displayed balance stays
    // consistent with the filtered movement list.
    let adjustment = 0;
    for (const key of activeDeletedKeys) {
      const transaction = byKey.get(key);
      if (transaction) adjustment -= transactionEffect(transaction);
    }

    if (adjustment !== 0) {
      adjustStoredAccount(adjustment);
    }

    return true;
  } catch {
    return false;
  }
}

if (!isAdminRoute) {
  Storage.prototype.setItem = function (key: string, value: string) {
    if (
      this === localStorage &&
      key === "demo_transactions" &&
      applyDeletedTransactionFilter(value)
    ) {
      return;
    }

    return nativeSetItem.call(this, key, value);
  };
}

function removeTransaction(transaction: StoredTransaction) {
  const key = transactionKey(transaction);
  if (!key) return;

  writeDeletedKeys([...readDeletedKeys(), key]);

  const remaining = readTransactions().filter(
    (item) => transactionKey(item) !== key,
  );

  nativeSetItem.call(
    localStorage,
    "demo_transactions",
    JSON.stringify(remaining),
  );

  // Reverse the deleted movement's effect on the current balance immediately.
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

function transactionForRow(row: HTMLButtonElement) {
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
  const width = Math.min(86, Math.max(72, rect.width * 0.22));

  Object.assign(action.style, {
    position: "fixed",
    left: `${Math.max(0, rect.right - width)}px`,
    top: `${rect.top}px`,
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
  const selected = transactionForRow(row);
  if (!selected) return;
  const selectedKey = transactionKey(selected);
  if (!selectedKey) return;

  clearOverlay();
  armedRow = row;
  suppressClickUntil = Date.now() + 1200;

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

    // The React row may be replaced between long-press and the tap on "Sil".
    // Resolve the transaction by the key captured at long-press time instead
    // of relying on the old DOM node still being present.
    const transaction = readTransactions().find(
      (item) => transactionKey(item) === selectedKey,
    );

    if (!transaction) {
      clearOverlay();
      return;
    }

    removeTransaction(transaction);
    clearOverlay();
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
  pressRow = row;
  startX = x;
  startY = y;
  pressTimer = window.setTimeout(() => {
    pressTimer = null;
    pressRow = null;
    showDeleteAction(row);
  }, 560);
}

if (!isAdminRoute) {
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
        Math.abs(touch.clientX - startX) > 14 ||
        Math.abs(touch.clientY - startY) > 14
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
        Math.abs(event.clientX - startX) > 14 ||
        Math.abs(event.clientY - startY) > 14
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

  document.addEventListener(
    "contextmenu",
    (event) => {
      const row = rowFromTarget(event.target);
      if (row) event.preventDefault();
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
