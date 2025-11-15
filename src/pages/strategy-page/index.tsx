import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import useStrategyEventSSE from "@/hooks/use-strategyEventSSE";
import { getStrategyById } from "@/service/strategy";
import { useHeaderStore } from "@/store/useHeaderStore";
import { useStrategyStore } from "@/store/useStrategyStore";
import StrategyChartContent from "./chart";
import StrategyFlowContent from "./flow";

function StrategyPageMainContent() {
	const location = useLocation();
	//策略的id
	const strategyId = location.state?.strategyId;
	const { strategy, setStrategy } = useStrategyStore();
	// 活跃的tab
	const [activeTab, setActiveTab] = useState("flow");
	const { setCenterContent } = useHeaderStore();

	useEffect(() => {
		// 获取策略信息
		getStrategyById(strategyId).then((data) => {
			setStrategy(data);
		});
	}, [strategyId, setStrategy]);

	// 设置头部中心内容
	useEffect(() => {
		const tabsContent = (
			<Tabs
				defaultValue="flow"
				value={activeTab}
				onValueChange={setActiveTab}
				className="w-full max-w-md"
			>
				<TabsList className="h-7 mt-1 p-0.5">
					<TabsTrigger value="flow" className="h-6 px-3 text-xs">
						策略节点
					</TabsTrigger>
					<TabsTrigger value="chart" className="h-6 px-3 text-xs">
						图表
					</TabsTrigger>
				</TabsList>
			</Tabs>
		);

		setCenterContent(tabsContent);

		// 组件卸载时清除头部内容
		return () => {
			setCenterContent(null);
		};
	}, [activeTab, setCenterContent]);

	return (
		<div className="h-screen flex flex-col bg-background overflow-hidden">
			<div
				className="flex-1 overflow-hidden relative"
				style={{ height: "calc(100vh - 40px)" }}
			>
				<Tabs
					value={activeTab}
					onValueChange={setActiveTab}
					className="h-full flex flex-col"
				>
					<TabsContent
						value="flow"
						className="h-full flex-1 overflow-hidden mt-0 inset-0"
					>
						{/* 高度改为窗口高度-40px */}

						<StrategyFlowContent strategyId={strategyId} strategy={strategy!} />
					</TabsContent>

					<TabsContent
						value="chart"
						className="h-full flex-1 overflow-hidden mt-0 absolute inset-0"
					>
						<div className="h-full w-full overflow-hidden">
							<StrategyChartContent strategyId={strategyId} />
						</div>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}

export default function StrategyPage() {
	return <StrategyPageMainContent />;
}
