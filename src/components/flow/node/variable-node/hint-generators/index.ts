/**
 * 变量节点提示文案生成器
 *
 * 按变量类型拆分为6个独立生成器，每个生成器独立维护
 * 便于快速定位问题和修改文案
 */

export { generateBooleanHint } from "./generate-boolean-hint";
export { generateEnumHint } from "./generate-enum-hint";
export { generateNumberHint } from "./generate-number-hint";
export { generateStringHint } from "./generate-string-hint";
export { generateTimeHint } from "./generate-time-hint";
export { generatePercentageHint } from "./generate-percentage-hint";

export type { HintGeneratorParams } from "./types";
