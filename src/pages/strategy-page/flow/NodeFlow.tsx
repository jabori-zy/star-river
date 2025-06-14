import { useCallback, useState, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
//   Controls,
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
import { DevTools } from '@/components/flow/devtools'; // 开发者工具
import { useDndNodeStore } from '@/store/use-dnd-node-store';
import { useReactFlow } from '@xyflow/react';
import { toast } from 'sonner';
import { Strategy } from '@/types/strategy';
import { nodeTypes } from '@/constants/nodeTypes';
import edgeTypes from '@/constants/edgeTypes';
import NodePanel from '@/components/flow/NodePanel';
import ControlPanel from '@/components/flow/node-controllor';






export default function NodeFlow({strategy}:{strategy:Strategy}) {
    const [nodes, setNodes] = useNodesState<Node>([]);
    const [edges, setEdges] = useEdgesState<Edge>([]);
    const { dragNodeItem, setDragNodeItem } = useDndNodeStore();
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
      
        // console.log("nodeItemType", dragNodeItem);

        if (!dragNodeItem) return;

        const position = screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
        });
        
        const newNode = {
            id: `${dragNodeItem.nodeId}_${nodeIdCounter}`,
            type: dragNodeItem.nodeType,
            position,
            data: {
                ...(dragNodeItem.nodeData),
                strategyId: strategy.id,
                nodeName: dragNodeItem.nodeName
            },
        };

        setNodes((nds) => nds.concat(newNode));
        setNodeIdCounter(prev => prev + 1);
        
        // 清除拖拽状态
        setDragNodeItem(null);
        
        // 显示成功提示
        toast(`节点 ${dragNodeItem.nodeName} 已添加`, {
            duration: 2000
        });
    }, [screenToFlowPosition, dragNodeItem, setNodes, nodeIdCounter, strategy.id, setDragNodeItem]);

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
        (conn: Connection) => {
          setEdges((eds) => {
            const customEdge: Edge = {
              ...conn,
              id: `${conn.source}.${conn.sourceHandle || 'default'}=>${conn.target}.${conn.targetHandle || 'default'}`,
              sourceHandle: conn.sourceHandle || null,
              targetHandle: conn.targetHandle || null,
              source: conn.source,
              target: conn.target,
              type: 'customEdge',
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
          <div className="flex-1 h-full w-full overflow-x-auto">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              onDragOver={onDragOver}
              onDrop={onDrop}
              fitView
              fitViewOptions={{ padding: 0.1 }}
              style={{ backgroundColor: "#F7F9FB", height: "100%" }}
          > 
              <DevTools />
              <MiniMap position='bottom-left' />
              {/* <Controls /> */}
              {/* 背景颜色：深灰色 */}
              <Background />
              <NodeToolbar />
              {/* 节点面板 */}
              <NodePanel />
              {/* 节点控制面板 */}
              <ControlPanel />
          </ReactFlow>
        </div>
    );
} 