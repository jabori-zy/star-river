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

// Zod schema for ROC indicator configuration
const ROCConfigSchema = z.object({
	timePeriod: z.number().int().positive(),
	priceSource: PriceSourceSchema,
});

export type ROCConfigType = z.infer<typeof ROCConfigSchema>;

// Parameter mapping function for ROC indicator
function buildROCConfig(params: Map<string, string>): unknown {
	return {
		timePeriod: parseInt(params.get("time_period") || "0"),
		priceSource: params.get("price_source") as PriceSource,
	};
}

// ROC indicator configuration implementation
export const ROCConfig: IndicatorConfig<ROCConfigType> = {
	category: IndicatorCategory.MOMENTUM,
	type: IndicatorType.ROC,
	displayName: "ROC",
	description: "Rate of Change - ((price/prevPrice)-1)*100",
	params: {
		timePeriod: {
			label: "indicator.configField.timePeriod",
			description: "Select time period for Rate of Change",
			defaultValue: 10,
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
		roc: { label: "roc", value: 0, legendShowName: "roc" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "ROC",
				type: SeriesType.LINE,
				color: "#FF9800",
				lineWidth: 2,
				indicatorValueKey: "roc" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): ROCConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		// Validate configuration using Zod
		const validatedConfig = ROCConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	// Use generic parsing function
	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.ROC,
		ROCConfigSchema,
		buildROCConfig,
	),

	validateConfig(config: unknown): config is ROCConfigType {
		try {
			ROCConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};
