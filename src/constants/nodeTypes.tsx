import IfElseNode from '@/components/node/IfElseNode';
import OrderNode from '@/components/node/OrderNode';
import GetPositionNumberNode from '@/components/node/GetPositionNumberNode';
import PositionNode from '@/components/node/PositionNode';
import GetVariableNode from '@/components/node/GetVariableNode';
import ExampleNode from '@/components/node/base/BaseNode/example';
import NewStartNode from '@/components/node/base/BaseNode/newStartNode';
import IndicatorNode from '@/components/node/IndicatorNode'; // 指标节点
import KlineNode from '@/components/node/KlineNode'; // 实时数据节点
import StartNode from '@/components/node/StartNode'; // 开始节点



export const nodeTypes = {
    startNode: StartNode,
    indicatorNode: IndicatorNode,
    klineNode: KlineNode,
    ifElseNode: IfElseNode,
    orderNode: OrderNode,
    getPositionNumberNode: GetPositionNumberNode,
    positionNode: PositionNode,
    getVariableNode: GetVariableNode,
    exampleNode: ExampleNode,
    newStartNode: NewStartNode,
  };