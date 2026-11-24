# RMD Product UI token register

Measurement basis: ReactiveMD Product UI `0.9.2`, captured 2026-11-24.

Canonical machine-readable data: [`../assets/tokens.json`](../assets/tokens.json). Generated CSS: `node scripts/rmd-ui.mjs tokens`.

## Architecture

The skill exposes semantic values (purpose) and component values (control geometry) as CSS variables. Raw palette values are inlined; there is no separate primitive layer to consume.

| Layer | Purpose | Portable names | Examples |
| --- | --- | --- | --- |
| Semantic | Purpose, light + dark | `--ui-*` | `--ui-paper`, `--ui-surface`, `--ui-ink`, `--ui-accent` |
| Component | Control geometry and state surfaces | `--ui-*` | `--ui-slider-thumb-width`, `--ui-focus-halo` |

The portable emitter applies a prefix (`--ui-*` by default), a custom prefix, or no prefix when `--prefix ""` is used. Themes override semantic values, not component structure.

## Measurement basis

These are the applied values in ReactiveMD Product UI `0.9.2`, captured 2026-11-24. The skill is self-contained: no source checkout is required. If you target a different ReactiveMD release or another product, verify the values against that system before treating them as identical.

## Rules that are easy to get wrong

- Fields and shared controls are **8px**, explicit action buttons are **10px**. The product language is not a single radius for both.
- Action buttons use weight **500**. Tabs, segmented labels and selected rows can use **600** because they carry state.
- `--text-group-label` is **14px**. Treat it as a control-group caption, not a display heading.
- Dark mode deepens `--shadow-sm` and `--shadow-md`; `--shadow-lg` keeps its light value in the captured set. `--overlay-shadow` has its own dark value.
- Document headings use **-0.015em** tracking. `-0.03em` is available for compact UI display type only; do not apply it to document headings.
- The type scale is 12/14/16/19/23/28 with a 17px block title. Do not substitute 13/14.5/20/25/29 or an 18px group label.

## Fonts

| Token | Value |
| --- | --- |
| `--font-sans` | `"Inter", "Segoe UI Variable", "Segoe UI", ui-sans-serif, system-ui, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans SC", sans-serif` |
| `--font-mono` | `"JetBrains Mono", "Cascadia Code", "SFMono-Regular", "Consolas", "Liberation Mono", monospace` |

The CJK fallbacks are deliberate. Keep a 1.7 body line height for mixed Chinese/English text; do not tighten body leading to 1.4 to match a Latin-only mockup.

## Type

| Token | Value | Role |
| --- | --- | --- |
| `--text-xs` | 12px | Meta, badges, captions, step dots |
| `--text-sm` | 14px | Secondary copy, tables, alerts, labels, buttons |
| `--text-md` | 16px | Body, disclosure labels, field values |
| `--text-lg` | 19px | h3, block display |
| `--text-xl` | 23px | h2, large readouts |
| `--text-2xl` | 28px | h1, display |
| `--text-h5` | 0.83em | Relative fifth-level heading |
| `--text-h6` | 0.75em | Relative sixth-level heading |
| `--text-group-label` | 14px | Fieldset / choice-group caption |
| `--text-block-title` | 17px | Card, panel, disclosure title |
| `--text-block-subtitle` | 14px | Nested block title, small card title |

| Token | Value |
| --- | --- |
| `--weight-regular` | 400 |
| `--weight-medium` | 500 |
| `--weight-semibold` | 600 |
| `--weight-bold` | 700 |

| Token | Value |
| --- | --- |
| `--leading-tight` | 1.25 |
| `--leading-snug` | 1.45 |
| `--leading-normal` | 1.6 |
| `--leading-relaxed` | 1.7 |

| Token | Value | Use |
| --- | --- | --- |
| `--tracking-display` | -0.015em | Document headings |
| `--tracking-title` | -0.01em | Block titles |
| `--tracking-none` | 0em | Body |
| `--tracking-code` | 0.02em | Code |
| `--tracking-overline` | 0.02em | Uppercase overline |
| `--tracking-display-tight` | -0.03em | Compact UI display only |

## Space and rhythm

| Token | Value |
| --- | --- |
| `--space-1` | 4px |
| `--space-2` | 8px |
| `--space-3` | 12px |
| `--space-4` | 16px |
| `--space-5` | 24px |
| `--space-6` | 32px |
| `--space-7` | 48px |

| Token | Value | Between |
| --- | --- | --- |
| `--rhythm-section` | 32px | Major sections and top-level headings |
| `--rhythm-block` | 16px | Paragraphs, lists, tables, block components |
| `--rhythm-inline` | 12px | Inside a component or group |

The document column is `max-width: 720px`, centred, with 16px body and 1.7 leading. Top-level headings use 32px above and 12px below; headings inside a section use 16px above and 12px below. The first/last child of the document and of a container drop their outer margin.

