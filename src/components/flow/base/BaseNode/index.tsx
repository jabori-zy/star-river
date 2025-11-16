import { type NodeProps } from "@xyflow/react";
import { DynamicIcon, IconName } from "lucide-react/dynamic";
import type React from "react";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import BaseHandle, { type BaseHandleProps } from "../BaseHandle";

// BaseNode的属性接口
//这是TypeScript的工具类型，作用是从NodeProps类型中只选择selected属性
//extends - BaseNodeProps接口继承了从NodeProps中提取出来的selected属性
//Pick<NodeProps, 'selected'> - 从NodeProps类型中选择selected属性，并将其作为BaseNodeProps接口的属性
export interface BaseNodeProps extends Pick<NodeProps, "id" | "selected"> {
	/** 节点标题 */
	nodeName: string;
	/** 节点图标名称 (lucide-react 图标名称，如 "chart-candlestick") */
	iconName: IconName;
	// 图标的背景颜色 - 16进制颜色值，如 "#9ca3af"
	iconBackgroundColor?: string;
	/** 子内容 */
	children?: ReactNode;
	/** 自定义类名 */
	className?: string;
	// 边框颜色(选中时边框颜色) - 16进制颜色值，如 "#9ca3af"
	borderColor?: string;
	// 默认输入handle属性
	defaultInputHandle?: BaseHandleProps;
	// 默认输出handle属性
	defaultOutputHandle?: BaseHandleProps;
	// 是否悬停
	isHovered?: boolean;
}

/**
 * BaseNode - 所有节点的基础组件
 * 提供统一的样式和基础功能
 */
const BaseNode: React.FC<BaseNodeProps> = ({
	id,
	nodeName, // 节点标题
	iconName, // 节点图标名称
	children, // 子内容
	className, // 自定义类名
	selected = false, // 是否选中
	isHovered = false, // 是否悬停
	borderColor = "#9ca3af", // 边框颜色 (默认 gray-400)
	iconBackgroundColor = "#9ca3af", // 图标背景颜色 (默认 red-400)
	defaultInputHandle, // 默认输入handle属性
	defaultOutputHandle, // 默认输出handle属性
	...props
}) => {
	// 根据selected状态决定边框样式和边框颜色
	const borderStyle = selected
		? { borderColor: borderColor, borderWidth: '2px' }
		: { borderColor: 'transparent', borderWidth: '2px' };

	// 根据悬停状态决定阴影效果 - 移除transform，只用shadow
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
				className
			)}
			style={borderStyle}
			{...props}
		>
			{/* 标题区域 */}
			<div className="p-2">
				<div className="flex items-center gap-2">
					{/* 图标 */}
					{iconName && (
						<div
							className="p-1 rounded-sm flex-shrink-0"
							style={{ backgroundColor: iconBackgroundColor }}
						>
							<DynamicIcon name={iconName} className="w-3 h-3 text-white flex-shrink-0" />
						</div>
					)}

					{/* 标题文本 */}
					<div className="text-base font-bold text-black break-words leading-relaxed">
						{nodeName}
					</div>
				</div>
				{/* 默认的输入输出handle */}
				{defaultInputHandle && <BaseHandle {...defaultInputHandle} />}
				{defaultOutputHandle && <BaseHandle {...defaultOutputHandle} />}
			</div>

			{/* 子内容区域 */}
			{children && <div className="p-2">{children}</div>}
		</div>
	);
};

export default BaseNode;
