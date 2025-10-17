import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { IndicatorType, MAType, PriceSource } from "@/types/indicator";
import { getIndicatorConfig } from "@/types/indicator/indicator-config";
import type { SelectedIndicator } from "@/types/node/indicator-node";
import IndicatorViewerDialog from "./indicator-viewer-dialog";

interface EditDialogProps {
	isOpen: boolean;
	onClose: () => void;
	isEditing: boolean;
	editingIndex: number | null;
	selectedIndicators: SelectedIndicator[];
	onSave: (config: SelectedIndicator) => void;
	nodeId: string;
	initialIndicatorType?: IndicatorType; // 新增：从指标浏览面板传入的指标类型
}

// 表单数据类型
type FormDataValue = string | number | PriceSource | MAType;
type FormData = Record<string, FormDataValue>;

// 指标选项类型
interface IndicatorOption {
	value: IndicatorType;
	label: string;
}

// 选择框选项类型
interface SelectOption {
	value: string | number | PriceSource | MAType;
	label: string;
}

// 价格源选项
const PRICE_SOURCE_OPTIONS: SelectOption[] = [
	{ value: PriceSource.CLOSE, label: "收盘价" },
	{ value: PriceSource.OPEN, label: "开盘价" },
	{ value: PriceSource.HIGH, label: "最高价" },
	{ value: PriceSource.LOW, label: "最低价" },
];

// MA类型选项
const MA_TYPE_OPTIONS: SelectOption[] = [
	{ value: MAType.SMA, label: "SMA (简单移动平均)" },
	{ value: MAType.EMA, label: "EMA (指数移动平均)" },
	{ value: MAType.WMA, label: "WMA (加权移动平均)" },
	{ value: MAType.DEMA, label: "DEMA (双重指数移动平均)" },
	{ value: MAType.TEMA, label: "TEMA (三重指数移动平均)" },
	{ value: MAType.TRIMA, label: "TRIMA (三角移动平均)" },
	{ value: MAType.KAMA, label: "KAMA (自适应移动平均)" },
	{ value: MAType.MANA, label: "MANA (修正移动平均)" },
	{ value: MAType.T3, label: "T3 (T3移动平均)" },
];

