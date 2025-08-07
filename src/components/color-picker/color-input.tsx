import React from "react";
import { Input } from "@/components/ui/input";
import { ColorModeToggle } from "./color-mode-toggle";
import { RgbInput } from "./rgb-input";
import type { ColorInputProps } from "./types";
import { convertToHex, formatColorByMode, isValidColor } from "./utils";

export function ColorInput({
	value,
	onChange,
	disabled,
	mode = "hex",
	onModeChange,
}: ColorInputProps) {
	const [inputValue, setInputValue] = React.useState(value);
	const [isValid, setIsValid] = React.useState(true);

	// 根据模式格式化显示值
	React.useEffect(() => {
		const formattedValue = formatColorByMode(value, mode);
		setInputValue(formattedValue);
		setIsValid(true);
	}, [value, mode]);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value;
		setInputValue(newValue);

		if (isValidColor(newValue, mode)) {
			setIsValid(true);
			// 将输入的颜色转换为HEX格式传递给父组件
			const hexValue = convertToHex(newValue);
			onChange(hexValue);
		} else {
			setIsValid(false);
		}
	};

	const handleBlur = () => {
		if (!isValid) {
			const formattedValue = formatColorByMode(value, mode);
			setInputValue(formattedValue);
			setIsValid(true);
		}
	};

	const handleModeChange = (newMode: typeof mode) => {
		onModeChange?.(newMode);
	};

	const getPlaceholder = () => {
		switch (mode) {
			case "hex":
				return "#FF0000";
			case "rgb":
				return "rgb(255, 0, 0)";
			default:
				return "#000000";
		}
	};

	const getErrorMessage = () => {
		switch (mode) {
			case "hex":
				return "请输入有效的十六进制颜色值 (例如: #FF0000)";
			case "rgb":
				return "请输入有效的RGB颜色值 (例如: rgb(255, 0, 0))";
			default:
				return "请输入有效的颜色值";
		}
	};

	return (
		<div className="space-y-2">
			{/* 模式切换 */}
			{onModeChange && (
				<div className="flex justify-start">
					<ColorModeToggle mode={mode} onModeChange={handleModeChange} />
				</div>
			)}

			{mode === "rgb" ? (
				<RgbInput value={value} onChange={onChange} disabled={disabled} />
			) : (
				<div className="space-y-2">
					<Input
						id="color-input"
						type="text"
						value={inputValue}
						onChange={handleInputChange}
						onBlur={handleBlur}
						disabled={disabled}
						placeholder={getPlaceholder()}
						className={`font-mono ${!isValid ? "border-destructive" : ""}`}
					/>
					{!isValid && (
						<p className="text-xs text-destructive">{getErrorMessage()}</p>
					)}
				</div>
			)}
		</div>
	);
}
