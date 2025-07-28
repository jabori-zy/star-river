import type { AccBandsConfigType } from "./acc-bands";
import type { BBandsConfigType } from "./bbands";
import type { MAConfigType } from "./ma";
import type { MACDConfigType } from "./macd";
import type { ADXConfigType } from "./momentum/adx";
import type { ADXRConfigType } from "./momentum/adxr";
import type { APOConfigType } from "./momentum/apo";
import type { AroonConfigType } from "./momentum/aroon";
import type { AroonOscConfigType } from "./momentum/aroonosc";
import type { BopConfigType } from "./momentum/bop";
import type { CciConfigType } from "./momentum/cci";
import type { CmoConfigType } from "./momentum/cmo";
import type { DxConfigType } from "./momentum/dx";
import type { RSIConfigType } from "./rsi";

export type IndicatorConfigType =
	| MAConfigType
	| MACDConfigType
	| RSIConfigType
	| BBandsConfigType
	| AccBandsConfigType
	| APOConfigType
	| ADXConfigType
	| ADXRConfigType
	| AroonConfigType
	| AroonOscConfigType
	| BopConfigType
	| CciConfigType
	| CmoConfigType
	| DxConfigType;
