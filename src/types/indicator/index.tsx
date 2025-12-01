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

export const IndicatorCategoryDisplayNames: Record<IndicatorCategory, string> = {
	[IndicatorCategory.OVERLAP]: "indicator.category.overlap",
	[IndicatorCategory.MOMENTUM]: "indicator.category.momentum",
	[IndicatorCategory.VOLATILITY]: "indicator.category.volatility",
	[IndicatorCategory.VOLUME]: "indicator.category.volume",
	[IndicatorCategory.PRICE_TRANSFORM]: "indicator.category.priceTransform",
	[IndicatorCategory.CYCLE]: "indicator.category.cycle",
	[IndicatorCategory.PATTERN_RECOGNITION]: "indicator.category.patternRecognition",
	[IndicatorCategory.CUSTOM]: "indicator.category.custom",
};

export const getIndicatorCategoryDisplayName = (category: IndicatorCategory, t: TFunction) => {
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
	DEMA = "dema", //Double Exponential Moving Average #双指数移动平均线
	HT_TRENDLINE = "ht_trendline", //Hilbert Transform - Instantaneous Trendline #希尔伯特瞬时趋势线
	KAMA = "kama", //Kaufman Adaptive Moving Average #卡夫曼自适应移动平均线
	MAMA = "mama", //MESA Adaptive Moving Average #梅萨自适应移动平均线
	MIDPOINT = "midpoint", //MidPoint over period #周期中点
	MIDPRICE = "midprice", //Midpoint Price over period #周期中点价格
	SAR = "sar", //Parabolic SAR #抛物线转向
	SAREXT = "sarext", //Parabolic SAR - Extended #抛物线转向扩展
	T3 = "t3", //Triple Exponential Moving Average (T3) #三重指数移动平均线
	TEMA = "tema", //Triple Exponential Moving Average #三重指数移动平均线
	TRIMA = "trima", //Triangular Moving Average #三角形移动平均线
	WMA = "wma", //Weighted Moving Average #加权移动平均线

	// momentum
	MACD = "macd",
	RSI = "rsi",
	ACCBANDS = "accbands",
	AD = "ad", //Chaikin A/D Line #钱德动量线
	ADOSC = "adosc", //Chaikin A/D Oscillator #钱德动量摆动指标
	OBV = "obv", //On Balance Volume #能量潮
	ADX = "adx", //Average Directional Index #平均方向性指数
	ADXR = "adxr", //Average Directional Index Rating #平均方向运动指数等级
	APO = "apo", //Absolute Price Oscillator #绝对价格振荡器
	AROON = "aroon", //Aroon #阿隆指标
	AROONOSC = "aroonosc", //Aroon Oscillator #阿隆振荡器
	BOP = "bop", //Balance Of Power #力量平衡指标
	CCI = "cci", //Commodity Channel Index #商品通道指数
	CMO = "cmo", //Chande Momentum Oscillator #钱德动量摆动指标
	DX = "dx", //Directional Movement Index #方向运动指数
	MACDEXT = "macdext", //MACD with controllable MA type #可控MA类型的MACD
	MACDFIX = "macdfix", //Moving Average Convergence/Divergence Fix 12/26 #12/26固定MACD
	MFI = "mfi", //Money Flow Index #资金流量指数
	MINUS_DI = "minus_di", //Minus Directional Indicator #负方向性指标
	MINUS_DM = "minus_dm", //Minus Directional Movement #负方向性运动
	MOM = "mom", //Momentum #动量
	PLUS_DI = "plus_di", //Plus Directional Indicator #正方向性指标
	PLUS_DM = "plus_dm", //Plus Directional Movement #正方向性运动
	PPO = "ppo", //Percentage Price Oscillator #百分比价格振荡器
	ROC = "roc", //Rate of change #变化率
	ROCP = "rocp", //Rate of change Percentage #变化率百分比
	ROCR = "rocr", //Rate of change ratio #变化率比率
	ROCR100 = "rocr100", //Rate of change ratio 100 scale #变化率比率100比例
	STOCH = "stoch", //Stochastic #随机指标
	STOCHF = "stochf", //Stochastic Fast #快速随机指标
	STOCHRSI = "stochrsi", //Stochastic Relative Strength Index #随机相对强弱指数
	TRIX = "trix", //1-day Rate-Of-Change (ROC) of a Triple Smooth EMA
	ULTOSC = "ultosc", //Ultimate Oscillator #终极振荡器
	WILLR = "willr", //Williams' %R #威廉指标

	// pattern recognition - candlestick patterns
	CDL2CROWS = "cdl2crows", //Two Crows #两只乌鸦
	CDL3BLACKCROWS = "cdl3blackcrows", //Three Black Crows #三只乌鸦
	CDL3INSIDE = "cdl3inside", //Three Inside Up/Down #三内部上涨/下跌
	CDL3LINESTRIKE = "cdl3linestrike", //Three-Line Strike #三线打击
	CDL3OUTSIDE = "cdl3outside", //Three Outside Up/Down #三外部上涨/下跌
	CDL3STARSINSOUTH = "cdl3starsinsouth", //Three Stars In The South #三颗星在南方
	CDL3WHITESOLDIERS = "cdl3whitesoldiers", //Three Advancing White Soldiers #三只白兵
	CDLABANDONEDBABY = "cdlabandonedbaby", //Abandoned Baby #弃婴
	CDLADVANCEBLOCK = "cdladvanceblock", //Advance Block #前进阻挡
	CDLBELTHOLD = "cdlbelthold", //Belt-hold #带柄
	CDLBREAKAWAY = "cdlbreakaway", //Breakaway #突破
	CDLCLOSINGMARUBOZU = "cdlclosingmarubozu", //Closing Marubozu #收盘十字星
	CDLCONCEALBABYSWALL = "cdlconcealbabyswall", //Concealing Baby Swallow #隐藏婴儿吞噬
	CDLCOUNTERATTACK = "cdlcounterattack", //Counterattack #反击
	CDLDARKCLOUDCOVER = "cdldarkcloudcover", //Dark Cloud Cover #乌云盖顶
	CDLDOJI = "cdldoji", //Doji #十字星
	CDLDOJISTAR = "cdldojistar", //Doji Star #十字星
	CDLDRAGONFLYDOJI = "cdldragonflydoji", //Dragonfly Doji #蜻蜓十字星
	CDLENGULFING = "cdlengulfing", //Engulfing Pattern #吞噬模式
	CDLEVENINGDOJISTAR = "cdleveningdojistar", //Evening Doji Star #黄昏十字星
	CDLEVENINGSTAR = "cdleveningstar", //Evening Star #黄昏星
	CDLGAPSIDESIDEWHITE = "cdlgapsidesidewhite", //Up/Down-gap side-by-side white lines #上/下缺口侧边白线
	CDLGRAVESTONEDOJI = "cdlgravestonedoji", //Gravestone Doji #墓碑十字星
	CDLHAMMER = "cdlhammer", //Hammer #锤子
	CDLHANGINGMAN = "cdlhangingman", //Hanging Man #吊人
	CDLHARAMI = "cdlharami", //Harami Pattern #孕线模式
	CDLHARAMICROSS = "cdlharamicross", //Harami Cross Pattern #孕线交叉模式
	CDLHIGHWAVE = "cdlhighwave", //High-Wave Candle #高浪烛
	CDLHIKKAKE = "cdlhikkake", //Hikkake Pattern #跳空模式
	CDLHIKKAKEMOD = "cdlhikkakemod", //Modified Hikkake Pattern #修改跳空模式
	CDLHOMINGPIGEON = "cdlhomingpigeon", //Homing Pigeon #归巢鸽
	CDLIDENTICAL3CROWS = "cdlidentical3crows", //Identical Three Crows #相同三只乌鸦
	CDLINNECK = "cdlinneck", //In-Neck Pattern #颈线模式
	CDLINVERTEDHAMMER = "cdlinvertedhammer", //Inverted Hammer #倒锤子
	CDLKICKING = "cdlkicking", //Kicking #踢腿
	CDLKICKINGBYLENGTH = "cdlkickingbylength", //Kicking - bull/bear determined by the longer marubozu #踢腿
	CDLLADDERBOTTOM = "cdlladderbottom", //Ladder Bottom #梯底
	CDLLONGLEGGEDDOJI = "cdllongleggeddoji", //Long Legged Doji #长脚十字星
	CDLLONGLINE = "cdllongline", //Long Line Candle #长蜡烛
	CDLMARUBOZU = "cdlmarubozu", //Marubozu #实体蜡烛
	CDLMATCHINGLOW = "cdlmatchinglow", //Matching Low #匹配低点
	CDLMATHOLD = "cdlmathold", //Mat Hold #支撑
	CDLMORNINGDOJISTAR = "cdlmorningdojistar", //Morning Doji Star #早晨十字星
	CDLMORNINGSTAR = "cdlmorningstar", //Morning Star #早晨之星
	CDLONNECK = "cdlonneck", //On-Neck Pattern #颈线模式
	CDLPIERCING = "cdlpiercing", //Piercing Pattern #刺透模式
	CDLRICKSHAWMAN = "cdlrickshawman", //Rickshaw Man #人力车夫
	CDLRISEFALL3METHODS = "cdlrisefall3methods", //Rising/Falling Three Methods #上升/下降三法
	CDLSEPARATINGLINES = "cdlseparatinglines", //Separating Lines #分离线
	CDLSHOOTINGSTAR = "cdlshootingstar", //Shooting Star #射击之星
	CDLSHORTLINE = "cdlshortline", //Short Line Candle #短蜡烛
	CDLSPINNINGTOP = "cdlspinningtop", //Spinning Top #旋转顶部
	CDLSTALLEDPATTERN = "cdlstalledpattern", //Stalled Pattern #停滞模式
	CDLSTICKSANDWICH = "cdlsticksandwich", //Stick Sandwich #针刺三明治
	CDLTAKURI = "cdltakuri", //Takuri (Dragonfly Doji with very long lower shadow) #蜻蜓十字星
	CDLTASUKIGAP = "cdltasukigap", //Tasuki Gap #田中缺口
	CDLTHRUSTING = "cdlthrusting", //Thrusting Pattern #刺穿模式
	CDLTRISTAR = "cdltristar", //Tristar Pattern #三星模式
	CDLUNIQUE3RIVER = "cdlunique3river", //Unique 3 River #唯一三河
	CDLUPSIDEGAP2CROWS = "cdlupsidegap2crows", //Upside Gap Two Crows #上缺口两只乌鸦
	CDLXSIDEGAP3METHODS = "cdlxsidegap3methods", //Upside/Downside Gap Three Methods #上/下缺口三法

	// volatility
	ATR = "atr", //Average True Range #平均真实波幅
	NATR = "natr", //Normalized Average True Range #归一化平均真实波幅
	TRANGE = "trange", //True Range #真实波幅

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

export const getPriceSourceDisplayName = (priceSource: PriceSource, t: TFunction) => {
	const priceSourceLabel = {
		[PriceSource.CLOSE]: "market.klineValueField.close",
		[PriceSource.OPEN]: "market.klineValueField.open",
		[PriceSource.HIGH]: "market.klineValueField.high",
		[PriceSource.LOW]: "market.klineValueField.low",
	};
	return t(priceSourceLabel[priceSource]);
};
