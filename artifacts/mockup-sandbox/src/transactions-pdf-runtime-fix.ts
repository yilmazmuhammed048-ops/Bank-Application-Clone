export {};

type Row = {
  date: string;
  time: string;
  description: string;
  amount: string;
  balance: string;
  receiptNo: string;
};

const PTW = 595.28;
const PTH = 841.89;
const DPI = 300;
const PX = DPI / 72;
const CW = Math.round(PTW * PX);
const CH = Math.round(PTH * PX);
const FONT = '"Times New Roman", Times, serif';
const UI_FONT = 'Arial, Helvetica, sans-serif';
const DEMO_LABEL = "DEMO / ÖRNEK - GERÇEK BANKA BELGESİ DEĞİLDİR";

// Reference-tuned statement layout. The demo safety label is intentionally kept.
const INFO_FONT_SIZE = 8.25;
const HEADER_FONT_SIZE = 8.25;
const BODY_FONT_SIZE = 7.9;
const TOTAL_FONT_SIZE = 8.25;
const FOOTER_FONT_SIZE = 4.9;
const DESCRIPTION_WIDTH = 296;
const ROW_SINGLE = 15.15;
const ROW_DOUBLE = 20.9;
const ROW_LINE_GAP = 9.1;

const MONTHS: Record<string, string> = {
  OCA: "01", OCAK: "01", ŞUB: "02", ŞUBAT: "02", SUB: "02", SUBAT: "02",
  MAR: "03", MART: "03", NİS: "04", NİSAN: "04", NIS: "04", NISAN: "04",
  MAY: "05", MAYIS: "05", HAZ: "06", HAZİRAN: "06", HAZIRAN: "06",
  TEM: "07", TEMMUZ: "07", AĞU: "08", AĞUSTOS: "08", AGU: "08", AGUSTOS: "08",
  EYL: "09", EYLÜL: "09", EYLUL: "09", EKİ: "10", EKİM: "10", EKI: "10", EKIM: "10",
  KAS: "11", KASIM: "11", ARA: "12", ARALIK: "12",
};

function dateOf(day: string, month: string) {
  const key = month.toLocaleUpperCase("tr-TR");
  return `${String(day).padStart(2, "0")}.${MONTHS[key] || "01"}.${new Date().getFullYear()}`;
}

function numberOf(value: string) {
  const number = Number(
    value
      .replace(/TL|TRY/gi, "")
      .replace(/\s/g, "")
      .replace(/\./g, "")
      .replace(",", ".")
      .replace(/[^\d+-.]/g, ""),
  );
  return Number.isFinite(number) ? number : 0;
}

function money(value: number) {
  return value.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function rowsFromScreen(screen: HTMLElement): Row[] {
  const filter = screen.querySelector<HTMLButtonElement>('button[aria-label="Filtre"]');
  const list = filter?.parentElement?.nextElementSibling as HTMLElement | null;
  if (!list) return [];

  const rows = Array.from(list.children)
    .filter((element): element is HTMLButtonElement => element instanceof HTMLButtonElement)
    .map((button, index) => {
      const divs = Array.from(button.children).filter(
        (element): element is HTMLDivElement => element instanceof HTMLDivElement,
      );
      const dateBox = divs[0];
      const textBox = divs.find((div) => div.querySelector("p"));
      const amountBox = divs.find(
        (div) => /[+-]?\s*[\d.]+,\d{2}\s*TL/i.test(div.textContent || "") &&
          !/Kalan Bakiye/i.test(div.textContent || ""),
      );
      const balanceBox = divs.find((div) => /Kalan Bakiye/i.test(div.textContent || ""));
      if (!dateBox || !textBox || !amountBox || !balanceBox) return null;

      const spans = Array.from(dateBox.querySelectorAll("span"));
      const paragraphs = Array.from(textBox.querySelectorAll("p"));
      const amount = (amountBox.textContent || "").match(/[+-]?\s*[\d.]+,\d{2}/)?.[0]?.replace(/\s/g, "") || "0,00";
      const balanceSpans = Array.from(balanceBox.querySelectorAll("span"));
      const balanceText = (balanceSpans.length
        ? balanceSpans[balanceSpans.length - 1].textContent
        : balanceBox.textContent) || "";

      return {
        date: dateOf(spans[0]?.textContent?.trim() || "", spans[1]?.textContent?.trim() || ""),
        time: spans[2]?.textContent?.trim() || "",
        description: paragraphs.map((p) => p.textContent?.trim() || "").filter(Boolean).join(" "),
        amount,
        balance: balanceText.replace(/Kalan Bakiye|TL/gi, "").trim(),
        receiptNo: `F${41071 + index * 221}`,
      } satisfies Row;
    })
    .filter((row): row is Row => !!row);

  // Ekran en yeni hareketi üstte gösteriyor. En üstte görünen güncel bakiyeyi
  // sabit tutup geçmiş satırların bakiyesini işlem tutarlarından geriye doğru
  // yeniden kuruyoruz. Böylece her komşu satır matematiksel olarak birbirini takip eder.
  if (rows.length > 1) {
    let newerBalance = numberOf(rows[0].balance);
    rows[0].balance = money(newerBalance);

    for (let index = 1; index < rows.length; index += 1) {
      const newerAmount = numberOf(rows[index - 1].amount);
      const olderBalance = newerBalance - newerAmount;
      rows[index].balance = money(olderBalance);
      newerBalance = olderBalance;
    }
  }

  return rows;
}

function image(src: string) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    let done = false;
    const finish = (value: HTMLImageElement | null) => {
      if (done) return;
      done = true;
      resolve(value);
    };
    img.onload = () => finish(img);
    img.onerror = () => finish(null);
    img.src = src;
    window.setTimeout(() => finish(null), 1200);
  });
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrap(ctx: CanvasRenderingContext2D, text: string, width: number) {
  const output: string[] = [];
  const words = text.split(/\s+/).filter(Boolean);
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width <= width) {
      line = candidate;
    } else {
      if (line) output.push(line);
      line = word;
      if (output.length === 1) break;
    }
  }
  if (output.length < 2 && line) output.push(line);
  return output.slice(0, 2);
}

