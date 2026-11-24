# RMD Product UI motion

Motion is functional, short and reversible. It confirms a state change, reveals a layer or moves a selection. It does not decorate, bounce or loop for attention. The system uses one tween curve for CSS and an optional critically damped spring layer for gesture-driven UI.

Measurement basis: ReactiveMD Product UI `0.9.2`. The skill is self-contained; no source checkout is required.

## Contract

| Token | Value | Use |
| --- | --- | --- |
| `--motion-fast` | 150ms | Colour, background, border, shadow, icon state |
| `--motion-base` | 220ms | Structure: overlays, disclosure height, sliding indicators, thumb travel, chevron rotation |
| `--motion-slow` | 300ms | Progress width, large layout size |
| `--ease-standard` | `cubic-bezier(0.22, 0.61, 0.36, 1)` | Every CSS transition |

Role timings outside the three tokens:

| Role | Value | Why |
| --- | --- | --- |
| Press | 100–160ms | Answer before the selection settles |
| Tooltip | 170ms | Intentionally shorter than `--motion-base` |
| Feedback pop | 160ms | Counter/copy feedback |
| Select exit | 0ms by default | Menus leave immediately; the next state should not wait |
| Select indicator delay | 40ms | The check mark settles after the menu |

Rules:

1. Animate `transform`, `opacity`, `background-color`, `border-color`, `color`, `box-shadow`, `scale`, `filter` and `stroke`. Avoid layout properties unless the component specifically owns a height transition (disclosure, `interpolate-size`).
2. Duration is 150/220/300ms. Do not use 250ms, 400ms or arbitrary “smooth” values.
3. There is no bounce and no overshoot. A dialog opens and closes in the same duration.
4. Entrance is a small scale change, not a slide. Directional movement is reserved for menus/tooltips that have a real origin.
5. No infinite decorative animation. A spinner or shimmer is the only loop.
6. Motion never carries meaning alone: a state also changes colour, border, label or position.
7. Use `@media (hover: hover) and (pointer: fine)` for hover-only effects.
8. Every animated component needs a `prefers-reduced-motion` guard.

## Role map

| Interaction | Duration | Property | Notes |
| --- | --- | --- | --- |
| Link / icon / text hover | 150ms | `color`, `background-size` | Link underline uses 160ms |
| Button hover | 150ms | background, border, colour, shadow | Hover lift uses `--shadow-sm` |
| Badge/status tint | 180ms | background, border, colour | State tint only |
| Button press | 100–150ms | `scale` + background + inset shadow | `scale: 0.97` |
| Checkbox press | 100–150ms | `scale: 0.95` | Row focus ring stays |
| Option row press | 150ms | `scale: 0.99` | Checklist/radio/multi-select |
| Switch | 220ms | thumb position + track colour | Active thumb stretches 20→26px |
| Segmented thumb | 220ms | `translateX` | 2–4 choices |
| Tab indicator | 220ms | `left` | 3px accent underline |
| Tab panel | 220ms | opacity + 4px rise | `@starting-style` |
| Disclosure height | 220ms | height / grid rows | `interpolate-size: allow-keywords` |
| Disclosure body | 220ms | `-6px` + blur 2px | Settles to none/0 |
| Chevron | 220ms | rotation 180° | Colour 150ms |
| Dialog | 220ms | opacity + `scale(.96)` | Backdrop fades |
| Popover | 220ms | opacity + `scale(.98)` | Scale only; placement is author-owned |
| Menu | 220ms | opacity + `scale(.97)` + `translateY(-6px)` | Origin-aware |
| Tooltip | 170ms | opacity + `translateY(6px)` | Shorter than base |
| Counter | 160ms | `scale(1.12)` + opacity .65 | One pulse |
| Copy feedback | 160ms | opacity + `translateY(.25em)` + blur 2px | New word rises |
| Progress | 300ms | width | Determinate progress only |
| Skeleton | 1.4s linear infinite | background position | Loading only |
| Spinner | 0.8s linear infinite | rotation | Loading only |
| Steps rail | 220ms | background-size | Progress fill |

## CSS recipes

### State transition

```css
.button {
  transition:
    background-color var(--motion-fast) var(--ease-standard),
    border-color var(--motion-fast) var(--ease-standard),
    color var(--motion-fast) var(--ease-standard),
    box-shadow var(--motion-fast) var(--ease-standard);
}
```

Name properties. Never write `transition: all`.

### Press scale

```css
.button {
  scale: 1;
  transition:
    background-color var(--motion-fast) var(--ease-standard),
    scale var(--motion-fast) var(--ease-standard);
}

.button:active:not(:disabled) {
  scale: 0.97;
  background: var(--surface-active);
}

.button-primary:active:not(:disabled) {
  box-shadow: var(--button-press-shadow);
}
```

