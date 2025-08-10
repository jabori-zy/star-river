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

const CDLCLOSINGMARUBOZUConfigSchema = z.object({
	// CDLCLOSINGMARUBOZU 没有参数
});

export type CDLCLOSINGMARUBOZUConfigType = z.infer<typeof CDLCLOSINGMARUBOZUConfigSchema>;

function buildCDLCLOSINGMARUBOZUConfig(_params: Map<string, string>): unknown {
	return {
		// CDLCLOSINGMARUBOZU 不需要任何参数
	};
}

export const CDLCLOSINGMARUBOZUConfig: IndicatorConfig<CDLCLOSINGMARUBOZUConfigType> = {
	category: IndicatorCategory.PATTERN_RECOGNITION,
	type: IndicatorType.CDLCLOSINGMARUBOZU,
	displayName: "CDLCLOSINGMARUBOZU",
	description: "Closing Marubozu",
	params: {
		// CDLCLOSINGMARUBOZU 没有参数
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		closing_marubozu: { label: "closing_marubozu", value: 0, legendShowName: "closingmarubozu" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "closing_marubozu",
				type: SeriesType.COLUMN,
				color: "#BF5AF2",
				lineWidth: 1,
				indicatorValueKey: "closing_marubozu" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): CDLCLOSINGMARUBOZUConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([_key, _param]) => [
				{},
			]),
		);

		const validatedConfig = CDLCLOSINGMARUBOZUConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.CDLCLOSINGMARUBOZU,
		CDLCLOSINGMARUBOZUConfigSchema,
		buildCDLCLOSINGMARUBOZUConfig,
	),

	validateConfig(config: unknown): config is CDLCLOSINGMARUBOZUConfigType {
		try {
			CDLCLOSINGMARUBOZUConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};