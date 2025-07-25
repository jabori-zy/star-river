import { SettingPanelProps } from "@/components/flow/base/BasePanel/trade-mode-switcher";
import PositionManagementNodeLiveSettingPanel from "./setting-panel/live-setting-panel";
import PositionManagementNodeBacktestSettingPanel from "./setting-panel/backtest-setting-panel";
import PositionManagementNodeSimSettingPanel from "./setting-panel/sim-setting-panel";
import { Play } from "lucide-react";

const FuturesOrderNodeSettingPanel: SettingPanelProps = {
	icon: Play,
	iconBackgroundColor: "bg-red-400",
	liveModeSettingPanel: PositionManagementNodeLiveSettingPanel,
	backtestModeSettingPanel: PositionManagementNodeBacktestSettingPanel,
	simulationModeSettingPanel: PositionManagementNodeSimSettingPanel,
};

export default FuturesOrderNodeSettingPanel;
