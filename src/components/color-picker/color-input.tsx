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

	// Format display value based on mode
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
			// Convert input color to HEX format and pass to parent component
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
				return "Please enter a valid hexadecimal color value (e.g.: #FF0000)";
			case "rgb":
				return "Please enter a valid RGB color value (e.g.: rgb(255, 0, 0))";
			default:
				return "Please enter a valid color value";
		}
	};

	return (
		<div className="space-y-2">
			{/* Mode toggle */}
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
