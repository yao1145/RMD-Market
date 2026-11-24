---
name: rmd-product-ui
description: "Apply, extend or audit a calm product-UI design language (the ReactiveMD default theme): warm neutral surfaces, one blue accent, a 12-28px type scale, 150/220/300ms eased motion, flat content surfaces and overlay-only elevation. Use when designing or restyling product UI, writing design tokens, choosing type roles and weights, building interaction motion, generating a design specimen, or auditing CSS for type, shape, color and motion drift."
---

# RMD Product UI design language

This skill is self-contained. It packages the applied design language of ReactiveMD's Product UI default theme (`0.9.2`) as a portable contract for other teams. You do not need a ReactiveMD checkout to use it.

The values here are the contract. `assets/tokens.json`, the references and the scripts are self-contained. If you target a different ReactiveMD release, verify the token values instead of assuming they are unchanged.

## What this language is for

Use it when the interface should feel like a calm product workspace: settings pages, data tools, document readers, dashboards, account surfaces, internal tools. Use a different language for playful consumer apps, editorial magazines, luxury brands, terminal consoles or neon dashboards.

| Principle | Consequence |
| --- | --- |
| Calm surface | Warm paper `#f5f3f1`, white/near-black panels, quiet hairlines. Colour is reserved for action and state. |
| One accent | A single blue family drives primary actions, selection, links and focus. Status colours stay semantic. |
| Rounded rectangles | 8px fields and controls, 10px buttons, 12px cards, 14px panels. Pills only for badges and switches; circles only for selection marks and dots. |
| Soft depth | One border per nesting level. Shadows belong to floating layers. Content surfaces use rules, dividers and background steps. |
| Controls stay controls | Fields, switches, ranges, segmented choices and buttons keep the borders they need. A control is not a card. |
| Short motion | 150ms state, 220ms structure, 300ms progress, one easing curve, no bounce. Entrance is a small scale change, not a slide. |
| Readable density | 38px default control, 4px spacing unit, 16px body, 1.7 line height, 720px measure, tabular numerals. |

## Quick start

Run from the directory containing this `SKILL.md`:

```sh
# Portable CSS variables (:root + dark), optional utility classes
node scripts/rmd-ui.mjs tokens --format css --utilities > design-tokens.css

# Prefix for a host app
node scripts/rmd-ui.mjs tokens --format css --prefix app --utilities > app-tokens.css

# No prefix (ReactiveMD compatibility)
node scripts/rmd-ui.mjs tokens --format css --prefix "" > rmd-tokens.css

# Design audit
node scripts/rmd-ui.mjs audit src --fail-on warn

# WCAG contrast check
node scripts/rmd-ui.mjs contrast --strict

# Self-contained specimen with light/dark and a motion lab
node scripts/rmd-ui.mjs preview --out preview.html
```

The generated token CSS includes both modes, an automatic dark preference, explicit `[data-theme="dark"]` / `[data-color-scheme="dark"]` selectors, density overrides and optional `.ui-type-*` utility classes. `assets/tokens.json` is the canonical machine-readable source; edit it, then regenerate.

## Decision tables

### Surface budget

| Need | Use | Border | Background | Shadow |
| --- | --- | --- | --- | --- |
| Page / paper | body | none | `--paper` | none |
| Document surface | root | none | `--surface` | none |
| One bordered content container | panel | 1px `--line` | `--surface` | none |
| Background-only metric tile | card | none | `--surface-subtle` | none |
| Labelled fieldset | group | none | transparent | none |
| List (checklist, multi-select, accordion) | rows | row dividers `--line` | transparent | none |
| Inline status | badge / status | 1px tone line | tone soft | none |
| Semantic callout | alert | 1px tone line + 3px tone left rule | tone soft | none |
| Floating layer | dialog / popover / menu / tooltip | 1px `--line` | `--surface` | `--overlay-shadow` |
| Control | field / switch / button | control border | control surface | focus halo; hover may add `--shadow-sm` |

Rules:

1. One border per nesting level. Do not put a card inside a card inside a panel.
2. A panel is the one bordered content container. A card is a background-only tile; it never gets a border or shadow.
3. Checklists, multi-selects, timers and quizzes are content, not nested cards. Use row dividers.
4. Disclosures and accordions are divider lists, not per-item cards.
5. Shadows belong to overlays and hover lift on controls. Resting content surfaces stay flat.
6. Controls keep the borders they need. Do not promote a field or switch to a card.

### Type role

