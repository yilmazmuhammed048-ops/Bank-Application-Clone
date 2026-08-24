export {};

type ArchiveView = {
  time: string;
  amount: string;
  lines: string[];
};

const ARCHIVE_VIEWS: ArchiveView[] = [
  {
    time: "18:30",
    amount: "-350,00 TL",
    lines: [
      "SANAL POS ALIŞVERİŞ KART NO:",
      "5124 **** **** 0162 İŞYERİ: YEMEKPAY/",
      "YEMEK SEPET MUTABAKAT: 5508756",
    ],
  },
  {
    time: "13:34",
    amount: "-2.600,00 TL",
    lines: [
      "POS ALIŞVERİŞ KART NO: 5124 ****",
      "**** 0162 İŞYERİ: M JET YUREGIR",
      "ADANA P MUTABAKAT: 3910060",
    ],
  },
  {
    time: "04:08",
    amount: "-2.900,00 TL",
    lines: [
      "POS ALIŞVERİŞ KART NO: 5124 ****",
      "**** 0162 İŞYERİ: KONAK STONE",
      "HOUSE MUTABAKAT: 8630012",
    ],
  },
  {
    time: "03:23",
    amount: "-3.672,00 TL",
    lines: [
      "POS ALIŞVERİŞ KART NO: 5124 ****",
      "**** 0162 İŞYERİ: ALTINOLUK",
      "SUPERMARKET MUTABAKAT: 85385...",
    ],
  },
  {
    time: "21:18",
    amount: "-10.000,00 TL",
    lines: ["FERDİ ERKAN Ziraat Mobil Havale"],
  },
  {
    time: "19:29",
    amount: "-990,00 TL",
    lines: [
      "POS ALIŞVERİŞ KART NO: 5124 ****",
      "**** 0162 İŞYERİ: EMRECAN BUFE",
      "MUTABAKAT: 9414914",
    ],
  },
  {
    time: "19:04",
    amount: "-48.000,00 TL",
    lines: ["FEVZİ MUTLU Ziraat Mobil Havale"],
  },
];

function findDetailsBox(row: HTMLElement) {
  return Array.from(row.children).find(
    (element): element is HTMLElement =>
      element instanceof HTMLElement && element.querySelector("p") !== null,
  );
}

function findArchiveView(row: HTMLButtonElement) {
  const text = (row.innerText || row.textContent || "").replace(/\s+/g, " ");
  return ARCHIVE_VIEWS.find(
    (item) => text.includes(item.time) && text.includes(item.amount),
  );
}

function normalize(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function compactMovementDetails(row: HTMLButtonElement, archive?: ArchiveView) {
  const details = findDetailsBox(row);
  if (!details) return;

  const paragraphs = Array.from(details.querySelectorAll<HTMLParagraphElement>("p"));
  const stored = details.dataset.compactMovementText;
  const source = archive
    ? normalize(archive.lines.join(" "))
    : stored || normalize(paragraphs.map((paragraph) => paragraph.textContent || "").join(" "));

  if (!source) return;
  details.dataset.compactMovementText = source;

  const alreadyCompact =
    paragraphs.length === 1 &&
    paragraphs[0]?.dataset.compactMovement === "true" &&
    normalize(paragraphs[0]?.textContent || "") === source;

  if (alreadyCompact) return;

  const paragraph = document.createElement("p");
  paragraph.dataset.compactMovement = "true";
  paragraph.className = "movement-three-line-text";
  paragraph.textContent = source;
  details.replaceChildren(paragraph);
}

function applyArchiveDisplay() {
  const filter = document.querySelector<HTMLButtonElement>('button[aria-label="Filtre"]');
  const list = filter?.parentElement?.nextElementSibling;
  if (!(list instanceof HTMLElement)) return;

  const rows = Array.from(list.children).filter(
    (element): element is HTMLButtonElement => element instanceof HTMLButtonElement,
  );

  for (const row of rows) {
    if (row.dataset.messageFeeRow === "true") continue;

    const archive = findArchiveView(row);
    compactMovementDetails(row, archive);
  }
}

let scheduled = false;
function scheduleApply() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    applyArchiveDisplay();
  });
}

const observer = new MutationObserver(scheduleApply);
observer.observe(document.documentElement, {
  childList: true,
  subtree: true,
  characterData: true,
});

document.addEventListener("DOMContentLoaded", scheduleApply);
window.addEventListener("storage", scheduleApply);
scheduleApply();

const DEMO_BANNER_ID = "global-demo-test-banner";


function installDemoBanner() {
  if (!document.body || document.getElementById(DEMO_BANNER_ID)) return;

  const banner = document.createElement("div");
  banner.id = DEMO_BANNER_ID;
  banner.textContent = DEMO_LABEL;
  Object.assign(banner.style, {
    position: "fixed",
    top: "0",
    left: "0",
    right: "0",
    zIndex: "2147483647",
    height: "32px",
    lineHeight: "32px",
    textAlign: "center",
    background: "#8b0015",
    color: "#ffffff",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: "13px",
    fontWeight: "800",
    letterSpacing: "0.6px",
    boxShadow: "0 1px 6px rgba(0,0,0,0.28)",
    pointerEvents: "none",
  });

  document.body.appendChild(banner);
  document.body.style.paddingTop = "32px";
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", installDemoBanner, { once: true });
} else {
  installDemoBanner();
}

