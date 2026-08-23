const nativeWindowOpen = window.open.bind(window);
const nativeCreateObjectURL = URL.createObjectURL.bind(URL);

let pendingReceiptPdf = false;

function receiptFilename() {
  const screen = document
    .querySelector<HTMLButtonElement>('button[aria-label="Dekontu paylaş"]')
    ?.closest<HTMLElement>(".fixed.inset-0");
  const text = screen?.innerText || screen?.textContent || "";
  const transactionNumber =
    text.match(/Fast\s+Sorgu\s+No\s*:\s*([^\s]+)/i)?.[1]?.trim() ||
    String(Date.now());
  return `Dekont_${transactionNumber.replace(/[^\w.-]+/g, "_")}.pdf`;
}

function isAppleMobile() {
  const ua = navigator.userAgent;
  return (
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function downloadPdf(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

async function saveReceiptPdf(blob: Blob, url: string) {
  const filename = receiptFilename();
  const file = new File([blob], filename, {
    type: "application/pdf",
    lastModified: Date.now(),
  });

  const shareData: ShareData = {
    title: "Dekont PDF",
    files: [file],
  };

  const canShareFile =
    isAppleMobile() &&
    typeof navigator.share === "function" &&
    (typeof navigator.canShare !== "function" || navigator.canShare(shareData));

  if (canShareFile) {
    try {
      await navigator.share(shareData);
      return;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
    }
  }

  downloadPdf(url, filename);
}

function placeholderWindow() {
  let closed = false;
  const location = { href: "about:blank" };
  return {
    get closed() {
      return closed;
    },
    close() {
      closed = true;
    },
    location,
  } as unknown as Window;
}

window.open = ((url?: string | URL, target?: string, features?: string) => {
  const href = url == null ? "" : String(url);

  if (href === "about:blank" && target === "_blank") {
    pendingReceiptPdf = true;
    return placeholderWindow();
  }

  return nativeWindowOpen(url as any, target, features);
}) as typeof window.open;

URL.createObjectURL = ((object: Blob | MediaSource) => {
  const url = nativeCreateObjectURL(object);

  if (pendingReceiptPdf && object instanceof Blob && object.type === "application/pdf") {
    pendingReceiptPdf = false;
    void saveReceiptPdf(object, url);
  }

  return url;
}) as typeof URL.createObjectURL;

export {};
