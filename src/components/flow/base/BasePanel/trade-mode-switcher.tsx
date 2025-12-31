import { Construction } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import useTradingModeStore from "@/store/use-trading-mode-store";
import { TradeMode } from "@/types/strategy";
import type { SettingProps } from "./setting-panel";

export interface SettingPanelProps {
	liveModeSettingPanel?: React.ComponentType<SettingProps> | React.ReactNode; // Live mode settings panel
	backtestModeSettingPanel?:
		| React.ComponentType<SettingProps>
		| React.ReactNode; // Backtest mode settings panel
	simulationModeSettingPanel?:
		| React.ComponentType<SettingProps>
		| React.ReactNode; // Simulation mode settings panel
}

interface TradeModeSwitcherProps {
	id: string; // Node ID
	settingPanel: SettingPanelProps; // Settings panel
}

/**
 * Trade mode switcher
 * Switch different tabs to display different content
 */
const TradeModeSwitcher: React.FC<TradeModeSwitcherProps> = ({
	settingPanel,
	id,
}) => {
	const { tradingMode } = useTradingModeStore();
	const { t } = useTranslation();
	// Helper function to render settings panel
	const renderSettingPanel = (
		panel: React.ComponentType<SettingProps> | React.ReactNode,
	) => {
		if (React.isValidElement(panel)) {
			// If it's a ReactNode, return directly
			return panel;
		}

		if (typeof panel === "function") {
			// If it's a component function, pass props
			const PanelComponent = panel as React.ComponentType<SettingProps>;
			return <PanelComponent id={id} />;
		}

		return null;
	};

	return (
		<Tabs className="h-full flex flex-col" defaultValue={tradingMode}>
			{/*
                flex-wrap: wrap
                h-auto: auto height

            */}
			<TabsList className="flex flex-wrap h-10 gap-1 w-full px-2 shrink-0">
				<Tooltip>
					<TooltipTrigger asChild>
						<span className="flex-1">
							<TabsTrigger
								value={TradeMode.LIVE}
								disabled={true}
								className="w-full"
							>
								<Construction className="w-3.5 h-3.5 mr-1.5 text-yellow-500" />
								{t("strategy.workflow.liveSetting")}
							</TabsTrigger>
						</span>
					</TooltipTrigger>
					<TooltipContent>
						<p>In Developing...</p>
					</TooltipContent>
				</Tooltip>
				<TabsTrigger value={TradeMode.BACKTEST} className="flex-1">
					{t("strategy.workflow.backtestSetting")}
				</TabsTrigger>
				<Tooltip>
					<TooltipTrigger asChild>
						<span className="flex-1">
							<TabsTrigger
								value={TradeMode.SIMULATE}
								disabled={true}
								className="w-full"
							>
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
