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

const EMAConfigSchema = z.object({
	timePeriod: z.number().int().positive(),
	priceSource: PriceSourceSchema,
});

export type EMAConfigType = z.infer<typeof EMAConfigSchema>;

function buildEMAConfig(params: Map<string, string>): unknown {
	return {
		timePeriod: Number.parseInt(params.get("time_period") || "20"),
		priceSource: params.get("price_source") as PriceSource,
	};
}

export const EMAConfig: IndicatorConfig<EMAConfigType> = {
	category: IndicatorCategory.OVERLAP,
	type: IndicatorType.EMA,
	displayName: "EMA",
	description: "Exponential Moving Average",
	params: {
		timePeriod: {
			label: "indicator.configField.timePeriod",
			description: "计算周期",
			defaultValue: 20,
			required: true,
			legendShowName: "period",
		},
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
		ema: { label: "ema", value: 0, legendShowName: "ema" },
	},
	chartConfig: {
		isInMainChart: true,
		seriesConfigs: [
			{
				name: "ema",
				type: SeriesType.LINE,
				color: "#007AFF",
				lineWidth: 2,
				indicatorValueKey: "ema" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): EMAConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		const validatedConfig = EMAConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.EMA,
		EMAConfigSchema,
		buildEMAConfig,
	),

	validateConfig(config: unknown): config is EMAConfigType {
		try {
			EMAConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};
