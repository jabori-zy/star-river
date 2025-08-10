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

// TYPPRICE 指标配置的 Zod schema
const TYPPRICEConfigSchema = z.object({});

export type TYPPRICEConfigType = z.infer<typeof TYPPRICEConfigSchema>;

// TYPPRICE指标的参数映射函数
function buildTYPPRICEConfig(_params: Map<string, string>): unknown {
	return {};
}

// TYPPRICE指标配置实现
export const TYPPRICEConfig: IndicatorConfig<TYPPRICEConfigType> = {
	category: IndicatorCategory.PRICE_TRANSFORM,
	type: IndicatorType.TYPPRICE,
	displayName: "TYPPRICE",
	description: "计算典型价格 (High + Low + Close) / 3",
	params: {},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		typprice: { label: "typprice", value: 0, legendShowName: "typprice" },
	},
	chartConfig: {
		isInMainChart: true, // 价格变换指标显示在主图
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

	// 使用通用解析函数
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