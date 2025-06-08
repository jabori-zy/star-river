import React from 'react';
import { type NodeProps, Position } from '@xyflow/react';
import { Play, Activity, TrendingUp } from 'lucide-react';
import BaseNode from './index';

/**
 * 示例：如何使用BaseNode组件
 * 这个组件展示了如何继承BaseNode的基础功能
 */
const ExampleNode: React.FC<NodeProps> = ({
  id,
  data, 
  selected,
  isConnectable
}) => {

  // 安全地获取data中的属性
  const nodeData = data as { title?: string; content?: string; type?: string } | undefined;

  // 根据节点类型选择图标
  const getIcon = () => {
    switch (nodeData?.type) {
      case 'start':
        return Play;
      case 'indicator':
        return TrendingUp;
      case 'analysis':
        return Activity;
      default:
        return Play; // 默认图标
    }
  };

  return (
    <BaseNode
      id={id}
      nodeName={nodeData?.title || "开始节点"}
      icon={getIcon()}
      selected={selected || false}
      selectedBorderColor="border-red-500"
      defaultInputHandle={{
        id: 'example_node_input',
        type: 'target',
        position: Position.Left,
        isConnectable: isConnectable,
        handleColor: 'bg-red-400'
      }}
      defaultOutputHandle={{
        id: 'example_node_output',
        type: 'source',
        position: Position.Right,
        isConnectable: isConnectable,
        handleColor: 'bg-red-400'
      }}
    >
      {/* 自定义内容区域 */}
      <div className="space-y-2">
        <div className="text-xs text-muted-foreground">
          这是一个使用BaseNode的示例
        </div>
        
        {nodeData?.content && (
          <div className="text-sm break-words">
            {nodeData.content}
          </div>
        )}

        {/* 节点类型显示 */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            类型: {nodeData?.type || 'start'}
          </span>
          
          {/* 状态指示器 */}
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${selected ? 'bg-red-500' : 'bg-gray-300'}`} />
            <span className="text-xs">
              {selected ? '已选中' : '未选中'}
            </span>
          </div>
        </div>
      </div>
      {/* <BaseHandle
        id="example_node_output"
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        backgroundColor="bg-red-400"
      /> */}
    </BaseNode>
  );
};

export default ExampleNode; 