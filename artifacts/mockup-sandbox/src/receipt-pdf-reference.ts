export {};

type Tx = {
  id: string | number;
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
  title: string;
  amount: number;
  date: string;
  time: string;
  recipientName: string;
  recipientIban: string;
  recipientBank: string;
  transactionNumber: string;
  incoming: boolean;
};

const W = 1240;
const H = 1754;
const PW = 595.28;
const PH = 841.89;
const FONT = "Arial, Helvetica, sans-serif";

const MY_NAME = "MUHAMMED YILMAZ";
const MY_IBAN = "TR31 0001 1041 2062 7050 01";
const MY_ACCOUNT = "4000/104120627-5001";
const ADDRESS1 = "FATİH MAH. HÜSEYİN TERZİOĞLU CAD. NO: 5 / 3";
const ADDRESS2 = "ÜRGÜP";
const ADDRESS3 = "NEVŞEHİR";

const RECEIPT_COMMISSION = 0;
const RECEIPT_BSMV = 0.18;
const RECEIPT_MESSAGE_FEE = 0.37;
const RECEIPT_TOTAL_FEE =
  RECEIPT_COMMISSION + RECEIPT_BSMV + RECEIPT_MESSAGE_FEE;

const C_TEXT = "#1f2326";
const C_TEXT_SOFT = "#2d3235";
const C_TEXT_LIGHT = "#41464a";
const C_BORDER = "#bfc3c6";
const C_ACCENT = "#a00018";

// Capture the renderer that exists when this module loads. Receipt layout
// patches imported later cannot hide or duplicate these core PDF lines.
const CORE_FILL_TEXT = CanvasRenderingContext2D.prototype.fillText;

const ONES = ["", "BİR", "İKİ", "ÜÇ", "DÖRT", "BEŞ", "ALTI", "YEDİ", "SEKİZ", "DOKUZ"];
const TENS = ["", "ON", "YİRMİ", "OTUZ", "KIRK", "ELLİ", "ALTMIŞ", "YETMİŞ", "SEKSEN", "DOKSAN"];
const SCALES = ["", "BİN", "MİLYON", "MİLYAR", "TRİLYON"];

