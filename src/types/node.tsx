import {Node} from '@xyflow/react'


// 所有可能的节点数据类型
export type NodeItemProps = {
    nodeId: string;
    nodeType: string;
    nodeName: string;
    nodeDescription: string;
    nodeColor: string;
    nodeData: LiveDataNodeData | SMAIndicatorNodeData | IfElseNodeData | BuyNodeData;
};

type outputValue = {
  value: number | null;
  timestamp: number | null;
}

type LiveDataNodeData = {
  strategyId: number | null;
  exchange: string | null;
  symbol: string | null;
  interval: string | null;
};


type IndicatorParam = {
  paramName: string;      // 参数中文显示名称
  paramValue: number | null;  // 参数值
}

type SMAIndicatorNodeData = {
  strategyId: number | null;
  nodeName: string | null;
  indicatorName: string | null;
  indicatorConfig: Record<string, IndicatorParam>;
  indicatorValue: Record<string, outputValue> | null;

};

type IfElseNodeData = {
  cases: CaseItem[] | null;
};

type BuyNodeData = {
  strategyId: number | null;
  nodeName: string | null;
  buyValue: number | null;
  
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

export type IndicatorNode = Node<
  {
    exchange: string | null;
    symbol: string | null;
    interval: string | null;
    indicatorName: string;
    indicatorConfig: {
      period: number; 
    };
    indicatorValue: Record<string, outputValue> | null;
  },
  'indicator'
>;


export enum ComparisonOperator {
  equal = '=',
  notEqual = '!=',
  greaterThan = '>',
  lessThan = '<',
  greaterThanOrEqual = '>=',
  lessThanOrEqual = '<=',
}

export enum LogicalOperator {
  and = 'and',
  or = 'or',
}

export type CaseItem = {
  caseId: number // 条件id
  logicalOperator: LogicalOperator | null // 逻辑运算符
  conditions: Condition[] // 条件列表
}

type LeftVariable = {
  varType: VarType | null // 变量类型
  nodeId: string | null // 节点id
  varibale: string | null // 变量名
}

type RightVariable = {
  varType: VarType | null
  nodeId: string | null
  varibale: string | null
}



export type Condition = {
  conditionId: string | null // 条件id
  leftVariable: LeftVariable | null // 左变量
  comparisonOperator: ComparisonOperator | null // 比较运算符
  rightVariable: RightVariable | null // 右变量
}

export enum VarType {
  variable = 'variable',
  constant = 'constant',
}
