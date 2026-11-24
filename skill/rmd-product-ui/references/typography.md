# RMD Product UI typography

The type system is a working-document system: 16px body, 1.7 leading, a 720px measure, a compact 12–28px scale and a small set of weights. Hierarchy comes from size, weight and ink level before it comes from rules or boxes.

Measurement basis: ReactiveMD Product UI `0.9.2`. The skill is self-contained; no source checkout is required.

## Reading model

| Layer | Size | Leading | Weight | Ink |
| --- | --- | --- | --- | --- |
| Document prose | 16px | 1.7 | 400 | `--ink` |
| Secondary prose | 14px | 1.6 | 400 | `--ink-soft` |
| Metadata | 12px | 1.6 | 400 | `--ink-muted` |
| Display / headings | 28 / 23 / 19 / 16px | 1.25 | 700 | `--ink` |
| Quiet headings | 0.83em / 0.75em | 1.25 | 700 | `--ink-soft` |
| Block title | 17px | 1.45 | 600 | `--ink` |
| Control label | 14px | 1.25–1.45 | 600 | `--ink` |
| Button label | 14px | 1.25 | 500 | per variant |
| Code | 14px mono | 1.6 | 400 | `--code-ink` |
| Numeric | 14–16px | 1.25 | 600 | `--ink` / accent |

The body is deliberately not 15px or 18px. A 16px body with 1.7 leading gives mixed Latin/CJK text enough air and keeps long documents readable without zooming.

## Scale

| Token | Value | Typical role |
| --- | --- | --- |
| `--text-xs` | 12px | Badges, captions, hints, errors, chart labels |
| `--text-sm` | 14px | Secondary copy, tables, alerts, labels, buttons, tabs |
| `--text-md` | 16px | Body, field values, disclosure labels, h4 |
| `--text-lg` | 19px | h3, gallery caption |
| `--text-xl` | 23px | h2, timer readout |
| `--text-2xl` | 28px | h1 / display |
| `--text-h5` | 0.83em | Fifth-level heading |
| `--text-h6` | 0.75em | Sixth-level heading |
| `--text-block-title` | 17px | Card/panel/disclosure title |
| `--text-block-subtitle` | 14px | Nested block title, empty-state title |
| `--text-group-label` | 14px | Fieldset/choice-group caption |

Known exceptions in the reference system: `13px` appears in diagram nodes/tooltips, `15px` in a diagram tooltip heading, `24px` in large coordinate labels and the image-zoom close button. `11px` is a chart micro-label size (axis ticks and tooltip footnotes), not a UI text size. Do not copy those into a general UI.

## Weights

| Token | Value | Use |
| --- | --- | --- |
| `--weight-regular` | 400 | Body, table cells, descriptions, alerts |
| `--weight-medium` | 500 | Action button labels, disclosure triggers, some navigation labels |
| `--weight-semibold` | 600 | Block titles, field labels, tabs, badges, selected labels, table headers |
| `--weight-bold` | 700 | Document headings, strong text, current step dot, timer |

Use at most three weights in one view. A common correct pairing is 400 body + 600 titles/labels + 700 document headings. Do not use 300 or 800; they are outside the system. In CJK-heavy interfaces, 600 is often enough for compact UI titles even though document headings stay 700.

## Leading

| Token | Value | Use |
| --- | --- | --- |
| `--leading-tight` | 1.25 | Headings, button labels, numeric readouts |
| `--leading-snug` | 1.45 | Block titles, field labels, tables, badges, tooltips |
| `--leading-normal` | 1.6 | Secondary copy, alerts, code, chart legends |
| `--leading-relaxed` | 1.7 | Document body prose |

Never set body prose to 1.4 or 1.5. Never set headings to 1.7; a 28px heading at 1.7 looks like body text.

## Tracking

| Token | Value | Use |
| --- | --- | --- |
| `--tracking-display` | -0.015em | Document headings |
| `--tracking-title` | -0.01em | Block titles |
| `--tracking-none` | 0em | Body and controls |
| `--tracking-code` | 0.02em | Code |
| `--tracking-overline` | 0.02em | Uppercase overline |

Negative tracking belongs to large headings only. Do not apply `-0.015em` to 14px labels or body; it makes small text muddy. Do not add positive tracking to body text.

## Role recipes

```css
.type-display {
  font-size: var(--ui-text-2xl);
  font-weight: var(--ui-weight-bold);
  line-height: var(--ui-leading-tight);
  letter-spacing: -0.015em;
}

.type-block-title {
  font-size: var(--ui-text-block-title);
  font-weight: var(--ui-weight-semibold);
  line-height: var(--ui-leading-snug);
  letter-spacing: -0.01em;
}

.type-body {
  font-size: var(--ui-text-md);
  font-weight: var(--ui-weight-regular);
  line-height: var(--ui-leading-relaxed);
}

.type-label {
  font-size: var(--ui-text-sm);
  font-weight: var(--ui-weight-semibold);
  line-height: var(--ui-leading-tight);
}

.type-meta {
  font-size: var(--ui-text-xs);
  font-weight: var(--ui-weight-regular);
  line-height: var(--ui-leading-normal);
}

.type-code {
  font-family: var(--ui-font-mono);
  font-size: var(--ui-text-sm);
  line-height: var(--ui-leading-normal);
  letter-spacing: 0.02em;
}

.type-numeric {
  font-size: var(--ui-text-sm);
  font-weight: var(--ui-weight-semibold);
  line-height: var(--ui-leading-tight);
  font-variant-numeric: tabular-nums;
}
```

