import type { LucideIcon } from "lucide-react";
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useTradingModeStore from "@/store/use-trading-mode-store";
import type { NodeData } from "@/types/node/index";
import { TradeMode } from "@/types/strategy";
import type { SettingProps } from "./setting-panel";

export interface SettingPanelProps {
	icon: LucideIcon;
	iconBackgroundColor: string;
	liveModeSettingPanel: React.ComponentType<SettingProps> | React.ReactNode; // 实时模式设置面板
	backtestModeSettingPanel: React.ComponentType<SettingProps> | React.ReactNode; // 回测模式设置面板
	simulationModeSettingPanel: React.ComponentType<SettingProps> |React.ReactNode; // 模拟模式设置面板
}

interface TradeModeSwitcherProps {
	id?: string; // 节点ID
	data?: NodeData; // 节点数据
	settingPanel: SettingPanelProps; // 设置面板
}

/**
 * 交易模式切换器
 * 切换不同的tab，展示不同的内容
 */
const TradeModeSwitcher: React.FC<TradeModeSwitcherProps> = ({
	settingPanel,
	id,
	data,
}) => {
	const { tradingMode } = useTradingModeStore();

	// 渲染设置面板的辅助函数
	const renderSettingPanel = (
		panel: React.ComponentType<SettingProps> | React.ReactNode,
	) => {
		if (React.isValidElement(panel)) {
			// 如果是ReactNode，直接返回
			return panel;
		}

		if (typeof panel === "function") {
			// 如果是组件函数，传递props
			const PanelComponent = panel as React.ComponentType<SettingProps>;
			return <PanelComponent id={id || ""} data={data || ({} as NodeData)} />;
		}

		return null;
	};

	return (
		<Tabs className="h-full flex flex-col" defaultValue={tradingMode}>
			{/*
                flex-wrap: 换行
                h-auto: 高度自适应
            
            */}
			<TabsList className="flex flex-wrap h-10 gap-1 w-full px-2 flex-shrink-0">
				<TabsTrigger value={TradeMode.LIVE}>实时设置</TabsTrigger>
				<TabsTrigger value={TradeMode.BACKTEST}>回测设置</TabsTrigger>
				<TabsTrigger value={TradeMode.SIMULATE}>模拟设置</TabsTrigger>
			</TabsList>
			<TabsContent className="w-full flex-1 min-h-0" value="live">
				<ScrollArea className="h-full bg-white ">
					{renderSettingPanel(settingPanel.liveModeSettingPanel)}
				</ScrollArea>
			</TabsContent>
			<TabsContent className="w-full flex-1 min-h-0" value="backtest">
				<ScrollArea className="h-full bg-white ">
					{renderSettingPanel(settingPanel.backtestModeSettingPanel)}
				</ScrollArea>
			</TabsContent>
			<TabsContent className="w-full flex-1 min-h-0" value="simulation">
				<ScrollArea className="h-full bg-white ">
					{renderSettingPanel(settingPanel.simulationModeSettingPanel)}
				</ScrollArea>
			</TabsContent>
		</Tabs>
	);
};

export default TradeModeSwitcher;
