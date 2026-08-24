export {};

type StoredTransaction = {
  id?: string | number;
  transactionNumber?: string;
  description?: string;
};

const patchFlag = "__receiptPdfDescriptionLinePatched";
const prototype = CanvasRenderingContext2D.prototype as CanvasRenderingContext2D & Record<string, unknown>;

function readDescription(transactionNumber: string) {
  try {
    const parsed = JSON.parse(localStorage.getItem("demo_transactions") || "[]");
    if (!Array.isArray(parsed)) return "";

    const transaction = (parsed as StoredTransaction[]).find(
      (item) => String(item.transactionNumber ?? item.id ?? "") === transactionNumber,
    );

    return String(transaction?.description ?? "")
      .replace(/\s+/g, " ")
      .trim();
  } catch {
    return "";
  }
}

if (!prototype[patchFlag]) {
  prototype[patchFlag] = true;
  const nativeFillText = CanvasRenderingContext2D.prototype.fillText;

  CanvasRenderingContext2D.prototype.fillText = function (
    text: string,
    x: number,
    y: number,
    maxWidth?: number,
  ) {
    const value = String(text ?? "");
    const isReceiptFastLine =
      /^Fast Mesaj Kodu\s*:/i.test(value) &&
      Math.abs(Number(x) - 44.8) < 1.5 &&
      Number(y) > 175 &&
      Number(y) < 205;

    if (isReceiptFastLine) {
      const number = value.match(/Fast Sorgu No\s*:\s*([^\s]+)/i)?.[1]?.trim() || "";
      const description = number ? readDescription(number) : "";

      if (description) {
        const descriptionY = y - 7;
        if (typeof maxWidth === "number") {
          nativeFillText.call(this, description, x, descriptionY, maxWidth);
        } else {
          nativeFillText.call(this, description, x, descriptionY);
        }
      }
    }

    if (typeof maxWidth === "number") {
      nativeFillText.call(this, value, x, y, maxWidth);
    } else {
      nativeFillText.call(this, value, x, y);
    }
  };
}
