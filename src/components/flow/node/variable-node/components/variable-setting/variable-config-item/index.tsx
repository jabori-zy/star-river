import type { TFunction } from "i18next";
import type React from "react";
import type {
	UpdateVarValueOperation,
	VariableConfig,
} from "@/types/node/variable-node";
import type { CustomVariable, VariableValueType } from "@/types/variable";
import type { SymbolSelectorOption } from "../components/symbol-selector";
import GetVarConfigItem from "./get-var-config";
import ResetVarConfigItem from "./reset-var-config";
import UpdateVarConfigItem from "./update-var-config";

interface VariableConfigItemProps {
	id: string;
	config: VariableConfig;
	index: number;
	onDelete: (index: number) => void;
	onConfigChange: (index: number, config: VariableConfig) => void;
	customVariables: CustomVariable[];
	customVariableOptions: Array<{ value: string; label: React.ReactNode }>;
	symbolOptions: SymbolSelectorOption[];
	isSymbolSelectorDisabled: boolean;
	getAvailableOperations: (
		varValueType: VariableValueType,
		isDataflowMode?: boolean,
	) => UpdateVarValueOperation[];
	getUpdateOperationLabel: (
		type: UpdateVarValueOperation,
		t: TFunction,
	) => string;
	allConfigs: VariableConfig[];
}

const VariableConfigItem: React.FC<VariableConfigItemProps> = ({
	id,
	config,
	index,
	onDelete,
	onConfigChange,
	customVariables,
	customVariableOptions,
	symbolOptions,
	isSymbolSelectorDisabled,
	getAvailableOperations,
	getUpdateOperationLabel,
	allConfigs,
}) => {
	// Check for duplicate variable operation configuration (only for custom variables)
	const checkDuplicateVariableOperation = (varName: string): string | null => {
		// Check if it's a custom variable
		const isCustomVariable = customVariables.some(
			(customVar: CustomVariable) => customVar.varName === varName,
		);

		// Only check for custom variables
		if (!isCustomVariable) {
			return null;
		}

		// Find if there's a config with the same variable
		for (let i = 0; i < allConfigs.length; i++) {
			// Skip the current config itself
			if (i === index) {
				continue;
			}

			const existingConfig = allConfigs[i];

			// If a config with the same variable name is found
			if (existingConfig.varName === varName) {
				// Same custom variable can only be configured once (choose one of get/update/reset)
				// Return the existing operation type
				return existingConfig.varOperation;
			}
		}

		return null;
	};

	const duplicateOperation = checkDuplicateVariableOperation(config.varName);

	// Render the corresponding config item component based on operation type
	const renderConfigContent = () => {
		switch (config.varOperation) {
			case "get":
				return (
					<GetVarConfigItem
						id={id}
						config={config}
						onConfigChange={(updatedConfig) =>
							onConfigChange(index, updatedConfig)
						}
						onDelete={() => onDelete(index)}
						customVariables={customVariables}
						symbolOptions={symbolOptions}
						isSymbolSelectorDisabled={isSymbolSelectorDisabled}
						duplicateOperation={duplicateOperation}
					/>
				);
			case "update":
				return (
					<UpdateVarConfigItem
						id={id}
						config={config}
						onConfigChange={(updatedConfig) =>
							onConfigChange(index, updatedConfig)
						}
						onDelete={() => onDelete(index)}
						customVariables={customVariables}
						customVariableOptions={customVariableOptions}
						getAvailableOperations={getAvailableOperations}
						getUpdateOperationLabel={getUpdateOperationLabel}
						duplicateOperation={duplicateOperation}
					/>
				);
			case "reset":
				return (
					<ResetVarConfigItem
						id={id}
						config={config}
						onConfigChange={(updatedConfig) =>
							onConfigChange(index, updatedConfig)
						}
						onDelete={() => onDelete(index)}
						customVariables={customVariables}
						customVariableOptions={customVariableOptions}
						duplicateOperation={duplicateOperation}
					/>
				);
			default:
				return null;
		}
	};

	return (
		<>
			{/* Config content */}
			{renderConfigContent()}
		</>
	);
};

export default VariableConfigItem;
