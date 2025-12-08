import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorCategory, IndicatorType } from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

const SAREXTConfigSchema = z.object({
	startValue: z.number(),
	offsetOnReverse: z.number(),
	accelerationInitLong: z.number().positive(),
	accelerationLong: z.number().positive(),
	accelerationMaxLong: z.number().positive(),
	accelerationInitShort: z.number().positive(),
	accelerationShort: z.number().positive(),
	accelerationMaxShort: z.number().positive(),
});

export type SAREXTConfigType = z.infer<typeof SAREXTConfigSchema>;

function buildSAREXTConfig(params: Map<string, string>): unknown {
	return {
		startValue: Number.parseFloat(params.get("start_value") || "0.0"),
		offsetOnReverse: Number.parseFloat(
			params.get("offset_on_reverse") || "0.0",
		),
		accelerationInitLong: Number.parseFloat(
			params.get("acceleration_init_long") || "0.02",
		),
		accelerationLong: Number.parseFloat(
			params.get("acceleration_long") || "0.02",
		),
		accelerationMaxLong: Number.parseFloat(
			params.get("acceleration_max_long") || "0.2",
		),
		accelerationInitShort: Number.parseFloat(
			params.get("acceleration_init_short") || "0.02",
		),
		accelerationShort: Number.parseFloat(
			params.get("acceleration_short") || "0.02",
		),
		accelerationMaxShort: Number.parseFloat(
			params.get("acceleration_max_short") || "0.2",
		),
	};
}

export const SAREXTConfig: IndicatorConfig<SAREXTConfigType> = {
	category: IndicatorCategory.OVERLAP,
	type: IndicatorType.SAREXT,
	displayName: "SAREXT",
	description: "Parabolic SAR - Extended",
	params: {
		startValue: {
			label: "indicator.configField.startValue",
			description: "起始值",
			defaultValue: 0.0,
			required: true,
			legendShowName: "start",
		},
		offsetOnReverse: {
			label: "indicator.configField.offsetOnReverse",
			description: "反转时的偏移",
			defaultValue: 0.0,
			required: true,
			legendShowName: "offset",
		},
		accelerationInitLong: {
			label: "indicator.configField.accelerationInitLong",
			description: "多头初始加速因子",
			defaultValue: 0.02,
			required: true,
			legendShowName: "longInit",
		},
		accelerationLong: {
			label: "indicator.configField.accelerationLong",
			description: "多头加速因子",
			defaultValue: 0.02,
			required: true,
			legendShowName: "long",
		},
		accelerationMaxLong: {
			label: "indicator.configField.accelerationMaxLong",
			description: "多头最大加速因子",
			defaultValue: 0.2,
			required: true,
			legendShowName: "longMax",
		},
		accelerationInitShort: {
			label: "indicator.configField.accelerationInitShort",
			description: "空头初始加速因子",
			defaultValue: 0.02,
			required: true,
			legendShowName: "shortInit",
		},
		accelerationShort: {
			label: "indicator.configField.accelerationShort",
			description: "空头加速因子",
			defaultValue: 0.02,
			required: true,
			legendShowName: "short",
		},
		accelerationMaxShort: {
			label: "indicator.configField.accelerationMaxShort",
			description: "空头最大加速因子",
			defaultValue: 0.2,
			required: true,
			legendShowName: "shortMax",
		},
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		sarext: { label: "sarext", value: 0, legendShowName: "sarext" },
	},
	chartConfig: {
		isInMainChart: true,
		seriesConfigs: [
			{
				name: "sarext",
				type: SeriesType.LINE,
				color: "#FF8C00",
				lineWidth: 1,
				indicatorValueKey: "sarext" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): SAREXTConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		const validatedConfig = SAREXTConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.SAREXT,
		SAREXTConfigSchema,
		buildSAREXTConfig,
	),

	validateConfig(config: unknown): config is SAREXTConfigType {
		try {
			SAREXTConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};