const EditDialog: React.FC<EditDialogProps> = ({
	isOpen,
	onClose,
	isEditing,
	editingIndex,
	selectedIndicators,
	onSave,
	nodeId,
	initialIndicatorType,
}) => {
	const [indicatorType, setIndicatorType] = useState<IndicatorType>(
		initialIndicatorType || IndicatorType.MA,
	);
	const [formData, setFormData] = useState<Partial<FormData>>({});
	const [showIndicatorViewer, setShowIndicatorViewer] = useState(false);

	// 获取当前指标的配置实例
	const getCurrentConfigInstance = useCallback(() => {
		return getIndicatorConfig(indicatorType);
	}, [indicatorType]);

	// 类型守卫：检查值是否为数字
	const isNumber = (value: FormDataValue): value is number => {
		return typeof value === "number";
	};

	// 检查指标配置是否已存在
	const isIndicatorConfigExists = (excludeIndex?: number): boolean => {
		const configInstance = getCurrentConfigInstance();
		if (!configInstance) return false;

		return selectedIndicators.some((indicator, index) => {
			if (excludeIndex !== undefined && index === excludeIndex) {
				return false; // 排除正在编辑的项
			}

			if (indicator.indicatorType !== indicatorType) {
				return false;
			}

			// 检查关键字段是否相同
			return Object.keys(configInstance.params).every((key) => {
				const configValue = indicator.indicatorConfig[key];
				const formValue = formData[key];
				return configValue === formValue;
			});
		});
	};

	// 每次对话框打开时重置状态
	useEffect(() => {
		if (isOpen) {
			if (isEditing && editingIndex !== null) {
				const existingIndicator = selectedIndicators[editingIndex];
				setIndicatorType(existingIndicator.indicatorType);

				// 设置表单数据为现有配置
				setFormData({
					...existingIndicator.indicatorConfig,
				} as Partial<FormData>);
			} else {
				// 使用传入的指标类型或默认值
				const targetType = initialIndicatorType || IndicatorType.MA;
				setIndicatorType(targetType);
				// 设置默认值
				const configInstance = getIndicatorConfig(targetType);
				if (configInstance) {
					const defaultConfig = configInstance.getDefaultConfig();
					setFormData({ ...defaultConfig } as Partial<FormData>);
				}
			}
		}
	}, [
		isOpen,
		isEditing,
		editingIndex,
		selectedIndicators,
		initialIndicatorType,
	]);

	// 当指标类型改变时，重新初始化表单数据
	useEffect(() => {
		if (isOpen && !isEditing) {
			const configInstance = getCurrentConfigInstance();
			if (configInstance) {
				const defaultConfig = configInstance.getDefaultConfig();
				setFormData({ ...defaultConfig } as Partial<FormData>);
			}
		}
	}, [isOpen, isEditing, getCurrentConfigInstance]);

	// 根据指标类型创建初始值
	const createInitialValue = (type: IndicatorType): Record<string, number> => {
		const configInstance = getIndicatorConfig(type);
		if (configInstance) {
			return configInstance.getValue() as Record<string, number>;
		}
		// 默认返回
		return { timestamp: 0, ma: 0 } as Record<string, number>;
	};

	// 创建指标配置
	const createIndicatorConfig = (
		type: IndicatorType,
		index: number,
	): SelectedIndicator => {
		const configInstance = getIndicatorConfig(type);
		if (!configInstance) {
			throw new Error(`不支持的指标类型: ${type}`);
		}

		// 更新配置实例的 params 默认值
		Object.entries(formData).forEach(([key, value]) => {
			if (configInstance.params[key]) {
				configInstance.params[key].defaultValue = value as
					| string
					| number
					| PriceSource
					| MAType;
			}
		});

		// 获取配置
		const config = configInstance.getDefaultConfig();

		return {
			configId: index + 1,
			outputHandleId: `${nodeId}_output_${index + 1}`,
			indicatorType: type,
			indicatorConfig: config,
			value: createInitialValue(type),
		};
	};

	const handleSave = (): void => {
		const configInstance = getCurrentConfigInstance();
		if (!configInstance) return;

		// 验证必填字段
		const hasEmptyRequired = Object.entries(configInstance.params).some(
			([key, param]) => {
				if (param.required) {
					const value = formData[key];
					return (
						value === undefined ||
						value === "" ||
						(typeof param.defaultValue === "number" &&
							isNumber(value) &&
							value <= 0)
					);
				}
				return false;
			},
		);

		if (hasEmptyRequired) {
			return;
		}

		// 检查是否重复（排除正在编辑的项）
		if (isIndicatorConfigExists(editingIndex || undefined)) {
			return;
		}

		const targetIndex =
			isEditing && editingIndex !== null
				? editingIndex
				: selectedIndicators.length;
		const configObj = createIndicatorConfig(indicatorType, targetIndex);

		// 如果是编辑模式，保持原有的 handleId
		if (isEditing && editingIndex !== null) {
			configObj.outputHandleId =
				selectedIndicators[editingIndex].outputHandleId;
		}

		onSave(configObj);
		onClose();
	};

	// 处理表单字段值变化
	const handleFieldChange = (fieldName: string, value: FormDataValue): void => {
		setFormData((prev) => ({
			...prev,
			[fieldName]: value,
		}));
	};

	// 获取选择框选项
	const getSelectOptions = (fieldName: string): SelectOption[] => {
		if (fieldName === "priceSource") {
			return PRICE_SOURCE_OPTIONS;
		} else if (fieldName === "maType") {
			return MA_TYPE_OPTIONS;
		}
		return [];
	};

	// 渲染表单字段
	const renderFormField = (
		key: string,
		param: { label: string; defaultValue: unknown; required: boolean },
	) => {
		const { label, defaultValue, required } = param;
		const value = (
			formData[key] !== undefined ? formData[key] : defaultValue || ""
		) as FormDataValue;

		// 根据默认值类型判断字段类型
		if (typeof defaultValue === "number") {
			return (
				<div key={key} className="grid gap-2">
					<Label htmlFor={key} className="text-left">
						{label}
						{required && <span className="text-red-500">*</span>}
					</Label>
					<Input
						id={key}
						type="number"
						value={isNumber(value) ? value : ""}
						onChange={(e) => {
							const inputValue = e.target.value;
							if (inputValue === "") {
								handleFieldChange(key, "");
							} else {
								handleFieldChange(key, Number(inputValue) || 0);
							}
						}}
						step={1}
						placeholder={`输入${label}`}
					/>
				</div>
			);
		}

		// 选择框字段
		if (
			typeof defaultValue === "string" &&
			(key === "priceSource" || key === "maType")
		) {
			const options = getSelectOptions(key);

			return (
				<div key={key} className="grid gap-2">
					<Label htmlFor={key} className="text-left">
						{label}
						{required && <span className="text-red-500">*</span>}
					</Label>
					<Select
						value={String(value)}
						onValueChange={(newValue) =>
							handleFieldChange(key, newValue as FormDataValue)
						}
					>
						<SelectTrigger id={key}>
							<SelectValue placeholder={`选择${label}`} />
						</SelectTrigger>
						<SelectContent>
							{options.map((option) => (
								<SelectItem
									key={String(option.value)}
									value={String(option.value)}
								>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			);
		}

		return null;
	};

	const configInstance = getCurrentConfigInstance();

	// 检查是否有可配置的参数
	const hasConfigurableParams =
		configInstance && Object.keys(configInstance.params).length > 0;

	return (
		<>
			<Dialog open={isOpen} onOpenChange={onClose} modal={false}>
				<DialogContent
					className="sm:max-w-[425px]"
					onOpenAutoFocus={(e) => e.preventDefault()} // 防止自动聚焦，避免 aria-hidden 警告
					onInteractOutside={(e) => e.preventDefault()} // 防止点击外部区域关闭对话框
					aria-describedby={undefined}
				>
					<DialogHeader>
						<DialogTitle>
							配置{configInstance?.displayName || indicatorType}
						</DialogTitle>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						{hasConfigurableParams ? (
							/* 动态渲染当前指标类型的表单字段 */
							configInstance &&
							Object.entries(configInstance.params).map(([key, param]) =>
								renderFormField(key, param),
							)
						) : (
							/* 无参数时显示提示信息 */
							<div className="text-gray-500">无需配置参数</div>
						)}
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={onClose}>
							取消
						</Button>
						<Button
							onClick={handleSave}
							disabled={isIndicatorConfigExists(editingIndex || undefined)}
						>
							{isIndicatorConfigExists(editingIndex || undefined)
								? "配置已存在"
								: hasConfigurableParams
									? "保存"
									: "确定"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* 指标浏览面板 */}
			<IndicatorViewerDialog
				isOpen={showIndicatorViewer}
				onClose={() => setShowIndicatorViewer(false)}
				onSelectIndicator={(selectedType: IndicatorType) => {
					setIndicatorType(selectedType);
					// 重新初始化表单数据
					const configInstance = getIndicatorConfig(selectedType);
					if (configInstance) {
						const defaultConfig = configInstance.getDefaultConfig();
						setFormData({ ...defaultConfig } as Partial<FormData>);
					}
				}}
			/>
		</>
	);
};

export default EditDialog;
