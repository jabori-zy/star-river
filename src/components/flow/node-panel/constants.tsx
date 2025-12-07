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
 * Panel component mapping table - similar to dify's PanelComponentMap
 * Each node type corresponds to three trading mode panel components
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
