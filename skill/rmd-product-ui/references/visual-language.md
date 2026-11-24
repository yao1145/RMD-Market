# RMD Product UI visual language

RMD Product UI is a warm product-interface language for working documents: a paper workspace, white surfaces, near-black ink and one vivid blue accent. The references are modern product workspaces, settings surfaces and data tools — not marketing pages, neon dashboards, terminal consoles or editorial print.

Measurement basis: ReactiveMD Product UI `0.9.2`. The skill is self-contained; no source checkout is required.

## Intent

| Principle | Consequence |
| --- | --- |
| Calm surface | Warm paper and white/near-black panels carry the interface; colour is reserved for action and state. |
| One accent | A single blue family drives primary actions, selection, links and focus. Status colours stay semantic. |
| Rounded rectangles | 8px fields and controls, 10px buttons, 12px cards, 14px panels. Pills only for badges and switches. |
| Soft depth | One border per nesting level. Shadows belong to overlays and hover lift. Content surfaces use rules, dividers and background steps. |
| Controls stay controls | Fields, switches, ranges, segmented choices and buttons keep the borders they need. They are never promoted to cards. |
| Short motion | 150–300ms transitions with one shared easing curve; entrances use small scale changes rather than slides. |
| Readable density | 38px control height, 4px spacing unit, 16px body, 1.7 leading, tabular numerals. |

## Colour usage

### Surface and ink

| Role | Light | Dark | Use |
| --- | --- | --- | --- |
| Paper | `#f5f3f1` | `#141517` | Page background |
| Document surface | `#ffffff` | `#1c1d20` | Document, panel, overlay |
| Subtle surface | `#faf9f7` | `#232428` | Metric tile, quiet fill |
| Hover | `#f3f1ee` | `#2a2b30` | Control and row hover |
| Active | `#ebe8e4` | `#32343a` | Pressed control |
| Ink | `#111111` | `#f4f2ef` | Primary text |
| Soft ink | `#55524e` | `#c9c6c1` | Secondary text |
| Muted ink | `#6f6c68` | `#9b9792` | Metadata, hints, disabled text |
| Hairline | `#e6e4e3` | `#34363b` | Dividers, quiet border |
| Strong hairline | `#d6d4d2` | `#4a4c52` | Control border, stronger rule |

### Accent

One accent family. In light mode the fill is `#1f5ae8` with white ink. In dark mode the fill is lighter `#7aa2ff` with near-black ink `#0b1220`; accent-as-text is `#9ab8ff`. This inversion keeps contrast and avoids white-on-light-blue.

Use accent for:

- primary action fills;
- selected tabs, steps and table rows;
- links and focus;
- the selected thumb of a segmented control;
- chart series 1.

Do not use accent for decorative backgrounds, large illustrations, every icon or multiple unrelated states. Do not add a second brand hue.

### Status

| State | Ink | Soft fill | Line |
| --- | --- | --- | --- |
| Success | `#18794e` | `#e8f5ee` | `#bfe3cf` |
| Warning | `#9a6700` | `#fff6dd` | `#f0dca8` |
| Danger | `#c4323f` | `#fff0f1` | `#f3c6cb` |

Dark values are `#6fce9f` / `#173326`, `#e8b75a` / `#33270f`, `#ff9aa5` / `#3a1b1f`. Status colours are never primary buttons or links. An alert pairs a 1px tone line with a 3px semantic left rule.

### Data

Charts use a warm, print-safe eight-colour palette (`--chart-1`…`--chart-8`) on screen. Series 1 is the accent. Grid lines use `--chart-grid`; axis text uses `--chart-axis`. In dark mode the palette lightens as a set; do not independently substitute a neon palette. `print.css` substitutes a higher-contrast print set, so do not assume the screen palette is the printed result.

Charts are colour-only: do not change geometry, stroke widths or the `viewBox` to restyle a chart. Dimmed series use opacity 0.22; selected/focused marks use the focus colour with a 2.4 stroke.

## Surface budget

Borders and shadows are budgeted so a document reads as one workspace, not a stack of cards.

