---
name: reactive-md-extension-authoring
description: "Create ReactiveMD custom components and themes. Use when adding plugin/<name> components, theme/<name> themes, defineLocalComponent, defineReactComponentPackage, defineLocalTheme packages, manifests, scoped CSS, theme tokens, or extension registration."
---

# ReactiveMD extension authoring

Components register new document tags; themes change visuals only. For document authoring, use `reactive-md-authoring`.

Contracts: component `reactive-md-component/v1`, theme `reactive-md-theme-1`, SDK `0.7.0` (`reactive-md@0.8.0`), styles `reactive-md-styles-1`.

References:

- `references/custom-components.md`: manifest fields, context API, directory/package implementations, SSR/offline export, compliance and verification.
- `references/custom-themes.md`: theme protocol, directory/package modes, scope and layers, tokens, component hooks, registration and acceptance.

## Choose the integration surface

| Case | Location | Notes |
| --- | --- | --- |
| Component in a host project | `plugin/<name>/` | Vite discovery registers it; `component.css` is collected automatically |
| Theme in a host project | `theme/<name>/` | `theme.css` plus optional `theme.json` |
| Distributable component | `npx reactive-md init component` | Pure manifest, React entry, styles, preview and compliance scripts |
| Distributable theme | `defineLocalTheme` package | Composable and exportable; the host loads CSS and registers it |
| Built-in engine component | ReactiveMD repository | `src/presets/default-components.ts`, `src/components/` |

Prefer directory mode: preview, editor catalog and offline export share one discovery result. Read the target repository's `AGENTS.md` first. In ReactiveMD-Demo, runtime extensions come from `plugin/` and `theme/`, not the `vendor/` test fixtures.

# Custom components

## Component parts

1. **Manifest**: `defineLocalComponent` declares the tag name, props, bindings, child structure, capabilities and editor metadata. Plain data that can cross a Worker boundary.
2. **React implementation**: `defineReactComponent` or `defineReactComponentPackage` provides `render` and optional `renderStatic`.
3. **CSS**: scoped to `.local-document`, using semantic tokens.

Minimal directory layout:

```text
plugin/rating/
├── index.ts          # default package export
├── manifest.ts       # defineLocalComponent
├── components.tsx    # React view + defineReactComponentPackage
└── component.css     # collected automatically
```

## Manifest

```ts
// plugin/rating/manifest.ts
import { defineLocalComponent } from 'reactive-md/sdk';

export const rating = defineLocalComponent({
  id: 'acme/rating',
  name: 'rating',
  version: '1.0.0',
  protocol: 'reactive-md-component/v1',
  form: 'leaf',
  props: {
    label: { kind: 'string', required: true },
    max: { kind: 'number', dynamic: true, default: 5, min: 1, max: 10, integer: true },
  },
  bindings: {
    value: {
      kind: 'number', family: 'number', bind: 'bind', initial: 'initial',
      initialRule: 'nearest-zero',
      constraints: { min: { literal: 0 }, max: { prop: 'max' }, step: { literal: 1 } },
    },
  },
  structure: { rule: 'none' },
  capabilities: { interactive: true, static: true, ssr: true, offline: true },
  authoring: {
    title: { en: 'Rating' },
    category: 'input',
    insertText: '<rating bind="score" label="Score" max="5" initial="3">',
  },
});
```

Key fields:

| Field | Rule |
| --- | --- |
| `id` / `name` / `version` | Stable identity, document tag name (lowercase kebab-case), component version |
| `form` | `leaf`, `inline` or `container` |
| `props` | `string`, `number`, `boolean`, `enum`; `required`, `default`, `dynamic`, `static`, range, integer, enum, pattern |
| `bindings` | Primary `value` or named slots; `kind`, `family`, `bind`, `initial`, `initialRule`, `constraints` |
| `structure` | Leaf `{ rule: 'none' }`; Markdown container `{ rule: 'any', label: 'optional' }`; inline `{ rule: 'inline' }` |
| `capabilities` | `interactive`, `static`, `ssr`, `offline`; at least one of interactive or static |
| `authoring` | Localized `title`/`description`, `category`, compilable `insertText` |
| `styles` | CSS resource IDs in package mode; directory mode collects `component.css` and omits this |

