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

const DEMAConfigSchema = z.object({
	timePeriod: z.number().int().positive(),
	priceSource: PriceSourceSchema,
});

export type DEMAConfigType = z.infer<typeof DEMAConfigSchema>;

function buildDEMAConfig(params: Map<string, string>): unknown {
	return {
		timePeriod: Number.parseInt(params.get("time_period") || "30"),
		priceSource: params.get("price_source") as PriceSource,
	};
}

export const DEMAConfig: IndicatorConfig<DEMAConfigType> = {
	category: IndicatorCategory.OVERLAP,
	type: IndicatorType.DEMA,
	displayName: "DEMA",
	description: "Double Exponential Moving Average",
	params: {
		timePeriod: {
			label: "indicator.configField.timePeriod",
			description: "计算周期",
			defaultValue: 30,
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
		dema: { label: "dema", value: 0, legendShowName: "dema" },
	},
	chartConfig: {
		isInMainChart: true,
		seriesConfigs: [
			{
				name: "dema",
				type: SeriesType.LINE,
				color: "#32D74B",
				lineWidth: 2,
				indicatorValueKey: "dema" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): DEMAConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		const validatedConfig = DEMAConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.DEMA,
		DEMAConfigSchema,
		buildDEMAConfig,
	),

	validateConfig(config: unknown): config is DEMAConfigType {
		try {
			DEMAConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};
