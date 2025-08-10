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

const WMAConfigSchema = z.object({
	timePeriod: z.number().int().positive(),
	priceSource: PriceSourceSchema,
});

export type WMAConfigType = z.infer<typeof WMAConfigSchema>;

function buildWMAConfig(params: Map<string, string>): unknown {
	return {
		timePeriod: Number.parseInt(params.get("time_period") || "20"),
		priceSource: params.get("price_source") as PriceSource,
	};
}

export const WMAConfig: IndicatorConfig<WMAConfigType> = {
	category: IndicatorCategory.OVERLAP,
	type: IndicatorType.WMA,
	displayName: "WMA",
	description: "Weighted Moving Average",
	params: {
		timePeriod: {
			label: "周期",
			description: "计算周期",
			defaultValue: 20,
			required: true,
			legendShowName: "period",
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
		wma: { label: "wma", value: 0, legendShowName: "wma" },
	},
	chartConfig: {
		isInMainChart: true,
		seriesConfigs: [
			{
				name: "wma",
				type: SeriesType.LINE,
				color: "#AF52DE",
				lineWidth: 2,
				indicatorValueKey: "wma" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): WMAConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		const validatedConfig = WMAConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.WMA,
		WMAConfigSchema,
		buildWMAConfig,
	),

	validateConfig(config: unknown): config is WMAConfigType {
		try {
			WMAConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};