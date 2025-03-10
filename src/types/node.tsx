import {Node} from '@xyflow/react'


// 所有可能的节点数据类型
export type NodeItemProps = {
    nodeId: string;
    nodeType: string;
    nodeName: string;
    nodeDescription: string;
    nodeColor: string;
    nodeData: LiveDataNodeData | SMAIndicatorNodeData;
};

type LiveDataNodeData = {
  exchange: string | null;
  symbol: string | null;
  interval: string | null;
};

type SMAIndicatorNodeData = {
  indicatorName: string | null;
  indicatorConfig: {
    period: number | null;
  };
};







// node定义
export type LiveDataNode = Node<
  {
    exchange: string;
    symbol: string;
    interval: string;
  },
  'liveData'
>;


