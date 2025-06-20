import StartNodeSettingPanel from '../node/start-node/setting-panel';
import KlineNodeSettingPanel from '../node/kline-node/setting-panel';
import IndicatorNodeSettingPanel from '../node/indicator-node/setting-panel';
import { IfElseNodeSettingPanel } from '../node/if-else-node';
import { SettingPanelProps } from '../base/BasePanel/trade-mode-switcher';
import { NodeType } from '@/types/node/index';
import { FuturesOrderNodeSettingPanel } from '../node/futures-order-node';

/**
 * 面板组件映射表 - 类似dify的PanelComponentMap
 * 每个节点类型对应三种交易模式的面板组件
 */
export const PanelComponentMap: Partial<Record<NodeType, SettingPanelProps>> = {
  [NodeType.StartNode]: StartNodeSettingPanel,
  [NodeType.KlineNode]: KlineNodeSettingPanel,
  [NodeType.IndicatorNode]: IndicatorNodeSettingPanel,
  [NodeType.IfElseNode]: IfElseNodeSettingPanel,
  [NodeType.FuturesOrderNode]: FuturesOrderNodeSettingPanel
};

