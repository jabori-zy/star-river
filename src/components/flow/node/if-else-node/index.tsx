


import { SelectedSymbol } from '@/types/node/kline-node';
import IfElseNode from './node';
import IfElseNodeSettingPanel from './panel';
import { NodeType } from '@/types/node/index';
import { SelectedIndicator } from '@/types/node/indicator-node';


export interface VariableItem {
    nodeId: string;
    nodeName: string;
    nodeType: NodeType;
    variables: (SelectedIndicator|SelectedSymbol)[]; // 可以包含指标节点和K线节点
}




export { IfElseNode, IfElseNodeSettingPanel };