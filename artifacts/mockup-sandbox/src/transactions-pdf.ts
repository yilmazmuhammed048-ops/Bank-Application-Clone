type MovementRow = {
  date: string;
  time: string;
  description: string;
  amount: string;
  balance: string;
  isCredit: boolean;
};

const PDF_PAGE_WIDTH = 595.28;
const PDF_PAGE_HEIGHT = 841.89;
const CANVAS_WIDTH = 1240;
const CANVAS_HEIGHT = 1754;

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const r = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.lineTo(x + width - r, y);
  context.quadraticCurveTo(x + width, y, x + width, y + r);
  context.lineTo(x + width, y + height - r);
  context.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  context.lineTo(x + r, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - r);
  context.lineTo(x, y + r);
  context.quadraticCurveTo(x, y, x + r, y);
  context.closePath();
}

function wrapText(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
) {
  const words = text.replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (context.measureText(candidate).width <= maxWidth) {
      current = candidate;
      continue;
    }

    if (current) lines.push(current);
    current = word;

    if (lines.length === maxLines) break;
  }

  if (lines.length < maxLines && current) lines.push(current);

  if (lines.length === maxLines) {
    const original = text.replace(/\s+/g, " ").trim();
    const joined = lines.join(" ");
    if (joined.length < original.length) {
      let last = lines[maxLines - 1];
      while (last.length > 1 && context.measureText(`${last}…`).width > maxWidth) {
        last = last.slice(0, -1);
      }
      lines[maxLines - 1] = `${last.trimEnd()}…`;
    }
  }

  return lines;
}

function readMovementRows(screen: HTMLElement): MovementRow[] {
  const filter = screen.querySelector<HTMLButtonElement>('button[aria-label="Filtre"]');
  const controls = filter?.parentElement;
  const list = controls?.nextElementSibling as HTMLElement | null;
  if (!list) return [];

  const cards = Array.from(list.children).filter(
    (element): element is HTMLButtonElement => element instanceof HTMLButtonElement,
  );

  return cards
    .map((card) => {
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
        date: `${day} ${month}`.trim(),
        time,
        description,
        amount,
        balance,
        isCredit: amount.startsWith("+"),
      } satisfies MovementRow;
    })
    .filter((row): row is MovementRow => Boolean(row));
}

