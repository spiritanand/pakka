# Pakka design system

White paper, ink type, emerald for money moving. Structure from lines, not boxes. Few sizes, few weights, one primary action per region.

## Tokens (src/app/globals.css `@theme`)

### Colour
| Token | Value | Use |
|---|---|---|
| `ink` | #0b1712 | Content text, headlines |
| `ink-2` | #3d4a44 | Secondary body, nav links |
| `muted` | #66736d | Labels, meta, ids, timestamps, and the second tone of a two-tone headline |
| `line` | #e3e8e5 | Hairlines, rails, card borders |
| `line-strong` | #cfd7d3 | Input and ghost-button borders |
| `paper` | #fff | Every surface text sits on |
| `wash` | #f6f9f7 | Hover fill, quiet bands |
| `brand` / `brand-hover` | emerald-700 / 800 | The primary button, money states |

`faint` is an alias of `muted` (kept so old classes still pass contrast). Don't use it in new code. No other greys.

Status hues come only through chips: emerald (held, paid, score up), amber (in review, waiting), rose (refunded, disputed, score down), zinc (neutral). Each chip also carries a word, never colour alone.

### Type (IBM Plex Sans 400 / 500 / 600; Plex Mono 400 / 500)
| Class | Size | Use |
|---|---|---|
| `text-display` | 40 → 52 fluid, lh 1.06, -0.03em, 400 | Landing H1 and landing section heads only |
| `text-title` | 28, lh 1.15, -0.02em, 500 | Page H1 on app screens (dashboard, deal, profile, new, login) |
| `text-heading` | 20, lh 1.3, -0.01em, 500 | Section H2 |
| `text-base` | 16 | Prose, landing body |
| `text-sm` | 14 | Dense UI body, buttons, inputs, table rows |
| `text-meta` | 13 | Labels, captions, footer, back links |
| `text-xs` | 12 | Chips only |

- Weights: 400 body and display, 500 headings, labels, buttons. 600 only for the wordmark and big score numbers. No 700.
- The size token already sets tracking, leading and weight. Don't add `font-semibold` or `tracking-tight` on top.
- **Two-tone headline** (Stripe): one heading, ink first sentence, `text-muted` continuation at the same size and weight. It replaces a separate subhead.
  `<h1 className="text-display">Full payment up front. <span className="text-muted">Safe for both of you.</span></h1>`
- Numbers: `tabular-nums` on every amount, score and count. Mono (`font-mono`) for ids, refs, API and code, not for decoration.
- `h1, h2, h3` balance and `p` wraps pretty globally. Prose max ~65ch.
- No eyebrows or kickers above headings. `.eyebrow` is now an alias of `.label`. Replace it with `.label` or delete it.

### Radius
`rounded-sm` 4px (checkbox marks, tooltips, chips, skeleton bars) · `rounded-md` 6px (buttons, inputs, row hovers) · `rounded-lg` 10px (cards, panels, mocks). `rounded-full` only for dots, avatars and the landing switcher. `rounded-xs` maps to 4px.

### Spacing (4px base, 8px rhythm)
- Gutter: `--rail-pad` 20px, then 32px from 640px.
- Inside a group: 8 (`gap-2`). Between related items: 16 (`gap-4`). Between groups in a section: 24 to 32. Heading to its content: 16 to 24.
- `.section` = 48px / 64px vertical. Landing bands add `sm:py-24`.
- `main` starts 48 / 64 under the header.

### Focus
One ring everywhere: 2px emerald-600 outline, 2px offset, on `:focus-visible` for links, buttons, summaries, inputs, textareas and selects. Don't add `outline-none` or custom rings.

## Classes

| Class | What |
|---|---|
| `.rails` | Content column, max 1120px, vertical hairlines both sides |
| `.section` | Full-bleed top hairline + section padding. Inside `.rails` only |
| `.hairline` | Full-bleed top hairline, no padding |
| `.btn` | Primary, emerald, 40px. One per view region |
| `.btn-ghost` | Everything else that is a button, outlined, 40px |
| `.btn-sm` | 32px size modifier for either |
| `.link` | Inline underlined text link |
| `.input` | Text input and textarea (`textarea.input` grows) |
| `.label` | 13px medium muted form or field label |
| `.chip-emerald` `.chip-amber` `.chip-rose` `.chip-zinc` | Status chips: 24px tall, 4px radius, tint fill, no border. `.chip` is the bare base for a custom tone |
| `.dot` | Leading status dot inside a chip |
| `.card` | Bordered 10px panel, no shadow. Only for a thing acted on as a unit |

Removed: `.btn-ink` (use `.btn` or `.btn-ghost`), `.badge`, `.chip-sky`, `.stat`, `.mono`, `brand-soft`, the uppercase emerald `.eyebrow` style.

## Components (src/components)
- `CopyButton`: variants `ghost` (default, same look as `.btn-ghost btn-sm`), `dark` (on ink surfaces), `icon`. After copying it shows a tick and the word "Copied", always. No custom copied text.
- `BackLink`: 13px muted link with a left arrow that nudges on hover.
- `SubmitButton`: wraps a form's submit, disables while pending, optional `busy` text. Give it `.btn` or `.btn-ghost`.
- `Bar`, `ScoreSkeleton`, `RowsSkeleton`: loading placeholders in `wash`.
- `motion.tsx`: springs (`spring.snappy` for interaction, `spring.soft` for landing entrances).

## Rules
1. Fewer cards. Separate content with `.section` / `.hairline` and whitespace. A card only for a thing acted on as a unit. Never cards in cards. Elevation is a border or nothing, no drop shadows on app screens.
2. Lines frame everything: the header and footer are full-bleed hairlines, rails run top to bottom, sections cut across the rails.
3. Emerald is scarce (under ~5% of the screen): the one primary button, money states, active markers. Never on headline text, never as a background behind text.
4. Two button looks only. With several unfunded milestones only the next one gets `.btn`, the rest `.btn-ghost`. Header nav is plain text links.
5. Status is a chip, never a coloured block. Score deltas: emerald up, rose down.
6. Hierarchy by size and weight, not colour: ink for content, muted for meta.
7. Left-aligned. Grids collapse to one column below 640px. Touch targets at least 40px (`.btn-sm` only in dense rows and the header).
8. Motion: springs only, transform and opacity, reduced motion respected. Entrance animations live on the landing pages only (`<Entrances>` in `src/app/template.tsx`). App screens have no load, stagger or count-up animation. Interaction feedback (press scale, copy tick, disclosure) is fine.
9. Nothing floats over content. No fixed widgets, toasts, blur or glass.
