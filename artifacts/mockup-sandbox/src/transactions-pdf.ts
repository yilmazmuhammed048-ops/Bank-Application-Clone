type MovementRow = {
  date: string;
  time: string;
  description: string;
  amount: string;
  balance: string;
  isCredit: boolean;
  receiptNo: string;
};

type AccountInfo = {
  name: string;
  address: string;
  branch: string;
  accountNo: string;
  iban: string;
  currency: string;
};

const PDF_PAGE_WIDTH = 595.28;
const PDF_PAGE_HEIGHT = 841.89;
const CANVAS_WIDTH = 1240;
const CANVAS_HEIGHT = 1754;

const MONTHS: Record<string, string> = {
  OCA: "01",
  ŞUB: "02",
  SUB: "02",
  MAR: "03",
  NİS: "04",
  NIS: "04",
  MAY: "05",
  HAZ: "06",
  TEM: "07",
  AĞU: "08",
  AGU: "08",
  EYL: "09",
  EKİ: "10",
  EKI: "10",
  KAS: "11",
  ARA: "12",
};

function readAccountInfo(): AccountInfo {
  let saved: Record<string, unknown> = {};
  try {
    const raw = localStorage.getItem("demo_account");
    saved = raw ? JSON.parse(raw) : {};
  } catch {}

  const value = (...keys: string[]) => {
    for (const key of keys) {
      const item = saved[key];
      if (typeof item === "string" && item.trim()) return item.trim();
    }
    return "";
  };

  return {
    name: value("name", "customerName", "ownerName") || "MUHAMMED YILMAZ",
    address: value("address", "customerAddress") || "UYGULAMA İÇİ DEMO HESAP",
    branch: value("branch", "branchName") || "ZİRAAT SÜPER ŞUBE",
    accountNo: value("accountNo", "accountNumber") || "104120627-5001",
    iban: value("iban") || "TR31000110412062705001",
    currency: value("currency") || "TRY",
  };
}

function normalizeDate(raw: string) {
  const clean = raw.replace(/\s+/g, " ").trim();
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(clean)) return clean;
  const [day = "", month = ""] = clean.toLocaleUpperCase("tr-TR").split(" ");
  const monthNumber = MONTHS[month] || String(new Date().getMonth() + 1).padStart(2, "0");
  return `${day.padStart(2, "0")}.${monthNumber}.${new Date().getFullYear()}`;
}

function parseMoney(value: string) {
  const normalized = value
    .replace(/TL/gi, "")
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(/[^\d+.-]/g, "");
  const number = Number(normalized);
  return Number.isFinite(number) ? number : 0;
}

function formatPdfMoney(value: number) {
  return value.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function wrapText(context: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines = 2) {
  const words = text.replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (context.measureText(candidate).width <= maxWidth) {
      line = candidate;
      continue;
    }
    if (line) lines.push(line);
    line = word;
    if (lines.length >= maxLines) break;
  }

  if (lines.length < maxLines && line) lines.push(line);
  if (lines.length === maxLines && words.join(" ").length > lines.join(" ").length) {
    let last = lines[maxLines - 1];
    while (last.length > 2 && context.measureText(`${last}…`).width > maxWidth) last = last.slice(0, -1);
    lines[maxLines - 1] = `${last.trim()}…`;
  }
  return lines;
}

function readMovementRows(screen: HTMLElement): MovementRow[] {
  const filter = screen.querySelector<HTMLButtonElement>('button[aria-label="Filtre"]');
  const list = filter?.parentElement?.nextElementSibling as HTMLElement | null;
  if (!list) return [];

  const cards = Array.from(list.children).filter(
    (element): element is HTMLButtonElement => element instanceof HTMLButtonElement,
  );

  return cards
    .map((card, index) => {
      const directDivs = Array.from(card.children).filter(
        (element): element is HTMLDivElement => element instanceof HTMLDivElement,
      );
      if (directDivs.length < 4) return null;

      const dateSpans = Array.from(directDivs[0].querySelectorAll("span"));
      const day = dateSpans[0]?.textContent?.trim() || "";
      const month = dateSpans[1]?.textContent?.trim() || "";
      const time = dateSpans[2]?.textContent?.trim() || "";
      const description = Array.from(directDivs[1].querySelectorAll("p"))
        .map((paragraph) => paragraph.textContent?.trim() || "")
        .filter(Boolean)
        .join(" ");
      const amount = directDivs[2].textContent?.trim() || "";
      const balanceSpans = Array.from(directDivs[3].querySelectorAll("span"));
      const balance = balanceSpans.at(-1)?.textContent?.trim() || "";

      return {
        date: normalizeDate(`${day} ${month}`),
        time,
        description,
        amount,
        balance: balance.replace(/\s*TL$/i, ""),
        isCredit: amount.trim().startsWith("+"),
        receiptNo: `F${String(52000 + index + 1)}`,
      } satisfies MovementRow;
    })
    .filter((row): row is MovementRow => Boolean(row));
}

