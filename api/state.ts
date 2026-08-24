declare const fetch: any;
declare const process: any;

type State = {
  schemaVersion: number;
  account: Record<string, unknown>;
  transactions: unknown[];
};

const STATE_PATH = "bank-demo/state.json";
const BLOB_API_VERSION = "12";
const STATE_SCHEMA_VERSION = 2;

const ORIGINAL_TRANSACTIONS = [
  {
    id: 6,
    title: "FAST Gelen",
    description: "FAST PARA TRANSFERİ",
    amount: "8.750,00",
    date: "18 Ağustos 2026",
    time: "09:41",
    recipientName: "Burak Aydın",
    recipientIban: "TR71 5468 2319 7842 6531 2948 37",
    recipientBank: "Türkiye İş Bankası A.Ş.",
    transactionNumber: "20260818498317",
    type: "income",
  },
  {
    id: 5,
    title: "Kart Ödemesi",
    description: "POS HARCAMASI - MARKET",
    amount: "1.286,45",
    date: "18 Ağustos 2026",
    time: "08:12",
    recipientName: "Güneş Market",
    recipientIban: "TR36 8241 5973 2618 4735 9126 58",
    recipientBank: "Akbank T.A.Ş.",
    transactionNumber: "20260818276194",
    type: "expense",
  },
  {
    id: 4,
    title: "FAST Giden",
    description: "FAST PARA TRANSFERİ",
    amount: "2.350,00",
    date: "17 Ağustos 2026",
    time: "21:06",
    recipientName: "Ece Yalçın",
    recipientIban: "TR58 3174 9628 4513 7862 5941 26",
    recipientBank: "Garanti BBVA",
    transactionNumber: "20260817421683",
    type: "expense",
  },
  {
    id: 3,
    title: "Havale Gelen",
    description: "HAVALE",
    amount: "12.500,00",
    date: "17 Ağustos 2026",
    time: "14:32",
    recipientName: "Mert Karaca",
    recipientIban: "TR24 6931 4857 3126 8495 7312 64",
    recipientBank: "Yapı ve Kredi Bankası A.Ş.",
    transactionNumber: "20260817384621",
    type: "income",
  },
  {
    id: 2,
    title: "Akaryakıt",
    description: "KARTLI ÖDEME",
    amount: "1.950,00",
    date: "16 Ağustos 2026",
    time: "18:46",
    recipientName: "Petrol İstasyonu",
    recipientIban: "TR83 1547 9263 4812 7359 2648 17",
    recipientBank: "QNB",
    transactionNumber: "20260816291847",
    type: "expense",
  },
  {
    id: 1,
    title: "Maaş",
    description: "MAAŞ ÖDEMESİ",
    amount: "35.000,00",
    date: "15 Ağustos 2026",
    time: "09:17",
    recipientName: "Atlas Teknoloji A.Ş.",
    recipientIban: "TR47 9286 3157 8421 6935 2748 61",
    recipientBank: "Türkiye Finans Katılım Bankası A.Ş.",
    transactionNumber: "20260815173594",
    type: "income",
  },
];

const initial: State = {
  schemaVersion: STATE_SCHEMA_VERSION,
  account: {
    name: "Muhammed Yılmaz",
    iban: "TR00 0000 0000 0000 0000 0000 00",
    accountNumber: "00000000",
    balance: "125000",
    cardNumber: "0000 0000 0000 0000",
    cardLimit: "50000",
    phone: "05XX XXX XX XX",
  },
  transactions: ORIGINAL_TRANSACTIONS,
};

function originHost(origin: any) {
  const match = String(origin || "").match(/^https?:\/\/([^/]+)/i);
  return (match?.[1] || "").toLowerCase();
}

function isAdminOrigin(origin: any) {
  const host = originHost(origin);
  return (
    host === "banka-yonetim-paneli.vercel.app" ||
    (host.startsWith("banka-yonetim-paneli-") && host.endsWith(".vercel.app"))
  );
}

function isBankOrigin(origin: any) {
  const host = originHost(origin);
  return (
    host === "bank-application-clone-mockup-sandb.vercel.app" ||
    host === "bank-application-clone-mockup-sandbox-uygulama.vercel.app" ||
    (host.startsWith("bank-application-clone-mockup-sandbox-") && host.endsWith(".vercel.app"))
  );
}

