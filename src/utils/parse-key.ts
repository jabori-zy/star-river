import { parseIndicatorConfig } from "@/types/indicator/indicator-config";
import type { IndicatorType } from "../types/indicator";
import type { IndicatorKey, Key, KlineKey, OperationKey } from "../types/symbol-key";

/**
 * Parse cache key string into corresponding type
 */
export function parseKey(keyStr: string): Key {
	const parts = keyStr.split("|");
	const type = parts[0];

	if (type === "kline") {
		return {
			type: "kline",
			exchange: parts[1],
			symbol: parts[2],
			interval: parts[3],
			startTime: parts[4],
			endTime: parts[5],
		} as KlineKey;
	} else if (type === "indicator") {
		const indicatorConfigStr = parts[4];
		const indicatorType = indicatorConfigStr.split("(")[0] as IndicatorType;

		// Use the new parsing function
		const indicatorConfig = parseIndicatorConfig(
			indicatorType,
			indicatorConfigStr,
		);

		if (!indicatorConfig) {
			throw new Error(`Unable to parse indicator configuration: ${indicatorConfigStr}`);
		}

		return {
			type: "indicator",
			exchange: parts[1],
			symbol: parts[2],
			interval: parts[3],
			indicatorType: indicatorType,
			indicatorConfig: indicatorConfig,
			startTime: parts[5],
			endTime: parts[6],
		} as IndicatorKey;
	} 
	// operation|node_group_olzbhnj|SMA
	else if (type === "operation") {
		return {
			type: "operation",
			nodeId: parts[1],
			name: parts[2],
		} as OperationKey;
	}
	else {
		throw new Error(`Unsupported cache key type: ${type}`);
	}
}
