export {};

const originalGetItem = Storage.prototype.getItem;
const originalSetItem = Storage.prototype.setItem;

function normalize(value: string) {
  return value.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

function visibleReceiptTime() {
  const overlays = Array.from(document.querySelectorAll<HTMLElement>("div.fixed.inset-0"));

  for (let index = overlays.length - 1; index >= 0; index -= 1) {
    const overlay = overlays[index];
    const text = normalize(overlay.textContent || "");
    if (!/İŞLEM TARİHİ/i.test(text)) continue;

    const label = Array.from(overlay.querySelectorAll("strong")).find(
      (node) => normalize(node.textContent || "").toLocaleUpperCase("tr-TR") === "İŞLEM TARİHİ",
    );
    const valueNode = label?.parentElement?.querySelector("span");
    const valueText = normalize(valueNode?.textContent || "").replace(/^:\s*/, "");

    const directTime = valueText.match(/\b(\d{1,2}):(\d{2})(?::\d{2})?\b/);
    const fallbackTime = text.match(
      /İŞLEM\s+TARİHİ\s*:?\s*(?:\d{1,2}[./-]\d{1,2}[./-]\d{4}|\d{1,2}\s+[^\s]+\s+\d{4})\s*[- ]?\s*(\d{1,2}):(\d{2})(?::\d{2})?/i,
    );
    const timeMatch = directTime || fallbackTime;
    if (!timeMatch) continue;

    const transactionNumber = text.match(/Fast\s+Sorgu\s+No\s*:\s*([^\s]+)/i)?.[1]?.trim() || "";
    if (!transactionNumber) continue;

    return {
      time: `${timeMatch[1].padStart(2, "0")}:${timeMatch[2]}`,
      transactionNumber,
    };
  }

  return null;
}

function correctSerializedTransactions(serialized: string, receipt: { time: string; transactionNumber: string }) {
  try {
    const transactions = JSON.parse(serialized);
    if (!Array.isArray(transactions)) return serialized;

    let matched = false;
    const corrected = transactions.map((transaction: any) => {
      if (matched) return transaction;

      const id = String(transaction?.transactionNumber ?? transaction?.id ?? "");
      if (id !== receipt.transactionNumber) return transaction;

      matched = true;
      return { ...transaction, time: receipt.time };
    });

    return matched ? JSON.stringify(corrected) : serialized;
  } catch {
    return serialized;
  }
}

Storage.prototype.getItem = function receiptPdfTimeGetItem(key: string) {
  const stored = originalGetItem.call(this, key);
  if (this !== window.localStorage || key !== "demo_transactions" || !stored) return stored;

  const receipt = visibleReceiptTime();
  if (!receipt) return stored;

  return correctSerializedTransactions(stored, receipt);
};

Storage.prototype.setItem = function receiptPdfTimeSetItem(key: string, value: string) {
  let nextValue = value;

  if (this === window.localStorage && key === "demo_transactions") {
    const receipt = visibleReceiptTime();
    if (receipt) {
      nextValue = correctSerializedTransactions(value, receipt);
    }
  }

  return originalSetItem.call(this, key, nextValue);
};