| Role | Size | Weight | Leading | Tracking | Use |
| --- | --- | --- | --- | --- | --- |
| Display / h1 | 28px | 700 | 1.25 | -0.015em | Document title, hero heading |
| h2 | 23px | 700 | 1.25 | -0.015em | Major section |
| h3 | 19px | 700 | 1.25 | -0.015em | Subsection |
| h4 | 16px | 700 | 1.25 | -0.015em | Small section heading |
| h5 | 0.83em | 700 | 1.25 | -0.015em | Quiet heading, soft ink |
| h6 | 0.75em | 700 | 1.25 | -0.015em | Quietest heading, soft ink |
| Block title | 17px | 600 | 1.45 | -0.01em | Card, panel, disclosure title |
| Body | 16px | 400 | 1.7 | 0 | Document prose |
| Body small | 14px | 400 | 1.6 | 0 | Secondary copy, tables, alerts |
| Label | 14px | 600 | 1.25 | 0 | Field/group label; selected tab |
| Button label | 14px | 500 | 1.25 | 0 | Action buttons (compact UI refinement) |
| Meta | 12px | 400 | 1.6 | 0 | Captions, badges, dense readouts |
| Overline | 12px | 600 | 1.45 | 0.02em, uppercase | State and eyebrow labels |
| Code | 14px | 400 | 1.6 | 0.02em | Inline code and code blocks, mono |
| Numeric | 14px | 600 | 1.25 | 0 | Values, sliders, timers, tabular |

Every step derives from the 16px body. Do not introduce `13 / 15 / 18 / 20 / 24 / 25px` unless a documented exception requires it. Headings separate sections by 32px above and 12px below; blocks use 16px.

### Motion role

| Role | Duration | Recipe |
| --- | --- | --- |
| State change | 150ms | Colour, background, border, shadow, icon colour |
| Press | 100–160ms | `scale: 0.97` on buttons/chips; `0.95` checkbox; `0.99` option row |
| Structural change | 220ms | Overlay enter/exit, tab indicator, segmented thumb, switch thumb, disclosure height, chevron rotation |
| Progress | 300ms | Progress width, large layout size |
| Tooltip | 170ms | Opacity + 6px rise; shorter than base by design |
| Feedback pop | 160ms | Counter 1.12 scale, copy feedback 0.25em rise + 2px blur |

All motion uses `--ease-standard: cubic-bezier(0.22, 0.61, 0.36, 1)`. There is no bounce, no overshoot and no infinite decoration. Spinners and skeletons are the only loops. Entrance is a small scale change: dialogs from 0.96, popovers/menus from 0.97–0.98, tooltips from a 6px offset.

### Colour role

| Need | Use |
| --- | --- |
| Primary action | `--accent` fill with `--accent-ink`; hover `--accent-hover` |
| Secondary action | `--surface` fill, `--line` border, `--ink` |
| Quiet action | transparent fill, `--accent-text` ink |
| Selection | `--accent-soft` fill, `--accent-line` border, `--accent-text` ink |
| Focus | 2px `--focus` ring, 2px offset; field adds a 3px `--focus-halo` |
| Status | semantic `--success` / `--warning` / `--danger` with `-soft` fill and `-line` border |
| Metadata | `--ink-muted`; never lighter than the 4.5:1 floor for meaningful text |
| Chart series | `--chart-1`…`--chart-8`, warm screen palette; series 1 is the accent |
| Code | `--code-bg`, `--code-ink` plus the `--code-*` token palette |

One accent family only. Do not add a second brand hue for decoration. Status colours are not accents; they never become primary buttons or links.

## Non-negotiable rules

- Body text is 16px / 1.7 at a 720px measure. Do not shrink body text on mobile.
- Type scale: `12 / 14 / 16 / 19 / 23 / 28px`; block title 17px; h5/h6 are relative (`0.83em` / `0.75em`). Weights: `400 / 500 / 600 / 700`.
- Heading tracking is negative (`-0.015em`), block titles are `-0.01em`, body is `0`. Code and overline use `+0.02em`. Do not add positive tracking to body text.
- Spacing unit is 4px: `4 / 8 / 12 / 16 / 24 / 32 / 48`. Section 32px, block 16px, inline 12px.
- Radius: 8px fields/controls, 10px buttons, 12px cards, 14px panels, 999px pills for badges/switches. Never make a field or button a capsule.
- Shadows: `--shadow-sm` on control hover, `--shadow-md` for chart tooltips and detail layers, `--overlay-shadow` for dialog/popover/menu/tooltip. No shadows on resting cards or panels; panels use a hairline.
- Motion: 150/220/300ms, one easing, no `transition: all`, no bounce, no decorative loops. Guard every animation with `prefers-reduced-motion`.
- Press feedback uses the `scale` property, not `transform: scale(...)`, so a host transform survives.
- Focus is visible: 2px focus ring at 2px offset; fields use a 2px accent border plus a 3px halo. Never remove an outline without a replacement.
- Hit targets: 38px default control, 44px large or row target, 44px slider hit area, 18px checkbox inside a 44px row.
- State is never carried by motion alone: colour, border, label or position also changes.
- Design and check both light and dark. Dark inverts the accent: a lighter blue fill carries dark ink, and lighter blue is used as text.
- Print: stop motion, flatten shadows, expand overlays, use the print-safe palette. Forced colours: use `CanvasText` / `Highlight`, restore platform marks.

