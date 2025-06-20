import IfElseNodeComponent from '@/components/flow/IfElseNode';
import IfElseNode from '@/components/flow/node/if-else-node/node';
import OrderNode from '@/components/flow/OrderNode';
import GetPositionNumberNode from '@/components/flow/GetPositionNumberNode';
import PositionNode from '@/components/flow/PositionNode';
import GetVariableNode from '@/components/flow/GetVariableNode';
import OldStartNode from '@/components/flow/node/start-node/node';
import IndicatorNode from '@/components/flow/node/indicator-node/node'; // 指标节点
import IndicatorNodeComponent from '@/components/flow/IndicatorNode'; // 指标节点
import KlineNodeComponent from '@/components/flow/KlineNode'; // 实时数据节点
import StartNode from '@/components/flow/node/start-node'; // 开始节点
import KlineNode from '@/components/flow/node/kline-node/node'; // 实时数据节点
import FuturesOrderNode from '@/components/flow/node/futures-order-node/node'; // 期货订单节点




export const nodeTypes = {
    oldStartNode: OldStartNode,
    oldKlineNode: KlineNodeComponent,
    oldIndicatorNode: IndicatorNodeComponent,
    oldIfElseNode: IfElseNodeComponent,
    
    
    

    orderNode: OrderNode,
    getPositionNumberNode: GetPositionNumberNode,
    positionNode: PositionNode,
    getVariableNode: GetVariableNode,
    startNode: StartNode,
    klineNode: KlineNode,
    indicatorNode: IndicatorNode,
    ifElseNode: IfElseNode,
    futuresOrderNode: FuturesOrderNode,
  };