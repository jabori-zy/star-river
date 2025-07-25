import { IndicatorType, MAType, PriceSource } from "../indicator/index";

// 增强的参数元数据接口
export interface EnhancedParameterMetadata {
	// 基本信息
	label: string;
	description?: string;

	// 类型信息
	type: "number" | "select" | "string" | "boolean";
	required: boolean;

	// 默认值和约束
	defaultValue?: unknown;
	min?: number;
	max?: number;
	step?: number;

	// 选择框选项
	options?: Array<{ label: string; value: unknown }>;

	// UI相关
	placeholder?: string;
	unit?: string; // 单位，如 "天", "倍", "%"

	// 验证规则
	validation?: {
		pattern?: string;
		message?: string;
		custom?: (value: unknown) => string | null; // 自定义验证函数
	};

	// 显示控制
	display?: {
		order?: number; // 显示顺序
		group?: string; // 分组
		hidden?: boolean; // 是否隐藏
		readonly?: boolean; // 是否只读
	};
}

// 增强的指标配置接口
export interface EnhancedIndicatorConfig<T = Record<string, unknown>> {
	// 基本信息
	type: IndicatorType;
	displayName: string;
	description?: string;
	category?: string;

	// 参数元数据
	parameters: Record<keyof T, EnhancedParameterMetadata>;

	// 图表配置
	chart?: {
		isInMainChart: boolean;
		series: Array<{
			name: string;
			color: string;
			strokeThickness?: number;
			valueKey: string;
		}>;
	};

	// 计算配置
	calculation?: {
		formula?: string;
		dependencies?: string[];
	};
}

// MA指标的增强配置
export const ENHANCED_MA_CONFIG: EnhancedIndicatorConfig<{
	maType: MAType;
	timePeriod: number;
	priceSource: PriceSource;
}> = {
	type: IndicatorType.MA,
	displayName: "移动平均线",
	description: "计算指定周期的移动平均线",
	category: "趋势指标",

	parameters: {
		maType: {
			label: "移动平均类型",
			description: "选择移动平均线的计算方式",
			type: "select",
			required: true,
			defaultValue: MAType.SMA,
			options: [
				{ label: "简单移动平均(SMA)", value: MAType.SMA },
				{ label: "指数移动平均(EMA)", value: MAType.EMA },
				{ label: "加权移动平均(WMA)", value: MAType.WMA },
				{ label: "双重指数移动平均(DEMA)", value: MAType.DEMA },
				{ label: "三重指数移动平均(TEMA)", value: MAType.TEMA },
			],
			display: { order: 1 },
		},

		timePeriod: {
			label: "计算周期",
			description: "移动平均线的计算周期，数值越大曲线越平滑",
			type: "number",
			required: true,
			defaultValue: 20,
			min: 1,
			max: 1000,
			step: 1,
			unit: "天",
			placeholder: "请输入计算周期",
			validation: {
				message: "计算周期必须在1-1000之间",
			},
			display: { order: 2 },
		},

		priceSource: {
			label: "价格数据源",
			description: "用于计算移动平均线的价格数据",
			type: "select",
			required: true,
			defaultValue: PriceSource.CLOSE,
			options: [
				{ label: "收盘价", value: PriceSource.CLOSE },
				{ label: "开盘价", value: PriceSource.OPEN },
				{ label: "最高价", value: PriceSource.HIGH },
				{ label: "最低价", value: PriceSource.LOW },
			],
			display: { order: 3 },
		},
	},

	chart: {
		isInMainChart: true,
		series: [
			{
				name: "MA",
				color: "#FF6B6B",
				strokeThickness: 2,
				valueKey: "ma",
			},
		],
	},

	calculation: {
		formula: "MA(price, period, type)",
		dependencies: ["price", "period", "type"],
	},
};

