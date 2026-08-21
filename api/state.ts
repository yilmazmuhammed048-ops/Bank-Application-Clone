import { get, put } from "@vercel/blob";

type State = {
  account: Record<string, unknown>;
  transactions: unknown[];
};

const STATE_PATH = "bank-demo/state.json";

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

const ADMIN_ORIGIN = "https://banka-yonetim-paneli.vercel.app";
const APP_ORIGIN = "https://bank-application-clone-mockup-sandb.vercel.app";

function setCors(req: any, res: any) {
  const origin = req.headers?.origin;
  if (origin === ADMIN_ORIGIN || origin === APP_ORIGIN) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store, max-age=0");
}

async function readState(): Promise<State> {
  const result = await get(STATE_PATH, {
    access: "private",
  });

  if (!result || result.statusCode !== 200 || !result.stream) {
    return initial;
  }

  try {
    const text = await new Response(result.stream).text();
    const parsed = JSON.parse(text);
    return {
      account:
        parsed?.account && typeof parsed.account === "object"
          ? parsed.account
          : initial.account,
      transactions: Array.isArray(parsed?.transactions)
        ? parsed.transactions
        : initial.transactions,
    };
  } catch {
    return initial;
  }
}

async function writeState(state: State) {
  await put(STATE_PATH, JSON.stringify(state), {
    access: "private",
    allowOverwrite: true,
    contentType: "application/json; charset=utf-8",
  });
}

export default async function handler(req: any, res: any) {
  setCors(req, res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method === "GET") {
    try {
      const state = await readState();
      return res.status(200).json(state);
    } catch (error) {
      console.error("Blob read failed", error);
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
      const next: State = {
        account:
          body.account && typeof body.account === "object"
            ? body.account
            : current.account,
        transactions: Array.isArray(body.transactions)
          ? body.transactions
          : current.transactions,
      };

      await writeState(next);
      return res.status(200).json({ ok: true, ...next });
    } catch (error) {
      console.error("Blob write failed", error);
      return res.status(500).json({ error: "State write failed" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
