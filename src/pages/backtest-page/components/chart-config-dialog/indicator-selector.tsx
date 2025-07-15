import { useMemo } from "react";
import MultipleSelector, { Option } from "@/components/ui/multi-select";
import { BacktestKlineKey, BacktestIndicatorKey } from "@/types/symbol-key";

interface IndicatorSelectorProps {
    cacheKeys: Record<string, BacktestKlineKey | BacktestIndicatorKey>;
    selectedKlineCacheKeyStr: string;
    selectedIndicatorKeys: string[];
    onIndicatorChange: (indicatorKeys: string[]) => void;
}

const IndicatorSelector = ({ 
    cacheKeys, 
    selectedKlineCacheKeyStr, 
    selectedIndicatorKeys, 
    onIndicatorChange 
}: IndicatorSelectorProps) => {
    
    // 获取指标选项
    const indicatorOptions = useMemo((): Option[] => {
        if (!selectedKlineCacheKeyStr) return [];
        
        const selectedKlineCacheKey = cacheKeys[selectedKlineCacheKeyStr] as BacktestKlineKey;

        const options: Option[] = [];
        
        Object.entries(cacheKeys).forEach(([key, value]) => {
            if (key.startsWith("backtest_indicator|")) {
                const indicatorData = value as BacktestIndicatorKey;
                
                // 确保交易所、交易对和时间周期完全一致
                if (
                    indicatorData.exchange === selectedKlineCacheKey.exchange &&
                    indicatorData.symbol === selectedKlineCacheKey.symbol &&
                    indicatorData.interval === selectedKlineCacheKey.interval
                ) {
                    const label = `${indicatorData.indicatorType.toUpperCase()} (${indicatorData.indicatorConfig.period})`;
                    options.push({
                        value: key,
                        label: label
                    });
                }
            }
        });
        
        return options;
    }, [cacheKeys, selectedKlineCacheKeyStr]);

    // 获取当前选中的指标选项
    const selectedOptions = useMemo(() => {
        return selectedIndicatorKeys.map(key => ({
            value: key,
            label: cacheKeys[key] ? 
                `${(cacheKeys[key] as BacktestIndicatorKey).indicatorType.toUpperCase()} (${(cacheKeys[key] as BacktestIndicatorKey).indicatorConfig.period})` : 
                key
        }));
    }, [selectedIndicatorKeys, cacheKeys]);

    return (
        <div className="grid gap-2">
            <h3 className="text-sm font-medium">指标</h3>
            <MultipleSelector 
                value={selectedOptions}
                options={indicatorOptions}
                placeholder="选择指标"
                disabled={!selectedKlineCacheKeyStr}
                onChange={(selectedOptions) => {
                    onIndicatorChange(selectedOptions.map(option => option.value));
                }}
                emptyIndicator={
                    <p className="text-center text-sm leading-10 text-gray-600 dark:text-gray-400">
                        没有找到匹配的指标
                    </p>
                }
                triggerSearchOnFocus={true}
            />
        </div>
    );
};

export default IndicatorSelector;
