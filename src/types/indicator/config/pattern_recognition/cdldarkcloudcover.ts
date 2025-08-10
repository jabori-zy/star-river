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

const CDLDARKCLOUDCOVERConfigSchema = z.object({
	penetration: z.number(),
});

export type CDLDARKCLOUDCOVERConfigType = z.infer<typeof CDLDARKCLOUDCOVERConfigSchema>;

function buildCDLDARKCLOUDCOVERConfig(params: Map<string, string>): unknown {
	return {
		penetration: Number.parseFloat(params.get("penetration") || "0.5"),
	};
}

export const CDLDARKCLOUDCOVERConfig: IndicatorConfig<CDLDARKCLOUDCOVERConfigType> = {
	category: IndicatorCategory.PATTERN_RECOGNITION,
	type: IndicatorType.CDLDARKCLOUDCOVER,
	displayName: "CDLDARKCLOUDCOVER",
	description: "Dark Cloud Cover",
	params: {
		penetration: {
			label: "穿透度",
			description: "穿透度参数",
			defaultValue: 0.5,
			required: true,
			legendShowName: "penetration",
		},
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		dark_cloud_cover: { label: "dark_cloud_cover", value: 0, legendShowName: "darkcloud" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "dark_cloud_cover",
				type: SeriesType.COLUMN,
				color: "#2C2C2E",
				lineWidth: 1,
				indicatorValueKey: "dark_cloud_cover" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): CDLDARKCLOUDCOVERConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		const validatedConfig = CDLDARKCLOUDCOVERConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.CDLDARKCLOUDCOVER,
		CDLDARKCLOUDCOVERConfigSchema,
		buildCDLDARKCLOUDCOVERConfig,
	),

	validateConfig(config: unknown): config is CDLDARKCLOUDCOVERConfigType {
		try {
			CDLDARKCLOUDCOVERConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};