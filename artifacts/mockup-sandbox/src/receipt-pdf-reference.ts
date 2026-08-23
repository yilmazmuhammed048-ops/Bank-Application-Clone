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
const RECEIPT_TOTAL_FEE = RECEIPT_COMMISSION + RECEIPT_BSMV + RECEIPT_MESSAGE_FEE;

const C_TEXT = "#2f3437";
const C_TEXT_SOFT = "#4a5054";
const C_TEXT_LIGHT = "#62686c";
const C_BORDER = "#cfd2d4";
const C_ACCENT = "#a00018";

const ONES = ["", "BİR", "İKİ", "ÜÇ", "DÖRT", "BEŞ", "ALTI", "YEDİ", "SEKİZ", "DOKUZ"];
const TENS = ["", "ON", "YİRMİ", "OTUZ", "KIRK", "ELLİ", "ALTMIŞ", "YETMİŞ", "SEKSEN", "DOKSAN"];
const SCALES = ["", "BİN", "MİLYON", "MİLYAR", "TRİLYON"];

function amount(v: string | number | undefined) {
  if (typeof v === "number") return Math.abs(v);
  const n = Number(
    String(v ?? "0")
      .replace(/TL|TRY/gi, "")
      .replace(/\s/g, "")
      .replace(/\./g, "")
      .replace(",", ".")
      .replace(/[^\d+.-]/g, ""),
  );
  return Number.isFinite(n) ? Math.abs(n) : 0;
}

function money(v: number) {
  return v.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function date(v: string) {
  const s = String(v || "").trim();
  const m = s.match(/(\d{1,2})\s+([^\s]+)\s+(\d{4})/);
  const mm: Record<string, string> = {
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
  if (m) {
    return `${m[1].padStart(2, "0")}.${mm[m[2].toLocaleUpperCase("tr-TR")] || "01"}.${m[3]}`;
  }
  const d = s.match(/(\d{1,2})[./-](\d{1,2})[./-](\d{4})/);
  return d ? `${d[1].padStart(2, "0")}.${d[2].padStart(2, "0")}.${d[3]}` : s;
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
  const first = hashString(`${seed}|seconds`);
  const second = hashString(`${seed}|reference-a`);
  const third = hashString(`${seed}|reference-b`);

  return {
    seconds: String(first % 60).padStart(2, "0"),
    code: `F${10000 + (second % 90000)}_${1000 + (third % 9000)}`,
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
      const group = scaleIndex === 1 && chunk === 1
        ? "BİN"
        : `${chunkToTurkish(chunk)}${scale}`;
      groups.unshift(group);
    }
    remaining = Math.floor(remaining / 1000);
    scaleIndex += 1;
  }

  return groups.join("");
}

function amountWords(value: number) {
  const roundedKurus = Math.round(value * 100);
  const lira = Math.floor(roundedKurus / 100);
  const kurus = roundedKurus % 100;
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
  let a: Tx[] = [];
  try {
    const p = JSON.parse(localStorage.getItem("demo_transactions") || "[]");
    a = Array.isArray(p) ? p : [];
  } catch {}

  const text = screen.textContent || "";
  const no = text.match(/Fast\s+Sorgu\s+No\s*:\s*([^\s]+)/i)?.[1]?.trim();
  let t = no ? a.find((x) => String(x.transactionNumber || x.id) === no) : undefined;

  if (!t) {
    t = a.find((x) => {
      const n = String(x.recipientName || "").trim();
      return !!n && text.includes(n) && text.includes(money(amount(x.amount)));
    });
  }

  if (!t) return null;

  const incoming = t.type === "income" || String(t.amount ?? "").trim().startsWith("+");
  return {
    id: String(t.id ?? ""),
    title: String(t.title || (incoming ? "FAST Gelen" : "FAST Giden")),
    amount: amount(t.amount),
    date: String(t.date || ""),
    time: String(t.time || "00:00"),
    recipientName: String(t.recipientName || "BELİRTİLMEMİŞ"),
    recipientIban: String(t.recipientIban || ""),
    recipientBank: String(t.recipientBank || "Banka Bilgisi"),
    transactionNumber: String(t.transactionNumber || t.id || ""),
    incoming,
  };
}

function rr(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}

function lv(c: CanvasRenderingContext2D, l: string, v: string, x: number, y: number, lw = 180) {
  c.fillStyle = C_TEXT_SOFT;
  c.font = `700 16px ${FONT}`;
  c.fillText(l, x, y);
  c.fillStyle = C_TEXT_LIGHT;
  c.font = `400 16px ${FONT}`;
  c.fillText(":", x + lw, y);
  c.fillStyle = C_TEXT;
  c.fillText(v, x + lw + 18, y);
}

function fit(c: CanvasRenderingContext2D, t: string, w: number, x: number, y: number, lh = 19, max = 2) {
  const words = t.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const n = line ? `${line} ${word}` : word;
    if (c.measureText(n).width <= w) {
      line = n;
    } else {
      if (line) lines.push(line);
      line = word;
      if (lines.length >= max - 1) break;
    }
  }
  if (line && lines.length < max) lines.push(line);
  lines.forEach((q, i) => c.fillText(q, x, y + i * lh));
}

