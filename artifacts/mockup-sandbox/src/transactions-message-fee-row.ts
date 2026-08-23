export {};

const MESSAGE_FEE = 0.37;
const MESSAGE_FEE_TITLE = "MESAJ ÜCRETİ TUTARI";

function parseMoney(text: string) {
  const normalized = text
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

function isFastMovement(row: HTMLButtonElement) {
  if (row.dataset.messageFeeRow === "true") return false;
  const text = row.innerText || row.textContent || "";
  return /\bFAST\b/i.test(text);
}

function movementSignature(row: HTMLButtonElement) {
  const text = (row.innerText || row.textContent || "").replace(/\s+/g, " ").trim();
  return hash(text);
}

function findBalanceBox(row: HTMLElement) {
  return Array.from(row.querySelectorAll<HTMLElement>("div")).find((element) =>
    /Kalan\s+Bakiye/i.test(element.textContent || ""),
  );
}

function findAmountBox(row: HTMLElement) {
  return Array.from(row.children).find((element): element is HTMLElement => {
    if (!(element instanceof HTMLElement)) return false;
    const text = (element.textContent || "").trim();
    return /^[+-]\s*[\d.]+,\d{2}\s*TL$/i.test(text);
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

function syncFeeTimestamp(original: HTMLButtonElement, feeRow: HTMLButtonElement) {
  const originalDateBox = findDateBox(original);
  const feeDateBox = findDateBox(feeRow);
  if (!originalDateBox || !feeDateBox) return;

  const source = Array.from(originalDateBox.querySelectorAll("span"));
  const target = Array.from(feeDateBox.querySelectorAll("span"));
  for (let i = 0; i < Math.min(3, source.length, target.length); i += 1) {
    target[i].textContent = source[i].textContent;
  }
}

function updateFeeBalance(original: HTMLButtonElement, feeRow: HTMLButtonElement) {
  const originalBalanceBox = findBalanceBox(original);
  const feeBalanceBox = findBalanceBox(feeRow);
  if (!originalBalanceBox || !feeBalanceBox) return;

  const originalSpans = Array.from(originalBalanceBox.querySelectorAll("span"));
  const balanceText = originalSpans.at(-1)?.textContent || originalBalanceBox.textContent || "";
  const balance = parseMoney(balanceText);
  const feeBalance = balance - MESSAGE_FEE;

  const feeSpans = Array.from(feeBalanceBox.querySelectorAll("span"));
  const valueSpan = feeSpans.at(-1);
  if (valueSpan) valueSpan.textContent = formatMoney(feeBalance);
}

function updateFeeAmount(feeRow: HTMLButtonElement) {
  const amountBox = findAmountBox(feeRow);
  if (!amountBox) return;

  amountBox.textContent = "-0,37 TL";
  amountBox.classList.remove("text-[#24934c]");
  amountBox.classList.add("text-[#303a40]");
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
  updateFeeBalance(original, clone);
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

    const signature = movementSignature(previous);
    if (feeRow.dataset.messageFeeFor !== signature) feeRow.remove();
  }
}

function applyMessageFeeRows() {
  const list = accountMovementList();
  if (!list) return;

  removeOrphanFeeRows(list);

  const movements = Array.from(list.children).filter(
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
      updateFeeBalance(movement, next);
      continue;
    }

    movement.after(makeFeeRow(movement, signature));
  }
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
observer.observe(document.documentElement, {
  childList: true,
  subtree: true,
  characterData: true,
});

document.addEventListener("DOMContentLoaded", scheduleApply);
window.addEventListener("storage", scheduleApply);
scheduleApply();