function setCors(req: any, res: any) {
  const origin = req.headers?.origin;
  if (isAdminOrigin(origin) || isBankOrigin(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store");
}

function normalizeState(value: any): State {
  return {
    schemaVersion: Number(value?.schemaVersion) || 0,
    account:
      value?.account && typeof value.account === "object"
        ? value.account
        : initial.account,
    transactions: Array.isArray(value?.transactions)
      ? value.transactions
      : initial.transactions,
  };
}

function transactionKey(transaction: any) {
  const value = transaction?.id ?? transaction?.transactionNumber;
  if (value === undefined || value === null || String(value) === "") return null;
  return String(value);
}

function mergeTransactions(current: unknown[], incoming: unknown[]) {
  const currentKeys = new Set(
    current
      .map((transaction) => transactionKey(transaction))
      .filter((key): key is string => Boolean(key)),
  );
  const incomingKeys = new Set(
    incoming
      .map((transaction) => transactionKey(transaction))
      .filter((key): key is string => Boolean(key)),
  );

  const hasNewTransaction = Array.from(incomingKeys).some(
    (key) => !currentKeys.has(key),
  );

  if (!hasNewTransaction) {
    return incoming;
  }

  const merged = [...incoming];
  for (const transaction of current) {
    const key = transactionKey(transaction);
    if (key && incomingKeys.has(key)) continue;
    merged.push(transaction);
  }

  return merged;
}

function blobAuth() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) throw new Error("BLOB_READ_WRITE_TOKEN is missing");

  const parts = String(token).split("_");
  const storeId = parts[3] || "";
  if (!storeId) throw new Error("Blob store id could not be read from token");

  return { token, storeId };
}

async function writeState(state: State) {
  const { token, storeId } = blobAuth();
  const url = `https://vercel.com/api/blob/?pathname=${encodeURIComponent(STATE_PATH)}`;

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      authorization: `Bearer ${token}`,
      "x-api-version": BLOB_API_VERSION,
      "x-vercel-blob-store-id": storeId,
      "x-vercel-blob-access": "private",
      "x-allow-overwrite": "1",
      "x-add-random-suffix": "0",
      "x-content-type": "application/json",
    },
    body: JSON.stringify(state),
  });

  if (!response.ok) {
    throw new Error(`Blob write failed: ${response.status}`);
  }
}

async function readState(): Promise<State> {
  const { token, storeId } = blobAuth();
  const url = `https://${storeId}.private.blob.vercel-storage.com/${STATE_PATH}?cache=0`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (response.status === 404) return initial;
  if (!response.ok) throw new Error(`Blob read failed: ${response.status}`);

  const current = normalizeState(JSON.parse(await response.text()));

  if (current.schemaVersion !== STATE_SCHEMA_VERSION) {
    const restored: State = {
      schemaVersion: STATE_SCHEMA_VERSION,
      account: current.account,
      transactions: ORIGINAL_TRANSACTIONS,
    };
    await writeState(restored);
    return restored;
  }

  return current;
}

export default async function handler(req: any, res: any) {
  setCors(req, res);

  if (req.method === "OPTIONS") return res.status(204).end();

  if (req.method === "GET") {
    try {
      return res.status(200).json(await readState());
    } catch {
      return res.status(500).json({ error: "State read failed" });
    }
  }

  if (req.method === "POST") {
    if (req.headers?.origin && !isAdminOrigin(req.headers.origin)) {
      return res.status(403).json({ error: "Forbidden origin" });
    }

    try {
      const current = await readState();
      const body = req.body ?? {};
      const next: State = {
        schemaVersion: STATE_SCHEMA_VERSION,
        account:
          body.account && typeof body.account === "object"
            ? body.account
            : current.account,
        transactions: Array.isArray(body.transactions)
          ? mergeTransactions(current.transactions, body.transactions)
          : current.transactions,
      };

      await writeState(next);
      return res.status(200).json({ ok: true, ...next });
    } catch {
      return res.status(500).json({ error: "State write failed" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
