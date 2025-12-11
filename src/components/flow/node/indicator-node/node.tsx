import { type NodeProps, Position } from "@xyflow/react";
import { memo } from "react";
import type { BaseHandleProps } from "@/components/flow/base/BaseHandle";
import BaseNode from "@/components/flow/base/BaseNode";
import useStrategyWorkflow from "@/hooks/flow/use-strategy-workflow";
import {
	useSyncSourceNode,
	useSyncTimeRange,
} from "@/hooks/node-config/indicator-node";
import useTradingModeStore from "@/store/use-trading-mode-store";
import {
	getNodeDefaultColor,
	getNodeDefaultInputHandleId,
	getNodeDefaultOutputHandleId,
	getNodeIconName,
	NodeType,
} from "@/types/node/index";
import type {
	IndicatorNodeData,
	IndicatorNode as IndicatorNodeType,
} from "@/types/node/indicator-node";
import { TradeMode } from "@/types/strategy";
import BacktestModeShow from "./components/node-show/backtest-mode-show";
import LiveModeShow from "./components/node-show/live-mode-show";

const IndicatorNode: React.FC<NodeProps<IndicatorNodeType>> = ({
	id,
	selected,
}) => {
	const { tradingMode } = useTradingModeStore();

	const { getStartNodeData, getNodeData } = useStrategyWorkflow();

	const startNodeData = getStartNodeData();
	const currentNodeData = getNodeData(id) as IndicatorNodeData;
	const handleColor =
		currentNodeData?.nodeConfig?.handleColor ||
		getNodeDefaultColor(NodeType.IndicatorNode);

	// Synchronize source node's Symbol configuration
	useSyncSourceNode({ id, currentNodeData });

	// Synchronize start node's time range
	useSyncTimeRange({ id, startNodeData });

	const defaultInputHandle: BaseHandleProps = {
		id: getNodeDefaultInputHandleId(id, NodeType.IndicatorNode),
		type: "target",
		position: Position.Left,
		handleColor: handleColor,
	};

	const defaultOutputHandle: BaseHandleProps = {
		id: getNodeDefaultOutputHandleId(id, NodeType.IndicatorNode),
		type: "source",
		position: Position.Right,
		handleColor: handleColor,
	};

	return (
		<BaseNode
			id={id}
			nodeName={currentNodeData?.nodeName || "indicator node"}
			iconName={
				currentNodeData?.nodeConfig?.iconName ||
				getNodeIconName(NodeType.IndicatorNode)
			}
			iconBackgroundColor={
				currentNodeData?.nodeConfig?.iconBackgroundColor ||
				getNodeDefaultColor(NodeType.IndicatorNode)
			}
			selectedBorderColor={
				currentNodeData?.nodeConfig?.borderColor ||
				getNodeDefaultColor(NodeType.IndicatorNode)
			}
			isHovered={currentNodeData?.nodeConfig?.isHovered || false}
			selected={selected}
			defaultInputHandle={defaultInputHandle}
			defaultOutputHandle={defaultOutputHandle}
		>
			{tradingMode === TradeMode.LIVE && (
				<LiveModeShow id={id} data={currentNodeData} />
			)}
			{tradingMode === TradeMode.BACKTEST && (
				<BacktestModeShow
					id={id}
					data={currentNodeData}
					handleColor={handleColor}
				/>
			)}
		</BaseNode>
	);
};

export default memo(IndicatorNode);
