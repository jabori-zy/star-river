import { Play } from "lucide-react";
import type { SettingPanelProps } from "@/components/flow/base/BasePanel/trade-mode-switcher";
import StartNodeBacktestSettingPanel from "./backtest-setting-panel";


const StartNodeSettingPanel: SettingPanelProps = {
	icon: Play,
	iconBackgroundColor: "bg-red-400",
	backtestModeSettingPanel: StartNodeBacktestSettingPanel,
};

export default StartNodeSettingPanel;