Prop interpolation: string props accept interpolation unless `static: true` or `dynamic: false`; number, boolean and enum props require `dynamic: true` to accept `{{ }}`. A prop used as `step` must be static.

Bindings: a numeric slot can share a parameter with built-in `<number>`/`<slider>` when static `min`/`max`/`step` match and dynamic bounds use the same expression. A parameter has at most one explicit `initial`. Named slots are exclusive by default; `range-slider` uses `start`/`end`, `coordinate` uses `x`/`y`, and `slotRelations` declares their order.

## React implementation

```tsx
// plugin/rating/components.tsx
import { defineReactComponentPackage, type LocalComponentContext } from 'reactive-md/react';
import { rating } from './manifest';

function Rating(ctx: LocalComponentContext) {
  const value = Number(ctx.bindings.value.get() ?? 0);
  const max = Number(ctx.props.max ?? 5);
  return (
    <div className="rmd-rating" role="group" aria-label={String(ctx.props.label)}>
      <output>{value}</output>
      <button type="button" disabled={ctx.disabled || value >= max}
        onClick={() => ctx.bindings.value.set(value + 1)}>+</button>
    </div>
  );
}

function RatingStatic(ctx: LocalComponentContext) {
  return <span>{String(ctx.props.label)}: {String(ctx.bindings.value.get() ?? 0)}</span>;
}

export default defineReactComponentPackage({
  ...rating,
  render: Rating,
  renderStatic: RatingStatic,
});
```

```ts
// plugin/rating/index.ts
export { default } from './components';
```

Context fields:

| Field | Purpose |
| --- | --- |
| `props` | Validated, normalized attributes |
| `bindings.value` / `bindings.slots` | `get()`, `set(next)` returning `{ ok, diagnostics }` |
| `bindings.setMany(record)` | One atomic multi-slot transaction; failure rolls back all slots |
| `children.render()` | Render Markdown / child content |
| `children.options()` / `table()` / `math()` | Option, table and formula projections |
| `runtime` | `reset(ctx.content)`, `evaluate`, `snapshot`, `validate` |
| `mode` / `bindings.isReadOnly` | Static-mode checks |
| `visible` / `disabled` / `resetToken` | Visibility, disabled state and reset signal |
| `services` | `random`, `clock`, `scheduler`, `state`; offline-safe |

Implementation rules:

- Write shared state through binding handles. The kernel rejects invalid writes and preserves the previous value; do not clamp first.
- Use React `useState` for local UI state. Release timers, subscriptions and listeners in effect cleanup.
- Static mode rejects shared binding writes. Timer effects return immediately in static mode and clean up on unmount.
- Clear local selection, search or expansion after a panel reset by observing `resetToken`.
- Accessible names, keyboard operation, visible focus and disabled feedback are part of the component.
- Offline components do not depend on the network. Use `ctx.services` for randomness, time and scheduling.
- The React adapter isolates descendant render failures as placeholders and diagnostics.

## Component CSS

```css
/* plugin/rating/component.css */
.local-document .rmd-rating {
  display: inline-flex;
  gap: var(--space-2, 8px);
  color: var(--ink);
  background: var(--surface);
  border: 1px solid var(--line-strong);
  border-radius: var(--radius-control, 6px);
}

.local-document .rmd-rating button:focus-visible {
  outline: var(--focus-outline, 2px solid var(--accent));
  outline-offset: 2px;
}

.local-document .rmd-rating button:disabled {
  opacity: var(--disabled-opacity, 0.5);
}
```

- Scope selectors to `.local-document`; prefix classes with the package or component name.
- Use semantic tokens: `--surface`, `--ink`, `--line`, `--accent`, `--focus`, `--space-*`, `--radius-*`, `--control-height`.
- Prefix private component variables with `--rmd-<package-or-component>-`.
- Native `<button>` and common native controls already receive the shared skin inside `.md-document`; component classes override only what they declare.
- Themes may decorate through `data-rmd-component`, `data-rmd-part` and semantic state attributes.
- Do not use global selectors or restyle the host page.

## Directory mode

