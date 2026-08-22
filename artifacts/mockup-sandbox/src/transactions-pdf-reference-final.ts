type PdfMovementRow = {
  date: string;
  time: string;
  description: string;
  amount: string;
  balance: string;
  receiptNo: string;
};

const PDF_PAGE_WIDTH = 595.28;
const PDF_PAGE_HEIGHT = 841.89;
const CANVAS_WIDTH = 1240;
const CANVAS_HEIGHT = 1754;
const LOGO_DATA_URL = "data:image/jpeg;base64,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";

const MONTHS: Record<string, string> = {
  OCA: "01", ŞUB: "02", SUB: "02", MAR: "03", NİS: "04", NIS: "04", MAY: "05", HAZ: "06",
  TEM: "07", AĞU: "08", AGU: "08", EYL: "09", EKİ: "10", EKI: "10", KAS: "11", ARA: "12",
};

function normalizeDate(raw: string) {
  const clean = raw.replace(/\s+/g, " ").trim();
  const [day = "", month = ""] = clean.toLocaleUpperCase("tr-TR").split(" ");
  const monthNumber = MONTHS[month] || String(new Date().getMonth() + 1).padStart(2, "0");
  return `${day.padStart(2, "0")}.${monthNumber}.${new Date().getFullYear()}`;
}

function parseMoney(value: string) {
  const normalized = value.replace(/TL/gi, "").replace(/\s/g, "").replace(/\./g, "").replace(",", ".").replace(/[^\d+.-]/g, "");
  const number = Number(normalized);
  return Number.isFinite(number) ? number : 0;
}

function formatMoney(value: number) {
  return value.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines = 2) {
  const words = text.replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth) line = candidate;
    else {
      if (line) lines.push(line);
      line = word;
      if (lines.length >= maxLines) break;
    }
  }
  if (lines.length < maxLines && line) lines.push(line);
  return lines.slice(0, maxLines);
}

function readCurrentVisibleRows(screen: HTMLElement): PdfMovementRow[] {
  const filter = screen.querySelector<HTMLButtonElement>('button[aria-label="Filtre"]');
  const list = filter?.parentElement?.nextElementSibling as HTMLElement | null;
  if (!list) return [];
  const cards = Array.from(list.children).filter((element): element is HTMLButtonElement => element instanceof HTMLButtonElement);

  return cards.map((card, index) => {
    const directDivs = Array.from(card.children).filter((element): element is HTMLDivElement => element instanceof HTMLDivElement);
    if (directDivs.length < 4) return null;
    const dateSpans = Array.from(directDivs[0].querySelectorAll("span"));
    const day = dateSpans[0]?.textContent?.trim() || "";
    const month = dateSpans[1]?.textContent?.trim() || "";
    const time = dateSpans[2]?.textContent?.trim() || "";
    const description = Array.from(directDivs[1].querySelectorAll("p"))
      .map((p) => p.textContent?.trim() || "")
      .filter(Boolean)
      .join(" ");
    const amount = directDivs[2].textContent?.trim() || "";
    const balanceSpans = Array.from(directDivs[3].querySelectorAll("span"));
    const balance = balanceSpans.at(-1)?.textContent?.trim().replace(/\s*TL$/i, "") || "";

    return {
      date: normalizeDate(`${day} ${month}`),
      time,
      description,
      amount: amount.replace(/\s*TL$/i, ""),
      balance,
      receiptNo: `F${String(41071 + index * 221).padStart(5, "0")}`,
    } satisfies PdfMovementRow;
  }).filter((row): row is PdfMovementRow => Boolean(row));
}

function loadLogo() {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = LOGO_DATA_URL;
  });
}