function amount(value: string | number | undefined) {
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

function date(value: string) {
  const source = String(value || "").trim();
  const long = source.match(/(\d{1,2})\s+([^\s]+)\s+(\d{4})/);
  const months: Record<string, string> = {
    OCAK: "01",
    ŞUBAT: "02",
    SUBAT: "02",
    MART: "03",
    NİSAN: "04",
    NISAN: "04",
    MAYIS: "05",
    HAZİRAN: "06",
    HAZIRAN: "06",
    TEMMUZ: "07",
    AĞUSTOS: "08",
    AGUSTOS: "08",
    EYLÜL: "09",
    EYLUL: "09",
    EKİM: "10",
    EKIM: "10",
    KASIM: "11",
    ARALIK: "12",
  };

  if (long) {
    const month = months[long[2].toLocaleUpperCase("tr-TR")] || "01";
    return `${long[1].padStart(2, "0")}.${month}.${long[3]}`;
  }

  const numeric = source.match(/(\d{1,2})[./-](\d{1,2})[./-](\d{4})/);
  return numeric
    ? `${numeric[1].padStart(2, "0")}.${numeric[2].padStart(2, "0")}.${numeric[3]}`
    : source;
}

function hashString(value: string) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function stableReference(seed: string) {
  const secondsHash = hashString(`${seed}|seconds`);
  const leftHash = hashString(`${seed}|reference-a`);
  const rightHash = hashString(`${seed}|reference-b`);

  return {
    seconds: String(secondsHash % 60).padStart(2, "0"),
    code: `F${10000 + (leftHash % 90000)}_${1000 + (rightHash % 9000)}`,
  };
}

function chunkToTurkish(value: number) {
  const hundreds = Math.floor(value / 100);
  const remainder = value % 100;
  const tens = Math.floor(remainder / 10);
  const ones = remainder % 10;
  let result = "";

  if (hundreds > 0) {
    if (hundreds > 1) result += ONES[hundreds];
    result += "YÜZ";
  }

  result += TENS[tens];
  result += ONES[ones];
  return result;
}

function integerToTurkish(value: number) {
  const safeValue = Math.max(0, Math.floor(value));
  if (safeValue === 0) return "SIFIR";

  let remaining = safeValue;
  let scaleIndex = 0;
  const groups: string[] = [];

  while (remaining > 0 && scaleIndex < SCALES.length) {
    const chunk = remaining % 1000;
    if (chunk > 0) {
      const scale = SCALES[scaleIndex];
      groups.unshift(
        scaleIndex === 1 && chunk === 1
          ? "BİN"
          : `${chunkToTurkish(chunk)}${scale}`,
      );
    }
    remaining = Math.floor(remaining / 1000);
    scaleIndex += 1;
  }

  return groups.join("");
}

function amountWords(value: number) {
  const totalKurus = Math.round(value * 100);
  const lira = Math.floor(totalKurus / 100);
  const kurus = totalKurus % 100;
  return `${integerToTurkish(lira)}TL${integerToTurkish(kurus)}KR`;
}

function transactionClock(value: string) {
  const match = String(value || "").match(/(\d{1,2}):(\d{2})/);
  return {
    hour: (match?.[1] || "00").padStart(2, "0"),
    minute: match?.[2] || "00",
  };
}

function current(screen: HTMLElement): ReceiptTx | null {
  let transactions: Tx[] = [];
  try {
    const parsed = JSON.parse(localStorage.getItem("demo_transactions") || "[]");
    transactions = Array.isArray(parsed) ? parsed : [];
  } catch {}

  const screenText = screen.textContent || "";
  const transactionNo =
    screenText.match(/Fast\s+Sorgu\s+No\s*:\s*([^\s]+)/i)?.[1]?.trim();

  let transaction = transactionNo
    ? transactions.find(
        (item) =>
          String(item.transactionNumber || item.id) === transactionNo,
      )
    : undefined;

  if (!transaction) {
    transaction = transactions.find((item) => {
      const name = String(item.recipientName || "").trim();
      return (
        !!name &&
        screenText.includes(name) &&
        screenText.includes(money(amount(item.amount)))
      );
    });
  }

  if (!transaction) return null;

  const incoming =
    transaction.type === "income" ||
    String(transaction.amount ?? "").trim().startsWith("+");

  return {
    id: String(transaction.id ?? ""),
    title: String(
      transaction.title || (incoming ? "FAST Gelen" : "FAST Giden"),
    ),
    amount: amount(transaction.amount),
    date: String(transaction.date || ""),
    time: String(transaction.time || "00:00"),
    recipientName: String(transaction.recipientName || "BELİRTİLMEMİŞ"),
    recipientIban: String(transaction.recipientIban || ""),
    recipientBank: String(transaction.recipientBank || "Banka Bilgisi"),
    transactionNumber: String(
      transaction.transactionNumber || transaction.id || "",
    ),
    incoming,
  };
}

function rr(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(x + width, y, x + width, y + height, radius);
  context.arcTo(x + width, y + height, x, y + height, radius);
  context.arcTo(x, y + height, x, y, radius);
  context.arcTo(x, y, x + width, y, radius);
  context.closePath();
}

function labelValue(
  context: CanvasRenderingContext2D,
  label: string,
  value: string,
  x: number,
  y: number,
  labelWidth = 180,
) {
  context.fillStyle = C_TEXT;
  context.font = `700 15.5px ${FONT}`;
  context.fillText(label, x, y);

  context.fillStyle = C_TEXT_SOFT;
  context.font = `500 15px ${FONT}`;
  context.fillText(":", x + labelWidth, y);

  context.fillStyle = C_TEXT;
  context.font = `500 14.8px ${FONT}`;
  context.fillText(value, x + labelWidth + 17, y, 325);
}

function img(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("img"));
    image.src = src;
  });
}

