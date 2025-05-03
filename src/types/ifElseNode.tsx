
// 条件判断节点数据
export type IfElseNodeData = {
    nodeName: string; // 节点名称
    // 针对不同交易模式的条件配置
    liveConfig?: {
      cases: CaseItem[]
    }; 
    simulateConfig?: {
      cases: CaseItem[]
    };
    backtestConfig?: {
      cases: CaseItem[]
    };
    // cases?: CaseItem[]; // 向后兼容的字段
  };



// 条件组
export type CaseItem = {
    caseId: number // 条件id
    logicalOperator: LogicalOperator | null // 逻辑运算符
    conditions: Condition[] // 条件列表
}

// 条件
export type Condition = {
    conditionId: number // 条件id
    leftVariable: LeftVariable | null // 左变量
    comparisonOperator: ComparisonOperator | null // 比较运算符
    rightVariable: RightVariable | null // 右变量
  }

// 比较运算符
export enum ComparisonOperator {
    equal = '=',
    notEqual = '!=',
    greaterThan = '>',
    lessThan = '<',
    greaterThanOrEqual = '>=',
    lessThanOrEqual = '<=',
  }
  
  // 逻辑运算符
export enum LogicalOperator {
    and = 'and',
    or = 'or',
}

// 变量类型
export enum VarType {
    variable = 'variable',
    constant = 'constant',
}
  
// 左变量
export type LeftVariable = {
    varType: VarType | null // 变量类型
    nodeId: string | null // 节点id
    varibale: string | null // 变量名
}

// 右变量
export type RightVariable = {
    varType: VarType | null
    nodeId: string | null
    varibale: string | null
}
  
  
  

  
