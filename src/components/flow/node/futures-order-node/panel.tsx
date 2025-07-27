import { Play } from "lucide-react";
import type { SettingPanelProps } from "@/components/flow/base/BasePanel/trade-mode-switcher";
import FuturesOrderNodeBacktestSettingPanel from "./setting-panel.tsx/backtest-setting-panel";
import FuturesOrderNodeLiveSettingPanel from "./setting-panel.tsx/live-setting-panel";
import FuturesOrderNodeSimSettingPanel from "./setting-panel.tsx/sim-setting-panel";

const FuturesOrderNodeSettingPanel: SettingPanelProps = {
	icon: Play,
	iconBackgroundColor: "bg-red-400",
	liveModeSettingPanel: FuturesOrderNodeLiveSettingPanel,
	backtestModeSettingPanel: FuturesOrderNodeBacktestSettingPanel,
	simulationModeSettingPanel: FuturesOrderNodeSimSettingPanel,
};

export default FuturesOrderNodeSettingPanel;
