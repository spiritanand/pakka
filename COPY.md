# Pakka copy deck

Every user-facing string, by screen. `[LOCKED]` = used by the e2e test, keep exact. `[NEED]` = confirm first.

## Voice

- Write like a freelancer explaining it to a friend on WhatsApp. Short sentences, plain words.
- Say what happens to the money, in order: client pays, Razorpay holds it, freelancer delivers, money moves.
- Use the product's real numbers: 72 hours, 48 hours, 300, 150, 0 to 1000.
- Sentence case. No exclamation marks. No em dashes in UI copy.
- "You" is the freelancer on `/` and `/new`, and the payer on `/paying`. In the deal room, address the person looking: "you" plus the other side's first name. Only a visitor who is neither party reads "the client" / "the freelancer". No gendered pronouns ("if they say nothing").

| Use | Not |
|---|---|
| Pakka link | protected deal, pay link |
| held by Razorpay, on hold | escrow, secured, locked, guaranteed |
| paid, paid out | disbursed, released |
| missed the deadline (sentences), ghosted (labels) | defaulted, funded deadline |
| score, vouch | reputation, rating, endorsement |
| 72 hours (sentences), 72h (chips) | three days |

## Landing pages

Two pages, one component (`src/app/landing/landing.tsx`): `/` (audience freelancing) and `/paying` (audience paying). The URL is the state.
Sections: 0 Switcher · 1 Hero · 2 How it works · 3 Fair to both sides · 4 Trust score + live API · 5 Final CTA + Ask AI.

### 0. Switcher

- Hairline pill, centred in a band above the hero (not sticky). Two links, active side filled emerald with `aria-current="page"`, 44px tall, full width on mobile.
- Desktop: `I'm freelancing` (goes to `/`) · `I'm paying a freelancer` (goes to `/paying`)
- Mobile: `Freelancing` · `Paying`
- Both audiences' H1, sub and points share one grid cell, so the hero keeps the same height on both pages.

### 1. Hero

- Eyebrow (both): `Money held by` + Razorpay logo
- Deal mock on the right (both), unchanged.

Freelancing (`/`):

- Headline: `Full payment up front. Safe for both of you.`
- Sub: `Send a Pakka link on WhatsApp. Your client pays, Razorpay holds it. You're paid when they accept, or after 72 hours of silence. Nothing delivered by the deadline, full refund.`
- Points: `Get the full amount locked in before you start.` · `Client goes quiet? You're paid after 72 hours.` · `Every finished deal raises your trust score.`
- Primary CTA: `Create a Pakka link` (goes to `/login?next=/new`) · Secondary CTA: `Try the demo` (goes to `/login`)
- Microcopy (text-muted): `Free to try. Your client doesn't need an account to look.`

Paying (`/paying`):

- Page title: `Pakka: pay a freelancer up front, safely`
- Meta description: `Your money goes to Razorpay, not the freelancer. It's released when you accept the work, and you get all of it back if nothing is delivered by the deadline.`
- Headline: `Pay up front. Get it all back if nothing is delivered.`
- Sub: `Your money goes to Razorpay, not to the freelancer. It's released when you accept the work. Nothing delivered by the deadline, you get all of it back.`
- Points: `Razorpay holds your money, not the freelancer.` · `You both agree on a checklist before you pay, so 'done' is clear.` · `You get 72 hours to check the work. Say nothing and it counts as accepted.`
- Primary CTA: `See how a deal works` (goes to `/login`)
- Plain text beside it: `Got a Pakka link? Open it to review the deal and pay.`

Deal mock:

- aria-label `Example deal: ₹15,000 held by Razorpay` · title `Logo for Kettle & Co. café` · `Milestone 1 of 2` / `Brand identity drafts` · chip `Held by Razorpay` `[LOCKED]` · `₹15,000`
- `Delivered means`: `3 logo directions, PNG + SVG` / `Colour palette with hex codes` / `Editable Figma source shared`
- Note, last thing on the card: `Due 28 Nov. If Meera says nothing for 72h after delivery, Rohan is paid.`
- Starts at opacity 0.6, y 8 so it reads on the first frame.

### 2. How it works

- Headline only: `A deal neither side can ghost.`

| Step | Freelancing | Paying |
|---|---|---|
| 1 | `Agree what done means` / `A price, a deadline, a short checklist.` | same |
| 2 | `Your client pays up front` / `Razorpay holds the money while you work.` | `You pay up front` / `Razorpay holds the money while they work.` |
| 3 | `Deliver and get paid` / `No reply in 72 hours? You're paid anyway.` | `Check the work` / `Accept it and they're paid. Nothing delivered by the deadline? You get it all back.` |

### 3. Fair to both sides

- Headline: `Fair to both sides` · Lede: `Neither of you has to go first on trust.`
- Two columns, the reader's own first, with chip `You`.
- `If you're freelancing`: `The full amount is held before you start.` · `Paid when they accept, or after 72 hours of silence.` · `The checklist is agreed up front, so 'done' can't keep moving.`
- `If you're paying`: `Your money sits with Razorpay, not the freelancer.` · `Nothing delivered by the deadline, you get all of it back.` · `72 hours to check the work against the checklist.`

### 4. Trust score + live API

