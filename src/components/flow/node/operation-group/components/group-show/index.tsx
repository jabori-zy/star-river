import type React from "react";
import { ArrowDown, ArrowRight, RulerDimensionLine, BetweenVerticalStart, Settings2, CircleAlert } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { OperationGroupData, WindowConfig, FillingMethod } from "@/types/node/group/operation-group";
import { InputConfigItem } from "./input-config-item";
import { OutputConfigItem } from "./output-config-item";

interface GroupShowProps {
	data: OperationGroupData;
}

// Get window config display text
const getWindowDisplayText = (windowConfig: WindowConfig): string => {
	if (windowConfig.windowType === "rolling") {
		return `Rolling: ${windowConfig.windowSize}`;
	}
	return `Expanding: ${windowConfig.initialWindowSize}`;
};

// Get filling method display text
const getFillingMethodDisplayText = (method: FillingMethod): string => {
	const methodMap: Record<FillingMethod, string> = {
		FFill: "Forward Fill",
		BFill: "Backward Fill",
		Zero: "Zero Fill",
		Mean: "Mean Fill",
	};
	return methodMap[method] || method;
};

// Window and Filling section
const WindowFillingSection: React.FC<{
	inputWindow: WindowConfig;
	fillingMethod: FillingMethod;
}> = ({ inputWindow, fillingMethod }) => {
	return (
		<div className="space-y-1">
			<div className="flex items-center gap-2">
				<Settings2 className="w-3.5 h-3.5 text-purple-500" />
				<Label className="text-sm font-bold text-muted-foreground">
					Settings
				</Label>
			</div>
			<div className="flex flex-col gap-1.5 bg-gray-100 p-2 rounded-md">
				<div className="flex items-center gap-2 text-xs text-muted-foreground">
					<RulerDimensionLine className="w-3 h-3" />
					<span>Window: {getWindowDisplayText(inputWindow)}</span>
				</div>
				<div className="flex items-center gap-2 text-xs text-muted-foreground">
					<BetweenVerticalStart className="w-3 h-3" />
					<span>{getFillingMethodDisplayText(fillingMethod)}</span>
				</div>
			</div>
		</div>
	);
};

const GroupShow: React.FC<GroupShowProps> = ({ data }) => {
	const { inputConfigs, outputConfigs, inputWindow, fillingMethod, isChildGroup } = data;

	return (
		<div className="space-y-3">
			{/* Nested indicator for child groups */}
			{isChildGroup && (
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger>
							<div className="flex items-center text-xs text-muted-foreground">
								<CircleAlert className="w-4 h-4 text-yellow-500" />
								<span className="ml-2">Nested</span>
							</div>
						</TooltipTrigger>
						<TooltipContent>
							<p>This group is nested inside another operation group</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			)}

			{/* Window and Filling Settings */}
			{inputWindow && fillingMethod && (
				<WindowFillingSection
					inputWindow={inputWindow}
					fillingMethod={fillingMethod}
				/>
			)}

			{/* Input Section */}
			<div className="space-y-1">
				<div className="flex items-center gap-2">
					<ArrowDown className="w-3.5 h-3.5 text-blue-500" />
					<Label className="text-sm font-bold text-muted-foreground">
						Input
					</Label>
				</div>
				{inputConfigs.length === 0 ? (
					<div className="bg-gray-100 p-2 rounded-md">
						<span className="text-sm text-red-500">No Input Configured</span>
					</div>
				) : (
					<div className="flex flex-col gap-1.5">
						{inputConfigs.map((config) => (
							<InputConfigItem
								key={config.configId}
								config={config}
							/>
						))}
					</div>
				)}
			</div>

			{/* Output Section */}
			<div className="space-y-1">
				<div className="flex items-center gap-2">
					<ArrowRight className="w-3.5 h-3.5 text-green-500" />
					<Label className="text-sm font-bold text-muted-foreground">
						Output
					</Label>
				</div>
				{outputConfigs.length === 0 ? (
					<div className="bg-gray-100 p-2 rounded-md">
						<span className="text-sm text-red-500">No Output Configured</span>
					</div>
				) : (
					<div className="flex flex-col gap-1.5">
						{outputConfigs.map((config) => (
							<OutputConfigItem
								key={config.configId}
								config={config}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default GroupShow;
