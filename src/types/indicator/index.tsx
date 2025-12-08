import type { TFunction } from "i18next";

export enum IndicatorCategory {
	OVERLAP = "Overlap",
	MOMENTUM = "Momentum",
	VOLATILITY = "Volatility",
	VOLUME = "Volume",
	PRICE_TRANSFORM = "PriceTransform",
	CYCLE = "Cycle",
	PATTERN_RECOGNITION = "PatternRecognition",
	CUSTOM = "Custom",
}

export const IndicatorCategoryDisplayNames: Record<IndicatorCategory, string> =
	{
		[IndicatorCategory.OVERLAP]: "indicator.category.overlap",
		[IndicatorCategory.MOMENTUM]: "indicator.category.momentum",
		[IndicatorCategory.VOLATILITY]: "indicator.category.volatility",
		[IndicatorCategory.VOLUME]: "indicator.category.volume",
		[IndicatorCategory.PRICE_TRANSFORM]: "indicator.category.priceTransform",
		[IndicatorCategory.CYCLE]: "indicator.category.cycle",
		[IndicatorCategory.PATTERN_RECOGNITION]:
			"indicator.category.patternRecognition",
		[IndicatorCategory.CUSTOM]: "indicator.category.custom",
	};

export const getIndicatorCategoryDisplayName = (
	category: IndicatorCategory,
	t: TFunction,
) => {
	return t(IndicatorCategoryDisplayNames[category]);
};

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
	// cycle
	HT_DCPERIOD = "ht_dcperiod",
	HT_DCPHASE = "ht_dcphase",
	HT_PHASOR = "ht_phasor",
	HT_SINE = "ht_sine",
	HT_TRENDMODE = "ht_trendmode",

	// overlap
	MA = "ma",
	SMA = "sma",
	EMA = "ema",
	BBANDS = "bbands",
	DEMA = "dema", // Double Exponential Moving Average
	HT_TRENDLINE = "ht_trendline", // Hilbert Transform - Instantaneous Trendline
	KAMA = "kama", // Kaufman Adaptive Moving Average
	MAMA = "mama", // MESA Adaptive Moving Average
	MIDPOINT = "midpoint", // MidPoint over period
	MIDPRICE = "midprice", // Midpoint Price over period
	SAR = "sar", // Parabolic SAR
	SAREXT = "sarext", // Parabolic SAR - Extended
	T3 = "t3", // Triple Exponential Moving Average (T3)
	TEMA = "tema", // Triple Exponential Moving Average
	TRIMA = "trima", // Triangular Moving Average
	WMA = "wma", // Weighted Moving Average

	// momentum
	MACD = "macd",
	RSI = "rsi",
	ACCBANDS = "accbands",
	AD = "ad", // Chaikin A/D Line
	ADOSC = "adosc", // Chaikin A/D Oscillator
	OBV = "obv", // On Balance Volume
	ADX = "adx", // Average Directional Index
	ADXR = "adxr", // Average Directional Index Rating
	APO = "apo", // Absolute Price Oscillator
	AROON = "aroon", // Aroon
	AROONOSC = "aroonosc", // Aroon Oscillator
	BOP = "bop", // Balance Of Power
	CCI = "cci", // Commodity Channel Index
	CMO = "cmo", // Chande Momentum Oscillator
	DX = "dx", // Directional Movement Index
	MACDEXT = "macdext", // MACD with controllable MA type
	MACDFIX = "macdfix", // Moving Average Convergence/Divergence Fix 12/26
	MFI = "mfi", // Money Flow Index
	MINUS_DI = "minus_di", // Minus Directional Indicator
	MINUS_DM = "minus_dm", // Minus Directional Movement
	MOM = "mom", // Momentum
	PLUS_DI = "plus_di", // Plus Directional Indicator
	PLUS_DM = "plus_dm", // Plus Directional Movement
	PPO = "ppo", // Percentage Price Oscillator
	ROC = "roc", // Rate of change
	ROCP = "rocp", // Rate of change Percentage
	ROCR = "rocr", // Rate of change ratio
	ROCR100 = "rocr100", // Rate of change ratio 100 scale
	STOCH = "stoch", // Stochastic
	STOCHF = "stochf", // Stochastic Fast
	STOCHRSI = "stochrsi", // Stochastic Relative Strength Index
	TRIX = "trix", // 1-day Rate-Of-Change (ROC) of a Triple Smooth EMA
	ULTOSC = "ultosc", // Ultimate Oscillator
	WILLR = "willr", // Williams' %R

	// pattern recognition - candlestick patterns
	CDL2CROWS = "cdl2crows", // Two Crows
	CDL3BLACKCROWS = "cdl3blackcrows", // Three Black Crows
	CDL3INSIDE = "cdl3inside", // Three Inside Up/Down
	CDL3LINESTRIKE = "cdl3linestrike", // Three-Line Strike
	CDL3OUTSIDE = "cdl3outside", // Three Outside Up/Down
	CDL3STARSINSOUTH = "cdl3starsinsouth", // Three Stars In The South
	CDL3WHITESOLDIERS = "cdl3whitesoldiers", // Three Advancing White Soldiers
	CDLABANDONEDBABY = "cdlabandonedbaby", // Abandoned Baby
	CDLADVANCEBLOCK = "cdladvanceblock", // Advance Block
	CDLBELTHOLD = "cdlbelthold", // Belt-hold
	CDLBREAKAWAY = "cdlbreakaway", // Breakaway
	CDLCLOSINGMARUBOZU = "cdlclosingmarubozu", // Closing Marubozu
	CDLCONCEALBABYSWALL = "cdlconcealbabyswall", // Concealing Baby Swallow
	CDLCOUNTERATTACK = "cdlcounterattack", // Counterattack
	CDLDARKCLOUDCOVER = "cdldarkcloudcover", // Dark Cloud Cover
	CDLDOJI = "cdldoji", // Doji
	CDLDOJISTAR = "cdldojistar", // Doji Star
	CDLDRAGONFLYDOJI = "cdldragonflydoji", // Dragonfly Doji
	CDLENGULFING = "cdlengulfing", // Engulfing Pattern
	CDLEVENINGDOJISTAR = "cdleveningdojistar", // Evening Doji Star
	CDLEVENINGSTAR = "cdleveningstar", // Evening Star
	CDLGAPSIDESIDEWHITE = "cdlgapsidesidewhite", // Up/Down-gap side-by-side white lines
	CDLGRAVESTONEDOJI = "cdlgravestonedoji", // Gravestone Doji
	CDLHAMMER = "cdlhammer", // Hammer
	CDLHANGINGMAN = "cdlhangingman", // Hanging Man
	CDLHARAMI = "cdlharami", // Harami Pattern
	CDLHARAMICROSS = "cdlharamicross", // Harami Cross Pattern
	CDLHIGHWAVE = "cdlhighwave", // High-Wave Candle
	CDLHIKKAKE = "cdlhikkake", // Hikkake Pattern
	CDLHIKKAKEMOD = "cdlhikkakemod", // Modified Hikkake Pattern
	CDLHOMINGPIGEON = "cdlhomingpigeon", // Homing Pigeon
	CDLIDENTICAL3CROWS = "cdlidentical3crows", // Identical Three Crows
	CDLINNECK = "cdlinneck", // In-Neck Pattern
	CDLINVERTEDHAMMER = "cdlinvertedhammer", // Inverted Hammer
	CDLKICKING = "cdlkicking", // Kicking
	CDLKICKINGBYLENGTH = "cdlkickingbylength", // Kicking - bull/bear determined by the longer marubozu
	CDLLADDERBOTTOM = "cdlladderbottom", // Ladder Bottom
	CDLLONGLEGGEDDOJI = "cdllongleggeddoji", // Long Legged Doji
	CDLLONGLINE = "cdllongline", // Long Line Candle
	CDLMARUBOZU = "cdlmarubozu", // Marubozu
	CDLMATCHINGLOW = "cdlmatchinglow", // Matching Low
	CDLMATHOLD = "cdlmathold", // Mat Hold
	CDLMORNINGDOJISTAR = "cdlmorningdojistar", // Morning Doji Star
	CDLMORNINGSTAR = "cdlmorningstar", // Morning Star
	CDLONNECK = "cdlonneck", // On-Neck Pattern
	CDLPIERCING = "cdlpiercing", // Piercing Pattern
	CDLRICKSHAWMAN = "cdlrickshawman", // Rickshaw Man
	CDLRISEFALL3METHODS = "cdlrisefall3methods", // Rising/Falling Three Methods
	CDLSEPARATINGLINES = "cdlseparatinglines", // Separating Lines
	CDLSHOOTINGSTAR = "cdlshootingstar", // Shooting Star
	CDLSHORTLINE = "cdlshortline", // Short Line Candle
	CDLSPINNINGTOP = "cdlspinningtop", // Spinning Top
	CDLSTALLEDPATTERN = "cdlstalledpattern", // Stalled Pattern
	CDLSTICKSANDWICH = "cdlsticksandwich", // Stick Sandwich
	CDLTAKURI = "cdltakuri", // Takuri (Dragonfly Doji with very long lower shadow)
	CDLTASUKIGAP = "cdltasukigap", // Tasuki Gap
	CDLTHRUSTING = "cdlthrusting", // Thrusting Pattern
	CDLTRISTAR = "cdltristar", // Tristar Pattern
	CDLUNIQUE3RIVER = "cdlunique3river", // Unique 3 River
	CDLUPSIDEGAP2CROWS = "cdlupsidegap2crows", // Upside Gap Two Crows
	CDLXSIDEGAP3METHODS = "cdlxsidegap3methods", // Upside/Downside Gap Three Methods

	// volatility
	ATR = "atr", // Average True Range
	NATR = "natr", // Normalized Average True Range
	TRANGE = "trange", // True Range

	// price transform
	AVGPRICE = "avgprice",
	MEDPRICE = "medprice",
	TYPPRICE = "typprice",
	WCLPRICE = "wclprice",
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

export const getPriceSourceDisplayName = (
	priceSource: PriceSource,
	t: TFunction,
) => {
	const priceSourceLabel = {
		[PriceSource.CLOSE]: "market.klineValueField.close",
		[PriceSource.OPEN]: "market.klineValueField.open",
		[PriceSource.HIGH]: "market.klineValueField.high",
		[PriceSource.LOW]: "market.klineValueField.low",
	};
	return t(priceSourceLabel[priceSource]);
};
