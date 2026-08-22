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

const encoder = new TextEncoder();
let menuOpen = false;
let working = false;

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

function money(value: string | number | undefined) {
  return `${Math.abs(parseAmount(value)).toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} TL`;
}

function readTransactions(): DemoTransaction[] {
  try {
    const parsed = JSON.parse(localStorage.getItem("demo_transactions") || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function ascii(value: string) {
  return encoder.encode(value);
}

function join(chunks: Uint8Array[]) {
  const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
}

function dataUrlBytes(url: string) {
  const b64 = url.split(",")[1] || "";
  const binary = atob(b64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) out[i] = binary.charCodeAt(i);
  return out;
}

function buildCanvas(transactions: DemoTransaction[]) {
  const canvas = document.createElement("canvas");
  canvas.width = 1240;
  canvas.height = 1754;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas açılamadı.");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#b51624";
  ctx.fillRect(0, 0, canvas.width, 150);
  ctx.fillStyle = "#ffffff";
  ctx.font = "700 42px Arial";
  ctx.fillText("DEMO / ÖRNEK PDF", 72, 82);
  ctx.font = "700 20px Arial";
  ctx.fillText("GERÇEK BANKA İŞLEMİ DEĞİLDİR", 72, 120);

  ctx.fillStyle = "#222222";
  ctx.font = "700 30px Arial";
  ctx.fillText("Hesap Hareketleri - Demo Çıktı", 72, 220);

  let y = 285;
  const visible = transactions.slice(0, 14);
  visible.forEach((tx, index) => {
    const sign = tx.type === "income" ? "+" : "-";
    ctx.fillStyle = "#f7f7f7";
    ctx.fillRect(72, y - 34, 1096, 82);
    ctx.fillStyle = "#202020";
    ctx.font = "700 20px Arial";
    ctx.fillText(`${index + 1}. ${tx.title || "İşlem"}`, 92, y);
    ctx.font = "600 18px Arial";
    ctx.fillText(`${sign}${money(tx.amount)}`, 900, y);
    ctx.fillStyle = "#666666";
    ctx.font = "500 15px Arial";
    const info = `${tx.date || "-"} ${tx.time || ""}  •  ${tx.recipientName || "-"}`;
    ctx.fillText(info.slice(0, 90), 92, y + 27);
    y += 96;
  });

  ctx.save();
  ctx.translate(620, 930);
  ctx.rotate(-0.5);
  ctx.fillStyle = "rgba(181,22,36,.11)";
  ctx.font = "900 92px Arial";
  ctx.textAlign = "center";
  ctx.fillText("DEMO - ÖRNEKTİR", 0, 0);
  ctx.restore();

  ctx.fillStyle = "#666666";
  ctx.font = "700 18px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Bu belge yalnızca demo/test amaçlıdır; gerçek bir banka dekontu veya ödeme kanıtı değildir.", 620, 1680);
  ctx.textAlign = "left";

  return canvas;
}

function buildPdf(canvas: HTMLCanvasElement) {
  const jpg = dataUrlBytes(canvas.toDataURL("image/jpeg", 0.88));
  const objects = new Map<number, Uint8Array>();
  objects.set(1, ascii("<< /Type /Catalog /Pages 2 0 R >>"));
  objects.set(2, ascii("<< /Type /Pages /Kids [3 0 R] /Count 1 >>"));
  objects.set(3, ascii("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>"));
  objects.set(4, join([
    ascii(`<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpg.length} >>\nstream\n`),
    jpg,
    ascii("\nendstream"),
  ]));
  const draw = ascii("q\n595.28 0 0 841.89 0 0 cm\n/Im0 Do\nQ\n");
  objects.set(5, join([ascii(`<< /Length ${draw.length} >>\nstream\n`), draw, ascii("endstream")]));

  const chunks: Uint8Array[] = [ascii("%PDF-1.4\n%DEMO\n")];
  const offsets = new Array(6).fill(0);
  let size = chunks[0].length;
  for (let id = 1; id <= 5; id += 1) {
    offsets[id] = size;
    const obj = join([ascii(`${id} 0 obj\n`), objects.get(id)!, ascii("\nendobj\n")]);
    chunks.push(obj);
    size += obj.length;
  }
  const xrefAt = size;
  let xref = "xref\n0 6\n0000000000 65535 f \n";
  for (let id = 1; id <= 5; id += 1) xref += `${String(offsets[id]).padStart(10, "0")} 00000 n \n`;
  xref += `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefAt}\n%%EOF`;
  chunks.push(ascii(xref));
  return new Blob([join(chunks)], { type: "application/pdf" });
}

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function closeMenu() {
  document.getElementById("demo-pdf-menu-v3")?.remove();
  menuOpen = false;
}

function showBusy(text: string) {
  const layer = document.createElement("div");
  layer.id = "demo-pdf-busy-v3";
  Object.assign(layer.style, {
    position: "fixed",
    inset: "0",
    zIndex: "2147483647",
    display: "grid",
    placeItems: "center",
    background: "rgba(0,0,0,.42)",
    padding: "24px",
  });
  const card = document.createElement("div");
  card.textContent = text;
  Object.assign(card.style, {
    background: "white",
    color: "#222",
    borderRadius: "16px",
    padding: "18px 22px",
    font: "700 15px Arial, sans-serif",
    boxShadow: "0 12px 36px rgba(0,0,0,.24)",
  });
  layer.appendChild(card);
  document.body.appendChild(layer);
  return layer;
}

async function makeAndShare(mode: "share" | "download") {
  if (working) return;
  working = true;
  closeMenu();
  const busy = showBusy("PDF hazırlanıyor...");
  try {
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    const transactions = readTransactions();
    if (!transactions.length) {
      alert("Paylaşılacak demo hesap hareketi bulunmuyor.");
      return;
    }
    const blob = buildPdf(buildCanvas(transactions));
    const filename = `demo-hesap-hareketleri-${new Date().toISOString().slice(0, 10)}.pdf`;

    if (mode === "share") {
      const file = new File([blob], filename, { type: "application/pdf" });
      const shareData: ShareData = { files: [file], title: "Demo PDF", text: "Demo / örnek hesap hareketleri" };
      if (navigator.share && (!navigator.canShare || navigator.canShare(shareData))) {
        try {
          await navigator.share(shareData);
          return;
        } catch (error) {
          if (error instanceof DOMException && error.name === "AbortError") return;
        }
      }
    }

    download(blob, filename);
  } catch (error) {
    console.error("PDF share error", error);
    alert("PDF oluşturulamadı. Lütfen tekrar deneyin.");
  } finally {
    busy.remove();
    working = false;
  }
}

function showMenu() {
  if (menuOpen) return;
  menuOpen = true;

  const root = document.createElement("div");
  root.id = "demo-pdf-menu-v3";
  Object.assign(root.style, {
    position: "fixed",
    inset: "0",
    zIndex: "2147483646",
    background: "rgba(0,0,0,.35)",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
  });

  const sheet = document.createElement("div");
  Object.assign(sheet.style, {
    width: "min(430px, 100%)",
    background: "#fff",
    borderRadius: "22px 22px 0 0",
    padding: "18px 18px 28px",
    boxShadow: "0 -8px 30px rgba(0,0,0,.16)",
    fontFamily: "Arial, sans-serif",
  });

  const title = document.createElement("div");
  title.textContent = "PDF İşlemleri";
  Object.assign(title.style, { fontSize: "18px", fontWeight: "700", marginBottom: "14px", color: "#222" });

  const share = document.createElement("button");
  share.textContent = "PDF Paylaş";
  Object.assign(share.style, {
    width: "100%", border: "0", borderRadius: "14px", padding: "15px",
    background: "#e30620", color: "#fff", fontSize: "15px", fontWeight: "700", marginBottom: "10px",
  });
  share.onclick = () => void makeAndShare("share");

  const save = document.createElement("button");
  save.textContent = "PDF İndir";
  Object.assign(save.style, {
    width: "100%", border: "1px solid #ddd", borderRadius: "14px", padding: "15px",
    background: "#fff", color: "#222", fontSize: "15px", fontWeight: "700", marginBottom: "10px",
  });
  save.onclick = () => void makeAndShare("download");

  const cancel = document.createElement("button");
  cancel.textContent = "Vazgeç";
  Object.assign(cancel.style, {
    width: "100%", border: "0", background: "transparent", padding: "12px", color: "#666", fontSize: "14px", fontWeight: "700",
  });
  cancel.onclick = closeMenu;

  sheet.append(title, share, save, cancel);
  root.appendChild(sheet);
  root.addEventListener("click", (event) => {
    if (event.target === root) closeMenu();
  });
  document.body.appendChild(root);
}

function isThreeDotButton(button: HTMLButtonElement) {
  const cls = String(button.className || "");
  const svgCls = button.querySelector("svg")?.getAttribute("class") || "";
  return (
    svgCls.includes("lucide-ellipsis-vertical") ||
    svgCls.includes("lucide-more-vertical") ||
    (cls.includes("ml-auto") && cls.includes("mb-2") && cls.includes("h-9") && cls.includes("w-9"))
  );
}

function bindButtons() {
  document.querySelectorAll("button").forEach((node) => {
    if (!(node instanceof HTMLButtonElement) || !isThreeDotButton(node)) return;
    if (node.dataset.demoPdfBound === "1") return;
    node.dataset.demoPdfBound = "1";
    node.setAttribute("aria-label", "PDF işlemleri");
    node.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      showMenu();
    });
  });
}

bindButtons();
const observer = new MutationObserver(bindButtons);
observer.observe(document.documentElement, { childList: true, subtree: true });
window.setInterval(bindButtons, 1000);
