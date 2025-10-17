import { z } from "zod";
import { SeriesType } from "@/types/chart";
import {
	IndicatorCategory,
	IndicatorType,
	MAType,
	PriceSource,
} from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import {
	type IndicatorValueConfig,
	MATypeSchema,
	PriceSourceSchema,
} from "@/types/indicator/schemas";

const MACDEXTConfigSchema = z.object({
	fastPeriod: z.number().int().positive(),
	fastMaType: MATypeSchema,
	slowPeriod: z.number().int().positive(),
	slowMaType: MATypeSchema,
	signalPeriod: z.number().int().positive(),
	signalMaType: MATypeSchema,
	priceSource: PriceSourceSchema,
});

export type MACDEXTConfigType = z.infer<typeof MACDEXTConfigSchema>;

function buildMACDEXTConfig(params: Map<string, string>): unknown {
	return {
		fastPeriod: Number.parseInt(params.get("fast_period") || "12"),
		fastMaType: params.get("fast_ma_type") as MAType,
		slowPeriod: Number.parseInt(params.get("slow_period") || "26"),
		slowMaType: params.get("slow_ma_type") as MAType,
		signalPeriod: Number.parseInt(params.get("signal_period") || "9"),
		signalMaType: params.get("signal_ma_type") as MAType,
		priceSource: params.get("price_source") as PriceSource,
	};
}

export const MACDEXTConfig: IndicatorConfig<MACDEXTConfigType> = {
	category: IndicatorCategory.MOMENTUM,
	type: IndicatorType.MACDEXT,
	displayName: "MACDEXT",
	description: "MACD with controllable MA type",
	params: {
		fastPeriod: {
			label: "快速周期",
			description: "快速移动平均周期",
			defaultValue: 12,
			required: true,
			legendShowName: "fast",
		},
		fastMaType: {
			label: "快速MA类型",
			description: "快速移动平均类型",
			defaultValue: MAType.SMA,
			required: true,
			legendShowName: "fastMA",
		},
		slowPeriod: {
			label: "慢速周期",
			description: "慢速移动平均周期",
			defaultValue: 26,
			required: true,
			legendShowName: "slow",
		},
		slowMaType: {
			label: "慢速MA类型",
			description: "慢速移动平均类型",
			defaultValue: MAType.SMA,
			required: true,
			legendShowName: "slowMA",
		},
		signalPeriod: {
			label: "信号周期",
			description: "信号线周期",
			defaultValue: 9,
			required: true,
			legendShowName: "signal",
		},
		signalMaType: {
			label: "信号MA类型",
			description: "信号线移动平均类型",
			defaultValue: MAType.SMA,
			required: true,
			legendShowName: "signalMA",
		},
		priceSource: {
			label: "价格源",
			description: "选择指标计算价格源",
			defaultValue: PriceSource.CLOSE,
			required: true,
			legendShowName: "source",
		},
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		macd: { label: "macd", value: 0, legendShowName: "macd" },
		signal: { label: "signal", value: 0, legendShowName: "signal" },
		histogram: { label: "histogram", value: 0, legendShowName: "histogram" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "macd",
				type: SeriesType.LINE,
				color: "#FF6600",
				lineWidth: 2,
				indicatorValueKey: "macd" as keyof IndicatorValueConfig,
			},
			{
				name: "signal",
				type: SeriesType.LINE,
				color: "#0099CC",
				lineWidth: 2,
				indicatorValueKey: "signal" as keyof IndicatorValueConfig,
			},
			{
				name: "histogram",
				type: SeriesType.COLUMN,
				color: "#999999",
				lineWidth: 1,
				indicatorValueKey: "histogram" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): MACDEXTConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		const validatedConfig = MACDEXTConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.MACDEXT,
		MACDEXTConfigSchema,
		buildMACDEXTConfig,
	),

	validateConfig(config: unknown): config is MACDEXTConfigType {
		try {
			MACDEXTConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};
