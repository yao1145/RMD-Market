/**
 * A small, deterministic interpreter for the Cattca interactive-fiction
 * language. It is inspired by CattcaJS but deliberately does not embed or
 * evaluate JavaScript: expressions are parsed by the recursive-descent
 * evaluator below and only expose a whitelisted `Math` namespace.
 */
export type CattcaValue = string | number | boolean | null;
export interface CattcaChoice {
    readonly index: number;
    readonly label: string;
}
export type CattcaPending = {
    readonly kind: 'choice';
    readonly instruction: number;
    readonly variable: string | null;
    readonly options: readonly CattcaChoice[];
} | {
    readonly kind: 'text';
    readonly instruction: number;
    readonly variable: string;
};
export interface CattcaOutputEntry {
    readonly id: number;
    readonly kind: 'text' | 'value';
    readonly text: string;
}
export interface CattcaState {
    readonly variables: Readonly<Record<string, CattcaValue>>;
    readonly output: readonly CattcaOutputEntry[];
    readonly logs: readonly string[];
    readonly pending: CattcaPending | null;
    readonly finished: boolean;
    readonly error: string | null;
}
export interface CattcaProgram {
    readonly instructions: readonly CattcaInstruction[];
    readonly labels: ReadonlyMap<string, number>;
    readonly error: string | null;
}
export declare const CATTCA_LIMITS: Readonly<{
    scriptLength: 100000;
    instructions: 5000;
    variables: 1000;
    outputEntries: 10000;
    outputChars: 500000;
    logEntries: 2000;
    stepsPerResume: 20000;
    expressionLength: 2000;
    expressionDepth: 32;
    commandDepth: 16;
    choiceOptions: 64;
    nameLength: 128;
    inputLength: 2000;
}>;
export type CattcaCommand = {
    readonly kind: 'let';
    readonly name: string;
    readonly expression: string | null;
} | {
    readonly kind: 'set';
    readonly name: string;
    readonly expression: string;
} | {
    readonly kind: 'apply';
    readonly expression: string;
} | {
    readonly kind: 'log';
    readonly expression: string;
} | {
    readonly kind: 'label';
    readonly name: string;
} | {
    readonly kind: 'goto';
    readonly name: string;
} | {
    readonly kind: 'if';
    readonly condition: string;
    readonly then: CattcaCommand;
} | {
    readonly kind: 'inputCase';
    readonly variable: string | null;
    readonly options: readonly {
        readonly label: string;
        readonly command: CattcaCommand;
    }[];
} | {
    readonly kind: 'inputText';
    readonly name: string;
} | {
    readonly kind: 'exit';
} | {
    readonly kind: 'unknown';
    readonly raw: string;
};
export type CattcaInstruction = {
    readonly type: 'text';
    readonly text: string;
} | {
    readonly type: 'command';
    readonly command: CattcaCommand;
};
export declare function compileCattca(source: string): CattcaProgram;
export declare function evaluateCattcaExpression(expression: string, variables?: Readonly<Record<string, CattcaValue>>): CattcaValue;
export declare function startCattca(program: CattcaProgram): CattcaState;
export declare function chooseCattca(program: CattcaProgram, state: CattcaState, index: number): CattcaState;
export declare function submitCattcaText(program: CattcaProgram, state: CattcaState, value: string): CattcaState;
export declare function restartCattca(program: CattcaProgram): CattcaState;