Use the `scale` property, not `transform: scale(...)`. A host or component may already own `transform`; `scale` composes instead of overwriting it. Triggers that anchor a floating layer (Radix and similar) keep their rect still; do not scale them on press.

### Dialog enter and exit

```css
.dialog {
  opacity: 0;
  transform: scale(0.96);
  transition:
    opacity var(--motion-base) var(--ease-standard),
    transform var(--motion-base) var(--ease-standard),
    display var(--motion-base) var(--ease-standard),
    overlay var(--motion-base) var(--ease-standard);
  transition-behavior: allow-discrete;
}

.dialog[open] {
  opacity: 1;
  transform: none;
}

@starting-style {
  .dialog[open] {
    opacity: 0;
    transform: scale(0.96);
  }
}

.dialog::backdrop {
  background: rgb(23 26 31 / 42%);
  opacity: 0;
  transition:
    opacity var(--motion-base) var(--ease-standard),
    display var(--motion-base) var(--ease-standard),
    overlay var(--motion-base) var(--ease-standard);
  transition-behavior: allow-discrete;
}

.dialog[open]::backdrop {
  opacity: 1;
}

@starting-style {
  .dialog[open]::backdrop {
    opacity: 0;
  }
}
```

The open state ends at `transform: none` so the top-layer dialog does not become a containing block for fixed descendants. The backdrop uses 42% dark overlay in light mode and 64% black in dark mode.

### Popover and menu

```css
.popover {
  opacity: 0;
  transform: scale(0.98);
  transition:
    opacity var(--motion-base) var(--ease-standard),
    transform var(--motion-base) var(--ease-standard),
    display var(--motion-base) var(--ease-standard),
    overlay var(--motion-base) var(--ease-standard);
  transition-behavior: allow-discrete;
}

.popover:popover-open {
  opacity: 1;
  transform: none;
}

@starting-style {
  .popover:popover-open {
    opacity: 0;
    transform: scale(0.98);
  }
}

.menu {
  --menu-x: 0px;
  --menu-y: -6px;
  opacity: 0;
  transform: translate(var(--menu-x), var(--menu-y)) scale(0.97);
  transform-origin: var(--menu-origin, top left);
  animation: menu-in var(--motion-base) var(--ease-standard) both;
}

@keyframes menu-in {
  from {
    opacity: 0;
    transform: translate(var(--menu-x), var(--menu-y)) scale(0.97);
  }
}
```

Popovers and menus are scale-only unless the trigger has a real direction. A tooltip that uses the Popover API for top-layer behavior does not inherit this skin.

### Tooltip

```css
.tooltip {
  opacity: 0;
  transform: translateY(6px);
  transition:
    opacity 170ms var(--ease-standard),
    transform 170ms var(--ease-standard),
    display 170ms var(--ease-standard);
  transition-behavior: allow-discrete;
}

.tooltip.is-visible {
  opacity: 1;
  transform: translateY(0);
}

@starting-style {
  .tooltip.is-visible {
    opacity: 0;
    transform: translateY(6px);
  }
}
```

Tooltip ink is `--tooltip-ink` on `--tooltip-bg`; radius `--radius-control`; 12px / 500.

### Tabs

```css
.tablist {
  position: relative;
  --tab-index: 0;
  --tab-count: 3;
}

.tablist::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: calc(var(--tab-index) * 100% / var(--tab-count));
  width: calc(100% / var(--tab-count));
  height: 3px;
  border-radius: var(--radius-xs) var(--radius-xs) 0 0;
  background: var(--accent);
  transition: left var(--motion-base) var(--ease-standard);
}

.tabpanel:not([hidden]) {
  opacity: 1;
  transform: translateY(0);
  transition:
    opacity var(--motion-base) var(--ease-standard),
    transform var(--motion-base) var(--ease-standard);
}

@starting-style {
  .tabpanel:not([hidden]) {
    opacity: 0;
    transform: translateY(4px);
  }
}
```

### Disclosure and accordion

```css
html { interpolate-size: allow-keywords; }

.disclosure {
  overflow: clip;
  height: auto;
  opacity: 1;
  transition:
    height var(--motion-base) var(--ease-standard),
    opacity var(--motion-base) var(--ease-standard),
    padding-block var(--motion-base) var(--ease-standard),
    visibility 0s;
}

.disclosure[hidden] {
  display: block;
  height: 0;
  padding-block: 0;
  opacity: 0;
  visibility: hidden;
  transition:
    height var(--motion-base) var(--ease-standard),
    opacity var(--motion-base) var(--ease-standard),
    padding-block var(--motion-base) var(--ease-standard),
    visibility 0s var(--motion-base);
}

.disclosure-body {
  transform: translateY(0);
  filter: none;
  transition:
    transform var(--motion-base) var(--ease-standard),
    filter var(--motion-base) var(--ease-standard);
}

.disclosure[hidden] .disclosure-body {
  transform: translateY(-6px);
  filter: blur(2px);
}

.chevron {
  transform-origin: center;
  transition:
    transform var(--motion-base) var(--ease-standard),
    color var(--motion-fast) var(--ease-standard);
}

.trigger[aria-expanded="true"] .chevron {
  transform: rotate(180deg);
}
```

