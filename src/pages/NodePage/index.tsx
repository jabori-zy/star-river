import { ReactFlowProvider } from '@xyflow/react';
import { DragAndDropProvider } from "./DragAndDropContext";
import { Header } from './components/Header';
import NodeFlow from "./NodeFlow";
import { NodeList } from "./NodeList";
import { useLocation } from "react-router";
import { useState, useEffect } from "react";
import { Strategy } from "@/types/strategy";

async function getStrategyById(strategyId: number) {
  const response = await fetch(`http://localhost:3100/get_strategy?id=${strategyId}`);
  const data = await response.json();
  console.log(data.data);
  return data.data;
}



function NodePageContent() {
  const location = useLocation();
  //策略的id
  const strategyId = location.state?.strategyId || 1;
  //策略的名称
  const strategyName = location.state?.strategyName || "未命名策略";
  //策略的描述
  const strategyDescription = location.state?.description || "";

  const [strategy, setStrategy] = useState<Strategy | null>(null);

  useEffect(() => {
    getStrategyById(strategyId).then((data) => {
      setStrategy(data);
    });
  }, [strategyId]);

  return (
    <div className="h-screen flex flex-col bg-background">
      <Header strategyId={strategyId} strategyName={strategyName} strategyDescription={strategyDescription} />
      
      <div className="flex flex-1 overflow-hidden">
        <div className="border-2 border-gray-200 rounded-lg">
          <NodeList />
        </div>
        <div className="flex-1 border-2 border-gray-200 rounded-lg">
          {strategy && <NodeFlow strategy={strategy} />}
        </div>
      </div>
    </div>
  );
}

export default function NodePage() {
  return (
    <ReactFlowProvider>
      <DragAndDropProvider>
        <NodePageContent />
      </DragAndDropProvider>
    </ReactFlowProvider>
  );
}

