export {};

// Bakiye zinciri EN ESKİ (ilk gelen) hareketten başlar.
// Ana sayfadaki bakiye başlangıç bakiyesidir; ardından hareketler kronolojik
// olarak eskiden yeniye doğru uygulanır. Eksi düşer, artı eklenir.
// Ekran yeni -> eski sıralı kalsa bile hesaplama ters yönde, eski -> yeni yapılır.
//
// Örnek:
// Başlangıç 100.000
// en eski -20.000 => 80.000
// sonraki -5.000 => 75.000
// sonraki +8.600 => 83.600

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

  const next = formatMoney(value);
  if (valueSpan.textContent !== next) valueSpan.textContent = next;
}

function signedAmountForRow(row: HTMLButtonElement) {
  const text = (findAmountBox(row)?.textContent || "0").trim();
  const amount = Math.abs(parseMoney(text));

  if (text.startsWith("-")) return -amount;
  if (text.startsWith("+")) return amount;
  return parseMoney(text);
}

function reconcileRunningBalance() {
  const list = accountMovementList();
  if (!list) return;

  const rows = Array.from(list.children).filter(
    (element): element is HTMLButtonElement =>
      element instanceof HTMLButtonElement && findAmountBox(element) !== undefined,
  );
  if (!rows.length) return;

  let runningBalance = roundMoney(currentAccountBalance());
  if (!Number.isFinite(runningBalance)) return;

  // DOM listesi en yeni -> en eski. Hesap ise kullanıcının istediği gibi
  // en eski (listenin en altı) -> en yeni (listenin en üstü) yapılır.
  const chronologicalRows = [...rows].reverse();

  for (const row of chronologicalRows) {
    runningBalance = roundMoney(runningBalance + signedAmountForRow(row));
    setRowBalance(row, runningBalance);
  }
}

let scheduled = false;
function scheduleReconcile() {
  if (scheduled) return;
  scheduled = true;
  window.requestAnimationFrame(() => {
    scheduled = false;
    reconcileRunningBalance();
  });
}

const observer = new MutationObserver(scheduleReconcile);
observer.observe(document.documentElement, {
  childList: true,
  subtree: true,
  characterData: true,
});

window.addEventListener("storage", scheduleReconcile);
document.addEventListener("click", reconcileRunningBalance, true);
window.setInterval(reconcileRunningBalance, 1000);
scheduleReconcile();
