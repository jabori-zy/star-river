import axios from "axios";
import type { ZodError } from "zod";
import { API_BASE_URL } from "@/service";
import type {
	NodeRunningLogEvent,
	StrategyRunningLogEvent,
} from "@/types/strategy-event/running-log-event";
import { RunningLogEventSchema } from "@/types/strategy-event/running-log-event";

const ROUTER = "strategy/backtest";
const API_VERSION = "api/v1";

const API_URL = `${API_BASE_URL}/${API_VERSION}/${ROUTER}`;

/**
 * Get strategy running logs with runtime validation using Zod
 * @param strategyId - Strategy ID to fetch logs for
 * @returns Array of validated running log events
 * @throws Error if validation fails or request fails
 */
export async function getStrategyRunningLog(
	strategyId: number,
): Promise<(StrategyRunningLogEvent | NodeRunningLogEvent)[]> {
	try {
		const response = await axios.get(`${API_URL}/${strategyId}/running-log`);
		if (response.status !== 200) {
			throw new Error(`获取策略运行日志失败: ${response.status}`);
		}

		const rawData = response.data.data;

		// Validate that we received an array
		if (!Array.isArray(rawData)) {
			throw new Error(
				`Expected array of logs, received: ${typeof rawData}`,
			);
		}

		// Validate each log entry with Zod
		const validatedLogs: (StrategyRunningLogEvent | NodeRunningLogEvent)[] = [];
		const errors: Array<{ index: number; error: ZodError }> = [];

		for (let i = 0; i < rawData.length; i++) {
			const result = RunningLogEventSchema.safeParse(rawData[i]);

			if (result.success) {
				validatedLogs.push(result.data);
			} else {
				// Log validation error but continue processing other logs
				console.error(`策略运行日志数据验证失败 [index ${i}]:`, {
					raw: rawData[i],
					errors: result.error.format(),
				});
				errors.push({ index: i, error: result.error });
			}
		}

		// If all logs failed validation, throw error
		if (validatedLogs.length === 0 && rawData.length > 0) {
			throw new Error(
				`所有日志数据验证失败 (${errors.length} errors)`,
			);
		}

		// If some logs failed, log warning but return valid ones
		if (errors.length > 0) {
			console.warn(
				`部分日志数据验证失败: ${errors.length}/${rawData.length}`,
			);
		}

		return validatedLogs;
	} catch (error) {
		console.error("getStrategyRunningLog error", error);
		throw error;
	}
}
