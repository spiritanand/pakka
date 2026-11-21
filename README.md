# Pakka

Pay links that hold the money until the work lands.

A freelancer sends a Pakka link on WhatsApp. The client pays the full milestone up front, the money waits with Razorpay (a Route transfer on hold), and it moves when the work is delivered:

- Client accepts → freelancer is paid.
- Client stays silent for 72 hours after delivery → freelancer is paid.
- Nothing delivered by the deadline → client is refunded in full.

Every finished deal builds a 0–1000 trust score for both sides. Vouches carry weight, and a cost: if someone you vouched for misses a funded deadline, your score drops too.

Built for the Razorpay Fix My Itch buildathon (Bengaluru, November 2026) on the itch *"Why do freelancers ghost projects after partial payments without accountability systems?"*. Runs on Razorpay test mode.

## For agents

- `GET /api/trust/{PAN or user id}` returns a score, its breakdown and vouches as JSON.
- `/index.md` and `/llms.txt` describe the product; `curl -H "Accept: text/markdown" https://pakka.zwala.dev` returns markdown.

## Run locally

```bash
pnpm install
cp .env.local.example .env.local   # Razorpay test keys, linked account id, auth secret
pnpm dev
curl -X POST -H 'x-seed: 1' localhost:3000/api/dev/seed   # demo data
```

Stack: Next.js 16, React 19, Tailwind v4, motion, better-auth, SQLite (Turso for production), Razorpay Route.
