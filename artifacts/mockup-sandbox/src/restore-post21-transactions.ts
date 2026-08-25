export {};

const SHARED_API = "https://banka-yonetim-paneli.vercel.app/api/state";
const hostname = window.location.hostname.toLowerCase();
const isAdminHost = hostname.startsWith("banka-yonetim-paneli");
const isAdminPath = window.location.pathname === "/admin" || window.location.pathname === "/admin/";
const isAdminRoute = isAdminHost || isAdminPath;

const RESTORED_TRANSACTIONS = [
  {
    id: 1787326200000,
    title: "Kart Ödemesi",
    description: "SANAL POS ALIŞVERİŞ KART NO: 5124 **** **** 0162 İŞYERİ: YEMEKPAY/YEMEK SEPET MUTABAKAT: 5508756",
    amount: "350,00",
    date: "21 Ağustos 2026",
    time: "18:30",
    recipientName: "YEMEKPAY / YEMEK SEPET",
    recipientIban: "",
    recipientBank: "Sanal POS Alışveriş",
    transactionNumber: "ARCHIVE-20260821-1830-350",
    type: "expense",
  },
  {
    id: 1787308440000,
    title: "Kart Ödemesi",
    description: "POS ALIŞVERİŞ KART NO: 5124 **** **** 0162 İŞYERİ: M JET YUREGIR ADANA P MUTABAKAT: 3910060",
    amount: "2.600,00",
    date: "21 Ağustos 2026",
    time: "13:34",
    recipientName: "M JET YUREGIR ADANA P",
    recipientIban: "",
    recipientBank: "POS Alışveriş",
    transactionNumber: "ARCHIVE-20260821-1334-2600",
    type: "expense",
  },
  {
    id: 1787274480000,
    title: "Kart Ödemesi",
    description: "POS ALIŞVERİŞ KART NO: 5124 **** **** 0162 İŞYERİ: KONAK STONE HOUSE MUTABAKAT: 8630012",
    amount: "2.900,00",
    date: "21 Ağustos 2026",
    time: "04:08",
    recipientName: "KONAK STONE HOUSE",
    recipientIban: "",
    recipientBank: "POS Alışveriş",
    transactionNumber: "ARCHIVE-20260821-0408-2900",
    type: "expense",
  },
  {
    id: 1787271780000,
    title: "Kart Ödemesi",
    description: "POS ALIŞVERİŞ KART NO: 5124 **** **** 0162 İŞYERİ: ALTINOLUK SUPERMARKET MUTABAKAT: 85385...",
    amount: "3.672,00",
    date: "21 Ağustos 2026",
    time: "03:23",
    recipientName: "ALTINOLUK SUPERMARKET",
    recipientIban: "",
    recipientBank: "POS Alışveriş",
    transactionNumber: "ARCHIVE-20260821-0323-3672",
    type: "expense",
  },
  {
    id: 1787634840000,
    title: "FAST Giden",
    description: "0046 - AKBANK/TR200004600563888000491744 yasin ışıldak — İşlem açıklaması",
    amount: "10.000,00",
    date: "25 Ağustos 2026",
    time: "05:14",
    recipientName: "YASİN IŞILDAK",
    recipientIban: "TR200004600563888000491744",
    recipientBank: "AKBANK",
    transactionNumber: "RESTORED-20260825-0514-10000",
    type: "expense",
  },
  {
    id: 1787700540000,
    title: "FAST Gelen",
    description: "FAST PARA TRANSFERİ",
    amount: "8.600,00",
    date: "25 Ağustos 2026",
    time: "23:29",
    recipientName: "GELEN FAST",
    recipientIban: "",
    recipientBank: "FAST",
    transactionNumber: "RESTORED-20260825-2329-8600",
    type: "income",
  },
];

function transactionKey(transaction: any) {
  return String(
    transaction?.transactionNumber ??
      transaction?.id ??
      `${transaction?.date ?? ""}|${transaction?.time ?? ""}|${transaction?.amount ?? ""}|${transaction?.title ?? ""}`,
  );
}

function isSharedStateGet(input: RequestInfo | URL, init?: RequestInit) {
  const method = String(init?.method || (input instanceof Request ? input.method : "GET")).toUpperCase();
  if (method !== "GET") return false;
  const url = typeof input === "string" ? input : input instanceof Request ? input.url : input.toString();
  return url.startsWith(SHARED_API);
}

if (!isAdminRoute) {
  const previousFetch = window.fetch.bind(window);

  window.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const response = await previousFetch(input, init);
    if (!response.ok || !isSharedStateGet(input, init)) return response;

    try {
      const data = await response.clone().json();
      const merged = new Map<string, any>();
      for (const transaction of Array.isArray(data?.transactions) ? data.transactions : []) {
        merged.set(transactionKey(transaction), transaction);
      }
      for (const transaction of RESTORED_TRANSACTIONS) {
        if (!merged.has(transactionKey(transaction))) {
          merged.set(transactionKey(transaction), transaction);
        }
      }

      const headers = new Headers(response.headers);
      headers.delete("content-length");
      return new Response(
        JSON.stringify({ ...data, transactions: Array.from(merged.values()) }),
        {
          status: response.status,
          statusText: response.statusText,
          headers,
        },
      );
    } catch {
      return response;
    }
  }) as typeof window.fetch;
}
