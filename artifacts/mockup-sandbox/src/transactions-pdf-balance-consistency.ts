export {};

// Hesap hareketleri ekranındaki bakiye zinciri en eski hareketten güncele doğru
// matematiksel olarak kuruluyor. PDF oluşturucu kendi içinde eski bir geriye-doğru
// bakiye hesabı yaptığı için burada PDF çizimi sırasında ekranda kesinleşmiş bakiye
// değerlerini Bakiye sütununa aynen geçiriyoruz.

const PDF_BALANCE_X = 567;
let balanceQueue: string[] = [];
let balanceDrawIndex = 0;
let armed = false;
let disarmTimer: number | undefined;

function accountMovementList() {
  const filter = document.querySelector<HTMLButtonElement>('button[aria-label="Filtre"]');
  const list = filter?.parentElement?.nextElementSibling;
  return list instanceof HTMLElement ? list : null;
}

function balanceValue(row: HTMLButtonElement) {
  const balanceBox = Array.from(row.querySelectorAll<HTMLElement>("div")).find((element) =>
    /Kalan\s+Bakiye/i.test(element.textContent || ""),
  );
  if (!balanceBox) return "";

  const spans = Array.from(balanceBox.querySelectorAll("span"));
  const text = spans.at(-1)?.textContent || balanceBox.textContent || "";
  return text.replace(/Kalan\s+Bakiye|TL/gi, "").trim();
}

function captureBalancesForPdf() {
  const list = accountMovementList();
  if (!list) return;

  const nextQueue = Array.from(list.children)
    .filter((element): element is HTMLButtonElement => element instanceof HTMLButtonElement)
    .map(balanceValue)
    .filter(Boolean);

  if (!nextQueue.length) return;

  balanceQueue = nextQueue;
  balanceDrawIndex = 0;
  armed = true;

  if (disarmTimer !== undefined) window.clearTimeout(disarmTimer);
  disarmTimer = window.setTimeout(() => {
    armed = false;
    balanceQueue = [];
    balanceDrawIndex = 0;
  }, 6000);
}

// transactions-message-fee-row.ts daha önce import edildiği için onun capture
// listener'ı önce çalışır; böylece tarih ve bakiye hesabı bittikten sonra değerleri alırız.
document.addEventListener("click", captureBalancesForPdf, true);

if (typeof CanvasRenderingContext2D !== "undefined") {
  const prototype = CanvasRenderingContext2D.prototype as CanvasRenderingContext2D & {
    __statementBalancePatched?: boolean;
  };

  if (!prototype.__statementBalancePatched) {
    prototype.__statementBalancePatched = true;
    const nativeFillText = CanvasRenderingContext2D.prototype.fillText;

    CanvasRenderingContext2D.prototype.fillText = function (
      text: string,
      x: number,
      y: number,
      maxWidth?: number,
    ) {
      let output = text;

      if (
        armed &&
        Math.abs(x - PDF_BALANCE_X) < 0.25 &&
        balanceDrawIndex < balanceQueue.length &&
        /^-?[\d.]+,\d{2}$/.test(String(text).trim())
      ) {
        output = balanceQueue[balanceDrawIndex];
        balanceDrawIndex += 1;

        if (balanceDrawIndex >= balanceQueue.length) {
          armed = false;
        }
      }

      if (maxWidth === undefined) {
        return nativeFillText.call(this, output, x, y);
      }
      return nativeFillText.call(this, output, x, y, maxWidth);
    };
  }
}
