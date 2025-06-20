import { Node } from "@xyflow/react";


// 条件判断节点回测模式配置
export type IfElseNodeBacktestConfig = {
    cases: CaseItem[];
}

export type IfElseNodeLiveConfig = {
    cases: CaseItem[];
}

export type IfElseNodeSimulateConfig = {
    cases: CaseItem[];
}


// 条件判断节点数据
export type IfElseNodeData = {
    nodeName: string; // 节点名称
    // 针对不同交易模式的条件配置
    liveConfig?: IfElseNodeLiveConfig; 
    simulateConfig?: IfElseNodeSimulateConfig;
    backtestConfig?: IfElseNodeBacktestConfig;
    // cases?: CaseItem[]; // 向后兼容的字段
  };



// 条件组
export type CaseItem = {
    caseId: number // 条件id
    logicalSymbol: LogicalSymbol | null // 逻辑运算符
    conditions: Condition[] // 条件列表
}

// 条件
export type Condition = {
    conditionId: number // 条件id
    leftVariable: Variable | null // 左变量
    comparisonSymbol: ComparisonSymbol | null // 比较运算符
    rightVariable: Variable | null // 右变量
  }

// 比较运算符
export enum ComparisonSymbol {
    equal = '=',
    notEqual = '!=',
    greaterThan = '>',
    lessThan = '<',
    greaterThanOrEqual = '>=',
    lessThanOrEqual = '<=',
  }
  
  // 逻辑运算符
export enum LogicalSymbol {
    AND = 'and',
    Or = 'or',
}

// 变量类型
export enum VarType {
    variable = 'variable', // 变量
    constant = 'constant', // 常量
}
  
// 左变量
export type Variable = {
    varType: VarType | null // 变量类型
    nodeId: string | null // 节点id
    handleId: string | null // 变量handleId
    variableId: number | null // 变量id(指标id,K线id)
    variable: string | number | null // 变量名称, 如果是常量，则值为常量值
    nodeName?: string | null // 节点名称
}

// // 右变量
// export type RightVariable = {
//     varType: VarType | null // 变量类型
//     nodeId: string | null // 节点id
//     handleId: string | null // 变量handleId
//     variableId: number | null // 变量id(指标id,K线id)
//     varibale: string | null // 变量名称
//     nodeName?: string | null // 节点名称
// }


export type IfElseNode = Node<IfElseNodeData, 'ifElseNode'>;
  
  

  
