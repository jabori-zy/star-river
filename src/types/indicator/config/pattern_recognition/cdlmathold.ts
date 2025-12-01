import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorCategory, IndicatorType } from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

const CDLMATHOLDConfigSchema = z.object({
	penetration: z.number(),
});

export type CDLMATHOLDConfigType = z.infer<typeof CDLMATHOLDConfigSchema>;

function buildCDLMATHOLDConfig(params: Map<string, string>): unknown {
	return {
		penetration: Number.parseFloat(params.get("penetration") || "0.5"),
	};
}

export const CDLMATHOLDConfig: IndicatorConfig<CDLMATHOLDConfigType> = {
	category: IndicatorCategory.PATTERN_RECOGNITION,
	type: IndicatorType.CDLMATHOLD,
	displayName: "CDLMATHOLD",
	description: "Mat Hold",
	params: {
		penetration: {
			label: "indicator.configField.penetration",
			description: "穿透度参数",
			defaultValue: 0.5,
			required: true,
			legendShowName: "penetration",
		},
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		mat_hold: { label: "mat_hold", value: 0, legendShowName: "mathold" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "mat_hold",
				type: SeriesType.COLUMN,
				color: "#8BC34A",
				lineWidth: 1,
				indicatorValueKey: "mat_hold" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): CDLMATHOLDConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		const validatedConfig = CDLMATHOLDConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.CDLMATHOLD,
		CDLMATHOLDConfigSchema,
		buildCDLMATHOLDConfig,
	),

	validateConfig(config: unknown): config is CDLMATHOLDConfigType {
		try {
			CDLMATHOLDConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};
