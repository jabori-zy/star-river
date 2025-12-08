import { useEffect, useMemo, useState } from "react";
import { DateTimePicker24h } from "@/components/datetime-picker";
import { formatDate } from "@/components/flow/node/node-utils";
import { PercentInput } from "@/components/input-components/percent-input";
import MultipleSelector, {
	type Option,
} from "@/components/select-components/multi-select";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ComparisonSymbol } from "@/types/node/if-else-node";
import { VariableValueType } from "@/types/variable";

interface ConstantInputProps {
	className?: string;
	value: number | string | boolean | string[]; // Support multiple types
	onValueChange: (value: number | string | boolean) => void; // Callback supports multiple types
	valueType: VariableValueType; // Variable value type
	comparisonSymbol?: ComparisonSymbol | null; // Comparison symbol (for special case handling)
	leftVarValueType?: VariableValueType | null; // Left variable type (for isIn/isNotIn prompt)
}

const ConstantInput: React.FC<ConstantInputProps> = ({
	className,
	value,
	onValueChange,
	valueType,
	comparisonSymbol,
	leftVarValueType,
}) => {
	// Local state management for number type
	const [localValue, setLocalValue] = useState<string>(value.toString());
	const [isFocused, setIsFocused] = useState(false);

	useEffect(() => {
		// Only update local value when component is not focused, to avoid overriding user input
		// Only applies to number and percentage types
		if (
			!isFocused &&
			(valueType === VariableValueType.NUMBER ||
				valueType === VariableValueType.PERCENTAGE)
		) {
			setLocalValue(value.toString());
		}
	}, [value, isFocused, valueType]);

	// Number input handling
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const inputValue = e.target.value;
		setLocalValue(inputValue);

		// If input is not empty and is a valid number, immediately notify parent component
		if (inputValue !== "" && !Number.isNaN(Number(inputValue))) {
			onValueChange(Number(inputValue));
		}
	};

	const handleBlur = () => {
		setIsFocused(false);

		// Handle input value when focus is lost
		if (localValue === "") {
			// If input is empty, default to 0
			setLocalValue("0");
			onValueChange(0);
		} else if (Number.isNaN(Number(localValue))) {
			// If input is invalid, reset to original value
			setLocalValue(value.toString());
		} else {
			// Ensure value is synchronized to parent component
			const numValue = Number(localValue);
			if (numValue !== value) {
				onValueChange(numValue);
			}
		}
	};

	const handleFocus = () => {
		setIsFocused(true);
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			// Prevent default behavior, simulate focus loss
			e.preventDefault();
			(e.target as HTMLInputElement).blur();
		}
		if (e.key === "Escape") {
			// Prevent default behavior, reset value and lose focus
			e.preventDefault();
			setLocalValue(value.toString());
			(e.target as HTMLInputElement).blur();
		}
	};

	// Convert string to Date object
	const parseDatetime = (datetimeString: string): Date | undefined => {
		if (!datetimeString) return undefined;
		try {
			return new Date(datetimeString);
		} catch {
			return undefined;
		}
	};

	// Time selection handling
	const handleTimeChange = (date: Date | undefined) => {
		const formattedDate = formatDate(date);
		onValueChange(formattedDate);
	};

	// String input handling
	const handleStringChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		onValueChange(e.target.value);
	};

	const handleStringBlur = (e: React.FocusEvent<HTMLInputElement>) => {
		// Trim spaces on both sides when focus is lost
		const trimmedValue = e.target.value.trim();
		if (trimmedValue !== e.target.value) {
			onValueChange(trimmedValue);
		}
	};

	// ENUM option handling
	const enumOptions = useMemo<Option[]>(() => {
		if (!Array.isArray(value)) return [];
		return value.map((val) => ({
			value: val?.toString?.() ?? "",
			label: val?.toString?.() ?? "",
		}));
	}, [value]);

	const handleEnumChange = (options: Option[]) => {
		const values = options.map((opt) => opt.value);
		onValueChange(JSON.stringify(values));
	};

	// Get placeholder for isIn/isNotIn
	const getIsInPlaceholder = (): string => {
		switch (leftVarValueType) {
			case VariableValueType.NUMBER:
				return "输入或选择数字 (如: 1, 2, 3)";
			case VariableValueType.STRING:
				return "输入或选择字符串";
			case VariableValueType.BOOLEAN:
				return "选择 true 或 false";
			case VariableValueType.TIME:
				return "选择时间";
			case VariableValueType.PERCENTAGE:
				return "输入百分比 (如: 5, 10)";
			default:
				return "选择或输入值";
		}
	};

	// Prioritize comparison symbol: use MultipleSelector for isIn or isNotIn
	if (
		comparisonSymbol === ComparisonSymbol.isIn ||
		comparisonSymbol === ComparisonSymbol.isNotIn
	) {
		return (
			<MultipleSelector
				value={enumOptions}
				onChange={handleEnumChange}
				placeholder={getIsInPlaceholder()}
				creatable={true}
				className={cn(className, "min-h-9")}
				hidePlaceholderWhenSelected
			/>
		);
	}

	// Render different input components based on type
	switch (valueType) {
		case VariableValueType.STRING:
			return (
				<Input
					type="text"
					className={`${className} h-8 text-xs font-normal hover:bg-gray-200`}
					value={typeof value === "string" ? value : ""}
					onChange={handleStringChange}
					onBlur={handleStringBlur}
					placeholder="输入字符串"
				/>
			);

		case VariableValueType.BOOLEAN:
			return (
				<Select
					value={typeof value === "boolean" ? value.toString() : "true"}
					onValueChange={(val) => onValueChange(val === "true")}
				>
					<SelectTrigger
						className={`${className} h-8 text-xs font-normal hover:bg-gray-200`}
					>
						<SelectValue placeholder="选择布尔值" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="true">true</SelectItem>
						<SelectItem value="false">false</SelectItem>
					</SelectContent>
				</Select>
			);

		case VariableValueType.TIME: {
			const dateValue =
				typeof value === "string" ? parseDatetime(value) : undefined;

			return (
				<div className={className}>
					<style>{`
					/* Override time picker button style */
					.time-picker-override button {
						background-color: transparent !important;
						border-color: rgb(209 213 219) !important;
						height: 2rem !important;
						font-size: 0.75rem !important;
						line-height: 1rem !important;
					}
					.time-picker-override button:hover {
						background-color: rgb(229 231 235) !important;
					}
				`}</style>
					<div className="time-picker-override">
						<DateTimePicker24h
							value={dateValue}
							onChange={handleTimeChange}
							showSeconds={true}
						/>
					</div>
				</div>
			);
		}

		case VariableValueType.ENUM:
			return (
				<MultipleSelector
					value={enumOptions}
					onChange={handleEnumChange}
					placeholder="选择或输入枚举值"
					creatable={true}
					className={`${className} min-h-9 h-9`}
					hidePlaceholderWhenSelected
				/>
			);

		case VariableValueType.PERCENTAGE:
			return (
				<PercentInput
					value={localValue}
					onChange={(val) => {
						setLocalValue(val);
						if (val !== "" && !Number.isNaN(Number(val))) {
							onValueChange(Number(val));
						}
					}}
					onBlur={() => {
						setIsFocused(false);
						if (localValue === "") {
							setLocalValue("0");
							onValueChange(0);
						} else if (Number.isNaN(Number(localValue))) {
							setLocalValue(value.toString());
						} else {
							const numValue = Number(localValue);
							if (numValue !== value) {
								onValueChange(numValue);
							}
						}
					}}
					onFocus={() => setIsFocused(true)}
					// placeholder="e.g., 5"
					className={className}
				/>
			);

		case VariableValueType.NUMBER:
		default:
			return (
				<Input
					type="number"
					className={`${className} h-8 text-xs font-normal hover:bg-gray-200`}
					value={localValue}
					onChange={handleInputChange}
					onBlur={handleBlur}
					onFocus={handleFocus}
					onKeyDown={handleKeyDown}
				/>
			);
	}
};

export default ConstantInput;