| Level | Surface | Border | Background | Shadow |
| --- | --- | --- | --- | --- |
| Window | Host/document frame | 1px `--line` (one strong frame) | `--surface` | Optional `--shadow-md` |
| Container | Panel | 1px `--line` (one content border) | `--surface` | None |
| Metric tile | Card | None | `--surface-subtle` | None |
| Group | Fieldset | None | Transparent | None |
| Selection list | Checklist / multi-select | Row dividers only | Transparent | None |
| Disclosure list | Accordion / details | Row dividers `--line` | Transparent | None |
| Local block | Timer / quiz | None | Transparent | None |
| Alert | Semantic callout | 1px tone line + 3px tone left rule | Tone soft | None |
| Overlay | Dialog / popover / menu / tooltip | 1px `--line` | `--surface` | `--overlay-shadow` |
| Control | Field / switch / button | Control border as required | Control surface | Focus halo; hover may add `--shadow-sm` |

Rules:

1. One border per nesting level. A panel inside a window may carry the one content border; cards, groups and lists inside that panel add no second frame.
2. A panel is the one bordered content container. A card is a background-only metric tile with no border and no shadow.
3. Groups, checklists, multi-selects, timers and quizzes are not cards. No outer border, background or shadow.
4. Checklists and multi-selects are list rows with visible checkboxes and row dividers, not chips or buttons. Selected rows use accent text and a quiet accent fill, not a raised control.
5. Disclosures and accordions are divider lists inside a container, not per-item cards. The open state uses accent text and an accent left rule instead of a filled header.
6. Shadows belong to overlays and control hover. Resting content surfaces do not use shadows.
7. Controls keep the borders they need to be operable. A control is not a card, and a card is not a control.
8. Atomic content blocks (code, tables, inline code, alerts) keep the single hairline or semantic rule they need; they are not nested cards.

## Elevation

| Token | Use |
| --- | --- |
| `--shadow-sm` | Hover lift on controls; small floating detail |
| `--shadow-md` | Chart tooltip, small floating detail |
| `--overlay-shadow` | Dialog, popover, menu, tooltip |
| `--button-press-shadow` | Primary button press (inset) |
| `--focus-halo` | Field focus / focus ring halo |

Hover on a secondary button adds `--shadow-sm`; resting secondary buttons have no shadow. Primary press adds the inset press shadow; it does not add an outer shadow. Dialog/popover/menu/tooltip are the only surfaces that routinely carry `--overlay-shadow`.

## Radius grammar

| Token | Value | Use |
| --- | --- | --- |
| `--radius-field` / `--radius-control` | 8px | Inputs, selects, shared controls, tabs (top corners) |
| `--radius-button` | 10px | Explicit action buttons |
| `--radius-card` | 12px | Cards, popovers, menus, alerts, code blocks |
| `--radius-panel` | 14px | Panels, dialogs |
| `--radius-pill` | 999px | Badges, status pills, switches |
| `--radius-circle` | 50% | Radio dots, calendar days, step dots |

Never use a capsule radius on a text field or a primary action. Pills are a status/shape signal, not a generic button style.

## Spacing and layout

- 4px unit: `4 / 8 / 12 / 16 / 24 / 32 / 48`.
- Document max width 720px, centred, 16px body, 1.7 leading.
- Section gap 32px, block gap 16px, inline gap 12px.
- Card padding 16px / 24px; panel padding 24px; alert padding 12px / 16px; table cells 10px / 12px.
- The document and containers drop the first/last child margin so the block gap belongs to the container, not its edge.
- Grid gaps own intra-grid spacing; grid items carry no margin.
- Mobile reduces padding, not body type. Tabs and timer readouts are the only type exceptions below 480/620px.

Density modes:

| Mode | Control height | Padding-y | Inset-x | Field gap | Table y/x |
| --- | --- | --- | --- | --- | --- |
| Compact | 32px (sm 28 / lg 36) | 5px | 12px | 8px | 6 / 12px |
| Default | 38px (sm 30 / lg 44) | 8px | 16px | 12px | 10 / 12px |
| Comfortable | 44px (sm 36 / lg 48) | 10px | 20px | 16px | 12 / 16px |

Density changes sizes only. It never changes colour, radius or shadows.

## State recipes

### Buttons

- Base: 38px high, 10px radius, 1px `--line`, `--surface`, `--ink`, 14px / 500.
- Hover: `--surface-hover` + `--shadow-sm`.
- Active: `--surface-active` + `scale: 0.97`.
- Primary: `--accent` fill, `--accent-ink`; hover `--accent-hover`; active `--accent-hover` + inset press shadow.
- Quiet: transparent, `--accent-text`; hover `--surface-hover`, `--ink`; active `--surface-active`.
- Disabled secondary: keep border and shape, `--surface-subtle` + `--ink-muted`; primary fades to 0.52 opacity.
- Focus: 2px `--focus` ring, 2px offset.

