import type { InputArrayType } from "@/types/node/operation-node";

// Input type for badge display
export type InputBadgeType = "Series" | "Scalar" | "CustomScalarValue";

// Get badge style based on input type
export const getInputTypeBadgeStyle = (inputType: InputBadgeType): string => {
	if (inputType === "Series") {
		return "border-orange-500 text-orange-400";
	}
	return "border-blue-500 text-blue-400";
};

// Get badge label - CustomScalarValue displays as "Scalar"
export const getInputTypeBadgeLabel = (inputType: InputBadgeType): string => {
	if (inputType === "CustomScalarValue") {
		return "Scalar";
	}
	return inputType;
};

// Get input array type badge style
export const getInputArrayTypeBadgeStyle = (type: InputArrayType): string => {
	switch (type) {
		case "Unary":
			return "bg-blue-100 text-blue-700 border-blue-300";
		case "Binary":
			return "bg-purple-100 text-purple-700 border-purple-300";
		case "Nary":
			return "bg-green-100 text-green-700 border-green-300";
		default:
			return "bg-gray-100 text-gray-700 border-gray-300";
	}
};
