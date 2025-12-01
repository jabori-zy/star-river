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

const HtTrendlineConfigSchema = z.object({
	priceSource: PriceSourceSchema,
});

export type HtTrendlineConfigType = z.infer<typeof HtTrendlineConfigSchema>;

function buildHtTrendlineConfig(params: Map<string, string>): unknown {
	return {
		priceSource: params.get("price_source") as PriceSource,
	};
}

export const HtTrendlineConfig: IndicatorConfig<HtTrendlineConfigType> = {
	category: IndicatorCategory.OVERLAP,
	type: IndicatorType.HT_TRENDLINE,
	displayName: "HT_TRENDLINE",
	description: "Hilbert Transform - Instantaneous Trendline",
	params: {
		priceSource: {
			label: "indicator.configField.dataSource",
			description: "选择指标计算价格源",
			defaultValue: PriceSource.CLOSE,
			required: true,
			legendShowName: "source",
		},
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		ht_trendline: {
			label: "ht_trendline",
			value: 0,
			legendShowName: "ht_trendline",
		},
	},
	chartConfig: {
		isInMainChart: true,
		seriesConfigs: [
			{
				name: "ht_trendline",
				type: SeriesType.LINE,
				color: "#FF6B35",
				lineWidth: 2,
				indicatorValueKey: "ht_trendline" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): HtTrendlineConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		const validatedConfig = HtTrendlineConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.HT_TRENDLINE,
		HtTrendlineConfigSchema,
		buildHtTrendlineConfig,
	),

	validateConfig(config: unknown): config is HtTrendlineConfigType {
		try {
			HtTrendlineConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};
