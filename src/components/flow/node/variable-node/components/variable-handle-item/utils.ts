import { type VariableConfig, GetVariableType, type TimerConfig, StrategySysVariable } from "@/types/node/variable-node";

// 获取变量类型的中文标签
export const getVariableLabel = (variable: string): string => {
    const variableMap: Record<string, string> = {
        [StrategySysVariable.POSITION_NUMBER]: '持仓数量',
        [StrategySysVariable.Filled_ORDER_NUMBER]: '已成交订单数量',
    };
    return variableMap[variable] || variable;
};

// 获取变量触发类型的中文标签
export const getVariableTypeLabel = (type: GetVariableType): string => {
    const typeMap: Record<GetVariableType, string> = {
        [GetVariableType.CONDITION]: '条件触发',
        [GetVariableType.TIMER]: '定时触发',
    };
    return typeMap[type] || type;
};

// 格式化交易对显示
export const formatSymbolDisplay = (symbol: string | null): string => {
    return symbol || '全部交易对';
};

// 格式化定时配置显示
export const getTimerConfigDisplay = (timerConfig: TimerConfig): string => {
    const unitMap = {
        second: '秒',
        minute: '分钟',
        hour: '小时',
        day: '天'
    };
    
    return `${timerConfig.interval}${unitMap[timerConfig.unit]}`;
};

// 获取变量配置的简要描述
export const getVariableConfigDescription = (config: VariableConfig): string => {
    const symbolText = formatSymbolDisplay(config.symbol);
    const variableText = getVariableLabel(config.variable);
    const typeText = getVariableTypeLabel(config.getVariableType);
    
    let description = `${symbolText} - ${variableText} (${typeText})`;
    
    if (config.getVariableType === GetVariableType.TIMER && config.timerConfig) {
        description += ` - ${getTimerConfigDisplay(config.timerConfig)}`;
    }
    
    return description;
};

// 获取变量配置的状态标签
export const getVariableConfigStatusLabel = (config: VariableConfig): string => {
    if (!config.variableName?.trim()) {
        return '未设置名称';
    }
    if (!config.variable) {
        return '未选择变量类型';
    }
    if (config.getVariableType === GetVariableType.TIMER && !config.timerConfig) {
        return '未配置定时器';
    }
    return '配置完成';
};

// 检查变量配置是否完整
export const isVariableConfigComplete = (config: VariableConfig): boolean => {
    if (!config.variableName?.trim() || !config.variable) {
        return false;
    }
    
    if (config.getVariableType === GetVariableType.TIMER && !config.timerConfig) {
        return false;
    }
    
    return true;
}; 