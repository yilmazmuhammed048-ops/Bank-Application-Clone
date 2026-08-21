type State = {
  account: Record<string, unknown>;
  transactions: unknown[];
};

const defaultState: State = {
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

let state: State = globalThis.__BANK_DEMO_STATE__ ?? defaultState;
globalThis.__BANK_DEMO_STATE__ = state;

export default function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();

  if (req.method === "GET") {
    return res.status(200).json(state);
  }

  if (req.method === "POST") {
    const body = req.body ?? {};
    const account = body.account && typeof body.account === "object" ? body.account : state.account;
    const transactions = Array.isArray(body.transactions) ? body.transactions : state.transactions;

    state = { account, transactions };
    globalThis.__BANK_DEMO_STATE__ = state;

    return res.status(200).json({ ok: true, ...state });
  }

  return res.status(405).json({ error: "Method not allowed" });
}

declare global {
  var __BANK_DEMO_STATE__: State | undefined;
}
