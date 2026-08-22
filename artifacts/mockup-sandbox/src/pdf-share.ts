type Html2CanvasFn = (
  element: HTMLElement,
  options?: Record<string, unknown>,
) => Promise<HTMLCanvasElement>;

declare global {
  interface Window {
    html2canvas?: Html2CanvasFn;
    jspdf?: {
      jsPDF: new (options?: Record<string, unknown>) => any;
    };
  }
}

const HTML2CANVAS_SRC =
  "https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js";
const JSPDF_SRC =
  "https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js";

function loadScript(src: string, isReady: () => boolean) {
  if (isReady()) return Promise.resolve();

  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[data-demo-pdf-src="${src}"]`,
    );

    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error(`Script yüklenemedi: ${src}`)),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.dataset.demoPdfSrc = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Script yüklenemedi: ${src}`));
    document.head.appendChild(script);
  });
}

async function ensurePdfLibraries() {
  await loadScript(HTML2CANVAS_SRC, () => Boolean(window.html2canvas));
  await loadScript(JSPDF_SRC, () => Boolean(window.jspdf?.jsPDF));

  if (!window.html2canvas || !window.jspdf?.jsPDF) {
    throw new Error("PDF araçları başlatılamadı.");
  }
}

function makeDemoBanner() {
  const banner = document.createElement("div");
  banner.textContent = "DEMO / ÖRNEKTİR - GERÇEK BANKA İŞLEMİ DEĞİLDİR";
  Object.assign(banner.style, {
    width: "100%",
    boxSizing: "border-box",
    marginBottom: "18px",
    border: "2px solid #c81e2b",
    borderRadius: "8px",
    padding: "10px 14px",
    textAlign: "center",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: "14px",
    lineHeight: "1.25",
    fontWeight: "800",
    letterSpacing: "0.02em",
    color: "#a41520",
    background: "#fff5f5",
  } satisfies Partial<CSSStyleDeclaration>);
  return banner;
}

function makeWatermark() {
  const watermark = document.createElement("div");
  watermark.textContent = "DEMO - ÖRNEKTİR";
  Object.assign(watermark.style, {
    position: "absolute",
    left: "50%",
    top: "48%",
    transform: "translate(-50%, -50%) rotate(-28deg)",
    zIndex: "20",
    pointerEvents: "none",
    whiteSpace: "nowrap",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: "42px",
    lineHeight: "1",
    fontWeight: "900",
    letterSpacing: "0.08em",
    color: "rgba(180, 20, 35, 0.16)",
  } satisfies Partial<CSSStyleDeclaration>);
  return watermark;
}

function makeFooter() {
  const footer = document.createElement("div");
  footer.textContent =
    "Bu PDF yalnızca demo/test amaçlıdır; gerçek bir banka dekontu veya işlem kanıtı değildir.";
  Object.assign(footer.style, {
    width: "100%",
    boxSizing: "border-box",
    marginTop: "16px",
    paddingTop: "10px",
    borderTop: "1px solid #d7d7d7",
    textAlign: "center",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: "10px",
    lineHeight: "1.4",
    fontWeight: "700",
    color: "#6b6b6b",
  } satisfies Partial<CSSStyleDeclaration>);
  return footer;
}

function buildPrintableReceipt(shareButton: HTMLButtonElement) {
  const receiptCard = shareButton.parentElement;
  const receiptDocument = receiptCard?.children.item(2);

  if (!(receiptDocument instanceof HTMLElement)) {
    throw new Error("Dekont alanı bulunamadı.");
  }

  const staging = document.createElement("div");
  Object.assign(staging.style, {
    position: "fixed",
    left: "-10000px",
    top: "0",
    width: "560px",
    boxSizing: "border-box",
    padding: "28px",
    background: "#ffffff",
    color: "#111111",
    zIndex: "-1",
  } satisfies Partial<CSSStyleDeclaration>);

  const content = receiptDocument.cloneNode(true) as HTMLElement;
  content.style.position = "relative";
  content.style.width = "100%";
  content.style.maxWidth = "480px";
  content.style.margin = "0 auto";

  const relativeWrap = document.createElement("div");
  relativeWrap.style.position = "relative";
  relativeWrap.appendChild(content);
  relativeWrap.appendChild(makeWatermark());

  staging.appendChild(makeDemoBanner());
  staging.appendChild(relativeWrap);
  staging.appendChild(makeFooter());
  document.body.appendChild(staging);

  return staging;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function shareReceiptAsPdf(shareButton: HTMLButtonElement) {
  await ensurePdfLibraries();

  const printable = buildPrintableReceipt(shareButton);

  try {
    const canvas = await window.html2canvas!(printable, {
      scale: Math.min(3, Math.max(2, window.devicePixelRatio || 1)),
      backgroundColor: "#ffffff",
      useCORS: true,
      logging: false,
    });

    const Pdf = window.jspdf!.jsPDF;
    const pdf = new Pdf({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 8;
    const maxWidth = pageWidth - margin * 2;
    const maxHeight = pageHeight - margin * 2;
    const scale = Math.min(maxWidth / canvas.width, maxHeight / canvas.height);
    const imageWidth = canvas.width * scale;
    const imageHeight = canvas.height * scale;
    const x = (pageWidth - imageWidth) / 2;
    const y = (pageHeight - imageHeight) / 2;

    pdf.addImage(
      canvas.toDataURL("image/jpeg", 0.95),
      "JPEG",
      x,
      y,
      imageWidth,
      imageHeight,
      undefined,
      "FAST",
    );

    const blob = pdf.output("blob") as Blob;
    const date = new Date().toISOString().slice(0, 10);
    const filename = `demo-dekont-${date}.pdf`;
    const file = new File([blob], filename, { type: "application/pdf" });

    const shareData: ShareData = {
      files: [file],
      title: "Demo dekont PDF",
      text: "Demo / örnek dekont PDF",
    };

    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    }

    downloadBlob(blob, filename);
  } finally {
    printable.remove();
  }
}

document.addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;

  const button = target.closest<HTMLButtonElement>(
    'button[aria-label="Dekontu paylaş"]',
  );
  if (!button) return;

  event.preventDefault();
  event.stopPropagation();

  if (button.dataset.pdfBusy === "true") return;
  button.dataset.pdfBusy = "true";
  button.setAttribute("aria-busy", "true");

  try {
    await shareReceiptAsPdf(button);
  } catch (error) {
    console.error(error);
    window.alert("PDF hazırlanamadı. İnternet bağlantısını kontrol edip tekrar deneyin.");
  } finally {
    delete button.dataset.pdfBusy;
    button.removeAttribute("aria-busy");
  }
});

export {};
