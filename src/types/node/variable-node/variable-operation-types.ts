import type { IconType } from "react-icons";
import { TbEdit, TbFileImport, TbRefresh } from "react-icons/tb";

export type UpdateVarValueOperation =
	| "set"
	| "add"
	| "subtract"
	| "multiply"
	| "divide"
	| "max"
	| "min"
	| "toggle"
	| "append"
	| "remove"
	| "clear";

export type VariableOperation = "get" | "update" | "reset";

export const getVariableOperationIcon = (
	operation: VariableOperation,
): IconType => {
	switch (operation) {
		case "get":
			return TbFileImport;
		case "update":
			return TbEdit;
		case "reset":
			return TbRefresh;
		default:
			return TbFileImport;
	}
};

export const getVariableOperationIconColor = (
	operation: VariableOperation,
): string => {
	switch (operation) {
		case "get":
			return "text-blue-600";
		case "update":
			return "text-green-600";
		case "reset":
			return "text-orange-600";
		default:
			return "text-blue-600";
	}
};

export const getVariableOperationDisplayName = (
	operation: VariableOperation,
	t:(key: string) => string,
): string => {
	switch (operation) {
		case "get":
			return t("variableNode.getVariable");
		case "update":
			return t("variableNode.updateVariable");
		case "reset":
			return t("variableNode.resetVariable");
		default:
			return t("variableNode.getVariable");
	}
};

export const getVariableOperationDescription = (
	operation: VariableOperation,
	t:(key: string) => string,
): string => {
	switch (operation) {
		case "get":
			return t("variableNode.getVariableDescription");
		case "update":
			return t("variableNode.updateVariableDescription");
		case "reset":
			return t("variableNode.resetVariableDescription");
		default:
			return t("variableNode.getVariableDescription");
	}
};