Native `<details>` uses the same 220ms height with `::details-content` and `content-visibility ... allow-discrete`. If `interpolate-size` is unsupported, the panel opens instantly; that is the correct fallback.

For a framework that cannot animate `height: auto`, use a `grid-template-rows: 0fr → 1fr` wrapper, as the generated preview does. Keep the 220ms clock and the -6px/2px blur body.

### Segmented control

```css
.segmented {
  --seg-index: 0;
  --seg-count: 3;
  position: relative;
  display: grid;
  grid-template-columns: repeat(var(--seg-count), minmax(0, 1fr));
  padding: 4px;
  border: 1px solid var(--line);
  border-radius: var(--radius-button);
  background: var(--segmented-track);
}

.segmented::before {
  content: "";
  position: absolute;
  inset-block: 4px;
  left: 0;
  width: calc(100% / var(--seg-count));
  border: 1px solid var(--accent-line);
  border-radius: var(--radius-control);
  background: var(--segmented-thumb);
  box-shadow: var(--shadow-sm);
  transform: translateX(calc(var(--seg-index) * 100%));
  transition: transform var(--motion-base) var(--ease-standard);
}
```

Selected labels use `--accent-text`; 2–4 choices become a segmented control, 5+ wrap as pills. The thumb, not the button, carries the selected fill.

### Switch

```css
.switch {
  appearance: none;
  width: 42px;
  height: 24px;
  border: 1px solid var(--line-strong);
  border-radius: var(--radius-pill);
  background-color: var(--control-track);
  background-image: radial-gradient(
    ellipse 50% 50% at center,
    var(--control-thumb) 0 80%,
    var(--line-strong) 85% 90%,
    transparent 95%
  );
  background-repeat: no-repeat;
  background-size: 20px 20px;
  background-position: left 2px center;
  transition:
    background-color var(--motion-fast) var(--ease-standard),
    background-position var(--motion-base) var(--ease-standard),
    background-size var(--motion-base) var(--ease-standard),
    border-color var(--motion-fast) var(--ease-standard),
    box-shadow var(--motion-fast) var(--ease-standard);
}

.switch:checked {
  border-color: transparent;
  background-color: var(--control-selected);
  background-image: radial-gradient(
    ellipse 50% 50% at center,
    var(--control-selected-ink) 0 90%,
    transparent 95%
  );
  background-position: right 2px center;
}

.switch:active {
  background-size: 26px 20px;
}
```

The thumb widens toward the far edge on press, as if it carried the press. It never overshoots the track.

### Counter and copy feedback

```css
.counter-value > span {
  display: inline-block;
  transform: scale(1);
  opacity: 1;
  transition:
    transform 160ms var(--ease-standard),
    opacity 160ms var(--ease-standard);
}

@starting-style {
  .counter-value > span {
    transform: scale(1.12);
    opacity: 0.65;
  }
}

.copy-feedback {
  transition:
    opacity var(--motion-fast) var(--ease-standard),
    transform var(--motion-base) var(--ease-standard),
    filter var(--motion-base) var(--ease-standard);
}

@starting-style {
  .copy-feedback {
    opacity: 0;
    transform: translateY(0.25em);
    filter: blur(2px);
  }
}
```

Remount the changed value so `@starting-style` replays without moving the surrounding row. The old word leaves at once; the new word rises out of a short blur.

### Progress, spinner and skeleton

```css
.progress-fill {
  transition: width var(--motion-slow) var(--ease-standard);
}

.spinner {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(1turn); }
}

.skeleton {
  background-image: linear-gradient(
    90deg,
    transparent 0%,
    var(--surface-hover) 50%,
    transparent 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.4s linear infinite;
}

@keyframes shimmer {
  from { background-position: 100% 0; }
  to { background-position: -100% 0; }
}
```

Spinners and skeletons are the only infinite loops. Both stop under reduced motion.

### Link underline

```css
.link {
  color: var(--accent-text);
  text-decoration: none;
  background-image: linear-gradient(var(--accent-line), var(--accent-line));
  background-repeat: no-repeat;
  background-position: 0 100%;
  background-size: 0% 1px;
  transition:
    background-size 160ms var(--ease-standard),
    color var(--motion-fast) var(--ease-standard);
}

.link:hover,
.link:focus-visible {
  color: var(--accent);
  background-size: 100% 1px;
}
```

### Charts and diagrams

Charts are colour-only. Do not animate geometry or the viewBox.

