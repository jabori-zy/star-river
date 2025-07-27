import { Play } from "lucide-react";
import type { SettingPanelProps } from "@/components/flow/base/BasePanel/trade-mode-switcher";
import IfElseNodeBacktestSettingPanel from "./setting-panel/backtest-setting-panel";
import IfElseNodeLiveSettingPanel from "./setting-panel/live-setting-panel";
import IfElseNodeSimSettingPanel from "./setting-panel/sim-setting-panel";

const IfElseNodeSettingPanel: SettingPanelProps = {
	icon: Play,
	iconBackgroundColor: "bg-red-400",
	liveModeSettingPanel: IfElseNodeLiveSettingPanel,
	backtestModeSettingPanel: IfElseNodeBacktestSettingPanel,
	simulationModeSettingPanel: IfElseNodeSimSettingPanel,
};

export default IfElseNodeSettingPanel;