function drawLogo(context: CanvasRenderingContext2D) {
  context.fillStyle = "#e30620";
  context.fillRect(54, 45, 10, 48);
  context.fillRect(69, 38, 10, 55);
  context.fillRect(84, 45, 10, 48);
  context.fillStyle = "#111";
  context.font = '700 42px "Helvetica Neue", Arial, sans-serif';
  context.textBaseline = "middle";
  context.fillText("Ziraat Bankası", 108, 68);
}

function drawInfoBox(context: CanvasRenderingContext2D, account: AccountInfo, period: string) {
  const x = 46;
  const y = 120;
  const width = 1148;
  const height = 170;
  context.strokeStyle = "#111";
  context.lineWidth = 2;
  context.strokeRect(x, y, width, height);

  const leftLabelX = 58;
  const leftValueX = 138;
  const rightLabelX = 690;
  const rightValueX = 860;
  context.fillStyle = "#111";
  context.font = '700 19px Georgia, "Times New Roman", serif';
  context.fillText("Sayın", leftLabelX, y + 34);
  context.fillText("Adres", leftLabelX, y + 96);
  context.fillText("Şube Kodu", rightLabelX, y + 34);
  context.fillText("Müşteri/Hesap No", rightLabelX, y + 64);
  context.fillText("IBAN", rightLabelX, y + 94);
  context.fillText("Döviz Cinsi", rightLabelX, y + 124);
  context.fillText("Dönem", rightLabelX, y + 154);

  context.font = '400 19px Georgia, "Times New Roman", serif';
  context.fillText(`:  ${account.name}`, leftValueX, y + 34);
  const addressLines = wrapText(context, `:  ${account.address}`, 500, 2);
  addressLines.forEach((line, index) => context.fillText(line, leftValueX, y + 96 + index * 24));
  context.fillText(`:  ${account.branch}`, rightValueX, y + 34);
  context.fillText(`:  ${account.accountNo}`, rightValueX, y + 64);
  context.fillText(`:  ${account.iban}`, rightValueX, y + 94);
  context.fillText(`:  ${account.currency}`, rightValueX, y + 124);
  context.fillText(`:  ${period}`, rightValueX, y + 154);
}

function drawDemoMark(context: CanvasRenderingContext2D) {
  context.save();
  context.globalAlpha = 0.08;
  context.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
  context.rotate(-0.55);
  context.textAlign = "center";
  context.fillStyle = "#d40019";
  context.font = '700 120px "Helvetica Neue", Arial, sans-serif';
  context.fillText("DEMO / ÖRNEK BELGE", 0, 0);
  context.restore();

  context.fillStyle = "#d40019";
  context.font = '700 18px "Helvetica Neue", Arial, sans-serif';
  context.textAlign = "right";
  context.fillText("DEMO / ÖRNEK BELGE", 1190, 70);
  context.textAlign = "left";
}

