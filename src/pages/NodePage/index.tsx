import { ReactFlowProvider } from '@xyflow/react';
import { DragAndDropProvider } from "./DragAndDropContext";
import { Header } from './components/Header';
import NodeFlow from "./NodeFlow";
import { NodeList } from "./NodeList";
import { useLocation } from "react-router";
import { useEffect } from "react";
import { StrategyMessageProvider } from "./StrategyMessageContext";
import { useStrategyStore } from "@/store/useStrategyStore";
import { getStrategyById } from "@/service/strategy";

// async function getStrategyById(strategyId: number) {
//   const response = await fetch(`http://localhost:3100/get_strategy?id=${strategyId}`);
//   const data = await response.json();
//   console.log("接口获取的原始策略数据", data.data);
//   const strategy: Strategy = {
//     id: data.data["id"],
//     name: data.data["name"],
//     description: data.data["description"],
//     isDeleted: data.data["is_deleted"],
//     tradeMode: data.data["trade_mode"],
//     config: data.data["config"],
//     nodes: data.data["nodes"],
//     edges: data.data["edges"],
//     status: data.data["status"],
//     createTime: data.data["created_time"],
//     updateTime: data.data["updated_time"]
//   }
//   console.log("解析后的策略", strategy);
//   return strategy;
// }



function NodePageContent() {
  const location = useLocation();
  //策略的id
  const strategyId = location.state?.strategyId;

  const {strategy, setStrategy} = useStrategyStore();

  useEffect(() => {
    getStrategyById(strategyId).then((data) => {
      setStrategy(data);
    });
  }, [strategyId, setStrategy]);

  return (
    <div className="h-screen flex flex-col bg-background">
      <Header strategy={strategy!} setStrategy={setStrategy} />
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
  const location = useLocation();
  const strategyId = location.state?.strategyId;
  return (
    <ReactFlowProvider>
      <DragAndDropProvider>
        <StrategyMessageProvider strategyId={strategyId}>
          <NodePageContent />
        </StrategyMessageProvider>
      </DragAndDropProvider>
    </ReactFlowProvider>
  );
}

