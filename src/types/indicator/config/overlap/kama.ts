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

const KAMAConfigSchema = z.object({
	timePeriod: z.number().int().positive(),
	priceSource: PriceSourceSchema,
});

export type KAMAConfigType = z.infer<typeof KAMAConfigSchema>;

function buildKAMAConfig(params: Map<string, string>): unknown {
	return {
		timePeriod: Number.parseInt(params.get("time_period") || "30"),
		priceSource: params.get("price_source") as PriceSource,
	};
}

export const KAMAConfig: IndicatorConfig<KAMAConfigType> = {
	category: IndicatorCategory.OVERLAP,
	type: IndicatorType.KAMA,
	displayName: "KAMA",
	description: "Kaufman Adaptive Moving Average",
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
		kama: { label: "kama", value: 0, legendShowName: "kama" },
	},
	chartConfig: {
		isInMainChart: true,
		seriesConfigs: [
			{
				name: "kama",
				type: SeriesType.LINE,
				color: "#00D4AA",
				lineWidth: 2,
				indicatorValueKey: "kama" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): KAMAConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		const validatedConfig = KAMAConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.KAMA,
		KAMAConfigSchema,
		buildKAMAConfig,
	),

	validateConfig(config: unknown): config is KAMAConfigType {
		try {
			KAMAConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};