// Receipt PDFs are drawn using a 1240x1754 logical canvas. Keep every layout
// coordinate unchanged, but give that canvas a 2x backing store so text and
// borders are rasterized at roughly 300 DPI instead of roughly 150 DPI.
const RECEIPT_LOGICAL_WIDTH = 1240;
const RECEIPT_LOGICAL_HEIGHT = 1754;
const RECEIPT_RENDER_SCALE = 2;
const hiDpiReceiptCanvases = new WeakSet<HTMLCanvasElement>();
const scaledReceiptContexts = new WeakSet<HTMLCanvasElement>();

const nativeCreateElement = Document.prototype.createElement;
Document.prototype.createElement = function createElement(
  tagName: string,
  options?: ElementCreationOptions,
) {
  const element = nativeCreateElement.call(this, tagName, options);
  if (!(element instanceof HTMLCanvasElement) || tagName.toLowerCase() !== "canvas") {
    return element;
  }

  const canvas = element;
  const widthDescriptor = Object.getOwnPropertyDescriptor(
    HTMLCanvasElement.prototype,
    "width",
  );
  const heightDescriptor = Object.getOwnPropertyDescriptor(
    HTMLCanvasElement.prototype,
    "height",
  );

  if (
    !widthDescriptor?.get ||
    !widthDescriptor.set ||
    !heightDescriptor?.get ||
    !heightDescriptor.set
  ) {
    return canvas;
  }

  let receiptWidthRequested = false;
  let receiptHeightRequested = false;

  Object.defineProperty(canvas, "width", {
    configurable: true,
    get() {
      return widthDescriptor.get!.call(canvas);
    },
    set(value: number) {
      receiptWidthRequested = Number(value) === RECEIPT_LOGICAL_WIDTH;
      widthDescriptor.set!.call(
        canvas,
        receiptWidthRequested ? RECEIPT_LOGICAL_WIDTH * RECEIPT_RENDER_SCALE : value,
      );
      if (receiptWidthRequested && receiptHeightRequested) {
        hiDpiReceiptCanvases.add(canvas);
      }
    },
  });

  Object.defineProperty(canvas, "height", {
    configurable: true,
    get() {
      return heightDescriptor.get!.call(canvas);
    },
    set(value: number) {
      receiptHeightRequested = Number(value) === RECEIPT_LOGICAL_HEIGHT;
      heightDescriptor.set!.call(
        canvas,
        receiptHeightRequested ? RECEIPT_LOGICAL_HEIGHT * RECEIPT_RENDER_SCALE : value,
      );
      if (receiptWidthRequested && receiptHeightRequested) {
        hiDpiReceiptCanvases.add(canvas);
      }
    },
  });

  const nativeGetContext = canvas.getContext.bind(canvas);
  canvas.getContext = ((contextId: string, contextAttributes?: any) => {
    const context = nativeGetContext(contextId as any, contextAttributes as any) as any;
    if (
      contextId === "2d" &&
      context &&
      hiDpiReceiptCanvases.has(canvas) &&
      !scaledReceiptContexts.has(canvas)
    ) {
      context.scale(RECEIPT_RENDER_SCALE, RECEIPT_RENDER_SCALE);
      scaledReceiptContexts.add(canvas);
    }
    return context;
  }) as typeof canvas.getContext;

  return canvas;
} as typeof Document.prototype.createElement;

const stampedCanvases = new WeakSet<HTMLCanvasElement>();

function stampDemoCanvas(canvas: HTMLCanvasElement) {
  if (stampedCanvases.has(canvas)) return;
  const context = canvas.getContext("2d");
  if (!context) return;

  // Stamping uses physical backing-store pixels. Resetting the transform keeps
  // the DEMO markings the same visual size even on the 2x receipt canvas.
  context.save();
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.translate(canvas.width / 2, canvas.height / 2);
  context.rotate(-Math.PI / 7);
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.globalAlpha = 0.17;
  context.fillStyle = "#b00020";
  const fontSize = Math.max(46, Math.floor(canvas.width * 0.09));
  context.font = `800 ${fontSize}px Arial, Helvetica, sans-serif`;

  
  context.restore();

  context.save();
  context.setTransform(1, 0, 0, 1, 0, 0);
  const footerHeight = Math.max(58, Math.floor(canvas.height * 0.045));
  context.globalAlpha = 0.95;
  context.fillStyle = "#ffffff";
  context.fillRect(0, canvas.height - footerHeight, canvas.width, footerHeight);
  context.globalAlpha = 1;
  context.fillStyle = "#8b0015";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.font = `800 ${Math.max(22, Math.floor(canvas.width * 0.022))}px Arial, Helvetica, sans-serif`;
  context.fillText(
   
    
    canvas.width / 2,
    canvas.height - footerHeight / 2,
    canvas.width * 0.94,
  );
  context.restore();

  stampedCanvases.add(canvas);
}

const nativeToDataURL = HTMLCanvasElement.prototype.toDataURL;
HTMLCanvasElement.prototype.toDataURL = function (
  type?: string,
  quality?: any,
) {
  stampDemoCanvas(this);
  const outputQuality =
    type?.toLowerCase() === "image/jpeg" ? 1 : quality;
  return nativeToDataURL.call(this, type, outputQuality);
};

const nativeToBlob = HTMLCanvasElement.prototype.toBlob;
HTMLCanvasElement.prototype.toBlob = function (
  callback: BlobCallback,
  type?: string,
  quality?: any,
) {
  stampDemoCanvas(this);
  const outputQuality =
    type?.toLowerCase() === "image/jpeg" ? 1 : quality;
  return nativeToBlob.call(this, callback, type, outputQuality);
};