- Entry files: `index.ts`, `index.tsx`, `index.js`, `index.jsx`, `index.mts`, `index.mjs`; one per directory.
- `component.css` is collected automatically. Do not put `styles` in the manifest and do not pass `css` or `resources` to the factory; that creates a second style identity or a missing resource.
- Export third-party attribution through `notices`:

```ts
import text from './NOTICES.md?raw';
export const notices = [{ id: 'acme/rating', license: 'MIT', text }];
```

- Restart `npm run dev` when a new directory does not appear. Preview, editor insertion catalog and offline export share the discovery result.

## Package mode

```sh
npx reactive-md init component ../my-rating \
  --name rating --id acme/rating --form leaf \
  --props '{"label":{"kind":"string","required":true},"max":{"kind":"number","dynamic":true,"default":5,"min":1,"max":10,"integer":true}}' \
  --yes
```

The scaffold generates `src/manifest.ts`, `src/rating.tsx`, `src/rating.css`, `extensions.ts`, a browser preview and build/verification scripts. Host assembly:

```tsx
import { createReactHost } from 'reactive-md/react';
import ratingPackage from 'acme-rating/react';

export const host = createReactHost({ packages: [ratingPackage] });
```

`host` exposes `config`, `reactConfig`, `resources` and `css`. Pass the same objects to preview, editor, SSR and offline export. `defineReactComponentPackage` uses `id + '.css'` as the default CSS resource ID; explicit `resources` IDs must match manifest `styles`.

# Custom themes

## Theme contract

| Field | Requirement |
| --- | --- |
| `name` | Lowercase kebab-case, starts with a letter, at most 64 characters; unique in the host list; `default` reserved |
| `protocol` | `reactive-md-theme-1` |
| `colorSchemes` | Must include both `light` and `dark` |
| `id` | Stable package identity |
| `version` | Semantic version |

Only `default` is built in. A document selects a theme with `<theme name="paper">`; the host must register that name, otherwise rendering falls back to `default` with a warning. Registration does not carry CSS; the host loads it.

The document root exposes:

```html
<article class="md-document local-document"
         data-rmd-theme="paper"
         data-color-scheme="dark">
```

## Directory mode

```text
theme/paper/
├── theme.json
├── theme.css
└── assets/
    ├── tokens.css
    ├── components.css
    └── fonts/
```

```json
{
  "id": "reactive-md/theme-paper",
  "name": "paper",
  "version": "1.0.0",
  "protocol": "reactive-md-theme-1",
  "colorSchemes": ["light", "dark"]
}
```

```css
@import './assets/tokens.css';
@import './assets/components.css';
```

Directory discovery inlines relative `@import` and `url()` references as data resources. Remote URLs, paths outside the directory and budget overruns fail. Documents select the theme with `<theme name="paper">`.

## Package mode

```ts
import { defineLocalTheme } from 'reactive-md/sdk';
import tokensCss from './tokens.css?raw';

export const paper = defineLocalTheme({
  id: 'acme/theme-paper',
  name: 'paper',
  version: '1.0.0',
  protocol: 'reactive-md-theme-1',
  colorSchemes: ['light', 'dark'],
  css: [{ id: 'acme/theme-paper.tokens.css', css: tokensCss }],
});
```

`defineLocalTheme` validates protocol, name, version, both color schemes and resource budgets; scopes selectors to `[data-rmd-theme="paper"]`; places rules in `@layer rmd.themes`; namespaces `@font-face` family names and rewrites matching references; accepts inline `data:` URLs only and rejects network references, `@import`, `@keyframes` and CSS escapes outside strings; and freezes the result.

Compose themes:

```ts
import { composeLocalTheme, collectLocalThemeCss } from 'reactive-md/sdk';

const contrast = composeLocalTheme({
  id: 'acme/theme-paper-contrast',
  name: 'paper-contrast',
  version: '1.0.0',
  base: paper,
  overrides: [{ id: 'acme/theme-paper-contrast.css', css: contrastCss }],
});

const stylesheet = collectLocalThemeCss(contrast);
```

## Scope and layers

Direct stylesheets declare the layer order before defining any RMD layer:

```css
@layer rmd.reset, rmd.defaults, rmd.components, rmd.themes, rmd.overrides;
```

Theme rules go into `rmd.themes`:

