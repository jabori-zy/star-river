// Re-export from split files
export {
    UnaryOperationSchema,
    type UnaryOperation,
    UnaryOperationTypes,
} from "./unary";

export {
    BinaryOperationSchema,
    type BinaryOperation,
    BinaryOperationTypes,
} from "./binary";

export {
    NaryOperationSchema,
    type NaryOperation,
    NaryOperationTypes,
} from "./n-ary";

// ============ Re-export from operation-node ============
// These are defined in operation-node.ts to avoid circular dependencies

export {
    // Input Array Type
    InputArrayTypeSchema,
    type InputArrayType,
    // Operation
    OperationSchema,
    type Operation,
    // Input configs
    InputSeriesConfigSchema,
    type InputSeriesConfig,
    InputScalarConfigSchema,
    type InputScalarConfig,
    InputScalarValueConfigSchema,
    type InputScalarValueConfig,
    InputGroupScalarValueConfigSchema,
    type InputGroupScalarValueConfig,
    InputConfigSchema,
    type InputConfig,
    UnaryInputConfigSchema,
    type UnaryInputConfig,
    BinaryInputConfigSchema,
    type BinaryInputConfig,
    NaryInputConfigSchema,
    type NaryInputConfig,
    // Input type guards
    isSeriesInput,
    isScalarInput,
    isScalarValueInput,
    isGroupScalarValueInput,
    // Output configs
    OutputSeriesConfigSchema,
    type OutputSeriesConfig,
    OutputScalarConfigSchema,
    type OutputScalarConfig,
    OutputConfigSchema,
    type OutputConfig,
    // Output type guards
    isSeriesOutput,
    isScalarOutput,
} from "@/types/node/operation-node";

// ============ Helper Functions ============

// Check if operation requires params
export const operationRequiresParams = (type: string): boolean => {
    return ["Quantile", "Power", "Rank", "TopN", "BottomN"].includes(type);
};
