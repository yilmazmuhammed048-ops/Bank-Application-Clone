export {};

// Tek kaynak ana sayfadaki güncel hesap bakiyesidir. İlk görünen satır bu
// bakiyeyi taşır; bundan sonraki her satır ise SADECE kendi işlem tutarını
// bir önceki satırın kalan bakiyesine uygular.
//
// Örnek:
// 100.000 -> -20.000 = 80.000 -> -5.000 = 75.000
// Böylece hiçbir satır bir üstteki/başka bir işlemin tutarını yanlışlıkla
// tekrar uygulamaz.

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

  // En üst satır ana sayfadaki güncel bakiye ile kilitlenir.
  setRowBalance(rows[0], runningBalance);

  // Sonraki satırın bakiyesi = bir önceki satırın kalan bakiyesi +
  // BU satırın işaretli tutarı. Önceki satırın tutarı burada kullanılmaz.
  for (let index = 1; index < rows.length; index += 1) {
    const ownAmount = parseMoney(findAmountBox(rows[index])?.textContent || "0");
    runningBalance = roundMoney(runningBalance + ownAmount);
    setRowBalance(rows[index], runningBalance);
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

// Hareketler, ücret satırları veya admin bakiyesi değiştiği anda zinciri tekrar kur.
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
