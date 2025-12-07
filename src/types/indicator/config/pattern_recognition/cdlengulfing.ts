import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorCategory, IndicatorType } from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

const CDLENGULFINGConfigSchema = z.object({
	// CDLENGULFING has no parameters
});

export type CDLENGULFINGConfigType = z.infer<typeof CDLENGULFINGConfigSchema>;

function buildCDLENGULFINGConfig(_params: Map<string, string>): unknown {
	return {
		// CDLENGULFING doesn't need any parameters
	};
}

export const CDLENGULFINGConfig: IndicatorConfig<CDLENGULFINGConfigType> = {
	category: IndicatorCategory.PATTERN_RECOGNITION,
	type: IndicatorType.CDLENGULFING,
	displayName: "CDLENGULFING",
	description: "Engulfing Pattern",
	params: {
		// CDLENGULFING has no parameters
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		engulfing: { label: "engulfing", value: 0, legendShowName: "engulfing" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "engulfing",
				type: SeriesType.COLUMN,
				color: "#FF453A",
				lineWidth: 1,
				indicatorValueKey: "engulfing" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): CDLENGULFINGConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([_key, _param]) => [{}]),
		);

		const validatedConfig = CDLENGULFINGConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.CDLENGULFING,
		CDLENGULFINGConfigSchema,
		buildCDLENGULFINGConfig,
	),

	validateConfig(config: unknown): config is CDLENGULFINGConfigType {
		try {
			CDLENGULFINGConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};
