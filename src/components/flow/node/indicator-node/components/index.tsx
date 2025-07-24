import BaseHandle from "@/components/flow/base/BaseHandle";
import { Position } from "@xyflow/react";
import { IndicatorConfig, IndicatorType, PriceSource, MAType } from "@/types/indicator";
import { SelectedIndicator } from "@/types/node/indicator-node";
import { indicatorParamsConfigMap } from "@/types/indicator/indicator-params-config";
import { Badge } from "@/components/ui/badge";

// 价格源选项映射
const PRICE_SOURCE_LABELS: Record<PriceSource, string> = {
    [PriceSource.CLOSE]: '收盘价',
    [PriceSource.OPEN]: '开盘价',
    [PriceSource.HIGH]: '最高价',
    [PriceSource.LOW]: '最低价',
};

// MA类型选项映射
const MA_TYPE_LABELS: Record<MAType, string> = {
    [MAType.SMA]: 'SMA',
    [MAType.EMA]: 'EMA',
    [MAType.WMA]: 'WMA',
    [MAType.DEMA]: 'DEMA',
    [MAType.TEMA]: 'TEMA',
    [MAType.TRIMA]: 'TRIMA',
    [MAType.KAMA]: 'KAMA',
    [MAType.MANA]: 'MANA',
    [MAType.T3]: 'T3',
};

// 从配置获取指标类型的显示标签
const getIndicatorLabel = (type: IndicatorType): string => {
    return indicatorParamsConfigMap[type]?.indicatorShowName || type;
};

// 获取价格源的中文标签
const getPriceSourceLabel = (priceSource: PriceSource): string => {
    return PRICE_SOURCE_LABELS[priceSource] || priceSource;
};

// 根据配置动态获取指标参数显示文本
const getIndicatorParams = (indicator: IndicatorConfig): string => {
    const config = indicatorParamsConfigMap[indicator.type];
    if (!config) return '';
    
    // 获取数字类型和选择字段（排除价格源）并构建显示文本
    const displayFields = config.params.filter(field => 
        field.type === 'number' || 
        (field.type === 'select' && (field.name as string) !== 'priceSource') // 价格源单独显示
    );
    const paramParts = displayFields.map(field => {
        const value = (indicator as Record<string, unknown>)[field.name];
        if ((field.name as string) === 'maType') {
            const maTypeLabel = MA_TYPE_LABELS[value as MAType] || value;
            return `${field.label}:${maTypeLabel}`;
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

interface IndicatorItemProps {
    indicator: SelectedIndicator;
    handleId: string;
}

export function IndicatorItem({ indicator, handleId }: IndicatorItemProps) {
    return (
        <div className="flex items-center justify-between px-2 py-2 bg-gray-100 rounded-md relative">
            <div className="flex items-center gap-2 justify-between w-full">
                {/* flex-1 表示占满剩余空间 */}
                <div className="flex flex-col gap-1 flex-1">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{getIndicatorLabel(indicator.indicatorConfig.type)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                        {getIndicatorParams(indicator.indicatorConfig)} | {getPriceSourceLabel(indicator.indicatorConfig.priceSource)}
                    </div>
                </div>
                <div className="text-xs text-muted-foreground font-bold">
                    <Badge variant="outline" className="border-gray-400">
                        指标 {indicator?.indicatorId}
                    </Badge>
                </div>
            </div>
            <BaseHandle
                id={handleId}
                type="source"
                position={Position.Right}
                handleColor="!bg-red-400"
                className="translate-x-2 translate-y-2"
            />
        </div>
    );
} 