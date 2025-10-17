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

const TRIMAConfigSchema = z.object({
	timePeriod: z.number().int().positive(),
	priceSource: PriceSourceSchema,
});

export type TRIMAConfigType = z.infer<typeof TRIMAConfigSchema>;

function buildTRIMAConfig(params: Map<string, string>): unknown {
	return {
		timePeriod: Number.parseInt(params.get("time_period") || "30"),
		priceSource: params.get("price_source") as PriceSource,
	};
}

export const TRIMAConfig: IndicatorConfig<TRIMAConfigType> = {
	category: IndicatorCategory.OVERLAP,
	type: IndicatorType.TRIMA,
	displayName: "TRIMA",
	description: "Triangular Moving Average",
	params: {
		timePeriod: {
			label: "周期",
			description: "计算周期",
			defaultValue: 30,
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
		trima: { label: "trima", value: 0, legendShowName: "trima" },
	},
	chartConfig: {
		isInMainChart: true,
		seriesConfigs: [
			{
				name: "trima",
				type: SeriesType.LINE,
				color: "#5856D6",
				lineWidth: 2,
				indicatorValueKey: "trima" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): TRIMAConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		const validatedConfig = TRIMAConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.TRIMA,
		TRIMAConfigSchema,
		buildTRIMAConfig,
	),

	validateConfig(config: unknown): config is TRIMAConfigType {
		try {
			TRIMAConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};
