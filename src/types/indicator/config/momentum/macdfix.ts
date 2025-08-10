import { z } from "zod";
import { SeriesType } from "@/types/chart";
import {
	IndicatorCategory,
	IndicatorType,
	PriceSource,
} from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import {
	type IndicatorValueConfig,
	PriceSourceSchema,
} from "@/types/indicator/schemas";

const MACDFIXConfigSchema = z.object({
	signalPeriod: z.number().int().positive(),
	priceSource: PriceSourceSchema,
});

export type MACDFIXConfigType = z.infer<typeof MACDFIXConfigSchema>;

function buildMACDFIXConfig(params: Map<string, string>): unknown {
	return {
		signalPeriod: Number.parseInt(params.get("signal_period") || "9"),
		priceSource: params.get("price_source") as PriceSource,
	};
}

export const MACDFIXConfig: IndicatorConfig<MACDFIXConfigType> = {
	category: IndicatorCategory.MOMENTUM,
	type: IndicatorType.MACDFIX,
	displayName: "MACDFIX",
	description: "Moving Average Convergence/Divergence Fix 12/26",
	params: {
		signalPeriod: {
			label: "信号周期",
			description: "信号线周期",
			defaultValue: 9,
			required: true,
			legendShowName: "signal",
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

	getDefaultConfig(): MACDFIXConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		const validatedConfig = MACDFIXConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.MACDFIX,
		MACDFIXConfigSchema,
		buildMACDFIXConfig,
	),

	validateConfig(config: unknown): config is MACDFIXConfigType {
		try {
			MACDFIXConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};