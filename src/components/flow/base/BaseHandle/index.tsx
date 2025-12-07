import { Handle, type HandleProps } from "@xyflow/react";

export interface BaseHandleProps extends HandleProps {
	connectLimit?: number; // Connection limit: 0 = no limit, 1 = only one connection, 2 = only two connections
	handleColor?: string; // Background color - hex color value, e.g. "#3b82f6"
	heightPositionClassName?: string; // Height style
	className?: string; // Style
}

/**
 * Custom node handle
 * @param id Node ID
 * @param type Node type
 * @param position Node position
 * @param isConnectable Whether connectable
 * @param props Other properties
 */
const BaseHandle: React.FC<BaseHandleProps> = ({
	id,
	type,
	handleColor = "#9ca3af", // Default blue
	heightPositionClassName = "!top-[20px]", // Height style
	className,
	...props
}) => {
	// Mask position
	// Style for the position where handle is masked by node
	const maskPosition =
		type === "source" ? "!right-[-1.25px]" : "!left-[-1.25px]";

	const handleClassName = `!w-2.5 !h-3.5 ${maskPosition} ${heightPositionClassName} !rounded-none !z-[-5] ${className}`;

	return (
		<Handle
			{...props}
			type={type}
			className={handleClassName}
			id={id}
			style={{ backgroundColor: handleColor }}
		/>
	);
};

export default BaseHandle;