async function drawPage(rows: PdfMovementRow[], period: string, totals: { debit: number; credit: number }, pageNumber: number, pageCount: number) {
  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");

  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  const logo = await loadLogo();
  ctx.drawImage(logo, 48, 43, 295, 80);

  ctx.fillStyle = "#c6001d";
  ctx.textAlign = "right";
  ctx.textBaseline = "alphabetic";
  ctx.font = '700 15px Arial, sans-serif';
  ctx.fillText("DEMO / ÖRNEK BELGE", 1185, 62);
  ctx.textAlign = "left";

  const boxX = 48, boxY = 126, boxW = 1144, boxH = 154;
  ctx.strokeStyle = "#111";
  ctx.lineWidth = 1.35;
  ctx.strokeRect(boxX, boxY, boxW, boxH);

  const font = '"Times New Roman", Times, serif';
  const leftLabel = 58, leftValue = 136, rightLabel = 700, rightValue = 868;
  ctx.fillStyle = "#111";
  ctx.font = `700 17px ${font}`;
  ctx.fillText("Sayın", leftLabel, boxY + 30);
  ctx.fillText("Adres", leftLabel, boxY + 91);
  ctx.fillText("Şube Kodu", rightLabel, boxY + 30);
  ctx.fillText("Müşteri/Hesap No", rightLabel, boxY + 58);
  ctx.fillText("IBAN", rightLabel, boxY + 86);
  ctx.fillText("Döviz Cinsi", rightLabel, boxY + 114);
  ctx.fillText("Dönem", rightLabel, boxY + 142);

  ctx.font = `400 17px ${font}`;
  ctx.fillText(":  MUHAMMED YILMAZ", leftValue, boxY + 30);
  ctx.fillText(":  FATİH MAH. HÜSEYİN TERZİOĞLU CAD. NO: 5 / 3 ÜRGÜP", leftValue, boxY + 91);
  ctx.fillText("   NEVŞEHİR", leftValue, boxY + 113);
  ctx.fillText(":  ZİRAAT SÜPER ŞUBE", rightValue, boxY + 30);
  ctx.fillText(":  104120627-5001", rightValue, boxY + 58);
  ctx.fillText(":  TR310001009010412062705001", rightValue, boxY + 86);
  ctx.fillText(":  TRY", rightValue, boxY + 114);
  ctx.fillText(`:  ${period}`, rightValue, boxY + 142);

  const tableX = 48, tableY = 300, tableW = 1144, headerH = 30;
  const colDate = tableX + 8;
  const colReceipt = tableX + 118;
  const colDescription = tableX + 250;
  const colAmountRight = tableX + 1015;
  const colBalanceRight = tableX + 1134;

  ctx.fillStyle = "#d5d5d5";
  ctx.fillRect(tableX, tableY, tableW, headerH);
  ctx.strokeStyle = "#111";
  ctx.lineWidth = 1.35;
  ctx.strokeRect(tableX, tableY, tableW, headerH);

  ctx.fillStyle = "#111";
  ctx.font = `700 16px ${font}`;
  ctx.fillText("Tarih", colDate, tableY + 21);
  ctx.fillText("Fiş No", colReceipt, tableY + 21);
  ctx.fillText("Açıklama", colDescription, tableY + 21);
  ctx.textAlign = "right";
  ctx.fillText("Tutar", colAmountRight, tableY + 21);
  ctx.fillText("Bakiye", colBalanceRight, tableY + 21);
  ctx.textAlign = "left";

  let y = tableY + headerH;
  for (const row of rows) {
    ctx.font = `400 15px ${font}`;
    const description = `${row.description}${row.time ? ` / ${row.time}` : ""}`;
    const lines = wrapText(ctx, description, 650, 2);
    const rowH = lines.length > 1 ? 42 : 31;
    const baseline = y + 20;
    ctx.fillText(row.date, colDate, baseline);
    ctx.fillText(row.receiptNo, colReceipt, baseline);
    lines.forEach((line, i) => ctx.fillText(line, colDescription, baseline + i * 17));
    ctx.textAlign = "right";
    ctx.fillText(row.amount, colAmountRight, baseline);
    ctx.fillText(row.balance, colBalanceRight, baseline);
    ctx.textAlign = "left";
    y += rowH;
  }

  if (pageNumber === pageCount) {
    ctx.font = `700 16px ${font}`;
    ctx.fillText("Borç:", colReceipt, y + 22);
    ctx.fillText("Alacak:", colReceipt, y + 46);
    ctx.textAlign = "right";
    ctx.fillText(`-${formatMoney(totals.debit)}`, colAmountRight, y + 22);
    ctx.fillText(formatMoney(totals.credit), colAmountRight, y + 46);
    ctx.textAlign = "left";
    y += 58;
  }

  ctx.strokeStyle = "#111";
  ctx.lineWidth = 1.35;
  ctx.strokeRect(tableX, tableY, tableW, Math.max(headerH + 35, y - tableY));

  ctx.fillStyle = "#111";
  ctx.font = '400 10px Arial, sans-serif';
  ctx.fillText("Bu belge uygulama içi güncel hareketlerden üretilmiş örnek çıktıdır; resmî banka ekstresi değildir.", tableX, y + 27);
  ctx.fillText("Hesap hareketleri yalnızca PDF oluşturulduğu anda ekranda görünen güncel listeyi baz alır.", tableX, y + 43);

  if (pageCount > 1) {
    ctx.fillStyle = "#666";
    ctx.font = '400 11px Arial, sans-serif';
    ctx.textAlign = "center";
    ctx.fillText(`${pageNumber} / ${pageCount}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 28);
    ctx.textAlign = "left";
  }

  return canvas;
}

async function canvasToJpeg(canvas: HTMLCanvasElement) {
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => result ? resolve(result) : reject(new Error("JPEG encode failed")), "image/jpeg", 0.96);
  });
  return new Uint8Array(await blob.arrayBuffer());
}

function concatBytes(chunks: Uint8Array[]) {
  const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const output = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    output.set(chunk, offset);
    offset += chunk.length;
  }
  return output;
}

async function buildPdf(canvases: HTMLCanvasElement[]) {
  const images = await Promise.all(canvases.map(canvasToJpeg));
  const encoder = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const offsets: number[] = [];
  let byteOffset = 0;
  const pushText = (value: string) => { const bytes = encoder.encode(value); chunks.push(bytes); byteOffset += bytes.length; };
  const pushBytes = (value: Uint8Array) => { chunks.push(value); byteOffset += value.length; };
  const beginObject = (number: number) => { offsets[number] = byteOffset; pushText(`${number} 0 obj\n`); };

  pushText("%PDF-1.4\n% Current account movements\n");
  beginObject(1); pushText("<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
  const pageObjects = images.map((_, index) => 3 + index * 3);
  beginObject(2); pushText(`<< /Type /Pages /Count ${images.length} /Kids [${pageObjects.map((n) => `${n} 0 R`).join(" ")}] >>\nendobj\n`);

  images.forEach((image, index) => {
    const pageObject = 3 + index * 3;
    const imageObject = pageObject + 1;
    const contentObject = pageObject + 2;
    beginObject(pageObject);
    pushText(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PDF_PAGE_WIDTH} ${PDF_PAGE_HEIGHT}] /Resources << /XObject << /Im0 ${imageObject} 0 R >> >> /Contents ${contentObject} 0 R >>\nendobj\n`);
    beginObject(imageObject);
    pushText(`<< /Type /XObject /Subtype /Image /Width ${CANVAS_WIDTH} /Height ${CANVAS_HEIGHT} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${image.length} >>\nstream\n`);
    pushBytes(image); pushText("\nendstream\nendobj\n");
    const content = `q\n${PDF_PAGE_WIDTH} 0 0 ${PDF_PAGE_HEIGHT} 0 0 cm\n/Im0 Do\nQ\n`;
    const bytes = encoder.encode(content);
    beginObject(contentObject); pushText(`<< /Length ${bytes.length} >>\nstream\n`); pushBytes(bytes); pushText("endstream\nendobj\n");
  });

  const objectCount = 2 + images.length * 3;
  const xrefOffset = byteOffset;
  pushText(`xref\n0 ${objectCount + 1}\n0000000000 65535 f \n`);
  for (let i = 1; i <= objectCount; i += 1) pushText(`${String(offsets[i] || 0).padStart(10, "0")} 00000 n \n`);
  pushText(`trailer\n<< /Size ${objectCount + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);
  return new Blob([concatBytes(chunks)], { type: "application/pdf" });
}

async function shareOrOpenPdf(blob: Blob) {
  const now = new Date();
  const stamp = `${String(now.getDate()).padStart(2, "0")}${String(now.getMonth() + 1).padStart(2, "0")}${now.getFullYear()}`;
  const filename = `Hesap_Hareketleri_${stamp}.pdf`;
  const file = new File([blob], filename, { type: "application/pdf" });
  const nav = navigator as Navigator & { canShare?: (data?: ShareData) => boolean };

  if (navigator.share && nav.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ title: "Hesap Hareketleri", files: [file] });
      return;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
    }
  }

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}

let exporting = false;

async function exportCurrentMovements(screen: HTMLElement) {
  if (exporting) return;
  exporting = true;
  try {
    const rows = readCurrentVisibleRows(screen);
    if (!rows.length) throw new Error("No visible movements");

    const dates = rows.map((row) => row.date);
    const period = `${dates.at(-1) || dates[0]}-${dates[0]}`;
    const debit = rows.reduce((sum, row) => sum + (parseMoney(row.amount) < 0 ? Math.abs(parseMoney(row.amount)) : 0), 0);
    const credit = rows.reduce((sum, row) => sum + (parseMoney(row.amount) > 0 ? parseMoney(row.amount) : 0), 0);
    const rowsPerPage = 13;
    const pageCount = Math.ceil(rows.length / rowsPerPage);
    const pages: HTMLCanvasElement[] = [];
    for (let index = 0; index < pageCount; index += 1) {
      pages.push(await drawPage(rows.slice(index * rowsPerPage, (index + 1) * rowsPerPage), period, { debit, credit }, index + 1, pageCount));
    }
    await shareOrOpenPdf(await buildPdf(pages));
  } catch (error) {
    console.error("Current account movements PDF export failed", error);
    window.alert("Hesap hareketleri PDF'i oluşturulamadı. Lütfen tekrar deneyin.");
  } finally {
    exporting = false;
  }
}

function installCurrentPdfExport() {
  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const mailButton = target.closest<HTMLButtonElement>('button[aria-label="Mesajlar"]');
    if (!mailButton) return;
    const screen = mailButton.closest<HTMLElement>(".min-h-screen");
    if (!screen?.querySelector('button[aria-label="Filtre"]')) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    void exportCurrentMovements(screen);
  }, true);
}

installCurrentPdfExport();
