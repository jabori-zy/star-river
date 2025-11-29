import type { NodeProps } from "@xyflow/react";
import { memo, useEffect } from "react";
import BaseNode from "@/components/flow/base/BaseNode";
import { useBacktestConfig } from "@/hooks/node-config/futures-order-node";
import useStrategyWorkflow from "@/hooks/flow/use-strategy-workflow";
import useTradingModeStore from "@/store/use-trading-mode-store";
import type { FuturesOrderNode as FuturesOrderNodeType } from "@/types/node/futures-order-node";
import { TradeMode } from "@/types/strategy";
import BacktestModeShow from "./components/node-show/backtest-mode-show";
import LiveModeShow from "./components/node-show/live-mode-show";
import SimulateModeShow from "./components/node-show/simulate-mode-show";
import { getNodeIconName, getNodeDefaultColor, NodeType } from "@/types/node/index";
import type { FuturesOrderNodeData } from "@/types/node/futures-order-node";

const FuturesOrderNode: React.FC<NodeProps<FuturesOrderNodeType>> = ({
	id,
	selected,
}) => {
	const { getNodeData } = useStrategyWorkflow();
	const currentNodeData = getNodeData(id) as FuturesOrderNodeData;
	const nodeName = currentNodeData?.nodeName || "期货订单节点";
	const handleColor = currentNodeData?.nodeConfig?.handleColor || getNodeDefaultColor(NodeType.FuturesOrderNode);
	const iconName = currentNodeData?.nodeConfig?.iconName || getNodeIconName(NodeType.FuturesOrderNode);
	const iconBackgroundColor = currentNodeData?.nodeConfig?.iconBackgroundColor || getNodeDefaultColor(NodeType.FuturesOrderNode);
	const borderColor = currentNodeData?.nodeConfig?.borderColor || getNodeDefaultColor(NodeType.FuturesOrderNode);
	// 获取当前的交易模式
	const { tradingMode } = useTradingModeStore();

	// 获取开始节点数据
	const { getStartNodeData } = useStrategyWorkflow();
	const startNodeData = getStartNodeData();
	const startNodeTimeRange = startNodeData?.backtestConfig?.exchangeModeConfig?.timeRange;

	// 使用新版本 hook 管理回测配置
	const { updateTimeRange } = useBacktestConfig({ id });

	// 监听开始节点的时间范围变化
	useEffect(() => {
		if (startNodeTimeRange) {
			updateTimeRange(startNodeTimeRange);
		}
	}, [startNodeTimeRange, updateTimeRange]);

	// 根据交易模式渲染不同的显示组件
	const renderModeShow = () => {
		switch (tradingMode) {
			case TradeMode.LIVE:
				return <LiveModeShow id={id} data={currentNodeData} />;
			case TradeMode.SIMULATE:
				return <SimulateModeShow id={id} data={currentNodeData} handleColor={handleColor} />;
			case TradeMode.BACKTEST:
				return <BacktestModeShow id={id} data={currentNodeData} handleColor={handleColor} />;
				
		}
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
		>
			{renderModeShow()}
		</BaseNode>
	);
};

export default memo(FuturesOrderNode);
