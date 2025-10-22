import type { NodeProps } from "@xyflow/react";
import { Play } from "lucide-react";
import { useEffect, useRef } from "react";
import BaseNode from "@/components/flow/base/BaseNode";
import { useUpdateBacktestConfig } from "@/hooks/node-config/futures-order-node/use-update-backtest-config";
import { useUpdateLiveConfig } from "@/hooks/node-config/futures-order-node/use-update-live-config";
import { useUpdateSimulateConfig } from "@/hooks/node-config/futures-order-node/use-update-simulate-config";
import { useStartNodeDataStore } from "@/store/node/use-start-node-data-store";
import useTradingModeStore from "@/store/use-trading-mode-store";
import type { FuturesOrderNode as FuturesOrderNodeType } from "@/types/node/futures-order-node";
import { type TimeRange, TradeMode } from "@/types/strategy";
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

	// 获取开始节点的配置
	const { backtestConfig: startNodeBacktestConfig } = useStartNodeDataStore();

	// 回测模式的hooks
	const { updateTimeRange } = useUpdateBacktestConfig({
		id,
		initialConfig: data?.backtestConfig,
	});

	// 实盘和模拟模式的hooks - 初始化但不使用，为了确保节点数据结构正确
	useUpdateLiveConfig({
		id,
		initialConfig: data?.liveConfig,
	});

	useUpdateSimulateConfig({
		id,
		initialConfig: data?.simulateConfig,
	});

	// 防止循环更新的ref
	const lastTimeRangeRef = useRef<TimeRange | null>(null);

	// 回测模式特有的时间范围同步逻辑
	useEffect(() => {
		if (tradingMode === TradeMode.BACKTEST) {
			const newTimeRange =
				startNodeBacktestConfig?.exchangeModeConfig?.timeRange;
			if (
				newTimeRange &&
				JSON.stringify(newTimeRange) !==
					JSON.stringify(lastTimeRangeRef.current)
			) {
				lastTimeRangeRef.current = newTimeRange;
				updateTimeRange(newTimeRange);
			}
		}
	}, [startNodeBacktestConfig, updateTimeRange, tradingMode]);

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