### Fields

- 38px high, 8px radius, 1px `--line`, `--surface`, 16px / 1.45 text.
- Hover: `--line-strong`.
- Focus: 2px `--accent` border + 3px `--focus-halo`; `outline: none` is allowed because the border + halo is the replacement.
- Invalid: `--danger` border; focus adds a 3px danger halo at 20%.
- Read-only: `--surface-subtle`, `--ink-soft`.
- Disabled: `--surface-subtle`, `--ink-muted`, 0.45 opacity.
- Placeholder: `--ink-muted`, opacity 1.
- Max width 420px; fields shrink at 375px.
- Labels 14px / 600 / 1.45; hints and errors 12px / 1.45.

### Switch and checkbox

- Switch: 42×24 track, 20px thumb, `--control-track` / `--control-thumb`; checked `--control-selected` / `--control-selected-ink`; press stretches thumb to 26px.
- Checkbox: 18px rounded square, 5px radius, inside a 44px row; checked `--control-selected` + white check; press `scale: 0.95`.
- The row, not the tiny mark, carries the 44px hit area and focus ring.

### Segmented choices

- 2–4 choices become a segmented track (`--segmented-track`, 10px radius, 4px padding).
- The selected thumb is `--segmented-thumb`, 8px radius, 1px `--accent-line`, `--shadow-sm`; it slides 220ms.
- Selected label uses `--accent-text`; unselected `--ink-soft`; hover a 72% `--surface-hover` mix.
- 5+ choices become wrapped pills with `--chip-bg` / `--chip-selected-bg`; do not force a segmented control beyond four items.

### Tabs

- 40px high, 14px / 500 unselected, 600 selected, `--ink-muted` unselected, `--accent-text` selected.
- 3px accent underline slides 220ms; selected keeps 600.
- Hover `--surface-hover` / `--ink`; focus inset ring.
- Panel enters from 4px below with 220ms fade.

### Disclosure

- Divider list, 44px trigger, 16px / 500, chevron 7–8px at 1.75px stroke.
- Chevron rotates 180° in 220ms; body settles from -6px + 2px blur in 220ms.
- Height uses `interpolate-size: allow-keywords`; unsupported browsers open instantly.

### Steps

- 2px rail, accent progress, 22px dots, 12px / 600 numerals.
- Complete: accent fill + `--accent-ink`; current: surface fill, accent border, 4px `--accent-soft` halo, `--accent-text`, 700 weight.
- Status text 12px / 500, `--ink-muted`.

### Tables

- 14px / 1.6; header 600 `--ink-soft`; row dividers `--line`; last row no divider.
- Hover `--surface-hover`; selected `--accent-soft` with a 2px accent inset on the first cell.
- Tables scroll horizontally inside a wrapper; never shrink text to fit.

### Cards, panels, groups

- Card: `--surface-subtle`, 12px radius, no border/shadow, 16/24px padding, 12px gap.
- Panel: `--surface`, 1px `--line`, 14px radius, 24px padding, no shadow.
- Group: transparent, no border, no outer padding; 12px gap, children own their spacing.
- Alert: soft tone fill, tone line, 3px semantic left rule, 12/16px padding, 14px body.
- Badge/status: pill, 12px / 600, tone soft fill + tone line + tone ink.

### Overlays

- Dialog: `--surface`, 1px `--line`, 14px radius, 24px padding, `--overlay-shadow`; backdrop 42% dark in light, 64% black in dark.
- Popover/menu: `--surface`, 1px `--line`, 12px radius, `--overlay-shadow`; menu item 36px high, 8px radius; selected `--accent-soft` + 1px inset `--accent-line`.
- Tooltip: `--tooltip-bg` / `--tooltip-ink`, 8px radius, 8/12px padding, 12px / 500, `--shadow-md`.
- Focus: 2px `--focus`, 2px offset; menu inset -2px.
- Motion: dialog 0.96, popover 0.98, menu 0.97 + -6px; tooltip 6px rise at 170ms.

### Code and data display

