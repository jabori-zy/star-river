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

const CDLTHRUSTINGConfigSchema = z.object({
	// CDLTHRUSTING 没有参数
});

export type CDLTHRUSTINGConfigType = z.infer<typeof CDLTHRUSTINGConfigSchema>;

function buildCDLTHRUSTINGConfig(_params: Map<string, string>): unknown {
	return {
		// CDLTHRUSTING 不需要任何参数
	};
}

export const CDLTHRUSTINGConfig: IndicatorConfig<CDLTHRUSTINGConfigType> = {
	category: IndicatorCategory.PATTERN_RECOGNITION,
	type: IndicatorType.CDLTHRUSTING,
	displayName: "CDLTHRUSTING",
	description: "Thrusting Pattern",
	params: {
		// CDLTHRUSTING 没有参数
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		thrusting: { label: "thrusting", value: 0, legendShowName: "thrusting" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "thrusting",
				type: SeriesType.COLUMN,
				color: "#0288D1",
				lineWidth: 1,
				indicatorValueKey: "thrusting" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): CDLTHRUSTINGConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([_key, _param]) => [
				{},
			]),
		);

		const validatedConfig = CDLTHRUSTINGConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.CDLTHRUSTING,
		CDLTHRUSTINGConfigSchema,
		buildCDLTHRUSTINGConfig,
	),

	validateConfig(config: unknown): config is CDLTHRUSTINGConfigType {
		try {
			CDLTHRUSTINGConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};