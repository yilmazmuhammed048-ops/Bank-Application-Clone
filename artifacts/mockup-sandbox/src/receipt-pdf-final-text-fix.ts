export {};

type ReceiptTextState = {
  fast?: string;
  sender?: string;
  bank?: string;
  account?: string;
  amount?: string;
  commission?: string;
  total?: string;
};

const receiptTextState = new WeakMap<HTMLCanvasElement, ReceiptTextState>();
const finalizedReceiptCanvases = new WeakSet<HTMLCanvasElement>();
const previousFillText = CanvasRenderingContext2D.prototype.fillText;

function isReceiptCanvas(canvas: HTMLCanvasElement | null | undefined) {
  return canvas?.width === 1240 && canvas?.height === 1754;
}

CanvasRenderingContext2D.prototype.fillText = function receiptFinalTextCapture(
  text: string,
  x: number,
  y: number,
  maxWidth?: number,
) {
  const next = String(text);

  if (isReceiptCanvas(this.canvas) && x === 106) {
    const state = receiptTextState.get(this.canvas) || {};

    if (next.startsWith("Fast Mesaj Kodu")) state.fast = next;
    else if (next.startsWith("Gönderen :")) state.sender = next;
    else if (next.startsWith("Alan Banka :")) state.bank = next;
    else if (next.startsWith("Alıcı Hesap :")) state.account = next;
    else if (next.startsWith("İşlem Tutarı :")) state.amount = next;
    else if (next.startsWith("Komisyon :")) state.commission = next;
    else if (next.startsWith("Toplam Masraf :")) state.total = next;

    receiptTextState.set(this.canvas, state);
  }

  if (typeof maxWidth === "number") {
    return previousFillText.call(this, next, x, y, maxWidth);
  }
  return previousFillText.call(this, next, x, y);
};

const previousToDataURL = HTMLCanvasElement.prototype.toDataURL;

HTMLCanvasElement.prototype.toDataURL = function receiptFinalTextToDataURL(
  type?: string,
  quality?: any,
) {
  if (isReceiptCanvas(this) && !finalizedReceiptCanvases.has(this)) {
    const context = this.getContext("2d");
    const state = receiptTextState.get(this);

    if (context && state?.fast) {
      finalizedReceiptCanvases.add(this);

      // Remove the previously rendered detail/request area so the final PDF
      // contains exactly one clean copy of every line.
      context.save();
      context.fillStyle = "#ffffff";
      context.fillRect(90, 392, 1020, 230);

      // Persistent demo marker in the upper-left corner of the generated PDF.
      context.fillStyle = "#b00020";
      context.fillRect(82, 44, 138, 46);
      context.fillStyle = "#ffffff";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.font = '700 26px Arial, Helvetica, sans-serif';
      previousFillText.call(context, "DEMO", 151, 67);

      context.fillStyle = "#1f2326";
      context.textAlign = "left";
      context.textBaseline = "alphabetic";
      context.font = '500 15.6px Arial, Helvetica, sans-serif';

      const detailLines = [
        "124587",
        state.fast,
        state.sender,
        state.bank,
        state.account,
        state.amount,
        state.commission,
        state.total,
      ].filter((value): value is string => Boolean(value));

      let y = 414;
      for (const line of detailLines) {
        // x=106.01 intentionally bypasses older exact-coordinate layout
        // patches while remaining visually aligned with the reference.
        previousFillText.call(context, line, 106.01, y, 1005);
        y += 20;
      }

      const amountText = (state.amount || "")
        .replace(/^İşlem\s+Tutarı\s*:\s*/i, "")
        .trim();
      const totalText = (state.total || "")
        .replace(/^Toplam\s+Masraf\s*:\s*/i, "")
        .trim();

      if (amountText && totalText) {
        context.font = '500 14.8px Arial, Helvetica, sans-serif';
        previousFillText.call(
          context,
          `${amountText} tutarında Fast işleminin yapılmasını, Bu işlem için tarafıma bildirilen ${totalText} masraf alınmasını talep ederim.`,
          106.01,
          584,
          910,
        );
      }

      context.restore();
    }
  }

  return previousToDataURL.call(this, type, quality);
};
