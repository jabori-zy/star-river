import { Play } from "lucide-react";
import type { SettingPanelProps } from "@/components/flow/base/BasePanel/trade-mode-switcher";
import IndicatorNodeBacktestSettingPanel from "./backtest-setting-panel";
import IndicatorNodeLiveSettingPanel from "./live-setting-panel";
import IndicatorNodeSimSettingPanel from "./sim-setting-panel";

const IndicatorNodeSettingPanel: SettingPanelProps = {
	icon: Play,
	iconBackgroundColor: "bg-red-400",
	liveModeSettingPanel: IndicatorNodeLiveSettingPanel,
	backtestModeSettingPanel: IndicatorNodeBacktestSettingPanel,
	simulationModeSettingPanel: IndicatorNodeSimSettingPanel,
};

export default IndicatorNodeSettingPanel;
