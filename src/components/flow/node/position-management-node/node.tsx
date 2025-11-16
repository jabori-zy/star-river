import type { NodeProps } from "@xyflow/react";
import { Play } from "lucide-react";
import BaseNode from "@/components/flow/base/BaseNode";
import useTradingModeStore from "@/store/use-trading-mode-store";
import type { PositionManagementNode as PositionManagementNodeType } from "@/types/node/position-management-node";
import { TradeMode } from "@/types/strategy";
import BacktestModeShow from "./components/show/backtest-mode-show";
import LiveModeShow from "./components/show/live-mode-show";
import SimulateModeShow from "./components/show/simulate-mode-show";
import { memo } from "react";

const PositionManagementNode: React.FC<
	NodeProps<PositionManagementNodeType>
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
			icon={Play}
			isHovered={data?.nodeConfig?.isHovered || false}
			selected={selected}
		>
			{renderModeContent()}
		</BaseNode>
	);
};

export default memo(PositionManagementNode);
