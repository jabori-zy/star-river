import axios from "axios";
import type { ZodError } from "zod";
import { getApiBaseUrl } from "@/service";
import type {
	NodeRunningLogEvent,
	StrategyRunningLogEvent,
} from "@/types/strategy-event/running-log-event";
import { RunningLogEventSchema } from "@/types/strategy-event/running-log-event";

const ROUTER = "strategy/backtest";
const API_VERSION = "api/v1";

const getApiUrl = () => `${getApiBaseUrl()}/${API_VERSION}/${ROUTER}`;

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
		const response = await axios.get(`${getApiUrl()}/${strategyId}/running-log`);
		if (response.status !== 200) {
			throw new Error(`Failed to fetch strategy running log: ${response.status}`);
		}

		const rawData = response.data.data;

		// Validate that we received an array
		if (!Array.isArray(rawData)) {
			throw new Error(`Expected array of logs, received: ${typeof rawData}`);
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
				console.error(`Strategy running log data validation failed [index ${i}]:`, {
					raw: rawData[i],
					errors: result.error.format(),
				});
				errors.push({ index: i, error: result.error });
			}
		}

		// If all logs failed validation, throw error
		if (validatedLogs.length === 0 && rawData.length > 0) {
			throw new Error(`All log data validation failed (${errors.length} errors)`);
		}

		// If some logs failed, log warning but return valid ones
		if (errors.length > 0) {
			console.warn(`Partial log data validation failed: ${errors.length}/${rawData.length}`);
		}

		return validatedLogs;
	} catch (error) {
		console.error("getStrategyRunningLog error", error);
		throw error;
	}
}
