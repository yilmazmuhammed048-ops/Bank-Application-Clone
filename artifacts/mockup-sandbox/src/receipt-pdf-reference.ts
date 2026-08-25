export {};

type StoredTx = {
  id?: string | number;
  title?: string;
  amount?: string | number;
  date?: string;
  time?: string;
  recipientName?: string;
  recipientIban?: string;
  recipientBank?: string;
  transactionNumber?: string;
  type?: "income" | "expense";
};

type ReceiptTx = {
  id: string;
  amount: number;
  date: string;
  time: string;
  recipientName: string;
  recipientIban: string;
  recipientBank: string;
  transactionNumber: string;
  incoming: boolean;
};

type Fees = { commission: number; bsmv: number; message: number; total: number };

const PW = 612;
const PH = 792;
const DPI = 300;
const PX = DPI / 72;
const CW = Math.round(PW * PX);
const CH = Math.round(PH * PX);
const FONT = 'Arial, "Helvetica Neue", Helvetica, sans-serif';
const MY_NAME = "MUHAMMED YILMAZ";
const MY_IBAN = "TR31 0001 1041 2062 7050 01";
const MY_ACCOUNT = "4000/104120627-5001";
const ADDRESS_1 = "FATİH MAH. HÜSEYİN TERZİOĞLU CAD. NO: 5 / 3";
const ADDRESS_2 = "ÜRGÜP";
const ADDRESS_3 = "NEVŞEHİR";


const ONES = ["", "BİR", "İKİ", "ÜÇ", "DÖRT", "BEŞ", "ALTI", "YEDİ", "SEKİZ", "DOKUZ"];
const TENS = ["", "ON", "YİRMİ", "OTUZ", "KIRK", "ELLİ", "ALTMIŞ", "YETMİŞ", "SEKSEN", "DOKSAN"];
const SCALES = ["", "BİN", "MİLYON", "MİLYAR", "TRİLYON"];
const MONTHS: Record<string, string> = {
  OCAK: "01", ŞUBAT: "02", SUBAT: "02", MART: "03", NİSAN: "04", NISAN: "04",
  MAYIS: "05", HAZİRAN: "06", HAZIRAN: "06", TEMMUZ: "07", AĞUSTOS: "08", AGUSTOS: "08",
  EYLÜL: "09", EYLUL: "09", EKİM: "10", EKIM: "10", KASIM: "11", ARALIK: "12",
};

function parseAmount(value: string | number | undefined) {
  if (typeof value === "number") return Math.abs(value);
  const parsed = Number(
    String(value ?? "0")
      .replace(/TL|TRY/gi, "")
      .replace(/\s/g, "")
      .replace(/\./g, "")
      .replace(",", ".")
      .replace(/[^\d+.-]/g, ""),
  );
  return Number.isFinite(parsed) ? Math.abs(parsed) : 0;
}

