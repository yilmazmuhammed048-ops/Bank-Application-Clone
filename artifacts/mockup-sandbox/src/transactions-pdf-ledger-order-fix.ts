export {};

const MONTHS: Record<string, number> = {
  OCA: 1, OCAK: 1,
  ŞUB: 2, ŞUBAT: 2, SUB: 2, SUBAT: 2,
  MAR: 3, MART: 3,
  NİS: 4, NİSAN: 4, NIS: 4, NISAN: 4,
  MAY: 5, MAYIS: 5,
  HAZ: 6, HAZİRAN: 6, HAZIRAN: 6,
  TEM: 7, TEMMUZ: 7,
  AĞU: 8, AĞUSTOS: 8, AGU: 8, AGUSTOS: 8,
  EYL: 9, EYLÜL: 9, EYLUL: 9,
  EKİ: 10, EKİM: 10, EKI: 10, EKIM: 10,
  KAS: 11, KASIM: 11,
  ARA: 12, ARALIK: 12,
};

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

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
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

function accountMovementList() {
  const filter = document.querySelector<HTMLButtonElement>('button[aria-label="Filtre"]');
  const list = filter?.parentElement?.nextElementSibling;
  return list instanceof HTMLElement ? list : null;
}

function findDateBox(row: HTMLElement) {
  return Array.from(row.children).find((element): element is HTMLElement => {
    if (!(element instanceof HTMLElement)) return false;
    const spans = element.querySelectorAll("span");
    return spans.length >= 3 && /^\d{1,2}:\d{2}$/.test((spans[2]?.textContent || "").trim());
  });
}

function rowTimestamp(row: HTMLButtonElement) {
  const dateBox = findDateBox(row);
  if (!dateBox) return Number.NEGATIVE_INFINITY;

  const spans = Array.from(dateBox.querySelectorAll("span"));
  const day = Number((spans[0]?.textContent || "0").trim());
  const monthKey = (spans[1]?.textContent || "").trim().toLocaleUpperCase("tr-TR");
  const month = MONTHS[monthKey] ?? 0;
  const time = (spans[2]?.textContent || "00:00").trim().match(/^(\d{1,2}):(\d{2})/);
  const hour = Number(time?.[1] ?? 0);
  const minute = Number(time?.[2] ?? 0);
  const year = new Date().getFullYear();

  if (!day || !month) return Number.NEGATIVE_INFINITY;
  return (((((year * 100) + month) * 100 + day) * 100 + hour) * 100) + minute;
}

function findAmountBox(row: HTMLElement) {
  return Array.from(row.children).find((element): element is HTMLElement => {
    if (!(element instanceof HTMLElement)) return false;
    const text = (element.textContent || "").trim();
    return /^[+-]\s*[\d.]+,\d{2}\s*TL$/i.test(text);
  });
}

function findBalanceBox(row: HTMLElement) {
  return Array.from(row.querySelectorAll<HTMLElement>("div")).find((element) =>
    /Kalan\s+Bakiye/i.test(element.textContent || ""),
  );
}

function setRowBalance(row: HTMLButtonElement, value: number) {
  const balanceBox = findBalanceBox(row);
  if (!balanceBox) return;
  const spans = Array.from(balanceBox.querySelectorAll("span"));
  const valueSpan = spans.at(-1);
  if (!valueSpan) return;
  valueSpan.textContent = formatMoney(value);
}

function signedAmount(row: HTMLButtonElement) {
  const text = (findAmountBox(row)?.textContent || "0").trim();
  const amount = Math.abs(parseMoney(text));
  if (text.startsWith("-")) return -amount;
  if (text.startsWith("+")) return amount;
  return parseMoney(text);
}

function normalizeLedgerForPdf() {
  const list = accountMovementList();
  if (!list) return;

  const rows = Array.from(list.children).filter(
    (element): element is HTMLButtonElement => element instanceof HTMLButtonElement,
  );
  if (!rows.length) return;

  // Görsel sıralama en yeni -> en eski kalır.
  const ordered = rows
    .map((row, index) => ({ row, index, timestamp: rowTimestamp(row) }))
    .sort((a, b) => b.timestamp - a.timestamp || a.index - b.index)
    .map((entry) => entry.row);

  const orderChanged = ordered.some((row, index) => row !== rows[index]);
  if (orderChanged) {
    const fragment = document.createDocumentFragment();
    ordered.forEach((row) => fragment.appendChild(row));
    list.appendChild(fragment);
  }

  const ledgerRows = ordered.filter((row) => findAmountBox(row) !== undefined);
  if (!ledgerRows.length) return;

  // Bakiye hesabı ilk gelen/en eski hareketten başlar. Ana sayfadaki bakiye
  // başlangıç değeridir; sonra '-' düşer, '+' eklenir ve güncele doğru ilerler.
  let runningBalance = roundMoney(currentAccountBalance());
  if (!Number.isFinite(runningBalance)) return;

  for (const row of [...ledgerRows].reverse()) {
    runningBalance = roundMoney(runningBalance + signedAmount(row));
    setRowBalance(row, runningBalance);
  }
}

document.addEventListener(
  "click",
  (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const button = target.closest<HTMLButtonElement>('button[aria-label="Mesajlar"]');
    if (!button) return;
    normalizeLedgerForPdf();
  },
  true,
);
