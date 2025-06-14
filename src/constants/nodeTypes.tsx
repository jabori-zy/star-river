import IfElseNode from '@/components/flow/IfElseNode';
import OrderNode from '@/components/flow/OrderNode';
import GetPositionNumberNode from '@/components/flow/GetPositionNumberNode';
import PositionNode from '@/components/flow/PositionNode';
import GetVariableNode from '@/components/flow/GetVariableNode';
import OldStartNode from '@/components/flow/node/start-node/node';
import IndicatorNode from '@/components/flow/IndicatorNode'; // 指标节点
import KlineNode from '@/components/flow/KlineNode'; // 实时数据节点
import StartNode from '@/components/flow/node/start-node'; // 开始节点



export const nodeTypes = {
    oldStartNode: OldStartNode,
    indicatorNode: IndicatorNode,
    klineNode: KlineNode,
    ifElseNode: IfElseNode,
    orderNode: OrderNode,
    getPositionNumberNode: GetPositionNumberNode,
    positionNode: PositionNode,
    getVariableNode: GetVariableNode,
    startNode: StartNode,
  };