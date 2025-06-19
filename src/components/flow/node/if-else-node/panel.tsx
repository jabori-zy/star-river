import { SettingPanelProps } from '@/components/flow/base/BasePanel/trade-mode-switcher';
import IfElseNodeLiveSettingPanel from './setting-panel/live-setting-panel';
import IfElseNodeBacktestSettingPanel from './setting-panel/backtest-setting-panel';
import IfElseNodeSimSettingPanel from './setting-panel/sim-setting-panel';
import { Play } from 'lucide-react';

const IfElseNodeSettingPanel: SettingPanelProps = {
    icon: Play,
    iconBackgroundColor: 'bg-red-400',
    liveModeSettingPanel: IfElseNodeLiveSettingPanel,
    backtestModeSettingPanel: IfElseNodeBacktestSettingPanel,
    simulationModeSettingPanel: IfElseNodeSimSettingPanel
}

export default IfElseNodeSettingPanel;