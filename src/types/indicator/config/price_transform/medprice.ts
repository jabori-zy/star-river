import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorCategory, IndicatorType } from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

// MEDPRICE 指标配置的 Zod schema
const MEDPRICEConfigSchema = z.object({});

export type MEDPRICEConfigType = z.infer<typeof MEDPRICEConfigSchema>;

// MEDPRICE指标的参数映射函数
function buildMEDPRICEConfig(_params: Map<string, string>): unknown {
	return {};
}

// MEDPRICE指标配置实现
export const MEDPRICEConfig: IndicatorConfig<MEDPRICEConfigType> = {
	category: IndicatorCategory.PRICE_TRANSFORM,
	type: IndicatorType.MEDPRICE,
	displayName: "MEDPRICE",
	description: "计算中位数价格 (High + Low) / 2",
	params: {},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		medprice: { label: "medprice", value: 0, legendShowName: "medprice" },
	},
	chartConfig: {
		isInMainChart: true, // 价格变换指标显示在主图
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

	// 使用通用解析函数
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
