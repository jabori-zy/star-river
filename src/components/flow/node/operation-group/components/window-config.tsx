import type React from "react";
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
	disabled?: boolean;
	disabledMessage?: string;
	className?: string;
}

export const WindowConfig: React.FC<WindowConfigProps> = ({
	windowConfig,
	onChange,
	minSize = 1,
	maxSize = 200,
	limitInfo,
	disabled = false,
	disabledMessage,
	className,
}) => {
	// Get current size value based on window type
	const currentSize =
		windowConfig.windowType === "rolling"
			? windowConfig.windowSize
			: windowConfig.initialWindowSize;

	const handleTypeChange = (windowType: "rolling" | "expanding") => {
		// Convert between rolling and expanding config
		if (windowType === "rolling") {
			onChange({
				windowType: "rolling",
				windowSize: currentSize,
			});
		} else {
			onChange({
				windowType: "expanding",
				initialWindowSize: currentSize,
			});
		}
	};

	const handleSizeChange = (size: number) => {
		if (windowConfig.windowType === "rolling") {
			onChange({
				windowType: "rolling",
				windowSize: size,
			});
		} else {
			onChange({
				windowType: "expanding",
				initialWindowSize: size,
			});
		}
	};

	return (
		<div className={cn("space-y-4", disabled && "opacity-60", className)}>
			{/* <Label className="text-sm font-medium">Window</Label> */}

			{/* Window Type */}
			<div className="space-y-2">
				<Label className="text-xs text-muted-foreground">Window Type</Label>
				<RadioGroup
					value={windowConfig.windowType}
					onValueChange={(val) => handleTypeChange(val as "rolling" | "expanding")}
					className="flex gap-4"
					disabled={disabled}
				>
					<div className="flex items-center space-x-2">
						<RadioGroupItem value="rolling" id="window-type-rolling" disabled={disabled} />
						<Label htmlFor="window-type-rolling" className={cn("text-sm font-normal", disabled ? "cursor-not-allowed" : "cursor-pointer")}>
							Rolling
						</Label>
					</div>
					<div className="flex items-center space-x-2">
						<RadioGroupItem value="expanding" id="window-type-expanding" disabled={disabled} />
						<Label htmlFor="window-type-expanding" className={cn("text-sm font-normal", disabled ? "cursor-not-allowed" : "cursor-pointer")}>
							Expanding
						</Label>
					</div>
				</RadioGroup>
			</div>

			{/* Window Size */}
			<div className="space-y-2">
				<div className="flex items-center justify-between">
					<Label className="text-xs text-muted-foreground">
						{windowConfig.windowType === "expanding" ? "Initial Window Size" : "Window Size"}
					</Label>
					<Input
						type="number"
						value={currentSize}
						onChange={(e) => handleSizeChange(Number(e.target.value))}
						min={minSize}
						max={maxSize}
						className="w-20 h-8 text-sm text-right"
						disabled={disabled}
					/>
				</div>
				<Slider
					value={[currentSize]}
					onValueChange={(values) => handleSizeChange(values[0])}
					min={minSize}
					max={maxSize}
					step={1}
					className="w-full"
					disabled={disabled}
				/>
				<div className="flex justify-between text-xs text-muted-foreground">
					<span>{minSize}</span>
					<span>{maxSize}</span>
				</div>
				{/* Disabled message for child groups */}
				{disabled && disabledMessage && (
					<p className="text-xs text-muted-foreground mt-2 flex items-start gap-1">
						<CircleAlert className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
						<span>{disabledMessage}</span>
					</p>
				)}
				{/* Limit warning (only show when not disabled) */}
				{!disabled && limitInfo && (
					<p className="text-xs text-yellow-600 mt-2 flex items-start gap-1">
						<CircleAlert className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
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
		</div>
	);
};

export default WindowConfig;
