/**
 * Variable node hint generators
 *
 * Split into 6 independent generators by variable type, each maintained separately
 * Facilitates quick problem location and text modification
 */

export { generateBooleanHint } from "./generate-boolean-hint";
export { generateEnumHint } from "./generate-enum-hint";
export { generateNumberHint } from "./generate-number-hint";
export { generatePercentageHint } from "./generate-percentage-hint";
export { generateStringHint } from "./generate-string-hint";
export { generateTimeHint } from "./generate-time-hint";

export type { HintGeneratorParams } from "./types";
