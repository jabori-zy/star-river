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

const HtSineConfigSchema = z.object({
	priceSource: PriceSourceSchema,
});

export type HtSineConfigType = z.infer<typeof HtSineConfigSchema>;

function buildHtSineConfig(params: Map<string, string>): unknown {
	return {
		priceSource: params.get("price_source") as PriceSource,
	};
}

export const HtSineConfig: IndicatorConfig<HtSineConfigType> = {
	category: IndicatorCategory.CYCLE,
	type: IndicatorType.HT_SINE,
	displayName: "HT_SINE",
	description: "Hilbert Transform - SineWave",
	params: {
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
		sine: { label: "sine", value: 0, legendShowName: "sine" },
		lead_sine: { label: "lead_sine", value: 0, legendShowName: "lead_sine" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "sine",
				type: SeriesType.LINE,
				color: "#32CD32",
				lineWidth: 2,
				indicatorValueKey: "sine" as keyof IndicatorValueConfig,
			},
			{
				name: "lead_sine",
				type: SeriesType.LINE,
				color: "#FF4500",
				lineWidth: 2,
				indicatorValueKey: "lead_sine" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): HtSineConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		const validatedConfig = HtSineConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.HT_SINE,
		HtSineConfigSchema,
		buildHtSineConfig,
	),

	validateConfig(config: unknown): config is HtSineConfigType {
		try {
			HtSineConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};