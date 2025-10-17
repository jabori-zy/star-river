import type { IconType } from "react-icons";
import { TbEdit, TbFileImport, TbRefresh } from "react-icons/tb";

export type UpdateOperationType =
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
): string => {
	switch (operation) {
		case "get":
			return "获取变量";
		case "update":
			return "更新变量";
		case "reset":
			return "重置变量";
		default:
			return "获取变量";
	}
};

export const getVariableOperationDescription = (
	operation: VariableOperation,
): string => {
	switch (operation) {
		case "get":
			return "从系统或自定义变量中获取值";
		case "update":
			return "修改自定义变量的值(赋值、运算等)";
		case "reset":
			return "将自定义变量重置为初始值";
		default:
			return "从系统或自定义变量中获取值";
	}
};
