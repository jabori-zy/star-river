import { IndicatorConfig, IndicatorType, MAType, PriceSource } from "@/types/indicator";
import { MAConfig, SMAConfig, EMAConfig, BBandsConfig, MACDConfig } from "@/types/indicator/indicator-config";

// 指标配置解析器类型
type IndicatorConfigParser = (params: Map<string, string>) => IndicatorConfig;

// 指标配置解析器映射
export const indicatorConfigParsers: Record<IndicatorType, IndicatorConfigParser> = {
  [IndicatorType.MA]: (params: Map<string, string>): MAConfig => ({
    type: IndicatorType.MA,
    timePeriod: parseInt(params.get("time_period") || "0"),
    maType: params.get("ma_type") as MAType,
    priceSource: params.get("price_source") as PriceSource
  }),
  
  [IndicatorType.SMA]: (params: Map<string, string>): SMAConfig => ({
    type: IndicatorType.SMA,
    timePeriod: parseInt(params.get("time_period") || "0"),
    priceSource: params.get("price_source") as PriceSource
  }),
  
  [IndicatorType.EMA]: (params: Map<string, string>): EMAConfig => ({
    type: IndicatorType.EMA,
    timePeriod: parseInt(params.get("time_period") || "0"),
    priceSource: params.get("price_source") as PriceSource
  }),
  
  [IndicatorType.BBANDS]: (params: Map<string, string>): BBandsConfig => ({
    type: IndicatorType.BBANDS,
    timePeriod: parseInt(params.get("time_period") || "0"),
    stdDev: parseFloat(params.get("std_dev") || "2"),
    priceSource: params.get("price_source") as PriceSource
  }),
  
  [IndicatorType.MACD]: (params: Map<string, string>): MACDConfig => ({
    type: IndicatorType.MACD,
    fastPeriod: parseInt(params.get("fast_period") || "0"),
    slowPeriod: parseInt(params.get("slow_period") || "0"),
    signalPeriod: parseInt(params.get("signal_period") || "0"),
    priceSource: params.get("price_source") as PriceSource
  })
};

/**
 * 解析指标配置字符串
 */
export function parseIndicatorConfig(indicatorConfigStr: string): IndicatorConfig {
  const indicatorType = indicatorConfigStr.split("(")[0] as IndicatorType;
  const paramStr = indicatorConfigStr.match(/\((.*?)\)/)?.[1] || "";
  
  // 解析参数字符串
  const params = new Map<string, string>();
  paramStr.split(",").forEach(param => {
    const [key, value] = param.split("=");
    if (key && value) {
      params.set(key.trim(), value.trim());
    }
  });
  
  // 获取对应的解析器
  const parser = indicatorConfigParsers[indicatorType];
  if (!parser) {
    throw new Error(`不支持的指标类型: ${indicatorType}`);
  }
  
  return parser(params);
}

/**
 * 添加新的指标解析器
 * 使用示例：
 * addIndicatorParser(IndicatorType.RSI, (params) => ({
 *   type: IndicatorType.RSI,
 *   timePeriod: parseInt(params.get("time_period") || "0"),
 *   priceSource: params.get("price_source") as PriceSource
 * }));
 */
export function addIndicatorParser(
  indicatorType: IndicatorType, 
  parser: IndicatorConfigParser
): void {
  indicatorConfigParsers[indicatorType] = parser;
} 