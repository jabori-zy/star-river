import { z } from "zod";
import { SeriesType } from "@/types/chart";
import {
	IndicatorCategory,
	IndicatorType,
} from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

const CDLINNECKConfigSchema = z.object({
	// CDLINNECK 没有参数
});

export type CDLINNECKConfigType = z.infer<typeof CDLINNECKConfigSchema>;

function buildCDLINNECKConfig(_params: Map<string, string>): unknown {
	return {
		// CDLINNECK 不需要任何参数
	};
}

export const CDLINNECKConfig: IndicatorConfig<CDLINNECKConfigType> = {
	category: IndicatorCategory.PATTERN_RECOGNITION,
	type: IndicatorType.CDLINNECK,
	displayName: "CDLINNECK",
	description: "In-Neck Pattern",
	params: {
		// CDLINNECK 没有参数
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		in_neck: { label: "in_neck", value: 0, legendShowName: "inneck" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "in_neck",
				type: SeriesType.COLUMN,
				color: "#FFB74D",
				lineWidth: 1,
				indicatorValueKey: "in_neck" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): CDLINNECKConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([_key, _param]) => [
				{},
			]),
		);

		const validatedConfig = CDLINNECKConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.CDLINNECK,
		CDLINNECKConfigSchema,
		buildCDLINNECKConfig,
	),

	validateConfig(config: unknown): config is CDLINNECKConfigType {
		try {
			CDLINNECKConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};