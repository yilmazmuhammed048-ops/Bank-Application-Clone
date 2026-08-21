import { get, list, put } from "@vercel/blob";

type State = {
  account: Record<string, unknown>;
  transactions: unknown[];
};

const STATE_PREFIX = "bank-demo/state-";
const ADMIN_ORIGIN = "https://banka-yonetim-paneli.vercel.app";
const APP_ORIGIN = "https://bank-application-clone-mockup-sandb.vercel.app";

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

async function streamToText(stream: any): Promise<string> {
  let text = "";
  for await (const chunk of stream) {
    text += typeof chunk === "string" ? chunk : chunk.toString("utf8");
  }
  return text;
}

async function readState(): Promise<State> {
  const result = await list({ prefix: STATE_PREFIX, limit: 1000 });
  const blobs = Array.isArray(result.blobs) ? result.blobs : [];
  if (blobs.length === 0) return initial;

  const latest = blobs
    .slice()
    .sort((a: any, b: any) => {
      const aTime = new Date(a.uploadedAt ?? 0).getTime();
      const bTime = new Date(b.uploadedAt ?? 0).getTime();
      if (aTime !== bTime) return bTime - aTime;
      return String(b.pathname).localeCompare(String(a.pathname));
    })[0];

  if (!latest) return initial;

  const blob = await get(latest.pathname, { access: "private" });
  if (!blob || blob.statusCode !== 200 || !blob.stream) return initial;

  try {
    return normalizeState(JSON.parse(await streamToText(blob.stream)));
  } catch {
    return initial;
  }
}

async function writeState(state: State) {
  const pathname = `${STATE_PREFIX}${Date.now()}-${Math.random().toString(36).slice(2)}.json`;
  await put(pathname, JSON.stringify(state), {
    access: "private",
    contentType: "application/json",
  });
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
      const body = req.body ?? {};
      const next = normalizeState({
        account: body.account,
        transactions: body.transactions,
      });

      await writeState(next);
      return res.status(200).json({ ok: true, ...next });
    } catch {
      return res.status(500).json({ error: "State write failed" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
