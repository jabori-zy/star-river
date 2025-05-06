import { NodeList } from "./NodeList";
import NodeFlow from "./NodeFlow";
import { Strategy } from "@/types/strategy";
import { ReactFlowProvider } from '@xyflow/react';
import { DragAndDropProvider } from "../DragAndDropContext";
import { StrategyControls } from "../components/StrategyControls";
import { useStrategyStore } from "@/store/useStrategyStore";

interface StrategyFlowContentProps {
  strategy: Strategy;
}

export default function StrategyFlowContent({ strategy }: StrategyFlowContentProps) {
  const { setStrategy } = useStrategyStore();

  return (
    <ReactFlowProvider>
      <DragAndDropProvider>
        <div className="flex flex-col h-full w-full overflow-hidden">
          <StrategyControls strategy={strategy} setStrategy={setStrategy} />
          <div className="flex flex-1 h-full w-full overflow-hidden">
            <div className="h-full border-2 border-gray-200 rounded-lg">
              <NodeList />
            </div>
            <div className="flex-1 h-full border-2 border-gray-200 rounded-lg">
              {strategy && <NodeFlow strategy={strategy} />}
            </div>
          </div>
        </div>
      </DragAndDropProvider>
    </ReactFlowProvider>
  );
} 