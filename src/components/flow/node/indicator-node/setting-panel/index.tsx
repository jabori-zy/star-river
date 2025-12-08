import { Play } from "lucide-react";
import type { SettingPanelProps } from "@/components/flow/base/BasePanel/trade-mode-switcher";
import IndicatorNodeBacktestSettingPanel from "./backtest-setting-panel";

const IndicatorNodeSettingPanel: SettingPanelProps = {
	icon: Play,
	iconBackgroundColor: "bg-red-400",
	backtestModeSettingPanel: IndicatorNodeBacktestSettingPanel,
};

export default IndicatorNodeSettingPanel;
