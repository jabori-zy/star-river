import { useCallback, useState, useEffect } from 'react';
import {
  ReactFlow,
//   MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  NodeToolbar,
  applyNodeChanges,
  NodeChange,
  type Node,
  type OnNodesChange,
  type Edge,
  type OnEdgesChange,
  type OnConnect,
  type Connection,
  type EdgeChange,
  applyEdgeChanges,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import DataFetchNode from '@/components/node/DataFetchNode'; // 数据获取节点
import IndicatorNode from '@/components/node/IndicatorNode'; // 指标节点
import LiveDataNode from '@/components/node/LiveDataNode'; // 实时数据节点
import StartNode from '@/components/node/StartNode'; // 开始节点
import { DevTools } from '@/components/node/devtools'; // 开发者工具
import { useDragAndDrop } from '../useDragAndDrop';
import { useReactFlow } from '@xyflow/react';
import { Strategy } from '@/types/strategy';
import IfElseNode from '@/components/node/IfElseNode';
import OrderNode from '@/components/node/OrderNode';
import GetPositionNumberNode from '@/components/node/GetPositionNumberNode';
import PositionNode from '@/components/node/PositionNode';
import GetVariableNode from '@/components/node/GetVariableNode';

const nodeTypes = {
  startNode: StartNode,
  dataFetchNode: DataFetchNode,
  indicatorNode: IndicatorNode,
  liveDataNode: LiveDataNode,
  ifElseNode: IfElseNode,
  orderNode: OrderNode,
  getPositionNumberNode: GetPositionNumberNode,
  positionNode: PositionNode,
  getVariableNode: GetVariableNode,
};

export default function NodeFlow({strategy}:{strategy:Strategy}) {
    const [nodes, setNodes] = useNodesState<Node>([]);
    const [edges, setEdges] = useEdgesState<Edge>([]);
    const [nodeItemProp] = useDragAndDrop();
    const { screenToFlowPosition } = useReactFlow();
    
    const [nodeIdCounter, setNodeIdCounter] = useState(1);

    // 当策略数据变化时更新节点和边
    useEffect(() => {
        if (strategy.nodes?.length > 0) {
            setNodes(strategy.nodes);
            setEdges(strategy.edges);
            // 设置计数器为现有节点数量加1
            setNodeIdCounter(strategy.nodes.length);
        }
        // 如果没有节点和边，则创建一个开始节点
        else {
            const startNode: Node = {
                id: 'start_node',
                type: 'startNode',
                position: { x: 0, y: 0 },
                data: {
                    strategyId: strategy.id,
                    strategyTitle: strategy.name
                }
            };
            setNodes([startNode]);
        }
    }, [strategy, setNodes, setEdges]);

    const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
      
        // console.log("nodeItemType", nodeItemProp);

        if (!nodeItemProp) return;

        const position = screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
        });
        
        const newNode = {
            id: `${nodeItemProp.nodeId}_${nodeIdCounter}`,
            type: nodeItemProp.nodeType,
            position,
            data: {
                ...(nodeItemProp.nodeData),
                strategyId: strategy.id,
                nodeName: nodeItemProp.nodeName
            },
        };

        setNodes((nds) => nds.concat(newNode));
        setNodeIdCounter(prev => prev + 1);
    }, [screenToFlowPosition, nodeItemProp, setNodes, nodeIdCounter, strategy.id]);

    // 当拖动或者选择节点时，将会触发onNodesChange事件
    const onNodesChange: OnNodesChange = useCallback(
        (changes: NodeChange[]) => {
          // console.log(changes)
          setNodes((nds: Node[]) => applyNodeChanges(changes, nds))
        },
        [setNodes]
    );

    // 当拖动或者选择边时，将会触发onEdgesChange事件
    const onEdgesChange: OnEdgesChange = useCallback(
        (changes: EdgeChange[]) => {
          // console.log(changes)
          setEdges((eds) => applyEdgeChanges(changes, eds))},
        [setEdges]
    );


    // 当连接节点时，将会触发onConnect事件
    const onConnect: OnConnect = useCallback(
        (params: Connection) => {
          setEdges((eds) => {
            const customEdge: Edge = {
              ...params,
              id: `${params.source}.${params.sourceHandle || 'default'}=>${params.target}.${params.targetHandle || 'default'}`,
              sourceHandle: params.sourceHandle || null,
              targetHandle: params.targetHandle || null,
              source: params.source,
              target: params.target
            };
            const newEdges = addEdge(customEdge, eds);
            return newEdges;
          });
          
          // 如果需要在连接建立后执行某些操作，使用 useEffect
        }, 
        [setEdges]
    );

    // 添加 useEffect 来监听 edges 的变化
    useEffect(() => {
        console.log('Current nodes:', nodes);
        console.log('Current edges:', edges);
    }, [nodes, edges]);

    return ( 
          <div className="flex-1 h-full w-full overflow-hidden">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              onDragOver={onDragOver}
              onDrop={onDrop}
              fitView
              fitViewOptions={{ padding: 0.1 }}
              style={{ backgroundColor: "#F7F9FB", height: "100%" }}
          > 
              <DevTools />
              {/* <MiniMap /> */}
              <Controls />
              <Background />
              <NodeToolbar />
          </ReactFlow>
        </div>
    );
} 