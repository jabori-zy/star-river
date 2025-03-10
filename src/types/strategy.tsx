import { Node, Edge } from "@xyflow/react";
export interface Strategy {
  id: number;
  name: string;
  description: string;
  is_deleted: number;
  status: number;
  nodes: Node[];
  edges: Edge[];
  create_time: string;
  update_time: string;
}
// 策略列表项组件的属性
export interface StrategyItemProps {
    strategyId: number;
    // 策略名称
    strategyName: string;
    // 策略描述
    strategyDescription: string;
    // 创建时间
    createTime: string;
    // 状态
    strategyStatus: 'running' | 'paused' | 'error';
    onDelete: () => void;
  }


