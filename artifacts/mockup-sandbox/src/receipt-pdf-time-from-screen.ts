export {};

const originalGetItem = Storage.prototype.getItem;

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
    const timeMatch = valueText.match(/\b(\d{1,2}):(\d{2})(?::\d{2})?\b/);
    if (!timeMatch) continue;

    const transactionNumber = text.match(/Fast\s+Sorgu\s+No\s*:\s*([^\s]+)/i)?.[1]?.trim() || "";

    return {
      time: `${timeMatch[1].padStart(2, "0")}:${timeMatch[2]}`,
      transactionNumber,
    };
  }

  return null;
}

Storage.prototype.getItem = function receiptPdfTimeGetItem(key: string) {
  const stored = originalGetItem.call(this, key);
  if (this !== window.localStorage || key !== "demo_transactions" || !stored) return stored;

  const receipt = visibleReceiptTime();
  if (!receipt) return stored;

  try {
    const transactions = JSON.parse(stored);
    if (!Array.isArray(transactions)) return stored;

    let matched = false;
    const corrected = transactions.map((transaction: any) => {
      if (matched) return transaction;

      const id = String(transaction?.transactionNumber ?? transaction?.id ?? "");
      if (receipt.transactionNumber && id !== receipt.transactionNumber) return transaction;

      matched = true;
      return { ...transaction, time: receipt.time };
    });

    return matched ? JSON.stringify(corrected) : stored;
  } catch {
    return stored;
  }
};
