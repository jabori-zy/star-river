import type React from "react";
import { useMemo, useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { SelectWithSearch } from "@/components/select-components/select-with-search";
import { cn } from "@/lib/utils";
import { CircleAlert } from "lucide-react";
import type { InputArrayType, Operation } from "@/types/operation";
import {
	getOperationParamsMeta,
	getDefaultOperation,
	operationMetaMap,
	type ParamMeta,
} from "@/types/operation/operation-meta";

interface OperationSelectorProps {
	inputArrayType: InputArrayType;
	operation: Operation;
	onChange: (operation: Operation) => void;
	inputCount?: number; // Number of input series (for Nary operations with weights)
	className?: string;
}

// Get available operations based on input array type
const getOperationOptions = (inputArrayType: InputArrayType): string[] => {
	return Object.keys(operationMetaMap[inputArrayType] ?? {});
};

// Weights input component - uses internal state to allow free text editing
const WeightsInput: React.FC<{
	paramKey: string;
	label?: string;
	description?: string;
	value: unknown;
	onChange: (key: string, value: unknown) => void;
	maxCount?: number; // Maximum number of weights allowed
}> = ({ paramKey, label, description, value, onChange, maxCount }) => {
	// Internal state for text input
	const [inputText, setInputText] = useState(() =>
		Array.isArray(value) ? (value as number[]).join(", ") : "",
	);
	const [error, setError] = useState<string | null>(null);

	// Sync internal state when external value changes (e.g., operation type change)
	useEffect(() => {
		const newText = Array.isArray(value) ? (value as number[]).join(", ") : "";
		setInputText(newText);
	}, [value]);

	// Count current weights in input text
	const getCurrentWeightCount = (text: string): number => {
		return text
			.split(",")
			.map((s) => s.trim())
			.filter((s) => s !== "" && !Number.isNaN(Number(s))).length;
	};

	// Parse and update parent on blur
	const handleBlur = () => {
		const weights = inputText
			.split(",")
			.map((s) => s.trim())
			.filter((s) => s !== "") // Filter out empty strings first
			.map((s) => Number(s))
			.filter((n) => !Number.isNaN(n));
		onChange(paramKey, weights);
		// Update input text to cleaned format
		setInputText(weights.join(", "));
		// Clear error on blur
		setError(null);
	};

	// Only allow numbers, commas, spaces, dots, and minus signs
	// Also check if adding would exceed maxCount
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const filtered = e.target.value.replace(/[^0-9,.\-\s]/g, "");

		// Check if we're trying to add more weights than allowed
		if (maxCount !== undefined && maxCount > 0) {
			const newCount = getCurrentWeightCount(filtered);
			if (newCount > maxCount) {
				setError(`Number of weights cannot exceed the number of input series (${maxCount})`);
				return; // Block input
			}
			setError(null);
		}

		setInputText(filtered);
	};

	return (
		<>
			<div className="flex items-center gap-2">
				<Label className="text-xs text-muted-foreground w-16">{label || paramKey}</Label>
				<Input
					type="text"
					value={inputText}
					onChange={handleInputChange}
					onBlur={handleBlur}
					placeholder="1, 2, 3"
					className="h-8 text-sm flex-1"
				/>
			</div>
			{error && (
				<p className="text-xs text-yellow-600 flex items-center gap-1">
					<CircleAlert className="h-3.5 w-3.5" />
					{error}
				</p>
			)}
			{!error && description && <p className="text-xs text-muted-foreground">{description}</p>}
		</>
	);
};

// Single parameter input renderer
const ParamInput: React.FC<{
	param: ParamMeta;
	value: unknown;
	onChange: (key: string, value: unknown) => void;
	inputCount?: number; // For weights validation
}> = ({ param, value, onChange, inputCount }) => {
	const { key, type, label, description, min, max, step } = param;

	if (type === "boolean") {
		return (
			<div className="flex items-center gap-2">
				<Checkbox
					id={`param-${key}`}
					checked={value as boolean}
					onCheckedChange={(checked) => onChange(key, checked === true)}
				/>
				<Label htmlFor={`param-${key}`} className="text-sm cursor-pointer">
					{label || key}
				</Label>
			</div>
		);
	}

	if (type === "weights") {
		return (
			<WeightsInput
				paramKey={key}
				label={label}
				description={description}
				value={value}
				onChange={onChange}
				maxCount={inputCount}
			/>
		);
	}

	// Default: number input
	return (
		<>
			<div className="flex items-center gap-2">
				<Label className="text-xs text-muted-foreground w-16">{label || key}</Label>
				<Input
					type="number"
					value={value as number}
					onChange={(e) => onChange(key, Number(e.target.value))}
					min={min}
					max={max}
					step={step}
					className="h-8 text-sm flex-1"
				/>
			</div>
			{description && <p className="text-xs text-muted-foreground">{description}</p>}
		</>
	);
};

// Parameter editor component - dynamic rendering based on metadata
const OperationParams: React.FC<{
	operation: Operation;
	onChange: (operation: Operation) => void;
	inputCount?: number; // For weights validation
}> = ({ operation, onChange, inputCount }) => {
	const paramsMeta = getOperationParamsMeta(operation.type);

	if (paramsMeta.length === 0) {
		return null;
	}

	const handleParamChange = (key: string, value: unknown) => {
		onChange({ ...operation, [key]: value });
	};

	return (
		<div className="space-y-2 mt-3 p-3 bg-gray-50 rounded-md">
			{paramsMeta.map((param) => (
				<ParamInput
					key={param.key}
					param={param}
					value={(operation as Record<string, unknown>)[param.key]}
					onChange={handleParamChange}
					inputCount={inputCount}
				/>
			))}
		</div>
	);
};

export const OperationSelector: React.FC<OperationSelectorProps> = ({
	inputArrayType,
	operation,
	onChange,
	inputCount,
	className,
}) => {
	const operationOptions = getOperationOptions(inputArrayType);

	// Convert to SelectWithSearch options format
	const selectOptions = useMemo(
		() =>
			operationOptions.map((op) => ({
				value: op,
				label: op,
			})),
		[operationOptions],
	);

	const handleOperationTypeChange = (type: string) => {
		if (!type) return;
		const newOperation = getDefaultOperation(type, inputArrayType);
		onChange(newOperation);
	};

	return (
		<div className={cn("space-y-2", className)}>
			<Label htmlFor="operation" className="text-sm font-medium">Operation</Label>
			<SelectWithSearch
				options={selectOptions}
				value={operation.type}
				onValueChange={handleOperationTypeChange}
				placeholder="Select operation"
				searchPlaceholder="Search operation..."
				emptyMessage="No operation found."
				className="shadow-none"
			/>

			<OperationParams operation={operation} onChange={onChange} inputCount={inputCount} />
		</div>
	);
};

export default OperationSelector;
