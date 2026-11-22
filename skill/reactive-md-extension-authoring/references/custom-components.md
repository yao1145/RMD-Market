# Custom component development reference

A ReactiveMD component is a pure-data manifest, a React implementation and style resources. The compiler, Worker, editor catalog, SSR and offline export share the manifest; the host imports the React implementation explicitly.

Authoritative documents:

- [Component development quick start](https://github.com/yao1145/ReactiveMD/blob/main/docs/development/component-development-en.md)
- [Component development contract](https://github.com/yao1145/ReactiveMD/blob/main/docs/development/component-development-reference-en.md)
- [Extension SDK](https://github.com/yao1145/ReactiveMD/blob/main/docs/integration/extension-sdk-en.md)
- [Component protocol](https://github.com/yao1145/ReactiveMD/blob/main/docs/development/component-protocol-en.md)

Current component protocol: `reactive-md-component/v1`. SDK contract `0.7.0`, shipped with `reactive-md@0.8.0`.

## 1 Choose the integration surface

| Case | Location | Entry | Use when |
| --- | --- | --- | --- |
| Host-project component | `plugin/<name>/` | `index.ts` default package export | Demo or site-specific tags; Vite discovery registers it |
| Distributable npm package | standalone package | `npx reactive-md init component` | Cross-project reuse; needs `.`, `./react`, `./host` and `./styles.css` entries |
| Built-in engine component | ReactiveMD repository | `src/presets/default-components.ts`, `src/components/` | Changing the engine itself; follows default-preset review |

Prefer directory mode. It needs no packing, publishing or manual registration, and preview, editor and offline export share one discovery result. Package the component only when another project must consume it.

## 2 Component parts

| Part | Purpose | Rule |
| --- | --- | --- |
| Manifest | Tag name, props, bindings, child structure, capabilities, editor metadata | Serializable plain data; no functions, React objects or CSS |
| React implementation | `render` plus optional `renderStatic` | Reads `ctx`, writes through binding handles |
| Styles | Structure and readable defaults | Scoped to `.local-document`, semantic tokens |
| Resources | CSS identities listed in `styles` | Directory mode collects `component.css`; package mode supplies CSS explicitly |
| Authoring | Title, description, category, insert template | `insertText` must compile under the same configuration |

## 3 Manifest

Complete example (a rating control sharing a numeric binding with the built-in `number`). It declares `styles` for package mode; directory mode removes that field and lets discovery collect `component.css`:

```ts
import { defineLocalComponent } from 'reactive-md/sdk';

export const rating = defineLocalComponent({
  id: 'example/rating',
  name: 'rating',
  version: '1.0.0',
  protocol: 'reactive-md-component/v1',
  form: 'leaf',
  props: {
    label: { kind: 'string', required: true },
    max: { kind: 'number', dynamic: true, default: 5, integer: true, min: 1, max: 10 },
    locked: { kind: 'boolean', dynamic: true, default: false },
  },
  bindings: {
    value: {
      kind: 'number',
      family: 'number',
      bind: 'bind',
      initial: 'initial',
      initialRule: 'nearest-zero',
      constraints: {
        min: { literal: 0 },
        max: { prop: 'max' },
        step: { literal: 1 },
      },
    },
  },
  structure: { rule: 'none' },
  capabilities: { interactive: true, static: true, ssr: true, offline: true },
  authoring: {
    title: { en: 'Rating' },
    description: {
      en: 'A numeric rating control that shares a document binding.',
    },
    category: 'input',
    insertText: '<rating bind="score" label="Score" max="5" initial="3">',
  },
  styles: ['example/rating.css'],
});
```

### 3.1 Top-level fields

| Field | Required | Meaning |
| --- | --- | --- |
| `id` | Yes | Stable identity such as `acme/rating`; unique among installed components |
| `name` | Yes | Document tag name, lowercase kebab-case; cannot override a built-in tag |
| `version` | Yes | Component version; increment when the contract changes |
| `protocol` | Yes | `reactive-md-component/v1` |
| `form` | Yes | `leaf`, `inline` or `container` |
| `props` | Yes | Attribute declarations; use `{}` when empty |
| `bindings` | No | Public binding slots; the primary slot is usually `value` |
| `structure` | No | Child-content rule; required for containers and inline components |
| `capabilities` | Yes | `interactive`, `static`, `ssr`, `offline` |
| `authoring` | No | Editor catalog and insertion template |
| `styles` | No | CSS resource IDs required by export |
| `requires` | No | For example `{ kernel: '^0.7.0' }` |
| `dependencies` | No | Other components as `{ id, version }` |
| `replaces` | No | Explicit replacement declaration; implicit overrides are forbidden |

### 3.2 Props

Supported kinds: `'string' | 'number' | 'boolean' | 'enum'`.

| Option | Meaning |
| --- | --- |
| `required` | Missing attribute is a compile error |
| `default` | Used when the author omits the attribute; optional props without a default resolve to `null` |
| `dynamic` | Number, boolean and enum props accept `{{ expression }}` and update with parameters; string props already accept interpolation |
| `static` | Rejects interpolation; use for configuration-only values |
| `integer` / `positive` | Numeric validation |
| `min` / `max` | Numeric range |
| `enum` | Allowed values for `kind: 'enum'` |
| `pattern` | Safe string pattern |
| `color` | Color attribute |
| `coerce: 'text'` | Coerce scalar interpolations to display text |
| `nullable` | Allow an explicit `null` |
| `description` | Localized help text, excluded from the semantic digest |

Dynamic numeric props reach the implementation as numbers. Number, boolean and enum props accept interpolation only with `dynamic: true`; string props accept interpolation unless `static: true` or `dynamic: false`. A prop used as `step` must be static. `min`/`max` may reference dynamic props; the runtime checks both the prop range and integer constraints.

### 3.3 Bindings

```ts
bindings: {
  value: {
    kind: 'number',
    family: 'number',
    bind: 'bind',
    initial: 'initial',
    initialRule: 'nearest-zero',
    constraints: {
      min: { literal: 0 },
      max: { prop: 'max' },
      step: { literal: 1 },
    },
  },
}
```

| Field | Meaning |
| --- | --- |
| `kind` | Runtime value kind: `string`, `number`, `boolean`, `array`, `number-array`, etc. |
| `family` | Semantic family: `text`, `number`, `boolean`, `choice`, `date`, `timer`, `checklist`, `tabs`, `diagram`, `multi-select`, `selection`, `steps`, `collection` |
| `bind` / `initial` | Authored attribute names; named slots may use `bind-x`, `bind-start`, etc. |
| `initialRule` | `empty`, `false`, `nearest-zero`, `min`, `max-step`, `first-option`, `first-tab`, `first-step`, `first-node`, `checked`, `duration`, `empty-array`, `none` |
| `constraints` | `min`, `max`, `step`; each is `{ literal: number }` or `{ prop: 'name' }` |
| `required` | Requires the author to write a binding name |
| `exclusive` | Named slots default to `true`; explicit `false` is rejected |
| `maxItems` | Collection limit, a literal or static numeric prop |
| `requiresAttributes` | Register the binding only when all listed attributes exist |
| `compare` | Attributes that must match between shared owners |
| `retain` | `false` excludes the binding from retained state (timers, checklists) |

The primary slot is `bindings.value`. `range-slider` and `coordinate` use named slots and declare order with `slotRelations: [{ lower: 'start', upper: 'end' }]`. `setMany` commits all slots in one kernel transaction; if any slot fails, all values and the revision are preserved.

Numeric sharing: an external component with `family: 'number'` can share a parameter with built-in `<number>` or `<slider>` when static `min`, `max` and `step` match. Dynamic bounds must use the same expression. A parameter has at most one explicit `initial`.

### 3.4 Structure

| `rule` | Use |
| --- | --- |
| `none` | Leaf component, no body |
| `inline` | Inline children |
| `any` | Arbitrary Markdown block content |
| `content` | Markdown content |
| `table` | One Markdown table |
| `plot` | Math formula blocks |
| `diagram` | `node` / `edge` children |
| `quiz` | Choice or numeric quiz body |
| `options` | `option` children |
| `tabs` / `steps` | Matching child sequences |
| `components` | Restricted component set |

Common combinations:

```ts
// Markdown container
structure: { rule: 'any', label: 'optional' }

// Inline component
structure: { rule: 'inline' }

// Leaf component
structure: { rule: 'none' }
```

`structure.label` controls whether the author must write `label` (`none`, `required`, `optional`). Containers render through `ctx.children.render()`; children continue to parse as Markdown and ReactiveMD.

### 3.5 Capabilities

```ts
capabilities: { interactive: true, static: true, ssr: true, offline: true }
```

- At least `interactive` or `static` is required.
- `ssr` enables strict server rendering; `renderStatic` falls back to `render` when omitted.
- `offline` permits offline single-file export. Omitting it produces an export diagnostic instead of a silently incomplete bundle.
- A display-only container may still declare `interactive` because it runs inside an interactive document.

### 3.6 Authoring

```ts
authoring: {
  title: { en: 'Rating' },
  description: { en: '...', zh: '...' },
  category: 'input',
  insertText: '<rating bind="score" label="Score" max="5" initial="3">',
}
```

`insertText` is compiled and validated under the same `LocalConfig`. The editor's insertion service allocates fresh binding names; write a semantic name in the template. `category` is an editor group string; common built-in groups include `input`, `action`, `layout`, `hint` and `data`.

## 4 React implementation

```tsx
import { defineReactComponent, type LocalComponentContext } from 'reactive-md/react';
import { rating } from './manifest';

export function RatingControl(ctx: LocalComponentContext) {
  const value = Number(ctx.bindings.value.get() ?? 0);
  const max = Number(ctx.props.max ?? 5);
  const locked = ctx.disabled || ctx.props.locked === true || !ctx.visible;
  return (
    <div className="rmd-rating" role="group" aria-label={String(ctx.props.label ?? 'Rating')}>
      <output className="rmd-rating-value">{value}</output>
      <button
        type="button"
        disabled={locked || value >= max}
        onClick={() => ctx.bindings.value.set(value + 1)}
      >
        +
      </button>
      <button
        type="button"
        disabled={locked || value <= 0}
        onClick={() => ctx.bindings.value.set(value - 1)}
      >
        −
      </button>
    </div>
  );
}

export function RatingStatic(ctx: LocalComponentContext) {
  return (
    <span className="rmd-rating-static">
      {String(ctx.props.label ?? 'Rating')}: {String(ctx.bindings.value.get() ?? 0)}
    </span>
  );
}

export const ratingImplementation = defineReactComponent(rating, {
  render: RatingControl,
  renderStatic: RatingStatic,
});
```

The convenience factory `defineReactComponentPackage` combines manifest, implementation and inline CSS:

```tsx
import { defineReactComponentPackage } from 'reactive-md/react';
import { rating } from './manifest';

export default defineReactComponentPackage({
  ...rating,
  render: RatingControl,
  renderStatic: RatingStatic,
  // css: '.local-document .rmd-rating { ... }',
});
```

Without `css`, every resource ID in `styles` must be supplied by `resources` or the host. With `css`, the default resource ID is `id + '.css'`; if the manifest already has `styles`, the first ID is used.

### 4.1 Context

| Field | Purpose |
| --- | --- |
| `props` | Validated, normalized attributes; dynamic props keep their types |
| `bindings.value` / `bindings.slots` | Binding handles; `get()`, `set(next)` returning `{ ok, diagnostics }` |
| `bindings.get(name)` / `set(name, value)` / `setMany(record)` | Named slots and atomic multi-slot writes |
| `bindings.isReadOnly` | True in static mode |
| `children.render()` | Render Markdown / child content |
| `children.options()` / `table()` / `math()` | Option, table and formula projections |
| `content` | Public content projection; `content.form` reports the shape |
| `runtime` | `reset(ctx.content)`, `evaluate`, `snapshot`, `validate`, `text` |
| `instance` | Instance ID, component ID, source range |
| `mode` | `interactive` or `static` |
| `visible` / `disabled` / `disabledInvalid` | Display and disabled state |
| `resetToken` | Increments after a panel reset; clear local UI state |
| `validation` | Field error and hint associations |
| `source` | Raw node attributes |
| `navigation` / `url` / `locale` | Jumps, URL policy, localization |
| `report(diagnostics)` | Report implementation diagnostics to the host |
| `services` | `random`, `clock`, `scheduler`, `state`; network only when the host grants it |

### 4.2 Interaction rules

- Write shared state through binding handles; never mutate `ctx.props` or internal AST.
- The kernel rejects invalid writes and preserves the previous value. Do not clamp first to "fix" a write.
- Use React `useState` for local UI state; release timers, subscriptions and listeners in effect cleanup.
- Static mode rejects shared binding writes. Branch on `ctx.mode === 'static'` or `ctx.bindings.isReadOnly`.
- Timer effects return immediately in static mode and clean up on unmount. Pause when hidden where appropriate.
- Clear local selection, search or expansion after a panel reset by observing `resetToken`.
- The React adapter isolates descendant render failures as placeholders and diagnostics; do not swallow diagnostics with an error boundary.
- Offline components do not depend on the network. Use `ctx.services` for randomness, time and scheduling instead of reading globals.

### 4.3 Accessibility

- Every interactive element has an accessible name; use `role="group"` plus `aria-label` for groups, and a real `label` or `aria-label` for fields.
- Preserve keyboard operation, visible focus and disabled feedback. Native `<button>` already provides keyboard behavior; do not emulate buttons with `div`.
- Express state with `aria-pressed`, `aria-selected`, `aria-current`, `aria-live` and similar attributes, not color alone.
- Works at 375px and respects reduced-motion preferences.

## 5 Component CSS

```css
.local-document .rmd-rating {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2, 8px);
  color: var(--ink);
}

.local-document .rmd-rating-value {
  min-width: 2ch;
  font-variant-numeric: tabular-nums;
  font-weight: var(--weight-semibold, 600);
}

.local-document .rmd-rating button {
  min-width: var(--control-height, 2.25rem);
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

.local-document .rmd-rating[data-tone="warning"] {
  --rmd-rating-accent: var(--warning);
}
```

Rules:

- Scope selectors to `.local-document`; prefix classes with the package or component name.
- Use semantic tokens: `--surface`, `--ink`, `--line`, `--accent`, `--focus`, `--space-*`, `--radius-*`, `--control-height`.
- Prefix private component variables with `--rmd-<package-or-component>-`.
- Native `<button>` and common native controls already receive the shared skin inside `.md-document`; component classes only override properties they declare. `!important` is unnecessary.
- Themes may decorate through `data-rmd-component`, `data-rmd-part` and semantic state attributes. Internal DOM nesting and CSS module hashes are not extension APIs.
- Do not use global selectors (`:root`, `html`, `body`) or restyle the host page.

## 6 Directory mode (host project)

Files:

```text
plugin/rating/
├── index.ts          # default package export
├── manifest.ts       # defineLocalComponent
├── components.tsx    # React view + defineReactComponentPackage
└── component.css     # collected automatically
```

`index.ts`:

```ts
export { default } from './components';
```

`components.tsx`:

```tsx
import {
  defineReactComponentPackage,
  type LocalComponentContext,
} from 'reactive-md/react';
import { rating } from './manifest';

function Rating(ctx: LocalComponentContext) {
  const value = Number(ctx.bindings.value.get() ?? 0);
  const max = Number(ctx.props.max ?? 5);
  return (
    <div className="rmd-rating" role="group" aria-label={String(ctx.props.label ?? 'Rating')}>
      <output>{value}</output>
      <button type="button" disabled={ctx.disabled || value >= max}
        onClick={() => ctx.bindings.value.set(value + 1)}>+</button>
    </div>
  );
}

function RatingStatic(ctx: LocalComponentContext) {
  return <span>{String(ctx.props.label ?? 'Rating')}: {String(ctx.bindings.value.get() ?? 0)}</span>;
}

export default defineReactComponentPackage({
  ...rating,
  render: Rating,
  renderStatic: RatingStatic,
});
```

Rules:

- `index.ts`, `index.tsx`, `index.js`, `index.jsx`, `index.mts` and `index.mjs` are valid entries; only one entry per directory.
- `component.css` is collected automatically and discovery generates its resource ID. Do not put `styles` in the manifest and do not pass `css` or `resources` to the factory; that creates a second style identity or a missing resource.
- Export third-party attribution through `notices`:

```ts
import text from './NOTICES.md?raw';
export const notices = [{ id: 'acme/rating', license: 'MIT', text }];
```

- Restart `npm run dev` when a new directory does not appear. The dev server watches subsequent additions, removals and edits.
- Preview, editor insertion catalog and offline export share the discovery result. Confirm that `<rating ...>` shares bindings with built-in controls, then export HTML and check static rendering.

## 7 Package mode

Scaffold:

```sh
npx reactive-md init component ../my-rating \
  --name rating \
  --id acme/rating \
  --form leaf \
  --props '{"label":{"kind":"string","required":true},"max":{"kind":"number","dynamic":true,"default":5,"min":1,"max":10,"integer":true}}' \
  --yes
```

Generated layout:

```text
src/manifest.ts             pure-data manifest
src/rating.tsx              React view + defineReactComponentPackage
src/rating.css              scoped styles
extensions.ts               export const host = createReactHost({ packages })
main/plugin/rating/index.ts preview discovery entry
main/index.html             browser preview
scripts/build.mjs           Node/declaration build
scripts/verify.mjs          manifest and React/SSR compliance
scripts/build-export.mjs    preview export through public Vite APIs
```

Host assembly:

```tsx
import { createReactHost } from 'reactive-md/react';
import ratingPackage from 'acme-rating/react';

export const host = createReactHost({
  packages: [ratingPackage],
});

// Preview / editor
<LocalReactiveDocument source={source} reactConfig={host.reactConfig} />
// Compiler and Worker
compileLocal(source, { config: host.config })
// SSR / export
renderLocalStaticDocument({ document, runtime, reactConfig: host.reactConfig, resources: host.resources })
```

Equivalent manual composition:

```ts
import { createLocalConfig } from 'reactive-md/sdk';
import { createReactConfig } from 'reactive-md/react';
import { rating } from './manifest';
import { ratingImplementation } from './components';

export const config = createLocalConfig({ components: [rating] });
export const reactConfig = createReactConfig(config, {
  components: [ratingImplementation],
});
```

Suggested package entries:

| Entry | Contents |
| --- | --- |
| `.` | Manifest types, pure-data definition, version |
| `./react` | React package, resources |
| `./host` | Scaffold-generated `extensions.ts` host entry |
| `./theme` | Optional; when the package also ships a theme |
| `./styles.css` | Component structure styles |

`defineReactComponentPackage` produces `definition`, `components` and `resources`; `createReactHost` merges the default preset, themes, resources and notices. Keep the manifest plain data and React code in a separate entry so Workers receive only serializable configuration.

## 8 Static, SSR and offline export

- `renderStatic` is optional and falls back to `render`. Write a separate renderer when the layout differs.
- Static rendering receives read-only binding handles; shared binding writes are rejected. Component React state, timers and event handlers still work.
- Strict SSR uses `renderLocalStaticDocument`; check `ok` before reading `markup`. Pass the same `resources` used by preview and export.
- Offline single-file export uses `buildLocalStandaloneBundle`; the entry module exports `config`, `reactConfig`, `root`, `allowlist`, `resources` and `notices`. Tag names and URLs in documents never trigger code downloads.
- When a component declares `styles`, SSR, compliance and export must receive CSS resources with the same IDs.
- Package builds reject remote references, directory escapes, cycles, conflicts, budget overruns and implementations that do not support offline export.

## 9 Verification

Standalone package:

```sh
npm run typecheck
npm test
npm pack --ignore-scripts
```

`npm test` builds JavaScript, declarations and static/interactive HTML, then runs Node, SSR and offline browser checks. Install a Playwright browser first; on Windows, `PLAYWRIGHT_CHANNEL=msedge` selects an installed channel.

Host directory mode (ReactiveMD-Demo):

```sh
npm test
npm run build
npm run test:export
npm run test:runtime-extensions
```

`test:export` targets `http://127.0.0.1:5173` by default; start `npm run dev` or set `DEMO_URL`. `test:runtime-extensions` starts its own Vite server and checks the real Worker, directories, controls and offline export.

Engine repository:

```sh
npm test -- tests/<file>
npm run check
```

Compliance tools (`reactive-md/testing`):

```ts
runLocalManifestCompliance(rating)
runLocalBehaviorCompliance(spec, config)
runLocalReactCompliance({ config, reactConfig, resources, component: 'rating', spec })
runLocalBrowserCompliance({ driver, spec, config, component: 'rating' })
createLocalComplianceReport({ config, component: 'rating', suites })
```

`ok` means the requested checks passed; `complete` means every declared capability has executed evidence. Browser evidence needs mount, edit, hide-show, disabled, reset, descendant-error and unmount phases; offline evidence also needs hydration, an offline context and zero network requests.

## 10 Engine built-in components

This path applies only inside the ReactiveMD engine repository:

- Definitions: `src/presets/default-components.ts`
- Implementations: `src/components/`
- Editor metadata: `src/presets/default-authoring.ts`
- Preset assembly: `src/presets/`, `src/sdk/preset.ts`

Built-in components use the same public protocol and validation. Add kernel code only when introducing expression, state-family, structure or budget primitives, and follow the proposal template in the [component protocol](https://github.com/yao1145/ReactiveMD/blob/main/docs/development/component-protocol-en.md). Component version, SDK protocol, syntax revision and package version are independent decisions.