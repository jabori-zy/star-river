import { useEffect } from "react";
import type { StartNodeData } from "@/types/node/start-node";
import { useBacktestConfig } from "./use-update-backtest-config";

/**
 * Synchronize start node's time range to indicator node
 *
 * Responsibilities:
 * Monitor start node's time range changes and automatically sync to indicator node's backtest config
 *
 * @param id - Indicator node ID
 * @param startNodeData - Start node data (passed from external to avoid duplicate fetching)
 */
export const useSyncTimeRange = ({
	id,
	startNodeData,
}: {
	id: string;
	startNodeData: StartNodeData | null;
}) => {
	const { updateTimeRange } = useBacktestConfig({ id });

	useEffect(() => {
		const timeRange =
			startNodeData?.backtestConfig?.exchangeModeConfig?.timeRange;
		if (timeRange) {
			updateTimeRange(timeRange);
		}
	}, [
		startNodeData?.backtestConfig?.exchangeModeConfig?.timeRange,
		updateTimeRange,
	]);
};
