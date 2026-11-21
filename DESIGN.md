# Pakka design system

White paper, ink type, emerald for money moving. Structure from lines, not boxes.

## Tokens (src/app/globals.css `@theme`)
- Colour: `ink` #0b1712 (text, ink buttons), `ink-2` #3d4a44 (secondary text), `muted` #66736d (labels, meta), `faint` #98a39e (ids, timestamps), `line` #e3e8e5 (hairlines), `line-strong` #cfd7d3 (input/ghost borders), `paper` #fff, `wash` #f6f9f7 (hover, quiet bands).
- Brand: `brand` = emerald-700, `brand-hover` = emerald-800, `brand-soft` = emerald-50. Status hues: emerald (held/paid), amber (in review/waiting), rose (rejected/refunded), sky (links/info), zinc (neutral).
- Radius: xs 3, sm 5, md 7 (buttons, inputs), lg 10 (rare cards). No pills except chips.
- Type: IBM Plex Sans, IBM Plex Mono for ids/refs only. Scale: display 60/-0.035em (landing hero) · 36–40 page title · 20 section title · 15–16 body · 13 label/meta · 12 chip. Numbers always `tabular-nums`.
- Focus: 2px emerald-600 outline, 2px offset; inputs use emerald border + soft ring.

## Primitives
- `.rails` content column, max 1120px, vertical hairlines left/right, side padding `--rail-pad` (20px → 32px).
- `.hairline` border-top that bleeds to the rails (negative margin = rail pad). `.section` = hairline + vertical rhythm. Use inside `.rails` only.
- `.btn` primary (emerald-700), `.btn-ink` (ink), `.btn-ghost` (outline), modifier `.btn-sm`. Height 40 / 32.
- `.input`, `.label` (13px muted, sentence case), `.eyebrow` (12px caps emerald, max one per section), `.stat` (36px tabular), `.mono`, `.link`.
- `.chip-emerald|amber|rose|sky|zinc` status chips (`.chip`/`.badge` base), `.dot` leading status dot.
- `.card` exists for back-compat: hairline border, no shadow. Prefer not to use it.

## Rules
1. Fewer cards. Separate content with `.section`/`.hairline` and whitespace; a card only for a thing you act on as a unit (a milestone), never cards in cards.
2. Lines frame everything: header and footer are full-bleed hairlines, rails run top to bottom, sections cut across the rails.
3. Emerald means money or the one primary action on screen (Fund, Accept, Get started). Ink buttons for secondary-but-solid actions; ghost for the rest. One emerald button per view region: with several unfunded milestones only the next one gets `.btn`, the rest `.btn-ghost`.
4. Status is a chip, never a coloured block. Score deltas: emerald up, rose down.
5. Hierarchy by size and weight, not colour: ink for content, muted for meta, faint for machine ids.
6. Left-aligned, max ~70ch for prose. Grids collapse to one column below 640px; touch targets ≥ 40px.
7. Springs for entrance and number counts, transform/opacity only, reduced motion respected.
8. Nothing floats over content. No fixed widgets or toasts over the page.
