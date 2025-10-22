import { type NodeProps, Position } from "@xyflow/react";
import { Play } from "lucide-react";
import { useEffect } from "react";
import type { BaseHandleProps } from "@/components/flow/base/BaseHandle";
import BaseNode from "@/components/flow/base/BaseNode";
import { useUpdateBacktestConfig } from "@/hooks/node-config/indicator-node/use-update-backtest-config";
import { useUpdateLiveConfig } from "@/hooks/node-config/indicator-node/use-update-live-config";
import { useStartNodeDataStore } from "@/store/node/use-start-node-data-store";
import useTradingModeStore from "@/store/use-trading-mode-store";
import {
	getNodeDefaultInputHandleId,
	getNodeDefaultOutputHandleId,
	NodeType,
} from "@/types/node/index";
import type { IndicatorNode as IndicatorNodeType } from "@/types/node/indicator-node";
import { TradeMode } from "@/types/strategy";
import BacktestModeShow from "./components/node-show/backtest-mode-show";
import LiveModeShow from "./components/node-show/live-mode-show";

const IndicatorNode: React.FC<NodeProps<IndicatorNodeType>> = ({
	id,
	data,
	selected,
}) => {
	const nodeName = data?.nodeName || "指标节点";
	const { tradingMode } = useTradingModeStore();
	// 直接订阅 store 状态变化
	const { backtestConfig: startNodeBacktestConfig } = useStartNodeDataStore();

	// 使用分离的hooks
	const { setDefaultLiveConfig } = useUpdateLiveConfig({
		id,
		initialLiveConfig: data?.liveConfig,
	});

	const { setDefaultBacktestConfig, updateTimeRange } = useUpdateBacktestConfig(
		{
			id,
			initialConfig: data?.backtestConfig,
		},
	);

	// 监听开始节点的时间范围变化
	useEffect(() => {
		const timeRange = startNodeBacktestConfig?.exchangeModeConfig?.timeRange;
		if (timeRange) {
			updateTimeRange(timeRange);
		}
	}, [startNodeBacktestConfig?.exchangeModeConfig?.timeRange, updateTimeRange]);

	// 初始化时设置默认配置
	useEffect(() => {
		if (!data?.liveConfig) {
			setDefaultLiveConfig();
		}
		// 如果回测节点没有配置，则设置默认配置
		if (!data?.backtestConfig) {
			setDefaultBacktestConfig();
		}
	}, [
		setDefaultLiveConfig,
		setDefaultBacktestConfig,
		data.liveConfig,
		data.backtestConfig,
	]);

	const defaultInputHandle: BaseHandleProps = {
		id: getNodeDefaultInputHandleId(id, NodeType.IndicatorNode),
		type: "target",
		position: Position.Left,
		handleColor: "!bg-red-400",
	};

	const defaultOutputHandle: BaseHandleProps = {
		id: getNodeDefaultOutputHandleId(id, NodeType.IndicatorNode),
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
			defaultInputHandle={defaultInputHandle}
			defaultOutputHandle={defaultOutputHandle}
		>
			{tradingMode === TradeMode.LIVE && <LiveModeShow id={id} data={data} />}
			{tradingMode === TradeMode.BACKTEST && (
				<BacktestModeShow id={id} data={data} />
			)}
		</BaseNode>
	);
};

export default IndicatorNode;
