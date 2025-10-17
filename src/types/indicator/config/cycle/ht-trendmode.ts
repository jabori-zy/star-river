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

const HtTrendmodeConfigSchema = z.object({
	priceSource: PriceSourceSchema,
});

export type HtTrendmodeConfigType = z.infer<typeof HtTrendmodeConfigSchema>;

function buildHtTrendmodeConfig(params: Map<string, string>): unknown {
	return {
		priceSource: params.get("price_source") as PriceSource,
	};
}

export const HtTrendmodeConfig: IndicatorConfig<HtTrendmodeConfigType> = {
	category: IndicatorCategory.CYCLE,
	type: IndicatorType.HT_TRENDMODE,
	displayName: "HT_TRENDMODE",
	description: "Hilbert Transform - Trend vs Cycle Mode",
	params: {
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
		ht_trendmode: {
			label: "ht_trendmode",
			value: 0,
			legendShowName: "ht_trendmode",
		},
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "ht_trendmode",
				type: SeriesType.LINE,
				color: "#8A2BE2",
				lineWidth: 2,
				indicatorValueKey: "ht_trendmode" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): HtTrendmodeConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		const validatedConfig = HtTrendmodeConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.HT_TRENDMODE,
		HtTrendmodeConfigSchema,
		buildHtTrendmodeConfig,
	),

	validateConfig(config: unknown): config is HtTrendmodeConfigType {
		try {
			HtTrendmodeConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};
