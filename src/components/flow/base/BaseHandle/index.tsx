import { Handle, type HandleProps } from "@xyflow/react";

export interface BaseHandleProps extends HandleProps {
	connectLimit?: number; // 连接限制，0表示不限制，1表示只能连接一个，2表示只能连接两个
	handleColor?: string; // 背景颜色 - 16进制颜色值，如 "#3b82f6"
	heightPositionClassName?: string; // 高度样式
	className?: string; // 样式
}

/**
 * 自定义节点
 * @param id 节点ID
 * @param type 节点类型
 * @param position 节点位置
 * @param isConnectable 是否可连接
 * @param props 其他属性
 */
const BaseHandle: React.FC<BaseHandleProps> = ({
	id,
	type,
	handleColor = "#9ca3af", // 默认蓝色
	heightPositionClassName = "!top-[20px]", // 高度样式
	className,
	...props
}) => {
	// 遮罩位置
	// handle被node遮罩位置的样式
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
