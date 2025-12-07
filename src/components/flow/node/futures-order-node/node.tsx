import type { NodeProps } from "@xyflow/react";
import { Position } from "@xyflow/react";
import { memo, useEffect } from "react";
import type { BaseHandleProps } from "@/components/flow/base/BaseHandle";
import BaseNode from "@/components/flow/base/BaseNode";
import useStrategyWorkflow from "@/hooks/flow/use-strategy-workflow";
import { useBacktestConfig } from "@/hooks/node-config/futures-order-node";
import useTradingModeStore from "@/store/use-trading-mode-store";
import type {
	FuturesOrderNodeData,
	FuturesOrderNode as FuturesOrderNodeType,
} from "@/types/node/futures-order-node";
import {
	getNodeDefaultColor,
	getNodeDefaultInputHandleId,
	getNodeIconName,
	NodeType,
} from "@/types/node/index";
import { TradeMode } from "@/types/strategy";
import BacktestModeShow from "./components/node-show/backtest-mode-show";
import LiveModeShow from "./components/node-show/live-mode-show";
import SimulateModeShow from "./components/node-show/simulate-mode-show";

const FuturesOrderNode: React.FC<NodeProps<FuturesOrderNodeType>> = ({
	id,
	selected,
}) => {
	const { getNodeData } = useStrategyWorkflow();
	const currentNodeData = getNodeData(id) as FuturesOrderNodeData;
	const nodeName = currentNodeData?.nodeName || "期货订单节点";
	const handleColor =
		currentNodeData?.nodeConfig?.handleColor ||
		getNodeDefaultColor(NodeType.FuturesOrderNode);
	const iconName =
		currentNodeData?.nodeConfig?.iconName ||
		getNodeIconName(NodeType.FuturesOrderNode);
	const iconBackgroundColor =
		currentNodeData?.nodeConfig?.iconBackgroundColor ||
		getNodeDefaultColor(NodeType.FuturesOrderNode);
	const borderColor =
		currentNodeData?.nodeConfig?.borderColor ||
		getNodeDefaultColor(NodeType.FuturesOrderNode);
	// Get current trading mode
	const { tradingMode } = useTradingModeStore();

	// Get start node data
	const { getStartNodeData } = useStrategyWorkflow();
	const startNodeData = getStartNodeData();
	const startNodeTimeRange =
		startNodeData?.backtestConfig?.exchangeModeConfig?.timeRange;

	// Use new version hook to manage backtest config
	const { updateTimeRange } = useBacktestConfig({ id });

	// Listen for start node time range changes
	useEffect(() => {
		if (startNodeTimeRange) {
			updateTimeRange(startNodeTimeRange);
		}
	}, [startNodeTimeRange, updateTimeRange]);

	// Render different display components based on trading mode
	const renderModeShow = () => {
		switch (tradingMode) {
			case TradeMode.LIVE:
				return <LiveModeShow id={id} data={currentNodeData} />;
			case TradeMode.SIMULATE:
				return (
					<SimulateModeShow
						id={id}
						data={currentNodeData}
						handleColor={handleColor}
					/>
				);
			case TradeMode.BACKTEST:
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
		id: getNodeDefaultInputHandleId(id, NodeType.FuturesOrderNode),
		handleColor: handleColor,
	};

	return (
		<BaseNode
			id={id}
			nodeName={nodeName}
			iconName={iconName}
			iconBackgroundColor={iconBackgroundColor}
			borderColor={borderColor}
			selected={selected}
			isHovered={currentNodeData?.nodeConfig?.isHovered || false}
			defaultInputHandle={defaultInputHandle}
		>
			{renderModeShow()}
		</BaseNode>
	);
};

export default memo(FuturesOrderNode);