## Radius

| Token | Value | Use |
| --- | --- | --- |
| `--radius-hairline` | 1px | Hairline shapes |
| `--radius-2xs` | 2px | Tiny marks |
| `--radius-xs` | 3px | Tab indicator top corners |
| `--radius-inset` | 6px | Inset chips |
| `--radius-field` / `--radius-control` | 8px | Fields, selects, shared controls |
| `--radius-toolbar` | 9px | Compact toolbar |
| `--radius-button` | 10px | Explicit action buttons |
| `--radius-card` | 12px | Cards, popovers, menus, alerts |
| `--radius-field-multiline` | 14px | Textareas and tall field surfaces |
| `--radius-panel` | 14px | Panels, dialogs |
| `--radius-xl` | 22px | Large inset surfaces (coordinate pad) |
| `--radius-pill` | 999px | Badges and switches only |
| `--radius-circle` | 50% | Radio dots, calendar days, step dots |

The shared aliases are `--radius-sm` → field (8px), `--radius-md` → card (12px), `--radius-lg` → panel (14px).

## Controls and density

| Token | Default | Compact | Comfortable |
| --- | --- | --- | --- |
| `--control-height-sm` | 30px | 28px | 36px |
| `--control-height` | 38px | 32px | 44px |
| `--control-height-lg` | 44px | 36px | 48px |
| `--control-padding-y` | 8px | 5px | 10px |
| `--control-inset-x` | 16px | 12px | 20px |
| `--field-gap` | 12px | 8px | 16px |
| `--table-cell-padding-y` | 10px | 6px | 12px |
| `--table-cell-padding-x` | 12px | 12px | 16px |

Density changes sizes only; it never changes the skin. The default control padding-x token is 12px; `--control-inset-x` is the wider action-button inset (16px).

Other control tokens: `--control-selected`, `--control-selected-ink`, `--control-track`, `--control-thumb`, `--disabled-opacity` (0.45).

## Semantic colour

Light:

| Token | Value | Role |
| --- | --- | --- |
| `--paper` | `#f5f3f1` | Page / paper |
| `--surface` | `#ffffff` | Document and panel surface |
| `--surface-subtle` | `#faf9f7` | Metric tile, quiet fill |
| `--surface-hover` | `#f3f1ee` | Hover state |
| `--surface-active` | `#ebe8e4` | Active / pressed state |
| `--ink` | `#111111` | Primary text |
| `--ink-soft` | `#55524e` | Secondary text |
| `--ink-muted` | `#6f6c68` | Metadata, muted text |
| `--line` | `#e6e4e3` | Hairline, field border |
| `--line-strong` | `#d6d4d2` | Strong hairline, stronger divider, some native control borders |
| `--accent` | `#1f5ae8` | Accent fill / primary action |
| `--accent-hover` | `#1a4fd0` | Accent hover |
| `--accent-soft` | `#eef3fe` | Selection fill |
| `--accent-line` | `#cad9f9` | Selection line |
| `--accent-ink` | `#ffffff` | Text on accent fill |
| `--accent-text` | `#1f5ae8` | Accent as text |
| `--focus` | `#1f5ae8` | Focus ring |
| `--success` | `#18794e` | Success ink |
| `--success-soft` | `#e8f5ee` | Success fill |
| `--success-line` | `#bfe3cf` | Success line |
| `--warning` | `#9a6700` | Warning ink |
| `--warning-soft` | `#fff6dd` | Warning fill |
| `--warning-line` | `#f0dca8` | Warning line |
| `--danger` | `#c4323f` | Danger ink |
| `--danger-soft` | `#fff0f1` | Danger fill |
| `--danger-line` | `#f3c6cb` | Danger line |
| `--neutral-soft` | `#f3f1ee` | Neutral soft fill |
| `--tooltip-bg` | `#26282c` | Tooltip fill |
| `--tooltip-ink` | `#f5f6f8` | Tooltip text |
| `--control-selected` | `#1f5ae8` | Checked/selected fill |
| `--control-selected-ink` | `#ffffff` | Text/glyph on selected fill |
| `--control-track` | `#eceae7` | Switch/range track |
| `--control-thumb` | `#ffffff` | Switch/range thumb |
| `--formula-ink` | `#111111` | Formula text |

Dark:

