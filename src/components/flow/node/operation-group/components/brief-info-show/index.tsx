import type React from "react";
import {
	ArrowDown,
	ArrowRight,
	RulerDimensionLine,
	CircleAlert,
} from "lucide-react";
import type {
	OperationGroupData,
	WindowConfig,
} from "@/types/node/group/operation-group";

interface BriefInfoShowProps {
	data: OperationGroupData;
}

// Get window config display text (brief version)
const getWindowBriefText = (windowConfig: WindowConfig): string => {
	if (windowConfig.windowType === "rolling") {
		return `Rolling: ${windowConfig.windowSize}`;
	}
	return "Expanding";
};

// Badge component for consistent styling
const InfoBadge: React.FC<{
	icon: React.ReactNode;
	text: string;
	variant: "purple" | "blue" | "green" | "yellow" | "red" | "pink";
}> = ({ icon, text, variant }) => {
	const variantStyles = {
		purple: "bg-purple-100 text-purple-700",
		blue: "bg-blue-100 text-blue-700",
		green: "bg-green-100 text-green-700",
		yellow: "bg-yellow-100 text-yellow-700",
		red: "bg-red-100 text-red-700",
		pink: "bg-pink-100 text-pink-700",
	};

	return (
		<div
			className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${variantStyles[variant]}`}
		>
			{icon}
			<span>{text}</span>
		</div>
	);
};

const BriefInfoShow: React.FC<BriefInfoShowProps> = ({ data }) => {
	const { inputConfigs, outputConfigs, inputWindow, isChildGroup, groupOutputName } = data;

	const inputCount = inputConfigs?.length ?? 0;
	const outputCount = outputConfigs?.length ?? 0;

	return (
		<div className="flex items-center gap-2 p-2 flex-wrap">
			{/* Group output name - only for non-child groups */}
			{!isChildGroup && groupOutputName && (
				<InfoBadge
					icon={<ArrowRight className="w-3 h-3" />}
					text={groupOutputName}
					variant="pink"
				/>
			)}

			{/* Window config */}
			{inputWindow && (
				<InfoBadge
					icon={<RulerDimensionLine className="w-3 h-3" />}
					text={getWindowBriefText(inputWindow)}
					variant="purple"
				/>
			)}

			{/* Input count */}
			<InfoBadge
				icon={<ArrowDown className="w-3 h-3" />}
				text={`${inputCount} Input${inputCount !== 1 ? "s" : ""}`}
				variant={inputCount === 0 ? "red" : "blue"}
			/>

			{/* Output count */}
			<InfoBadge
				icon={<ArrowRight className="w-3 h-3" />}
				text={`${outputCount} Output${outputCount !== 1 ? "s" : ""}`}
				variant={outputCount === 0 ? "red" : "green"}
			/>

			{/* Nested indicator */}
			{isChildGroup && (
				<InfoBadge
					icon={<CircleAlert className="w-3 h-3" />}
					text="Nested"
					variant="yellow"
				/>
			)}
		</div>
	);
};

export default BriefInfoShow;
