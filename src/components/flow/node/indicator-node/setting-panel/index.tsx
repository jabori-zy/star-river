import { SettingPanelProps } from '@/components/flow/base/BasePanel/trade-mode-switcher';
import IndicatorNodeLiveSettingPanel from './live-setting-panel';
import IndicatorNodeBacktestSettingPanel from './backtest-setting-panel';
import IndicatorNodeSimSettingPanel from './sim-setting-panel';
import { Play } from 'lucide-react';

const IndicatorNodeSettingPanel: SettingPanelProps = {
    icon: Play,
    iconBackgroundColor: 'bg-red-400',
    liveModeSettingPanel: IndicatorNodeLiveSettingPanel,
    backtestModeSettingPanel: IndicatorNodeBacktestSettingPanel,
    simulationModeSettingPanel: IndicatorNodeSimSettingPanel
}

export default IndicatorNodeSettingPanel;