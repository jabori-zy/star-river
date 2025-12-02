import { useReactFlow } from "@xyflow/react";
import { useCallback } from "react";
import type { UpdateStrategyRequest } from "@/service/strategy-management/update-strategy";
import type { Strategy, StrategyRunState, TradeMode } from "@/types/strategy";
import StrategyPageHeader from "../header";
import type { OperationType } from "../strategy-control/type";
import StrategyFlow from "./strategy-flow";

interface WorkFlowProps {
	strategy: Strategy;
	saveStatus: "saved" | "unsaved" | "saving";
	handleStrategyChange: (updates: Partial<Strategy>) => void;
	updateStrategy: (params: UpdateStrategyRequest) => void;
	strategyRunState: StrategyRunState;
	tradeMode: TradeMode;
	handleSaveStatusChange: (saveStatus: "saved" | "unsaved" | "saving") => void;
	onOperationSuccess?: (operationType: OperationType) => void;
}

export function WorkFlow({
	strategy,
	saveStatus,
	handleStrategyChange,
	updateStrategy,
	strategyRunState,
	tradeMode,
	handleSaveStatusChange,
	onOperationSuccess,
}: WorkFlowProps) {
	const { getNodes, getEdges } = useReactFlow();

	const handleSave = useCallback(() => {
		const nodes = getNodes();
		const edges = getEdges();

		updateStrategy({
			strategyId: strategy.id,
			name: strategy.name,
			description: strategy.description,
			tradeMode: tradeMode,
			nodes,
			edges,
		});
	}, [getNodes, getEdges, updateStrategy, strategy, tradeMode]);

	return (
		<>
			<StrategyPageHeader
				strategy={strategy}
				tradeMode={tradeMode}
				saveStatus={saveStatus}
				onSave={handleSave}
				onStrategyChange={handleStrategyChange}
				strategyRunState={strategyRunState}
				onOperationSuccess={onOperationSuccess}
			/>

			<div className="flex flex-col h-full w-full">
				<div className="flex-1 h-full w-full overflow-hidden">
					<StrategyFlow
						strategy={strategy}
						onSaveStatusChange={handleSaveStatusChange}
					/>
				</div>
			</div>
		</>
	);
}
