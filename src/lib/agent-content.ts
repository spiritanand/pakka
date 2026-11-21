import { ensureMigrated } from "./auth";
import { trustReport } from "./trust-report";

export const SITE = "https://pakka.zwala.dev";
const DEMO_PAN = "CHVPP4321L";

async function sampleResponse() {
  await ensureMigrated();
  const r = trustReport(DEMO_PAN, 1);
  const body = r
    ? { name: r.subject.name, pan: r.subject.pan, score: r.score, band: r.band, breakdown: r.breakdown, vouched_by: r.vouched_by }
    : { name: "Priya (design studio)", pan: "CHVXXXX21L", score: 695, band: "Reliable" };
  return JSON.stringify(body, null, 2);
}

export async function landingMarkdown() {
  return `# Pakka: the money waits until the work is done

> Pakka links for freelance deals made on WhatsApp and Instagram DMs. The client pays up front, Razorpay holds the money, and the freelancer gets it on delivery. Every finished deal builds a 0–1000 trust score both sides carry.

Canonical URL: ${SITE}/
Markdown twin: ${SITE}/index.md
LLM index: ${SITE}/llms.txt
Status: demo on Razorpay test mode. No real money moves.

## How it works

1. **Agree what done means.** The freelancer creates a Pakka link with milestones, a price, a deadline and a short checklist per milestone.
2. **The client pays up front.** Payment goes through Razorpay and is held as a Razorpay Route transfer on hold. The freelancer starts when the deal says "Held by Razorpay".
3. **Deliver and get paid.** The freelancer submits the work and ticks every checklist item. The client accepts, or ticks what's missing (one revision round). If the client stays silent for 72 hours, the money is paid out automatically.
4. **Missed deadline.** If nothing is delivered by the deadline, the hold is reversed and the client is refunded in full.

## Trust score (0–1000)

Built only from money-verified outcomes.

| Band | Range |
|---|---|
| New | 0–299 |
| Building | 300–599 |
| Reliable | 600–799 |
| Trusted | 800+ |

- Delivered and paid milestones raise it (at most 3 deals with the same counterparty count).
- Missing a deadline costs 300.
- A client who lets a payment auto-release by staying silent loses 40.
- Vouches add up to 200, weighted by the voucher's own score.
- Vouching has a cost: if someone you vouched for misses a deadline, you lose 150.

## Trust API

\`GET ${SITE}/api/trust/{PAN or Pakka user id}\` returns JSON. No authentication.

\`\`\`bash
curl ${SITE}/api/trust/${DEMO_PAN}
\`\`\`

\`\`\`json
${await sampleResponse()}
\`\`\`

Fields: \`score\` (0–1000), \`band\`, \`breakdown\` (identity, track, reliability, penalties, cascade, vouches), \`stats\`, \`vouched_by\`, \`recent_outcomes\`. Unknown subjects return 404 with \`{"status":"unknown"}\`.

## What Pakka is not

Pakka doesn't find you work. There is no marketplace, bidding or profile ranking. You agree the deal on WhatsApp; the link handles the money.

## Actions

- [Create a Pakka link](${SITE}/login?next=/new)
- [Try the demo](${SITE}/login)
- [Sign in](${SITE}/login?mode=signin)

Built for the Razorpay Fix My Itch buildathon, Bengaluru, November 2026.
`;
}

export function llmsTxt() {
  return `# Pakka

> Pakka links hold a client's payment on Razorpay until the freelancer delivers, and turn every finished deal into a 0–1000 trust score. Demo on Razorpay test mode.

## Docs

- [Landing page (markdown)](${SITE}/index.md): what Pakka does, how money moves, how the trust score works
- [Trust API](${SITE}/index.md#trust-api): GET ${SITE}/api/trust/{PAN or user id} returns a subject's score, band, breakdown and vouches as JSON

## Actions

- [Create a Pakka link](${SITE}/login?next=/new)
- [Try the demo](${SITE}/login)
`;
}
