
import type { SettingPanelProps } from "@/components/flow/base/BasePanel/trade-mode-switcher";
import VariableNodeBacktestSettingPanel from "./setting-panel/backtest-setting-panel";

const FuturesOrderNodeSettingPanel: SettingPanelProps = {
	backtestModeSettingPanel: VariableNodeBacktestSettingPanel,
};

export default FuturesOrderNodeSettingPanel;
