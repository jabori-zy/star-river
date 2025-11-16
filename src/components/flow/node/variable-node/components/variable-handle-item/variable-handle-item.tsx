import type React from "react";
import type { VariableConfig } from "@/types/node/variable-node";
import { GetVarHandleItem } from "./get-var-handle-item";
import { ResetVarHandleItem } from "./reset-var-handle-item";
import { UpdateVarHandleItem } from "./update-var-handle-item";

interface VariableHandleItemProps {
	id: string;
	variableConfig: VariableConfig;
	handleColor: string;
}

export const VariableHandleItem: React.FC<VariableHandleItemProps> = ({
	id,
	variableConfig,
	handleColor,
}) => {
	switch (variableConfig.varOperation) {
		case "get":
			return <GetVarHandleItem id={id} variableConfig={variableConfig} handleColor={handleColor} 	/>;
		case "reset":
			return <ResetVarHandleItem id={id} variableConfig={variableConfig} handleColor={handleColor} />;
		case "update":
			return <UpdateVarHandleItem id={id} variableConfig={variableConfig} handleColor={handleColor} />;
		default:
			return null;
	}
};
