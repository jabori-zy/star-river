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

const CDLABANDONEDBABYConfigSchema = z.object({
	penetration: z.number(),
});

export type CDLABANDONEDBABYConfigType = z.infer<typeof CDLABANDONEDBABYConfigSchema>;

function buildCDLABANDONEDBABYConfig(params: Map<string, string>): unknown {
	return {
		penetration: Number.parseFloat(params.get("penetration") || "0.3"),
	};
}

export const CDLABANDONEDBABYConfig: IndicatorConfig<CDLABANDONEDBABYConfigType> = {
	category: IndicatorCategory.PATTERN_RECOGNITION,
	type: IndicatorType.CDLABANDONEDBABY,
	displayName: "CDLABANDONEDBABY",
	description: "Abandoned Baby",
	params: {
		penetration: {
			label: "穿透度",
			description: "穿透度参数",
			defaultValue: 0.3,
			required: true,
			legendShowName: "penetration",
		},
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		abandoned_baby: { label: "abandoned_baby", value: 0, legendShowName: "abandonedbaby" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "abandoned_baby",
				type: SeriesType.COLUMN,
				color: "#AF52DE",
				lineWidth: 1,
				indicatorValueKey: "abandoned_baby" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): CDLABANDONEDBABYConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		const validatedConfig = CDLABANDONEDBABYConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.CDLABANDONEDBABY,
		CDLABANDONEDBABYConfigSchema,
		buildCDLABANDONEDBABYConfig,
	),

	validateConfig(config: unknown): config is CDLABANDONEDBABYConfigType {
		try {
			CDLABANDONEDBABYConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};