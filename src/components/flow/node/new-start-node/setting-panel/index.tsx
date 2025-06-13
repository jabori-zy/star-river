import { SettingPanelProps } from '@/components/flow/base/BasePanel/trade-mode-switcher';
import NewStartNodeLiveSettingPanel from './live-setting-panel';
import NewStartNodeBacktestSettingPanel from './backtest-setting-panel';
import NewStartNodeSimSettingPanel from './sim-setting-panel';
import { Play } from 'lucide-react';

const NewStartNodeSettingPanel: SettingPanelProps = {
    icon: Play,
    iconBackgroundColor: 'bg-red-400',
    liveModeSettingPanel: NewStartNodeLiveSettingPanel,
    backtestModeSettingPanel: NewStartNodeBacktestSettingPanel,
    simulationModeSettingPanel: NewStartNodeSimSettingPanel
}

export default NewStartNodeSettingPanel;