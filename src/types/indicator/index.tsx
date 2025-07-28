// import type {
// 	BBandsConfig,
// 	EMAConfig,
// 	MACDConfig,
// 	MAConfig,
// 	SMAConfig,
// } from "./backup/indicator-config";

// export type IndicatorConfig =
// 	| MAConfig
// 	| SMAConfig
// 	| EMAConfig
// 	| BBandsConfig
// 	| MACDConfig;

export enum MAType {
	SMA = "SMA",
	EMA = "EMA",
	WMA = "WMA",
	DEMA = "DEMA",
	TEMA = "TEMA",
	TRIMA = "TRIMA",
	KAMA = "KAMA",
	MANA = "MANA",
	T3 = "T3",
}

export enum IndicatorType {
	MA = "ma",
	SMA = "sma",
	EMA = "ema",
	BBANDS = "bbands",
	MACD = "macd",
	RSI = "rsi",
	ACCBANDS = "accbands",
	AD = "ad", //Chaikin A/D Line #钱德动量线
	ADOSC = "adosc", //Chaikin A/D Oscillator #钱德动量摆动指标
	ADX = "adx", //Average Directional Index #平均方向性指数
	ADXR = "adxr", //Average Directional Index Rating #平均方向运动指数等级
	APO = "apo", //Absolute Price Oscillator #绝对价格振荡器
	AROON = "aroon", //Aroon #阿隆指标
	AROONOSC = "aroonosc", //Aroon Oscillator #阿隆振荡器
	BOP = "bop", //Balance Of Power #力量平衡指标
	CCI = "cci", //Commodity Channel Index #商品通道指数
	CMO = "cmo", //Chande Momentum Oscillator #钱德动量摆动指标
	DX = "dx", //Directional Movement Index #方向运动指数
}

// export type IndicatorMap = {
// 	[IndicatorType.SMA]: SMAConfig;
// 	[IndicatorType.EMA]: EMAConfig;
// 	[IndicatorType.BBANDS]: BBandsConfig;
// 	[IndicatorType.MACD]: MACDConfig;
// };

export enum PriceSource {
	CLOSE = "CLOSE",
	OPEN = "OPEN",
	HIGH = "HIGH",
	LOW = "LOW",
}
