import { type NodeProps, Position } from "@xyflow/react";
import { Play } from "lucide-react";
import { memo } from "react";
import type { BaseHandleProps } from "@/components/flow/base/BaseHandle";
import BaseNode from "@/components/flow/base/BaseNode";
import useTradingModeStore from "@/store/use-trading-mode-store";
import {
	getNodeDefaultInputHandleId,
	getNodeDefaultOutputHandleId,
	NodeType,
} from "@/types/node/index";
import type { IndicatorNode as IndicatorNodeType, IndicatorNodeData } from "@/types/node/indicator-node";
import { TradeMode } from "@/types/strategy";
import BacktestModeShow from "./components/node-show/backtest-mode-show";
import LiveModeShow from "./components/node-show/live-mode-show";
import useStrategyWorkflow from "@/hooks/flow/use-strategy-workflow";
import { useSyncSourceNode, useSyncTimeRange } from "@/hooks/node-config/indicator-node";


const IndicatorNode: React.FC<NodeProps<IndicatorNodeType>> = ({
	id,
	selected,
}) => {
	const { tradingMode } = useTradingModeStore();

	const { getStartNodeData, getNodeData } = useStrategyWorkflow();

	const startNodeData = getStartNodeData();
	const currentNodeData = getNodeData(id) as IndicatorNodeData;

	// 同步源节点的 Symbol 配置
	useSyncSourceNode({ id, currentNodeData });

	// 同步开始节点的时间范围
	useSyncTimeRange({ id, startNodeData });


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
			nodeName={currentNodeData?.nodeName || "indicator node"}
			icon={Play}
			isHovered={currentNodeData?.nodeConfig?.isHovered || false}
			selected={selected}
			defaultInputHandle={defaultInputHandle}
			defaultOutputHandle={defaultOutputHandle}
		>
			{tradingMode === TradeMode.LIVE && <LiveModeShow id={id} data={currentNodeData} />}
			{tradingMode === TradeMode.BACKTEST && (
				<BacktestModeShow id={id} data={currentNodeData} />
			)}
		</BaseNode>
	);
};

export default memo(IndicatorNode);
