---
name: reactive-md-authoring
description: "Author and edit ReactiveMD .reactive.md interactive documents. Use when writing reactive.md files, choosing controls, wiring bind expressions, adding computed values, charts, plots, diagrams, validation, or fixing document diagnostics."
---

# ReactiveMD document authoring

ReactiveMD turns Markdown into interactive documents: authors write prose in Markdown, place controls with tags, and connect state with `bind` and `{{ }}`.

Current syntax: `local-draft-3`. For new tags or themes, use `reactive-md-extension-authoring`.

Full language reference: `references/reactive-md-language.md`.

## File skeleton

```markdown
<!-- reactive-md: local-draft-3 -->
<theme name="default">

# Cost estimate

<panel title="Adjust the plan">
<slider bind="people" label="People" initial="2" min="1" max="20">
<toggle bind="annual" label="Annual billing">
</panel>

Monthly cost: **{{ people * (annual ? 80 : 100) }} USD**.
```

- The revision comment is optional; unversioned source uses the current revision. An older declared revision is rejected.
- `<theme>` is metadata placed before the body. Omit it for `default`; any other theme must be registered by the host.
- The body is Markdown. Block tags occupy their own lines and containers close explicitly. Attributes may span lines.
- `badge`, `tooltip`, `jump` and `text` are inline components; other components are block components.
- `option`, `tab`, `disclosure`, `node`, `edge`, `step` and `column` belong inside their matching parent.
- Tags, interpolations and formulas inside code fences or inline code stay literal.

## Core rules

- `bind="name"` names a writable parameter; `initial` sets its starting value; `{{ expression }}` reads it.
- Omit `bind` when nothing outside the control needs the value. A parameter has at most one explicit `initial`; shared controls must agree on type, range and step.
- Parameter names match `[A-Za-z_][A-Za-z0-9_]*` and are case-sensitive. `x`, `y`, `pi`, `e`, `true`, `false`, `null` and function names are reserved.
- Escaping: `\{{` shows a literal `{{`; `\<tag>` shows a tag; write `||` in a Markdown table as `\|\|`.
- Unknown names, duplicate initials and invalid initial values are compile errors.

## Choose a component

| Need | Components |
| --- | --- |
| Text | `input`, `textarea` |
| Number / slider / stepper / range / coordinate | `number`, `slider`, `counter`, `range-slider`, `coordinate` |
| Toggle / date | `toggle`, `checkbox`, `date` |
| Single / multiple choice | `select`, `choices`, `radio-group`, `multi-select` |
| Grouping and reset | `panel` |
| Layout | `card`, `grid`, `tabs`/`tab`, `accordion`/`disclosure` |
| Conditions / hints / jumps | `if`, `alert`, `badge`, `tooltip`, `jump`, `anchor` |
| Practice / steps | `quiz`, `steps`/`step` |
| Timer / progress / checklist | `timer`, `progress`, `checklist` |
| Tables / charts / curves / timeline | `table`, `chart`, `plot`, `timeline` |
| Diagrams | `diagram`/`node`/`edge` |
| Declarations / generated tables | `const`, `computed`, `external`, `validation`, `data-table`/`column` |

## Expressions

- Arithmetic `+ - * / %`, comparison `== != < <= > >=`, logic `! && ||`, conditional `cond ? a : b`.
- Multiplication uses `*`; `2x` is not multiplication. Conditions and logic must be boolean: write `people > 0 && people < 10`, not `0 < people < 10`.
- Functions: `abs`, `sqrt`, `floor`, `ceil`, `round`, `min`, `max`, `pow`, trigonometric functions, `exp`, `log`, `len`, `contains`, `clamp`, string functions, `dateCompare`, `dateDiff`, `sum`, `average`, `minOf`, `maxOf`.
- Formatting: `formatNumber`, `formatPercent`, `formatScientific`, `formatCurrency`. Supported locales: `en-US`, `zh-CN`, `de-DE`, `fr-FR`, `ja-JP`.
- Arrays cannot be interpolated directly. Use `len`, an index, an aggregate or `data-table`.
- Division by zero, type errors and non-finite results display "Unable to compute" locally; other content keeps updating.

## Declarations

```markdown
<const name="unitPrice" value="{{ 12.5 }}">
<computed name="total" value="{{ quantity * unitPrice }}">
<external name="exchangeRate" type="number">
<validation when="{{ people <= capacity }}" message="Seats required: {{ people }}." fields="people capacity">
```

- Declarations sit at document top level, each on its own line, never inside a container.
- `const` reads only constants and built-in constants, and is evaluated at compile time. `computed` reads controls, constants, other computations and `external`.
- `external` is a read-only host value. A missing value fails only the expressions that read it; it never becomes 0 or an empty string.
- `validation` reports cross-field consistency without blocking edits; `fields` lists writable parameter names.
- Declaration names share one namespace with controls; function names are reserved.
- Extract repeated expressions into `computed`; use `const` for fixed prices, thresholds and rates.

## Conditions and layout

```markdown
<panel title="Plan">
<choices bind="plan" label="Plan">
<option value="basic">Basic</option>
<option value="pro">Pro</option>
</choices>

<if when="{{ plan == 'pro' }}">
<alert tone="success" title="Advanced features included">Pro unlocks every chart type.</alert>
</if>
</panel>
```

- `if` requires one complete boolean interpolation in `when`.
- Hidden branches still compile: undeclared names and type errors still fail, and hidden control state is preserved.
- `panel` provides reset. Nested panels reset independently; an outer reset covers the whole subtree.
- `grid` takes 1–4 `columns` and its direct children must be `card`.

