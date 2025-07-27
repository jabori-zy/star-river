import type { BBandsConfigType } from "./bbands";
import type { MAConfigType } from "./ma";
import type { MACDConfigType } from "./macd";
import type { RSIConfigType } from "./rsi";

export type IndicatorConfigType =
	| MAConfigType
	| MACDConfigType
	| RSIConfigType
	| BBandsConfigType;