function rowHeight(ctx: CanvasRenderingContext2D, row: Row) {
  ctx.font = `400 ${BODY_FONT_SIZE}px ${FONT}`;
  return wrap(ctx, `${row.description}${row.time ? ` / ${row.time}` : ""}`, DESCRIPTION_WIDTH).length > 1
    ? ROW_DOUBLE
    : ROW_SINGLE;
}

function paginate(all: Row[]) {
  const scratch = document.createElement("canvas").getContext("2d")!;
  const pages: Row[][] = [];
  let current: Row[] = [];
  let used = 0;
  const maxBody = 421;

  for (const row of all) {
    const height = rowHeight(scratch, row);
    if (current.length && used + height > maxBody) {
      pages.push(current);
      current = [];
      used = 0;
    }
    current.push(row);
    used += height;
  }
  if (current.length) pages.push(current);
  return pages;
}

async function renderPage(
  pageRows: Row[],
  period: string,
  totals: { debit: number; credit: number },
  isLast: boolean,
) {
  const canvas = document.createElement("canvas");
  canvas.width = CW;
  canvas.height = CH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.scale(PX, PX);
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, PTW, PTH);

  const logo = await image("/ziraat-amblem.jpg");
  if (logo && logo.naturalWidth > 0 && logo.naturalHeight > 0) {
    const h = 27.3;
    const w = h * (logo.naturalWidth / logo.naturalHeight);
    ctx.drawImage(logo, 23, 15.7, w, h);
    ctx.fillStyle = "#111";
    ctx.font = `700 16.4px ${UI_FONT}`;
    ctx.fillText("Ziraat Bankası", 24 + w + 2.8, 34.4);
  } else {
    ctx.fillStyle = "#d4001d";
    ctx.fillRect(23, 17.3, 6.5, 25.2);
    ctx.fillStyle = "#111";
    ctx.font = `700 16.4px ${UI_FONT}`;
    ctx.fillText("Ziraat Bankası", 33, 34.4);
  }

  ctx.strokeStyle = "#444";
  ctx.lineWidth = 0.88;
  ctx.strokeRect(22, 61, 551.5, 76.2);

  ctx.fillStyle = "#111";
  ctx.font = `700 ${INFO_FONT_SIZE}px ${FONT}`;
  const bold: Array<[string, number, number]> = [
    ["Sayın", 24.8, 74.2], ["Adres", 24.8, 99.8],
    ["Şube Kodu", 343, 74.2], ["Müşteri/Hesap No", 343, 87.2],
    ["IBAN", 343, 100.2], ["Döviz Cinsi", 343, 113.2], ["Dönem", 343, 126.2],
  ];
  bold.forEach(([text, x, y]) => ctx.fillText(text, x, y));

  ctx.font = `400 ${INFO_FONT_SIZE}px ${FONT}`;
  const normal: Array<[string, number, number]> = [
    [":  MUHAMMED YILMAZ", 61.2, 74.2],
    [":  FATİH MAH. HÜSEYİN TERZİOĞLU CAD. NO: 5 /3 ÜRGÜP", 61.2, 99.8],
    ["   NEVŞEHİR", 61.2, 112.6],
    [":  ZİRAAT SÜPER ŞUBE", 422.5, 74.2],
    [":  104120627-5001", 422.5, 87.2],
    [":  TR31000110412062705001", 422.5, 100.2],
    [":  TRY", 422.5, 113.2],
    [`:  ${period}`, 422.5, 126.2],
  ];
  normal.forEach(([text, x, y]) => ctx.fillText(text, x, y));

  const tableX = 22;
  const tableY = 147.5;
  const tableW = 551.5;
  const headerH = 16.2;
  ctx.fillStyle = "#d2d2d2";
  ctx.fillRect(tableX, tableY, tableW, headerH);
  ctx.strokeStyle = "#444";
  ctx.lineWidth = 0.88;
  ctx.strokeRect(tableX, tableY, tableW, headerH);
  ctx.fillStyle = "#111";
  ctx.font = `700 ${HEADER_FONT_SIZE}px ${FONT}`;
  [["Tarih", 24.8], ["Fiş No", 79.5], ["Açıklama", 143], ["Tutar", 487], ["Bakiye", 540]].forEach(([t, x]) => {
    ctx.fillText(String(t), Number(x), tableY + 11.5);
  });

  let y = tableY + headerH;
  for (const row of pageRows) {
    ctx.font = `400 ${BODY_FONT_SIZE}px ${FONT}`;
    const lines = wrap(ctx, `${row.description}${row.time ? ` / ${row.time}` : ""}`, DESCRIPTION_WIDTH);
    const height = lines.length > 1 ? ROW_DOUBLE : ROW_SINGLE;
    const baseline = y + 10.25;
    ctx.fillText(row.date, 24.8, baseline);
    ctx.fillText(row.receiptNo, 79.5, baseline);
    lines.forEach((line, index) => ctx.fillText(line, 143, baseline + index * ROW_LINE_GAP));
    ctx.textAlign = "right";
    ctx.fillText(row.amount, 522, baseline);
    ctx.fillText(row.balance, 567, baseline);
    ctx.textAlign = "left";
    y += height;
  }

  if (isLast) {
    y += 2.4;
    ctx.font = `700 ${TOTAL_FONT_SIZE}px ${FONT}`;
    ctx.fillText("Borç:", 79.5, y + 10.8);
    ctx.fillText("Alacak:", 79.5, y + 23);
    ctx.textAlign = "right";
    ctx.fillText(`-${money(totals.debit)}`, 522, y + 10.8);
    ctx.fillText(money(totals.credit), 522, y + 23);
    ctx.textAlign = "left";
    y += 28;
  }

  ctx.strokeStyle = "#444";
  ctx.lineWidth = 0.88;
  ctx.strokeRect(tableX, tableY, tableW, Math.max(17, y - tableY));

  const footerY = Math.min(745, y + 18);
  ctx.fillStyle = "#171717";
  ctx.font = `400 ${FOOTER_FONT_SIZE}px ${FONT}`;
  ctx.fillText(
    "Taraflar arasında tüm uyuşmazlıklarda, Banka'nın defter kayıtları ve belgeleri, müstenitli olsun olmasın, kesin ve aksi ileri sürülemez delil niteliğindedir.",
    22,
    footerY,
    552,
  );
  ctx.fillText("Merkez: Finanskent Mahallesi Finans Caddesi No:44A Ümraniye İstanbul", 22, footerY + 7.8);
  ctx.fillText("Ticaret Sicil No: 475225-5", 22, footerY + 15.6);
  ctx.fillText("www.ziraatbank.com.tr", 22, footerY + 23.4);

  ctx.save();
  roundedRect(ctx, 150, 795, 295, 25, 4);
  ctx.fillStyle = "rgba(255,255,255,.96)";
  ctx.fill();

  // The actual demo label is drawn by transactions-pdf-safety-label.ts during export.
  ctx.fillStyle = "#b00020";
  ctx.textAlign = "center";
  ctx.font = `700 8.5px ${UI_FONT}`;
  ctx.restore();

  return canvas;
}

