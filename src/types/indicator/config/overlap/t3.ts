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

const T3ConfigSchema = z.object({
	timePeriod: z.number().int().positive(),
	vFactor: z.number(),
	priceSource: PriceSourceSchema,
});

export type T3ConfigType = z.infer<typeof T3ConfigSchema>;

function buildT3Config(params: Map<string, string>): unknown {
	return {
		timePeriod: Number.parseInt(params.get("time_period") || "5"),
		vFactor: Number.parseFloat(params.get("v_factor") || "0.7"),
		priceSource: params.get("price_source") as PriceSource,
	};
}

export const T3Config: IndicatorConfig<T3ConfigType> = {
	category: IndicatorCategory.OVERLAP,
	type: IndicatorType.T3,
	displayName: "T3",
	description: "Triple Exponential Moving Average (T3)",
	params: {
		timePeriod: {
			label: "周期",
			description: "计算周期",
			defaultValue: 5,
			required: true,
			legendShowName: "period",
		},
		vFactor: {
			label: "V因子",
			description: "体积因子",
			defaultValue: 0.7,
			required: true,
			legendShowName: "vfactor",
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
		t3: { label: "t3", value: 0, legendShowName: "t3" },
	},
	chartConfig: {
		isInMainChart: true,
		seriesConfigs: [
			{
				name: "t3",
				type: SeriesType.LINE,
				color: "#34C759",
				lineWidth: 2,
				indicatorValueKey: "t3" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): T3ConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		const validatedConfig = T3ConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.T3,
		T3ConfigSchema,
		buildT3Config,
	),

	validateConfig(config: unknown): config is T3ConfigType {
		try {
			T3ConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};
