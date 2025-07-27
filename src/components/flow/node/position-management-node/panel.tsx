import { Play } from "lucide-react";
import type { SettingPanelProps } from "@/components/flow/base/BasePanel/trade-mode-switcher";
import PositionManagementNodeBacktestSettingPanel from "./setting-panel/backtest-setting-panel";
import PositionManagementNodeLiveSettingPanel from "./setting-panel/live-setting-panel";
import PositionManagementNodeSimSettingPanel from "./setting-panel/sim-setting-panel";

const FuturesOrderNodeSettingPanel: SettingPanelProps = {
	icon: Play,
	iconBackgroundColor: "bg-red-400",
	liveModeSettingPanel: PositionManagementNodeLiveSettingPanel,
	backtestModeSettingPanel: PositionManagementNodeBacktestSettingPanel,
	simulationModeSettingPanel: PositionManagementNodeSimSettingPanel,
};

export default FuturesOrderNodeSettingPanel;