## Scripts

### `tokens`

```sh
node scripts/rmd-ui.mjs tokens [--format css|json] [--prefix ui] [--out file]
                               [--no-auto-dark] [--no-density] [--utilities]
```

- `--format css` (default) emits `:root`, an automatic dark media query, explicit dark selectors and density blocks.
- `--prefix ui` is the default; `--prefix app` gives `--app-*`; `--prefix ""` gives the native RMD names `--paper`, `--ink`, `--radius-field`, etc.
- `--utilities` adds `.ui-type-display`, `.ui-type-body`, `.ui-type-label`, `.ui-type-code`, `.ui-type-numeric` and the rest of the role set. The class prefix follows `--prefix`; an empty prefix falls back to `ui`.
- `--no-auto-dark` removes the `prefers-color-scheme` block but keeps explicit dark selectors.
- `--no-density` removes `[data-density="compact"]` / `[data-density="comfortable"]`.
- `--out file` writes the result; otherwise it goes to stdout.
- JSON output is the canonical token object, useful for generators.

Usage:

```sh
node scripts/rmd-ui.mjs tokens --format css --prefix app --utilities > app-tokens.css
```

### `audit`

```sh
node scripts/rmd-ui.mjs audit [paths...] [--format text|json] [--fail-on none|warn|info]
                              [--disable RULE,...] [--exclude pattern,...] [--quiet]
```

Scans `.css` files recursively. It is a heuristic design audit, not a CSS parser replacement. It checks:

| Rule | Severity | What it catches |
| --- | --- | --- |
| `TYPE-001` | warning | Font size outside 11/12/14/16/17/19/23/28 |
| `TYPE-002` | info | Font weight outside 400/500/600/700 |
| `TYPE-003` | info | Raw line height outside the shared leading scale |
| `TYPE-004` | info | Letter spacing outside the display/title/code/overline set |
| `MOTION-001` | warning | Duration outside 100–300ms or the 0.8s/1.4s ambient loops |
| `MOTION-002` | warning | `ease` / `ease-in` / `ease-out` / non-standard cubic-bezier / linear outside loops |
| `MOTION-003` | warning | `transition: all` |
| `MOTION-004` | warning | Infinite animation without a reduced-motion guard |
| `MOTION-005` | info | Animated file with no reduced-motion guard |
| `MOTION-006` | info | Press scale written with `transform` instead of `scale` |
| `SHAPE-001` | warning | Radius outside 1/2/3/4/5/6/8/9/10/12/14/22/999 |
| `SHAPE-002` | info | Odd `gap` value |
| `COLOR-001` | warning | Palette hex where a semantic token exists |
| `A11Y-001` | warning | `outline: none` without a detected focus replacement |
| `A11Y-002` | info | `!important` outside print/forced-colours/reduced-motion |

Inline controls:

```css
/* rmd-ui-audit-disable-file */
.x { font-size: 15px; } /* rmd-ui-audit-disable */
/* rmd-ui-audit-disable-next-line */
.y { border-radius: 13px; }
```

`--fail-on warn` exits 1 on warnings or errors; `--fail-on info` exits 1 on any finding. Default is `none`.

The audit is heuristic: treat a finding as a prompt to inspect the rule, not as a mechanical failure. A greenfield implementation should reach zero warnings. Existing codebases often carry documented exceptions; use inline disables or a written exception for each one.

### `contrast`

```sh
node scripts/rmd-ui.mjs contrast [--format text|json] [--all] [--strict]
```

Checks curated token pairs in both modes. Text pairs require 4.5:1, focus/non-text 3:1, decorative pairs are reported only with `--all` at 1.5:1. All default pairs pass for `reactive-md 0.9.2` (50/50). `--strict` exits 1 on a failure.

