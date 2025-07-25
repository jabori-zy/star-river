import { SettingPanelProps } from "@/components/flow/base/BasePanel/trade-mode-switcher";
import KlineNodeLiveSettingPanel from "./live-setting-panel";
import KlineNodeBacktestSettingPanel from "./backtest-setting-panel";
import KlineNodeSimSettingPanel from "./sim-setting-panel";
import { Play } from "lucide-react";

const KlineNodeSettingPanel: SettingPanelProps = {
	icon: Play,
	iconBackgroundColor: "bg-red-400",
	liveModeSettingPanel: KlineNodeLiveSettingPanel,
	backtestModeSettingPanel: KlineNodeBacktestSettingPanel,
	simulationModeSettingPanel: KlineNodeSimSettingPanel,
};

export default KlineNodeSettingPanel;
