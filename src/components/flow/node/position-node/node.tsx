import type { NodeProps } from "@xyflow/react";
import { Position } from "@xyflow/react";
import { memo } from "react";
import type { BaseHandleProps } from "@/components/flow/base/BaseHandle";
import BaseNode from "@/components/flow/base/BaseNode";
import useStrategyWorkflow from "@/hooks/flow/use-strategy-workflow";
import useTradingModeStore from "@/store/use-trading-mode-store";
import {
	getNodeDefaultColor,
	getNodeDefaultInputHandleId,
	getNodeIconName,
	NodeType,
} from "@/types/node/index";
import type {
	PositionNodeData,
	PositionNode as PositionNodeType,
} from "@/types/node/position-node";
import { TradeMode } from "@/types/strategy";
import BacktestModeShow from "./components/show/backtest-mode-show";
import LiveModeShow from "./components/show/live-mode-show";
import SimulateModeShow from "./components/show/simulate-mode-show";

const PositionNode: React.FC<NodeProps<PositionNodeType>> = ({
	id,
	selected,
}) => {
	const { getNodeData } = useStrategyWorkflow();
	const currentNodeData = getNodeData(id) as PositionNodeData;
	const nodeName = currentNodeData?.nodeName || "仓位管理节点";
	const { tradingMode } = useTradingModeStore();
	const iconName =
		currentNodeData?.nodeConfig?.iconName ||
		getNodeIconName(NodeType.PositionNode);
	const iconBackgroundColor =
		currentNodeData?.nodeConfig?.iconBackgroundColor ||
		getNodeDefaultColor(NodeType.PositionNode);
	const borderColor =
		currentNodeData?.nodeConfig?.borderColor ||
		getNodeDefaultColor(NodeType.PositionNode);
	const handleColor =
		currentNodeData?.nodeConfig?.handleColor ||
		getNodeDefaultColor(NodeType.PositionNode);
	const isHovered = currentNodeData?.nodeConfig?.isHovered || false;

	// 根据交易模式渲染不同的内容
	const renderModeContent = () => {
		switch (tradingMode) {
			case TradeMode.LIVE:
				return <LiveModeShow id={id} data={currentNodeData} />;
			case TradeMode.SIMULATE:
				return <SimulateModeShow id={id} data={currentNodeData} />;
			case TradeMode.BACKTEST:
				return (
					<BacktestModeShow
						id={id}
						data={currentNodeData}
						handleColor={handleColor}
					/>
				);
			default:
				return (
					<BacktestModeShow
						id={id}
						data={currentNodeData}
						handleColor={handleColor}
					/>
				);
		}
	};
	const defaultInputHandle: BaseHandleProps = {
		type: "target",
		position: Position.Left,
		id: getNodeDefaultInputHandleId(id, NodeType.PositionNode),
		handleColor: handleColor,
	};

	return (
		<BaseNode
			id={id}
			nodeName={nodeName}
			iconName={iconName}
			iconBackgroundColor={iconBackgroundColor}
			borderColor={borderColor}
			isHovered={isHovered}
			selected={selected}
			defaultInputHandle={defaultInputHandle}
		>
			{renderModeContent()}
		</BaseNode>
	);
};

export default memo(PositionNode);