Hairline borders are intentionally quiet. The default `--line` / `--line-strong` do not meet 3:1 against the surface. If a strict WCAG 1.4.11 context requires a control boundary at 3:1, darken the border locally; do not rely on the hairline alone to identify a control.

### `preview`

```sh
node scripts/rmd-ui.mjs preview [--out file] [--title text]
```

Generates a self-contained HTML specimen: typography, colour swatches with live light/dark values, spacing, radius, elevation, a motion lab, component demos, overlays and an accessibility section. No external assets. Open the file directly in a browser. `preview.html` in this folder is a generated example.

### Tests

```sh
npm test
# or
node --test tests/*.test.mjs
```

The suite covers colour parsing, contrast, token emission, audit findings, inline disables and preview generation (15 tests).

## Adoption workflow

1. **Map semantics, not hexes.** Decide which existing colours are `--paper`, `--surface`, `--ink`, `--line`, `--accent`, status and chart series. Keep one accent family.
2. **Set both modes.** Fill light and dark tokens before styling components. Check contrast with `node scripts/rmd-ui.mjs contrast --strict`.
3. **Build type roles.** Assign the 16 roles above to your headings, body, labels and data. Delete any off-scale sizes.
4. **Apply the surface budget.** Choose panel vs card vs group vs list. Add at most one border per nesting level; remove shadows from content surfaces.
5. **Add motion recipes.** Use 150/220/300 and the standard curve. Add press scale with the `scale` property. Add a reduced-motion block.
6. **Audit and preview.** Run `audit --fail-on warn`, then `preview` and test light/dark, 390px, keyboard focus, reduced motion and print.

## Common mistakes

| Symptom | Fix |
| --- | --- |
| Text feels generic or marketing-like | Use the 16px/1.7 body, 720px measure and 700-weight headings with negative tracking; remove decorative gradients and large hero type |
| Cards stacked inside cards | Use one panel, background-only cards and divider rows |
| Fields look like pills | Use 8px fields, 10px buttons; reserve 999px for badges/switches |
| Everything floats | Remove shadows from cards/panels; keep `--overlay-shadow` for overlays only |
| Accent everywhere | Keep accent for primary action, selection, links and focus; use neutral surfaces and semantic status |
| Motion feels slow or playful | Use 150ms state / 220ms structure / 300ms progress, standard easing, no bounce |
| Press animation fights a host transform | Use `scale: 0.97`, not `transform: scale(0.97)` |
| Reduced motion loses content | Settle entrance states at opacity 1, scale 1, transform none, filter none; do not hide content |
| Dark mode looks like inverted light | Use the dark tokens: lighter accent fill with dark ink, `#17181b` code surface, deeper overlay shadows |
| Audit passes but the UI is hard to use | Audit only checks tokens; still test keyboard focus, 44px targets, 390px layout and screen-reader state |

## Verification checklist

- [ ] Both modes defined; no token falls back to a partial palette.
- [ ] Contrast command passes; meaningful text is at least 4.5:1.
- [ ] Type roles use only the scale; weights are 400/500/600/700.
- [ ] Spacing uses the 4px rhythm; section 32 / block 16 / inline 12.
- [ ] Radius grammar is 8/10/12/14/999; no capsule fields.
- [ ] Panels are the only bordered content container; cards have no border/shadow.
- [ ] Motion uses 150/220/300 and the standard curve; no `transition: all`.
- [ ] Every animation has a `prefers-reduced-motion` guard and settles at its resting frame.
- [ ] Focus rings are visible; hit targets are at least 44px where touch matters.
- [ ] Light/dark, 390px, keyboard, reduced motion and print were checked.
- [ ] `audit` is clean or every remaining finding has a written exception.

## References

- [tokens.md](references/tokens.md): full token register, light/dark values, density, component geometry and source paths.
- [typography.md](references/typography.md): type roles, weights, leading, tracking, hierarchy rules and component assignments.
- [motion.md](references/motion.md): duration/easing contract, entrance/exit matrix, CSS recipes, spring layer, reduced motion.
- [visual-language.md](references/visual-language.md): colour usage, surface budget, elevation, radius grammar, component recipes and anti-patterns.
- [tokens.json](assets/tokens.json): canonical machine-readable token data.
- [preview.html](preview.html): generated specimen; regenerate with `node scripts/rmd-ui.mjs preview`.

The CSS recipes are framework-independent: the same tokens and selectors work in plain CSS, React, Vue, Svelte, Astro or server-rendered HTML. The scripts use only the Node.js standard library.