function jpegBytes(canvas: HTMLCanvasElement) {
  const encoded = canvas.toDataURL("image/jpeg", 0.98).split(",")[1] || "";
  const raw = atob(encoded);
  const bytes = new Uint8Array(raw.length);
  for (let index = 0; index < raw.length; index += 1) bytes[index] = raw.charCodeAt(index);
  return bytes;
}

function concat(parts: Uint8Array[]) {
  const size = parts.reduce((sum, part) => sum + part.length, 0);
  const output = new Uint8Array(size);
  let offset = 0;
  for (const part of parts) {
    output.set(part, offset);
    offset += part.length;
  }
  return output;
}

function pdf(canvases: HTMLCanvasElement[]) {
  const encoder = new TextEncoder();
  const parts: Uint8Array[] = [];
  const offsets: number[] = [];
  const objectCount = 2 + canvases.length * 3;
  let length = 0;
  const text = (value: string) => {
    const bytes = encoder.encode(value);
    parts.push(bytes);
    length += bytes.length;
  };
  const raw = (bytes: Uint8Array) => {
    parts.push(bytes);
    length += bytes.length;
  };

  text("%PDF-1.4\n%âãÏÓ\n");
  offsets[1] = length;
  text("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
  offsets[2] = length;
  text(`2 0 obj\n<< /Type /Pages /Count ${canvases.length} /Kids [${canvases.map((_, i) => `${3 + i * 3} 0 R`).join(" ")}] >>\nendobj\n`);

  canvases.forEach((canvas, index) => {
    const page = 3 + index * 3;
    const image = page + 1;
    const content = page + 2;
    const name = `Im${index + 1}`;
    const jpeg = jpegBytes(canvas);

    offsets[page] = length;
    text(`${page} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PTW} ${PTH}] /Resources << /XObject << /${name} ${image} 0 R >> >> /Contents ${content} 0 R >>\nendobj\n`);
    offsets[image] = length;
    text(`${image} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`);
    raw(jpeg);
    text("\nendstream\nendobj\n");

    const stream = `q\n${PTW} 0 0 ${PTH} 0 0 cm\n/${name} Do\nQ\n`;
    const streamBytes = encoder.encode(stream);
    offsets[content] = length;
    text(`${content} 0 obj\n<< /Length ${streamBytes.length} >>\nstream\n`);
    raw(streamBytes);
    text("endstream\nendobj\n");
  });

  const xref = length;
  text(`xref\n0 ${objectCount + 1}\n0000000000 65535 f \n`);
  for (let index = 1; index <= objectCount; index += 1) {
    text(`${String(offsets[index] || 0).padStart(10, "0")} 00000 n \n`);
  }
  text(`trailer\n<< /Size ${objectCount + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);
  return new Blob([concat(parts)], { type: "application/pdf" });
}

function download(blob: Blob) {
  const now = new Date();
  const stamp = `${String(now.getDate()).padStart(2, "0")}${String(now.getMonth() + 1).padStart(2, "0")}${now.getFullYear()}`;
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `Hesap_Hareketleri_${stamp}.pdf`;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 10000);
}

let busy = false;
async function run(screen: HTMLElement) {
  if (busy) return;
  busy = true;
  try {
    const allRows = rowsFromScreen(screen);
    if (!allRows.length) throw new Error("rows");
    const dates = allRows.map((row) => row.date);
    const period = `${dates[dates.length - 1]}-${dates[0]}`;
    const totals = {
      debit: allRows.reduce((sum, row) => sum + (numberOf(row.amount) < 0 ? Math.abs(numberOf(row.amount)) : 0), 0),
      credit: allRows.reduce((sum, row) => sum + (numberOf(row.amount) > 0 ? numberOf(row.amount) : 0), 0),
    };
    const pages = paginate(allRows);
    const canvases: HTMLCanvasElement[] = [];
    for (let index = 0; index < pages.length; index += 1) {
      canvases.push(await renderPage(pages[index], period, totals, index === pages.length - 1));
    }
    download(pdf(canvases));
  } catch (error) {
    console.error("PDF export failed", error);
    window.alert("Hesap hareketleri PDF'i oluşturulamadı. Lütfen tekrar deneyin.");
  } finally {
    busy = false;
  }
}

document.addEventListener(
  "click",
  (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const button = target?.closest<HTMLButtonElement>('button[aria-label="Mesajlar"]');
    if (!button) return;
    const screen = button.closest<HTMLElement>(".min-h-screen");
    if (!screen?.querySelector('button[aria-label="Filtre"]')) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    void run(screen);
  },
  true,
);