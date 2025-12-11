import type { Node } from "@xyflow/react";
import type { NodeDataBase } from "@/types/node";


export type OperationStartNodeData = NodeDataBase & {
};



export type OperationStartNode = Node<OperationStartNodeData, "operationStartNode">;