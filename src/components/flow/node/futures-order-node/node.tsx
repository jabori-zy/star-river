import type { NodeProps } from "@xyflow/react";
import { Play } from "lucide-react";
import { useEffect } from "react";
import BaseNode from "@/components/flow/base/BaseNode";
import { useBacktestConfig } from "@/hooks/node-config/futures-order-node";
import useStrategyWorkflow from "@/hooks/flow/use-strategy-workflow";
import useTradingModeStore from "@/store/use-trading-mode-store";
import type { FuturesOrderNode as FuturesOrderNodeType } from "@/types/node/futures-order-node";
import { TradeMode } from "@/types/strategy";
import BacktestModeShow from "./components/node-show/backtest-mode-show";
import LiveModeShow from "./components/node-show/live-mode-show";
import SimulateModeShow from "./components/node-show/simulate-mode-show";

const FuturesOrderNode: React.FC<NodeProps<FuturesOrderNodeType>> = ({
	id,
	data,
	selected,
}) => {
	const nodeName = data?.nodeName || "期货订单节点";

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
				return <LiveModeShow id={id} data={data} />;
			case TradeMode.SIMULATE:
				return <SimulateModeShow id={id} data={data} />;
			case TradeMode.BACKTEST:
			default:
				return <BacktestModeShow id={id} data={data} />;
		}
	};

	return (
		<BaseNode id={id} nodeName={nodeName} icon={Play} selected={selected}>
			{renderModeShow()}
		</BaseNode>
	);
};

export default FuturesOrderNode;
