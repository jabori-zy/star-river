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

const HtDcphaseConfigSchema = z.object({
	priceSource: PriceSourceSchema,
});

export type HtDcphaseConfigType = z.infer<typeof HtDcphaseConfigSchema>;

function buildHtDcphaseConfig(params: Map<string, string>): unknown {
	return {
		priceSource: params.get("price_source") as PriceSource,
	};
}

export const HtDcphaseConfig: IndicatorConfig<HtDcphaseConfigType> = {
	category: IndicatorCategory.CYCLE,
	type: IndicatorType.HT_DCPHASE,
	displayName: "HT_DCPHASE",
	description: "Hilbert Transform - Dominant Cycle Phase",
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
		ht_dcphase: { label: "ht_dcphase", value: 0, legendShowName: "ht_dcphase" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "ht_dcphase",
				type: SeriesType.LINE,
				color: "#FF6B35",
				lineWidth: 2,
				indicatorValueKey: "ht_dcphase" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): HtDcphaseConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		const validatedConfig = HtDcphaseConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.HT_DCPHASE,
		HtDcphaseConfigSchema,
		buildHtDcphaseConfig,
	),

	validateConfig(config: unknown): config is HtDcphaseConfigType {
		try {
			HtDcphaseConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};