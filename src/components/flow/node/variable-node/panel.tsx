import { Play } from "lucide-react";
import type { SettingPanelProps } from "@/components/flow/base/BasePanel/trade-mode-switcher";
import VariableNodeBacktestSettingPanel from "./setting-panel/backtest-setting-panel";
import VariableNodeLiveSettingPanel from "./setting-panel/live-setting-panel";
import VariableNodeSimSettingPanel from "./setting-panel/sim-setting-panel";

const FuturesOrderNodeSettingPanel: SettingPanelProps = {
	icon: Play,
	iconBackgroundColor: "bg-red-400",
	liveModeSettingPanel: VariableNodeLiveSettingPanel,
	backtestModeSettingPanel: VariableNodeBacktestSettingPanel,
	simulationModeSettingPanel: VariableNodeSimSettingPanel,
};

export default FuturesOrderNodeSettingPanel;
