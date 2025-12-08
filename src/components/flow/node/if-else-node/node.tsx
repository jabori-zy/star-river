import { type NodeProps, Position } from "@xyflow/react";
import { memo, useEffect } from "react";
import type { BaseHandleProps } from "@/components/flow/base/BaseHandle";
import BaseNode from "@/components/flow/base/BaseNode";
import useStrategyWorkflow from "@/hooks/flow/use-strategy-workflow";
import {
	useBacktestConfig,
	useSyncSourceNode,
} from "@/hooks/node-config/if-else-node";
import useTradingModeStore from "@/store/use-trading-mode-store";
import type {
	IfElseNodeData,
	IfElseNode as IfElseNodeType,
} from "@/types/node/if-else-node";
import {
	getNodeDefaultColor,
	getNodeDefaultInputHandleId,
	getNodeIconName,
	NodeType,
} from "@/types/node/index";
import { TradeMode } from "@/types/strategy";
import BacktestModeShow from "./components/node-show/backtest-mode-show";
import LiveModeShow from "./components/node-show/live-mode-show";

const IfElseNode: React.FC<NodeProps<IfElseNodeType>> = ({ id, selected }) => {
	const { tradingMode } = useTradingModeStore();

	const { getSourceNodes, getNodeData } = useStrategyWorkflow();

	const { backtestConfig } = useBacktestConfig({ id });

	const currentNodeData = getNodeData(id) as IfElseNodeData;
	const handleColor =
		currentNodeData?.nodeConfig?.handleColor ||
		getNodeDefaultColor(NodeType.IfElseNode);
	const sourceNodes = getSourceNodes(id);

	// Sync source node configurations with if-else conditions
	useSyncSourceNode({ id, sourceNodes, backtestConfig });

	const defaultInputHandle: BaseHandleProps = {
		type: "target",
		position: Position.Left,
		id: getNodeDefaultInputHandleId(id, NodeType.IfElseNode),
		handleColor: handleColor,
	};

	return (
		<BaseNode
			id={id}
			nodeName={currentNodeData?.nodeName || "if else node"}
			iconName={
				currentNodeData?.nodeConfig?.iconName ||
				getNodeIconName(NodeType.IfElseNode)
			}
			iconBackgroundColor={
				currentNodeData?.nodeConfig?.iconBackgroundColor ||
				getNodeDefaultColor(NodeType.IfElseNode)
			}
			borderColor={
				currentNodeData?.nodeConfig?.borderColor ||
				getNodeDefaultColor(NodeType.IfElseNode)
			}
			isHovered={currentNodeData?.nodeConfig?.isHovered || false}
			selected={selected}
			defaultInputHandle={defaultInputHandle}
			className="!max-w-none"
		>
			{tradingMode === TradeMode.BACKTEST && (
				<BacktestModeShow
					id={id}
					data={currentNodeData}
					handleColor={handleColor}
				/>
			)}
			{tradingMode === TradeMode.LIVE && (
				<LiveModeShow id={id} data={currentNodeData} />
			)}
		</BaseNode>
	);
};

export default memo(IfElseNode);