## Charts, tables and curves

### chart

```markdown
<chart kind="bar" title="Cost and budget" y-label="USD">
| Item | Actual | Budget |
| --- | ---: | ---: |
| Content | {{ contentCost }} | 150 |
| Visual | {{ visualCost }} | 200 |
</chart>
```

- The first column holds labels; other columns hold numbers or complete interpolations. Put units in a header or `y-label`.
- `kind` supports `bar`, `line`, `area`, `scatter`, `donut` and `pie`.
- Do not write `{{ price }} USD` in a numeric cell; mixed text cannot be a numeric series.

### table

- Adds search, sorting and paging.
- `bind`/`initial` selection requires `key`, a static, non-empty, unique row identifier.
- A table and chart may share a selection binding only when their ordered `key` sets match.

### plot

```markdown
<slider bind="a" label="Amplitude" initial="1" min="0" max="3" step="0.5">

<plot min="-6" max="6" label="Sine curve">
$$ y = a \sin x $$
</plot>
```

- The body contains only `$$...$$` blocks; each block defines one curve, up to 16 curves.
- Supports explicit `y=f(x)`, parametric `t`, polar `r=f(theta)` and implicit curves.
- A single-letter parameter maps to a same-name `bind`; write multi-letter names as `\mathrm{name}`. `x` and `y` cannot bind controls.
- Division by zero, non-real results and overflow form breaks.

### timeline and diagram

- `timeline` headers are `Task`, `Start`, `Duration` plus optional `Notes`.
- A `diagram` node body is static Markdown notes with optional text interpolation, never interactive controls. `edge` endpoints must name existing nodes.

## Common patterns

### Estimator

1. Wrap core inputs in a `panel`.
2. Put unit prices, tax rates and thresholds in `const`.
3. Put subtotals, totals and formatted strings in `computed`.
4. Reuse results in prose and add a `chart` for comparison.

### Guided branching

1. Use `choices` or `tabs` to select a path.
2. Wrap each branch in `if when="{{ choice == '...' }}"`.
3. Continue nesting choices inside branches; close every path.
4. Finish with `checklist` or `steps`.

### Teaching and practice

1. Show a phenomenon with `plot` or `chart`.
2. Let readers change parameters with `slider`.
3. Check understanding with `quiz`; answers live in source.
4. Add cross-field hints with `validation`.

## Workflow

1. Write the narrative skeleton and conclusion.
2. Mark the values readers should adjust; label every input and add `bind` only when other content reads it.
3. Extract repeated formulas into `computed` and fixed values into `const`.
4. Add conditions and visuals; declare every name used in hidden branches.
5. Run `npx reactive-md lint <file>` and fix the first diagnostic before later ones.
6. Exercise the controls in a browser at 375px with keyboard, focus and dark mode.

## Common errors

| Problem | Fix |
| --- | --- |
| Undeclared parameter | Check spelling and case against `bind`, `const`, `computed`, `external` |
| Duplicate `initial` | Keep one explicit initial value per parameter |
| Initial outside range or step | Adjust `min`/`max`/`step` or the initial value |
| `if` has no effect | Use one complete boolean interpolation in `when` |
| Chart rejects a cell | Write a plain number or one complete interpolation; move units to a header |
| Array displays blank | Use `len`, an index or an aggregate; never interpolate the array |
| Container content escapes | Check closing tags and nesting |
| Tag renders literally | Check code fences, escaping and unknown-tag fallback |
| `||` breaks a table | Write `\|\|` in the cell |
| Plot rejects a formula | Check the computable set; use `\mathrm{name}` for multi-letter parameters |
| "Unable to compute" | Check division by zero, types or non-finite results |
| Declaration has no effect | Place it at top level and check for a duplicate control name |

## Quality checklist

- Every input has a `label`; `bind` exists only when other content reads the value.
- One explicit `initial` per parameter; shared controls agree on type, range and step.
- Conditions use complete boolean interpolations; hidden branches declare every name.
- Chart numeric columns contain numbers or complete interpolations only.
- Containers close correctly; block tags occupy their own lines.
- Escapes are correct: `\{{`, `\<tag>`, `\|\|`.
- The document works at 375px with keyboard, screen reader and dark mode.
- `reactive-md lint` is clean and interactions were exercised in a real browser.

## Verification

```sh
npx reactive-md lint document.reactive.md
npx reactive-md build document.reactive.md -o document.html
npx reactive-md build document.reactive.md -o document.html --project-root .
```

`--project-root .` discovers the project's `plugin/` and `theme/` directories. In a host site, preview through the dev server and check the exported static HTML.

## References

Bundled reference:

- [reactive-md-language.md](references/reactive-md-language.md): all 49 tags, attributes, defaults, bindings, expressions, declarations, charts, plots, diagrams, diagnostics and an authoring checklist.

External references:

- [ReactiveMD repository](https://github.com/yao1145/ReactiveMD)
- [ReactiveMD language guide](https://github.com/yao1145/ReactiveMD/blob/main/docs/guides/local-guide-en.md)
- [ReactiveMD language specification](https://github.com/yao1145/ReactiveMD/blob/main/docs/reference/local-interaction-syntax-en.md)
- [Versions and compatibility](https://github.com/yao1145/ReactiveMD/blob/main/docs/compatibility/compatibility-en.md)
- [ReactiveMD-Demo examples and guides](https://github.com/yao1145/ReactiveMD-Demo/tree/main/content)
- [ReactiveMD-Demo repository](https://github.com/yao1145/ReactiveMD-Demo)

When the task needs a new tag or theme, switch to `reactive-md-extension-authoring`.