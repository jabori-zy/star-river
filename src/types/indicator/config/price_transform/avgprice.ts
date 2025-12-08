import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorCategory, IndicatorType } from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

// Zod schema for AVGPRICE indicator configuration
const AVGPRICEConfigSchema = z.object({});

export type AVGPRICEConfigType = z.infer<typeof AVGPRICEConfigSchema>;

// Parameter mapping function for AVGPRICE indicator
function buildAVGPRICEConfig(_params: Map<string, string>): unknown {
	return {};
}

// AVGPRICE indicator configuration implementation
export const AVGPRICEConfig: IndicatorConfig<AVGPRICEConfigType> = {
	category: IndicatorCategory.PRICE_TRANSFORM,
	type: IndicatorType.AVGPRICE,
	displayName: "AVGPRICE",
	description: "Calculate average price (High + Low + Close) / 3",
	params: {},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		avgprice: { label: "avgprice", value: 0, legendShowName: "avgprice" },
	},
	chartConfig: {
		isInMainChart: true, // Price transform indicators display in main chart
		seriesConfigs: [
			{
				name: "AVGPRICE",
				type: SeriesType.LINE,
				color: "#FF9800",
				lineWidth: 2,
				indicatorValueKey: "avgprice" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): AVGPRICEConfigType {
		return {};
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	// Use generic parsing function
	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.AVGPRICE,
		AVGPRICEConfigSchema,
		buildAVGPRICEConfig,
	),

	validateConfig(config: unknown): config is AVGPRICEConfigType {
		try {
			AVGPRICEConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};
