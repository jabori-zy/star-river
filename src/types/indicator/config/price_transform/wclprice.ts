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

// WCLPRICE 指标配置的 Zod schema
const WCLPRICEConfigSchema = z.object({});

export type WCLPRICEConfigType = z.infer<typeof WCLPRICEConfigSchema>;

// WCLPRICE指标的参数映射函数
function buildWCLPRICEConfig(_params: Map<string, string>): unknown {
	return {};
}

// WCLPRICE指标配置实现
export const WCLPRICEConfig: IndicatorConfig<WCLPRICEConfigType> = {
	category: IndicatorCategory.PRICE_TRANSFORM,
	type: IndicatorType.WCLPRICE,
	displayName: "WCLPRICE",
	description: "计算加权收盘价 (High + Low + 2 * Close) / 4",
	params: {},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		wclprice: { label: "wclprice", value: 0, legendShowName: "wclprice" },
	},
	chartConfig: {
		isInMainChart: true, // 价格变换指标显示在主图
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

	// 使用通用解析函数
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