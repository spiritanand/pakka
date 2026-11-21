# Pakka copy deck

Every user-facing string, by screen. `[LOCKED]` = used by the e2e test, keep exact. `[NEED]` = confirm first.

## Voice

- Write like a freelancer explaining it to a friend on WhatsApp. Short sentences, plain words.
- Say what happens to the money, in order: client pays, Razorpay holds it, freelancer delivers, money moves.
- Use the product's real numbers: 72 hours, 48 hours, 300, 150, 0 to 1000.
- Sentence case. No exclamation marks. No em dashes in UI copy.
- "You" is the freelancer on the landing page and `/new`. In the deal room, address the person looking: "you" plus the other side's first name. Only a visitor who is neither party reads "the client" / "the freelancer". No gendered pronouns ("if they say nothing").

| Use | Not |
|---|---|
| Pakka link | protected deal, pay link |
| held by Razorpay, on hold | escrow, secured, locked, guaranteed |
| paid, paid out | disbursed ("released" only on buttons) |
| missed the deadline (sentences), ghosted (labels) | defaulted |
| score, vouch | reputation, rating, endorsement |
| 72 hours (sentences), 72h (chips) | three days |

## Landing page

Sections: 1 Hero · 2 How it works · 3 Trust score (API line folded in) · 4 Final CTA.
Cut: "Fair to both sides" (its lede now leads How it works, its refund fact sits in the hero microcopy), the dark API terminal, the floating Human/Machine toggle, "Same link, other itches", the "What moves it" rules table and the "Not a marketplace" section.

### 1. Hero

- Eyebrow: `Money held by` + Razorpay logo
- Headline: `The money waits until the work is done.`
- Sub: `Send your client a Pakka link. They pay up front, Razorpay holds the money, and you get it when you deliver.`
- Primary CTA: `Create a Pakka link` (goes to `/login?next=/new`)
- Secondary CTA: `Try the demo` (goes to `/login`)
- Everything on the left paints with the HTML. Only the deal mock springs in, with no delay.
- Microcopy: `Miss the deadline and they get a full refund.`

Deal mock:

- aria-label `Example deal: ₹15,000 held by Razorpay` · title `Logo for Kettle & Co. café` · `Milestone 1 of 2` / `Brand identity drafts` · chip `Held by Razorpay` `[LOCKED]` · `₹15,000`
- `Delivered means`: `3 logo directions, PNG + SVG` / `Colour palette with hex codes` / `Editable Figma source shared`
- Note: `Due 28 Nov. If Meera says nothing for 72h after delivery, Rohan is paid.`
- Scores: `Rohan` / `Designer` / 323 / `Building` · `Meera` / `Café owner` / 438 / `Building`

### 2. How it works

- Headline: `How it works`
- Lede: `Someone always has to go first. Now it's Razorpay.`

| Step | Title | Body |
|---|---|---|
| 1 | `Agree what done means` | `A price, a deadline and a short checklist.` |
| 2 | `Your client pays up front` | `Razorpay holds the money. Then you start.` |
| 3 | `Deliver and get paid` | `They accept, or tick what's missing. No reply in 72 hours? You're paid.` |

### 3. Trust score

- Headline: `A score built from real payments`
- Lede: `Finish deals and it goes up. Miss a funded deadline and it drops 300.`
- Bands (bar capped at max-w-2xl, same width as the cascade): `New` 0–299 · `Building` 300–599 · `Reliable` 600–799 · `Trusted` 800+

Cascade, full width at max-w-2xl, heading `One missed deadline, three scores`:

- Sub: `Rohan misses a deadline. Priya vouched for him, so she drops too.`
- Rows: `Rohan` / `Missed a funded deadline` / 323 to 23 (−300) · `Priya` / `Vouched for Rohan` / 695 to 545 (−150) · `Arjun` / `Vouched for by Priya` / 554 to 539 (−15)

Closing line, one muted row:

- `Anyone can check a score:` + mono link `pakka.zwala.dev/api/trust/CHVPP4321L` (goes to `/api/trust/CHVPP4321L`)

### 4. Final CTA

- Headline: `Send a Pakka link before you start.`
- Sub: `Pakka doesn't find you work. It makes sure you get paid for it.`
- Primary CTA: `Create a Pakka link`
- Secondary CTA: `Try the demo`

## Header, footer, metadata

- Page title: `Pakka · Money held by Razorpay until the work is done`
- Meta description: `Your client pays up front, Razorpay holds it, and you're paid when you deliver. Every finished deal builds a 0–1000 trust score.`
- Logo aria-label: `Pakka home`
- Signed out: `Sign in` · button `Create a Pakka link` (goes to `/login?next=/new`)
- Signed in: `Dashboard` · `{name}` (cut at the first ` (`) · `Sign out`
- Footer left: `Money held by Razorpay until the work is done.`
- Footer right: `Test mode. No real money moves.`, preceded on `/` only by the link `View as markdown` (goes to `/index.md`)