| Token | Value | Role |
| --- | --- | --- |
| `--paper` | `#141517` | Page / paper |
| `--surface` | `#1c1d20` | Document and panel surface |
| `--surface-subtle` | `#232428` | Metric tile, quiet fill |
| `--surface-hover` | `#2a2b30` | Hover state |
| `--surface-active` | `#32343a` | Active / pressed state |
| `--ink` | `#f4f2ef` | Primary text |
| `--ink-soft` | `#c9c6c1` | Secondary text |
| `--ink-muted` | `#9b9792` | Metadata, muted text |
| `--line` | `#34363b` | Hairline, field border |
| `--line-strong` | `#4a4c52` | Strong hairline, stronger divider |
| `--accent` | `#7aa2ff` | Accent fill (light blue) |
| `--accent-hover` | `#9ab8ff` | Accent hover |
| `--accent-soft` | `#1e2a44` | Selection fill |
| `--accent-line` | `#344a75` | Selection line |
| `--accent-ink` | `#0b1220` | Text on accent fill (dark ink) |
| `--accent-text` | `#9ab8ff` | Accent as text |
| `--focus` | `#9ab8ff` | Focus ring |
| `--success` | `#6fce9f` | Success ink |
| `--success-soft` | `#173326` | Success fill |
| `--success-line` | `#2f5b45` | Success line |
| `--warning` | `#e8b75a` | Warning ink |
| `--warning-soft` | `#33270f` | Warning fill |
| `--warning-line` | `#5c4a22` | Warning line |
| `--danger` | `#ff9aa5` | Danger ink |
| `--danger-soft` | `#3a1b1f` | Danger fill |
| `--danger-line` | `#794853` | Danger line |
| `--neutral-soft` | `#2a2b30` | Neutral soft fill |
| `--tooltip-bg` | `#26282c` | Tooltip fill |
| `--tooltip-ink` | `#f5f6f8` | Tooltip text |
| `--control-selected` | `#7aa2ff` | Checked/selected fill |
| `--control-selected-ink` | `#0b1220` | Text/glyph on selected fill |
| `--control-track` | `#2c2e33` | Switch/range track |
| `--control-thumb` | `#f4f2ef` | Switch/range thumb |
| `--formula-ink` | `#f4f2ef` | Formula text |

Dark inverts the accent relationship: the fill is lighter blue and the ink is near-black; accent-as-text is lighter blue. Do not use the light accent fill with white text in dark mode.

## Chart and coordinate palette

| Token | Light | Dark |
| --- | --- | --- |
| `--chart-1` | `#1f5ae8` | `#7aa2ff` |
| `--chart-2` | `#d97757` | `#e59a7d` |
| `--chart-3` | `#2f9e7e` | `#63c7a6` |
| `--chart-4` | `#b07d2b` | `#d8ab5e` |
| `--chart-5` | `#7a5af8` | `#a78bfa` |
| `--chart-6` | `#2f8fa8` | `#6ec3d8` |
| `--chart-7` | `#7f8f3a` | `#b4c46a` |
| `--chart-8` | `#b45f8a` | `#d98cb2` |
| `--chart-grid` | `#eceae7` | `#2c2e33` |
| `--chart-axis` | `#6f6c68` | `#9b9792` |
| `--coordinate-surface` | `#faf9f7` | `#1c1d20` |
| `--coordinate-grid` | `#e6e4e3` | `#34363b` |
| `--coordinate-axis` | `#55524e` | `#c9c6c1` |
| `--coordinate-point` | `#1f5ae8` | `#7aa2ff` |

The series palette is warm, print-safe and distinguishable in both modes. Series 1 is the accent. Charts are colour-only: do not change geometry, stroke widths or the viewBox to restyle a chart.

## Code palette

| Token | Light | Dark |
| --- | --- | --- |
| `--code-bg` | `#ffffff` | `#17181b` |
| `--code-bg-deep` | `#ffffff` | `#17181b` |
| `--code-ink` | `#253247` | `#e6e3de` |
| `--code-comment` | `#6a7482` | `#8f9298` |
| `--code-keyword` | `#1f5ae8` | `#9ab8ff` |
| `--code-string` | `#18794e` | `#6fce9f` |
| `--code-number` | `#9a6700` | `#e8b75a` |
| `--code-title` | `#1a4fd0` | `#7aa2ff` |
| `--code-attr` | `#b0355e` | `#ff9aa5` |
| `--code-meta` | `#6a4fb6` | `#c4a7ff` |
| `--code-addition` | `#18794e` | `#6fce9f` |
| `--code-deletion` | `#c4323f` | `#ff9aa5` |

Inline code uses `--neutral-soft`; code blocks use `--code-bg` with a 1px border derived from the code ink (`color-mix(in srgb, var(--code-ink) 14%, var(--code-bg))`) and a 12px radius.

## Elevation

| Token | Light | Dark |
| --- | --- | --- |
| `--shadow-sm` | `0 1px 2px rgb(17 17 17 / 6%)` | `0 1px 2px rgb(0 0 0 / 30%)` |
| `--shadow-md` | `0 8px 24px rgb(17 17 17 / 10%)` | `0 8px 24px rgb(0 0 0 / 38%)` |
| `--shadow-lg` | `0 12px 40px rgb(0 0 0 / 14%)` | same as light in the current token block |
| `--overlay-shadow` | `0 24px 64px rgb(17 17 17 / 18%)` | `0 24px 64px rgb(0 0 0 / 55%)` |
| `--focus-halo` | `0 0 0 3px rgb(31 90 232 / 16%)` | `0 0 0 3px rgb(122 162 255 / 22%)` |
| `--button-press-shadow` | `inset 0 1px 2px rgb(0 0 0 / 14%)` | same |

