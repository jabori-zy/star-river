import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorCategory, IndicatorType } from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

// Zod schema for WCLPRICE indicator configuration
const WCLPRICEConfigSchema = z.object({});

export type WCLPRICEConfigType = z.infer<typeof WCLPRICEConfigSchema>;

// Parameter mapping function for WCLPRICE indicator
function buildWCLPRICEConfig(_params: Map<string, string>): unknown {
	return {};
}

// WCLPRICE indicator configuration implementation
export const WCLPRICEConfig: IndicatorConfig<WCLPRICEConfigType> = {
	category: IndicatorCategory.PRICE_TRANSFORM,
	type: IndicatorType.WCLPRICE,
	displayName: "WCLPRICE",
	description: "Calculate weighted close price (High + Low + 2 * Close) / 4",
	params: {},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		wclprice: { label: "wclprice", value: 0, legendShowName: "wclprice" },
	},
	chartConfig: {
		isInMainChart: true, // Price transform indicators display in main chart
		seriesConfigs: [
			{
				name: "WCLPRICE",
				type: SeriesType.LINE,
				color: "#FF5722",
				lineWidth: 2,
				indicatorValueKey: "wclprice" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): WCLPRICEConfigType {
		return {};
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	// Use generic parsing function
	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.WCLPRICE,
		WCLPRICEConfigSchema,
		buildWCLPRICEConfig,
	),

	validateConfig(config: unknown): config is WCLPRICEConfigType {
		try {
			WCLPRICEConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};