async function canvasFor(transaction: ReceiptTx) {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("canvas");

  context.fillStyle = "#fff";
  context.fillRect(0, 0, W, H);

  // Keep these source coordinates so the approved logo patch can replace
  // the symbol with the reference-aligned symbol + bank name treatment.
  try {
    const base = await img("/ziraat-amblem.jpg");
    context.drawImage(base, 48, 42, 290, 76);
    await new Promise((resolve) => setTimeout(resolve, 80));
    context.fillStyle = "#fff";
    context.fillRect(44, 36, 390, 94);
    context.drawImage(base, 48, 42, 290, 76);
  } catch {}

  // Permanent demo marker. This is drawn by the core renderer so it remains
  // present in every generated receipt PDF.
  context.save();
  context.fillStyle = "#b00020";
  context.fillRect(1046, 42, 142, 48);
  context.fillStyle = "#ffffff";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.font = `700 25px ${FONT}`;
  
  context.restore();

  context.fillStyle = C_TEXT;
  context.textAlign = "center";
  context.font = `700 24px ${FONT}`;
 
    transaction.incoming ? "HESABA GELEN FAST" : "HESAPTAN FAST",
    W / 2,
    99,
  );

  context.fillStyle = C_ACCENT;
  context.textAlign = "right";
  context.font = `700 14px ${FONT}`;

  context.textAlign = "left";
  context.strokeStyle = C_BORDER;
  context.lineWidth = 1.7;

  rr(context, 62, 122, 1062, 620, 10);
  context.stroke();

  rr(context, 78, 145, 546, 245, 9);
  context.stroke();

  rr(context, 646, 145, 462, 245, 9);
  context.stroke();

  const formattedDate = date(transaction.date);
  const slashDate = formattedDate.replace(/\./g, "/");
  const clock = transactionClock(transaction.time);
  const reference = stableReference(
    `${slashDate}|${clock.hour}:${clock.minute}|${transaction.transactionNumber}`,
  );
  const timestamp = `${clock.hour}:${clock.minute}:${reference.seconds}`;

  const ys = [170, 195, 220, 245, 270, 295, 320, 345];
  const labelX = 95;

  labelValue(context, "ŞUBE KODU/ADI", "4000/ZİRAAT SÜPER ŞUBE", labelX, ys[0]);
  labelValue(context, "IBAN", MY_IBAN, labelX, ys[1]);
  labelValue(context, "HESAP NUMARASI", MY_ACCOUNT, labelX, ys[2]);
  labelValue(context, "VERGİ DAİRESİ", "", labelX, ys[3]);
  labelValue(context, "VERGİ KİMLİK NO", "10067921118", labelX, ys[4]);
  labelValue(
    context,
    "İŞLEM TARİHİ",
    `${slashDate}-${timestamp}-${reference.code}`,
    labelX,
    ys[5],
  );
  labelValue(context, "VALÖR", slashDate, labelX, ys[6]);
  labelValue(context, "İŞLEM YERİ", "ZİRAAT MOBİL", labelX, ys[7]);

  context.fillStyle = C_TEXT;
  context.font = `700 15.5px ${FONT}`;
  context.fillText("SAYIN", 665, 170);
  context.font = `700 16px ${FONT}`;
  context.fillText(MY_NAME, 665, 195);

  context.font = `700 15.5px ${FONT}`;
  context.fillText(ADDRESS1, 665, 252, 418);
  context.fillText(ADDRESS2, 665, 278);
  context.fillText(ADDRESS3, 665, 304);

  const sender = transaction.incoming
    ? transaction.recipientName.toLocaleUpperCase("tr-TR")
    : MY_NAME;
  const receiver = (
    transaction.incoming ? MY_NAME : transaction.recipientName
  ).toLocaleLowerCase("tr-TR");
  const iban = transaction.incoming ? MY_IBAN : transaction.recipientIban;

  const commissionText = `${money(RECEIPT_COMMISSION)} TRY`;
  const bsmvText = `${money(RECEIPT_BSMV)} TRY`;
  const messageFeeText = `${money(RECEIPT_MESSAGE_FEE)} TRY`;
  const totalFeeText = `${money(RECEIPT_TOTAL_FEE)} TRY`;
  const amountText = `${money(transaction.amount)} TRY`;

  // Draw the whole detail section directly. x=106.01 avoids old exact-x
  // layout patches, while CORE_FILL_TEXT bypasses patches imported later.
  context.fillStyle = C_TEXT;
  context.textAlign = "left";
  context.textBaseline = "alphabetic";
  context.font = `500 15.6px ${FONT}`;

  let y = 414;
  const line = (text: string) => {
    CORE_FILL_TEXT.call(context, text, 106.01, y, 1005);
    y += 20;
  };

  line("124587");
  line(`Fast Mesaj Kodu : A01 Fast Sorgu No : ${transaction.transactionNumber}`);
  line(`Gönderen : ${sender}`);
  line(`Alan Banka : ${transaction.recipientBank}`);
  line(`Alıcı Hesap : ${iban}  Alıcı : ${receiver}`);
  line(`İşlem Tutarı : ${amountText}`);
  line(
    `Komisyon : ${commissionText}  BSMV : ${bsmvText}  Mesaj Ücreti : ${messageFeeText}`,
  );
  line(`Toplam Masraf : ${totalFeeText}`);

  // Exactly two request lines. No wrapped continuation can create a second
  // standalone "ederim." line.
  context.font = `500 14.8px ${FONT}`;
  CORE_FILL_TEXT.call(
    context,
    `${amountText} tutarında Fast işleminin yapılmasını, Bu işlem için`,
    106.01,
    584,
    910,
  );
  CORE_FILL_TEXT.call(
    context,
    `tarafıma bildirilen ${totalFeeText} masraf alınmasını talep ederim.`,
    106.01,
    602,
    910,
  );

  const lowerY = 668;
  context.fillStyle = C_TEXT;
  context.font = `500 18px ${FONT}`;

  if (transaction.incoming) {
    context.fillText(
      `Hesabınıza ${money(transaction.amount)} TL yatırılmıştır.`,
      94,
      lowerY,
      720,
    );
  } else {
    context.fillText(
      `Hesabınızdan ${money(transaction.amount)} TL (Yalnız ${amountWords(transaction.amount)}) Çekilmiştir.`,
      94,
      lowerY,
      720,
    );
  }

  context.fillStyle = C_TEXT;
  context.font = `500 17.5px ${FONT}`;
  // receipt-transaction-reference shifts this timestamp 5px upward on the PDF.
  context.fillText(
    `${slashDate}-${timestamp} EFTTGIDD INTERNET`,
    94,
    lowerY + 41,
    650,
  );
  context.fillText("INTERNET", 94, lowerY + 62);

  context.textAlign = "center";
  context.fillStyle = C_TEXT_SOFT;
  context.font = `500 12.5px ${FONT}`;
  context.fillText("Saygılarımızla", 960, 661);

  context.fillStyle = C_TEXT;
  context.font = `700 13.5px ${FONT}`;
  context.fillText("T.C. ZİRAAT BANKASI A.Ş.", 960, 684);

  context.font = `500 12.5px ${FONT}`;
  context.fillText("İNTERNET ŞUBESİ", 960, 706);

  context.textAlign = "left";
  context.strokeStyle = C_BORDER;
  context.lineWidth = 1.25;
  context.beginPath();
  context.moveTo(62, 752);
  context.lineTo(1124, 752);
  context.stroke();

  context.fillStyle = C_TEXT;
  context.font = `500 13.2px ${FONT}`;
  context.fillText(
    "Taraflar arasında tüm uyuşmazlıklarda, Banka'nın defter kayıtları ve belgeleri,müstenitli olsun olmasın,",
    62,
    775,
    1062,
  );
  context.fillText(
    "kesin ve aksi ileri sürülemez delil niteliğindedir.",
    62,
    796,
  );
  context.fillText(
    "Merkez: Finanskent Mahallesi Finans Caddesi No:44A Ümraniye/İstanbul Ticaret Sicil No:475225-5",
    62,
    821,
    1062,
  );
  context.fillText("www.ziraatbank.com.tr", 62, 845);

  context.textAlign = "center";
  context.fillStyle = C_ACCENT;
  context.font = `700 14px ${FONT}`;
  context.textAlign = "left";

  return canvas;
}

