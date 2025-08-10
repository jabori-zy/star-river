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

const MIDPRICEConfigSchema = z.object({
	timePeriod: z.number().int().positive(),
});

export type MIDPRICEConfigType = z.infer<typeof MIDPRICEConfigSchema>;

function buildMIDPRICEConfig(params: Map<string, string>): unknown {
	return {
		timePeriod: Number.parseInt(params.get("time_period") || "14"),
	};
}

export const MIDPRICEConfig: IndicatorConfig<MIDPRICEConfigType> = {
	category: IndicatorCategory.OVERLAP,
	type: IndicatorType.MIDPRICE,
	displayName: "MIDPRICE",
	description: "Midpoint Price over period",
	params: {
		timePeriod: {
			label: "周期",
			description: "计算周期",
			defaultValue: 14,
			required: true,
			legendShowName: "period",
		},
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		midprice: { label: "midprice", value: 0, legendShowName: "midprice" },
	},
	chartConfig: {
		isInMainChart: true,
		seriesConfigs: [
			{
				name: "midprice",
				type: SeriesType.LINE,
				color: "#BF5AF2",
				lineWidth: 2,
				indicatorValueKey: "midprice" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): MIDPRICEConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		const validatedConfig = MIDPRICEConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.MIDPRICE,
		MIDPRICEConfigSchema,
		buildMIDPRICEConfig,
	),

	validateConfig(config: unknown): config is MIDPRICEConfigType {
		try {
			MIDPRICEConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};