/**
 * Node/SSR entry. Built by `scripts/build.mjs`; it uses only public
 * `reactive-md` entries.
 */
export { CattcaView, cattcaImplementation, cattcaPackage, componentCss, config, reactConfig, } from './components.js';
export { cattca } from './manifests.js';
export { CATTCA_LIMITS, chooseCattca, compileCattca, evaluateCattcaExpression, restartCattca, startCattca, submitCattcaText, } from './cattca-engine.js';
export type { CattcaChoice, CattcaOutputEntry, CattcaPending, CattcaProgram, CattcaState, CattcaValue, } from './cattca-engine.js';
export { source } from './sample.js';
