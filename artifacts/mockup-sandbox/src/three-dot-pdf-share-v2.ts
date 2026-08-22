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
};

type PdfImage = { bytes: Uint8Array; width: number; height: number };

const encoder = new TextEncoder();
let busy = false;

function parseAmount(value: string | number | undefined) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const cleaned = String(value ?? "0")
    .replace(/TL/gi, "")
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(/[^\d.-]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function money(value: string | number | undefined) {
  return `${Math.abs(parseAmount(value)).toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} TL`;
}

function readData() {
  let account: DemoAccount = {};
  let transactions: DemoTransaction[] = [];
  try { account = JSON.parse(localStorage.getItem("demo_account") || "{}"); } catch {}
  try {
    const parsed = JSON.parse(localStorage.getItem("demo_transactions") || "[]");
    if (Array.isArray(parsed)) transactions = parsed;
  } catch {}
  return { account, transactions };
}

function overlay(text: string) {
  const el = document.createElement("div");
  el.id = "demo-pdf-overlay";
  Object.assign(el.style, {
    position: "fixed", inset: "0", zIndex: "99999", display: "grid",
    placeItems: "center", background: "rgba(0,0,0,.38)", padding: "24px",
  });
  const card = document.createElement("div");
  card.textContent = text;
  Object.assign(card.style, {
    background: "#fff", color: "#222", borderRadius: "14px", padding: "18px 22px",
    font: "700 14px Arial, sans-serif", boxShadow: "0 8px 30px rgba(0,0,0,.18)",
  });
  el.appendChild(card);
  document.body.appendChild(el);
  return el;
}

function wrap(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = String(text || "-").split(/\s+/);
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y);
      y += lineHeight;
      line = word;
    } else line = test;
  }
  if (line) ctx.fillText(line, x, y);
  return y;
}

function makePage(tx: DemoTransaction, account: DemoAccount, index: number, total: number) {
  const c = document.createElement("canvas");
  c.width = 720; c.height = 1018;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height);

  ctx.fillStyle = "#b51624"; ctx.fillRect(0, 0, c.width, 92);
  ctx.fillStyle = "#fff"; ctx.font = "700 28px Arial"; ctx.fillText("DEMO / ÖRNEK DEKONT", 42, 56);
  ctx.font = "700 13px Arial"; ctx.fillText("GERÇEK BANKA İŞLEMİ DEĞİLDİR", 420, 54);

  ctx.fillStyle = "#222"; ctx.font = "700 22px Arial"; ctx.fillText(tx.type === "income" ? "GELEN İŞLEM" : "GİDEN İŞLEM", 42, 145);
  ctx.font = "600 14px Arial"; ctx.fillStyle = "#666"; ctx.fillText(`Sayfa ${index + 1} / ${total}`, 570, 145);

  const rows: Array<[string,string]> = [
    ["İşlem", tx.title || "İşlem"],
    ["Açıklama", tx.description || "-"],
    ["Tutar", `${tx.type === "income" ? "+" : "-"}${money(tx.amount)}`],
    ["Tarih / Saat", `${tx.date || "-"} ${tx.time || ""}`.trim()],
    ["Alıcı / Gönderen", tx.recipientName || "-"],
    ["IBAN", tx.recipientIban || "-"],
    ["Banka", tx.recipientBank || "-"],
    ["İşlem Numarası", String(tx.transactionNumber || tx.id || "-")],
    ["Hesap Sahibi", account.name || "Demo Kullanıcı"],
    ["Hesap IBAN", account.iban || "-"],
    ["Hesap No", account.accountNumber || "-"],
  ];

  let y = 198;
  for (const [label, value] of rows) {
    ctx.fillStyle = "#777"; ctx.font = "700 12px Arial"; ctx.fillText(label.toUpperCase(), 42, y);
    ctx.fillStyle = "#222"; ctx.font = label === "Tutar" ? "700 20px Arial" : "600 15px Arial";
    y = wrap(ctx, value, 42, y + 27, 630, 21) + 35;
    ctx.strokeStyle = "#e4e4e4"; ctx.beginPath(); ctx.moveTo(42, y - 17); ctx.lineTo(678, y - 17); ctx.stroke();
  }

  ctx.save();
  ctx.translate(360, 530); ctx.rotate(-0.5);
  ctx.fillStyle = "rgba(181,22,36,.10)"; ctx.font = "900 54px Arial"; ctx.textAlign = "center";
  ctx.fillText("DEMO - ÖRNEKTİR", 0, 0); ctx.restore();

  ctx.fillStyle = "#777"; ctx.font = "700 12px Arial"; ctx.textAlign = "center";
  ctx.fillText("Bu belge yalnızca demo/test amaçlıdır; ödeme kanıtı değildir.", 360, 974);
  ctx.textAlign = "left";
  return c;
}

