import { parseIndicatorConfig } from "@/types/indicator/indicator-config";
import type { KlineInterval } from "@/types/kline";
import type { IndicatorType } from "../types/indicator";
import type { IndicatorKey, Key, KlineKey } from "../types/symbol-key";

/**
 * 解析缓存键字符串为相应类型
 */
export function parseKey(keyStr: string): Key {
	const parts = keyStr.split("|");
	const type = parts[0];

	if (type === "kline") {
		return {
			type: "kline",
			exchange: parts[1],
			symbol: parts[2],
			interval: parts[3] as unknown as KlineInterval,
			startTime: parts[4],
			endTime: parts[5],
		} as KlineKey;
	} else if (type === "indicator") {
		const indicatorConfigStr = parts[4];
		const indicatorType = indicatorConfigStr.split("(")[0] as IndicatorType;

		// 使用新的解析函数
		const indicatorConfig = parseIndicatorConfig(
			indicatorType,
			indicatorConfigStr,
		);

		if (!indicatorConfig) {
			throw new Error(`无法解析指标配置: ${indicatorConfigStr}`);
		}

		return {
			type: "indicator",
			exchange: parts[1],
			symbol: parts[2],
			interval: parts[3] as unknown as KlineInterval,
			indicatorType: indicatorType,
			indicatorConfig: indicatorConfig,
			startTime: parts[5],
			endTime: parts[6],
		} as IndicatorKey;
	} else {
		throw new Error(`不支持的缓存键类型: ${type}`);
	}
}