```css
.chart [data-series] {
  transition: opacity var(--motion-fast) var(--ease-standard);
}

.chart .donut-slice {
  transition:
    opacity var(--motion-fast) var(--ease-standard),
    transform 200ms var(--ease-standard);
}

.diagram-node {
  transition:
    fill 150ms var(--ease-standard),
    stroke 150ms var(--ease-standard),
    filter 150ms var(--ease-standard);
}
```

Dimmed series use opacity 0.22; selected/focused marks take the focus colour and a 2.4 stroke. Diagram node shadow is `0 2px 3px rgb(0 0 0 / 4%)`.

## Optional spring layer

The CSS contract is a tween: 150/220/300ms with `cubic-bezier(0.22, 0.61, 0.36, 1)`. Gesture-driven components may add a critically damped spring layer:

| Token | Value | Use |
| --- | --- | --- |
| `spring.snappy` | visualDuration 0.26s, bounce 0 | Presses, toggles, slider thumbs, small indicators |
| `spring.smooth` | visualDuration 0.40s, bounce 0 | Panels, height changes, layout shifts |
| `spring.morph` | visualDuration 0.42s, bounce 0 | Shape morphs, shared-layout highlights, width changes |
| `duration.instant` | 0.12s | Reduced-motion or zero-wait state |
| `duration.fast` | 0.16s | Small state changes |
| `duration.exit` | 0.18s | Exits |
| `duration.standard` | 0.24s | Standard structural change |
| `duration.considered` | 0.48s | Deliberate, larger choreography |
| `ease.enter` | `[0.16, 1, 0.3, 1]` | Enter |
| `ease.exit` | `[0.7, 0, 0.84, 0]` | Exit |
| `ease.standard` | `[0.22, 1, 0.36, 1]` | Standard |
| `ease.inOut` | `[0.65, 0, 0.35, 1]` | On-screen movement |
| `blur.subtle` | 2px | Small crossfade |
| `blur.soft` | 4px | Soft crossfade |
| `blur.text` | 8px | Text crossfade |

The source system's adapted controls use the same clock: a 0.15s fast tween and a 0.22s base tween with `[0.22, 0.61, 0.36, 1]`, so the JS and CSS layers agree. If your stack does not have a spring layer, do not emulate it with CSS cubic-bezier bounces; use the tween contract.

## Reduced motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Component-level guards should also reset the properties that carry motion:

```css
@media (prefers-reduced-motion: reduce) {
  .switch { transition: none; }
  .switch:active { background-size: 20px 20px; }
  .choice, .choice:active { scale: 1; }
  .tabpanel:not([hidden]) { opacity: 1; transform: none; }
  .copy-feedback { opacity: 1; transform: none; filter: none; }
  .spinner, .skeleton { animation: none; }
}
```

Reduced motion must not hide content or remove state. Entrance states settle at opacity 1, scale 1, transform none, filter none. A dialog appears instantly; a disclosure opens instantly; a spinner becomes a static loading indicator.

Test with the OS setting or a Playwright context with `reducedMotion: 'reduce'`. Do not simulate it by deleting the motion code.

## Print and forced colours

- Print: no transitions/animations, no shadows, overlays expand (`max-height: none`, `overflow: visible`), backdrops transparent, tooltips become ink on paper, charts keep the print-safe palette.
- Forced colours: use `Canvas`, `CanvasText`, `Highlight`, `HighlightText`; restore platform checkbox/radio marks; remove translucent backdrops and decorative shadows.

## Performance

- Animate `transform`, `opacity`, `scale`, `filter`, `stroke`, `fill` and colours. Avoid animating `width`, `height`, `top`, `left` unless the component owns a deliberate height transition.
- `will-change` only on elements that actually move continuously or are about to animate (calendar strip/highlight, date-picker popover). Remove it when idle where possible.
- Avoid `transition: all`; it can animate layout and create jank.
- Keep total stagger under about 0.4s. Stagger is not part of the default document language; use it only in marketing or onboarding surfaces.
- Blur is small and brief: 2px for state feedback, 4px for soft overlays, 8px only for text crossfades.

## Anti-patterns

| Avoid | Use |
| --- | --- |
| 250ms / 400ms / 600ms interactions | 150 / 220 / 300ms |
| `ease`, `ease-in-out`, custom spring bezier | `cubic-bezier(0.22, 0.61, 0.36, 1)` |
| Bounce / overshoot | Critically damped or tween |
| `transition: all` | Named properties |
| `transform: scale(.97)` on press | `scale: .97` |
| Infinite decorative motion | Static state; loop only for loading |
| Dialog sliding across the screen | Scale 0.96 + fade |
| Tooltip 300ms | 170ms |
| Reduced-motion that hides content | Settle at the resting state |
| Motion as the only selected/error signal | Pair with colour, label or border |