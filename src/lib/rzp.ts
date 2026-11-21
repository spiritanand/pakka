const BASE = "https://api.razorpay.com/v1";

function authHeader() {
  const id = process.env.RAZORPAY_KEY_ID;
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!id || !secret) throw new Error("RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET missing in .env.local");
  return "Basic " + Buffer.from(`${id}:${secret}`).toString("base64");
}

async function call<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(BASE + path, {
    method,
    headers: { Authorization: authHeader(), "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Razorpay ${method} ${path} ${res.status}: ${JSON.stringify(json.error ?? json)}`);
  return json as T;
}

export const linkedAccount = () => {
  const acc = process.env.RAZORPAY_LINKED_ACCOUNT;
  if (!acc) throw new Error("RAZORPAY_LINKED_ACCOUNT missing in .env.local");
  return acc;
};

export type PaymentLink = { id: string; short_url: string; status: string; payments?: { payment_id: string; status: string }[] };
export type Transfer = { id: string; status: string; on_hold: boolean; amount: number; settlement_status?: string; amount_reversed?: number };

export const rzp = {
  createPaymentLink: (p: { amount: number; description: string; reference_id: string; callback_url: string }) =>
    call<PaymentLink>("POST", "/payment_links", { ...p, currency: "INR", callback_method: "get", reminder_enable: false }),
  getPaymentLink: (id: string) => call<PaymentLink>("GET", `/payment_links/${id}`),
  holdTransfer: (paymentId: string, amount: number, notes: Record<string, string>) =>
    call<{ items: Transfer[] }>("POST", `/payments/${paymentId}/transfers`, {
      transfers: [{ account: linkedAccount(), amount, currency: "INR", on_hold: true, notes }],
    }),
  getTransfer: (id: string) => call<Transfer>("GET", `/transfers/${id}`),
  release: (id: string) => call<Transfer>("PATCH", `/transfers/${id}`, { on_hold: false }),
  reverse: (id: string, amount: number) => call<{ id: string }>("POST", `/transfers/${id}/reversals`, { amount }),
  refund: (paymentId: string, amount: number) =>
    call<{ id: string }>("POST", `/payments/${paymentId}/refund`, { amount, speed: "normal" }),
};
