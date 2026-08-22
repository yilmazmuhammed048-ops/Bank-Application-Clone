type DemoTransaction = {
  id?: string | number;
  title?: string;
  description?: string;
  amount?: string | number;
  date?: string;
  time?: string;
  recipientName?: string;
  recipientIban?: string;
  recipientBank?: string;
  transactionNumber?: string;
  type?: "income" | "expense";
};

type DemoAccount = {
  name?: string;
  iban?: string;
  accountNumber?: string;
  balance?: string | number;
};

type PdfImage = {
  bytes: Uint8Array;
  width: number;
  height: number;
};

const textEncoder = new TextEncoder();
let sharing = false;

function parseAmount(value: string | number | undefined) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;

  const cleaned = String(value ?? "0")
    .replace(/TL/gi, "")
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(/[^\d.-]/g, "");

  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatMoney(value: string | number | undefined) {
  return `${Math.abs(parseAmount(value)).toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} TL`;
}

function readDemoData() {
  let account: DemoAccount = {};
  let transactions: DemoTransaction[] = [];

  try {
    account = JSON.parse(localStorage.getItem("demo_account") || "{}") as DemoAccount;
  } catch {
    account = {};
  }

  try {
    const parsed = JSON.parse(localStorage.getItem("demo_transactions") || "[]");
    transactions = Array.isArray(parsed) ? parsed : [];
  } catch {
    transactions = [];
  }

  return { account, transactions };
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
) {
  const words = String(text || "-").split(/\s+/);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width <= maxWidth || !line) {
      line = next;
    } else {
      lines.push(line);
      line = word;
    }
  }

  if (line) lines.push(line);
  return lines.length ? lines : ["-"];
}

function drawField(
  ctx: CanvasRenderingContext2D,
  label: string,
  value: string,
  y: number,
) {
  const left = 110;
  const labelWidth = 300;
  const valueLeft = left + labelWidth;
  const maxWidth = 720;

  ctx.fillStyle = "#666";
  ctx.font = "600 28px Arial, Helvetica, sans-serif";
  ctx.fillText(label, left, y);

  ctx.fillStyle = "#171717";
  ctx.font = "500 30px Arial, Helvetica, sans-serif";
  const lines = wrapText(ctx, value || "-", maxWidth);
  lines.slice(0, 3).forEach((line, index) => {
    ctx.fillText(line, valueLeft, y + index * 38);
  });

  const height = Math.max(66, lines.slice(0, 3).length * 38 + 20);
  ctx.strokeStyle = "#e5e5e5";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(left, y + height - 18);
  ctx.lineTo(1130, y + height - 18);
  ctx.stroke();

  return y + height;
}

function makeReceiptCanvas(
  transaction: DemoTransaction,
  account: DemoAccount,
  index: number,
  total: number,
) {
  const canvas = document.createElement("canvas");
  canvas.width = 1240;
  canvas.height = 1754;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("PDF çizim alanı oluşturulamadı.");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#b91524";
  ctx.fillRect(0, 0, canvas.width, 150);

  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.font = "800 42px Arial, Helvetica, sans-serif";
  ctx.fillText("DEMO / ÖRNEKTİR", canvas.width / 2, 62);
  ctx.font = "700 25px Arial, Helvetica, sans-serif";
  ctx.fillText("GERÇEK BANKA DEKONTU VEYA İŞLEM KANITI DEĞİLDİR", canvas.width / 2, 108);

  ctx.textAlign = "left";
  ctx.fillStyle = "#171717";
  ctx.font = "800 48px Arial, Helvetica, sans-serif";
  ctx.fillText("DEMO İŞLEM DEKONTU", 110, 245);

  ctx.fillStyle = "#777";
  ctx.font = "500 24px Arial, Helvetica, sans-serif";
  ctx.fillText(`Sayfa ${index + 1} / ${total}`, 110, 290);

  const direction = transaction.type === "income" ? "GELEN ÖDEME" : "GİDEN ÖDEME";
  const signedAmount = `${transaction.type === "income" ? "+" : "-"}${formatMoney(transaction.amount)}`;

  let y = 370;
  y = drawField(ctx, "İşlem", transaction.title || "İşlem", y);
  y = drawField(ctx, "Yön", direction, y);
  y = drawField(ctx, "Tutar", signedAmount, y);
  y = drawField(ctx, "Tarih", transaction.date || "-", y);
  y = drawField(ctx, "Saat", transaction.time || "-", y);
  y = drawField(ctx, "Alıcı / Gönderen", transaction.recipientName || "-", y);
  y = drawField(ctx, "IBAN", transaction.recipientIban || "-", y);
  y = drawField(ctx, "Banka", transaction.recipientBank || "-", y);
  y = drawField(ctx, "İşlem No", transaction.transactionNumber || String(transaction.id ?? "-"), y);
  y = drawField(ctx, "Açıklama", transaction.description || "-", y);

  if (account.name) y = drawField(ctx, "Demo hesap sahibi", account.name, y);
  if (account.accountNumber) y = drawField(ctx, "Demo hesap no", account.accountNumber, y);
  if (account.balance !== undefined) y = drawField(ctx, "Demo bakiye", formatMoney(account.balance), y);

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(-Math.PI / 6);
  ctx.textAlign = "center";
  ctx.globalAlpha = 0.1;
  ctx.fillStyle = "#b91524";
  ctx.font = "900 150px Arial, Helvetica, sans-serif";
  ctx.fillText("DEMO - ÖRNEKTİR", 0, 0);
  ctx.restore();

  ctx.textAlign = "center";
  ctx.fillStyle = "#6b6b6b";
  ctx.font = "700 22px Arial, Helvetica, sans-serif";
  ctx.fillText(
    "Bu belge yalnızca demo/test amaçlıdır ve gerçek bir banka belgesi değildir.",
    canvas.width / 2,
    1660,
  );

  return canvas;
}

