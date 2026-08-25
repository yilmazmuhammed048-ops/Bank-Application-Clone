export {};

const MESSAGE_FEE = 0.37;
const MESSAGE_FEE_TITLE = "MESAJ ÜCRETİ TUTARI";
const LAST_THREE_DATES_BOTTOM_UP = [
  { day: "7", month: "AĞU" },
  { day: "11", month: "AĞU" },
  { day: "17", month: "AĞU" },
];

function parseMoney(text: string) {
  const normalized = String(text || "")
    .replace(/TL|TRY/gi, "")
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(/[^\d+.-]/g, "");
  const value = Number(normalized);
  return Number.isFinite(value) ? value : 0;
}

function formatMoney(value: number) {
  return `${value.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} TL`;
}

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function hash(value: string) {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return String(h >>> 0);
}

function accountMovementList() {
  const filter = document.querySelector<HTMLButtonElement>('button[aria-label="Filtre"]');
  const list = filter?.parentElement?.nextElementSibling;
  return list instanceof HTMLElement ? list : null;
}

function findBalanceBox(row: HTMLElement) {
  return Array.from(row.querySelectorAll<HTMLElement>("div")).find((element) =>
    /Kalan\s+Bakiye/i.test(element.textContent || ""),
  );
}

function findAmountBox(row: HTMLElement) {
  return Array.from(row.children).find((element): element is HTMLElement => {
    if (!(element instanceof HTMLElement)) return false;
    return /^[+-]\s*[\d.]+,\d{2}\s*TL$/i.test((element.textContent || "").trim());
  });
}

function findDetailsBox(row: HTMLElement) {
  return Array.from(row.children).find(
    (element): element is HTMLElement =>
      element instanceof HTMLElement && element.querySelector("p") !== null,
  );
}

function findDateBox(row: HTMLElement) {
  return Array.from(row.children).find((element): element is HTMLElement => {
    if (!(element instanceof HTMLElement)) return false;
    const spans = element.querySelectorAll("span");
    return spans.length >= 3 && /^\d{1,2}:\d{2}$/.test((spans[2]?.textContent || "").trim());
  });
}

function isFastMovement(row: HTMLButtonElement) {
  if (row.dataset.messageFeeRow === "true") return false;
  return /\bFAST\b/i.test(row.innerText || row.textContent || "");
}

function movementSignature(row: HTMLButtonElement) {
  const clone = row.cloneNode(true) as HTMLButtonElement;
  findBalanceBox(clone)?.remove();
  return hash((clone.innerText || clone.textContent || "").replace(/\s+/g, " ").trim());
}

function pinRequestedDates(rows: HTMLButtonElement[]) {
  const normalRows = rows.filter((row) => row.dataset.messageFeeRow !== "true");
  LAST_THREE_DATES_BOTTOM_UP.forEach((requested, index) => {
    const row = normalRows[normalRows.length - 1 - index];
    if (!row) return;
    const dateBox = findDateBox(row);
    if (!dateBox) return;
    const spans = Array.from(dateBox.querySelectorAll("span"));
    if (spans[0]) spans[0].textContent = requested.day;
    if (spans[1]) spans[1].textContent = requested.month;
  });
}

function syncFeeTimestamp(original: HTMLButtonElement, feeRow: HTMLButtonElement) {
  const sourceBox = findDateBox(original);
  const targetBox = findDateBox(feeRow);
  if (!sourceBox || !targetBox) return;
  const source = Array.from(sourceBox.querySelectorAll("span"));
  const target = Array.from(targetBox.querySelectorAll("span"));
  for (let i = 0; i < Math.min(source.length, target.length, 3); i += 1) {
    target[i].textContent = source[i].textContent;
  }
}

function updateFeeAmount(row: HTMLButtonElement) {
  const amountBox = findAmountBox(row);
  if (!amountBox) return;
  amountBox.textContent = formatMoney(-MESSAGE_FEE);
  amountBox.classList.remove("text-[#24934c]");
  amountBox.classList.add("text-[#303a40]");
}

function setRowBalance(row: HTMLButtonElement, value: number) {
  const box = findBalanceBox(row);
  if (!box) return;
  const spans = Array.from(box.querySelectorAll("span"));
  const valueSpan = spans.at(-1);
  if (valueSpan) valueSpan.textContent = formatMoney(value);
}