Shadows are for floating layers and hover lift only. Resting cards and panels have no shadow. `--shadow-md` may appear on chart tooltips and detail layers; `--overlay-shadow` is the stronger floating-layer shadow.

## Component geometry

| Token | Value | Used by |
| --- | --- | --- |
| `--press-scale` | 0.97 | Buttons, chips, gallery arrows |
| `--press-scale-checkbox` | 0.95 | Checkboxes |
| `--press-scale-row` | 0.99 | Checklist / radio / multi-select rows |
| `--switch-width` | 42px | Switch track |
| `--switch-height` | 24px | Switch track |
| `--switch-thumb-size` | 20px | Switch thumb |
| `--switch-thumb-press-size` | 26px | Switch thumb while pressed |
| `--checkbox-size` | 18px | Checkbox |
| `--checkbox-radius` | 5px | Checkbox |
| `--slider-thumb-width` | 22px | Slider thumb |
| `--slider-thumb-height` | 22px | Slider thumb |
| `--slider-track-height` | 6px | Slider track |
| `--slider-thumb-border-width` | 2px | Slider thumb border |
| `--slider-hit-size` | 44px | Slider pointer target |
| `--slider-tick-size` | 4px | Slider ticks |
| `--calendar-day-radius` | 50% | Calendar day |
| `--calendar-gap` | 4px | Calendar grid |
| `--calendar-width` | 328px | Calendar |
| `--calendar-press-scale` | 0.94 | Calendar day press |
| `--calendar-nav-press-scale` | 0.96 | Calendar nav press |
| `--chart-line-width` | 2.2 | Chart line |
| `--chart-line-highlight-width` | 3 | Highlighted line |
| `--chart-point-stroke-width` | 1.5 | Point stroke |
| `--chart-area-opacity` | 0.12 | Area fill |
| `--chart-bar-radius` | 4px | Bar corner |
| `--chart-dim-opacity` | 0.22 | Dimmed series |
| `--segmented-track` | light `#f0efed` / dark `#26282c` | Segmented control track |
| `--segmented-thumb` | light `#ffffff` / dark `#3a3d43` | Segmented thumb |
| `--chip-bg` | light `#f7f6f4` / dark `#232428` | Wrapped choice chip |
| `--chip-selected-bg` | light `#eef3fe` / dark `#1e2a44` | Selected chip |
| `--rail-track` | light `#e6e4e3` / dark `#34363b` | Steps rail |
| `--rail-fill` | light `#1f5ae8` / dark `#7aa2ff` | Steps rail progress |

## Optional ReactiveMD aliases

Only needed if you are applying this design language directly to a ReactiveMD theme. Other projects can ignore this table and use the `--ui-*` names.

| Portable (`--ui-*`) | RMD native |
| --- | --- |
| `--ui-paper`, `--ui-surface`, `--ui-ink` | `--paper`, `--surface`, `--ink` |
| `--ui-accent`, `--ui-accent-ink`, `--ui-accent-text` | `--accent`, `--accent-ink`, `--accent-text` |
| `--ui-focus` | `--focus` |
| `--ui-radius-field`, `--ui-radius-card`, `--ui-radius-panel` | `--radius-field`, `--radius-card`, `--radius-panel` |
| `--ui-radius-button` | `--pu-radius-md` (10px) |
| `--ui-shadow-sm/md` | `--shadow-sm/md` |
| `--ui-overlay-shadow` | `--pu-overlay-shadow` |
| `--ui-focus-halo` | `--pu-focus-halo` |
| `--ui-segmented-track/thumb` | `--pu-segmented-track/thumb` |
| `--ui-chip-bg`, `--ui-chip-selected-bg` | `--pu-chip-bg`, `--pu-chip-selected-bg` |
| `--ui-rail-track`, `--ui-rail-fill` | `--pu-rail-track`, `--pu-rail-fill` |
| `--ui-press-scale` | `--rmd-uiarc-press-scale` |
| `--ui-chart-line-width` | `--rmd-chart-line-width` |
| `--ui-slider-thumb-width` | `--rmd-slider-thumb-width` |

## Regenerate

```sh
node scripts/rmd-ui.mjs tokens --format json > /tmp/tokens.json
node scripts/rmd-ui.mjs tokens --format css --prefix ui --utilities > design-tokens.css
```

Edit `assets/tokens.json` rather than the generated CSS. Run `npm test` after any change; the test suite checks key values, prefixing and the dark block.