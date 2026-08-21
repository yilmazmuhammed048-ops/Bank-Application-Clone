declare const fetch: any;
declare const process: any;

type State = {
  account: Record<string, unknown>;
  transactions: unknown[];
};

const STATE_PATH = "bank-demo/state.json";
const ADMIN_ORIGIN = "https://banka-yonetim-paneli.vercel.app";
const APP_ORIGIN = "https://bank-application-clone-mockup-sandb.vercel.app";
const BLOB_API_VERSION = "12";

const initial: State = {
  account: {
    name: "Muhammed Yılmaz",
    iban: "TR00 0000 0000 0000 0000 0000 00",
    accountNumber: "00000000",
    balance: "125000",
    cardNumber: "0000 0000 0000 0000",
    cardLimit: "50000",
    phone: "05XX XXX XX XX",
  },
  transactions: [],
};

function setCors(req: any, res: any) {
  const origin = req.headers?.origin;
  if (origin === ADMIN_ORIGIN || origin === APP_ORIGIN) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store");
}

function normalizeState(value: any): State {
  return {
    account:
      value?.account && typeof value.account === "object"
        ? value.account
        : initial.account,
    transactions: Array.isArray(value?.transactions)
      ? value.transactions
      : initial.transactions,
  };
}

function blobAuth() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) throw new Error("BLOB_READ_WRITE_TOKEN is missing");

  const parts = String(token).split("_");
  const storeId = parts[3] || "";
  if (!storeId) throw new Error("Blob store id could not be read from token");

  return { token, storeId };
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

  return normalizeState(JSON.parse(await response.text()));
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
    if (req.headers?.origin && req.headers.origin !== ADMIN_ORIGIN) {
      return res.status(403).json({ error: "Forbidden origin" });
    }

    try {
      const current = await readState();
      const body = req.body ?? {};
      const next = normalizeState({
        account:
          body.account && typeof body.account === "object"
            ? body.account
            : current.account,
        transactions: Array.isArray(body.transactions)
          ? body.transactions
          : current.transactions,
      });

      await writeState(next);
      return res.status(200).json({ ok: true, ...next });
    } catch {
      return res.status(500).json({ error: "State write failed" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
