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

// MA 指标配置的 Zod schema
const HtDcperiodConfigSchema = z.object({
	priceSource: PriceSourceSchema,
});

export type HtDcperiodConfigType = z.infer<typeof HtDcperiodConfigSchema>;

// MA指标的参数映射函数
function buildMAConfig(params: Map<string, string>): unknown {
	return {
		priceSource: params.get("price_source") as PriceSource,
	};
}

// MA指标配置实现
export const HtDcperiodConfig: IndicatorConfig<HtDcperiodConfigType> = {
	category: IndicatorCategory.CYCLE,
	type: IndicatorType.HT_DCPERIOD,
	displayName: "HT_DCPERIOD",
	description: "Hilbert Transform - Dominant Cycle Period",
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
		ht_dcperiod: {
			label: "ht_dcperiod",
			value: 0,
			legendShowName: "ht_dcperiod",
		},
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "ht_dcperiod",
				type: SeriesType.LINE,
				color: "#D6D618",
				lineWidth: 2,
				indicatorValueKey: "ht_dcperiod" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): HtDcperiodConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		// 使用 Zod 验证配置
		const validatedConfig = HtDcperiodConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	// 使用通用解析函数
	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.HT_DCPERIOD,
		HtDcperiodConfigSchema,
		buildMAConfig,
	),

	validateConfig(config: unknown): config is HtDcperiodConfigType {
		try {
			HtDcperiodConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};
