import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";

interface ConstantInputProps {
	className?: string;
	value: number;
	onValueChange: (value: number) => void;
}

const ConstantInput: React.FC<ConstantInputProps> = ({
	className,
	value,
	onValueChange,
}) => {
	// 使用字符串来保存本地输入状态，这样可以处理空值和避免格式问题
	const [localValue, setLocalValue] = useState<string>(value.toString());
	const [isFocused, setIsFocused] = useState(false);

	useEffect(() => {
		// 只有在组件不处于焦点状态时才更新本地值，避免用户输入时被覆盖
		if (!isFocused) {
			setLocalValue(value.toString());
		}
	}, [value, isFocused]);

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
