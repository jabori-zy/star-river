import { Play } from "lucide-react";
import type { SettingPanelProps } from "@/components/flow/base/BasePanel/trade-mode-switcher";
import FuturesOrderNodeBacktestSettingPanel from "./setting-panel.tsx/backtest-setting-panel";

const FuturesOrderNodeSettingPanel: SettingPanelProps = {
	icon: Play,
	iconBackgroundColor: "bg-red-400",
	backtestModeSettingPanel: FuturesOrderNodeBacktestSettingPanel,
};

export default FuturesOrderNodeSettingPanel;
