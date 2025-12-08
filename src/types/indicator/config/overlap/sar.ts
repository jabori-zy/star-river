import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorCategory, IndicatorType } from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

const SARConfigSchema = z.object({
	acceleration: z.number().positive(),
	maximum: z.number().positive(),
});

export type SARConfigType = z.infer<typeof SARConfigSchema>;

function buildSARConfig(params: Map<string, string>): unknown {
	return {
		acceleration: Number.parseFloat(params.get("acceleration") || "0.02"),
		maximum: Number.parseFloat(params.get("maximum") || "0.2"),
	};
}

export const SARConfig: IndicatorConfig<SARConfigType> = {
	category: IndicatorCategory.OVERLAP,
	type: IndicatorType.SAR,
	displayName: "SAR",
	description: "Parabolic SAR",
	params: {
		acceleration: {
			label: "indicator.configField.acceleration",
			description: "初始加速因子",
			defaultValue: 0.02,
			required: true,
			legendShowName: "accel",
		},
		maximum: {
			label: "indicator.configField.maximum",
			description: "最大加速因子",
			defaultValue: 0.2,
			required: true,
			legendShowName: "max",
		},
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		sar: { label: "sar", value: 0, legendShowName: "sar" },
	},
	chartConfig: {
		isInMainChart: true,
		seriesConfigs: [
			{
				name: "sar",
				type: SeriesType.LINE,
				color: "#FF6347",
				lineWidth: 1,
				indicatorValueKey: "sar" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): SARConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		const validatedConfig = SARConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.SAR,
		SARConfigSchema,
		buildSARConfig,
	),

	validateConfig(config: unknown): config is SARConfigType {
		try {
			SARConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};
