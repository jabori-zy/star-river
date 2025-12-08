import { Play } from "lucide-react";
import type { SettingPanelProps } from "@/components/flow/base/BasePanel/trade-mode-switcher";
import KlineNodeBacktestSettingPanel from "./backtest-setting-panel";

const KlineNodeSettingPanel: SettingPanelProps = {
	icon: Play,
	iconBackgroundColor: "bg-red-400",
	backtestModeSettingPanel: KlineNodeBacktestSettingPanel,
};

export default KlineNodeSettingPanel;