function drawStatementPage(
  rows: MovementRow[],
  account: AccountInfo,
  period: string,
  pageNumber: number,
  pageCount: number,
  totals?: { debit: number; credit: number },
) {
  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("PDF canvas could not be created.");

  context.fillStyle = "#fff";
  context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  drawDemoMark(context);
  drawLogo(context);
  drawInfoBox(context, account, period);

  const tableX = 46;
  const tableY = 320;
  const tableWidth = 1148;
  const headerHeight = 38;
  const rowHeight = 64;
  const colDate = tableX + 8;
  const colReceipt = tableX + 118;
  const colDescription = tableX + 250;
  const colAmountRight = tableX + 1018;
  const colBalanceRight = tableX + 1138;

  context.fillStyle = "#d7d7d7";
  context.fillRect(tableX, tableY, tableWidth, headerHeight);
  context.strokeStyle = "#111";
  context.lineWidth = 2;
  context.strokeRect(tableX, tableY, tableWidth, headerHeight);

  context.fillStyle = "#111";
  context.font = '700 19px Georgia, "Times New Roman", serif';
  context.fillText("Tarih", colDate, tableY + 25);
  context.fillText("Fiş No", colReceipt, tableY + 25);
  context.fillText("Açıklama", colDescription, tableY + 25);
  context.textAlign = "right";
  context.fillText("Tutar", colAmountRight, tableY + 25);
  context.fillText("Bakiye", colBalanceRight, tableY + 25);
  context.textAlign = "left";

  let y = tableY + headerHeight;
  context.font = '400 17px Georgia, "Times New Roman", serif';
  for (const row of rows) {
    const baseline = y + 26;
    context.fillStyle = "#111";
    context.fillText(row.date, colDate, baseline);
    context.fillText(row.receiptNo, colReceipt, baseline);
    context.font = '400 17px Georgia, "Times New Roman", serif';
    const descriptionLines = wrapText(context, `${row.description}${row.time ? ` / ${row.time}` : ""}`, 630, 2);
    descriptionLines.forEach((line, index) => context.fillText(line, colDescription, baseline + index * 21));
    context.textAlign = "right";
    context.fillText(row.amount.replace(/\s*TL$/i, ""), colAmountRight, baseline);
    context.fillText(row.balance, colBalanceRight, baseline);
    context.textAlign = "left";
    y += rowHeight;
  }

  if (totals) {
    context.font = '700 18px Georgia, "Times New Roman", serif';
    context.fillText("Borç:", colReceipt, y + 28);
    context.fillText("Alacak:", colReceipt, y + 58);
    context.textAlign = "right";
    context.fillText(`-${formatPdfMoney(totals.debit)}`, colAmountRight, y + 28);
    context.fillText(formatPdfMoney(totals.credit), colAmountRight, y + 58);
    context.textAlign = "left";
    y += 78;
  }

  context.strokeStyle = "#111";
  context.lineWidth = 2;
  context.strokeRect(tableX, tableY, tableWidth, Math.max(headerHeight + rowHeight, y - tableY));

  context.fillStyle = "#111";
  context.font = '400 12px Arial, sans-serif';
  context.fillText(
    "Bu belge uygulama içi demo verilerinden üretilmiş örnek çıktıdır; resmî banka ekstresi değildir.",
    tableX,
    y + 42,
  );
  context.fillText("Hesap hareketleri uygulamadaki mevcut hareket listesini baz alır.", tableX, y + 61);

  context.fillStyle = "#666";
  context.font = '400 13px Arial, sans-serif';
  context.textAlign = "center";
  context.fillText(`${pageNumber} / ${pageCount}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 34);
  context.textAlign = "left";

  return canvas;
}

async function canvasToJpeg(canvas: HTMLCanvasElement) {
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => (result ? resolve(result) : reject(new Error("PDF page could not be encoded."))),
      "image/jpeg",
      0.94,
    );
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
  const pushText = (value: string) => {
    const bytes = encoder.encode(value);
    chunks.push(bytes);
    byteOffset += bytes.length;
  };
  const pushBytes = (value: Uint8Array) => {
    chunks.push(value);
    byteOffset += value.length;
  };
  const beginObject = (number: number) => {
    offsets[number] = byteOffset;
    pushText(`${number} 0 obj\n`);
  };

  pushText("%PDF-1.4\n% Demo account movements statement\n");
  beginObject(1);
  pushText("<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
  const pageObjectNumbers = images.map((_, index) => 3 + index * 3);
  beginObject(2);
  pushText(`<< /Type /Pages /Count ${images.length} /Kids [${pageObjectNumbers.map((number) => `${number} 0 R`).join(" ")}] >>\nendobj\n`);

  images.forEach((image, index) => {
    const pageObject = 3 + index * 3;
    const imageObject = pageObject + 1;
    const contentObject = pageObject + 2;
    beginObject(pageObject);
    pushText(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PDF_PAGE_WIDTH} ${PDF_PAGE_HEIGHT}] /Resources << /XObject << /Im0 ${imageObject} 0 R >> >> /Contents ${contentObject} 0 R >>\nendobj\n`);
    beginObject(imageObject);
    pushText(`<< /Type /XObject /Subtype /Image /Width ${CANVAS_WIDTH} /Height ${CANVAS_HEIGHT} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${image.length} >>\nstream\n`);
    pushBytes(image);
    pushText("\nendstream\nendobj\n");
    const content = `q\n${PDF_PAGE_WIDTH} 0 0 ${PDF_PAGE_HEIGHT} 0 0 cm\n/Im0 Do\nQ\n`;
    const contentBytes = encoder.encode(content);
    beginObject(contentObject);
    pushText(`<< /Length ${contentBytes.length} >>\nstream\n`);
    pushBytes(contentBytes);
    pushText("endstream\nendobj\n");
  });

  const objectCount = 2 + images.length * 3;
  const xrefOffset = byteOffset;
  pushText(`xref\n0 ${objectCount + 1}\n0000000000 65535 f \n`);
  for (let index = 1; index <= objectCount; index += 1) {
    pushText(`${String(offsets[index] || 0).padStart(10, "0")} 00000 n \n`);
  }
  pushText(`trailer\n<< /Size ${objectCount + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);
  return new Blob([concatBytes(chunks)], { type: "application/pdf" });
}

async function shareOrDownloadPdf(blob: Blob) {
  const now = new Date();
  const stamp = `${String(now.getDate()).padStart(2, "0")}${String(now.getMonth() + 1).padStart(2, "0")}${now.getFullYear()}`;
  const filename = `Hesap_Hareketleri_${stamp}.pdf`;
  const file = new File([blob], filename, { type: "application/pdf" });
  const shareNavigator = navigator as Navigator & { canShare?: (data?: ShareData) => boolean };

  if (navigator.share && shareNavigator.canShare?.({ files: [file] })) {
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
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

let exporting = false;

async function exportAccountMovements(screen: HTMLElement) {
  if (exporting) return;
  exporting = true;
  try {
    const rows = readMovementRows(screen);
    if (!rows.length) throw new Error("No account movements were found.");

    const account = readAccountInfo();
    const now = new Date();
    const from = new Date(now);
    from.setMonth(from.getMonth() - 1);
    const date = (value: Date) => `${String(value.getDate()).padStart(2, "0")}.${String(value.getMonth() + 1).padStart(2, "0")}.${value.getFullYear()}`;
    const period = `${date(from)}-${date(now)}`;
    const debit = rows.reduce((sum, row) => sum + (parseMoney(row.amount) < 0 ? Math.abs(parseMoney(row.amount)) : 0), 0);
    const credit = rows.reduce((sum, row) => sum + (parseMoney(row.amount) > 0 ? parseMoney(row.amount) : 0), 0);

    const rowsPerPage = 9;
    const pageCount = Math.ceil(rows.length / rowsPerPage);
    const canvases = Array.from({ length: pageCount }, (_, index) =>
      drawStatementPage(
        rows.slice(index * rowsPerPage, (index + 1) * rowsPerPage),
        account,
        period,
        index + 1,
        pageCount,
        index === pageCount - 1 ? { debit, credit } : undefined,
      ),
    );

    await shareOrDownloadPdf(await buildPdf(canvases));
  } catch (error) {
    console.error("Account movements PDF export failed", error);
    window.alert("Hesap hareketleri PDF'i oluşturulamadı. Lütfen tekrar deneyin.");
  } finally {
    exporting = false;
  }
}

function installTransactionsPdfExport() {
  document.addEventListener(
    "click",
    (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const mailButton = target.closest<HTMLButtonElement>('button[aria-label="Mesajlar"]');
      if (!mailButton) return;
      const screen = mailButton.closest<HTMLElement>(".min-h-screen");
      if (!screen?.querySelector('button[aria-label="Filtre"]')) return;
      event.preventDefault();
      event.stopPropagation();
      void exportAccountMovements(screen);
    },
    true,
  );
}

installTransactionsPdfExport();
