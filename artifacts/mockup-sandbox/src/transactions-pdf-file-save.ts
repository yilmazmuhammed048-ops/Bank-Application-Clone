const nativeCreateObjectURL = URL.createObjectURL.bind(URL);
const nativeRevokeObjectURL = URL.revokeObjectURL.bind(URL);
const nativeAnchorClick = HTMLAnchorElement.prototype.click;

const pdfBlobs = new Map<string, Blob>();

URL.createObjectURL = ((object: Blob | MediaSource) => {
  const url = nativeCreateObjectURL(object);
  if (object instanceof Blob && object.type === "application/pdf") {
    pdfBlobs.set(url, object);
  }
  return url;
}) as typeof URL.createObjectURL;

URL.revokeObjectURL = ((url: string) => {
  pdfBlobs.delete(url);
  nativeRevokeObjectURL(url);
}) as typeof URL.revokeObjectURL;

function isAppleMobile() {
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

HTMLAnchorElement.prototype.click = function () {
  const filename = this.download || "";
  const blob = pdfBlobs.get(this.href);
  const isStatementPdf =
    filename.startsWith("Hesap_Hareketleri_") &&
    filename.toLowerCase().endsWith(".pdf") &&
    blob?.type === "application/pdf";

  if (isStatementPdf && blob && isAppleMobile() && typeof navigator.share === "function") {
    const file = new File([blob], filename, {
      type: "application/pdf",
      lastModified: Date.now(),
    });
    const shareData: ShareData = {
      title: "Hesap Hareketleri",
      files: [file],
    };
    const canShareFile =
      typeof navigator.canShare !== "function" || navigator.canShare(shareData);

    if (canShareFile) {
      void navigator.share(shareData).catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        nativeAnchorClick.call(this);
      });
      return;
    }
  }

  nativeAnchorClick.call(this);
};

export {};
