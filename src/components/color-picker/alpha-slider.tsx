import { Slider } from "@/components/ui/slider";
import type { AlphaSliderProps } from "./types";

export function AlphaSlider({ color, alpha, onChange }: AlphaSliderProps) {
	const handleAlphaChange = (values: number[]) => {
		onChange(values[0] / 100);
	};

	const gradientStyle = {
		background: `linear-gradient(to right, 
      transparent 0%, 
      ${color} 100%
    )`,
	};

	const checkerboardStyle = {
		backgroundImage: `
      linear-gradient(45deg, #ccc 25%, transparent 25%), 
      linear-gradient(-45deg, #ccc 25%, transparent 25%), 
      linear-gradient(45deg, transparent 75%, #ccc 75%), 
      linear-gradient(-45deg, transparent 75%, #ccc 75%)
    `,
		backgroundSize: "8px 8px",
		backgroundPosition: "0 0, 0 4px, 4px -4px, -4px 0px",
	};

	return (
		<div className="space-y-3">
			<div className="flex items-center gap-3">
				<div className="relative flex-1">
					{/* 棋盘背景 */}
					<div
						className="absolute inset-0 rounded-md"
						style={checkerboardStyle}
					/>

					{/* 颜色渐变 */}
					<div className="absolute inset-0 rounded-md" style={gradientStyle} />

					{/* 滑块 */}
					<Slider
						value={[alpha * 100]}
						onValueChange={handleAlphaChange}
						max={100}
						min={0}
						step={1}
						className="relative z-10 [&>*]:bg-transparent"
						showTooltip
						tooltipContent={(value) => `${Math.round(value)}%`}
					/>
				</div>

				<span className="text-xs text-muted-foreground min-w-[3rem] text-right">
					{Math.round(alpha * 100)}%
				</span>
			</div>
		</div>
	);
}
