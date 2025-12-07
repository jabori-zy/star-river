import type { NodeProps } from "@xyflow/react";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import type React from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import BaseHandle, { type BaseHandleProps } from "../BaseHandle";

// BaseNode property interface
// This is a TypeScript utility type that selects only the selected property from NodeProps type
// extends - BaseNodeProps interface inherits the selected property extracted from NodeProps
// Pick<NodeProps, 'selected'> - Selects the selected property from NodeProps type and uses it as BaseNodeProps interface property
export interface BaseNodeProps extends Pick<NodeProps, "id" | "selected"> {
	/** Node title */
	nodeName: string;
	/** Node icon name (lucide-react icon name, e.g. "chart-candlestick") */
	iconName: IconName;
	// Icon background color - hex color value, e.g. "#9ca3af"
	iconBackgroundColor?: string;
	/** Child content */
	children?: ReactNode;
	/** Custom class name */
	className?: string;
	// Border color (border color when selected) - hex color value, e.g. "#9ca3af"
	borderColor?: string;
	// Default input handle properties
	defaultInputHandle?: BaseHandleProps;
	// Default output handle properties
	defaultOutputHandle?: BaseHandleProps;
	// Whether hovered
	isHovered?: boolean;
}

/**
 * BaseNode - Base component for all nodes
 * Provides unified styles and basic functionality
 */
const BaseNode: React.FC<BaseNodeProps> = ({
	id,
	nodeName, // Node title
	iconName, // Node icon name
	children, // Child content
	className, // Custom class name
	selected = false, // Whether selected
	isHovered = false, // Whether hovered
	borderColor = "#9ca3af", // Border color (default gray-400)
	iconBackgroundColor = "#9ca3af", // Icon background color (default red-400)
	defaultInputHandle, // Default input handle properties
	defaultOutputHandle, // Default output handle properties
	...props
}) => {
	// Determine border style and color based on selected state
	const borderStyle = selected
		? { borderColor: borderColor, borderWidth: "2px" }
		: { borderColor: "transparent", borderWidth: "2px" };

	// Determine shadow effect based on hover state - remove transform, only use shadow
	const shadowClass = isHovered
		? "shadow-2xl"
		: selected
			? "shadow-md"
			: "shadow-sm";

	return (
		<div
			className={cn(
				"bg-white rounded-lg transition-all duration-200 relative cursor-pointer",
				"min-w-[200px] max-w-[400px] w-fit",
				shadowClass,
				className,
			)}
			style={borderStyle}
			{...props}
		>
			{/* Title area */}
			<div className="px-2 pt-2">
				<div className="flex items-center gap-2">
					{/* Icon */}
					{iconName && (
						<div
							className="p-1 rounded-sm flex-shrink-0"
							style={{ backgroundColor: iconBackgroundColor }}
						>
							<DynamicIcon
								name={iconName}
								className="w-3 h-3 text-white flex-shrink-0"
							/>
						</div>
					)}

					{/* Title text */}
					<div className="text-base font-bold text-black break-words leading-relaxed">
						{nodeName}
					</div>
				</div>
				{/* Default input/output handles */}
				{defaultInputHandle && <BaseHandle {...defaultInputHandle} />}
				{defaultOutputHandle && <BaseHandle {...defaultOutputHandle} />}
			</div>

			{/* Child content area */}
			{children && <div className="p-2">{children}</div>}
		</div>
	);
};

export default BaseNode;
