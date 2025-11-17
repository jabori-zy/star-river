
import { Construction } from "lucide-react";
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import useTradingModeStore from "@/store/use-trading-mode-store";
import { TradeMode } from "@/types/strategy";
import type { SettingProps } from "./setting-panel";
import { useTranslation } from "react-i18next";

export interface SettingPanelProps {
	liveModeSettingPanel?: React.ComponentType<SettingProps> | React.ReactNode; // 实时模式设置面板
	backtestModeSettingPanel?: React.ComponentType<SettingProps> | React.ReactNode; // 回测模式设置面板
	simulationModeSettingPanel?: React.ComponentType<SettingProps> |React.ReactNode; // 模拟模式设置面板
}

interface TradeModeSwitcherProps {
	id: string; // 节点ID
	settingPanel: SettingPanelProps; // 设置面板
}

/**
 * 交易模式切换器
 * 切换不同的tab，展示不同的内容
 */
const TradeModeSwitcher: React.FC<TradeModeSwitcherProps> = ({
	settingPanel,
	id,
}) => {
	const { tradingMode } = useTradingModeStore();
	const { t } = useTranslation();
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
			return <PanelComponent id={id} />;
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
				<Tooltip>
					<TooltipTrigger asChild>
						<span className="flex-1">
							<TabsTrigger value={TradeMode.LIVE} disabled={true} className="w-full">
								<Construction className="w-3.5 h-3.5 mr-1.5 text-yellow-500" />
								{t("strategy.workflow.liveSetting")}
							</TabsTrigger>
						</span>
					</TooltipTrigger>
					<TooltipContent>
						<p>In Developing...</p>
					</TooltipContent>
				</Tooltip>
				<TabsTrigger value={TradeMode.BACKTEST} className="flex-1">{t("strategy.workflow.backtestSetting")}</TabsTrigger>
				<Tooltip>
					<TooltipTrigger asChild>
						<span className="flex-1">
							<TabsTrigger value={TradeMode.SIMULATE} disabled={true} className="w-full">
								<Construction className="w-3.5 h-3.5 mr-1.5 text-yellow-500" />
								{t("strategy.workflow.simulateSetting")}
							</TabsTrigger>
						</span>
					</TooltipTrigger>
					<TooltipContent>
						<p>In Developing...</p>
					</TooltipContent>
				</Tooltip>
			</TabsList>
			<TabsContent className="w-full flex-1 min-h-0" value="live">
					{renderSettingPanel(settingPanel.liveModeSettingPanel)}
			</TabsContent>
			<TabsContent className="w-full flex-1 min-h-0" value="backtest">
				{renderSettingPanel(settingPanel.backtestModeSettingPanel)}
			</TabsContent>
			<TabsContent className="w-full flex-1 min-h-0" value="simulation">
				{renderSettingPanel(settingPanel.simulationModeSettingPanel)}
			</TabsContent>
		</Tabs>
	);
};

export default TradeModeSwitcher;
