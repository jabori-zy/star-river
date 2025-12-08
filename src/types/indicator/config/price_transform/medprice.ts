import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorCategory, IndicatorType } from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

// Zod schema for MEDPRICE indicator configuration
const MEDPRICEConfigSchema = z.object({});

export type MEDPRICEConfigType = z.infer<typeof MEDPRICEConfigSchema>;

// Parameter mapping function for MEDPRICE indicator
function buildMEDPRICEConfig(_params: Map<string, string>): unknown {
	return {};
}

// MEDPRICE indicator configuration implementation
export const MEDPRICEConfig: IndicatorConfig<MEDPRICEConfigType> = {
	category: IndicatorCategory.PRICE_TRANSFORM,
	type: IndicatorType.MEDPRICE,
	displayName: "MEDPRICE",
	description: "Calculate median price (High + Low) / 2",
	params: {},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		medprice: { label: "medprice", value: 0, legendShowName: "medprice" },
	},
	chartConfig: {
		isInMainChart: true, // Price transform indicators display in main chart
		seriesConfigs: [
			{
				name: "MEDPRICE",
				type: SeriesType.LINE,
				color: "#9C27B0",
				lineWidth: 2,
				indicatorValueKey: "medprice" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): MEDPRICEConfigType {
		return {};
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	// Use generic parsing function
	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.MEDPRICE,
		MEDPRICEConfigSchema,
		buildMEDPRICEConfig,
	),

	validateConfig(config: unknown): config is MEDPRICEConfigType {
		try {
			MEDPRICEConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};
