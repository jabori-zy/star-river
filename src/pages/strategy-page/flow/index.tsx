import { ReactFlowProvider } from "@xyflow/react";
import { useStrategyStore } from "@/store/useStrategyStore";
import type { Strategy } from "@/types/strategy";
import { Header } from "../components/header";
import StrategyFlow from "./strategy-flow";

interface StrategyFlowContentProps {
	strategyId: number;
	strategy: Strategy;
}

export default function StrategyFlowContent({
	strategyId,
	strategy,
}: StrategyFlowContentProps) {
	const { setStrategy } = useStrategyStore();

	return (
		<ReactFlowProvider>
			<div className="flex flex-col h-full w-full">
				<Header strategy={strategy} setStrategy={setStrategy} />
				<div className="flex-1 h-full w-full overflow-hidden">
					{strategy && <StrategyFlow strategyId={strategyId} strategy={strategy} />}
				</div>
			</div>
		</ReactFlowProvider>
	);
}
