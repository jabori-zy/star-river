import NewStartNodeSettingPanel from '../node/new-start-node/setting-panel';
import { SettingPanelProps } from '../base/BasePanel/trade-mode-switcher';
import { NodeType } from '@/types/node/index';

/**
 * 交易模式枚举
 */
export enum TradeModeEnum {
  Live = 'live',
  Backtest = 'backtest', 
  Simulation = 'simulation'
}

/**
 * 面板组件映射表 - 类似dify的PanelComponentMap
 * 每个节点类型对应三种交易模式的面板组件
 */
export const PanelComponentMap: Partial<Record<NodeType, SettingPanelProps>> = {
  [NodeType.NewStartNode]: NewStartNodeSettingPanel
};

