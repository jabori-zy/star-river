import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
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
import IndicatorViewerDialog from "./indicator-viewer";

interface EditDialogProps {
	isOpen: boolean;
	onClose: () => void;
	isEditing: boolean;
	editingIndex: number | null;
	selectedIndicators: SelectedIndicator[];
	onSave: (config: SelectedIndicator) => void;
	nodeId: string;
	initialIndicatorType?: IndicatorType; // New: Indicator type passed from indicator viewer panel
	sourceSeriesLength?: number; // Source kline series length for validation
}

// Form data type
type FormDataValue = string | number | PriceSource | MAType;
type FormData = Record<string, FormDataValue>;
// Select box option type
interface SelectOption {
	value: string | number | PriceSource | MAType;
	label: string;
}

// Price source options
const PRICE_SOURCE_OPTIONS: SelectOption[] = [
	{ value: PriceSource.CLOSE, label: "market.klineValueField.close" },
	{ value: PriceSource.OPEN, label: "market.klineValueField.open" },
	{ value: PriceSource.HIGH, label: "market.klineValueField.high" },
	{ value: PriceSource.LOW, label: "market.klineValueField.low" },
];

// MA type options
const MA_TYPE_OPTIONS: SelectOption[] = [
	{ value: MAType.SMA, label: "indicator.maType.sma" },
	{ value: MAType.EMA, label: "indicator.maType.ema" },
	{ value: MAType.WMA, label: "indicator.maType.wma" },
	{ value: MAType.DEMA, label: "indicator.maType.dema" },
	{ value: MAType.TEMA, label: "indicator.maType.tema" },
	{ value: MAType.TRIMA, label: "indicator.maType.trima" },
	{ value: MAType.KAMA, label: "indicator.maType.kama" },
	{ value: MAType.MAMA, label: "indicator.maType.mama" },
	{ value: MAType.T3, label: "indicator.maType.t3" },
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
	sourceSeriesLength,
}) => {
	const [indicatorType, setIndicatorType] = useState<IndicatorType>(
		initialIndicatorType || IndicatorType.MA,
	);
	const [formData, setFormData] = useState<Partial<FormData>>({});
	const [showIndicatorViewer, setShowIndicatorViewer] = useState(false);
	const { t } = useTranslation();
	// Get current indicator's configuration instance
	const getCurrentConfigInstance = useCallback(() => {
		return getIndicatorConfig(indicatorType);
	}, [indicatorType]);

	// Type guard: check if value is a number
	const isNumber = (value: FormDataValue): value is number => {
		return typeof value === "number";
	};

	// Check if indicator configuration already exists
	const isIndicatorConfigExists = (excludeIndex?: number): boolean => {
		const configInstance = getCurrentConfigInstance();
		if (!configInstance) return false;

		return selectedIndicators.some((indicator, index) => {
			if (excludeIndex !== undefined && index === excludeIndex) {
				return false; // Exclude item being edited
			}

			if (indicator.indicatorType !== indicatorType) {
				return false;
			}

			// Check if key fields are the same
			return Object.keys(configInstance.params).every((key) => {
				const configValue = indicator.indicatorConfig[key];
				const formValue = formData[key];
				return configValue === formValue;
			});
		});
	};

	// Check if form has validation errors (empty required fields or exceeds series length)
	const hasFormValidationErrors = (): boolean => {
		const configInstance = getCurrentConfigInstance();
		if (!configInstance) return false;

		return Object.entries(configInstance.params).some(([key, param]) => {
			const value = formData[key];
			const defaultValue = param.defaultValue;

			// Check number type fields
			if (typeof defaultValue === "number") {
				// Check if empty or <= 0 for required fields
				if (param.required) {
					if (
						value === undefined ||
						value === "" ||
						(isNumber(value) && value <= 0)
					) {
						return true;
					}
				}
				// Check if exceeds sourceSeriesLength
				if (
					sourceSeriesLength !== undefined &&
					sourceSeriesLength > 0 &&
					value !== undefined &&
					isNumber(value) &&
					value > sourceSeriesLength
				) {
					return true;
				}
			}
			return false;
		});
	};

	// Reset state each time dialog opens
	useEffect(() => {
		if (isOpen) {
			if (isEditing && editingIndex !== null) {
				const existingIndicator = selectedIndicators[editingIndex];
				setIndicatorType(existingIndicator.indicatorType);

				// Set form data to existing configuration
				setFormData({
					...existingIndicator.indicatorConfig,
				} as Partial<FormData>);
			} else {
				// Use passed indicator type or default value
				const targetType = initialIndicatorType || IndicatorType.MA;
				setIndicatorType(targetType);
				// Set default values
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

	// Reinitialize form data when indicator type changes
	useEffect(() => {
		if (isOpen && !isEditing) {
			const configInstance = getCurrentConfigInstance();
			if (configInstance) {
				const defaultConfig = configInstance.getDefaultConfig();
				setFormData({ ...defaultConfig } as Partial<FormData>);
			}
		}
	}, [isOpen, isEditing, getCurrentConfigInstance]);

	// Get next configuration ID
	const getNextConfigId = (): number => {
		if (selectedIndicators.length === 0) return 1;
		return Math.max(...selectedIndicators.map((i) => i.configId)) + 1;
	};

	// Create initial value based on indicator type
	const createInitialValue = (type: IndicatorType): Record<string, number> => {
		const configInstance = getIndicatorConfig(type);
		if (configInstance) {
			return configInstance.getValue() as Record<string, number>;
		}
		// Default return
		return { timestamp: 0, ma: 0 } as Record<string, number>;
	};

	// Create indicator configuration
	const createIndicatorConfig = (
		type: IndicatorType,
		configId: number,
	): SelectedIndicator => {
		const configInstance = getIndicatorConfig(type);
		if (!configInstance) {
			throw new Error(`Unsupported indicator type: ${type}`);
		}

		// Update default values of configuration instance params
		Object.entries(formData).forEach(([key, value]) => {
			if (configInstance.params[key]) {
				configInstance.params[key].defaultValue = value as
					| string
					| number
					| PriceSource
					| MAType;
			}
		});

		// Get configuration
		const config = configInstance.getDefaultConfig();

		return {
			configId: configId,
			outputHandleId: `${nodeId}_output_${configId}`,
			indicatorType: type,
			indicatorConfig: config,
			value: createInitialValue(type),
		};
	};

	const handleSave = (): void => {
		const configInstance = getCurrentConfigInstance();
		if (!configInstance) return;

		// Validate required fields
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

		// Check for duplicates (excluding item being edited)
		if (isIndicatorConfigExists(editingIndex || undefined)) {
			return;
		}

		// Determine configId to use
		const configId =
			isEditing && editingIndex !== null
				? selectedIndicators[editingIndex].configId // Edit mode: keep original ID
				: getNextConfigId(); // Add mode: get next ID

		const configObj = createIndicatorConfig(indicatorType, configId);

		// If in edit mode, keep original outputHandleId
		if (isEditing && editingIndex !== null) {
			configObj.outputHandleId =
				selectedIndicators[editingIndex].outputHandleId;
		}

		onSave(configObj);
		onClose();
	};

	// Handle form field value change
	const handleFieldChange = (fieldName: string, value: FormDataValue): void => {
		setFormData((prev) => ({
			...prev,
			[fieldName]: value,
		}));
	};

	// Get select box options
	const getSelectOptions = (fieldName: string): SelectOption[] => {
		if (fieldName === "priceSource") {
			return PRICE_SOURCE_OPTIONS;
		} else if (fieldName === "maType") {
			return MA_TYPE_OPTIONS;
		}
		return [];
	};

	// Render form field
	const renderFormField = (
		key: string,
		param: { label: string; defaultValue: unknown; required: boolean },
	) => {
		const { label, defaultValue, required } = param;
		const value = (
			formData[key] !== undefined ? formData[key] : defaultValue || ""
		) as FormDataValue;

		// Determine field type based on default value type
		if (typeof defaultValue === "number") {
			const exceedsSeriesLength =
				sourceSeriesLength !== undefined &&
				sourceSeriesLength > 0 &&
				isNumber(value) &&
				value > sourceSeriesLength;

			return (
				<div key={key} className="grid gap-2">
					<Label htmlFor={key} className="text-left">
						{t(label)}
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
						className={exceedsSeriesLength ? "border-red-500" : ""}
					/>
					{exceedsSeriesLength && (
						<span className="text-xs text-red-500">
							{t("indicatorNode.editDialog.maxSeriesLength", {
								length: sourceSeriesLength,
							})}
						</span>
					)}
				</div>
			);
		}

		// Select box field
		if (
			typeof defaultValue === "string" &&
			(key === "priceSource" || key === "maType")
		) {
			const options = getSelectOptions(key);

			return (
				<div key={key} className="grid gap-2">
					<Label htmlFor={key} className="text-left">
						{t(label)}
						{required && <span className="text-red-500">*</span>}
					</Label>
					<Select
						value={String(value)}
						onValueChange={(newValue) =>
							handleFieldChange(key, newValue as FormDataValue)
						}
					>
						<SelectTrigger id={key}>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{options.map((option) => (
								<SelectItem
									key={String(option.value)}
									value={String(option.value)}
								>
									{t(option.label)}
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

	// Check if there are configurable parameters
	const hasConfigurableParams =
		configInstance && Object.keys(configInstance.params).length > 0;

	return (
		<>
			<Dialog open={isOpen} onOpenChange={onClose} modal={false}>
				<DialogContent
					className="sm:max-w-[425px]"
					onOpenAutoFocus={(e) => e.preventDefault()} // Prevent auto focus, avoid aria-hidden warning
					onInteractOutside={(e) => e.preventDefault()} // Prevent closing dialog when clicking outside
					aria-describedby={undefined}
				>
					<DialogHeader>
						<DialogTitle>
							{configInstance?.displayName || indicatorType}
						</DialogTitle>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						{hasConfigurableParams ? (
							/* Dynamically render form fields for current indicator type */
							configInstance &&
							Object.entries(configInstance.params).map(([key, param]) =>
								renderFormField(key, param),
							)
						) : (
							/* Show hint message when there are no parameters */
							<div className="text-gray-500">
								{t("indicatorNode.editDialog.noParams")}
							</div>
						)}
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={onClose}>
							{t("common.cancel")}
						</Button>
						<Button
							onClick={handleSave}
							disabled={
								isIndicatorConfigExists(editingIndex || undefined) ||
								hasFormValidationErrors()
							}
						>
							{isIndicatorConfigExists(editingIndex || undefined)
								? t("indicatorNode.editDialog.configExists")
								: hasConfigurableParams
									? t("common.save")
									: t("common.confirm")}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Indicator viewer panel */}
			<IndicatorViewerDialog
				isOpen={showIndicatorViewer}
				onClose={() => setShowIndicatorViewer(false)}
				onSelectIndicator={(selectedType: IndicatorType) => {
					setIndicatorType(selectedType);
					// Reinitialize form data
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
