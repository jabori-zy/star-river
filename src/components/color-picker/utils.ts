import type { ColorValue } from "./types";

/**
 * 将十六进制颜色转换为RGB
 */
export function hexToRgb(
	hex: string,
): { r: number; g: number; b: number } | null {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result
		? {
				r: parseInt(result[1], 16),
				g: parseInt(result[2], 16),
				b: parseInt(result[3], 16),
			}
		: null;
}

/**
 * 将RGB转换为十六进制
 */
export function rgbToHex(r: number, g: number, b: number): string {
	return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

/**
 * 将RGB转换为HSL
 */
export function rgbToHsl(
	r: number,
	g: number,
	b: number,
): { h: number; s: number; l: number } {
	r /= 255;
	g /= 255;
	b /= 255;

	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	let h: number;
	let s: number;
	const l = (max + min) / 2;

	if (max === min) {
		h = s = 0; // achromatic
	} else {
		const d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

		switch (max) {
			case r:
				h = (g - b) / d + (g < b ? 6 : 0);
				break;
			case g:
				h = (b - r) / d + 2;
				break;
			case b:
				h = (r - g) / d + 4;
				break;
			default:
				h = 0;
		}

		h /= 6;
	}

	return {
		h: Math.round(h * 360),
		s: Math.round(s * 100),
		l: Math.round(l * 100),
	};
}

/**
 * 将HSL转换为RGB
 */
export function hslToRgb(
	h: number,
	s: number,
	l: number,
): { r: number; g: number; b: number } {
	h /= 360;
	s /= 100;
	l /= 100;

	const hue2rgb = (p: number, q: number, t: number) => {
		if (t < 0) t += 1;
		if (t > 1) t -= 1;
		if (t < 1 / 6) return p + (q - p) * 6 * t;
		if (t < 1 / 2) return q;
		if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
		return p;
	};

	let r: number, g: number, b: number;

	if (s === 0) {
		r = g = b = l; // achromatic
	} else {
		const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		const p = 2 * l - q;
		r = hue2rgb(p, q, h + 1 / 3);
		g = hue2rgb(p, q, h);
		b = hue2rgb(p, q, h - 1 / 3);
	}

	return {
		r: Math.round(r * 255),
		g: Math.round(g * 255),
		b: Math.round(b * 255),
	};
}

/**
 * 将RGB转换为HSV
 */
export function rgbToHsv(
	r: number,
	g: number,
	b: number,
): { h: number; s: number; v: number } {
	r /= 255;
	g /= 255;
	b /= 255;

	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	const diff = max - min;

	let h: number;
	const s = max === 0 ? 0 : diff / max;
	const v = max;

	if (diff === 0) {
		h = 0;
	} else {
		switch (max) {
			case r:
				h = ((g - b) / diff + (g < b ? 6 : 0)) / 6;
				break;
			case g:
				h = ((b - r) / diff + 2) / 6;
				break;
			case b:
				h = ((r - g) / diff + 4) / 6;
				break;
			default:
				h = 0;
		}
	}

	return {
		h: Math.round(h * 360),
		s: Math.round(s * 100),
		v: Math.round(v * 100),
	};
}

/**
 * 将HSV转换为RGB
 */
export function hsvToRgb(
	h: number,
	s: number,
	v: number,
): { r: number; g: number; b: number } {
	h /= 360;
	s /= 100;
	v /= 100;

	const c = v * s;
	const x = c * (1 - Math.abs(((h * 6) % 2) - 1));
	const m = v - c;

	let r: number, g: number, b: number;

	if (h < 1 / 6) {
		[r, g, b] = [c, x, 0];
	} else if (h < 2 / 6) {
		[r, g, b] = [x, c, 0];
	} else if (h < 3 / 6) {
		[r, g, b] = [0, c, x];
	} else if (h < 4 / 6) {
		[r, g, b] = [0, x, c];
	} else if (h < 5 / 6) {
		[r, g, b] = [x, 0, c];
	} else {
		[r, g, b] = [c, 0, x];
	}

	return {
		r: Math.round((r + m) * 255),
		g: Math.round((g + m) * 255),
		b: Math.round((b + m) * 255),
	};
}

/**
 * 验证十六进制颜色格式
 */
export function isValidHex(hex: string): boolean {
	return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
}

/**
 * 验证RGB颜色格式
 */
export function isValidRgb(rgb: string): boolean {
	return /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/.test(rgb);
}

/**
 * 解析RGB字符串
 */
export function parseRgb(
	rgb: string,
): { r: number; g: number; b: number } | null {
	const match = rgb.match(
		/^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/,
	);
	if (!match) return null;

	const r = parseInt(match[1], 10);
	const g = parseInt(match[2], 10);
	const b = parseInt(match[3], 10);

	if (r > 255 || g > 255 || b > 255) return null;

	return { r, g, b };
}

/**
 * 将颜色字符串转换为完整的ColorValue对象
 */
export function parseColor(color: string, alpha: number = 1): ColorValue {
	const hex = color.startsWith("#") ? color : `#${color}`;
	const rgb = hexToRgb(hex) || { r: 0, g: 0, b: 0 };
	const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

	return {
		hex,
		rgb,
		hsl,
		alpha,
	};
}

/**
 * 将颜色和透明度组合为RGBA字符串
 */
export function colorToRgba(hex: string, alpha: number): string {
	const rgb = hexToRgb(hex);
	if (!rgb) return `rgba(0, 0, 0, ${alpha})`;
	return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

/**
 * 根据模式格式化颜色值
 */
export function formatColorByMode(hex: string, mode: string): string {
	const rgb = hexToRgb(hex);
	if (!rgb) return hex;

	switch (mode) {
		case "hex":
			return hex.toUpperCase();
		case "rgb":
			return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
		default:
			return hex;
	}
}

/**
 * 将任意格式的颜色转换为HEX
 */
export function convertToHex(color: string): string {
	// 如果已经是HEX格式
	if (isValidHex(color)) {
		return color;
	}

	// 尝试解析RGB
	if (isValidRgb(color)) {
		const rgb = parseRgb(color);
		if (rgb) {
			return rgbToHex(rgb.r, rgb.g, rgb.b);
		}
	}

	// 如果都不匹配，返回默认值
	return "#000000";
}

/**
 * 验证颜色格式
 */
export function isValidColor(color: string, mode: string): boolean {
	switch (mode) {
		case "hex":
			return isValidHex(color);
		case "rgb":
			return isValidRgb(color);
		default:
			return false;
	}
}

/**
 * 默认预设颜色
 */
export const DEFAULT_PRESET_COLORS = [
	"#FF0000", // 红色
	"#FF8000", // 橙色
	"#FFFF00", // 黄色
	"#80FF00", // 黄绿色
	"#00FF00", // 绿色
	"#00FF80", // 青绿色
	"#00FFFF", // 青色
	"#0080FF", // 天蓝色
	"#0000FF", // 蓝色
	"#8000FF", // 紫蓝色
	"#FF00FF", // 紫色
	"#FF0080", // 粉红色
];
