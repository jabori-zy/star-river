import { ComparisonSymbol, LogicalSymbol, VarType, Variable } from "@/types/node/if-else-node";

// 获取条件类型的中文标签
export const getCaseTypeLabel = (caseId: number) => {
    return caseId === 1 ? 'IF' : 'ELIF';
};

// 获取比较符号 - 直接返回符号
export const getComparisonLabel = (symbol: ComparisonSymbol | null) => {
    if (!symbol) return '';
    return symbol;
};

// 获取逻辑符号的中文标签
export const getLogicalLabel = (symbol: LogicalSymbol | null) => {
    if (!symbol) return '';
    const logicalMap: Record<LogicalSymbol, string> = {
        [LogicalSymbol.AND]: 'AND',
        [LogicalSymbol.Or]: 'OR',
    };
    return logicalMap[symbol] || symbol;
};

// 获取变量显示文本
export const getVariableLabel = (variable: Variable | null) => {
    if (!variable) return '未设置';
    
    if (variable.varType === VarType.constant) {
        return `${variable.variable}`;
    } else if (variable.varType === VarType.variable) {
        const nodeName = variable.nodeName || '未设置';
        const variableName = variable.variable || '未设置';
        const variableId = variable.variableId || '未设置';
        return `${nodeName} - ${variableId}|${variableName}`;
    }
    
    return '未设置';
}; 