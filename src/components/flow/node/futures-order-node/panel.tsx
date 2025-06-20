


import { SettingPanelProps } from '@/components/flow/base/BasePanel/trade-mode-switcher';
import FuturesOrderNodeLiveSettingPanel from './setting-panel.tsx/live-setting-panel';
import FuturesOrderNodeBacktestSettingPanel from './setting-panel.tsx/backtest-setting-panel';
import FuturesOrderNodeSimSettingPanel from './setting-panel.tsx/sim-setting-panel';
import { Play } from 'lucide-react';

const FuturesOrderNodeSettingPanel: SettingPanelProps = {
    icon: Play,
    iconBackgroundColor: 'bg-red-400',
    liveModeSettingPanel: FuturesOrderNodeLiveSettingPanel,
    backtestModeSettingPanel: FuturesOrderNodeBacktestSettingPanel,
    simulationModeSettingPanel: FuturesOrderNodeSimSettingPanel
}

export default FuturesOrderNodeSettingPanel;