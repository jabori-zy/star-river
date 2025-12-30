import type { Node } from "@xyflow/react";
import type { NodeDataBase } from ".";
import type { NodeType } from "@/types/node/index";

// Start node data
export type EventTestNodeData = NodeDataBase & {
    sourceNodeType: NodeType | null;
    enableReceiveEvent: boolean;
    enableAllEvents: boolean;
    enableReceiveTriggerEvent: boolean;
    enableReceiveExecuteOverEvent: boolean;
};

export type EventTestNode = Node<EventTestNodeData, "eventTestNode">;