// MACD指标的增强配置
export const ENHANCED_MACD_CONFIG: EnhancedIndicatorConfig<{
	fastPeriod: number;
	slowPeriod: number;
	signalPeriod: number;
	priceSource: PriceSource;
}> = {
	type: IndicatorType.MACD,
	displayName: "MACD指标",
	description: "移动平均收敛发散指标，用于判断趋势变化",
	category: "趋势指标",

	parameters: {
		fastPeriod: {
			label: "快线周期",
			description: "快速移动平均线的周期",
			type: "number",
			required: true,
			defaultValue: 12,
			min: 1,
			max: 100,
			step: 1,
			unit: "天",
			validation: {
				custom: (value) => {
					const num = Number(value);
					return num <= 0 ? "快线周期必须大于0" : null;
				},
			},
			display: { order: 1, group: "周期设置" },
		},

		slowPeriod: {
			label: "慢线周期",
			description: "慢速移动平均线的周期，必须大于快线周期",
			type: "number",
			required: true,
			defaultValue: 26,
			min: 1,
			max: 200,
			step: 1,
			unit: "天",
			validation: {
				custom: (value) => {
					const num = Number(value);
					return num <= 0 ? "慢线周期必须大于0" : null;
				},
			},
			display: { order: 2, group: "周期设置" },
		},

		signalPeriod: {
			label: "信号线周期",
			description: "MACD信号线的周期",
			type: "number",
			required: true,
			defaultValue: 9,
			min: 1,
			max: 50,
			step: 1,
			unit: "天",
			display: { order: 3, group: "周期设置" },
		},

		priceSource: {
			label: "价格数据源",
			description: "用于计算MACD的价格数据",
			type: "select",
			required: true,
			defaultValue: PriceSource.CLOSE,
			options: [
				{ label: "收盘价", value: PriceSource.CLOSE },
				{ label: "开盘价", value: PriceSource.OPEN },
				{ label: "最高价", value: PriceSource.HIGH },
				{ label: "最低价", value: PriceSource.LOW },
			],
			display: { order: 4, group: "数据源" },
		},
	},

	chart: {
		isInMainChart: false,
		series: [
			{
				name: "MACD线",
				color: "#FF6B6B",
				strokeThickness: 2,
				valueKey: "macd",
			},
			{
				name: "信号线",
				color: "#4ECDC4",
				strokeThickness: 2,
				valueKey: "signal",
			},
			{
				name: "柱状图",
				color: "#45B7D1",
				valueKey: "histogram",
			},
		],
	},

	calculation: {
		formula: "MACD(price, fast, slow, signal)",
		dependencies: ["price", "fast", "slow", "signal"],
	},
};

// 配置映射
export const ENHANCED_INDICATOR_CONFIGS: Record<
	IndicatorType,
	EnhancedIndicatorConfig
> = {
	[IndicatorType.MA]: ENHANCED_MA_CONFIG,
	[IndicatorType.MACD]: ENHANCED_MACD_CONFIG,
	// 可以继续添加其他指标...
} as Record<IndicatorType, EnhancedIndicatorConfig>;

// 工具函数：获取指标配置
export function getEnhancedIndicatorConfig<T extends IndicatorType>(
	type: T,
): EnhancedIndicatorConfig {
	const config = ENHANCED_INDICATOR_CONFIGS[type];
	if (!config) {
		throw new Error(`未找到指标配置: ${type}`);
	}
	return config;
}

// 工具函数：获取参数元数据
export function getParameterMetadata<T extends IndicatorType>(
	type: T,
	paramName: string,
): EnhancedParameterMetadata | undefined {
	const config = getEnhancedIndicatorConfig(type);
	return config.parameters[paramName as keyof typeof config.parameters];
}

// 工具函数：验证参数值
export function validateParameterValue(
	metadata: EnhancedParameterMetadata,
	value: unknown,
): string | null {
	// 必填验证
	if (
		metadata.required &&
		(value === undefined || value === null || value === "")
	) {
		return `${metadata.label}是必填项`;
	}

	// 类型验证
	if (value !== undefined && metadata.type === "number") {
		const numValue = Number(value);
		if (isNaN(numValue)) {
			return `${metadata.label}必须是数字`;
		}

		if (metadata.min !== undefined && numValue < metadata.min) {
			return `${metadata.label}不能小于${metadata.min}`;
		}

		if (metadata.max !== undefined && numValue > metadata.max) {
			return `${metadata.label}不能大于${metadata.max}`;
		}
	}

	// 自定义验证
	if (metadata.validation?.custom) {
		const customError = metadata.validation.custom(value);
		if (customError) {
			return customError;
		}
	}

	return null;
}

// 工具函数：生成表单字段配置
export function generateFormFields<T extends IndicatorType>(type: T) {
	const config = getEnhancedIndicatorConfig(type);
	const parameters = Object.entries(config.parameters);

	return parameters
		.filter(([_, metadata]) => !metadata.display?.hidden)
		.sort(
			([_, a], [__, b]) => (a.display?.order || 0) - (b.display?.order || 0),
		)
		.map(([name, metadata]) => ({
			name,
			...metadata,
		}));
}