## Login

### Left column (both modes)

- Headline (text-3xl / sm:text-4xl): `The money waits until the work is done.`
- Sub: `Your client pays up front. Razorpay holds it until you deliver.`

Demo block, directly under the sub. Left column is vertically centred on the form at lg.

- Heading: `Try the demo, one click:`
- Buttons: `Meera · client` `[LOCKED]` · `Rohan · freelancer` `[LOCKED]` · `Priya · voucher` `[LOCKED]` · `Arjun · freelancer`
- Reset, faint text link at the bottom of the left column: `Reset demo data` / busy `Resetting…`

### Sign up (default)

- Tabs: `Create account` / `Sign in`
- Heading: `Create your account`
- Sub: `Add your PAN and your score starts 60 points higher. A GSTIN adds 40 more.`
- Fields: `Name` · `Email` · `Phone` · `Password` (placeholder `6 characters or more`) · `PAN (optional)` · `GSTIN (optional)`. Other placeholders unchanged.
- Button: `Create account`
- Below: `Already have an account?` link `Sign in`

### Sign in

- Heading: `Welcome back`
- Sub: `Your deals are where you left them.`
- Button: `Sign in`
- Below: `New to Pakka?` link `Create an account`

## Dashboard

- Score chip: `Your score`
- Button: `New deal`
- List heading: `Your deals`
- Empty: `No deals yet. Create one and send the link to your client on WhatsApp.`
- Empty but open links exist: `No deals yet. Open a link below to fund one, or start a new deal.`
- Open list, always below `Your deals`: `Open links` + chip `demo`, row chip `Open to fund`, row meta `from {first name} · {n} milestone(s)`
- Row role: `You're the freelancer` / `You're the client`
- `Reset demo data` sits at the page bottom, right-aligned, as a faint text link

## New deal

- No eyebrow
- Headline: `New deal`
- Sub: `Split the job into milestones and say what done means for each. You'll get a link to send your client.`
- Project: heading `Project` · helper `Your client sees this at the top of the link.` · label `Project title` · placeholder `Shopify store for Meera's brand`
- Milestones: `Milestone 1` / `Milestone 2 (optional)` · helper, milestone 1 only: `Each milestone is funded and paid separately.`
- Labels: `Title` · `Amount (₹)` · `Due in days`
- Placeholders: title `Homepage + product pages` / `Checkout + launch` · amount `15000` · checklist `Homepage live on staging URL` + `3 product pages` / `Razorpay checkout working` + `Store live on custom domain`
- Checklist label: `Delivered means (one item per line)`
- Checklist helper, under milestone 1 only: `One checkable item per line. Your client sends work back by ticking what's missing.`
- Milestone 2 has no wash background; `(optional)` is enough.
- Footer note: `Your client pays nothing until they fund a milestone.`
- Button: `Create Pakka link`
- Error: `Add at least one milestone with an amount and a checklist.`

## Deal room

### Header

- Eyebrow: `Pakka deal`
- Sub: `₹{total} across {n} milestone(s). Razorpay holds each one until it's delivered.`
- Copy button: `Copy Pakka link` / after click `Copied. Paste it in WhatsApp.`
- Score chips: `Freelancer` / `Client`. Freelancer's name links to `/u/<id>` `[LOCKED]`
- No client yet: `Client` · `Joins when they fund the first milestone.`

### Milestone states

| State | Chip | Note |
|---|---|---|
| AGREED, next to fund | `Not funded yet` | `Work starts once this says Held by Razorpay.` |
| AGREED, later | `Not funded yet` | `Fund this when milestone {n} is done.` |
| FUNDING | `Confirming payment…` | |
| FUNDED | `Held by Razorpay` `[LOCKED]` | `Razorpay is holding the money. Work can start.` |
| FUNDED, sent back | `Held by Razorpay` `[LOCKED]` | `Sent back. Fix the items in red and deliver again within 48 hours.` |
| SUBMITTED | `Delivered · in review` `[LOCKED]` | client: `You have 72 hours to accept or send it back. If you say nothing, {freelancer} is paid.` · freelancer: `{client} has 72 hours to reply. If they say nothing, you're paid.` · others: `The client has 72 hours to accept or send it back. No reply means accepted.` |
| RELEASING | `Paying out…` | |
| RELEASED | `Paid out` `[LOCKED]` | |
| REFUNDING | `Refunding…` | |
| REFUNDED | `Refunded to client` `[LOCKED]` | |
| DISPUTED | `Disputed` | `Sent back twice. Razorpay keeps holding the money.` |

Dropped the old 7-day 50/50 split promise; the code doesn't do it.

### Milestone body

