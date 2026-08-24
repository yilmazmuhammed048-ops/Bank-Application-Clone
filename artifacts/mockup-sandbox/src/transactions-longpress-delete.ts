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
    if (!raw) return;

    const account = JSON.parse(raw);
    const currentBalance = parseAmount(account?.balance);
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

  const deletedKeys = readDeletedKeys();
  writeDeletedKeys([...deletedKeys, key]);

  const remaining = readTransactions().filter(
    (item) => transactionKey(item) !== key,
  );

  nativeSetItem.call(
    localStorage,
    "demo_transactions",
    JSON.stringify(remaining),
  );

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

function clearDeleteActions(except?: HTMLElement) {
  document
    .querySelectorAll<HTMLElement>("[data-longpress-delete-action='true']")
    .forEach((action) => {
      if (action === except) return;
      const row = action.parentElement;
      if (row instanceof HTMLElement) {
        delete row.dataset.longPressDeleteArmed;
      }
      action.remove();
    });
}

function deleteIconMarkup() {
  return `
    <svg width="23" height="23" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7h16M9 7V4h6v3m-8 0 1 13h8l1-13M10 11v5m4-5v5" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <span style="font-size:11px;font-weight:800;line-height:1">Sil</span>
  `;
}

function showDeleteAction(row: HTMLButtonElement) {
  clearDeleteActions();

  const action = document.createElement("div");
  action.dataset.longpressDeleteAction = "true";
  action.setAttribute("data-longpress-delete-action", "true");
  action.setAttribute("role", "button");
  action.setAttribute("tabindex", "0");
  action.setAttribute("aria-label", "Hareketi sil");
  action.innerHTML = deleteIconMarkup();

  Object.assign(action.style, {
    position: "absolute",
    top: "0",
    right: "0",
    bottom: "0",
    width: "78px",
    zIndex: "30",
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
  });

  const runDelete = (event: Event) => {
    event.preventDefault();
    event.stopPropagation();

    const key = row.dataset.transactionKey || "";
    const transaction = readTransactions().find(
      (item) => transactionKey(item) === key,
    );

    if (!transaction) {
      clearDeleteActions();
      return;
    }

    removeTransaction(transaction);
    clearDeleteActions();
  };

  action.addEventListener("pointerdown", (event) => {
    event.stopPropagation();
  });
  action.addEventListener("click", runDelete);
  action.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      runDelete(event);
    }
  });

  row.dataset.longPressDeleteArmed = "true";
  row.dataset.longPressSuppressUntil = String(Date.now() + 900);
  row.appendChild(action);

  try {
    navigator.vibrate?.(18);
  } catch {}
}

function bindLongPress(row: HTMLButtonElement) {
  if (row.dataset.longPressDeleteBound === "true") return;
  row.dataset.longPressDeleteBound = "true";

  let timer: number | null = null;
  let startX = 0;
  let startY = 0;

  const cancelTimer = () => {
    if (timer !== null) {
      window.clearTimeout(timer);
      timer = null;
    }
  };

  row.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;

    clearDeleteActions();
    startX = event.clientX;
    startY = event.clientY;
    cancelTimer();

    timer = window.setTimeout(() => {
      timer = null;
      showDeleteAction(row);
    }, 620);
  });

  row.addEventListener("pointermove", (event) => {
    if (timer === null) return;

    if (
      Math.abs(event.clientX - startX) > 12 ||
      Math.abs(event.clientY - startY) > 12
    ) {
      cancelTimer();
    }
  });

  row.addEventListener("pointerup", cancelTimer);
  row.addEventListener("pointercancel", cancelTimer);
  row.addEventListener("pointerleave", cancelTimer);

  row.addEventListener("contextmenu", (event) => {
    event.preventDefault();
  });

  row.addEventListener(
    "click",
    (event) => {
      const target = event.target as Element | null;
      if (target?.closest("[data-longpress-delete-action='true']")) return;

      const suppressUntil = Number(
        row.dataset.longPressSuppressUntil || "0",
      );

      if (
        row.dataset.longPressDeleteArmed === "true" ||
        Date.now() < suppressUntil
      ) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        clearDeleteActions();
      }
    },
    true,
  );
}

function applyLongPressDelete() {
  if (isAdminRoute) return;

  const rows = movementRows();
  const transactions = sortedTransactions();

  rows.forEach((row, index) => {
    const transaction = transactions[index];
    if (!transaction) return;

    row.dataset.transactionKey = transactionKey(transaction);
    bindLongPress(row);
  });
}

let scheduled = false;
function scheduleApply() {
  if (scheduled || isAdminRoute) return;
  scheduled = true;

  requestAnimationFrame(() => {
    scheduled = false;
    applyLongPressDelete();
  });
}

if (!isAdminRoute) {
  const observer = new MutationObserver(scheduleApply);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  document.addEventListener("DOMContentLoaded", scheduleApply);
  window.addEventListener("storage", scheduleApply);
  scheduleApply();
}