function img(src: string) {
  return new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = () => rej(new Error("img"));
    i.src = src;
  });
}

async function canvasFor(t: ReceiptTx) {
  const x = document.createElement("canvas");
  x.width = W;
  x.height = H;
  const c = x.getContext("2d");
  if (!c) throw Error("canvas");

  c.fillStyle = "#fff";
  c.fillRect(0, 0, W, H);

  try {
    const base = await img("/ziraat-amblem.jpg");
    c.drawImage(base, 48, 42, 290, 76);
    await new Promise((r) => setTimeout(r, 80));
    c.fillStyle = "#fff";
    c.fillRect(44, 36, 304, 88);
    c.drawImage(base, 48, 42, 290, 76);
  } catch {}

  c.fillStyle = C_TEXT;
  c.textAlign = "center";
  c.font = `700 23px ${FONT}`;
  c.fillText(t.incoming ? "HESABA GELEN FAST" : "HESAPTAN FAST", W / 2, 97);

  c.fillStyle = C_ACCENT;
  c.textAlign = "right";
  c.font = `700 14px ${FONT}`;
  c.fillText("DEMO / ÖRNEK BELGE", 1078, 76);

  c.textAlign = "left";
  c.strokeStyle = C_BORDER;
  c.lineWidth = 1.8;
  rr(c, 78, 111, 1000, 502, 10);
  c.stroke();
  c.lineWidth = 1.5;
  rr(c, 94, 127, 468, 210, 9);
  c.stroke();
  rr(c, 594, 127, 468, 210, 9);
  c.stroke();

  const d = date(t.date);
  const sd = d.replace(/\./g, "/");
  const clock = transactionClock(t.time);
  const reference = stableReference(`${sd}|${clock.hour}:${clock.minute}|${t.transactionNumber}`);
  const timestamp = `${clock.hour}:${clock.minute}:${reference.seconds}`;
  const doc = reference.code;
  const ys = [155, 181, 207, 233, 259, 285, 311, 331];

  lv(c, "ŞUBE KODU/ADI", "4000/ZİRAAT SÜPER ŞUBE", 108, ys[0]);
  lv(c, "IBAN", MY_IBAN, 108, ys[1]);
  lv(c, "HESAP NUMARASI", MY_ACCOUNT, 108, ys[2]);
  lv(c, "VERGİ DAİRESİ", "", 108, ys[3]);
  lv(c, "VERGİ KİMLİK NO", "10067921118", 108, ys[4]);
  lv(c, "İŞLEM TARİHİ", `${sd}-${timestamp}-${doc}`, 108, ys[5]);
  lv(c, "VALÖR", sd, 108, ys[6]);
  lv(c, "İŞLEM YERİ", "ZİRAAT MOBİL", 108, ys[7]);

  c.fillStyle = C_TEXT;
  c.font = `700 16px ${FONT}`;
  c.fillText("SAYIN", 614, 155);
  c.fillText(MY_NAME, 614, 181);
  c.fillText(ADDRESS1, 614, 231);
  c.fillText(ADDRESS2, 614, 257);
  c.fillText(ADDRESS3, 614, 283);

  const sender = t.incoming ? t.recipientName.toLocaleUpperCase("tr-TR") : MY_NAME;
  const receiver = (t.incoming ? MY_NAME : t.recipientName).toLocaleLowerCase("tr-TR");
  const iban = t.incoming ? MY_IBAN : t.recipientIban;
  const commissionText = `${money(RECEIPT_COMMISSION)} TRY`;
  const bsmvText = `${money(RECEIPT_BSMV)} TRY`;
  const messageFeeText = `${money(RECEIPT_MESSAGE_FEE)} TRY`;
  const totalFeeText = `${money(RECEIPT_TOTAL_FEE)} TRY`;
  const amt = `${money(t.amount)} TRY`;

  c.fillStyle = C_TEXT;
  c.font = `400 16px ${FONT}`;
  let y = 372;
  const line = (q: string, g = 22) => {
    c.fillText(q, 108, y);
    y += g;
  };

  line(`Fast Mesaj Kodu : A01 Fast Sorgu No : ${t.transactionNumber}`);
  line(`Gönderen : ${sender}`);
  line(`Alan Banka : ${t.recipientBank}`);
  line(`Alıcı Hesap : ${iban}  Alıcı : ${receiver}`);
  line(`İşlem Tutarı : ${amt}`);
  line(`Komisyon : ${commissionText}  BSMV : ${bsmvText}  Mesaj Ücreti : ${messageFeeText}`);
  line(`Toplam Masraf : ${totalFeeText}`);

  c.fillStyle = C_TEXT;
  c.font = `400 15.5px ${FONT}`;
  fit(
    c,
    `${amt} tutarında Fast işleminin yapılmasını, Bu işlem için tarafıma bildirilen ${totalFeeText} masraf alınmasını talep ederim.`,
    700,
    108,
    y + 4,
    19,
    2,
  );

  const fy = 557;
  c.fillStyle = C_TEXT;
  c.font = `400 16px ${FONT}`;
  if (t.incoming) {
    c.fillText(`Hesabınıza ${money(t.amount)} TL yatırılmıştır.`, 94, fy);
  } else {
    c.fillText(
      `Hesabınızdan ${money(t.amount)} TL (Yalnız ${amountWords(t.amount)}) Çekilmiştir.`,
      94,
      fy,
    );
  }
  c.fillStyle = C_TEXT_SOFT;
  c.fillText(`${sd}-${timestamp} EFTTGIDD INTERNET`, 94, fy + 18);
  c.fillText("INTERNET", 94, fy + 36);

  c.textAlign = "center";
  c.fillStyle = "#666b6e";
  c.font = `400 11px ${FONT}`;
  c.fillText("Saygılarımızla", 920, fy - 12);
  c.fillStyle = "#303436";
  c.font = `700 12px ${FONT}`;
  c.fillText("T.C. ZİRAAT BANKASI A.Ş.", 920, fy + 3);
  c.fillStyle = "#44484b";
  c.font = `600 11px ${FONT}`;
  c.fillText("İNTERNET ŞUBESİ", 920, fy + 18);

  c.textAlign = "left";
  c.strokeStyle = C_BORDER;
  c.lineWidth = 1.2;
  c.beginPath();
  c.moveTo(78, 615);
  c.lineTo(1078, 615);
  c.stroke();

  c.fillStyle = C_TEXT;
  c.font = `400 10.5px ${FONT}`;
  c.fillText(
    "Taraflar arasında tüm uyuşmazlıklarda, Banka'nın defter kayıtları ve belgeleri,müstenitli olsun olmasın,",
    78,
    642,
  );
  c.fillText("kesin ve aksi ileri sürülemez delil niteliğindedir.", 78, 658);
  c.fillText(
    "Merkez: Finanskent Mahallesi Finans Caddesi No:44A Ümraniye/İstanbul Ticaret Sicil No:475225-5",
    78,
    677,
  );
  c.fillText("www.ziraatbank.com.tr", 78, 696);

  c.textAlign = "center";
  c.fillStyle = C_ACCENT;
  c.font = `700 13px ${FONT}`;
  c.fillText("ÖRNEK BELGE - RESMÎ BANKA DEKONTU DEĞİLDİR.", W / 2, 1715);
  c.textAlign = "left";

  return x;
}

