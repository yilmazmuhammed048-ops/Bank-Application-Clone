type State = { account: Record<string, unknown>; transactions: unknown[] };

const initial: State = {
  account: { name: "Muhammed Yılmaz", balance: "125000" },
  transactions: [],
};

const g = globalThis as typeof globalThis & { __BANK_STATE__?: State };
g.__BANK_STATE__ ??= initial;

export default function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method === "GET") return res.status(200).json(g.__BANK_STATE__);
  if (req.method === "POST") {
    const body = req.body || {};
    g.__BANK_STATE__ = {
      account: body.account && typeof body.account === "object" ? body.account : g.__BANK_STATE__!.account,
      transactions: Array.isArray(body.transactions) ? body.transactions : g.__BANK_STATE__!.transactions,
    };
    return res.status(200).json({ ok: true, ...g.__BANK_STATE__ });
  }
  return res.status(405).json({ error: "Method not allowed" });
}
