import "./receipt-exact-logo-patch";
import "./receipt-pdf-file-save";

export {};

type StoredTransaction = {
  id: string;
  title: string;
  amount: number;
  date: string;
  time: string;
  recipientName: string;
  recipientIban: string;
  recipientBank: string;
  transactionNumber: string;
  type: "income" | "expense";
};

function parseMoney(value: string) {
  const normalized = value
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(/[^\d.-]/g, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? Math.abs(parsed) : 0;
}

function pick(text: string, pattern: RegExp) {
  return text.match(pattern)?.[1]?.trim() || "";
}

function syncOpenReceiptToStorage(screen: HTMLElement) {
  const text = screen.innerText || screen.textContent || "";

  const transactionNumber = pick(text, /Fast\s+Sorgu\s+No\s*:\s*([^\s]+)/i);
  const amountText = pick(text, /İşlem\s+Tutarı\s*:\s*([+\-]?[\d.]+,\d{2})\s*(?:TL|TRY)/i);
  const recipientBank = pick(text, /Alan\s+Banka\s*:\s*([^\n]+)/i);
  const recipientIban = pick(text, /Alıcı\s+Hesap\s*:\s*(TR[\d\s*]+)/i);
  const receiverName = pick(text, /Alıcı\s*:\s*([^\n]+)/i);
  const senderName = pick(text, /Gönderen\s*:\s*([^\n]+)/i);
  const dateTime = text.match(/İŞLEM\s+TARİHİ\s*:?\s*(\d{1,2}\s+[^\s]+\s+\d{4})\s+(\d{2}:\d{2})/i);

  const incoming = /HESABA\s+GELEN\s+FAST/i.test(text);
  const recipientName = incoming ? senderName : receiverName;
  const amount = parseMoney(amountText);

  if (!transactionNumber || !amount || !recipientName) return false;

  const tx: StoredTransaction = {
    id: transactionNumber,
    title: incoming ? "FAST Gelen" : "FAST Giden",
    amount,
    date: dateTime?.[1]?.trim() || pick(text, /VALÖR\s*:?\s*([^\n]+)/i),
    time: dateTime?.[2]?.trim() || "00:00",
    recipientName,
    recipientIban,
    recipientBank: recipientBank || "Banka Bilgisi",
    transactionNumber,
    type: incoming ? "income" : "expense",
  };

  let stored: any[] = [];
  try {
    const parsed = JSON.parse(localStorage.getItem("demo_transactions") || "[]");
    stored = Array.isArray(parsed) ? parsed : [];
  } catch {
    stored = [];
  }

  const filtered = stored.filter(
    (item) => String(item?.transactionNumber ?? item?.id ?? "") !== transactionNumber,
  );
  localStorage.setItem("demo_transactions", JSON.stringify([tx, ...filtered]));
  return true;
}

document.addEventListener(
  "click",
  (event) => {
    const element = event.target instanceof Element ? event.target : null;
    const button = element?.closest<HTMLButtonElement>("button");
    if (!button) return;

    const receiptScreen = button.closest<HTMLElement>(".fixed.inset-0");
    if (!receiptScreen) return;

    const text = receiptScreen.innerText || receiptScreen.textContent || "";
    if (!text.includes("Fast Mesaj Kodu") || !text.includes("İşlem Tutarı")) return;

    const header = button.closest("header");
    if (!header) return;

    const headerButtons = Array.from(header.querySelectorAll<HTMLButtonElement>("button"));
    const isReceiptHeaderAction =
      headerButtons.length > 0 && button === headerButtons[headerButtons.length - 1];
    if (!isReceiptHeaderAction) return;

    const pdfButton = receiptScreen.querySelector<HTMLButtonElement>(
      'button[aria-label="Dekontu paylaş"]',
    );
    if (!pdfButton) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    if (!syncOpenReceiptToStorage(receiptScreen)) {
      alert("Açık dekont bilgileri PDF için hazırlanamadı. Lütfen tekrar deneyin.");
      return;
    }

    pdfButton.click();
  },
  true,
);
