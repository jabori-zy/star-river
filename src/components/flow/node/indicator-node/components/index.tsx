import { Activity } from "lucide-react";
import BaseHandle from "@/components/flow/base/BaseHandle";
import { Position } from "@xyflow/react";
import { IndicatorConfig, IndicatorType } from "@/types/indicator";

// 获取指标类型的中文标签
const getIndicatorLabel = (type: IndicatorType) => {
    const indicatorMap: Record<IndicatorType, string> = {
        [IndicatorType.SMA]: '简单移动平均线',
        [IndicatorType.EMA]: '指数移动平均线',
        [IndicatorType.BOLL]: '布林带',
    };
    return indicatorMap[type] || type;
};

// 获取价格源的中文标签
const getPriceSourceLabel = (priceSource: string) => {
    const priceSourceMap: Record<string, string> = {
        'close': '收盘价',
        'open': '开盘价',
        'high': '最高价',
        'low': '最低价',
    };
    return priceSourceMap[priceSource] || priceSource;
};

// 获取指标参数显示文本
const getIndicatorParams = (indicator: IndicatorConfig): string => {
    switch (indicator.type) {
        case IndicatorType.SMA:
        case IndicatorType.EMA:
            return `周期:${indicator.period}`;
        case IndicatorType.BOLL:
            return `周期:${indicator.period}, 标准差:${indicator.stdDev}`;
        default:
            return '';
    }
};

interface IndicatorItemProps {
    indicator: IndicatorConfig;
    handleId: string;
}

export function IndicatorItem({ indicator, handleId }: IndicatorItemProps) {
    return (
        <div className="flex items-center justify-between px-2 py-2 bg-gray-100 rounded-md relative">
            <div className="flex flex-col gap-1 flex-1">
                <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium">{getIndicatorLabel(indicator.type)}</span>
                </div>
                <div className="text-xs text-muted-foreground ml-6">
                    {getIndicatorParams(indicator)} | {getPriceSourceLabel(indicator.priceSource)}
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