function pdf(canvas: HTMLCanvasElement) {
  const imageUrl = canvas.toDataURL("image/jpeg", 0.98);
  const imageData = atob(imageUrl.split(",")[1] || "");
  const content = `q\n${PW} 0 0 ${PH} 0 0 cm\n/Im0 Do\nQ\n`;

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PW} ${PH}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`,
    `<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imageData.length} >>\nstream\n${imageData}\nendstream`,
    `<< /Length ${content.length} >>\nstream\n${content}endstream`,
  ];

  let result = "%PDF-1.4\n%âãÏÓ\n";
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets[index + 1] = result.length;
    result += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xref = result.length;
  result += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;

  for (let i = 1; i <= objects.length; i += 1) {
    result += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }

  result += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;

  const bytes = new Uint8Array(result.length);
  for (let i = 0; i < result.length; i += 1) {
    bytes[i] = result.charCodeAt(i) & 255;
  }

  return new Blob([bytes], { type: "application/pdf" });
}

async function open(transaction: ReceiptTx, target: Window | null) {
  const blob = pdf(await canvasFor(transaction));
  const url = URL.createObjectURL(blob);

  if (target) {
    target.location.href = url;
  } else {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.target = "_blank";
    anchor.rel = "noopener";
    anchor.click();
  }

  setTimeout(() => URL.revokeObjectURL(url), 120000);
}

document.addEventListener(
  "click",
  (event) => {
    const element = event.target instanceof Element ? event.target : null;
    const button = element?.closest<HTMLButtonElement>(
      'button[aria-label="Dekontu paylaş"]',
    );
    if (!button) return;

    const screen = button.closest<HTMLElement>(".fixed.inset-0");
    if (!screen) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    const transaction = current(screen);
    if (!transaction) {
      alert("Dekont bilgileri okunamadı. Lütfen tekrar deneyin.");
      return;
    }

    const target = window.open("about:blank", "_blank");
    void open(transaction, target).catch(() => {
      if (target && !target.closed) target.close();
      alert("Dekont PDF'i oluşturulamadı. Lütfen tekrar deneyin.");
    });
  },
  true,
);
