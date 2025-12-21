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
    // Input Source
    InputSourceSchema,
    type InputSource,
    // Input configs
    InputSeriesConfigSchema,
    type InputSeriesConfig,
    InputScalarConfigSchema,
    type InputScalarConfig,
    InputScalarValueConfigSchema,
    type InputScalarValueConfig,
    InputParentGroupScalarValueConfigSchema,
    type InputParentGroupScalarValueConfig,
    // Backward compatibility alias
    InputParentGroupScalarValueConfigSchema as InputGroupScalarValueConfigSchema,
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
    isParentGroupScalarValueInput,
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