function dataUrlToBytes(dataUrl: string) {
  const encoded = dataUrl.split(",")[1] || "";
  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function concatBytes(parts: Uint8Array[]) {
  const size = parts.reduce((sum, part) => sum + part.length, 0);
  const output = new Uint8Array(size);
  let offset = 0;

  for (const part of parts) {
    output.set(part, offset);
    offset += part.length;
  }

  return output;
}

function ascii(value: string) {
  return textEncoder.encode(value);
}

function buildPdf(images: PdfImage[]) {
  const objectCount = 2 + images.length * 3;
  const objects = new Map<number, Uint8Array>();
  const pageIds = images.map((_, index) => 3 + index * 3);

  objects.set(1, ascii("<< /Type /Catalog /Pages 2 0 R >>"));
  objects.set(
    2,
    ascii(
      `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`,
    ),
  );

  images.forEach((image, index) => {
    const pageId = 3 + index * 3;
    const imageId = pageId + 1;
    const contentId = pageId + 2;

    objects.set(
      pageId,
      ascii(
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /XObject << /Im0 ${imageId} 0 R >> >> /Contents ${contentId} 0 R >>`,
      ),
    );

    objects.set(
      imageId,
      concatBytes([
        ascii(
          `<< /Type /XObject /Subtype /Image /Width ${image.width} /Height ${image.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${image.bytes.length} >>\nstream\n`,
        ),
        image.bytes,
        ascii("\nendstream"),
      ]),
    );

    const content = ascii("q\n595.28 0 0 841.89 0 0 cm\n/Im0 Do\nQ\n");
    objects.set(
      contentId,
      concatBytes([
        ascii(`<< /Length ${content.length} >>\nstream\n`),
        content,
        ascii("endstream"),
      ]),
    );
  });

  const chunks: Uint8Array[] = [ascii("%PDF-1.4\n%DEMO\n")];
  const offsets = new Array<number>(objectCount + 1).fill(0);
  let byteLength = chunks[0].length;

  for (let id = 1; id <= objectCount; id += 1) {
    const body = objects.get(id);
    if (!body) throw new Error("PDF nesnesi eksik.");

    offsets[id] = byteLength;
    const objectChunk = concatBytes([
      ascii(`${id} 0 obj\n`),
      body,
      ascii("\nendobj\n"),
    ]);
    chunks.push(objectChunk);
    byteLength += objectChunk.length;
  }

  const xrefOffset = byteLength;
  let xref = `xref\n0 ${objectCount + 1}\n0000000000 65535 f \n`;
  for (let id = 1; id <= objectCount; id += 1) {
    xref += `${String(offsets[id]).padStart(10, "0")} 00000 n \n`;
  }

  xref += `trailer\n<< /Size ${objectCount + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  chunks.push(ascii(xref));

  return new Blob([concatBytes(chunks)], { type: "application/pdf" });
}

function downloadPdf(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

async function shareAllDemoReceipts() {
  const { account, transactions } = readDemoData();

  if (!transactions.length) {
    alert("Paylaşılacak demo hesap hareketi bulunmuyor.");
    return;
  }

  const limitedTransactions = transactions.slice(0, 20);
  const images: PdfImage[] = limitedTransactions.map((transaction, index) => {
    const canvas = makeReceiptCanvas(
      transaction,
      account,
      index,
      limitedTransactions.length,
    );

    return {
      bytes: dataUrlToBytes(canvas.toDataURL("image/jpeg", 0.92)),
      width: canvas.width,
      height: canvas.height,
    };
  });

  const blob = buildPdf(images);
  const filename = `demo-dekontlar-${new Date().toISOString().slice(0, 10)}.pdf`;
  const file = new File([blob], filename, { type: "application/pdf" });
  const shareData: ShareData = {
    files: [file],
    title: "Demo dekontlar",
    text: "Demo / örnek işlem dekontları",
  };

  if (navigator.share && (!navigator.canShare || navigator.canShare(shareData))) {
    try {
      await navigator.share(shareData);
      return;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
    }
  }

  downloadPdf(blob, filename);
}

function isThreeDotButton(button: HTMLButtonElement) {
  const svgClass = button.querySelector("svg")?.getAttribute("class") || "";
  const buttonClass = button.className || "";

  return (
    svgClass.includes("lucide-ellipsis-vertical") ||
    svgClass.includes("lucide-more-vertical") ||
    (buttonClass.includes("ml-auto") &&
      buttonClass.includes("mb-2") &&
      buttonClass.includes("h-9") &&
      buttonClass.includes("w-9"))
  );
}

document.addEventListener(
  "click",
  async (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const button = target.closest("button");
    if (!(button instanceof HTMLButtonElement) || !isThreeDotButton(button)) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    if (sharing) return;
    sharing = true;
    button.setAttribute("aria-busy", "true");
    button.setAttribute("aria-label", "Dekontları PDF paylaş");

    try {
      await shareAllDemoReceipts();
    } catch {
      alert("PDF oluşturulamadı. Lütfen tekrar deneyin.");
    } finally {
      sharing = false;
      button.removeAttribute("aria-busy");
    }
  },
  true,
);
