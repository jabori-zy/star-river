import { useEffect } from "react";
import type { StartNodeData } from "@/types/node/start-node";
import { useBacktestConfig } from "./use-update-backtest-config";

/**
 * 同步开始节点的时间范围到指标节点
 *
 * 职责：
 * 监听开始节点的时间范围变化，自动同步到指标节点的回测配置中
 *
 * @param id - 指标节点 ID
 * @param startNodeData - 开始节点数据（从外部传入，避免重复获取）
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