function currentAccountBalance() {
  try {
    const account = JSON.parse(localStorage.getItem("demo_account") || "null");
    if (account?.balance !== undefined && account?.balance !== null) {
      return parseMoney(String(account.balance));
    }
  } catch {}
  return parseMoney(localStorage.getItem("demo_balance") || "0");
}

function signedAmount(row: HTMLButtonElement) {
  const text = (findAmountBox(row)?.textContent || "0").trim();
  const amount = Math.abs(parseMoney(text));
  if (text.startsWith("-")) return -amount;
  if (text.startsWith("+")) return amount;
  return parseMoney(text);
}

function reconcileMovementBalances(list: HTMLElement) {
  const rows = Array.from(list.children).filter(
    (element): element is HTMLButtonElement =>
      element instanceof HTMLButtonElement && findAmountBox(element) !== undefined,
  );
  if (!rows.length) return;

  // Başlangıç en eski/ilk harekettedir. Ekran yeni -> eski görünse de hesaplama
  // listenin altından üstüne, yani eski -> yeni yapılır. Ücret satırları da tam
  // bulundukları kronolojik noktada aynı zincire dahil edilir.
  let runningBalance = roundMoney(currentAccountBalance());
  if (!Number.isFinite(runningBalance)) return;

  for (const row of [...rows].reverse()) {
    runningBalance = roundMoney(runningBalance + signedAmount(row));
    setRowBalance(row, runningBalance);
  }
}

function makeFeeRow(original: HTMLButtonElement, signature: string) {
  const clone = original.cloneNode(true) as HTMLButtonElement;
  clone.dataset.messageFeeRow = "true";
  clone.dataset.messageFeeFor = signature;
  clone.setAttribute("aria-label", MESSAGE_FEE_TITLE);
  clone.style.cursor = "default";

  const details = findDetailsBox(clone);
  if (details) {
    details.replaceChildren();
    details.className = "min-w-0 flex-1 py-[12px] pl-3 pr-[106px]";
    const title = document.createElement("p");
    title.className = "truncate leading-[1.15]";
    title.textContent = MESSAGE_FEE_TITLE;
    details.appendChild(title);
  }

  updateFeeAmount(clone);
  syncFeeTimestamp(original, clone);
  return clone;
}

function removeOrphanFeeRows(list: HTMLElement) {
  const feeRows = Array.from(
    list.querySelectorAll<HTMLButtonElement>('button[data-message-fee-row="true"]'),
  );
  for (const feeRow of feeRows) {
    const previous = feeRow.previousElementSibling;
    if (!(previous instanceof HTMLButtonElement) || !isFastMovement(previous)) {
      feeRow.remove();
      continue;
    }
    if (feeRow.dataset.messageFeeFor !== movementSignature(previous)) feeRow.remove();
  }
}

function applyMessageFeeRows() {
  const list = accountMovementList();
  if (!list) return;

  let movements = Array.from(list.children).filter(
    (element): element is HTMLButtonElement => element instanceof HTMLButtonElement,
  );
  pinRequestedDates(movements);
  removeOrphanFeeRows(list);

  movements = Array.from(list.children).filter(
    (element): element is HTMLButtonElement => element instanceof HTMLButtonElement,
  );

  for (const movement of movements) {
    if (!isFastMovement(movement)) continue;
    const signature = movementSignature(movement);
    const next = movement.nextElementSibling;
    if (
      next instanceof HTMLButtonElement &&
      next.dataset.messageFeeRow === "true" &&
      next.dataset.messageFeeFor === signature
    ) {
      updateFeeAmount(next);
      syncFeeTimestamp(movement, next);
      continue;
    }
    movement.after(makeFeeRow(movement, signature));
  }

  reconcileMovementBalances(list);
}

let scheduled = false;
function scheduleApply() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    applyMessageFeeRows();
  });
}

const observer = new MutationObserver(scheduleApply);
observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });

document.addEventListener("DOMContentLoaded", scheduleApply);
window.addEventListener("storage", scheduleApply);
document.addEventListener("click", applyMessageFeeRows, true);
scheduleApply();
