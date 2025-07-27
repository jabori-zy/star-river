import { Play } from "lucide-react";
import type { SettingPanelProps } from "@/components/flow/base/BasePanel/trade-mode-switcher";
import StartNodeBacktestSettingPanel from "./backtest-setting-panel";
import StartNodeLiveSettingPanel from "./live-setting-panel";
import StartNodeSimSettingPanel from "./sim-setting-panel";

const StartNodeSettingPanel: SettingPanelProps = {
	icon: Play,
	iconBackgroundColor: "bg-red-400",
	liveModeSettingPanel: StartNodeLiveSettingPanel,
	backtestModeSettingPanel: StartNodeBacktestSettingPanel,
	simulationModeSettingPanel: StartNodeSimSettingPanel,
};

export default StartNodeSettingPanel;
