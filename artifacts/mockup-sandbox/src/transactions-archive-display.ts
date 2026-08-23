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
    description:
      "SANAL POS ALIŞVERİŞ KART NO: 5124 **** **** 0162 İŞYERİ: YEMEKPAY/YEMEK SEPET MUTABAKAT: 5508756",
    balance: "30.798,92 TL",
  },
  {
    time: "13:34",
    amount: "-2.600,00 TL",
    description:
      "POS ALIŞVERİŞ KART NO: 5124 **** **** 0162 İŞYERİ: M JET YUREGIR ADANA P MUTABAKAT: 3910060",
    balance: "31.148,92 TL",
  },
  {
    time: "04:08",
    amount: "-2.900,00 TL",
    description:
      "POS ALIŞVERİŞ KART NO: 5124 **** **** 0162 İŞYERİ: KONAK STONE HOUSE MUTABAKAT: 8630012",
    balance: "33.748,92 TL",
  },
  {
    time: "03:23",
    amount: "-3.672,00 TL",
    description:
      "POS ALIŞVERİŞ KART NO: 5124 **** **** 0162 İŞYERİ: ALTINOLUK SUPERMARKET MUTABAKAT: 85385...",
    balance: "36.648,92 TL",
  },
  {
    time: "21:18",
    amount: "-10.000,00 TL",
    description: "FERDİ ERKAN Ziraat Mobil Havale",
    balance: "40.320,92 TL",
  },
  {
    time: "19:29",
    amount: "-990,00 TL",
    description:
      "POS ALIŞVERİŞ KART NO: 5124 **** **** 0162 İŞYERİ: EMRECAN BUFE MUTABAKAT: 9414914",
    balance: "50.320,92 TL",
  },
  {
    time: "19:04",
    amount: "-48.000,00 TL",
    description: "FEVZİ MUTLU Ziraat Mobil Havale",
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
      details.replaceChildren();
      details.dataset.archiveDescription = archive.description;
      details.className = "min-w-0 flex-1 py-[12px] pl-3 pr-[106px]";

      const description = document.createElement("p");
      description.className =
        "line-clamp-3 text-[11px] font-medium leading-[1.28] tracking-[0.005em] text-[#3f484e]";
      description.textContent = archive.description;
      details.appendChild(description);
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