```css
@layer rmd.themes {
  [data-rmd-theme="paper"] {
    --surface: #fffdf7;
    --document-bg: #fffdf7;
    --ink: #2b2620;
    --accent: #9a5b2e;
  }

  [data-rmd-theme="paper"][data-color-scheme="dark"] {
    --surface: #1d1a16;
    --document-bg: #1d1a16;
    --ink: #f4ecdf;
    --accent: #e0a36b;
  }
}
```

- Scope every rule to `[data-rmd-theme="name"]`; never target `:root`, `html`, `body` or global elements.
- Use root scoping and component selectors for specificity; do not use `!important`.
- Do not depend on internal DOM nesting or CSS module hashes. Use root classes, component outer classes, `data-rmd-component`, `data-rmd-part`, semantic state attributes and public `.md-*` / `.local-*` classes.
- Hidden elements stay hidden; print keeps native control values and built-in summaries.

## Tokens

A theme inherits the complete default variable set and overrides only what it needs. Design and check both light and dark.

Common public variables:

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

`--document-bg` defaults to `--surface`. `--accent-ink` is text on accent fills; `--accent-text` is accent used as ink. Component variables use the `--rmd-` prefix, for example `--rmd-slider-thumb-width` and `--rmd-slider-track-height`. Density uses `data-rmd-density="compact"` or `"comfortable"` on the root.

## Registration

Directory mode: `reactiveMd()` scans `theme/<name>/`, validates, scopes and registers the theme, and watches CSS and asset changes. Documents select it with `<theme name="...">`.

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

## Theme acceptance

- Cover every component in light and dark modes, including hover, focus, active, disabled, error and selected states.
- Text and controls have readable contrast; focus rings stay visible.
- Layout works at 375px; tables, tabs, dialogs and charts do not overflow.
- Respect reduced-motion preferences.
- Check font changes against SVG diagram labels, nodes and bounds.
- Multiple isolated themes on one page do not affect each other; a forced light theme works inside a dark host.
- Theme switching preserves component runtime state; unmount cleans up styles.
- Static, SSR and offline export load the same CSS.

## Common errors

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

## Verification

```sh
# Standalone package
npm run typecheck && npm test && npm pack --ignore-scripts

# ReactiveMD-Demo
npm test && npm run build && npm run test:export && npm run test:runtime-extensions

# Engine
npm test -- tests/<file> && npm run check
```

## References

Bundled references:

- [custom-components.md](references/custom-components.md): manifest fields, context API, directory/package implementations, CSS, SSR/offline export, compliance and verification.
- [custom-themes.md](references/custom-themes.md): theme protocol, directory/package modes, scope and layers, full token table, component hooks, registration and acceptance.

External references:

- [ReactiveMD repository](https://github.com/yao1145/ReactiveMD)
- [Component development quick start](https://github.com/yao1145/ReactiveMD/blob/main/docs/development/component-development-en.md)
- [Component development contract](https://github.com/yao1145/ReactiveMD/blob/main/docs/development/component-development-reference-en.md)
- [Component protocol](https://github.com/yao1145/ReactiveMD/blob/main/docs/development/component-protocol-en.md)
- [Extension SDK](https://github.com/yao1145/ReactiveMD/blob/main/docs/integration/extension-sdk-en.md)
- [Theme protocol](https://github.com/yao1145/ReactiveMD/blob/main/docs/reference/theme-protocol-en.md)
- [Directory discovery](https://github.com/yao1145/ReactiveMD/blob/main/docs/integration/directory-discovery-en.md)
- [Component package example](https://github.com/yao1145/ReactiveMD/tree/main/examples/component-package)
- [Sci-fi theme example](https://github.com/yao1145/ReactiveMD/tree/main/examples/sci-fi-theme)
- [ReactiveMD-Demo plugin directory](https://github.com/yao1145/ReactiveMD-Demo/tree/main/plugin)
- [ReactiveMD-Demo theme directory](https://github.com/yao1145/ReactiveMD-Demo/tree/main/theme)
- [ReactiveMD-Demo examples and guides](https://github.com/yao1145/ReactiveMD-Demo/tree/main/content)
- [ReactiveMD-Demo repository](https://github.com/yao1145/ReactiveMD-Demo)

When writing tags, bindings or expressions in `.reactive.md`, use `reactive-md-authoring`.