- Inline code: 14px mono, `--neutral-soft`, 8px radius, `0.12em 0.35em` padding.
- Code block: 14px mono / 1.6, `--code-bg`, 1px border derived from code ink, 12px radius, 12/16px padding.
- `kbd`: 12px mono, `--surface-subtle`, 1px `--line-strong`, 8px radius.
- Chart: 2.2 line, 3 highlight, 1.5 point stroke, 0.12 area, 4px bar radius, dashed 3/4 grid, 11px axis, 12px legend.
- Diagram: node `--surface` fill, `--line-strong` stroke, 1.5 width, 2/3px shadow at 4%; selected/focus accent stroke 2.4; muted opacity 0.25.
- Empty state: `--surface-subtle`, dashed `--line-strong`, 12px radius, 32/16px padding, `--ink-muted`.
- Spinner: 24px, 2px `--line` ring with `--accent` top, 0.8s linear. Skeleton: 1.4s shimmer, `--surface-subtle` base + `--surface-hover` sweep.

## Dark mode

- Paper `#141517`, surface `#1c1d20`, subtle `#232428`, hover `#2a2b30`, active `#32343a`.
- Ink `#f4f2ef`, soft `#c9c6c1`, muted `#9b9792`; line `#34363b`, strong `#4a4c52`.
- Accent `#7aa2ff` with `--accent-ink` `#0b1220`; accent text `#9ab8ff`; soft `#1e2a44`; line `#344a75`.
- Code surface `#17181b`; code ink `#e6e3de`.
- Overlay shadow `0 24px 64px rgb(0 0 0 / 55%)`; focus halo `rgb(122 162 255 / 22%)`.
- Segmented track `#26282c`, thumb `#3a3d43`; chip `#232428`, selected `#1e2a44`; rail track `#34363b`.
- Shadows deepen; the usage budget does not change. Content stays flat.

Do not implement dark mode as a simple inversion of light tokens. Re-ink the accent, deepen surfaces and overlay shadows, and check every semantic pair.

## Accessibility

- Focus is always visible: 2px `--focus` at 2px offset; fields add a 3px halo; tabs/menu use -2px inset.
- Hit targets: 38px default, 44px large/row, 44px slider, 18px checkbox inside 44px.
- Meaningful text meets 4.5:1. The default pairs pass 50/50 in both modes. `--ink-muted` clears the floor on surface and paper; do not use a lighter decorative grey.
- Hairlines are intentionally low contrast. In a strict WCAG 1.4.11 context, darken the control border locally; do not rely on the hairline alone to identify a field.
- State is never colour-only or motion-only: pair with a label, icon, border or position.
- Forced colours: use `Canvas`, `CanvasText`, `Highlight`, `HighlightText`; restore platform checkbox/radio marks; remove translucent backdrops and decorative shadows.
- Print: stop motion, flatten shadows, expand overlays, keep values and summaries, use a print-safe palette. RMD's `print.css` overrides tokens for print; do not assume dark-mode colours will print.

## Anti-patterns

| Avoid | Why | Use |
| --- | --- | --- |
| Nested cards | Breaks the surface budget and creates visual noise | One panel, background-only cards, divider rows |
| Card shadows | Depth competes with real overlays | No shadow on cards/panels; overlay shadow only |
| Pill fields/buttons | Pills signal status, not input | 8px fields, 10px buttons |
| Accent on every icon | Destroys action hierarchy | Neutral icons; accent for primary/selected/focus |
| Multiple accent hues | Reads as multiple brands | One blue family |
| 13/15/18/20/24/25px type | Off-scale sizes fragment hierarchy | 12/14/16/17/19/23/28px |
| 300/800 weights | Outside the system | 400/500/600/700 |
| 250/400/600ms motion | Inconsistent rhythm | 150/220/300ms |
| `transition: all` | Animates layout and hides drift | Named properties |
| Bounce/overshoot | Feels playful, not calm | Tween or critically damped spring |
| Outline removal without replacement | Breaks keyboard navigation | 2px focus ring + halo |
| Hiding content under reduced motion | Loses information | Settle at resting state |
| Marketing hero type in a product page | Wrong genre | 28px display, 16px body, 720px measure |

## Adoption checklist

- [ ] One accent family; status colours are semantic.
- [ ] Surface budget: one bordered panel per nesting level; cards flat; lists divided.
- [ ] Radius grammar: 8 fields, 10 buttons, 12 cards, 14 panels, 999 pills.
- [ ] Shadows only on overlays and control hover.
- [ ] 4px spacing rhythm; 32 section / 16 block / 12 inline.
- [ ] 16px body, 1.7 leading, 720px measure.
- [ ] Both light and dark tokens complete; contrast passes.
- [ ] Focus visible; 44px targets; state not colour-only.
- [ ] Reduced motion, forced colours and print checked.
- [ ] 390px layout, keyboard and screen-reader state tested.