function pdf(x: HTMLCanvasElement) {
  const u = x.toDataURL("image/jpeg", 0.94);
  const j = atob(u.split(",")[1] || "");
  const s = `q\n${PW} 0 0 ${PH} 0 0 cm\n/Im0 Do\nQ\n`;
  const o = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PW} ${PH}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`,
    `<< /Type /XObject /Subtype /Image /Width ${x.width} /Height ${x.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${j.length} >>\nstream\n${j}\nendstream`,
    `<< /Length ${s.length} >>\nstream\n${s}endstream`,
  ];

  let p = "%PDF-1.4\n%âãÏÓ\n";
  const of = [0];
  o.forEach((q, i) => {
    of[i + 1] = p.length;
    p += `${i + 1} 0 obj\n${q}\nendobj\n`;
  });

  const xr = p.length;
  p += `xref\n0 ${o.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= o.length; i++) {
    p += `${String(of[i]).padStart(10, "0")} 00000 n \n`;
  }
  p += `trailer\n<< /Size ${o.length + 1} /Root 1 0 R >>\nstartxref\n${xr}\n%%EOF`;

  const b = new Uint8Array(p.length);
  for (let i = 0; i < p.length; i++) b[i] = p.charCodeAt(i) & 255;
  return new Blob([b], { type: "application/pdf" });
}

async function open(t: ReceiptTx, w: Window | null) {
  const b = pdf(await canvasFor(t));
  const u = URL.createObjectURL(b);
  if (w) {
    w.location.href = u;
  } else {
    const a = document.createElement("a");
    a.href = u;
    a.target = "_blank";
    a.rel = "noopener";
    a.click();
  }
  setTimeout(() => URL.revokeObjectURL(u), 120000);
}

document.addEventListener(
  "click",
  (e) => {
    const el = e.target instanceof Element ? e.target : null;
    const b = el?.closest<HTMLButtonElement>('button[aria-label="Dekontu paylaş"]');
    if (!b) return;

    const screen = b.closest<HTMLElement>(".fixed.inset-0");
    if (!screen) return;

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    const t = current(screen);
    if (!t) {
      alert("Dekont bilgileri okunamadı. Lütfen tekrar deneyin.");
      return;
    }

    const w = window.open("about:blank", "_blank");
    void open(t, w).catch(() => {
      if (w && !w.closed) w.close();
      alert("Dekont PDF'i oluşturulamadı. Lütfen tekrar deneyin.");
    });
  },
  true,
);
