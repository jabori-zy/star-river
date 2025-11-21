import type { SettingPanelProps } from "@/components/flow/base/BasePanel/trade-mode-switcher";
import PositionNodeBacktestSettingPanel from "./setting-panel/backtest-setting-panel";

const PositionNodeSettingPanel: SettingPanelProps = {
	backtestModeSettingPanel: PositionNodeBacktestSettingPanel,
};

export default PositionNodeSettingPanel;
