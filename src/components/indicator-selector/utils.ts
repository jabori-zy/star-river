import { IndicatorConfig } from "@/types/indicator";
import { indicatorSelectorConfig } from "@/types/indicator/indicator-selector-config";

export interface IndicatorOption {
    key: string;
    label: string;
    indicatorType: string;
    indicatorConfig: IndicatorConfig;
}



// 根据配置动态获取指标参数显示文本
export const getIndicatorConfigDisplay = (indicatorConfig: IndicatorConfig): string => {
    const indicatorType = indicatorConfig.type;
    const config = indicatorSelectorConfig[indicatorType as keyof typeof indicatorSelectorConfig];
    if (!config) return '';
    
    // 获取数字类型和选择字段（排除价格源）并构建显示文本
    const displayFields = config.params.filter(field => 
        field.type === 'number' || 
        (field.type === 'select' && (field.name as string) !== 'priceSource') // 价格源不显示
    );
    const paramParts = displayFields.map(field => {
        const value = (indicatorConfig as Record<string, unknown>)[field.name];
        if ((field.name as string) === 'maType') {
            return `${field.label}:${value}`;
        }
        // 对于其他选择字段，直接显示值
        if (field.type === 'select') {
            return `${field.label}:${value}`;
        }
        // 数字字段
        return `${field.label}:${value}`;
    });
    
    return paramParts.join(' | ');
}; 