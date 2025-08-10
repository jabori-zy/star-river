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

const CDLLONGLINEConfigSchema = z.object({
	// CDLLONGLINE 没有参数
});

export type CDLLONGLINEConfigType = z.infer<typeof CDLLONGLINEConfigSchema>;

function buildCDLLONGLINEConfig(_params: Map<string, string>): unknown {
	return {
		// CDLLONGLINE 不需要任何参数
	};
}

export const CDLLONGLINEConfig: IndicatorConfig<CDLLONGLINEConfigType> = {
	category: IndicatorCategory.PATTERN_RECOGNITION,
	type: IndicatorType.CDLLONGLINE,
	displayName: "CDLLONGLINE",
	description: "Long Line Candle",
	params: {
		// CDLLONGLINE 没有参数
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		long_line: { label: "long_line", value: 0, legendShowName: "longline" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "long_line",
				type: SeriesType.COLUMN,
				color: "#3F51B5",
				lineWidth: 1,
				indicatorValueKey: "long_line" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): CDLLONGLINEConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([_key, _param]) => [
				{},
			]),
		);

		const validatedConfig = CDLLONGLINEConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.CDLLONGLINE,
		CDLLONGLINEConfigSchema,
		buildCDLLONGLINEConfig,
	),

	validateConfig(config: unknown): config is CDLLONGLINEConfigType {
		try {
			CDLLONGLINEConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};