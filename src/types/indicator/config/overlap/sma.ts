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

const SMAConfigSchema = z.object({
	timePeriod: z.number().int().positive(),
	priceSource: PriceSourceSchema,
});

export type SMAConfigType = z.infer<typeof SMAConfigSchema>;

function buildSMAConfig(params: Map<string, string>): unknown {
	return {
		timePeriod: Number.parseInt(params.get("time_period") || "20"),
		priceSource: params.get("price_source") as PriceSource,
	};
}

export const SMAConfig: IndicatorConfig<SMAConfigType> = {
	category: IndicatorCategory.OVERLAP,
	type: IndicatorType.SMA,
	displayName: "SMA",
	description: "Simple Moving Average",
	params: {
		timePeriod: {
			label: "indicator.configField.timePeriod",
			description: "Calculation period",
			defaultValue: 20,
			required: true,
			legendShowName: "period",
		},
		priceSource: {
			label: "indicator.configField.dataSource",
			description: "Select price source for indicator calculation",
			defaultValue: PriceSource.CLOSE,
			required: true,
			legendShowName: "source",
		},
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		sma: { label: "sma", value: 0, legendShowName: "sma" },
	},
	chartConfig: {
		isInMainChart: true,
		seriesConfigs: [
			{
				name: "sma",
				type: SeriesType.LINE,
				color: "#FF9500",
				lineWidth: 2,
				indicatorValueKey: "sma" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): SMAConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		const validatedConfig = SMAConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.SMA,
		SMAConfigSchema,
		buildSMAConfig,
	),

	validateConfig(config: unknown): config is SMAConfigType {
		try {
			SMAConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};
