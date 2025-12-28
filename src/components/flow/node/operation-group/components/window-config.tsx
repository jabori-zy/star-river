import type React from "react";
import { useEffect } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { CircleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WindowConfig as WindowConfigType } from "@/types/node/group/operation-group";

// Limit info for window size
export interface WindowSizeLimitInfo {
	limitType: "parent-input" | "upstream-output";
	nodeName: string;
	size: number;
}

interface WindowConfigProps {
	windowConfig: WindowConfigType;
	onChange: (config: WindowConfigType) => void;
	minSize?: number;
	maxSize?: number;
	limitInfo?: WindowSizeLimitInfo | null;
	className?: string;
}

export const WindowConfig: React.FC<WindowConfigProps> = ({
	windowConfig,
	onChange,
	minSize = 1,
	maxSize = 200,
	limitInfo,
	className,
}) => {
	// Get current size value (only applicable for rolling window)
	const currentSize =
		windowConfig.windowType === "rolling" ? windowConfig.windowSize : minSize;

	// Auto-clamp window size when maxSize changes (only for rolling window)
	useEffect(() => {
		if (windowConfig.windowType === "rolling" && currentSize > maxSize) {
			onChange({
				windowType: "rolling",
				windowSize: maxSize,
			});
		}
	}, [maxSize, currentSize, windowConfig.windowType, onChange]);

	const handleTypeChange = (windowType: "rolling" | "expanding") => {
		if (windowType === "rolling") {
			// Clamp the value when switching to rolling
			const clampedSize = Math.max(minSize, Math.min(maxSize, currentSize));
			onChange({
				windowType: "rolling",
				windowSize: clampedSize,
			});
		} else {
			// Expanding window has no size configuration
			onChange({
				windowType: "expanding",
			});
		}
	};

	const handleSizeChange = (size: number) => {
		// Clamp the value between minSize and maxSize
		const clampedSize = Math.max(minSize, Math.min(maxSize, size));
		onChange({
			windowType: "rolling",
			windowSize: clampedSize,
		});
	};

	return (
		<div className={cn("space-y-4", className)}>
			{/* Window Type */}
			<div className="space-y-2">
				<Label className="text-xs text-muted-foreground">Window Type</Label>
				<RadioGroup
					value={windowConfig.windowType}
					onValueChange={(val) => handleTypeChange(val as "rolling" | "expanding")}
					className="flex gap-4"
				>
					<div className="flex items-center space-x-2">
						<RadioGroupItem value="rolling" id="window-type-rolling" />
						<Label htmlFor="window-type-rolling" className="text-sm font-normal cursor-pointer">
							Rolling
						</Label>
					</div>
					<div className="flex items-center space-x-2">
						<RadioGroupItem value="expanding" id="window-type-expanding" />
						<Label htmlFor="window-type-expanding" className="text-sm font-normal cursor-pointer">
							Expanding
						</Label>
					</div>
				</RadioGroup>
			</div>

			{/* Window Size - Only show for rolling window */}
			{windowConfig.windowType === "rolling" && (
				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<Label className="text-xs text-muted-foreground">Window Size</Label>
						<Input
							type="number"
							value={currentSize}
							onChange={(e) => handleSizeChange(Number(e.target.value))}
							min={minSize}
							max={maxSize}
							className="w-20 h-8 text-sm text-right"
						/>
					</div>
					<Slider
						value={[currentSize]}
						onValueChange={(values) => handleSizeChange(values[0])}
						min={minSize}
						max={maxSize}
						step={1}
						className="w-full"
					/>
					<div className="flex justify-between text-xs text-muted-foreground">
						<span>{minSize}</span>
						<span>{maxSize}</span>
					</div>
					{/* Limit warning */}
					{limitInfo && (
						<p className="text-xs text-yellow-600 mt-2 flex items-start gap-1">
							<CircleAlert className="h-3.5 w-3.5 shrink-0 mt-0.5" />
							{limitInfo.limitType === "parent-input" ? (
								<span>
									Limited by parent <span className="text-blue-600 font-medium">{limitInfo.nodeName}</span> input window size: {limitInfo.size}
								</span>
							) : (
								<span>
									Limited by upstream <span className="text-blue-600 font-medium">{limitInfo.nodeName}</span> output window size: {limitInfo.size}
								</span>
							)}
						</p>
					)}
				</div>
			)}
		</div>
	);
};

export default WindowConfig;
