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

const CDLSHORTLINEConfigSchema = z.object({
	// CDLSHORTLINE 没有参数
});

export type CDLSHORTLINEConfigType = z.infer<typeof CDLSHORTLINEConfigSchema>;

function buildCDLSHORTLINEConfig(_params: Map<string, string>): unknown {
	return {
		// CDLSHORTLINE 不需要任何参数
	};
}

export const CDLSHORTLINEConfig: IndicatorConfig<CDLSHORTLINEConfigType> = {
	category: IndicatorCategory.PATTERN_RECOGNITION,
	type: IndicatorType.CDLSHORTLINE,
	displayName: "CDLSHORTLINE",
	description: "Short Line Candle",
	params: {
		// CDLSHORTLINE 没有参数
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		short_line: { label: "short_line", value: 0, legendShowName: "shortline" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "short_line",
				type: SeriesType.COLUMN,
				color: "#2196F3",
				lineWidth: 1,
				indicatorValueKey: "short_line" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): CDLSHORTLINEConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([_key, _param]) => [
				{},
			]),
		);

		const validatedConfig = CDLSHORTLINEConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.CDLSHORTLINE,
		CDLSHORTLINEConfigSchema,
		buildCDLSHORTLINEConfig,
	),

	validateConfig(config: unknown): config is CDLSHORTLINEConfigType {
		try {
			CDLSHORTLINEConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};