function money(value: number) {
  return value.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function numericDate(value: string) {
  const source = String(value || "").trim();
  const numeric = source.match(/(\d{1,2})[./-](\d{1,2})[./-](\d{4})/);
  if (numeric) return `${numeric[1].padStart(2, "0")}/${numeric[2].padStart(2, "0")}/${numeric[3]}`;
  const long = source.match(/(\d{1,2})\s+([^\s]+)\s+(\d{4})/);
  if (!long) return source;
  const month = MONTHS[long[2].toLocaleUpperCase("tr-TR")] || "01";
  return `${long[1].padStart(2, "0")}/${month}/${long[3]}`;
}

function chunkWords(value: number) {
  const hundreds = Math.floor(value / 100);
  const remainder = value % 100;
  const tens = Math.floor(remainder / 10);
  const ones = remainder % 10;
  let text = "";
  if (hundreds > 0) {
    if (hundreds > 1) text += ONES[hundreds];
    text += "YÜZ";
  }
  text += TENS[tens];
  text += ONES[ones];
  return text;
}

function integerWords(value: number) {
  const safe = Math.max(0, Math.floor(value));
  if (safe === 0) return "SIFIR";
  let remaining = safe;
  let index = 0;
  const groups: string[] = [];
  while (remaining > 0 && index < SCALES.length) {
    const chunk = remaining % 1000;
    if (chunk > 0) {
      groups.unshift(index === 1 && chunk === 1 ? "BİN" : `${chunkWords(chunk)}${SCALES[index]}`);
    }
    remaining = Math.floor(remaining / 1000);
    index += 1;
  }
  return groups.join("");
}

function amountWords(value: number) {
  const totalKurus = Math.round(value * 100);
  const lira = Math.floor(totalKurus / 100);
  const kurus = totalKurus % 100;
  return `${integerWords(lira)}TL${integerWords(kurus)}KR`;
}

function hash(value: string) {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

function reference(seed: string) {
  return {
    seconds: String(hash(`${seed}|seconds`) % 60).padStart(2, "0"),
    code: `F${10000 + (hash(`${seed}|code-a`) % 90000)}_${1000 + (hash(`${seed}|code-b`) % 9000)}`,
  };
}

function clock(value: string) {
  const match = String(value || "").match(/(\d{1,2}):(\d{2})/);
  return { hour: (match?.[1] || "00").padStart(2, "0"), minute: match?.[2] || "00" };
}

function readTransactions(): StoredTx[] {
  try {
    const parsed = JSON.parse(localStorage.getItem("demo_transactions") || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function current(screen: HTMLElement): ReceiptTx | null {
  const text = screen.innerText || screen.textContent || "";
  const number = text.match(/Fast\s+Sorgu\s+No\s*:\s*([^\s]+)/i)?.[1]?.trim();
  const all = readTransactions();
  let tx = number
    ? all.find((item) => String(item.transactionNumber ?? item.id ?? "") === number)
    : undefined;

  if (!tx) {
    tx = all.find((item) => {
      const name = String(item.recipientName || "").trim();
      return !!name && text.includes(name) && text.includes(money(parseAmount(item.amount)));
    });
  }
  if (!tx) return null;

  const incoming = tx.type === "income" || String(tx.amount ?? "").trim().startsWith("+");
  return {
    id: String(tx.id ?? ""),
    amount: parseAmount(tx.amount),
    date: String(tx.date || ""),
    time: String(tx.time || "00:00"),
    recipientName: String(tx.recipientName || "BELİRTİLMEMİŞ"),
    recipientIban: String(tx.recipientIban || ""),
    recipientBank: String(tx.recipientBank || "Banka Bilgisi"),
    transactionNumber: String(tx.transactionNumber || tx.id || ""),
    incoming,
  };
}

function feeValue(text: string, label: string) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = text.match(new RegExp(`${escaped}\\s*:\\s*([\\d.]+,\\d{2})\\s*TRY`, "i"));
  return match ? parseAmount(match[1]) : 0;
}

function fees(screen: HTMLElement): Fees {
  const text = screen.innerText || screen.textContent || "";
  const commission = feeValue(text, "Komisyon");
  const bsmv = feeValue(text, "BSMV");
  const message = feeValue(text, "Mesaj Ücreti");
  const explicitTotal = feeValue(text, "Toplam Masraf");
  return { commission, bsmv, message, total: explicitTotal || commission + bsmv + message };
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

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function fitText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, minSize: number, startSize: number, weight = 400) {
  let size = startSize;
  while (size > minSize) {
    ctx.font = `${weight} ${size}px ${FONT}`;
    if (ctx.measureText(text).width <= maxWidth) break;
    size -= 0.2;
  }
  return size;
}

async function canvasFor(transaction: ReceiptTx, fee: Fees) {
  const canvas = document.createElement("canvas");
  canvas.width = CW;
  canvas.height = CH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.scale(PX, PX);
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, PW, PH);
  ctx.textBaseline = "alphabetic";

  const logo = await image("/ziraat-amblem.jpg");
  if (logo && logo.naturalWidth > 0 && logo.naturalHeight > 0) {
    const h = 24;
    const w = h * (logo.naturalWidth / logo.naturalHeight);
    ctx.drawImage(logo, 21.6, 7.2, w, h);
    ctx.fillStyle = "#111";
    ctx.font = `700 17.5px ${FONT}`;
    ctx.fillText("Ziraat Bankası", 22 + w + 4, 29.5);
  } else {
    ctx.fillStyle = "#d71920";
    ctx.fillRect(21.6, 8, 10, 23);
    ctx.fillStyle = "#111";
    ctx.font = `700 17.5px ${FONT}`;
    ctx.fillText("Ziraat Bankası", 36, 29.5);
  }

  ctx.fillStyle = "#111";
  ctx.textAlign = "center";
  ctx.font = `700 13.7px ${FONT}`;
  ctx.fillText(transaction.incoming ? "HESABA GELEN FAST" : "HESAPTAN FAST", PW / 2, 45.8);

  ctx.strokeStyle = "#b9b9b9";
  ctx.lineWidth = 0.8;
  roundRect(ctx, 21.6, 52.1, 546.0, 272.5, 5.4);
  ctx.stroke();
  roundRect(ctx, 30.8, 61.2, 280.6, 112.3, 4.8);
  ctx.stroke();
  roundRect(ctx, 321.7, 61.2, 236.9, 112.3, 4.8);
  ctx.stroke();

  const slashDate = numericDate(transaction.date);
  const dotDate = slashDate.replace(/\//g, ".");
  const txClock = clock(transaction.time);
  const ref = reference(`${slashDate}|${txClock.hour}:${txClock.minute}|${transaction.transactionNumber}`);
  const dateTime = `${slashDate}-${txClock.hour}:${txClock.minute}:${ref.seconds} - ${ref.code}`;

  const labels = [
    ["ŞUBE KODU/ADI", "4000/ZİRAAT SÜPER ŞUBE"],
    ["IBAN", MY_IBAN],
    ["HESAP NUMARASI", MY_ACCOUNT],
    ["VERGİ DAİRESİ", ""],
    ["VERGİ KİMLİK NO", "10067921118"],
    ["İŞLEM TARİHİ", dateTime],
    ["VALÖR", dotDate],
    ["İŞLEM YERİ", "ZİRAAT MOBİL"],
  ] as const;

  ctx.textAlign = "left";
  for (let index = 0; index < labels.length; index += 1) {
    const y = 77.2 + index * 12.8;
    ctx.fillStyle = "#111";
    ctx.font = `700 8.0px ${FONT}`;
    ctx.fillText(labels[index][0], 39.2, y);
    ctx.font = `400 8.0px ${FONT}`;
    ctx.fillText(":", 133.7, y);
    const value = labels[index][1];
    const size = fitText(ctx, value, 159, 6.7, 8.0, 400);
    ctx.font = `400 ${size}px ${FONT}`;
    ctx.fillText(value, 144, y, 163);
  }

  ctx.font = `700 8.0px ${FONT}`;
  ctx.fillText("SAYIN", 330.1, 77.2);
  ctx.fillText(MY_NAME, 330.1, 90.0);
  ctx.fillText(ADDRESS_1, 330.1, 115.6, 218);
  ctx.fillText(ADDRESS_2, 330.1, 128.4);
  ctx.fillText(ADDRESS_3, 330.1, 141.2);

  const sender = transaction.incoming
    ? transaction.recipientName.toLocaleUpperCase("tr-TR")
    : MY_NAME;
  const receiver = (transaction.incoming ? MY_NAME : transaction.recipientName).toLocaleLowerCase("tr-TR");
  const iban = transaction.incoming ? MY_IBAN : transaction.recipientIban;
  const amountText = `${money(transaction.amount)} TRY`;
  const commissionText = `${money(fee.commission)} TRY`;
  const bsmvText = `${money(fee.bsmv)} TRY`;
  const messageText = `${money(fee.message)} TRY`;
  const totalText = `${money(fee.total)} TRY`;

  const detailLines = [
    `Fast Mesaj Kodu : A01 Fast Sorgu No : ${transaction.transactionNumber}`,
    `Gönderen : ${sender}`,
    `Alan Banka : ${transaction.recipientBank}`,
    `Alıcı Hesap : ${iban} Alıcı : ${receiver}`,
    `İşlem Tutarı : ${amountText}`,
    `Komisyon : ${commissionText} BSMV : ${bsmvText} Mesaj Ücreti : ${messageText}`,
    `Toplam Masraf : ${totalText}`,
    `${amountText} tutarında Fast işleminin yapılmasını, Bu işlem için`,
    `tarafıma bildirilen ${totalText} masraf alınmasını talep ederim.`,
  ];

  for (let index = 0; index < detailLines.length; index += 1) {
    const y = 190.8 + index * 10.4;
    ctx.fillStyle = "#111";
    const size = fitText(ctx, detailLines[index], 505, 7.4, 8.0, 400);
    ctx.font = `400 ${size}px ${FONT}`;
    ctx.fillText(detailLines[index], 44.8, y, 510);
  }

  const totalMovement = transaction.incoming ? transaction.amount : transaction.amount + fee.total;
  ctx.fillStyle = "#111";
  ctx.font = `400 8.0px ${FONT}`;
  const movement = transaction.incoming
    ? `Hesabınıza ${money(totalMovement)} TL yatırılmıştır.`
    : `Hesabınızdan ${money(totalMovement)} TL (Yalnız ${amountWords(totalMovement)}) Çekilmiştir.`;
  const movementSize = fitText(ctx, movement, 360, 6.8, 8.0, 400);
  ctx.font = `400 ${movementSize}px ${FONT}`;
  ctx.fillText(movement, 38.4, 309.7, 360);
  ctx.font = `400 8.0px ${FONT}`;
  ctx.fillText(`${slashDate}-${txClock.hour}:${txClock.minute}:${ref.seconds} EFTTGIDD INTERNET INTERNET`, 38.4, 321.7, 365);

  ctx.textAlign = "center";
  ctx.fillStyle = "#111";
  ctx.font = `400 8.0px ${FONT}`;
  ctx.fillText("Saygılarımızla", 479, 300.1);
  ctx.font = `700 8.0px ${FONT}`;
  ctx.fillText("T.C. ZİRAAT BANKASI A.Ş.", 479, 310.1);
  ctx.fillText("İNTERNET ŞUBESİ", 479, 321.7);

  ctx.textAlign = "left";
  ctx.fillStyle = "#111";
  ctx.font = `400 6.5px ${FONT}`;
  ctx.fillText(
    "Taraflar arasında tüm uyuşmazlıklarda, Banka'nın defter kayıtları ve belgeleri,müstenitli olsun olmasın, kesin ve aksi ileri sürülemez delil niteliğindedir.",
    21.6,
    338.5,
    550,
  );
  ctx.fillText(
    "Merkez: Finanskent Mahallesi Finans Caddesi No:44A Ümraniye/İstanbul Ticaret Sicil No:475225-5 www.ziraatbank.com.tr",
    21.6,
    350.5,
    550,
  );

  ctx.save();
  roundRect(ctx, 153, 744, 306, 24, 4);
  ctx.fillStyle = "rgba(255,255,255,.97)";
  ctx.fill();
  ctx.strokeStyle = "#b00020";
  ctx.lineWidth = 0.9;
  ctx.stroke();
  ctx.fillStyle = "#b00020";
  ctx.textAlign = "center";
  ctx.font = `700 8.7px ${FONT}`;

  ctx.restore();

  return canvas;
}

function pdf(canvas: HTMLCanvasElement) {
  const data = canvas.toDataURL("image/jpeg", 0.98).split(",")[1] || "";
  const binary = atob(data);
  const jpeg = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) jpeg[index] = binary.charCodeAt(index);
  const encoder = new TextEncoder();
  const parts: Uint8Array[] = [];
  const offsets: number[] = [];
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
  offsets[1] = length; text("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
  offsets[2] = length; text("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n");
  offsets[3] = length; text(`3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PW} ${PH}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`);
  offsets[4] = length; text(`4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`); raw(jpeg); text("\nendstream\nendobj\n");
  const stream = `q\n${PW} 0 0 ${PH} 0 0 cm\n/Im0 Do\nQ\n`;
  const streamBytes = encoder.encode(stream);
  offsets[5] = length; text(`5 0 obj\n<< /Length ${streamBytes.length} >>\nstream\n`); raw(streamBytes); text("endstream\nendobj\n");
  const xref = length;
  text("xref\n0 6\n0000000000 65535 f \n");
  for (let index = 1; index <= 5; index += 1) text(`${String(offsets[index]).padStart(10, "0")} 00000 n \n`);
  text(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const output = new Uint8Array(total);
  let cursor = 0;
  for (const part of parts) { output.set(part, cursor); cursor += part.length; }
  return new Blob([output], { type: "application/pdf" });
}

async function openPdf(transaction: ReceiptTx, fee: Fees, target: Window | null) {
  const blob = pdf(await canvasFor(transaction, fee));
  const url = URL.createObjectURL(blob);
  if (target) target.location.href = url;
  else {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.target = "_blank";
    anchor.rel = "noopener";
    anchor.click();
  }
  window.setTimeout(() => URL.revokeObjectURL(url), 120000);
}

document.addEventListener(
  "click",
  (event) => {
    const targetElement = event.target instanceof Element ? event.target : null;
    const button = targetElement?.closest<HTMLButtonElement>('button[aria-label="Dekontu paylaş"]');
    if (!button) return;
    const screen = button.closest<HTMLElement>(".fixed.inset-0");
    if (!screen) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    const transaction = current(screen);
    if (!transaction) {
      window.alert("Dekont bilgileri okunamadı. Lütfen tekrar deneyin.");
      return;
    }
    const target = window.open("about:blank", "_blank");
    void openPdf(transaction, fees(screen), target).catch(() => {
      if (target && !target.closed) target.close();
      window.alert("Dekont PDF'i oluşturulamadı. Lütfen tekrar deneyin.");
    });
  },
  true,
);
