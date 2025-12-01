import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorCategory, IndicatorType } from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

const MFIConfigSchema = z.object({
	timePeriod: z.number().int().positive(),
});

export type MFIConfigType = z.infer<typeof MFIConfigSchema>;

function buildMFIConfig(params: Map<string, string>): unknown {
	return {
		timePeriod: Number.parseInt(params.get("time_period") || "14"),
	};
}

export const MFIConfig: IndicatorConfig<MFIConfigType> = {
	category: IndicatorCategory.MOMENTUM,
	type: IndicatorType.MFI,
	displayName: "MFI",
	description: "Money Flow Index",
	params: {
		timePeriod: {
			label: "indicator.configField.timePeriod",
			description: "计算周期",
			defaultValue: 14,
			required: true,
			legendShowName: "period",
		},
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		mfi: { label: "mfi", value: 0, legendShowName: "mfi" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "mfi",
				type: SeriesType.LINE,
				color: "#8A2BE2",
				lineWidth: 2,
				indicatorValueKey: "mfi" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): MFIConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		const validatedConfig = MFIConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.MFI,
		MFIConfigSchema,
		buildMFIConfig,
	),

	validateConfig(config: unknown): config is MFIConfigType {
		try {
			MFIConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};
