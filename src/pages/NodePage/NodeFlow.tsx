import { useCallback } from 'react';
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
import DataFetchNode from '@/components/node/DataFetchNode';
import ShowPriceNode from '@/components/node/ShowPriceNode';
import SMAIndicatorNode from '@/components/node/IndicatorNode/SMAIndicatorNode';
import { DevTools } from '@/components/node/devtools';


const nodeTypes = {  
  dataFetch: DataFetchNode,
  showPrice: ShowPriceNode,
  smaIndicator: SMAIndicatorNode,
};

const initialNodes: Node[] = [
    {
        id: '1',
        type: 'dataFetch',
        data: { label: 'Data Fetch Node' },
        position: { x: 100, y: 250 },
    },
    {
        id: '2',
        type: 'showPrice',
        data: { label: 'Show Price Node' },
        position: { x: 470, y: 330 },
    },
    {
        id: '3',
        type: 'smaIndicator',
        data: { label: 'SMA Indicator Node' },
        position: { x: 470, y: 330 },
    },
    {
        id: '4',
        type: 'smaIndicator',
        data: { label: 'SMA Indicator Node' },
        position: { x: 470, y: 500 },
    },
  ];

const initialEdges: Edge[] = [
    { id: '1-2', source: '1', target: '2', sourceHandle: 'data_fetch_node_source', targetHandle: 'show_price_node_handle', animated: true },
    { id: '1-3', source: '1', target: '3', sourceHandle: 'data_fetch_node_source', targetHandle: 'show_price_node_handle', animated: true },
    
  ];

// const rfStyle = {
//     backgroundColor: '#B8CEFF',
//   };

export default function NodeFlow() {
    const [nodes, setNodes] = useNodesState(initialNodes);
    const [edges, setEdges] = useEdgesState(initialEdges);

    // 当拖动或者选择节点时，将会触发onNodesChange事件
    const onNodesChange: OnNodesChange = useCallback(
        (changes: NodeChange[]) => {
          // console.log(changes)
          setNodes((nds: Node[]) => applyNodeChanges(changes, nds))
        },
        
        [setNodes],
    );

    const onEdgesChange: OnEdgesChange = useCallback(
        (changes: EdgeChange[]) => {
          // console.log(changes)
          setEdges((eds) => applyEdgeChanges(changes, eds))},
        [setEdges]
    );

    const onConnect: OnConnect = useCallback(
        (params: Connection) => {
          // console.log(params)
          setEdges((eds) => addEdge(params, eds))
        }, 
        [setEdges]);

    return (
    <div className="flex-1 h-full overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        // style={rfStyle}
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