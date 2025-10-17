import { useEffect, useState } from "react";
import { DateTimePicker24h } from "@/components/datetime-picker";
import { formatDate } from "@/components/flow/node/node-utils";
import { Input } from "@/components/ui/input";

interface ConstantInputProps {
	className?: string;
	value: number | string; // 支持数字和字符串
	onValueChange: (value: number | string) => void; // 支持数字和字符串
	inputType?: "number" | "time"; // 输入类型：数字或时间
}

const ConstantInput: React.FC<ConstantInputProps> = ({
	className,
	value,
	onValueChange,
	inputType = "number", // 默认为数字类型
}) => {
	// 使用字符串来保存本地输入状态，这样可以处理空值和避免格式问题
	const [localValue, setLocalValue] = useState<string>(value.toString());
	const [isFocused, setIsFocused] = useState(false);

	useEffect(() => {
		// 只有在组件不处于焦点状态时才更新本地值，避免用户输入时被覆盖
		// 时间类型不需要更新 localValue，因为它使用独立的状态管理
		if (!isFocused && inputType === "number") {
			setLocalValue(value.toString());
		}
	}, [value, isFocused, inputType]);

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

	// 将字符串转换为Date对象（参考 time-range-selector.tsx）
	const parseDatetime = (datetimeString: string): Date | undefined => {
		if (!datetimeString) return undefined;
		try {
			return new Date(datetimeString);
		} catch {
			return undefined;
		}
	};

	// 时间选择处理（使用 formatDate 格式化，参考 time-range-selector.tsx）
	const handleTimeChange = (date: Date | undefined) => {
		// 将 Date 对象格式化为字符串保存
		const formattedDate = formatDate(date);
		onValueChange(formattedDate);
	};

	// 如果是时间类型，渲染时间选择器
	if (inputType === "time") {
		// 将字符串转换为 Date 对象
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
	}

	// 默认渲染数字输入
	return (
		<Input
			type="text" // 改为text类型以获得更好的控制
			inputMode="numeric" // 在移动设备上显示数字键盘
			pattern="[0-9]*" // 提示输入数字
			className={`${className} h-8 text-xs font-normal hover:bg-gray-200`}
			value={localValue}
			onChange={handleInputChange}
			onBlur={handleBlur}
			onFocus={handleFocus}
			onKeyDown={handleKeyDown}
		/>
	);
};

export default ConstantInput;
