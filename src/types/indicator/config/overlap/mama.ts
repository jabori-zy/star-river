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

const MAMAConfigSchema = z.object({
	fastLimit: z.number().positive(),
	slowLimit: z.number().positive(),
	priceSource: PriceSourceSchema,
});

export type MAMAConfigType = z.infer<typeof MAMAConfigSchema>;

function buildMAMAConfig(params: Map<string, string>): unknown {
	return {
		fastLimit: Number.parseFloat(params.get("fast_limit") || "0.5"),
		slowLimit: Number.parseFloat(params.get("slow_limit") || "0.05"),
		priceSource: params.get("price_source") as PriceSource,
	};
}

export const MAMAConfig: IndicatorConfig<MAMAConfigType> = {
	category: IndicatorCategory.OVERLAP,
	type: IndicatorType.MAMA,
	displayName: "MAMA",
	description: "MESA Adaptive Moving Average",
	params: {
		fastLimit: {
			label: "快速限制",
			description: "快速限制参数",
			defaultValue: 0.5,
			required: true,
			legendShowName: "fast",
		},
		slowLimit: {
			label: "慢速限制",
			description: "慢速限制参数",
			defaultValue: 0.05,
			required: true,
			legendShowName: "slow",
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
		mama: { label: "mama", value: 0, legendShowName: "mama" },
		fama: { label: "fama", value: 0, legendShowName: "fama" },
	},
	chartConfig: {
		isInMainChart: true,
		seriesConfigs: [
			{
				name: "mama",
				type: SeriesType.LINE,
				color: "#FF3B30",
				lineWidth: 2,
				indicatorValueKey: "mama" as keyof IndicatorValueConfig,
			},
			{
				name: "fama",
				type: SeriesType.LINE,
				color: "#007AFF",
				lineWidth: 2,
				indicatorValueKey: "fama" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): MAMAConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		const validatedConfig = MAMAConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.MAMA,
		MAMAConfigSchema,
		buildMAMAConfig,
	),

	validateConfig(config: unknown): config is MAMAConfigType {
		try {
			MAMAConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};
