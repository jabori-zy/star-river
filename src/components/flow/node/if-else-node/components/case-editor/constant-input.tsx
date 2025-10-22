import { useEffect, useMemo, useState } from "react";
import { DateTimePicker24h } from "@/components/datetime-picker";
import { formatDate } from "@/components/flow/node/node-utils";
import { PercentInput } from "@/components/percent-input";
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
import { VariableValueType } from "@/types/variable";

interface ConstantInputProps {
	className?: string;
	value: number | string | boolean | string[]; // 支持多种类型
	onValueChange: (value: number | string | boolean) => void; // 回调支持多种类型
	valueType: VariableValueType; // 变量值类型
}

const ConstantInput: React.FC<ConstantInputProps> = ({
	className,
	value,
	onValueChange,
	valueType,
}) => {
	// 数字类型的本地状态管理
	const [localValue, setLocalValue] = useState<string>(value.toString());
	const [isFocused, setIsFocused] = useState(false);

	useEffect(() => {
		// 只有在组件不处于焦点状态时才更新本地值，避免用户输入时被覆盖
		// 只对数字和百分比类型生效
		if (
			!isFocused &&
			(valueType === VariableValueType.NUMBER ||
				valueType === VariableValueType.PERCENTAGE)
		) {
			setLocalValue(value.toString());
		}
	}, [value, isFocused, valueType]);

	// 数字输入处理
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const inputValue = e.target.value;
		setLocalValue(inputValue);

		// 如果输入不为空且是有效数字，立即通知父组件
		if (inputValue !== "" && !Number.isNaN(Number(inputValue))) {
			onValueChange(Number(inputValue));
		}
	};

	const handleBlur = () => {
		setIsFocused(false);

		// 失去焦点时处理输入值
		if (localValue === "") {
			// 如果输入为空，默认设置为0
			setLocalValue("0");
			onValueChange(0);
		} else if (isNaN(Number(localValue))) {
			// 如果输入无效，重置为原始值
			setLocalValue(value.toString());
		} else {
			// 确保数值同步到父组件
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
			// 阻止默认行为，模拟失去焦点
			e.preventDefault();
			(e.target as HTMLInputElement).blur();
		}
		if (e.key === "Escape") {
			// 阻止默认行为，重置值并失去焦点
			e.preventDefault();
			setLocalValue(value.toString());
			(e.target as HTMLInputElement).blur();
		}
	};

	// 将字符串转换为Date对象
	const parseDatetime = (datetimeString: string): Date | undefined => {
		if (!datetimeString) return undefined;
		try {
			return new Date(datetimeString);
		} catch {
			return undefined;
		}
	};

	// 时间选择处理
	const handleTimeChange = (date: Date | undefined) => {
		const formattedDate = formatDate(date);
		onValueChange(formattedDate);
	};

	// 字符串输入处理
	const handleStringChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		onValueChange(e.target.value);
	};

	const handleStringBlur = (e: React.FocusEvent<HTMLInputElement>) => {
		// 失去焦点时 trim 左右空格
		const trimmedValue = e.target.value.trim();
		if (trimmedValue !== e.target.value) {
			onValueChange(trimmedValue);
		}
	};

	// ENUM 选项处理
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

	// 根据类型渲染不同的输入组件
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
					value={
						typeof value === "boolean" ? value.toString() : "true"
					}
					onValueChange={(val) => onValueChange(val === "true")}
				>
					<SelectTrigger className={`${className} h-8 text-xs font-normal hover:bg-gray-200`}>
						<SelectValue placeholder="选择布尔值" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="true">true</SelectItem>
						<SelectItem value="false">false</SelectItem>
					</SelectContent>
				</Select>
			);

		case VariableValueType.TIME:
			const dateValue =
				typeof value === "string" ? parseDatetime(value) : undefined;

			return (
				<div className={className}>
					<style>{`
						/* 覆盖时间选择器按钮样式 */
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
					value={typeof value === "number" ? value.toString() : "0"}
					onChange={(val) => onValueChange(val)}
					placeholder="如: 5"
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
