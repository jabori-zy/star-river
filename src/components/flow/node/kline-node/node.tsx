import { type NodeProps, Position } from "@xyflow/react";
import { Play } from "lucide-react";
import { useEffect, useRef } from "react";
import type { BaseHandleProps } from "@/components/flow/base/BaseHandle";
import BaseNode from "@/components/flow/base/BaseNode";
import { useUpdateBacktestConfig } from "@/hooks/node/kline-node/use-update-backtest-config";
import { useUpdateLiveConfig } from "@/hooks/node/kline-node/use-update-live-config";
import { useStartNodeDataStore } from "@/store/use-start-node-data-store";
import useTradingModeStore from "@/store/useTradingModeStore";
import {
	getNodeDefaultInputHandleId,
	getNodeDefaultOutputHandleId,
	NodeType,
} from "@/types/node/index";
import type {
	KlineNodeBacktestConfig,
	KlineNodeLiveConfig,
	KlineNode as KlineNodeType,
} from "@/types/node/kline-node";
import { TradeMode } from "@/types/strategy";
import BacktestModeShow from "./components/show/backtest-mode-show";
import LiveModeShow from "./components/show/live-mode-show";

const KlineNode: React.FC<NodeProps<KlineNodeType>> = ({
	id,
	data,
	selected,
}) => {
	const nodeName = data?.nodeName || "K线节点";
	const { tradingMode } = useTradingModeStore();

	// 直接订阅 store 状态变化
	const { backtestConfig: startNodeBacktestConfig } = useStartNodeDataStore();

	// 实盘配置
	const liveConfig = data?.liveConfig || ({} as KlineNodeLiveConfig);
	// 回测配置
	const backtestConfig =
		data?.backtestConfig || ({} as KlineNodeBacktestConfig);

	const { updateTimeRange, setDefaultBacktestConfig } = useUpdateBacktestConfig(
		{ id, initialBacktestConfig: data?.backtestConfig },
	);
	const { setDefaultLiveConfig } = useUpdateLiveConfig({
		id,
		initialLiveConfig: data?.liveConfig,
	});
	// 使用 ref 存储最新的配置值，避免依赖项循环问题
	const liveConfigRef = useRef(liveConfig);
	const backtestConfigRef = useRef(backtestConfig);

	// 更新 ref 值
	useEffect(() => {
		liveConfigRef.current = liveConfig;
		backtestConfigRef.current = backtestConfig;
	});

	// 监听开始节点的时间范围变化
	useEffect(() => {
		const timeRange = startNodeBacktestConfig?.exchangeModeConfig?.timeRange;
		if (timeRange) {
			updateTimeRange(timeRange);
		}
	}, [startNodeBacktestConfig?.exchangeModeConfig?.timeRange, updateTimeRange]);

	// 初始化时设置默认回测配置
	useEffect(() => {
		if (!data?.liveConfig) {
			setDefaultLiveConfig();
		}
		if (!data?.backtestConfig) {
			setDefaultBacktestConfig();
		}
	}, [
		setDefaultLiveConfig,
		setDefaultBacktestConfig,
		data?.liveConfig,
		data?.backtestConfig,
	]);

	// 默认输入
	const defaultInputHandle: BaseHandleProps = {
		id: getNodeDefaultInputHandleId(id, NodeType.KlineNode),
		type: "target",
		position: Position.Left,
		handleColor: "!bg-red-400",
	};

	// 默认输出
	const defaultOutputHandle: BaseHandleProps = {
		id: getNodeDefaultOutputHandleId(id, NodeType.KlineNode),
		type: "source",
		position: Position.Right,
		handleColor: "!bg-red-400",
	};

	return (
		<BaseNode
			id={id}
			nodeName={nodeName}
			icon={Play}
			selected={selected}
			selectedBorderColor="border-red-400"
			defaultOutputHandle={defaultOutputHandle}
			defaultInputHandle={defaultInputHandle}
		>
			{/* 已选择的账户列表 */}

			{/* 实盘模式 */}
			{tradingMode === TradeMode.LIVE && (
				<LiveModeShow liveConfig={liveConfig} />
			)}
			{/* 回测模式 */}
			{tradingMode === TradeMode.BACKTEST && (
				<BacktestModeShow backtestConfig={backtestConfig} />
			)}
		</BaseNode>
	);
};

export default KlineNode;
