import { useNodeConnections, useReactFlow } from "@xyflow/react";
import { AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import type { SettingProps } from "@/components/flow/base/BasePanel/setting-panel";
import IndicatorEditor from "@/components/flow/node/indicator-node/components/indicator-editor";
import { useBacktestConfig } from "@/hooks/node-config/indicator-node";
import {
	getNodeDefaultInputHandleId,
	isDefaultOutputHandleId,
	NodeType,
} from "@/types/node/index";
import type { KlineNodeData, SelectedSymbol } from "@/types/node/kline-node";
import SymbolSelector from "../components/symbol-selector";


const IndicatorNodeBacktestSettingPanel: React.FC<SettingProps> = ({ id }) => {
	const connections = useNodeConnections({
		id,
		handleType: "target",
		handleId: getNodeDefaultInputHandleId(id, NodeType.IndicatorNode),
	});

	// Symbol list
	const [localSymbolList, setLocalSymbolList] = useState<SelectedSymbol[]>([]);

	const { getNode } = useReactFlow();

	// ✅ Use new version hook to manage backtest configuration
	const {
		backtestConfig,
		updateSelectedIndicators,
		updateSelectedSymbol,
		updateSelectedAccount,
	} = useBacktestConfig({ id });

	const exchangeModeConfig = backtestConfig?.exchangeModeConfig;

	useEffect(() => {
		for (const connection of connections) {
			const sourceNodeId = connection.source;
			const sourceHandleId = connection.sourceHandle;
			// Check if it's a default output handle
			if (!sourceHandleId) continue;
			const isDefaultOutput = isDefaultOutputHandleId(sourceHandleId);
			const node = getNode(sourceNodeId);
			// Skip if node doesn't exist
			if (!node) continue;

			const nodeType = node.type as NodeType;

			// Skip if not a kline node
			if (nodeType !== NodeType.KlineNode) continue;

			const klineNodeData = node.data as KlineNodeData;
			const selectedAccount =
				klineNodeData.backtestConfig?.exchangeModeConfig?.selectedAccount;
			if (selectedAccount) {
				updateSelectedAccount(selectedAccount);
			}

			const selectedSymbols =
				klineNodeData.backtestConfig?.exchangeModeConfig?.selectedSymbols;
			// If it's the default Handle, load all symbols
			if (isDefaultOutput) {
				// Default output: add all K-line variables
				if (selectedSymbols) {
					setLocalSymbolList(selectedSymbols);
				}
			} else {
				const selectedSymbol = selectedSymbols?.find(
					(symbol: SelectedSymbol) => symbol.outputHandleId === sourceHandleId,
				);
				if (selectedSymbol) {
					setLocalSymbolList([selectedSymbol]);
				}
			}
		}
	}, [connections, getNode, updateSelectedAccount]);

	const handleSymbolChange = (symbol: SelectedSymbol) => {
		console.log("handleSymbolChange", symbol);
		updateSelectedSymbol(symbol);
	};

	return (
		<div className="h-full overflow-y-auto bg-white">
			<div className="flex flex-col gap-4 p-2">
				{/* Connection status display */}
				{/* <div className="space-y-2">
					<Label className="flex items-center gap-2">
						<Activity className="h-4 w-4 text-muted-foreground" />
						Connection Status
					</Label>
					{isConnected ? (
						<Badge variant="secondary" className="bg-green-100 text-green-800">
							Connected to K-line node
						</Badge>
					) : (
						<Badge variant="destructive">Not connected</Badge>
					)}
				</div> */}
				<SymbolSelector
					symbolList={localSymbolList}
					selectedSymbol={exchangeModeConfig?.selectedSymbol || null}
					onSymbolChange={handleSymbolChange}
				/>
				{backtestConfig?.sourceSeriesLength !== undefined &&
					backtestConfig.sourceSeriesLength > 0 && (
						<div className="flex items-start gap-1.5 rounded-md bg-amber-50 px-2 py-1.5 text-xs text-amber-700">
							<AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
							<span>
								Source kline series length is{" "}
								<span className="font-semibold text-red-600">
									{backtestConfig.sourceSeriesLength}
								</span>
								. Indicator calculations are limited by this value.
							</span>
						</div>
					)}
				<IndicatorEditor
					id={id}
					selectedIndicators={exchangeModeConfig?.selectedIndicators || []}
					onSelectedIndicatorsChange={updateSelectedIndicators}
					sourceSeriesLength={backtestConfig?.sourceSeriesLength}
				/>
			</div>
		</div>
	);
};

export default IndicatorNodeBacktestSettingPanel;
