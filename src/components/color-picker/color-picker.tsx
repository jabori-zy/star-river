import React from "react";
import { HexColorPicker } from "react-colorful";
import { Button } from "@/components/ui/button";
import "./color-picker.css";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { AlphaSlider } from "./alpha-slider";
import { ColorInput } from "./color-input";
import { PresetColors } from "./preset-colors";
import type { ColorMode, ColorPickerProps } from "./types";
import { colorToRgba, DEFAULT_PRESET_COLORS, parseColor } from "./utils";

export function ColorPicker({
	value = "#000000",
	onChange,
	onChangeComplete,
	disabled = false,
	showAlpha = true,
	showPresets = true,
	presetColors = DEFAULT_PRESET_COLORS,
	className,
}: ColorPickerProps) {
	const [isOpen, setIsOpen] = React.useState(false);
	const [currentColor, setCurrentColor] = React.useState(value);
	const [alpha, setAlpha] = React.useState(1);
	const [colorMode, setColorMode] = React.useState<ColorMode>("hex");

	React.useEffect(() => {
		setCurrentColor(value);
	}, [value]);

	const handleColorChange = (newColor: string) => {
		setCurrentColor(newColor);
		onChange?.(newColor);
	};

	const handleAlphaChange = (newAlpha: number) => {
		setAlpha(newAlpha);
	};

	const handleComplete = () => {
		const colorValue = parseColor(currentColor, alpha);
		onChangeComplete?.(colorValue);
		setIsOpen(false);
	};

	const handlePresetSelect = (color: string) => {
		handleColorChange(color);
	};

	const displayColor = showAlpha
		? colorToRgba(currentColor, alpha)
		: currentColor;

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<div
					className={cn(
						"w-8 h-8 rounded border border-border cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all",
						disabled && "cursor-not-allowed opacity-50",
						className,
					)}
					style={{ backgroundColor: displayColor }}
				/>
			</PopoverTrigger>

			<PopoverContent className="w-64 p-2" align="start">
				<div className="space-y-3">
					{/* Color picker */}
					<div className="h-40 flex justify-center color-picker-container">
						<HexColorPicker color={currentColor} onChange={handleColorChange} />
					</div>

					{/* Color value input */}
					<ColorInput
						value={currentColor}
						onChange={handleColorChange}
						disabled={disabled}
						mode={colorMode}
						onModeChange={setColorMode}
					/>

					{/* Alpha slider */}
					{showAlpha && (
						<>
							<Separator />
							<AlphaSlider
								color={currentColor}
								alpha={alpha}
								onChange={handleAlphaChange}
							/>
						</>
					)}

					{/* Preset colors */}
					{showPresets && presetColors.length > 0 && (
						<>
							<PresetColors
								colors={presetColors}
								selectedColor={currentColor}
								onColorSelect={handlePresetSelect}
							/>
						</>
					)}

					{/* Action buttons
          <Separator />
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleComplete}
              className="flex-1"
            >
              Confirm
            </Button>
          </div> */}
				</div>
			</PopoverContent>
		</Popover>
	);
}
