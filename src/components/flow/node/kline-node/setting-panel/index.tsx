import { Play } from "lucide-react";
import type { SettingPanelProps } from "@/components/flow/base/BasePanel/trade-mode-switcher";
import KlineNodeBacktestSettingPanel from "./backtest-setting-panel";
import KlineNodeLiveSettingPanel from "./live-setting-panel";
import KlineNodeSimSettingPanel from "./sim-setting-panel";

const KlineNodeSettingPanel: SettingPanelProps = {
	icon: Play,
	iconBackgroundColor: "bg-red-400",
	liveModeSettingPanel: KlineNodeLiveSettingPanel,
	backtestModeSettingPanel: KlineNodeBacktestSettingPanel,
	simulationModeSettingPanel: KlineNodeSimSettingPanel,
};

export default KlineNodeSettingPanel;
