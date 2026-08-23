const TURKISH_MONTHS: Record<string, string> = {
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

const ONES = ["", "BİR", "İKİ", "ÜÇ", "DÖRT", "BEŞ", "ALTI", "YEDİ", "SEKİZ", "DOKUZ"];
const TENS = ["", "ON", "YİRMİ", "OTUZ", "KIRK", "ELLİ", "ALTMIŞ", "YETMİŞ", "SEKSEN", "DOKSAN"];
const SCALES = ["", "BİN", "MİLYON", "MİLYAR", "TRİLYON"];

function normalize(value: string) {
  return value.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
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

  const seconds = first % 60;
  const left = 10000 + (second % 90000);
  const right = 1000 + (third % 9000);

  return {
    seconds: String(seconds).padStart(2, "0"),
    code: `F${left}_${right}`,
  };
}

function numericDate(dateText: string) {
  const source = normalize(dateText);

  const numeric = source.match(/\b(\d{1,2})[./-](\d{1,2})[./-](\d{4})\b/);
  if (numeric) {
    return `${numeric[1].padStart(2, "0")}/${numeric[2].padStart(2, "0")}/${numeric[3]}`;
  }

  const longDate = source.match(/\b(\d{1,2})\s+([A-Za-zÇĞİÖŞÜçğıöşü]+)\s+(\d{4})\b/u);
  if (!longDate) return null;

  const monthKey = longDate[2].toLocaleUpperCase("tr-TR");
  const month = TURKISH_MONTHS[monthKey];
  if (!month) return null;

  return `${longDate[1].padStart(2, "0")}/${month}/${longDate[3]}`;
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

function parseDisplayedAmount(text: string) {
  const match = normalize(text).match(/(\d{1,3}(?:\.\d{3})*|\d+),(\d{2})/);
  if (!match) return null;

  const lira = Number(match[1].replace(/\./g, ""));
  const kurus = Number(match[2]);
  if (!Number.isFinite(lira) || !Number.isFinite(kurus)) return null;

  return {
    display: `${match[1]},${match[2]}`,
    lira,
    kurus,
  };
}

function findDocumentValue(container: Element, label: string) {
  const strong = Array.from(container.querySelectorAll("strong")).find(
    (node) => normalize(node.textContent || "").toLocaleUpperCase("tr-TR") === label,
  );
  if (!strong) return null;

  const row = strong.parentElement;
  if (!row) return null;

  return row.querySelector("span");
}

function findTransactionNumber(container: Element) {
  const text = normalize(container.textContent || "");
  const match = text.match(/Fast\s+Sorgu\s+No\s*:\s*([^\s]+)/i);
  return match?.[1] || "receipt";
}

function applyReceiptSignoffReference(overlay: HTMLElement) {
  const firstLine = Array.from(overlay.querySelectorAll<HTMLParagraphElement>("p")).find(
    (node) => normalize(node.textContent || "").toLocaleLowerCase("tr-TR") === "saygılarımızla",
  );
  if (!firstLine) return;

  const block = firstLine.parentElement as HTMLElement | null;
  if (!block) return;

  const lines = Array.from(block.querySelectorAll<HTMLParagraphElement>(":scope > p"));
  if (lines.length < 3) return;

  Object.assign(block.style, {
    width: "102px",
    minWidth: "102px",
    paddingBottom: "1px",
    textAlign: "center",
    whiteSpace: "nowrap",
    fontFamily: 'Arial, "Helvetica Neue", Helvetica, sans-serif',
    lineHeight: "1.12",
    letterSpacing: "0",
    color: "#35393b",
    transform: "translateY(-1px)",
  });

  Object.assign(lines[0].style, {
    margin: "0",
    fontSize: "5.1px",
    fontWeight: "400",
    lineHeight: "1.08",
    color: "#55595b",
  });

  Object.assign(lines[1].style, {
    margin: "1px 0 0",
    fontSize: "5.7px",
    fontWeight: "700",
    lineHeight: "1.08",
    color: "#303436",
  });

  Object.assign(lines[2].style, {
    margin: "1px 0 0",
    fontSize: "5.4px",
    fontWeight: "600",
    lineHeight: "1.08",
    color: "#3d4143",
  });
}

function applyReceiptLegalFooterReference(overlay: HTMLElement) {
  const paragraphs = Array.from(overlay.querySelectorAll<HTMLParagraphElement>("p"));
  const legalLine = paragraphs.find((node) =>
    normalize(node.textContent || "").toLocaleLowerCase("tr-TR").startsWith("taraflar arasında tüm uyuşmazlıklarda"),
  );
  if (!legalLine) return;

  const centerLine = legalLine.nextElementSibling as HTMLParagraphElement | null;
  const webLine = centerLine?.nextElementSibling as HTMLParagraphElement | null;
  if (!centerLine || !webLine) return;

  const firstLine = "Taraflar arasında tüm uyuşmazlıklarda, Banka'nın defter kayıtları ve belgeleri,müstenitli olsun olmasın,";
  const secondLine = "kesin ve aksi ileri sürülemez delil niteliğindedir.";
  const desiredLegal = `${firstLine} ${secondLine}`;
  const desiredCenter = "Merkez: Finanskent Mahallesi Finans Caddesi No:44A Ümraniye/İstanbul Ticaret Sicil No:475225-5";
  const desiredWeb = "www.ziraatbank.com.tr";

  if (normalize(legalLine.textContent || "") !== normalize(desiredLegal)) {
    legalLine.replaceChildren(
      document.createTextNode(firstLine),
      document.createElement("br"),
      document.createTextNode(secondLine),
    );
  }

  if (normalize(centerLine.textContent || "") !== normalize(desiredCenter)) {
    centerLine.textContent = desiredCenter;
  }

  if (normalize(webLine.textContent || "") !== normalize(desiredWeb)) {
    webLine.textContent = desiredWeb;
  }

  for (const line of [legalLine, centerLine, webLine]) {
    Object.assign(line.style, {
      fontFamily: 'Arial, "Helvetica Neue", Helvetica, sans-serif',
      fontSize: "6.5px",
      fontWeight: "400",
      lineHeight: "1.3",
      letterSpacing: "-0.01em",
      color: "#222629",
      textAlign: "left",
    });
  }

  legalLine.style.marginTop = "4px";
  centerLine.style.marginTop = "3px";
  webLine.style.marginTop = "3px";
}

function applyWithdrawalReference(
  overlay: HTMLElement,
  date: string,
  hour: string,
  minute: string,
  seconds: string,
) {
  const paragraphs = Array.from(overlay.querySelectorAll<HTMLParagraphElement>("p"));
  const amountLine = paragraphs.find((node) =>
    normalize(node.textContent || "").toLocaleUpperCase("tr-TR").startsWith("İŞLEM TUTARI"),
  );
  const withdrawalLine = paragraphs.find((node) =>
    normalize(node.textContent || "").toLocaleLowerCase("tr-TR").startsWith("hesabınızdan"),
  );

  if (!amountLine || !withdrawalLine) return;

  const amount = parseDisplayedAmount(amountLine.textContent || "");
  if (!amount) return;

  const amountInWords = `${integerToTurkish(amount.lira)}TL${integerToTurkish(amount.kurus)}KR`;
  const desiredWithdrawal = `Hesabınızdan ${amount.display} TL (Yalnız ${amountInWords}) Çekilmiştir.`;
  const desiredTimestamp = `${date}-${hour}:${minute}:${seconds} EFTTGIDD INTERNET`;

  if (normalize(withdrawalLine.textContent || "") !== normalize(desiredWithdrawal)) {
    withdrawalLine.textContent = desiredWithdrawal;
  }

  Object.assign(withdrawalLine.style, {
    marginBottom: "1px",
    lineHeight: "1.12",
  });

  const timestampLine = withdrawalLine.nextElementSibling as HTMLParagraphElement | null;
  if (timestampLine && normalize(timestampLine.textContent || "") !== normalize(desiredTimestamp)) {
    timestampLine.textContent = desiredTimestamp;
  }

  if (timestampLine) {
    Object.assign(timestampLine.style, {
      marginTop: "0px",
      marginBottom: "0px",
      lineHeight: "1.1",
    });
  }
}

function applyReceiptTransactionReference() {
  const overlays = Array.from(document.querySelectorAll<HTMLElement>("div.fixed.inset-0"));

  for (const overlay of overlays) {
    applyReceiptSignoffReference(overlay);
    applyReceiptLegalFooterReference(overlay);

    const transactionValue = findDocumentValue(overlay, "İŞLEM TARİHİ");
    const valueDate = findDocumentValue(overlay, "VALÖR");
    if (!transactionValue || !valueDate) continue;

    const currentTransactionText = normalize(transactionValue.textContent || "").replace(/^:\s*/, "");
    const currentValueText = normalize(valueDate.textContent || "").replace(/^:\s*/, "");

    const date = numericDate(currentTransactionText) || numericDate(currentValueText);
    const timeMatch = currentTransactionText.match(/\b(\d{1,2}):(\d{2})(?::\d{2})?\b/);
    if (!date || !timeMatch) continue;

    const hour = timeMatch[1].padStart(2, "0");
    const minute = timeMatch[2];
    const transactionNumber = findTransactionNumber(overlay);
    const seed = `${date}|${hour}:${minute}|${transactionNumber}`;
    const reference = stableReference(seed);

    const desiredTransaction = `:  ${date}-${hour}:${minute}:${reference.seconds}-${reference.code}`;
    const desiredValue = `:  ${date}`;

    if (normalize(transactionValue.textContent || "") !== normalize(desiredTransaction)) {
      transactionValue.textContent = desiredTransaction;
      transactionValue.setAttribute("title", desiredTransaction.replace(/^:\s*/, ""));
    }

    transactionValue.classList.remove("truncate");
    transactionValue.setAttribute(
      "style",
      "white-space:nowrap;overflow:visible;text-overflow:clip;font-size:4.5px;letter-spacing:-0.025em;",
    );
    transactionValue.parentElement?.setAttribute(
      "style",
      "grid-template-columns:58px 1fr;column-gap:4px;",
    );

    if (normalize(valueDate.textContent || "") !== normalize(desiredValue)) {
      valueDate.textContent = desiredValue;
      valueDate.setAttribute("title", date);
    }

    applyWithdrawalReference(overlay, date, hour, minute, reference.seconds);
  }
}

const originalReceiptReferenceFillText = CanvasRenderingContext2D.prototype.fillText;
CanvasRenderingContext2D.prototype.fillText = function receiptReferenceFillText(...args: any[]) {
  const canvas = this.canvas;
  let text = String(args[0] ?? "");
  let y = Number(args[2]);

  if (canvas?.width === 1240 && canvas?.height === 1754) {
    if (
      text.toLocaleLowerCase("tr-TR").startsWith("hesabınızdan") &&
      text.toLocaleLowerCase("tr-TR").includes("çekilmiştir")
    ) {
      const amount = parseDisplayedAmount(text);
      if (amount) {
        const amountInWords = `${integerToTurkish(amount.lira)}TL${integerToTurkish(amount.kurus)}KR`;
        text = `Hesabınızdan ${amount.display} TL (Yalnız ${amountInWords}) Çekilmiştir.`;
      }
    } else if (/^\d{2}\/\d{2}\/\d{4}-\d{2}:\d{2}:\d{2}\s+EFTTGIDD\s+INTERNET$/i.test(text)) {
      y -= 5;
    } else if (text === "INTERNET" && y >= 590 && y <= 620) {
      y -= 10;
    }
  }

  args[0] = text;
  args[2] = y;
  return originalReceiptReferenceFillText.apply(this, args as any);
};

let queued = false;
function queueApply() {
  if (queued) return;
  queued = true;
  requestAnimationFrame(() => {
    queued = false;
    applyReceiptTransactionReference();
  });
}

const observer = new MutationObserver(queueApply);
observer.observe(document.documentElement, {
  childList: true,
  subtree: true,
  characterData: true,
});

queueApply();
