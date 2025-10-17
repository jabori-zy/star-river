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

const HtPhasorConfigSchema = z.object({
	priceSource: PriceSourceSchema,
});

export type HtPhasorConfigType = z.infer<typeof HtPhasorConfigSchema>;

function buildHtPhasorConfig(params: Map<string, string>): unknown {
	return {
		priceSource: params.get("price_source") as PriceSource,
	};
}

export const HtPhasorConfig: IndicatorConfig<HtPhasorConfigType> = {
	category: IndicatorCategory.CYCLE,
	type: IndicatorType.HT_PHASOR,
	displayName: "HT_PHASOR",
	description: "Hilbert Transform - Phasor Components",
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
		in_phase: { label: "in_phase", value: 0, legendShowName: "in_phase" },
		quadrature: { label: "quadrature", value: 0, legendShowName: "quadrature" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "in_phase",
				type: SeriesType.LINE,
				color: "#1E90FF",
				lineWidth: 2,
				indicatorValueKey: "in_phase" as keyof IndicatorValueConfig,
			},
			{
				name: "quadrature",
				type: SeriesType.LINE,
				color: "#FF69B4",
				lineWidth: 2,
				indicatorValueKey: "quadrature" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): HtPhasorConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		const validatedConfig = HtPhasorConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.HT_PHASOR,
		HtPhasorConfigSchema,
		buildHtPhasorConfig,
	),

	validateConfig(config: unknown): config is HtPhasorConfigType {
		try {
			HtPhasorConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};
