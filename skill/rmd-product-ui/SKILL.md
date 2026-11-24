---
name: rmd-product-ui
description: "Apply, extend, or audit the ReactiveMD Product UI design language. Use when maintaining ReactiveMD's default Product UI styling or when a user explicitly requests the RMD Product UI style, its design tokens, component recipes, preview, or CSS audit for another project. For general UI work, follow the host project's design system."
---

# RMD Product UI design language

This skill packages the ReactiveMD Product UI default theme from ReactiveMD 0.9.2. It is self-contained and works without a ReactiveMD checkout. [assets/tokens.json](assets/tokens.json) is the canonical token data. For other ReactiveMD versions, verify the target theme values.

## Quick start

From the **host project root**, replace `/path/to/rmd-product-ui` with the installed skill directory. The reference recipes use native, unprefixed token names, so generate that variant for direct use.

```sh
node "/path/to/rmd-product-ui/scripts/rmd-ui.mjs" tokens --prefix= --utilities --out ./rmd-tokens.css
node "/path/to/rmd-product-ui/scripts/rmd-ui.mjs" audit ./rmd-tokens.css --fail-on warn
node "/path/to/rmd-product-ui/scripts/rmd-ui.mjs" contrast --strict
```

Load `rmd-tokens.css` before your component styles. For an existing UI, pass your actual stylesheet or CSS directory to `audit`. To use a host prefix, pass `--prefix app` and use `--app-*` in component styles. The CLI default is `--ui-*`.

From the **skill directory**, run a local smoke check or regenerate the [interactive preview](preview.html).

```sh
node scripts/rmd-ui.mjs audit tests/fixtures/clean.css --fail-on warn
node scripts/rmd-ui.mjs preview --out preview.html
npm test
```

Run `node scripts/rmd-ui.mjs help` for options and `node scripts/rmd-ui.mjs rules` for audit rule IDs. The scripts use only the Node.js standard library.

## Apply the design language

1. **Map surface and colour roles.** Use warm paper, neutral surfaces and one blue accent for actions, selection and focus. Keep status colours semantic. Use one bordered panel, background-only cards and divider rows for repeated content. Reserve shadows for overlays and the control-hover treatment.
2. **Assign type roles.** Use 16px/1.7 for document prose, with a 720px measure. Use the shared roles for headings, labels, buttons, code and numeric values. Preserve the body size on mobile.
3. **Choose shape and spacing by role.** Use a 4px spacing unit, 8px fields, 10px buttons, 12px cards and 14px panels. Use pill radii for badges and switches. Keep control borders and a 38px default height. Use 44px for large controls, interactive rows and slider hit areas.
4. **Tie motion to state.** Use 150ms for state, 220ms for structure and 300ms for progress with `cubic-bezier(0.22, 0.61, 0.36, 1)`. Apply press feedback with the `scale` property and name the transitioned properties. Give motion a reduced-motion override and communicate state through visible cues.
5. **Design both modes.** Map semantic tokens in light and dark. Preserve visible keyboard focus with a 2px ring and 2px offset, or the field-specific accent border and halo. Use the print-safe palette and system colours in forced-colours mode.

## Verify the host UI

- Run `audit <stylesheet-or-directory> --fail-on warn`. Inspect findings and document intended exceptions. The radius rule checks numeric values. In the rendered UI, verify the radius for each button and field role and check that content cards are flat with a fill-only boundary.
- `audit` checks infinite animations against same-file reduced-motion overrides. It matches identical selectors and recognises important universal overrides for elements and pseudo-elements. Check cross-file, complex-selector and cascade-dependent overrides in the browser.
- Run `contrast --strict` for curated token pairs in both modes. Check actual text, focus and control boundaries in the host UI. The default hairlines fall below 3:1 against the surface. Give controls a stronger boundary where it is needed to identify them.
- Check light/dark, a narrow viewport around 390px, keyboard and assistive-technology interactions, reduced motion, and print in the host UI.

## References

- [Visual language](references/visual-language.md) for surfaces, colour, spacing, shapes, component states and examples.
- [Typography](references/typography.md) for the full type scale, role recipes and multilingual text.
- [Motion](references/motion.md) for timing exceptions, component recipes and reduced-motion overrides.
- [Token register](references/tokens.md) for exact values, light/dark modes, density and component geometry.