function drawPage(rows: MovementRow[], pageNumber: number, pageCount: number) {
  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("PDF canvas could not be created.");

  context.fillStyle = "#f2f3f4";
  context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  context.fillStyle = "#e30620";
  context.fillRect(0, 0, CANVAS_WIDTH, 164);

  context.fillStyle = "#ffffff";
  context.font = '500 48px "Helvetica Neue", Arial, sans-serif';
  context.textBaseline = "middle";
  context.fillText("Hesap Hareketleri", 68, 79);

  const generated = new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date());
  context.font = '300 23px "Helvetica Neue", Arial, sans-serif';
  context.fillText(`Son 1 ay  •  ${generated}`, 70, 128);

  const cardX = 48;
  const cardWidth = CANVAS_WIDTH - cardX * 2;
  const cardHeight = 166;
  const gap = 14;
  let y = 194;

  for (const row of rows) {
    context.fillStyle = "#ffffff";
    roundedRect(context, cardX, y, cardWidth, cardHeight, 18);
    context.fill();

    context.strokeStyle = "#e4e6e7";
    context.lineWidth = 2;
    roundedRect(context, cardX, y, cardWidth, cardHeight, 18);
    context.stroke();

    const dateWidth = 130;
    context.strokeStyle = "#e1e4e5";
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(cardX + dateWidth, y + 24);
    context.lineTo(cardX + dateWidth, y + cardHeight - 24);
    context.stroke();

    context.fillStyle = "#364047";
    context.textAlign = "center";
    context.font = '300 48px "Helvetica Neue", Arial, sans-serif';
    context.fillText(row.date.split(" ")[0] || "", cardX + dateWidth / 2, y + 50);
    context.font = '300 22px "Helvetica Neue", Arial, sans-serif';
    context.fillText(row.date.split(" ").slice(1).join(" "), cardX + dateWidth / 2, y + 91);
    context.font = '300 20px "Helvetica Neue", Arial, sans-serif';
    context.fillText(row.time, cardX + dateWidth / 2, y + 126);

    context.textAlign = "left";
    context.fillStyle = "#4c565b";
    context.font = '300 29px "Helvetica Neue", Arial, sans-serif';
    const descriptionLines = wrapText(context, row.description, 700, 3);
    descriptionLines.forEach((line, index) => {
      context.fillText(line, cardX + dateWidth + 30, y + 42 + index * 34);
    });

    context.textAlign = "right";
    context.fillStyle = row.isCredit ? "#36a957" : "#364047";
    context.font = '500 30px "Helvetica Neue", Arial, sans-serif';
    context.fillText(row.amount, cardX + cardWidth - 28, y + 43);

    context.fillStyle = "#5d666b";
    context.font = '300 22px "Helvetica Neue", Arial, sans-serif';
    const label = "Kalan Bakiye:";
    const valueFont = '500 23px "Helvetica Neue", Arial, sans-serif';
    context.font = '300 22px "Helvetica Neue", Arial, sans-serif';
    const labelWidth = context.measureText(label).width;
    context.font = valueFont;
    const valueWidth = context.measureText(row.balance).width;
    const totalWidth = labelWidth + 14 + valueWidth;
    const startX = cardX + cardWidth - 28 - totalWidth;
    context.textAlign = "left";
    context.font = '300 22px "Helvetica Neue", Arial, sans-serif';
    context.fillText(label, startX, y + cardHeight - 29);
    context.font = valueFont;
    context.fillStyle = "#424c51";
    context.fillText(row.balance, startX + labelWidth + 14, y + cardHeight - 29);

    y += cardHeight + gap;
  }

  context.textAlign = "center";
  context.fillStyle = "#7f888d";
  context.font = '300 20px "Helvetica Neue", Arial, sans-serif';
  context.fillText(`${pageNumber} / ${pageCount}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 34);

  return canvas;
}

async function canvasToJpeg(canvas: HTMLCanvasElement) {
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => (result ? resolve(result) : reject(new Error("PDF page could not be encoded."))),
      "image/jpeg",
      0.93,
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

  pushText("%PDF-1.4\n% Generated in Ziraat mockup\n");

  beginObject(1);
  pushText("<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");

  const pageObjectNumbers = images.map((_, index) => 3 + index * 3);
  beginObject(2);
  pushText(
    `<< /Type /Pages /Count ${images.length} /Kids [${pageObjectNumbers
      .map((number) => `${number} 0 R`)
      .join(" ")}] >>\nendobj\n`,
  );

  images.forEach((image, index) => {
    const pageObject = 3 + index * 3;
    const imageObject = pageObject + 1;
    const contentObject = pageObject + 2;

    beginObject(pageObject);
    pushText(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PDF_PAGE_WIDTH} ${PDF_PAGE_HEIGHT}] /Resources << /XObject << /Im0 ${imageObject} 0 R >> >> /Contents ${contentObject} 0 R >>\nendobj\n`,
    );

    beginObject(imageObject);
    pushText(
      `<< /Type /XObject /Subtype /Image /Width ${CANVAS_WIDTH} /Height ${CANVAS_HEIGHT} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${image.length} >>\nstream\n`,
    );
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
  pushText(`xref\n0 ${objectCount + 1}\n`);
  pushText("0000000000 65535 f \n");
  for (let index = 1; index <= objectCount; index += 1) {
    pushText(`${String(offsets[index] || 0).padStart(10, "0")} 00000 n \n`);
  }
  pushText(`trailer\n<< /Size ${objectCount + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);

  return new Blob([concatBytes(chunks)], { type: "application/pdf" });
}

async function shareOrDownloadPdf(blob: Blob) {
  const stamp = new Date().toISOString().slice(0, 10);
  const filename = `hesap-hareketleri-${stamp}.pdf`;
  const file = new File([blob], filename, { type: "application/pdf" });
  const navigatorWithShare = navigator as Navigator & {
    canShare?: (data?: ShareData) => boolean;
  };

  if (navigator.share && navigatorWithShare.canShare?.({ files: [file] })) {
    try {
      await navigator.share({
        title: "Hesap Hareketleri",
        text: "Hesap hareketleri PDF",
        files: [file],
      });
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

    const rowsPerPage = 8;
    const pageCount = Math.ceil(rows.length / rowsPerPage);
    const canvases = Array.from({ length: pageCount }, (_, index) =>
      drawPage(rows.slice(index * rowsPerPage, (index + 1) * rowsPerPage), index + 1, pageCount),
    );
    const pdf = await buildPdf(canvases);
    await shareOrDownloadPdf(pdf);
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
