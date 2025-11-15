import { Play } from "lucide-react";
import type { SettingPanelProps } from "@/components/flow/base/BasePanel/trade-mode-switcher";
import PositionManagementNodeBacktestSettingPanel from "./setting-panel/backtest-setting-panel";

const PositionManagementNodeSettingPanel: SettingPanelProps = {
	icon: Play,
	iconBackgroundColor: "bg-red-400",
	backtestModeSettingPanel: PositionManagementNodeBacktestSettingPanel,
};

export default PositionManagementNodeSettingPanel;
