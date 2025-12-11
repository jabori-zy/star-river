
import type { SettingPanelProps } from "@/components/flow/base/BasePanel/trade-mode-switcher";
import IfElseNodeBacktestSettingPanel from "./setting-panel/backtest-setting-panel";

const IfElseNodeSettingPanel: SettingPanelProps = {
	backtestModeSettingPanel: IfElseNodeBacktestSettingPanel,
};

export default IfElseNodeSettingPanel;
