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

// AVGPRICE 指标配置的 Zod schema
const AVGPRICEConfigSchema = z.object({});

export type AVGPRICEConfigType = z.infer<typeof AVGPRICEConfigSchema>;

// AVGPRICE指标的参数映射函数
function buildAVGPRICEConfig(_params: Map<string, string>): unknown {
	return {};
}

// AVGPRICE指标配置实现
export const AVGPRICEConfig: IndicatorConfig<AVGPRICEConfigType> = {
	category: IndicatorCategory.PRICE_TRANSFORM,
	type: IndicatorType.AVGPRICE,
	displayName: "AVGPRICE",
	description: "计算平均价格 (High + Low + Close) / 3",
	params: {},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		avgprice: { label: "avgprice", value: 0, legendShowName: "avgprice" },
	},
	chartConfig: {
		isInMainChart: true, // 价格变换指标显示在主图
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

	// 使用通用解析函数
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