import React, { ReactNode, useState } from 'react';
import { type NodeProps } from '@xyflow/react';
import { type LucideIcon } from 'lucide-react';

// BaseNode的属性接口
export interface BaseNodeProps extends Pick<NodeProps, 'selected'> {
  /** 节点标题 */
  title: string;
  /** 节点图标 (来自lucide-react) */
  icon?: LucideIcon;
  /** 子内容 */
  children?: ReactNode;
  /** 自定义类名 */
  className?: string;
  /** 点击事件 */
  onClick?: () => void;
}

/**
 * BaseNode - 所有节点的基础组件
 * 提供统一的样式和基础功能
 */
const BaseNode: React.FC<BaseNodeProps> = ({
  title,
  icon: Icon,
  children,
  className = '',
  selected = false,
  onClick,
  ...props
}) => {
  // 悬停状态管理
  const [isHovered, setIsHovered] = useState(false);

  // 根据selected状态决定边框样式
  const borderClass = selected 
    ? 'border-blue-500 border-2' 
    : 'border-transparent border-2';
  
  // 根据悬停状态决定阴影效果
  const shadowClass = isHovered 
    ? 'shadow-md transform translate-y-[-2px]' 
    : selected 
      ? 'shadow-md' 
      : 'shadow-sm';
  
  // 基础样式类
  const baseClasses = `
    bg-white 
    rounded-lg 
    transition-all 
    duration-200 
    relative
    cursor-pointer
    min-w-[200px]
    max-w-[400px]
    w-fit
    ${borderClass}
    ${shadowClass}
    ${className}
  `.trim();

  return (
    <div
      className={baseClasses}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      {...props}
    >
      {/* 标题区域 */}
      <div className="p-2">
        <div className="flex items-center gap-2">
          {/* 图标 */}
          {Icon && (
            <Icon className="w-4 h-4 text-gray-600 flex-shrink-0" />
          )}
          
          {/* 标题文本 */}
          <div className="text-sm font-bold text-black break-words leading-relaxed">
            {title}
          </div>
        </div>
      </div>

      {/* 子内容区域 */}
      {children && (
        <div className="p-2 border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  );
};

export default BaseNode;
