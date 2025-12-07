import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorCategory, IndicatorType } from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

const CDLSPINNINGTOPConfigSchema = z.object({
	// CDLSPINNINGTOP has no parameters
});

export type CDLSPINNINGTOPConfigType = z.infer<
	typeof CDLSPINNINGTOPConfigSchema
>;

function buildCDLSPINNINGTOPConfig(_params: Map<string, string>): unknown {
	return {
		// CDLSPINNINGTOP doesn't need any parameters
	};
}

export const CDLSPINNINGTOPConfig: IndicatorConfig<CDLSPINNINGTOPConfigType> = {
	category: IndicatorCategory.PATTERN_RECOGNITION,
	type: IndicatorType.CDLSPINNINGTOP,
	displayName: "CDLSPINNINGTOP",
	description: "Spinning Top",
	params: {
		// CDLSPINNINGTOP has no parameters
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		spinning_top: {
			label: "spinning_top",
			value: 0,
			legendShowName: "spinningtop",
		},
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "spinning_top",
				type: SeriesType.COLUMN,
				color: "#03DAC6",
				lineWidth: 1,
				indicatorValueKey: "spinning_top" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): CDLSPINNINGTOPConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([_key, _param]) => [{}]),
		);

		const validatedConfig = CDLSPINNINGTOPConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.CDLSPINNINGTOP,
		CDLSPINNINGTOPConfigSchema,
		buildCDLSPINNINGTOPConfig,
	),

	validateConfig(config: unknown): config is CDLSPINNINGTOPConfigType {
		try {
			CDLSPINNINGTOPConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};
