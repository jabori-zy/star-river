import { Play } from "lucide-react";
import type { SettingPanelProps } from "@/components/flow/base/BasePanel/trade-mode-switcher";
import IfElseNodeBacktestSettingPanel from "./setting-panel/backtest-setting-panel";

const IfElseNodeSettingPanel: SettingPanelProps = {
	icon: Play,
	iconBackgroundColor: "bg-red-400",
	backtestModeSettingPanel: IfElseNodeBacktestSettingPanel,
};

export default IfElseNodeSettingPanel;
