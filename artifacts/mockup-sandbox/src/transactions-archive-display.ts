export {};

type ArchiveView = {
  time: string;
  amount: string;
  description: string;
  balance: string;
};

const ARCHIVE_VIEWS: ArchiveView[] = [
  {
    time: "18:30",
    amount: "-350,00 TL",
    description: "YEMEKPAY / YEMEK SEPET — SANAL POS",
    balance: "30.798,92 TL",
  },
  {
    time: "13:34",
    amount: "-2.600,00 TL",
    description: "M JET YUREGIR ADANA P — POS ALIŞVERİŞ",
    balance: "31.148,92 TL",
  },
  {
    time: "04:08",
    amount: "-2.900,00 TL",
    description: "KONAK STONE HOUSE — POS ALIŞVERİŞ",
    balance: "33.748,92 TL",
  },
  {
    time: "03:23",
    amount: "-3.672,00 TL",
    description: "ALTINOLUK SUPERMARKET — POS ALIŞVERİŞ",
    balance: "36.648,92 TL",
  },
  {
    time: "21:18",
    amount: "-10.000,00 TL",
    description: "FERDİ ERKAN — Ziraat Mobil Havale",
    balance: "40.320,92 TL",
  },
  {
    time: "19:29",
    amount: "-990,00 TL",
    description: "EMRECAN BUFE — POS ALIŞVERİŞ",
    balance: "50.320,92 TL",
  },
  {
    time: "19:04",
    amount: "-48.000,00 TL",
    description: "FEVZİ MUTLU — Ziraat Mobil Havale",
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
    if (!archive) continue;

    row.dataset.archiveMovement = "true";

    const details = findDetailsBox(row);
    if (details && details.dataset.archiveDescription !== archive.description) {
      const paragraphs = Array.from(details.querySelectorAll<HTMLParagraphElement>("p"));
      const first = paragraphs[0];

      if (first) {
        first.textContent = archive.description;
        first.classList.remove("line-clamp-1", "line-clamp-3", "truncate");
        first.classList.add("line-clamp-2");
      }

      for (const paragraph of paragraphs.slice(1)) {
        paragraph.style.display = "none";
      }

      details.dataset.archiveDescription = archive.description;
    }

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
