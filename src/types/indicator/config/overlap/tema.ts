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

const TEMAConfigSchema = z.object({
	timePeriod: z.number().int().positive(),
	priceSource: PriceSourceSchema,
});

export type TEMAConfigType = z.infer<typeof TEMAConfigSchema>;

function buildTEMAConfig(params: Map<string, string>): unknown {
	return {
		timePeriod: Number.parseInt(params.get("time_period") || "30"),
		priceSource: params.get("price_source") as PriceSource,
	};
}

export const TEMAConfig: IndicatorConfig<TEMAConfigType> = {
	category: IndicatorCategory.OVERLAP,
	type: IndicatorType.TEMA,
	displayName: "TEMA",
	description: "Triple Exponential Moving Average",
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
		tema: { label: "tema", value: 0, legendShowName: "tema" },
	},
	chartConfig: {
		isInMainChart: true,
		seriesConfigs: [
			{
				name: "tema",
				type: SeriesType.LINE,
				color: "#FF2D92",
				lineWidth: 2,
				indicatorValueKey: "tema" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): TEMAConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		const validatedConfig = TEMAConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.TEMA,
		TEMAConfigSchema,
		buildTEMAConfig,
	),

	validateConfig(config: unknown): config is TEMAConfigType {
		try {
			TEMAConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};