- Checklist heading: `Delivered means`
- Work link: `The work: {url}`
- `Deadline`, date only: `26 Nov`
- Review deadline: `Pays out automatically on`, with time: `23 Nov, 3:41 pm`
- `Revision {n}`
- References: `transfer {id}` / `refund {id}`

Outcomes (client / freelancer / others):

- accepted: `You accepted the work.` / `{client} accepted. You've been paid.` / `The client accepted the work.`
- auto_released: `You didn't reply for 72 hours, so {freelancer} was paid.` / `No reply for 72 hours, so you were paid.` / `The client didn't reply for 72 hours, so the freelancer was paid.`
- ghosted: `Nothing was delivered by the deadline, so you were refunded.` / `You missed the deadline, so {client} was refunded.` / `The deadline passed with nothing delivered, so the client was refunded.`

### Actions

Client, not funded:

- `Fund ₹{amount} · held until delivered` `[LOCKED: starts with "Fund ₹"]`. Emerald only on the next milestone to fund, ghost on later ones.
- Signed out: `Sign in to fund` `[LOCKED]`

Freelancer, funded:

- Label: `Where's the work?`
- Placeholder: `Link to the work (staging URL, Figma, Drive…)` `[LOCKED: starts with "Link to the work"]`
- Legend: `Tick each item you delivered`
- Button: `Mark delivered` `[LOCKED]`

Client, in review:

- `Accept and release ₹{amount}`
- Reject label: `Something missing? Tick it.`
- Reject button: `Send back for fixes`
- Helper: `The freelancer gets 48 hours to fix it. Sending it back twice marks it disputed.`

Demo controls (no emoji):

- `Demo: fast-forward past deadline` `[LOCKED: contains "past deadline"]`
- `Demo: fast-forward 72h of client silence` `[LOCKED: contains "72h of client silence"]`

### Score changes

- Eyebrow: `Scores updated`
- Heading: `What this outcome did to trust` `[LOCKED]`
- Reasons unchanged: `Freelancer` · `Client` · `Vouched for {name}` · `Vouched for by {name}`

### Record

- Heading: `Record`
- Sub: `Each line links to a Razorpay reference.`
- Shown only once there is at least one line.
- Lines as `{Name} {text} · ₹{amount}`:
  - FUNDED: `paid for a milestone, now held`
  - DELIVERED: `delivered and was paid`
  - ACCEPTED: `accepted the work and released the money`
  - AUTO_RELEASED: `didn't reply, so the money was released`
  - GHOSTED: `missed the deadline`
  - REFUNDED: `got a full refund`

### Errors (`deals.ts`)

| Current | New |
|---|---|
| Milestone is not awaiting funding | `This milestone is already funded.` |
| You can't fund your own deal | `You can't fund your own deal. Send the link to your client.` |
| Another client owns this deal | `This deal already has a client.` |
| Payment link status: {status} | `Razorpay hasn't confirmed the payment yet (status: {status}).` |
| Only the freelancer can submit | `Only the freelancer can mark this delivered.` |
| Attach evidence for every checklist item | `Tick every checklist item first.` |
| Milestone is not open for submission | `This milestone isn't waiting for delivery.` |
| Tick the checklist item(s) that were not delivered | `Tick at least one missing item.` |

## Trust profile

- Score chip: `Pakka score` · `/1000` · `{n} done · {n} ghosted · {n} vouch(es)`
- Chips, positives only: `PAN checked` · `GSTIN checked`
- Heading: `Where the score comes from`
- Rows, zero rows hidden: `Identity` · `Deals finished` · `On time` · `Missed deadlines` · `Lost through vouches` · `Vouches received` · total `Score`
- Small print: `Only paid deals count. Missing a funded deadline costs 300.`
- Heading: `Vouched for by`
- Empty: `No vouches yet.` (only when the vouch form isn't shown)
- Row: `score {n} · adds +{weight}` and the note in quotes
- `Vouches for: {names}`
- Vouch label: `Vouch for {name}`
- Placeholder: `How do you know their work?` `[LOCKED]`
- Button: `Vouch with my score` `[LOCKED: contains "Vouch"]`
- Helper: `If they miss a funded deadline after this, you lose 150 points.`
- Heading: `Recent outcomes`
- API link: `GET /api/trust/{id}`
- Outcome dates: `2 Sep` (same day-month format as the deal room)
- Empty: `No finished deals yet.`
- Rows: deal title + outcome chip:
  - DELIVERED: `Paid` (emerald)
  - ACCEPTED: `Accepted` (emerald)
  - AUTO_RELEASED: `Paid after silence` (amber)
  - GHOSTED: `Missed deadline` (rose)
  - REFUNDED: `Refunded` (rose)

## Open questions

- `[NEED: pricing]` "Free for freelancers" is out until there's a fee decision.
- "They pay by UPI or card" assumes the Razorpay payment link has both on.
- `Try the demo` assumes it keeps pointing at `/login`.
