import { useCallback, useEffect, useMemo } from 'react';
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
  OnEdgesDelete,
} from '@xyflow/react';
import { handleNodeChanges } from './on-node-change';
import '@xyflow/react/dist/style.css';
import { DevTools } from '@/components/flow/devtools'; // 开发者工具
import { useDndNodeStore } from '@/store/use-dnd-node-store';
import { useReactFlow } from '@xyflow/react';
import { Strategy } from '@/types/strategy';
import { nodeTypes } from '@/constants/nodeTypes';
import edgeTypes from '@/constants/edgeTypes';
import NodePanel from '@/components/flow/node-panel';
import ControlPanel from '@/components/flow/node-controllor';
import useStrategyWorkflow from '@/hooks/flow/use-strategy-workflow';





export default function StrategyFlow({strategy}:{strategy:Strategy}) {
    const [nodes, setNodes] = useNodesState<Node>([]);
    const [edges, setEdges] = useEdgesState<Edge>([]);
    // 正在拖拽的节点
    const { dragNodeItem, setDragNodeItem } = useDndNodeStore();
    const { screenToFlowPosition } = useReactFlow();


    const { checkIsValidConnection } = useStrategyWorkflow();

    // 创建一个唯一的 key 用于强制重新渲染，包含策略ID和交易模式
    const flowKey = useMemo(() => {
        return `${strategy.id}-${strategy.tradeMode}`;
    }, [strategy.id, strategy.tradeMode]);

    // 当策略数据变化时更新节点和边
    useEffect(() => {
        // 清空现有节点和边，确保模式切换时完全重新渲染
        setNodes([]);
        setEdges([]);
        

        
        if (strategy.nodes?.length > 0) {
            // 添加延迟确保清空操作完成
            setTimeout(() => {
                setNodes(strategy.nodes);
                setEdges(strategy.edges || []);

            }, 0);
        }
        // 如果没有节点和边，则创建一个开始节点
        else {
            setTimeout(() => {
                const startNode: Node = {
                    id: 'start_node',
                    type: 'startNode',
                    position: { x: 0, y: 0 },
                    data: {
                        strategyId: strategy.id,
                        nodeName: "策略起点",
                    }
                };
                // 设置默认实盘配置

                setNodes([startNode]);
            }, 0);
        }
    }, [strategy.id, strategy.tradeMode, strategy.nodes, strategy.edges, strategy.name, setNodes, setEdges]);

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
        
        // 使用函数式状态更新，基于当前节点数量生成唯一ID和名称
        setNodes((currentNodes) => {
            // 生成基于时间戳和节点数量的唯一ID，避免重复
            const nodeCount = currentNodes.length;
            const uniqueId = `${dragNodeItem.nodeId}_${nodeCount + 1}`;
            
            const newNode = {
                id: uniqueId,
                type: dragNodeItem.nodeType,
                position,
                data: {
                    ...(dragNodeItem.nodeData),
                    strategyId: strategy.id,
                    nodeName: `${dragNodeItem.nodeName}${nodeCount + 1}`,
                },
            };

            return currentNodes.concat(newNode);
        });

        
        // 清除拖拽状态
        setDragNodeItem(null);
    }, [screenToFlowPosition, dragNodeItem, setNodes, strategy.id, setDragNodeItem]);

    // 当拖动或者选择节点时，将会触发onNodesChange事件
    const onNodesChange: OnNodesChange = useCallback(
        (changes: NodeChange[]) => {
            // 先应用变化，获取更新后的节点状态
            setNodes((currentNodes: Node[]) => {
                const newNodes = applyNodeChanges(changes, currentNodes);
                
                // 使用抽离的逻辑处理节点变化
                const updatedNodes = handleNodeChanges(changes, currentNodes, edges);
                
                // 如果有节点被更新，则使用更新后的节点，否则使用默认的新节点
                return updatedNodes !== currentNodes ? 
                    applyNodeChanges(changes, updatedNodes) : 
                    newNodes;
            });
        },
        [setNodes, edges]
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

    const onEdgesDelete: OnEdgesDelete = useCallback(
        (edges: Edge[]) => {
            // setEdges((eds) => eds.filter((edge) => !edges.includes(edge)));
            console.log("边已删除", edges);
        },
        []
    );

    // 添加 useEffect 来监听 edges 的变化
    useEffect(() => {
        // console.log('Current nodes:', nodes);
        console.log('Current edges:', edges);
    }, [nodes, edges]);

    return ( 
          <div className="flex-1 h-full w-full overflow-x-auto">
            <ReactFlow
              key={flowKey} // 使用 flowKey 强制重新渲染，确保模式切换时组件完全重置
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              nodeTypes={nodeTypes as any} // 临时使用 any 类型来解决类型兼容性问题
              edgeTypes={edgeTypes}
              onDragOver={onDragOver}
              onDrop={onDrop}
              onEdgesDelete={onEdgesDelete}
              isValidConnection={checkIsValidConnection}
            //   onConnectStart={onConnectStart}
            //   onConnectEnd={onConnectEnd}
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