The token emitter can generate these as `.ui-type-*` classes with `--utilities`.

## Component assignments

| Component | Type |
| --- | --- |
| Document root | 16px / 1.7 / 400; max-width 720px |
| h1 | 28px / 1.25 / 700 / -0.015em |
| h2 | 23px / 1.25 / 700 |
| h3 | 19px / 1.25 / 700 |
| h4 | 16px / 1.25 / 700 |
| h5 / h6 | 0.83em / 0.75em, 700, `--ink-soft` |
| Card/panel title | 17px / 1.45 / 600 / -0.01em |
| Empty-state title | 14px / 1.45 / 600 |
| Empty-state description | 14px / 1.6 / 400, max 48ch |
| Alert title | 14px / 1.45 / 600 |
| Alert body | 14px / 1.6 / 400 |
| Badge / status | 12px / 1.5 / 600, pill |
| Tooltip | 12px / 1.45 / 500 |
| Table | 14px / 1.6; header 600, `--ink-soft`; cells 400 |
| Inline code | 14px mono, `--neutral-soft` fill, 8px radius |
| Code block | 14px mono / 1.6, 12px radius |
| `kbd` | 12px mono / 1.6 |
| Tabs | 14px / 500 unselected, 600 selected; selected uses `--accent-text` |
| Steps | Dots 12px / 600; status 12px / 500; group label follows block title |
| Button | 14px / 500 / 1.25 |
| Field label | 14px / 600 / 1.45 |
| Field value | 16px / 1.45 / 400 |
| Field hint | 12px / 1.45 / 400, `--ink-muted` |
| Field error | 12px / 1.45, `--danger` |
| Slider readout | 14px / 600, tabular; mono when the value is the focus |
| Counter value | 16px / 600 mono / 1.25, tabular |
| Timer value | 23px / 700 mono / 1.25, tabular; 16px below 620px |
| Chart axis | 11px tabular; chart title 12px / 500 |
| Chart tooltip | 12px / 1.45; value 600 tabular |

## Rhythm around type

- Top-level headings: 32px above, 12px below. Inside a section: 16px above, 12px below.
- Paragraphs, lists, tables, code, cards and blocks: 16px block gap.
- First/last child of the document or a container drops its outer margin.
- Blockquote: 2px `--accent-line` left rule, 4px top/bottom padding, 16px left padding, `--ink-soft`.
- Lists: 0.7em block margin, 1.5em left padding, 0.25em between items.
- Horizontal rule: 24px block margin, 1px `--line`.

Do not add vertical margins to inline components (badges, tooltips, statuses); they sit in the text flow.

## Numerals and code

- Values that change, align or compare use `font-variant-numeric: tabular-nums`: counters, timers, sliders, tables, chart labels, progress, pagination.
- Use mono for timers, counters, code and technical readouts; use the sans font with tabular numerals for table cells and metadata.
- Do not use a monospace font for prose. It breaks the reading rhythm and makes CJK text inconsistent.
- Code blocks use 14px mono at 1.6; inline code is 14px mono with a 12px radius and `--neutral-soft` fill.

## Multilingual

- The sans stack falls back to `PingFang SC`, `Hiragino Sans GB`, `Microsoft YaHei` and `Noto Sans SC`.
- Keep 1.7 body leading for mixed Chinese/English text; 1.6 is acceptable for 14px secondary copy.
- Avoid uppercase overlines for long CJK phrases. Use sentence case with 600 weight instead.
- Keep the 720px measure for CJK prose; line lengths above 40–45 CJK characters become tiring.
- Do not use italic for CJK emphasis; use 600 weight or `--ink-soft` instead.
- Test headings at 700 in CJK; if the face renders too heavy, use 600 for compact UI titles but keep document headings at 700.

## Responsive

- Body stays 16px at every width. Do not shrink body text on mobile.
- The document column shrinks to the viewport; padding, not font size, absorbs the change.
- Tabs drop to 12px and tighter horizontal padding below 480px.
- Timer readouts drop from 23px to 16px below 620px.
- Headings keep their scale; if a title overflows, rewrite it rather than inventing a smaller size.
- Long words and URLs use `overflow-wrap: anywhere`; do not reduce the font size to fit.

## Accessibility

- 16px body, 14px minimum for control labels, 12px minimum for metadata. Do not set meaningful text below 12px.
- Meaningful text must meet 4.5:1. `--ink-muted` is chosen to clear the floor on both `--surface` and `--paper`; do not replace it with a lighter decorative grey.
- Do not justify body text; it creates uneven CJK spacing.
- Do not use colour alone to mark a heading level or a state; pair it with size, weight or a label.
- Uppercase overlines are for short state labels, not for sentences.

## Anti-patterns

| Avoid | Use |
| --- | --- |
| 13 / 15 / 18 / 20 / 24 / 25px in general UI | 12 / 14 / 16 / 17 / 19 / 23 / 28px |
| 300 or 800 weights | 400 / 500 / 600 / 700 |
| Positive tracking on body | 0 tracking; negative only on display |
| 1.4 leading on body prose | 1.7 |
| Multiple display sizes in one card | One block title at 17/600 |
| All-caps long headings | Sentence case with 600/700 |
| Mono for prose | Sans with tabular numerals |
| Shrinking body to fit mobile | Keep 16px; let the column shrink |