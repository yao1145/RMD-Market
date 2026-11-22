# Custom theme development reference

A theme changes visuals only. It does not change document semantics, component implementations or interactions. Protocol revision: `reactive-md-theme-1`. Every theme except the built-in `default` is registered by the host, and the host loads its CSS.

Authoritative documents:

- [Theme protocol](https://github.com/yao1145/ReactiveMD/blob/main/docs/reference/theme-protocol-en.md)
- [Directory discovery](https://github.com/yao1145/ReactiveMD/blob/main/docs/integration/directory-discovery-en.md)
- [Extension SDK](https://github.com/yao1145/ReactiveMD/blob/main/docs/integration/extension-sdk-en.md)
- [Component package theme example](https://github.com/yao1145/ReactiveMD/blob/main/examples/component-package/src/theme.ts)
- [Sci-fi theme example](https://github.com/yao1145/ReactiveMD/tree/main/examples/sci-fi-theme)

## 1 Theme contract

| Field | Requirement |
| --- | --- |
| `name` | Lowercase kebab-case, starts with a letter, at most 64 characters; unique in the host list; `default` is reserved |
| `protocol` | `reactive-md-theme-1`; use `LOCAL_THEME_PROTOCOL` |
| `colorSchemes` | Must include both `light` and `dark` |
| `id` | Stable package identity such as `acme/theme-paper` |
| `version` | Semantic version |

Only `default` is built in. When a document writes `<theme name="paper">`, the host must register `paper`; otherwise rendering falls back to `default` with a warning. Registration does not carry CSS; the host loads it.

The document root exposes:

```html
<article class="md-document local-document"
         data-rmd-theme="paper"
         data-color-scheme="dark">
```

Every theme rule must be scoped to that root or its descendants. `:root`, `html`, `body` and unscoped element rules are rejected or leak to the host.

## 2 Integration modes

| Case | Location | Registration |
| --- | --- | --- |
| Host-project theme | `theme/<name>/theme.css` (optional `theme.json`) | Vite directory discovery; documents select by `name` |
| Distributable npm package | `defineLocalTheme` package | `createLocalConfig({ themes })`, `createReactHost({ themes })` or the renderer `themes` prop |

Directory mode fits site-specific themes. Package mode fits cross-project distribution, composition and offline export.

## 3 Directory mode

```text
theme/paper/
├── theme.json
├── theme.css
└── assets/
    ├── tokens.css
    ├── components.css
    └── fonts/
        └── paper-serif.woff2
```

`theme.json`:

```json
{
  "id": "reactive-md/theme-paper",
  "name": "paper",
  "version": "1.0.0",
  "protocol": "reactive-md-theme-1",
  "colorSchemes": ["light", "dark"]
}
```

Every field except `theme.css` is optional. The directory name supplies the default name, `local/theme/<directory>` supplies the default package ID, and the version defaults to `0.0.0`.

`theme.css`:

```css
@import './assets/tokens.css';
@import './assets/components.css';
```

Directory discovery inlines relative `@import` and `url()` references to local fonts and images as `data:` resources. Remote URLs, paths outside the directory and budget overruns fail. Documents select the theme with:

```markdown
<theme name="paper">
```

## 4 Package mode

```ts
// theme.ts
import { defineLocalTheme } from 'reactive-md/sdk';
import tokensCss from './tokens.css?raw';
import componentsCss from './components.css?raw';

export const paper = defineLocalTheme({
  id: 'acme/theme-paper',
  name: 'paper',
  version: '1.0.0',
  protocol: 'reactive-md-theme-1',
  colorSchemes: ['light', 'dark'],
  css: [
    { id: 'acme/theme-paper.tokens.css', css: tokensCss },
    { id: 'acme/theme-paper.components.css', css: componentsCss },
  ],
});
```

`defineLocalTheme`:

- validates protocol, name, version, both color schemes and resource budgets;
- scopes selectors to `[data-rmd-theme="paper"]`;
- places rules in `@layer rmd.themes`;
- namespaces `@font-face` family names and rewrites matching `font-family` / `font` references;
- accepts inline `data:` URLs only and rejects network references, `@import`, `@keyframes` and CSS escapes outside strings;
- freezes the result so resources can go directly to rendering, SSR and export.

Compose themes:

```ts
import { composeLocalTheme, collectLocalThemeCss } from 'reactive-md/sdk';

const paperContrast = composeLocalTheme({
  id: 'acme/theme-paper-contrast',
  name: 'paper-contrast',
  version: '1.0.0',
  base: paper,
  overrides: [
    { id: 'acme/theme-paper-contrast.css', css: contrastCss },
  ],
});

const stylesheet = collectLocalThemeCss(paperContrast);
```

`composeLocalTheme` retargets the base theme selectors to the new name and appends override resources after the base stylesheet. Override resource IDs must not duplicate base resource IDs.

## 5 CSS scope and layers

Directly loaded stylesheets (for example `theme/paper/theme.css`) declare the order before defining any RMD layer:

```css
@layer rmd.reset, rmd.defaults, rmd.components, rmd.themes, rmd.overrides;
```

Theme rules go into `rmd.themes`:

```css
@layer rmd.themes {
  [data-rmd-theme="paper"] {
    /* tokens */
  }

  [data-rmd-theme="paper"] .md-panel {
    /* component enhancements */
  }
}
```

- Always declare the layer order, even when the theme CSS loads before the public stylesheet.
- Use root scoping and component selectors for specificity; do not use `!important`.
- Do not override internal DOM nesting or CSS module hashes. Supported interfaces are root classes, component outer classes, `data-rmd-component`, `data-rmd-part`, semantic state attributes and public `.md-*` / `.local-*` classes.
- Shared component styles use `:where()` and zero specificity; an ordinary component class can override any property it declares, including interaction states.
- Hidden elements stay hidden. Print keeps native control values and built-in summaries.

## 6 Tokens

A theme inherits the complete default variable set and overrides only what it needs. Design and check both light and dark.

```css
[data-rmd-theme="paper"] {
  color-scheme: light;

  --surface: #fffdf7;
  --document-bg: #fffdf7;
  --surface-subtle: #f3eee3;
  --surface-hover: #f7f1e6;
  --surface-active: #efe7d8;

  --ink: #2b2620;
  --ink-soft: #5c5348;
  --ink-muted: #7a6f61;
  --line: #ded4c4;
  --line-strong: #c8bca8;

  --accent: #9a5b2e;
  --accent-hover: #7f4a24;
  --accent-soft: #f2e3d2;
  --accent-line: #d9b995;
  --accent-ink: #fffaf3;
  --accent-text: #8a4f27;

  --focus: #9a5b2e;
  --focus-outline: 2px solid var(--focus);
  --focus-ring: 0 0 0 3px color-mix(in srgb, var(--focus) 25%, transparent);

  --code-bg: #f3eee3;
  --code-bg-deep: #2b2620;
  --code-ink: #2b2620;

  --font-sans: "Paper Sans", system-ui, sans-serif;
  --font-mono: "Paper Mono", ui-monospace, monospace;
  --radius-control: 4px;
  --radius-card: 8px;
  --radius-panel: 10px;
}

[data-rmd-theme="paper"][data-color-scheme="dark"] {
  color-scheme: dark;

  --surface: #1d1a16;
  --document-bg: #1d1a16;
  --surface-subtle: #29241e;
  --surface-hover: #322b24;
  --surface-active: #3b332a;

  --ink: #f4ecdf;
  --ink-soft: #d4c7b6;
  --ink-muted: #ab9c89;
  --line: #453b31;
  --line-strong: #5d5042;

  --accent: #e0a36b;
  --accent-hover: #edb680;
  --accent-soft: #3b2d21;
  --accent-line: #7a5839;
  --accent-ink: #241a11;
  --accent-text: #f0bb8b;

  --focus: #e0a36b;
  --code-bg: #29241e;
  --code-bg-deep: #120f0c;
  --code-ink: #f4ecdf;
}
```

Public variables:

| Purpose | Variables |
| --- | --- |
| Surfaces | `--paper`, `--surface`, `--document-bg`, `--surface-subtle`, `--surface-hover`, `--surface-active`, `--image-zoom-backdrop`, `--dialog-backdrop` |
| Text and borders | `--ink`, `--ink-soft`, `--ink-muted`, `--line`, `--line-strong` |
| Accent | `--accent`, `--accent-hover`, `--accent-soft`, `--accent-line`, `--accent-ink`, `--accent-text` |
| Status | `--info`, `--info-soft`, `--success`, `--success-soft`, `--success-line`, `--warning`, `--warning-soft`, `--warning-line`, `--danger`, `--danger-soft`, `--danger-line`, `--neutral-soft` |
| Focus | `--focus`, `--focus-outline`, `--focus-ring` |
| Data and code | `--chart-1`–`--chart-8`, `--chart-grid`, `--chart-axis`, `--code-bg`, `--code-bg-deep`, `--code-ink` |
| Fonts | `--font-sans`, `--font-mono`, `--text-xs`–`--text-xl`, `--text-2xl`, `--text-h5`, `--text-h6`, `--text-block-title`, `--text-block-subtitle` |
| Line height and weight | `--leading-tight`, `--leading-snug`, `--leading-normal`, `--leading-relaxed`, `--weight-regular`, `--weight-medium`, `--weight-semibold`, `--weight-bold` |
| Spacing | `--space-1`–`--space-7`, `--field-gap` |
| Radius | `--radius-control`, `--radius-card`, `--radius-panel`, `--radius-pill`, `--radius-field`, `--radius-field-multiline` |
| Controls | `--control-height-sm`, `--control-height`, `--control-height-lg`, `--control-padding-x`, `--control-padding-y`, `--control-inset-x`, `--control-selected`, `--control-selected-ink`, `--control-track`, `--control-thumb`, `--disabled-opacity` |
| Tables | `--table-cell-padding-y`, `--table-cell-padding-x` |
| Motion and elevation | `--motion-fast`, `--motion-base`, `--motion-slow`, `--ease-standard`, `--shadow-sm`, `--shadow-md`, `--shadow-lg` |

`--document-bg` defaults to `--surface`. `--accent-ink` is text on accent fills; `--accent-text` is accent used as ink. Component variables use the `--rmd-` prefix, for example `--rmd-slider-thumb-width`, `--rmd-slider-thumb-height`, `--rmd-slider-track-height` and `--rmd-slider-track-radius`. Density uses `data-rmd-density="compact"` or `"comfortable"` on the root.

## 7 Component overrides

A theme can override variables and add `.md-*` / `.local-*` component rules:

```css
[data-rmd-theme="paper"] .md-panel {
  background: var(--surface);
  border-color: var(--line);
  border-radius: var(--radius-panel);
}

[data-rmd-theme="paper"] .md-button-primary {
  background: var(--accent);
  color: var(--accent-ink);
}

[data-rmd-theme="paper"] .md-badge-success {
  background: var(--success-soft);
  color: var(--success);
}

[data-rmd-theme="paper"] .md-table tbody tr[data-state="selected"] {
  background: var(--accent-soft);
}
```

Public hooks:

| Area | Classes or attributes |
| --- | --- |
| Surfaces | `md-card`, `md-panel`, `md-group` and their `-title` / `-body` parts |
| Status | `md-badge`, `md-status`, `md-badge-*`, `md-status-*` |
| Feedback | `md-alert`, `md-alert-*`, `md-empty-state`, `md-spinner`, `md-skeleton` |
| Navigation | `md-tabs`, `md-tablist`, `md-tab`, `md-tabpanel`, `md-pagination`, `md-steps`, `md-step` |
| Tables | `md-table`, `md-table-striped`, `aria-selected="true"`, `data-state="selected"` |
| Charts | `md-chart`, `md-chart-axis`, `md-chart-grid`, `md-chart-legend`, `md-chart-node`, `md-chart-edge`, `md-chart-series-line`, `md-chart-series-area` |
| Component instances | `data-rmd-component`, `data-rmd-part` |

Chart series elements set `--series-color`; `data-series="1"`–`"8"` map to `--chart-1`–`--chart-8`.

Native `<button>`, fields, `select`, `textarea`, `input[type="checkbox"]`, `radio`, `range`, `progress`, `meter`, `details`, `dialog` and `[popover]` already receive the shared skin inside `.md-document`. Adjust them through variables. A component that needs a fully custom appearance sets `data-rmd-appearance="custom"`; that element opts out of the shared skin while descendants keep it.

Density:

```html
<article data-rmd-density="compact">...</article>
```

`compact` and `comfortable` adjust control height and table cell padding.

## 8 Registration

Directory mode: `reactiveMd()` scans `theme/<name>/`, calls `defineLocalTheme` to validate, scope and register, and watches CSS and asset changes. Documents select the theme with `<theme name="...">`.

Package mode:

```ts
import { createLocalConfig } from 'reactive-md/sdk';
import { createReactConfig } from 'reactive-md/react';
import { paper } from './theme';

const config = createLocalConfig({ themes: [paper] });
const reactConfig = createReactConfig(config, { /* components */ });
```

Or use `createReactHost({ themes: [paper] })`; its `resources` and `css` already include the theme:

```tsx
import { createReactHost, LocalReactiveDocument } from 'reactive-md/react';
import { paper } from './theme';

const host = createReactHost({ themes: [paper] });

<LocalReactiveDocument source={source} reactConfig={host.reactConfig} />
```

Direct renderer registration (the host loads CSS itself):

```tsx
import { LOCAL_THEME_PROTOCOL } from 'reactive-md';
import { LocalReactiveDocument } from 'reactive-md/react';
import 'reactive-md/styles.css';
import './paper-theme.css';

const paperTheme = {
  name: 'paper',
  protocol: LOCAL_THEME_PROTOCOL,
  colorSchemes: ['light', 'dark'],
} as const;

<LocalReactiveDocument source={source} themes={[paperTheme]} colorScheme="auto" />
```

The `themes` prop cannot be combined with `reactConfig`; when using `reactConfig`, themes come from its configuration. `colorScheme` accepts `light`, `dark` or `auto`. `auto` reads the nearest ancestor preference (`data-color-scheme` or `data-theme`) and then the system preference. Server output starts in light mode. Changing the theme or color scheme does not create a new runtime.

## 9 Fonts and assets

- Directory mode: place fonts and images in the theme directory and reference them with relative `url()` or `@import`; discovery inlines them.
- Package mode: use only `data:` URLs in CSS; convert local files to data URLs before passing them to `defineLocalTheme`.
- `@font-face` family names are namespaced; matching `font-family` and `font` references are rewritten. Complex `font` shorthands such as `font: var(--size) Brand` fail when local fonts are declared; use an explicit size and `font-family`.
- Remote fonts, remote images, `@import` and `@keyframes` are unsupported in theme packages.

## 10 Acceptance

A theme must cover every component in both light and dark modes, including hover, focus, active, disabled, error and selected states. Check:

- Text and controls have readable contrast; focus rings are always visible.
- Layout works at 375px; tables, tabs, dialogs and charts do not overflow.
- Reduced-motion preferences are respected.
- Font changes are checked against SVG diagram labels, nodes and bounds.
- Multiple isolated themes on one page do not affect each other; a forced light theme works inside a dark host.
- Theme switching preserves component runtime state; unmount cleans up styles.
- Static, SSR and offline export load the same CSS.

```sh
# ReactiveMD engine repository
npm run test:theme:browser

# ReactiveMD-Demo
npm test
npm run build
npm run test:export
```

## 11 Common errors

| Problem | Fix |
| --- | --- |
| Document selects the theme but sees default visuals | Confirm registration, matching name and loaded CSS |
| Theme affects the host page | Scope every rule to `[data-rmd-theme="name"]`; remove `:root`/`html`/`body` rules |
| Only light mode exists | `colorSchemes` must contain both; add dark tokens |
| Theme package reports `@import` | Merge/inline resources before packaging |
| Theme package reports a network URL | Convert images and fonts to `data:` URLs |
| `@keyframes` is rejected | Themes support document-scoped CSS only; move animation into the component |
| Override has no effect | Check `@layer rmd.themes` order, root scoping and selector specificity |
| State is lost after switching themes | Switch on the same document instance; avoid recreating the runtime |
| Charts or tables are unreadable in dark mode | Override `--chart-*`, `--chart-grid`, `--chart-axis`, `--line` and check both modes |