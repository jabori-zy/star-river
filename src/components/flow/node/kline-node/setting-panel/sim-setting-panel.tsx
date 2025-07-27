import { useNodeConnections, useReactFlow } from "@xyflow/react";
import { useEffect, useState } from "react";
import type { SettingProps } from "@/components/flow/base/BasePanel/setting-panel";
import { useUpdateLiveConfig } from "@/hooks/node/kline-node/use-update-live-config";
import type { KlineNodeData } from "@/types/node/kline-node";
import type { StartNode } from "@/types/node/start-node";
import { TradeMode } from "@/types/strategy";
import DataSourceSelector from "../components/data-source-selector";
import SymbolSelector from "../components/symbol-selector";

const KlineNodeSimSettingPanel: React.FC<SettingProps> = ({ id, data }) => {
	const klineNodeData = data as KlineNodeData;

	const { getNode } = useReactFlow();

	const [connectedStartNode, setConnectedStartNode] =
		useState<StartNode | null>(null);

	const connections = useNodeConnections({ id });

	// 使用自定义hook管理模拟配置
	const { simulateConfig, updateSelectedAccount, updateLiveSelectedSymbols } =
		useUpdateLiveConfig({
			id,
			initialSimulateConfig: klineNodeData.simulateConfig,
		});

	useEffect(() => {
		if (connections.length === 1) {
			const startNodeId = connections[0].source;
			const startNodeNode = getNode(startNodeId);
			setConnectedStartNode(startNodeNode as StartNode);
		}
	}, [connections, getNode]);

	return (
		<div className="space-y-4">
			<DataSourceSelector
				startNode={connectedStartNode}
				tradeMode={TradeMode.SIMULATE}
				selectedAccount={simulateConfig?.selectedSimulateAccount}
				onAccountChange={updateSelectedSimulateAccount}
			/>
			<SymbolSelector
				selectedSymbols={simulateConfig?.selectedSymbols || []}
				onSymbolsChange={updateSimulateSelectedSymbols}
				selectedDataSource={simulateConfig?.selectedSimulateAccount}
			/>
		</div>
	);
};

export default KlineNodeSimSettingPanel;
