import type React from "react";
import type { VariableConfig } from "@/types/node/variable-node";
import { GetVarHandleItem } from "./get-var-handle-item";
import { ResetVarHandleItem } from "./reset-var-handle-item";
import { UpdateVarHandleItem } from "./update-var-handle-item";

interface VariableHandleItemProps {
	id: string;
	variableConfig: VariableConfig;
}

export const VariableHandleItem: React.FC<VariableHandleItemProps> = ({
	id,
	variableConfig,
}) => {
	switch (variableConfig.varOperation) {
		case "get":
			return <GetVarHandleItem id={id} variableConfig={variableConfig} />;
		case "reset":
			return <ResetVarHandleItem id={id} variableConfig={variableConfig} />;
		case "update":
			return <UpdateVarHandleItem id={id} variableConfig={variableConfig} />;
		default:
			return null;
	}
};
