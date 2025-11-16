import { type NodeProps } from "@xyflow/react";
import type { LucideIcon } from "lucide-react";
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
	/** 节点图标 (来自lucide-react) */
	icon: LucideIcon;
	// 图标的背景颜色
	iconBackgroundColor?: string;
	/** 子内容 */
	children?: ReactNode;
	/** 自定义类名 */
	className?: string;
	// 边框颜色
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
	icon: Icon, // 节点图标
	children, // 子内容
	className, // 自定义类名
	selected = false, // 是否选中
	isHovered = false, // 是否悬停
	borderColor = "border-gray-400", // 边框颜色
	iconBackgroundColor = "bg-red-400", // 图标背景颜色
	defaultInputHandle, // 默认输入handle属性
	defaultOutputHandle, // 默认输出handle属性
	...props
}) => {
	// 根据selected状态决定边框样式
	const borderClass = selected
		? `${borderColor} border-2`
		: "border-transparent border-2";

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
				borderClass,
				shadowClass,
				className
			)}
			{...props}
		>
			{/* 标题区域 */}
			<div className="p-2">
				<div className="flex items-center gap-2">
					{/* 图标 */}
					{Icon && (
						<div className={cn("p-1 rounded-sm flex-shrink-0", iconBackgroundColor)}>
							<Icon className="w-3 h-3 text-white flex-shrink-0" />
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
