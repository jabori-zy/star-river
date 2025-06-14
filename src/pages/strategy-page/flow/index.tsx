import NodeFlow from "./NodeFlow";
import { Strategy } from "@/types/strategy";
import { ReactFlowProvider } from '@xyflow/react';
import { useStrategyStore } from "@/store/useStrategyStore";
import { Header } from "../components/header";

interface StrategyFlowContentProps {
  strategy: Strategy;
}

export default function StrategyFlowContent({ strategy }: StrategyFlowContentProps) {
  const { setStrategy } = useStrategyStore();

  return (
    <ReactFlowProvider>
        <div className="flex flex-col h-full w-full">
          <Header strategy={strategy} setStrategy={setStrategy} />
          <div className="flex-1 h-full w-full overflow-hidden">
            {strategy && <NodeFlow strategy={strategy} />}
          </div>
        </div>
    </ReactFlowProvider>
  );
} 