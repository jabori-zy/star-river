import { Play } from "lucide-react";
import type { SettingPanelProps } from "@/components/flow/base/BasePanel/trade-mode-switcher";
import VariableNodeBacktestSettingPanel from "./setting-panel/backtest-setting-panel";

const FuturesOrderNodeSettingPanel: SettingPanelProps = {
	icon: Play,
	iconBackgroundColor: "bg-red-400",
	backtestModeSettingPanel: VariableNodeBacktestSettingPanel,
};

export default FuturesOrderNodeSettingPanel;
