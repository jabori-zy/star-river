import { type NodeProps, Position } from "@xyflow/react";
import { memo } from "react";
import type { BaseHandleProps } from "@/components/flow/base/BaseHandle";
import BaseNode from "@/components/flow/base/BaseNode";
import useTradingModeStore from "@/store/use-trading-mode-store";
import { getNodeDefaultOutputHandleId, getNodeIconName, getNodeDefaultColor, NodeType } from "@/types/node/index";
import type { StartNode as StartNodeType } from "@/types/node/start-node";
import {
	type StrategyBacktestConfig,
	type StrategyLiveConfig,
	TradeMode,
} from "@/types/strategy";
import BacktestNodeShow from "./components/node-show/backtest-mode-show";
import LiveNodeShow from "./components/node-show/live-mode-show";
import useStrategyWorkflow from "@/hooks/flow/use-strategy-workflow";
import type { StartNodeData } from "@/types/node/start-node";

const StartNode: React.FC<NodeProps<StartNodeType>> = ({
	id,
	selected,
	isConnectable,
}) => {
	const { tradingMode } = useTradingModeStore();

	const { getNodeData } = useStrategyWorkflow();
	const startNodeData = getNodeData(id) as StartNodeData;

	// 节点名称
	const nodeName = startNodeData?.nodeName || "策略起点";
	const liveConfig = startNodeData?.liveConfig || ({} as StrategyLiveConfig);
	const backtestConfig = startNodeData?.backtestConfig ||({} as StrategyBacktestConfig);

	const defaultOutputHandle: BaseHandleProps = {
		id: getNodeDefaultOutputHandleId(id, NodeType.StartNode),
		type: "source",
		position: Position.Right,
		isConnectable: isConnectable,
		handleColor: startNodeData?.nodeConfig?.handleColor || getNodeDefaultColor(NodeType.StartNode),
	};

	return (
		<BaseNode
			id={id}
			nodeName={nodeName}
			iconName={startNodeData?.nodeConfig?.iconName || getNodeIconName(NodeType.StartNode)}
			iconBackgroundColor={startNodeData?.nodeConfig?.iconBackgroundColor || getNodeDefaultColor(NodeType.StartNode)}
			borderColor={startNodeData?.nodeConfig?.borderColor || getNodeDefaultColor(NodeType.StartNode)}
			isHovered={startNodeData?.nodeConfig?.isHovered || false}
			selected={selected}
			defaultOutputHandle={defaultOutputHandle}
		>
			{/* 实盘模式 */}
			{tradingMode === TradeMode.LIVE && (
				<LiveNodeShow liveConfig={liveConfig} />
			)}
			{/* 回测模式 */}
			{tradingMode === TradeMode.BACKTEST && (
				<BacktestNodeShow backtestConfig={backtestConfig} />
			)}
		</BaseNode>
	);
};

export default memo(StartNode);
