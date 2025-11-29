import type { NodeProps } from "@xyflow/react";
import BaseNode from "@/components/flow/base/BaseNode";
import useTradingModeStore from "@/store/use-trading-mode-store";
import type { PositionNode as PositionNodeType } from "@/types/node/position-management-node";
import { TradeMode } from "@/types/strategy";
import BacktestModeShow from "./components/show/backtest-mode-show";
import LiveModeShow from "./components/show/live-mode-show";
import SimulateModeShow from "./components/show/simulate-mode-show";
import { memo } from "react";
import { getNodeIconName, getNodeDefaultColor, NodeType } from "@/types/node/index";

const PositionNode: React.FC<
	NodeProps<PositionNodeType>
> = ({ id, data, selected }) => {
	const nodeName = data.nodeName || "仓位管理节点";
	const { tradingMode } = useTradingModeStore();

	// 根据交易模式渲染不同的内容
	const renderModeContent = () => {
		switch (tradingMode) {
			case TradeMode.LIVE:
				return <LiveModeShow id={id} data={data} />;
			case TradeMode.SIMULATE:
				return <SimulateModeShow id={id} data={data} />;
			case TradeMode.BACKTEST:
				return <BacktestModeShow id={id} data={data} />;
			default:
				return <BacktestModeShow id={id} data={data} />;
		}
	};

	return (
		<BaseNode
			id={id}
			nodeName={nodeName}
			iconName={data?.nodeConfig?.iconName || getNodeIconName(NodeType.PositionNode)}
			iconBackgroundColor={data?.nodeConfig?.iconBackgroundColor || getNodeDefaultColor(NodeType.PositionNode)}
			borderColor={data?.nodeConfig?.borderColor || getNodeDefaultColor(NodeType.PositionNode)}
			isHovered={data?.nodeConfig?.isHovered || false}
			selected={selected}
		>
			{renderModeContent()}
		</BaseNode>
	);
};

export default memo(PositionNode);
