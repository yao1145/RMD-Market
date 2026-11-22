# reactive.md language reference

Current syntax revision: `local-draft-3`. Authoritative specifications: [ReactiveMD language guide](https://github.com/yao1145/ReactiveMD/blob/main/docs/guides/local-guide-en.md) and [ReactiveMD language specification](https://github.com/yao1145/ReactiveMD/blob/main/docs/reference/local-interaction-syntax-en.md). This file is the complete working summary for authoring agents.

## 1 File structure

```markdown
<!-- reactive-md: local-draft-3 -->
<theme name="default">

# Title

Body.

<slider bind="people" label="People" initial="2" min="1" max="20">

Total: **{{ people * 100 }} USD**.
```

- The revision comment is optional. Without it, source uses `local-draft-3`; an explicit `local-draft-1`, `local-draft-2` or unknown revision is rejected.
- `<theme name="...">` is document metadata placed before the body. It appears once. Omission selects `default`. Only `default` is built in; every other name must be registered by the host.
- The body is Markdown. Headings, paragraphs, emphasis, links, images, quotes, lists, plain tables, inline code and code fences work normally.
- Component tags use lowercase kebab-case. Block components put start and end tags on their own lines; attributes may span lines; containers close explicitly. Automatic closing and mismatch correction are not supported.
- `badge`, `tooltip`, `jump` and `text` are inline components and may sit in a sentence. Other components are block components. `option`, `tab`, `disclosure`, `node`, `edge`, `step` and `column` belong inside their matching parent.
- Tags, interpolations and formula markers inside code fences or inline code stay literal. Ordinary `<!-- ... -->` comments produce no components or variables; only the prologue revision directive has semantics.
- Default mode accepts the P0 HTML subset, including `div`, `span`, `p` and `h1`–`h6`. `div`, `p` and `h1`–`h6` accept static `align="left|center|right|justify"`. `style`, event attributes and scripts do not run.

## 2 Tag shapes and attributes

| Shape | Form | Rule |
| --- | --- | --- |
| Void | `<slider bind="a" label="A">` | No end tag; a trailing `/>` is accepted |
| Body | `<card title="Notes">...</card>` | Must close explicitly; nesting is allowed |

Fixed void tags: `input`, `textarea`, `number`, `slider`, `range-slider`, `coordinate`, `toggle`, `checkbox`, `date`, `counter`, `timer`, `progress`, `anchor`, `edge`. Declarations `external`, `computed`, `const`, `validation` and the structural `column` also have no body. Every other component uses paired tags. `textarea` text belongs in `initial`, not in a body.

Attribute values use single or double quotes; boolean attributes may omit their value. Attribute order has no semantics; duplicate attributes are errors.

| Form | Meaning |
| --- | --- |
| `label="People"` | Static string |
| `max="20"` | Parsed as a number by the component definition |
| `required` | Boolean true |
| `required="false"` | Boolean false |
| `disabled="{{ people >= 20 }}"` | Dynamic boolean |
| `max="{{ rooms * 4 }}"` | Dynamic numeric constraint (`number`, `slider`) |
| `min="{{ departure }}"` | Dynamic date bound (`date`) |
| `required="{{ business }}"` | Dynamic required (`input`, `textarea`, `date`) |
| `label="Current people: {{ people }}"` | Text interpolation |

Dynamic numeric and boolean attributes must be one complete interpolation and keep their result type. Text attributes may contain multiple interpolations. `bind`, `initial`, `name`, `id`, `option value`, `to`, `from`, `answer`, `kind`, field mappings and layout enums are static. `step`, length limits, selector options and coordinate bounds stay static. `min`, `max` and `required` are dynamic on `number`, `slider`, `date`, `input` and `textarea`. Plot `min`/`max` may be dynamic.

Dynamic constraints are checked on write and on display. If another parameter narrows a range so the current value becomes invalid, the value is kept and the field shows an error; it is never clamped or reset. A dynamic `required` turning true on an empty field shows a hint without filling it.

Escaping: use `\{{` in prose for a literal `{{`; use `\<slider>` or inline code for a tag example; write logical OR in a Markdown table as `\|\|`. Attribute values decode `&quot;`, `&apos;`, `&amp;`, `&lt;` and `&gt;`; attribute quotes do not use backslash escapes.

## 3 Bindings, initial values and sharing

- `bind="name"` names a writable parameter; `initial="..."` sets its starting value. A control without `bind` still has internal state and interaction.
- The component determines the value type. Names match `[A-Za-z_][A-Za-z0-9_]*` and are case-sensitive. `x`, `y`, `pi`, `e`, `true`, `false`, `null` and expression function names are reserved.
- A parameter has at most one explicit `initial`. Without one, the default of the first control in source order applies; later same-name controls without `initial` share the existing initial value.
- Same-type controls may share a parameter and stay in sync. Numeric controls must agree on `min`, `max` and `step`; `select`/`choices`/`radio-group` must agree on the option set and order. `timer`, `checklist`, `tabs`, `diagram`, `multi-select` and `steps` have a single owner for their public state.
- Referencing an undeclared name is a compile error; it never creates an empty value. Bindings in hidden regions are still compiled and initialized.
- An invalid initial value is an error, not silently corrected.

| Component | Public value | Default initial value |
| --- | --- | --- |
| `input`, `textarea` | String | Empty string |
| `date` | `YYYY-MM-DD` or empty string | Empty string |
| `number` | Number | Valid step value closest to 0 within range |
| `slider` | Number | `min` (default range 0–100) |
| `counter` | Number | Valid step value closest to 0 within range |
| `toggle`, `checkbox` | Boolean | `false` |
| `select`, `choices`, `radio-group` | Option string | First option's `value` |
| `multi-select` | String array | Empty array |
| `range-slider` | `start`/`end` numbers | start=min; end=largest valid step not exceeding max |
| `coordinate` | `x`/`y` numbers | Closest valid step to 0 on each axis |
| `table`, `chart` with `key` | Row-key string | Empty string (unselected) |
| `tabs` | Page string | First tab's `value` |
| `steps` | Step string | First step's `value` |
| `diagram` | Node ID string | First node's `id` |
| `checklist` | Checked item ID array | Determined by task-list check marks |
| `timer` | Remaining seconds | `duration`, default 60 |

`range-slider` uses `initial-start`/`initial-end`; `coordinate` uses `initial-x`/`initial-y`. `multi-select` takes a comma-separated static `initial` list of option values. `timer` uses `duration`, and `checklist` uses `[x]`/`[ ]`; neither accepts `initial`. `table`/`chart` use `bind`/`initial` only with `key`.

A panel reset restores all parameters, table queries, sorting, paging, tab selection and diagram selection in its subtree in one transaction. A hidden control does not reinitialize when shown again. Timers pause in hidden regions.

## 4 Expressions

`{{ expression }}` may appear in prose, headings, lists, plain table cells and attributes that allow dynamic values. Strings, finite numbers and booleans display directly; `null` displays empty; arrays cannot be output directly.

| Category | Support |
| --- | --- |
| Literals | Numbers, single/double-quoted strings, `true`, `false`, `null` |
| Parameters | Declared `bind`, `computed`, `const`, `external` names |
| Arithmetic | `+ - * / %`, unary plus/minus, parentheses |
| Comparison | `== != < <= > >=` |
| Logic | `!`, `&&`, `||` |
| Conditional | `condition ? valueWhenTrue : valueWhenFalse` |
| Math | `abs`, `sqrt`, `floor`, `ceil`, `round`, `min`, `max`, `pow`, `sin`, `cos`, `tan`, `asin`, `acos`, `atan`, `exp`, `log` |
| Common | `len`, `contains`, `clamp` |
| Formatting | `formatNumber`, `formatPercent`, `formatScientific`, `formatCurrency` |
| Strings | `trim`, `lower`, `upper`, `startsWith`, `endsWith`, `replace`, `slice` |
| Dates | `dateCompare`, `dateDiff` |
| Array aggregates | `sum`, `average`, `minOf`, `maxOf` |
| Constants | `pi`, `e` |

Rules:

- Multiplication must use `*`; `2x` is not multiplication. Use `pow` for exponents.
- `+` accepts two numbers or two strings; it does not convert types. Comparisons do not convert strings to numbers.
- Conditions and logic must be boolean. Write `people > 0 && people < 10`, not `0 < people < 10`.
- Division by zero, domain errors, non-finite results and type errors display "Unable to compute" at that location; other content keeps updating.
- String escapes are `\\`, `\'`, `\"`, `\n`, `\t`.
- Regular expressions, property access, method calls, custom functions, assignment and imports are unavailable.

Formatting functions:

| Function | Defaults and example |
| --- | --- |
| `formatNumber(value, digits, locale, grouping)` | digits=2, locale=`en-US`, grouping=true; `formatNumber(1234.5)` → `"1,234.50"` |
| `formatPercent(value, digits, locale)` | digits=0; `formatPercent(0.125, 1)` → `"12.5%"` |
| `formatScientific(value, digits, locale)` | digits=2; `formatScientific(1234)` → `"1.23E3"` |
| `formatCurrency(value, currency, digits, locale)` | currency=`USD`, digits=2; `formatCurrency(12.5)` → `"$12.50"` |

Supported locales are exactly `en-US`, `zh-CN`, `de-DE`, `fr-FR` and `ja-JP`. `digits` is an integer from 0 to 20 and fixes both minimum and maximum fraction digits. Formatting uses `halfExpand` rounding: `formatNumber(1.005)` → `"1.01"`, `formatNumber(-1.005)` → `"-1.01"`.

Date functions accept valid `YYYY-MM-DD` dates from years `0001` to `9999`. `dateDiff(a, b, unit)` returns `a - b`, defaulting to `days`; units also include `hours`, `minutes`, `seconds` and `milliseconds`. Dates mean UTC midnight, so device time zone does not change the result. An empty date is `""`, not epoch; guard it explicitly before calculating.

## 5 Declarations

```markdown
<const name="unitPrice" value="{{ 12.5 }}">
<computed name="total" value="{{ quantity * unitPrice }}">
<external name="exchangeRate" type="number">
<validation when="{{ people <= capacity }}" message="Seats required: {{ people }}." fields="people capacity">
```

- `const`, `computed`, `external` and `validation` are invisible declarations. Place them at document top level, each on its own line; they cannot appear inside containers.
- `const` reads only other constants and built-in constants such as `pi` and `e`; it cannot depend on controls, `computed` or `external`. Values are evaluated at compile time.
- `computed` reads controls, constants, other computations and `external`. Dependencies are ordered; forward references work. Unknown names, duplicates, self-references and cycles are compile errors.
- `external` declares a read-only host value. `type` is `string`, `number`, `boolean`, `string-array` or `number-array`. The host supplies values through `externalValues` or `runtime.setExternalValues()`. A missing value fails only the expressions that read it; it never becomes `0`, `false` or an empty string. `setParameter()` cannot write externals.
- `validation` requires one complete boolean interpolation in `when`; `message` may contain ordinary interpolations; `fields` lists writable binding names separated by whitespace. It reports cross-field consistency without blocking edits; individual range errors still reject writes.
- Declaration names share one namespace with controls and other declarations. Function names are reserved.
- A failed calculation propagates its error to consumers. The runtime never substitutes 0, null or a previous successful value. Independent content keeps working and recovers when inputs become valid.

## 6 Inputs

| Component | Key attributes |
| --- | --- |
| `input` | `label`, `bind`, `initial`, `type=text/email`, `placeholder`, `required`, `min-length`, `max-length` |
| `textarea` | `label`, `bind`, `initial`, `placeholder`, `rows=4`, `required`, `min-length`, `max-length` |
| `number` | `label`, `bind`, `initial`, `min`, `max` (dynamic), `step=1` |
| `slider` | `label`, `bind`, `initial`, `min=0`, `max=100` (dynamic), `step=1`, `color` |
| `range-slider` | `label`, `bind-start`/`bind-end`, `initial-start`/`initial-end`, `min`, `max`, `step`, `color` |
| `coordinate` | `label`, `bind-x`/`bind-y`, `initial-x`/`initial-y`, `x-min`/`x-max`, `y-min`/`y-max`, `step`, `color` |
| `toggle`, `checkbox` | `label`, `bind`, `initial`, `color` |
| `date` | `label`, `bind`, `initial`, `min`, `max`, `required` (last three dynamic) |
| `counter` | `label`, `bind`, `initial`, `min=0`, `max`, `step=1` |
| `select`, `choices`, `radio-group` | `label`, `bind`, `initial`, `color`; child `option` |
| `multi-select` | `label`, `bind`, `initial`, `max-selected`, `color`; child `option` |
| `option` | `value` required, static and unique; body is display text |

- Every input needs `label`, which is also its accessible name. `bind` is optional; omitting it only hides the value from other content.
- An `option`'s `value` is what expressions see; its body is display only. Set `initial` to an option `value` to change the default.
- `select`, `choices` and `radio-group` select the first option by default. `multi-select` starts empty; `max-selected` caps the selection.
- `textarea` text belongs in `initial`, not in a body.
- Inputs support dynamic `disabled`. Narrowing `number`/`slider`/`date` bounds keeps the current value and shows a field error.
- `checklist` requires a non-empty, single-level Markdown task list. Its public value is an array of checked IDs (`item-1`, `item-2`, …) in source order.
- `timer` supports `label`, optional `bind` and `duration` (positive integer seconds, default 60). It provides start, pause and reset, uses actual elapsed time and does not accumulate drift in the background.

## 7 Layout, conditions and navigation

| Component | Rule |
| --- | --- |
| `panel` | Optional `title`; `reset` defaults true; `reset="false"` hides the action. Nesting is allowed; an inner reset affects only the inner panel, an outer reset covers the subtree |
| `card` | Optional `title`; body continues as Markdown |
| `grid` | `columns` is the maximum 1–4; direct children must be `card`; narrow containers reduce columns |
| `tabs` / `tab` | `tab` requires `label`; omitted `value` generates `tab-1`, `tab-2`. `tabs` takes optional `label`, `bind`, `initial` |
| `accordion` / `disclosure` | `disclosure` requires `label`; `open` sets the initial state; multiple items may be open |
| `if` | `when` is required and must be one complete boolean interpolation. Hidden branches still compile; their state is preserved |
| `alert` | Optional `title`; `tone=info/success/warning/error`, default `info` |
| `badge` | Inline; `tone=neutral/success/warning`, static or dynamic |
| `tooltip` | Inline; `text` required; shown on hover or keyboard focus |
| `jump` | Inline; `to` required (anchor or heading slug, no `#`); `appearance=link/button`; optional `color` |
| `anchor` | `id` required and unique; explicit jump target |
| `text` | Inline; `color` required |
| `section` | Block; `color` required; sets inherited foreground only |

`color` accepts shared color names or `#RGB`/`#RRGGBB`, never expressions, CSS functions or variables. `slider`, `toggle`, `checkbox`, `select`, `choices`, `radio-group`, `checklist`, `multi-select`, `range-slider`, `coordinate`, `jump`, `badge` and `progress` support `color`. Inner colors override outer colors.

Conditional tone example:

```markdown
<badge tone="{{ total <= budget ? 'success' : 'warning' }}">{{ formatCurrency(total) }}</badge>
<alert tone="{{ total <= budget ? 'info' : 'warning' }}">Review the budget before submitting.</alert>
```

## 8 Tables, charts and timelines

### 8.1 Shared data rules

- `table`, `chart` and `timeline` each contain one Markdown table. Headers are non-empty and unique; every row has the same number of columns.
- Plain text cells render Markdown. Plain decimal or scientific text can be read as a number; a single complete `{{ expression }}` keeps its result type. Mixed text such as `{{ price }} USD` is a display string and cannot be a numeric chart column.
- Empty rows, non-numeric values and missing columns report errors at the cell. Chart calculation errors display in the chart and are not replaced with 0.

### 8.2 `table`

```markdown
<table label="Component catalog" page-size="3">
| Name | Category | Price |
| --- | --- | ---: |
| Document | Basic | 20 |
| Form | Input | 45 |
</table>
```

- `searchable` defaults true, `sortable` defaults true, `page-size` defaults 10 (positive integer).
- `key` names a static, non-empty, unique row-identifier column. `bind`/`initial` require `key`; an unselected table exposes an empty string.
- A table and chart may share a selection binding only when their ordered `key` sets match and there is at most one explicit `initial`.
- Search is case-insensitive substring matching. Sorting is numeric for numeric columns, Unicode code-point order for text; clicking a header cycles ascending, descending and source order.
- `<table>` also accepts a native HTML table body. HTML tables support merged cells and add no search/sort/paging interactions by default.

### 8.3 `chart`

```markdown
<chart kind="bar" title="Cost and budget">
| Item | Actual | Budget |
| --- | ---: | ---: |
| Content | 120 | 150 |
| Visual | 230 | 200 |
</chart>
```

- `kind` defaults `bar` and supports `bar`, `line`, `area`, `scatter`, `donut` and `pie`.
- Optional `title`, `x`, `y`, `x-label`, `y-label`. `x`/`y` are static header names; `y` may be a comma-separated list.
- `bar`/`line`/`area`: first column is the axis; other columns are numeric series. `line`/`area` decide numeric or categorical from the full column type.
- `scatter`: first column is the numeric horizontal axis; the rest are numeric vertical axes. `x`/`y` may specify them.
- `donut`/`pie`: first column is the label, second is the value; with more than two columns, `y` must name the single numeric column. Values must be non-negative; a zero total shows an empty state.
- With `key`, a chart exposes row selection through `bind` under the same rules as `table`.

### 8.4 `timeline`

```markdown
<timeline title="Workshop schedule" unit="minutes">
| Task | Start | Duration | Notes |
| --- | ---: | ---: | --- |
| Opening | 0 | 15 | Introduction |
| Practice | 15 | 45 | Groups |
</timeline>
```

- Headers are `Task`, `Start`, `Duration`, plus optional `Notes`. The renderer also accepts localized header aliases.
- `start` and `duration` are non-negative numbers. Rows sort stably by start time, overlaps are allowed, and notes open with pointer or keyboard.

### 8.5 `data-table`

```markdown
<const name="subjects" value="{{ ['mathematics', 'physics', 'chemistry'] }}">

<data-table label="Subject preparation" rows="{{ subjects }}" key="{{ item }}" max-rows="3">
<column label="Subject" value="{{ item }}">
<column label="Position" value="{{ index + 1 }}">
<column label="Preparation" value="{{ item == 'chemistry' ? 'Prepare materials' : 'Prepare examples' }}">
</data-table>
```

- `rows` is a complete array expression. `key` is a complete string or number expression that depends only on `item`, is non-empty and unique. `max-rows` is a static integer 1–1000, default 100.
- Children are 1–20 `column` tags. Each column requires a static `label` and a complete scalar `value` expression.
- Each row exposes `item` (current value) and `index` (zero-based position), shadowing document names inside column expressions.
- Cells output plain text; null is empty. Duplicate or invalid keys report a whole-table error. An empty array shows headers and an empty state.

## 9 Math and plots

- Inline math uses `$...$` or `\(...\)`; display math uses `$$...$$` or `\[...\]`. Currency such as `$5` and `$10` stays literal; use `\$` for a literal dollar sign.
- KaTeX supports common commands, `cases`, `aligned`, `align`, matrices, `\tag`, mhchem and more. Unclosed math delimiters are errors; unsupported formulas fall back to bounded source text.
- A `<plot>` body contains only whitespace and one or more `$$...$$` blocks. Each block defines one curve; at most 16 curves.
- Four curve forms:
  - Explicit: `$$ y = a \sin x + \frac{x^2}{10} $$`
  - Parametric: `$$ \begin{cases} x = t - \sin t \\ y = 1 - \cos t \end{cases} $$`
  - Polar: `$$ r = a(1 + \cos\theta) $$`
  - Implicit: `$$ (x^2 + y^2)^2 = 2a^2(x^2 - y^2) $$`
- Attributes: `min=-10`, `max=10` (dynamic allowed, min < max), `points=200` (static integer 2–2000; `samples` is compatible but `points` wins), optional `label`, `x-label="x"`, `y-label="y"`.
- A single Latin letter maps to a same-name `bind` (`a` → `bind="a"`). Write multi-letter parameters as `\mathrm{amplitude}` → `bind="amplitude"`. Common Greek letters map to same-name English bindings. `x` and `y` cannot bind controls.
- Computable LaTeX covers arithmetic, implicit multiplication, powers, fractions, roots, trig/exp/log, absolute value, min/max and piecewise functions. Integrals, sums, derivatives, matrices and custom macros are outside the computable set; the formula still displays, but the plot reports the unsupported structure.
- Division by zero, non-real results and overflow form breaks; the two sides are not connected.

## 10 Diagrams, quizzes and steps

### 10.1 `diagram`

```markdown
<diagram bind="selected" initial="input" label="Reactive state flow" direction="right">
<node id="input" label="Input">
The reader changes parameters through controls.
</node>
<node id="compute" label="Compute">
Recompute formulas and results.
</node>
<node id="view" label="Display">
Update prose and charts.
</node>
<edge from="input" to="compute" label="State change">
<edge from="compute" to="view" label="Update result">
</diagram>
```

- `direction=right/down`, default right. The body contains only `node`, `edge` and whitespace.
- `node.id` matches `[A-Za-z_][A-Za-z0-9_-]*` and is unique in the diagram. `label` is required. The body is static Markdown notes with optional text interpolation, never interactive controls. `node` supports dynamic `tone=neutral/success/warning`.
- `edge` requires `from`/`to` pointing to existing nodes; optional `label`. Fully duplicate `from`/`to`/`label` combinations are errors; parallel edges with different labels are allowed. Cycles and self-loops are allowed.
- Nodes are clickable and keyboard-selectable. With `bind`, the selected node ID is public; without it, selection stays internal. `initial` must name an existing node and defaults to the first.

### 10.2 `quiz`

- `type=choice/number`, default `choice`; `label` and `answer` are required; optional `explanation` and `tolerance`.
- Choice quizzes contain `option` children and `answer` matches an option value. Numeric quizzes have an empty body, a finite `answer` and a non-negative absolute `tolerance` defaulting to 0.
- Built-in Check answer, feedback and Try again. There is no public `bind`. Answers live in source for self-study.

### 10.3 `steps` / `step`

- `steps` takes optional `label`, `bind`, `initial` and one or more `step` children; the first step is selected by default.
- `step` requires `label`; omitted `value` generates `step-1`, `step-2`, unique within the group.
- Built-in Previous/Next and position. Only the active step is visible; other bindings still initialize, state persists and hidden timers pause. Reset restores the initial step and its subtree.

## 11 Complete 49 tags

| Purpose | Tags |
| --- | --- |
| Inputs and choices | `input`, `textarea`, `number`, `slider`, `range-slider`, `coordinate`, `toggle`, `checkbox`, `date`, `counter`, `select`, `choices`, `radio-group`, `multi-select`, `option` |
| Built-in actions | `checklist`, `timer`, `progress` |
| Organization | `panel`, `card`, `grid`, `tabs`, `tab`, `accordion`, `disclosure`, `if` |
| Navigation and prose | `jump`, `anchor`, `text`, `section` |
| Practice and reading | `quiz`, `steps`, `step` |
| Hints | `alert`, `badge`, `tooltip` |
| Declarations and generated data | `external`, `computed`, `const`, `validation`, `data-table`, `column` |
| Visualization | `table`, `chart`, `plot`, `timeline`, `diagram`, `node`, `edge` |

`option`, `tab`, `disclosure`, `node`, `edge`, `step` and `column` are structural children. `external`, `computed`, `const` and `validation` are top-level declarations that never render. `<theme>` is metadata and is not counted among the 49 tags.

This revision rejects legacy tags such as `form`, `submit`, `button`, `each`, `list`, `spinner`, `stat` and `value`, along with `set`/`reset` action attributes and `on-*` event attributes. Panel reset is a fixed boolean option, not a programmable action.

## 12 Diagnostics and common errors

| Problem | Cause and fix |
| --- | --- |
| Undeclared parameter | Check spelling and case against `bind`, `const`, `computed`, `external` |
| Duplicate `initial` | Keep one explicit initial value per parameter |
| Invalid initial number | Keep it within `min`/`max` and on a valid `step` |
| `if` has no effect | `when` must be one complete boolean interpolation |
| Chart rejects a numeric cell | Write a plain number or one complete interpolation; move units to a header or `y-label` |
| Array displays blank | Do not write `{{ array }}`; use `len`, an index or an aggregate |
| Container content escapes | Check closing tags and nesting |
| Tag renders literally | Check whether it is inside code or escaped; unknown tags fall back to source |
| `||` breaks a table | Write `\|\|` in the cell |
| Plot rejects a formula | Check the computable set; use `\mathrm{name}` for multi-letter parameters |
| "Unable to compute" | Check division by zero, types or non-finite results |
| Declaration has no effect | Place it at top level and check for a duplicate control name |

Fix the first compile error before later diagnostics. Compile errors block preview; unknown-tag warnings preserve a source fallback; runtime calculation errors affect only the corresponding content.

## 13 Authoring checklist

- Every input has a `label`; `bind` exists only when other content reads the value.
- Parameter names are semantic and case-consistent; no reserved-name conflicts.
- One explicit `initial` per parameter; shared controls agree on type, range and step.
- Repeated expressions are extracted into `computed`; fixed values use `const`.
- Conditions use complete boolean interpolations; hidden branches declare every name.
- Chart numeric columns contain numbers or complete interpolations only.
- Containers close correctly; block tags occupy their own lines.
- Escapes are correct: `\{{`, `\<tag>`, `\|\|`.
- The document works at 375px with keyboard, screen reader and dark mode.
- `reactive-md lint` is clean and the interactions were exercised in a real browser.