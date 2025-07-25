import { SettingPanelProps } from "@/components/flow/base/BasePanel/trade-mode-switcher";
import VariableNodeLiveSettingPanel from "./setting-panel/live-setting-panel";
import VariableNodeBacktestSettingPanel from "./setting-panel/backtest-setting-panel";
import VariableNodeSimSettingPanel from "./setting-panel/sim-setting-panel";
import { Play } from "lucide-react";

const FuturesOrderNodeSettingPanel: SettingPanelProps = {
	icon: Play,
	iconBackgroundColor: "bg-red-400",
	liveModeSettingPanel: VariableNodeLiveSettingPanel,
	backtestModeSettingPanel: VariableNodeBacktestSettingPanel,
	simulationModeSettingPanel: VariableNodeSimSettingPanel,
};

export default FuturesOrderNodeSettingPanel;