function dataUrlBytes(url: string) {
  const b64 = url.split(",")[1] || "";
  const bin = atob(b64); const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function ascii(s: string) { return encoder.encode(s); }
function join(chunks: Uint8Array[]) {
  const len = chunks.reduce((n, c) => n + c.length, 0); const out = new Uint8Array(len);
  let p = 0; for (const c of chunks) { out.set(c, p); p += c.length; } return out;
}

function buildPdf(images: PdfImage[]) {
  const objects = new Map<number, Uint8Array>();
  const pagesId = 2; let next = 3;
  const pageIds: number[] = [];
  images.forEach((img) => {
    const page = next++, image = next++, content = next++; pageIds.push(page);
    objects.set(page, ascii(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 595.28 841.89] /Resources << /XObject << /Im0 ${image} 0 R >> >> /Contents ${content} 0 R >>`));
    objects.set(image, join([ascii(`<< /Type /XObject /Subtype /Image /Width ${img.width} /Height ${img.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${img.bytes.length} >>\nstream\n`), img.bytes, ascii("\nendstream")]));
    const cmd = ascii("q\n595.28 0 0 841.89 0 0 cm\n/Im0 Do\nQ\n");
    objects.set(content, join([ascii(`<< /Length ${cmd.length} >>\nstream\n`), cmd, ascii("endstream")]));
  });
  objects.set(1, ascii("<< /Type /Catalog /Pages 2 0 R >>"));
  objects.set(2, ascii(`<< /Type /Pages /Kids [${pageIds.map(id => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`));

  const count = next - 1; const chunks: Uint8Array[] = [ascii("%PDF-1.4\n%DEMO\n")];
  const offsets = new Array(count + 1).fill(0); let size = chunks[0].length;
  for (let id = 1; id <= count; id++) {
    const body = objects.get(id)!; offsets[id] = size;
    const obj = join([ascii(`${id} 0 obj\n`), body, ascii("\nendobj\n")]); chunks.push(obj); size += obj.length;
  }
  const xrefAt = size; let xref = `xref\n0 ${count + 1}\n0000000000 65535 f \n`;
  for (let id = 1; id <= count; id++) xref += `${String(offsets[id]).padStart(10,"0")} 00000 n \n`;
  xref += `trailer\n<< /Size ${count + 1} /Root 1 0 R >>\nstartxref\n${xrefAt}\n%%EOF`;
  chunks.push(ascii(xref));
  return new Blob([join(chunks)], { type: "application/pdf" });
}

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob); const a = document.createElement("a");
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

async function runShare() {
  if (busy) return; busy = true;
  const wait = overlay("PDF hazırlanıyor...");
  try {
    await new Promise<void>((resolve) => requestAnimationFrame(() => setTimeout(resolve, 60)));
    const { account, transactions } = readData();
    if (!transactions.length) { alert("Paylaşılacak demo hesap hareketi bulunmuyor."); return; }

    const selected = transactions.slice(0, 20);
    const images: PdfImage[] = [];
    for (let i = 0; i < selected.length; i++) {
      const canvas = makePage(selected[i], account, i, selected.length);
      images.push({ bytes: dataUrlBytes(canvas.toDataURL("image/jpeg", .76)), width: canvas.width, height: canvas.height });
      if (i % 3 === 2) await new Promise<void>(r => setTimeout(r, 0));
    }

    const blob = buildPdf(images);
    const name = `demo-dekontlar-${new Date().toISOString().slice(0,10)}.pdf`;
    const file = new File([blob], name, { type: "application/pdf" });
    const data: ShareData = { files: [file], title: "Demo dekontlar", text: "Demo / örnek dekont PDF" };

    let shared = false;
    try {
      if (navigator.share && (!navigator.canShare || navigator.canShare(data))) {
        await navigator.share(data); shared = true;
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") shared = true;
    }
    if (!shared) download(blob, name);
  } catch (e) {
    console.error("Demo PDF share failed", e);
    alert("PDF oluşturulamadı. Lütfen tekrar deneyin.");
  } finally {
    wait.remove(); busy = false;
  }
}

function isTarget(button: HTMLButtonElement) {
  const cls = String(button.className || "");
  const svg = button.querySelector("svg");
  const svgCls = svg?.getAttribute("class") || "";
  return svgCls.includes("lucide-ellipsis-vertical") || svgCls.includes("lucide-more-vertical") ||
    (cls.includes("ml-auto") && cls.includes("mb-2") && cls.includes("h-9") && cls.includes("w-9"));
}

document.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const button = target.closest("button");
  if (!(button instanceof HTMLButtonElement) || !isTarget(button)) return;
  event.preventDefault();
  event.stopPropagation();
  void runShare();
}, true);
