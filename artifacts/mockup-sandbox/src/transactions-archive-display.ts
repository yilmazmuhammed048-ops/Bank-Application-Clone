export {};

type ArchiveView = {
  time: string;
  amount: string;
  lines: string[];
  balance: string;
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
    balance: "30.798,92 TL",
  },
  {
    time: "13:34",
    amount: "-2.600,00 TL",
    lines: [
      "POS ALIŞVERİŞ KART NO: 5124 ****",
      "**** 0162 İŞYERİ: M JET YUREGIR",
      "ADANA P MUTABAKAT: 3910060",
    ],
    balance: "31.148,92 TL",
  },
  {
    time: "04:08",
    amount: "-2.900,00 TL",
    lines: [
      "POS ALIŞVERİŞ KART NO: 5124 ****",
      "**** 0162 İŞYERİ: KONAK STONE",
      "HOUSE MUTABAKAT: 8630012",
    ],
    balance: "33.748,92 TL",
  },
  {
    time: "03:23",
    amount: "-3.672,00 TL",
    lines: [
      "POS ALIŞVERİŞ KART NO: 5124 ****",
      "**** 0162 İŞYERİ: ALTINOLUK",
      "SUPERMARKET MUTABAKAT: 85385...",
    ],
    balance: "36.648,92 TL",
  },
  {
    time: "21:18",
    amount: "-10.000,00 TL",
    lines: ["FERDİ ERKAN Ziraat Mobil Havale"],
    balance: "40.320,92 TL",
  },
  {
    time: "19:29",
    amount: "-990,00 TL",
    lines: [
      "POS ALIŞVERİŞ KART NO: 5124 ****",
      "**** 0162 İŞYERİ: EMRECAN BUFE",
      "MUTABAKAT: 9414914",
    ],
    balance: "50.320,92 TL",
  },
  {
    time: "19:04",
    amount: "-48.000,00 TL",
    lines: ["FEVZİ MUTLU Ziraat Mobil Havale"],
    balance: "51.310,92 TL",
  },
];

function findDetailsBox(row: HTMLElement) {
  return Array.from(row.children).find(
    (element): element is HTMLElement =>
      element instanceof HTMLElement && element.querySelector("p") !== null,
  );
}

function findBalanceBox(row: HTMLElement) {
  return Array.from(row.querySelectorAll<HTMLElement>("div")).find((element) =>
    /Kalan\s+Bakiye/i.test(element.textContent || ""),
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

    if (!archive) continue;

    const balanceBox = findBalanceBox(row);
    if (balanceBox) {
      const spans = Array.from(balanceBox.querySelectorAll("span"));
      const value = spans.at(-1);
      if (value) value.textContent = archive.balance;
    }
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
const DEMO_LABEL = "DEMO / TEST — GERÇEK BANKACILIK İŞLEMİ DEĞİLDİR";

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

const stampedCanvases = new WeakSet<HTMLCanvasElement>();

function stampDemoCanvas(canvas: HTMLCanvasElement) {
  if (stampedCanvases.has(canvas)) return;
  const context = canvas.getContext("2d");
  if (!context) return;

  context.save();
  context.translate(canvas.width / 2, canvas.height / 2);
  context.rotate(-Math.PI / 7);
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.globalAlpha = 0.17;
  context.fillStyle = "#b00020";
  const fontSize = Math.max(46, Math.floor(canvas.width * 0.09));
  context.font = `800 ${fontSize}px Arial, Helvetica, sans-serif`;
  context.fillText("DEMO / TEST", 0, 0, canvas.width * 0.92);
  context.restore();

  context.save();
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
    "DEMO / TEST — GERÇEK BANKACILIK BELGESİ DEĞİLDİR",
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
  return nativeToDataURL.call(this, type, quality);
};

const nativeToBlob = HTMLCanvasElement.prototype.toBlob;
HTMLCanvasElement.prototype.toBlob = function (
  callback: BlobCallback,
  type?: string,
  quality?: any,
) {
  stampDemoCanvas(this);
  return nativeToBlob.call(this, callback, type, quality);
};
