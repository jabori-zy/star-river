import { IndicatorType } from ".";
import { 
    // COMPREHENSIVE_INDICATOR_CONFIG, 
    getIndicatorConfig,
    getSupportedIndicatorTypes,
    getParserKey,
    getParamDefaultValue,
    validateIndicatorParams
} from "./comprehensive-indicator-config";

// 示例1: 获取指标配置
export function exampleGetIndicatorConfig() {
    const maConfig = getIndicatorConfig(IndicatorType.MA);
    console.log("MA配置:", maConfig);
    
    // 获取参数配置
    console.log("MA参数:", maConfig.params);
    
    // 获取图表配置
    console.log("MA图表系列:", maConfig.series);
    
    // 获取解析器配置
    console.log("MA解析器映射:", maConfig.parserConfig.paramMappings);
}

// 示例2: 获取所有支持的指标类型
export function exampleGetSupportedTypes() {
    const types = getSupportedIndicatorTypes();
    console.log("支持的指标类型:", types);
    
    // 遍历所有指标配置
    types.forEach(type => {
        const config = getIndicatorConfig(type);
        console.log(`${config.displayName}: ${config.description}`);
    });
}

// 示例3: 使用解析器配置
export function exampleParserUsage() {
    const maType = IndicatorType.MA;
    
    // 获取参数对应的解析键名
    const timePeriodKey = getParserKey(maType, "timePeriod");
    console.log("timePeriod对应的解析键:", timePeriodKey); // 输出: "time_period"
    
    // 获取参数默认值
    const defaultTimePeriod = getParamDefaultValue(maType, "timePeriod");
    console.log("timePeriod默认值:", defaultTimePeriod); // 输出: 20
}

// 示例4: 验证指标参数
export function exampleValidateParams() {
    const macdType = IndicatorType.MACD;
    
    // 有效参数
    const validParams = {
        fastPeriod: 12,
        slowPeriod: 26,
        signalPeriod: 9,
        priceSource: "CLOSE"
    };
    
    const isValid = validateIndicatorParams(macdType, validParams);
    console.log("参数验证结果:", isValid); // 输出: true
    
    // 无效参数（缺少必需参数）
    const invalidParams = {
        fastPeriod: 12,
        // 缺少 slowPeriod, signalPeriod, priceSource
    };
    
    const isInvalid = validateIndicatorParams(macdType, invalidParams);
    console.log("无效参数验证结果:", isInvalid); // 输出: false
}

// 示例5: 动态生成UI配置
export function exampleGenerateUIConfig() {
    const smaType = IndicatorType.SMA;
    const config = getIndicatorConfig(smaType);
    
    // 生成表单配置
    const formConfig = config.params.map(param => ({
        label: param.label,
        name: param.name,
        type: param.type,
        defaultValue: param.defaultValue,
        required: param.required,
        options: param.options
    }));
    
    console.log("SMA表单配置:", formConfig);
    
    // 生成图表配置
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
    
    console.log("SMA图表配置:", chartConfig);
}

// 示例6: 添加新指标的完整流程
export function exampleAddNewIndicator() {
    // 假设要添加RSI指标
    
    // 1. 在IndicatorType枚举中添加RSI
    // export enum IndicatorType {
    //     MA = "ma",
    //     SMA = "sma",
    //     EMA = "ema",
    //     BBANDS = "bbands",
    //     MACD = "macd",
    //     RSI = "rsi", // 新增
    // }
    
    // 2. 在indicator-config.tsx中添加RSIConfig类型
    // export type RSIConfig = {
    //     type: IndicatorType.RSI;
    //     timePeriod: number;
    //     priceSource: PriceSource;
    // }
    
    // 3. 在indicator-value.tsx中添加RSIValue类型
    // export type RSIValue = {
    //     timestamp: number;
    //     rsi: number;
    // }
    
    // 4. 在comprehensive-indicator-config.ts中添加配置
    // [IndicatorType.RSI]: {
    //     type: IndicatorType.RSI,
    //     displayName: "RSI",
    //     description: "相对强弱指数",
    //     params: [
    //         {
    //             label: "周期",
    //             name: "timePeriod",
    //             type: "number",
    //             defaultValue: 14,
    //             required: true,
    //         },
    //         {
    //             label: "数据源",
    //             name: "priceSource",
    //             type: "select",
    //             defaultValue: PriceSource.CLOSE,
    //             required: true,
    //             options: Object.values(PriceSource).map(source => ({ label: source, value: source }))
    //         },
    //     ],
    //     isInMainChart: false,
    //     series: [
    //         {
    //             name: "RSI",
    //             type: SeriesType.LINE,
    //             color: "#FF6B6B",
    //             strokeThickness: 2,
    //             valueKey: "rsi"
    //         }
    //     ],
    //     parserConfig: {
    //         paramMappings: {
    //             timePeriod: "time_period",
    //             priceSource: "price_source"
    //         },
    //         defaultValueMappings: {
    //             timePeriod: 14,
    //             priceSource: PriceSource.CLOSE
    //         }
    //     },
    //     configType: {} as RSIConfig,
    //     valueType: {} as RSIValue
    // }
    
    console.log("新指标添加流程示例完成");
}

// 运行所有示例
export function runAllExamples() {
    console.log("=== 综合指标配置使用示例 ===");
    
    exampleGetIndicatorConfig();
    console.log("\n");
    
    exampleGetSupportedTypes();
    console.log("\n");
    
    exampleParserUsage();
    console.log("\n");
    
    exampleValidateParams();
    console.log("\n");
    
    exampleGenerateUIConfig();
    console.log("\n");
    
    exampleAddNewIndicator();
} 