import { type NodeProps, Position } from "@xyflow/react";
import { memo } from "react";
import type { BaseHandleProps } from "@/components/flow/base/BaseHandle";
import BaseNode from "@/components/flow/base/BaseNode";
import useStrategyWorkflow from "@/hooks/flow/use-strategy-workflow";
import useTradingModeStore from "@/store/use-trading-mode-store";
import {
	getNodeDefaultColor,
	getNodeDefaultOutputHandleId,
	getNodeIconName,
	NodeType,
} from "@/types/node/index";
import type {
	StartNodeData,
	StartNode as StartNodeType,
} from "@/types/node/start-node";
import {
	type StrategyBacktestConfig,
	type StrategyLiveConfig,
	TradeMode,
} from "@/types/strategy";
import BacktestNodeShow from "./components/node-show/backtest-mode-show";
import LiveNodeShow from "./components/node-show/live-mode-show";

const StartNode: React.FC<NodeProps<StartNodeType>> = ({
	id,
	selected,
	isConnectable,
}) => {
	const { tradingMode } = useTradingModeStore();

	const { getNodeData } = useStrategyWorkflow();
	const startNodeData = getNodeData(id) as StartNodeData;

	// Node name
	const nodeName = startNodeData?.nodeName || "Strategy Start";
	const liveConfig = startNodeData?.liveConfig || ({} as StrategyLiveConfig);
	const backtestConfig =
		startNodeData?.backtestConfig || ({} as StrategyBacktestConfig);

	const defaultOutputHandle: BaseHandleProps = {
		id: getNodeDefaultOutputHandleId(id, NodeType.StartNode),
		type: "source",
		position: Position.Right,
		isConnectable: isConnectable,
		handleColor:
			startNodeData?.nodeConfig?.handleColor ||
			getNodeDefaultColor(NodeType.StartNode),
	};

	return (
		<BaseNode
			id={id}
			nodeName={nodeName}
			iconName={
				startNodeData?.nodeConfig?.iconName ||
				getNodeIconName(NodeType.StartNode)
			}
			iconBackgroundColor={
				startNodeData?.nodeConfig?.iconBackgroundColor ||
				getNodeDefaultColor(NodeType.StartNode)
			}
			borderColor={
				startNodeData?.nodeConfig?.borderColor ||
				getNodeDefaultColor(NodeType.StartNode)
			}
			isHovered={startNodeData?.nodeConfig?.isHovered || false}
			selected={selected}
			defaultOutputHandle={defaultOutputHandle}
		>
			{/* Live mode */}
			{tradingMode === TradeMode.LIVE && (
				<LiveNodeShow liveConfig={liveConfig} />
			)}
			{/* Backtest mode */}
			{tradingMode === TradeMode.BACKTEST && (
				<BacktestNodeShow backtestConfig={backtestConfig} />
			)}
		</BaseNode>
	);
};

export default memo(StartNode);
