import { SettingPanelProps } from "@/components/flow/base/BasePanel/trade-mode-switcher";
import StartNodeLiveSettingPanel from "./live-setting-panel";
import StartNodeBacktestSettingPanel from "./backtest-setting-panel";
import StartNodeSimSettingPanel from "./sim-setting-panel";
import { Play } from "lucide-react";

const StartNodeSettingPanel: SettingPanelProps = {
	icon: Play,
	iconBackgroundColor: "bg-red-400",
	liveModeSettingPanel: StartNodeLiveSettingPanel,
	backtestModeSettingPanel: StartNodeBacktestSettingPanel,
	simulationModeSettingPanel: StartNodeSimSettingPanel,
};

export default StartNodeSettingPanel;
