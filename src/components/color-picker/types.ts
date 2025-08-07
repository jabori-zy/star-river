export interface ColorValue {
	hex: string;
	rgb: {
		r: number;
		g: number;
		b: number;
	};
	hsl: {
		h: number;
		s: number;
		l: number;
	};
	alpha: number;
}

export interface ColorPickerProps {
	value?: string;
	onChange?: (color: string) => void;
	onChangeComplete?: (color: ColorValue) => void;
	disabled?: boolean;
	showAlpha?: boolean;
	showPresets?: boolean;
	presetColors?: string[];
	className?: string;
}

export interface PresetColorsProps {
	colors: string[];
	selectedColor: string;
	onColorSelect: (color: string) => void;
}

export interface AlphaSliderProps {
	color: string;
	alpha: number;
	onChange: (alpha: number) => void;
}

export type ColorMode = "hex" | "rgb";

export interface ColorInputProps {
	value: string;
	onChange: (value: string) => void;
	disabled?: boolean;
	mode?: ColorMode;
	onModeChange?: (mode: ColorMode) => void;
}

export interface ColorModeToggleProps {
	mode: ColorMode;
	onModeChange: (mode: ColorMode) => void;
}
