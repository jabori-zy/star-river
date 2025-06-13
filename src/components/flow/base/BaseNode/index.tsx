import React, { ReactNode, useState } from 'react';
import { type NodeProps, useReactFlow } from '@xyflow/react';
import { type LucideIcon } from 'lucide-react';
import { BaseHandleProps } from '../BaseHandle';
import BaseHandle from '../BaseHandle';
import { useChangeNodeName } from '@/hooks/node/use-change-node-name';

// BaseNode的属性接口
//这是TypeScript的工具类型，作用是从NodeProps类型中只选择selected属性
//extends - BaseNodeProps接口继承了从NodeProps中提取出来的selected属性
//Pick<NodeProps, 'selected'> - 从NodeProps类型中选择selected属性，并将其作为BaseNodeProps接口的属性
export interface BaseNodeProps extends Pick<NodeProps, 'id' | 'selected'> {
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
  // 选中时边框颜色
  selectedBorderColor?: string;
  // 默认输入handle属性
  defaultInputHandle?: BaseHandleProps;
  // 默认输出handle属性
  defaultOutputHandle?: BaseHandleProps;
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
  className = '', // 自定义类名
  selected = false, // 是否选中
  selectedBorderColor = 'border-red-50', // 选中时边框颜色
  iconBackgroundColor = 'bg-red-400', // 图标背景颜色
  defaultInputHandle, // 默认输入handle属性
  defaultOutputHandle, // 默认输出handle属性
  ...props
}) => {
  // 悬停状态管理
  const [isHovered, setIsHovered] = useState(false);

  // 获取ReactFlow实例
  const { setEdges } = useReactFlow();

  // 使用节点名称管理 hook（只用于数据同步）
  const { nodeName: currentNodeName } = useChangeNodeName({ 
    id, 
    initialNodeName: nodeName 
  });

  // 根据selected状态决定边框样式
  const borderClass = selected 
    ? `${selectedBorderColor} border-2` 
    : 'border-transparent border-2';
  
  // 根据悬停状态决定阴影效果 - 移除transform，只用shadow
  const shadowClass = isHovered ? 'shadow-lg' : selected ? 'shadow-md' : 'shadow-sm';
  
  // 基础样式类 - 移除z-20
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

  // 处理鼠标进入事件
  const handleMouseEnter = () => {
    setIsHovered(true);
    
    // console.log(`Mouse enter node ${id}`);
    
    // 设置所有相关边的_connectedNodeIsHovering状态为true
    setEdges((edges) => 
      edges.map((edge) => {
        
        // 如果边连接到当前节点，设置_connectedNodeIsHovering状态
        if (edge.source === id || edge.target === id) {
          return {
            ...edge,
            selected: true
          };
        }
        return edge;
      })
    );
  };

  // 处理鼠标离开事件
  const handleMouseLeave = () => {
    setIsHovered(false);
    
    // console.log(`Mouse leave node ${id}`);
    
    // 设置所有相关边的_connectedNodeIsHovering状态为false
    setEdges((edges) => 
      edges.map((edge) => {
        // 如果边连接到当前节点，取消_connectedNodeIsHovering状态
        if (edge.source === id || edge.target === id) {
          console.log(`Setting edge ${edge.id} _connectedNodeIsHovering=false`);
          return { 
            ...edge, 
            selected: false
          };
        }
        return edge;
      })
    );
  };

  return (
    <div
      className={baseClasses}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {/* 标题区域 */}
      <div className="p-2">
        <div className="flex items-center gap-2">
          {/* 图标 */}
          {Icon && (
            <div className={`p-1 rounded-sm flex-shrink-0 ${iconBackgroundColor}`}>
              <Icon className="w-3 h-3 text-white flex-shrink-0" />
            </div>
          )}
          
          {/* 标题文本 */}
          <div 
            className="text-base font-bold text-black break-words leading-relaxed"
          >
            
            {currentNodeName}
          </div>
        </div>
        {/* 默认的输入输出handle */}
        {defaultInputHandle && <BaseHandle {...defaultInputHandle} className="!top-[20px] !right-[-5px]" />}
        {defaultOutputHandle && <BaseHandle {...defaultOutputHandle} className="!top-[20px] !right-[-5px]" />}
      </div>

      {/* 子内容区域 */}
      {children && (
        <div className="p-2">
          {children}
        </div>
      )}
    </div>
  );
};

export default BaseNode;
