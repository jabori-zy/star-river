import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorCategory, IndicatorType } from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

// Zod schema for TYPPRICE indicator configuration
const TYPPRICEConfigSchema = z.object({});

export type TYPPRICEConfigType = z.infer<typeof TYPPRICEConfigSchema>;

// Parameter mapping function for TYPPRICE indicator
function buildTYPPRICEConfig(_params: Map<string, string>): unknown {
	return {};
}

// TYPPRICE indicator configuration implementation
export const TYPPRICEConfig: IndicatorConfig<TYPPRICEConfigType> = {
	category: IndicatorCategory.PRICE_TRANSFORM,
	type: IndicatorType.TYPPRICE,
	displayName: "TYPPRICE",
	description: "Calculate typical price (High + Low + Close) / 3",
	params: {},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		typprice: { label: "typprice", value: 0, legendShowName: "typprice" },
	},
	chartConfig: {
		isInMainChart: true, // Price transform indicators display in main chart
		seriesConfigs: [
			{
				name: "TYPPRICE",
				type: SeriesType.LINE,
				color: "#3F51B5",
				lineWidth: 2,
				indicatorValueKey: "typprice" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): TYPPRICEConfigType {
		return {};
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	// Use generic parsing function
	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.TYPPRICE,
		TYPPRICEConfigSchema,
		buildTYPPRICEConfig,
	),

	validateConfig(config: unknown): config is TYPPRICEConfigType {
		try {
			TYPPRICEConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};
