import { StrategyMessageProvider } from "./StrategyMessageContext";
import { useLocation } from "react-router";
import { useEffect, useState } from "react";
import { useStrategyStore } from "@/store/useStrategyStore";
import { getStrategyById } from "@/service/strategy";
import { Header } from './components/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StrategyFlowContent from "./flow";
import StrategyChartContent from "./chart";

function StrategyNodeContent() {
  const location = useLocation();
  //策略的id
  const strategyId = location.state?.strategyId;
  const {strategy, setStrategy} = useStrategyStore();
  const [activeTab, setActiveTab] = useState("flow");

  useEffect(() => {
    getStrategyById(strategyId).then((data) => {
      setStrategy(data);
    });
  }, [strategyId, setStrategy]);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Header strategy={strategy!} setStrategy={setStrategy}>
        <Tabs defaultValue="flow" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="flow">策略节点</TabsTrigger>
            <TabsTrigger value="chart">图表</TabsTrigger>
          </TabsList>
        </Tabs>
      </Header>
      
      <div className="flex-1 overflow-hidden relative" style={{ height: "calc(100vh - 100px)" }}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsContent value="flow" className="h-full flex-1 overflow-hidden mt-0 absolute inset-0">
            <div className="h-full w-full overflow-hidden">
              <StrategyFlowContent strategy={strategy!} />
            </div>
          </TabsContent>
          
          <TabsContent value="chart" className="h-full flex-1 overflow-hidden mt-0 absolute inset-0">
            <div className="h-full w-full overflow-hidden">
              <StrategyChartContent />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function StrategyPage() {
  const location = useLocation();
  const strategyId = location.state?.strategyId;
  
  return (
    <StrategyMessageProvider strategyId={strategyId}>
      <StrategyNodeContent />
    </StrategyMessageProvider>
  );
}

