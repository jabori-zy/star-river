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

// MOM indicator configuration Zod schema
const MOMConfigSchema = z.object({
	timePeriod: z.number().int().positive(),
	priceSource: PriceSourceSchema,
});

export type MOMConfigType = z.infer<typeof MOMConfigSchema>;

// MOM indicator parameter mapping function
function buildMOMConfig(params: Map<string, string>): unknown {
	return {
		timePeriod: parseInt(params.get("time_period") || "0"),
		priceSource: params.get("price_source") as PriceSource,
	};
}

// MOM indicator configuration implementation
export const MOMConfig: IndicatorConfig<MOMConfigType> = {
	category: IndicatorCategory.MOMENTUM,
	type: IndicatorType.MOM,
	displayName: "MOM",
	description: "Momentum",
	params: {
		timePeriod: {
			label: "indicator.configField.timePeriod",
			description: "Select the time period for the momentum indicator",
			defaultValue: 10,
			required: true,
			legendShowName: "period",
		},
		priceSource: {
			label: "indicator.configField.dataSource",
			description: "Select the price source for indicator calculation",
			defaultValue: PriceSource.CLOSE,
			required: true,
			legendShowName: "source",
		},
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		mom: { label: "mom", value: 0, legendShowName: "mom" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "MOM",
				type: SeriesType.LINE,
				color: "#FF6B6B",
				lineWidth: 2,
				indicatorValueKey: "mom" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): MOMConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		// Validate configuration using Zod
		const validatedConfig = MOMConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	// Use common parsing function
	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.MOM,
		MOMConfigSchema,
		buildMOMConfig,
	),

	validateConfig(config: unknown): config is MOMConfigType {
		try {
			MOMConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};
