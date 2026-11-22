# Reactive MD Cattca interactive-fiction component

**English** · [中文](README-ch.md)

A `<cattca>` component package built on the public Reactive MD extension SDK.
It reads an interactive story from a `cattca` code fence and renders prose,
choices, text input, a restart action and optional debug state.

The command syntax is inspired by
[CattcaJS](https://github.com/raricycms/CattcaJS). This package is an
independent, safe subset: it does not embed CattcaJS and never uses `eval` or
`new Function` on story text.

> Status: example component package used to exercise container components,
> SSR, offline export and browser interaction. It is not published with the
> library.

## Preview

After a build, open one of these self-contained files in a browser:

- `dist/interactive.html` — interactive and offline-capable.
- `dist/static.html` — initial state only.

## Usage

The host provides one instance of `reactive-md`, React and React DOM:

```tsx
import { createReactHost } from 'reactive-md/react';
import { cattcaPackage } from 'reactive-md-cattca-package/react';

export const host = createReactHost({ packages: [cattcaPackage] });
export const { config, reactConfig } = host;
```

Author the component in Markdown:

````markdown
<cattca label="Morning" height="460" debug="{{ debug }}" disabled="{{ lock }}">

```cattca
你叫莱莉菥。
现在是早上六点，你醒了。

</let 赖床次数 = 0; label 故事开始;/>
你要怎么做？
</input case 选择:
  '继续睡觉' -> goto 睡觉:
  '起床' -> goto 起床;
/>

</label 睡觉; set 赖床次数 = 赖床次数 + 1;
if 赖床次数 > 2 -> goto 睡过头/>
你睡不着，翻了个身。
</goto 故事开始;/>
</label 睡过头/>
结局：你睡过头了。
</exit/>
```

</cattca>
````

The component reads the first `cattca` code fence. If no language is present,
the first code fence is used. The script itself is not rendered as prose.

## Props

| Prop | Default | Meaning |
| --- | --- | --- |
| `label` | `互动小说` | Title and accessible name |
| `height` | `420` | Max transcript height, 200–900 px |
| `debug` | `false` | Show variables and interpreter logs |
| `disabled` | `false` | Disable choices, input and restart |

## Commands

| Command | Syntax | Meaning |
| --- | --- | --- |
| `let` | `let name` / `let name = expression` | Declare a variable; `null` without `=` |
| `set` | `set name = expression` | Assign an existing variable |
| `apply` | `apply expression` | Append the result to the transcript |
| `log` | `log expression` | Write to logs, not prose |
| `label` | `label name` | Mark a jump target |
| `goto` | `goto name` | Jump to a label |
| `if` | `if condition -> one command` | Run one command when true |
| `input text` | `input text variable` | Pause for one line of text |
| `input case` | `input case [: variable] : 'label' -> command : ...` | Pause for a choice |
| `exit` | `exit` | End the story |

Commands live in `</ ... />` blocks and are separated by semicolons. Chinese
identifiers are supported.

## Expressions

The safe evaluator supports literals, variables, arithmetic, comparisons,
logic, ternaries, parentheses and a whitelisted `Math` namespace:

```cattca
</let x = 2; let y = 3;
apply x + y * 4;
apply x > y ? "x wins" : "y wins";
apply "hello " + "world";
apply Math.max(x, y);/>
```

`Math` exposes only `abs`, `ceil`, `floor`, `max`, `min`, `pow`, `round`,
`sign`, `sqrt`, `trunc`, `PI` and `E`. Story expressions cannot access
`window`, `document`, `fetch` or any other global.

Unresolved `apply` / `let` / `set` expressions fall back to their source text;
an unresolved `if` condition is `false` and is logged.

## Differences from CattcaJS

Not implemented: `say` / `pass`, the Cattca object and function system, brace
syntax sugar, comments, arbitrary JavaScript and non-whitelisted globals.
Keep `input case` option commands simple; avoid top-level ternary colons in
option commands.

## Safety and budgets

The interpreter never executes JavaScript from a story. Limits include:

- 100,000 script characters and 5,000 instructions;
- 20,000 steps per resume to stop runaway `goto` loops;
- 10,000 output entries and 500,000 output characters;
- 1,000 variables, 2,000 logs and 64 choices;
- 2,000 expression characters and 32 levels of nesting;
- 2,000 input characters.

Limits stop the story and render an error in the transcript.

## Development

```sh
npm run typecheck
npm test              # build + engine unit tests
npm run test:browser  # build + Edge/Playwright smoke test
```

Set `PLAYWRIGHT_CHANNEL` when Edge is not the default browser.

## Layout

| Path | Purpose |
| --- | --- |
| `src/cattca-engine.ts` | Safe parser, evaluator, interpreter and budgets |
| `src/manifests.ts` | `<cattca>` manifest |
| `src/components.tsx` | React player, SSR/static output and host config |
| `src/component.css` | Component structure and theme variables |
| `sample/document.reactive.md` | Sample interactive story |
| `test/engine.test.mjs` | Engine, control-flow and sample tests |
| `scripts/build.mjs` | Vite build, SSR checks and harness |
| `scripts/smoke.mjs` | Real-browser interaction check |
