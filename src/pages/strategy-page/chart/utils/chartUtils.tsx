import { KlineCacheKey, IndicatorCacheKey } from "@/types/cache";
import { Badge } from "@/components/ui/badge";
import { parseCacheKey } from "@/utils/parseCacheKey";

// 获取特定K线对应的指标选项
export function getIndicatorOptionsForKline(
  klineKey: string,
  cacheKeys: Record<string, KlineCacheKey | IndicatorCacheKey>
) {
  if (!klineKey) return [];
  
  const selectedKlineData = cacheKeys[klineKey] as KlineCacheKey;
  const options: { key: string; data: IndicatorCacheKey }[] = [];
  
  Object.entries(cacheKeys).forEach(([key, value]) => {
    if (key.startsWith("indicator|")) {
      const indicatorData = value as IndicatorCacheKey;
      
      // 确保交易所、交易对和时间周期完全一致
      if (
        indicatorData.exchange === selectedKlineData.exchange &&
        indicatorData.symbol === selectedKlineData.symbol &&
        indicatorData.interval === selectedKlineData.interval
      ) {
        options.push({
          key,
          data: indicatorData
        });
      }
    }
  });
  
  return options;
}

// 渲染K线项，将交易所、交易对、时间周期分别用Badge包裹
export function renderKlineItem(klineData: KlineCacheKey) {
  return (
    <div className="flex items-center gap-1">
      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
        {klineData.exchange}
      </Badge>
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        {klineData.symbol}
      </Badge>
      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
        {klineData.interval}
      </Badge>
    </div>
  );
}

// 渲染指标项，使用单独的Badge
export function renderIndicatorItem(indicatorData: IndicatorCacheKey) {
  return (
    <div className="flex items-center gap-1">
      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
        {indicatorData.indicatorType}
      </Badge>
      <Badge variant="outline" className="bg-pink-50 text-pink-700 border-pink-200">
        {`period=${indicatorData.indicatorConfig.period}`}
      </Badge>
    </div>
  );
}

// 获取图表标题
export function getChartTitle(
  klineKeyStr: string,
) {
  
  if (!klineKeyStr) return "图表";

  const klineCacheKey = parseCacheKey(klineKeyStr);
  return `${klineCacheKey.symbol} - ${klineCacheKey.interval}`;

  
  return "图表";
}

// 生成唯一ID
export function generateChartId() {
  return `chart_${Date.now()}`;
} 