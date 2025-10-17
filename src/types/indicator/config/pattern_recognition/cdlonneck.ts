import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorCategory, IndicatorType } from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

const CDLONNECKConfigSchema = z.object({
	// CDLONNECK 没有参数
});

export type CDLONNECKConfigType = z.infer<typeof CDLONNECKConfigSchema>;

function buildCDLONNECKConfig(_params: Map<string, string>): unknown {
	return {
		// CDLONNECK 不需要任何参数
	};
}

export const CDLONNECKConfig: IndicatorConfig<CDLONNECKConfigType> = {
	category: IndicatorCategory.PATTERN_RECOGNITION,
	type: IndicatorType.CDLONNECK,
	displayName: "CDLONNECK",
	description: "On-Neck Pattern",
	params: {
		// CDLONNECK 没有参数
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		on_neck: { label: "on_neck", value: 0, legendShowName: "onneck" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "on_neck",
				type: SeriesType.COLUMN,
				color: "#CDDC39",
				lineWidth: 1,
				indicatorValueKey: "on_neck" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): CDLONNECKConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([_key, _param]) => [{}]),
		);

		const validatedConfig = CDLONNECKConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.CDLONNECK,
		CDLONNECKConfigSchema,
		buildCDLONNECKConfig,
	),

	validateConfig(config: unknown): config is CDLONNECKConfigType {
		try {
			CDLONNECKConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};
