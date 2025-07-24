# 综合指标配置系统

## 概述

综合指标配置系统整合了指标的所有相关配置信息，包括参数配置、图表配置、解析器配置和值类型配置。通过一个统一的配置映射，避免了多个分散的配置文件，提高了代码的可维护性和扩展性。

## 设计理念

### 1. 单一数据源
- 所有指标相关的配置信息都集中在一个配置映射中
- 避免了多个配置文件之间的数据不一致问题
- 便于统一管理和维护

### 2. 类型安全
- 完整的TypeScript类型支持
- 编译时类型检查，减少运行时错误
- 智能代码提示和自动补全

### 3. 可扩展性
- 新增指标只需在一个地方添加配置
- 支持动态添加新的指标类型
- 配置结构统一，便于批量处理

## 配置结构

### ComprehensiveIndicatorConfig

```typescript
type ComprehensiveIndicatorConfig = {
    // 基本信息
    type: IndicatorType;
    displayName: string;
    description?: string;
    
    // 参数配置
    params: IndicatorParam[];
    
    // 图表配置
    isInMainChart: boolean;
    series: IndicatorSeries[];
    
    // 解析器配置
    parserConfig: {
        paramMappings: Record<string, string>;
        defaultValueMappings: Record<string, string | number>;
    };
    
    // 类型信息
    configType: MAConfig | SMAConfig | EMAConfig | BBandsConfig | MACDConfig;
    valueType: MAValue | SMAValue | EMAValue | BBandsValue | MACDValue;
}
```

### 各部分的职责

1. **基本信息**: 指标的标识和描述信息
2. **参数配置**: UI表单生成和参数验证
3. **图表配置**: 图表渲染和样式设置
4. **解析器配置**: 字符串解析和参数映射
5. **类型信息**: TypeScript类型支持

## 使用示例

### 1. 获取指标配置

```typescript
import { getIndicatorConfig } from "./comprehensive-indicator-config";

const maConfig = getIndicatorConfig(IndicatorType.MA);
console.log(maConfig.displayName); // "MA"
console.log(maConfig.params); // 参数配置数组
console.log(maConfig.series); // 图表系列配置
```

### 2. 生成UI表单

```typescript
const config = getIndicatorConfig(IndicatorType.MACD);

// 生成表单字段
const formFields = config.params.map(param => ({
    label: param.label,
    name: param.name,
    type: param.type,
    defaultValue: param.defaultValue,
    required: param.required,
    options: param.options
}));
```

### 3. 生成图表配置

```typescript
const config = getIndicatorConfig(IndicatorType.BBANDS);

const chartConfig = {
    name: config.displayName,
    isInMainChart: config.isInMainChart,
    series: config.series.map(series => ({
        name: series.name,
        type: series.type,
        color: series.color,
        strokeThickness: series.strokeThickness,
        valueKey: series.valueKey
    }))
};
```

### 4. 参数验证

```typescript
import { validateIndicatorParams } from "./comprehensive-indicator-config";

const params = {
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
    priceSource: "CLOSE"
};

const isValid = validateIndicatorParams(IndicatorType.MACD, params);
```

## 工具函数

### getIndicatorConfig(type: IndicatorType)
获取指定指标类型的完整配置

### getSupportedIndicatorTypes()
获取所有支持的指标类型

### getParserKey(type: IndicatorType, paramName: string)
获取参数名对应的解析键名

### getParamDefaultValue(type: IndicatorType, paramName: string)
获取参数的默认值

### validateIndicatorParams(type: IndicatorType, params: Record<string, unknown>)
验证指标参数是否完整和有效

## 添加新指标

### 步骤1: 更新类型定义

在 `indicator/index.tsx` 中添加新的枚举值：

```typescript
export enum IndicatorType {
    MA = "ma",
    SMA = "sma",
    EMA = "ema",
    BBANDS = "bbands",
    MACD = "macd",
    RSI = "rsi", // 新增
}
```

### 步骤2: 添加配置类型

在 `indicator-config.tsx` 中添加配置类型：

```typescript
export type RSIConfig = {
    type: IndicatorType.RSI;
    timePeriod: number;
    priceSource: PriceSource;
}
```

### 步骤3: 添加值类型

在 `indicator-value.tsx` 中添加值类型：

```typescript
export type RSIValue = {
    timestamp: number;
    rsi: number;
}
```

### 步骤4: 添加综合配置

在 `comprehensive-indicator-config.ts` 中添加配置：

```typescript
[IndicatorType.RSI]: {
    type: IndicatorType.RSI,
    displayName: "RSI",
    description: "相对强弱指数",
    params: [
        {
            label: "周期",
            name: "timePeriod",
            type: "number",
            defaultValue: 14,
            required: true,
        },
        {
            label: "数据源",
            name: "priceSource",
            type: "select",
            defaultValue: PriceSource.CLOSE,
            required: true,
            options: Object.values(PriceSource).map(source => ({ label: source, value: source }))
        },
    ],
    isInMainChart: false,
    series: [
        {
            name: "RSI",
            type: SeriesType.LINE,
            color: "#FF6B6B",
            strokeThickness: 2,
            valueKey: "rsi"
        }
    ],
    parserConfig: {
        paramMappings: {
            timePeriod: "time_period",
            priceSource: "price_source"
        },
        defaultValueMappings: {
            timePeriod: 14,
            priceSource: PriceSource.CLOSE
        }
    },
    configType: {} as RSIConfig,
    valueType: {} as RSIValue
}
```

## 优势对比

### 原有方案的问题
1. **分散配置**: 多个配置文件，容易不一致
2. **重复代码**: 相似的配置逻辑重复编写
3. **维护困难**: 修改需要同时更新多个文件
4. **扩展复杂**: 新增指标需要修改多个地方

### 新方案的优势
1. **统一配置**: 所有配置集中在一个地方
2. **类型安全**: 完整的TypeScript类型支持
3. **易于维护**: 修改只需更新一个文件
4. **扩展简单**: 新增指标只需添加一个配置项
5. **工具函数**: 提供丰富的工具函数简化开发

## 迁移指南

### 从原有配置迁移

1. **参数配置**: 从 `indicator-params-config.ts` 迁移到 `params` 字段
2. **图表配置**: 从 `indicator-chart-config.ts` 迁移到 `series` 字段
3. **解析器配置**: 从 `indicator-config-parser.ts` 迁移到 `parserConfig` 字段
4. **值类型**: 从 `indicator-value.tsx` 迁移到 `valueType` 字段

### 渐进式迁移

可以逐步迁移，新旧配置并存，确保系统稳定性。

## 最佳实践

1. **保持配置一致性**: 确保所有相关配置都在同一个配置项中
2. **使用工具函数**: 优先使用提供的工具函数，避免直接访问配置
3. **类型安全**: 充分利用TypeScript的类型检查功能
4. **文档化**: 为新增的指标配置添加清晰的注释和文档 