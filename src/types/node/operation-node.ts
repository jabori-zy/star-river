import { z } from "zod";
import {
    InputArrayTypeSchema,
    OperationSchema,
    WindowConfigSchema,
    FillingMethodSchema,
    UnaryInputConfigSchema,
    BinaryInputConfigSchema,
    NaryInputConfigSchema,
    OutputConfigSchema,
} from "@/types/operation";
import { NodeDataBaseSchema } from "@/types/node";
import type { Node } from "@xyflow/react";

// Combined input config schema that supports all three input types
export const OperationInputConfigSchema = z.union([
    UnaryInputConfigSchema,
    BinaryInputConfigSchema,
    NaryInputConfigSchema,
]);
export type OperationInputConfig = z.infer<typeof OperationInputConfigSchema>;

export const OperationNodeDataSchema = NodeDataBaseSchema.extend({
    inputArrayType: InputArrayTypeSchema,
    operation: OperationSchema,
    inputConfig: OperationInputConfigSchema.nullable(),
    outputConfig: OutputConfigSchema.nullable(),
    windowConfig: WindowConfigSchema,
    fillingMethod: FillingMethodSchema,
});

export type OperationNodeData = z.infer<typeof OperationNodeDataSchema>;


export type OperationNode = Node<OperationNodeData, "operationNode">;