- Headline: `A score built from real payments`
- Lede, freelancing: `Finish deals and it goes up. Miss a deadline and it drops 300. So does anyone who vouched for you, by 150.`
- Lede, paying: `Every freelancer has one, built from real payments. Miss a deadline and it drops 300. So does anyone who vouched for them, by 150.`
- Cascade rows: `Rohan` / `Missed the deadline` / 323 to 23 (−300) · `Priya` / `Vouched for Rohan` / 695 to 545 (−150)
- Below a hairline, left: `Check anyone before you pay` / `One request, no login. You get the score, how it was built, and who vouched.`
- Right: dark terminal, `GET /api/trust`, `live response`, copy button `Copy curl` (copies `curl https://pakka.zwala.dev/api/trust/CHVPP4321L`), command `curl pakka.zwala.dev/api/trust/CHVPP4321L` and Priya's live JSON.
- Under it, muted: link `For AI agents` (goes to `/machine`) + mono `curl -H "Accept: text/markdown" pakka.zwala.dev`

### 5. Final CTA

- Freelancing: `Send a Pakka link before you start.` / `Pakka doesn't find you work. It makes sure you get paid for it.` + hero CTAs
- Paying: `Ask for a Pakka link before you pay.` / `Your freelancer makes one in a minute. You pay Razorpay, not them.` + hero CTAs
- Ask AI row: label `Ask AI about Pakka` + pills `ChatGPT` · `Claude` · `Perplexity` (new tab), prompt `Read https://pakka.zwala.dev/llms.txt and tell me what Pakka does and whether I should use it for my next freelance deal.`

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

Demo block, directly under the sub. Left column is top-aligned so nothing moves between tabs.

- Heading: `Or try the demo`
- Personas in a 2-column grid, full-width buttons
- Buttons: `Meera · client` `[LOCKED]` · `Rohan · freelancer` `[LOCKED]` · `Priya · voucher` `[LOCKED]` · `Arjun · freelancer`
- Reset, faint text link at the bottom of the left column: `Reset demo data` / busy `Resetting…`

### Sign up (default)

- Tabs: `Create account` / `Sign in`
- Heading: `Create your account`
- Sub: `Takes a minute. PAN and GSTIN are optional and raise your starting score.`
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
- Button: `New deal` (emerald; ghost when the only thing to do is fund a waiting link)
- List heading: `Your deals`
- Empty: `No deals yet. Create one and send the link to your client on WhatsApp.`
- No deals but open links exist: `Your deals` is hidden; one section `Waiting for you`, row chip `Open to fund`, row meta `from {first name} · {n} milestone(s)`
- Has deals and open links: `Open links` + chip `demo` below `Your deals`
- Row role: `You're the freelancer` / `You're the client`
- `Reset demo data` sits at the page bottom, right-aligned, as a faint text link

## New deal

- No eyebrow
- Headline: `New deal`
- Sub: `Say what done means. Get a link to send your client.`
- Project: heading `Project` · helper `Your client sees this at the top of the link.` · label `Project title` · placeholder `Shopify store for Meera's brand`
- Milestones: `Milestone 1` / `Milestone 2 (optional)` · helper, milestone 1 only: `Each milestone is funded and paid separately.`
- Labels: `Title` · `Amount (₹)` · `Due in days` (defaults 7 and 14)
- Placeholders: title `Homepage + product pages` / `Checkout + launch` · amount `15000` · checklist `Homepage live on staging URL` + `3 product pages` / `Razorpay checkout working` + `Store live on custom domain`
- Checklist label: `Delivered means`
- Checklist helper, under milestone 1 only: `One item per line. Your client ticks what's missing if they send it back.`
- Milestone 2 has no wash background; `(optional)` is enough.
- Footer note: `Your client pays nothing until they fund a milestone.`
- Button: `Create Pakka link`
- Error: `Add at least one milestone with an amount and a checklist.`

## Deal room

### Header

- Eyebrow: `Pakka deal`
- Sub: `₹{total} across {n} milestone(s). Razorpay holds each one until it's delivered.`
- Copy button: `Copy Pakka link` / after click `Copied. Paste it in WhatsApp.`
- Score chips: `Freelancer` / `Client`, names cut at the first ` (`. Freelancer's name links to `/u/<id>` `[LOCKED]`
- No client yet, `Client` plus: client-to-be `That's you, once you fund milestone 1.` · freelancer `Your client joins when they fund milestone 1.` · signed out `Whoever funds milestone 1.`

### Milestone states

| State | Chip | Note |
|---|---|---|
| AGREED, next to fund | `Not funded yet` | client: `Razorpay holds your ₹{amount} until {freelancer} delivers. Miss the deadline and it comes back to you.` · freelancer: `Start once this says Held by Razorpay.` · others: `Work starts once this says Held by Razorpay.` |
| AGREED, later | `Not funded yet` | `You can fund this later.` · freelancer: `Your client can fund this later.` |
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
- References (faint mono, 11px): `Razorpay ref {id}` / `Refund ref {id}`

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

- `Accept and pay {freelancer} ₹{amount}`
- Reject label: `Something missing? Send it back.`
- Reject button: `Send back for fixes`
- Helper: `The freelancer gets 48 hours to fix it. Sending it back twice marks it disputed.`

Demo controls (no emoji), own row at the end of the milestone, left-aligned:

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
- Small print: `Only paid deals count. A missed deadline costs 300.`
- Heading: `Vouches`
- Empty: `None yet.` (muted, above the form)
- Row: `score {n} · adds +{weight}` and the note in quotes
- `Vouches for: {names}`
- Vouch label: `Vouch for {first name}`
- Placeholder: `How do you know their work?` `[LOCKED]`
- Button: `Vouch with my score` `[LOCKED: contains "Vouch"]`
- Helper: `If they miss a deadline after this, you lose 150 points.`
- Heading: `Recent outcomes`
- API link, faint, at the page bottom: `This score as JSON`
- Outcome dates: `2 Sep` (fixed 3-letter months, shared with the deal room)
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
