import { type NodeProps, Position } from "@xyflow/react";
import { memo, useEffect } from "react";
import type { BaseHandleProps } from "@/components/flow/base/BaseHandle";
import BaseNode from "@/components/flow/base/BaseNode";
import useStrategyWorkflow from "@/hooks/flow/use-strategy-workflow";
import { useBacktestConfig } from "@/hooks/node-config/kline-node";
import useTradingModeStore from "@/store/use-trading-mode-store";
import {
	getNodeDefaultColor,
	getNodeDefaultInputHandleId,
	getNodeDefaultOutputHandleId,
	getNodeIconName,
	NodeType,
} from "@/types/node/index";
import type {
	KlineNodeBacktestConfig,
	KlineNodeData,
	KlineNodeLiveConfig,
	KlineNode as KlineNodeType,
} from "@/types/node/kline-node";
import { TradeMode } from "@/types/strategy";
import BacktestModeShow from "./components/show/backtest-mode-show";
import LiveModeShow from "./components/show/live-mode-show";

const KlineNode: React.FC<NodeProps<KlineNodeType>> = ({ id, selected }) => {
	const { tradingMode } = useTradingModeStore();
	const { getStartNodeData, getNodeData } = useStrategyWorkflow();

	const startNodeData = getStartNodeData();
	const startNodeTimeRange =
		startNodeData?.backtestConfig?.exchangeModeConfig?.timeRange;
	const currentNodeData = getNodeData(id) as KlineNodeData;

	// Live mode configuration
	const liveConfig = currentNodeData?.liveConfig || ({} as KlineNodeLiveConfig);
	// Backtest mode configuration
	const backtestConfig =
		currentNodeData?.backtestConfig || ({} as KlineNodeBacktestConfig);

	const handleColor =
		currentNodeData?.nodeConfig?.handleColor ||
		getNodeDefaultColor(NodeType.KlineNode);

	const { updateTimeRange } = useBacktestConfig({ id });

	// Listen to start node's time range changes
	useEffect(() => {
		if (startNodeTimeRange) {
			updateTimeRange(startNodeTimeRange);
		}
	}, [startNodeTimeRange, updateTimeRange]);

	// Default input
	const defaultInputHandle: BaseHandleProps = {
		id: getNodeDefaultInputHandleId(id, NodeType.KlineNode),
		type: "target",
		position: Position.Left,
		handleColor:
			currentNodeData?.nodeConfig?.handleColor ||
			getNodeDefaultColor(NodeType.KlineNode),
	};

	// Default output
	const defaultOutputHandle: BaseHandleProps = {
		id: getNodeDefaultOutputHandleId(id, NodeType.KlineNode),
		type: "source",
		position: Position.Right,
		handleColor:
			currentNodeData?.nodeConfig?.handleColor ||
			getNodeDefaultColor(NodeType.KlineNode),
	};

	return (
		<BaseNode
			id={id}
			nodeName={currentNodeData?.nodeName || "kline node"}
			iconName={
				currentNodeData?.nodeConfig?.iconName ||
				getNodeIconName(NodeType.KlineNode)
			}
			iconBackgroundColor={
				currentNodeData?.nodeConfig?.iconBackgroundColor ||
				getNodeDefaultColor(NodeType.KlineNode)
			}
			borderColor={
				currentNodeData?.nodeConfig?.borderColor ||
				getNodeDefaultColor(NodeType.KlineNode)
			}
			isHovered={currentNodeData?.nodeConfig?.isHovered || false}
			selected={selected}
			defaultOutputHandle={defaultOutputHandle}
			defaultInputHandle={defaultInputHandle}
		>
			{/* Selected account list */}

			{/* Live mode */}
			{tradingMode === TradeMode.LIVE && (
				<LiveModeShow liveConfig={liveConfig} />
			)}
			{/* Backtest mode */}
			{tradingMode === TradeMode.BACKTEST && (
				<BacktestModeShow
					handleColor={handleColor}
					backtestConfig={backtestConfig}
				/>
			)}
		</BaseNode>
	);
};

export default memo(KlineNode);
