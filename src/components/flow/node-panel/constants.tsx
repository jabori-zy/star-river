import { NodeType } from "@/types/node/index";
import type { SettingPanelProps } from "../base/BasePanel/trade-mode-switcher";
import { FuturesOrderNodeSettingPanel } from "../node/futures-order-node";
import { IfElseNodeSettingPanel } from "../node/if-else-node";
import IndicatorNodeSettingPanel from "../node/indicator-node/setting-panel";
import KlineNodeSettingPanel from "../node/kline-node/setting-panel";
import { PositionNodeSettingPanel } from "../node/position-node";
import StartNodeSettingPanel from "../node/start-node/setting-panel";
import { VariableNodeSettingPanel } from "../node/variable-node";

/**
 * 面板组件映射表 - 类似dify的PanelComponentMap
 * 每个节点类型对应三种交易模式的面板组件
 */
export const PanelComponentMap: Partial<Record<NodeType, SettingPanelProps>> = {
	[NodeType.StartNode]: StartNodeSettingPanel,
	[NodeType.KlineNode]: KlineNodeSettingPanel,
	[NodeType.IndicatorNode]: IndicatorNodeSettingPanel,
	[NodeType.IfElseNode]: IfElseNodeSettingPanel,
	[NodeType.FuturesOrderNode]: FuturesOrderNodeSettingPanel,
	[NodeType.PositionNode]: PositionNodeSettingPanel,
	[NodeType.VariableNode]: VariableNodeSettingPanel,
};
